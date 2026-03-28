const { v4: uuidv4 } = require('uuid');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Department = require('../models/Department');
const PathologyLab = require('../models/PathologyLab');
const LabBooking = require('../models/LabBooking');
const virtualDoctor = require('../services/virtual-doctor');
const { computeTriageScore } = require('../services/ai-triage');

function buildJourney(hasLab) {
    const steps = [
        { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
        { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
    ];
    if (hasLab) {
        steps.push({ step: 'Lab Tests Ordered', status: 'completed', completedAt: new Date() });
        steps.push({ step: 'Lab Processing', status: 'active' });
        steps.push({ step: 'Results Released', status: 'pending' });
        steps.push({ step: 'Doctor Consultation', status: 'pending' });
    } else {
        steps.push({ step: 'Doctor Consultation', status: 'active' });
    }
    steps.push({ step: 'Discharged', status: 'pending' });
    return steps;
}

// POST /api/virtual-doctor/chat
const chat = async (req, res) => {
    try {
        const { messages, patientContext } = req.body;
        if (!messages || !Array.isArray(messages))
            return res.status(400).json({ error: "messages array required" });

        const rawResponse = await virtualDoctor.chat(messages, patientContext || {});
        const assessment = virtualDoctor.parseAssessment(rawResponse);
        const cleanText = virtualDoctor.cleanResponse(rawResponse);

        res.json({ message: cleanText, assessment });
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: "Virtual doctor unavailable" });
    }
};

// POST /api/virtual-doctor/save-assessment
const saveAssessment = async (req, res) => {
    try {
        const { assessment, patientName, patientAge } = req.body;
        if (!assessment?.symptoms) return res.status(400).json({ error: "Assessment data required" });

        const vitals = assessment.vitals || {};
        const age = patientAge || assessment.extractedAge || 30;
        const triageResult = computeTriageScore(assessment.symptoms, vitals, age, assessment.history || "");

        // Auto-assign doctor from DB
        let assignedDoctorId = null, assignedDoctorName = triageResult.recommendedDoctor, departmentId = null;
        const dept = await Department.findOne({ name: { $regex: triageResult.recommendedDepartment.split('/')[0].trim(), $options: 'i' } });
        if (dept) {
            departmentId = dept._id;
            const doctor = await User.findOne({ role: 'Doctor', departmentId: dept._id });
            if (doctor) { assignedDoctorId = doctor._id; assignedDoctorName = doctor.name; }
        }

        // Use AI-suggested tests from assessment, fallback to triage map
        const aiTests = assessment.recommendedTests || [];
        const labTestNames = aiTests.length > 0
            ? aiTests.map(t => t.name)
            : ['CBC', 'Urinalysis', 'Blood Glucose'];

        const needsLab = triageResult.level !== 'Standard' || aiTests.length > 0;
        let labId = null, assignedLabName = "", testStatus = 'None';
        if (needsLab) {
            const lab = await PathologyLab.findOne();
            if (lab) { labId = lab._id; assignedLabName = lab.name; testStatus = 'Pending'; }
        }

        const patient = new Patient({
            id: uuidv4(),
            name: patientName || 'Walk-in Patient',
            age, symptoms: assessment.symptoms, history: assessment.history || "",
            vitals, triageLevel: triageResult.level, department: triageResult.recommendedDepartment,
            score: triageResult.score, recommendedDoctor: assignedDoctorName,
            assignedDoctorId, departmentId, labId, assignedLabName,
            labTests: labTestNames,
            triageReasoning: triageResult.triageReasoning,
            estimatedWaitTime: triageResult.estimatedWaitTime,
            medicalReport: assessment.doctorNote || "",
            status: "waiting", testsDone: needsLab, testStatus,
            journey: buildJourney(needsLab && !!labId), timestamp: new Date()
        });
        await patient.save();

        const deptPatients = await Patient.find({ department: triageResult.recommendedDepartment, status: 'waiting' }).sort({ score: -1 });
        const ranking = await virtualDoctor.rankDepartmentPatients(deptPatients, triageResult.recommendedDepartment);

        res.status(201).json({ patient, triage: triageResult, ranking, recommendedTests: aiTests });
    } catch (err) {
        console.error("Save assessment error:", err);
        res.status(500).json({ error: "Failed to save assessment" });
    }
};

// GET /api/virtual-doctor/labs?tests=CBC,ECG&diagnosis=chest+pain&age=35
const getLabsForTests = async (req, res) => {
    try {
        const { tests, diagnosis, age } = req.query;
        const testList = tests ? tests.split(',').map(t => t.trim()) : [];

        // Get AI-suggested tests if diagnosis provided
        let aiSuggestedTests = [];
        if (diagnosis) {
            aiSuggestedTests = await virtualDoctor.suggestTests(diagnosis, diagnosis, parseInt(age) || 30);
        }

        // Fetch all labs
        const labs = await PathologyLab.find().sort({ rating: -1 });

        // For each lab, compute which requested tests they offer and total price
        const enrichedLabs = labs.map(lab => {
            const labObj = lab.toObject();

            // Match services to requested tests (fuzzy match by name)
            const matchedServices = testList.map(testName => {
                const svc = lab.services?.find(s =>
                    s.name?.toLowerCase().includes(testName.toLowerCase()) ||
                    testName.toLowerCase().includes(s.name?.toLowerCase())
                );
                return svc
                    ? { name: testName, price: svc.price, homePrice: svc.homePrice, turnaround: svc.turnaround, available: true }
                    : { name: testName, price: null, available: false };
            });

            const availableTests = matchedServices.filter(s => s.available);
            const totalWalkIn = availableTests.reduce((sum, s) => sum + (s.price || 0), 0);
            const totalHome = availableTests.reduce((sum, s) => sum + (s.homePrice || s.price || 0), 0);

            return { ...labObj, matchedServices, availableCount: availableTests.length, totalWalkIn, totalHome };
        });

        // Sort: most tests available first, then by rating
        enrichedLabs.sort((a, b) => b.availableCount - a.availableCount || b.rating - a.rating);

        res.json({ labs: enrichedLabs, aiSuggestedTests });
    } catch (err) {
        console.error("Labs fetch error:", err);
        res.status(500).json({ error: "Failed to fetch labs" });
    }
};

// POST /api/virtual-doctor/book
const bookLabAppointment = async (req, res) => {
    try {
        const { labId, tests, bookingType, appointmentDate, appointmentTime, patientName, patientPhone, patientAddress, totalPrice, patientRecordId } = req.body;
        if (!labId || !bookingType) return res.status(400).json({ error: "labId and bookingType required" });

        const lab = await PathologyLab.findById(labId);
        if (!lab) return res.status(404).json({ error: "Lab not found" });

        if (bookingType === 'home' && !lab.homeCollection)
            return res.status(400).json({ error: "This lab does not offer home collection" });

        const booking = new LabBooking({
            patientName: patientName || req.user.name,
            patientPhone, patientAddress,
            labId, labName: lab.name,
            tests, bookingType, appointmentDate, appointmentTime,
            totalPrice, patientRecordId, status: 'confirmed'
        });
        await booking.save();

        res.status(201).json({ booking, lab: { name: lab.name, address: lab.address, phone: lab.phone } });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ error: "Failed to create booking" });
    }
};

// GET /api/virtual-doctor/priority/:department
const getDepartmentPriority = async (req, res) => {
    try {
        const { department } = req.params;
        const patients = await Patient.find({ department: { $regex: department, $options: 'i' }, status: 'waiting' }).sort({ score: -1 });
        const ranking = await virtualDoctor.rankDepartmentPatients(patients, department);
        res.json({ patients, ranking });
    } catch (err) {
        res.status(500).json({ error: "Failed to get priority ranking" });
    }
};

module.exports = { chat, saveAssessment, getLabsForTests, bookLabAppointment, getDepartmentPriority };
