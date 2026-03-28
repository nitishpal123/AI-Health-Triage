const { v4: uuidv4 } = require('uuid');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Department = require('../models/Department');
const PathologyLab = require('../models/PathologyLab');
const { computeTriageScore } = require('../services/ai-triage');
const XLSX = require('xlsx');

// Tests required based on department/triage
const LAB_TESTS_MAP = {
    'Cardiology':         ['ECG', 'Troponin', 'CBC', 'Lipid Panel'],
    'Neurology':          ['CT Scan', 'MRI Brain', 'CBC', 'Electrolytes'],
    'Pulmonology':        ['Chest X-Ray', 'ABG', 'Spirometry', 'CBC'],
    'Orthopedics':        ['X-Ray', 'CBC', 'CRP'],
    'Emergency / Trauma': ['CBC', 'BMP', 'CT Scan', 'Blood Type'],
    'General Practice':   ['CBC', 'Urinalysis', 'Blood Glucose'],
};

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

const getPatientStats = async (req, res) => {
    try {
        const tid = req.tenantId;
        const total = await Patient.countDocuments({ tenantId: tid });
        const active = await Patient.countDocuments({ tenantId: tid, status: 'waiting' });
        const treated = await Patient.countDocuments({ tenantId: tid, status: 'treated' });
        const systemLoad = Math.min(Math.round((active / 50) * 100), 100);
        res.json({ totalPatients: total, activeTriage: active, totalDischarged: treated, systemLoad: `${systemLoad}%` });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({ tenantId: req.tenantId }).sort({ score: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

const getMyRecord = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            tenantId: req.user.tenantId,
            name: { $regex: req.user.name.split(' ')[0], $options: 'i' }
        }).populate('assignedDoctorId', 'name departmentId').populate('labId', 'name');
        if (!patient) return res.status(404).json({ error: "No patient record found for your account" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch your record" });
    }
};

const createPatient = async (req, res) => {
    try {
        const { name, age, phone, address, symptoms, history, vitals } = req.body;
        const triageResult = computeTriageScore(symptoms || "", vitals, age, history || "");

        // Auto-assign: find a doctor in the recommended department within the tenant
        let assignedDoctorId = null;
        let assignedDoctorName = triageResult.recommendedDoctor;
        let departmentId = null;

        const dept = await Department.findOne({
            name: { $regex: triageResult.recommendedDepartment.split('/')[0].trim(), $options: 'i' },
            tenantId: req.tenantId
        });
        if (dept) {
            departmentId = dept._id;
            const doctor = await User.findOne({ role: 'Doctor', departmentId: dept._id, tenantId: req.tenantId });
            if (doctor) {
                assignedDoctorId = doctor._id;
                assignedDoctorName = doctor.name;
            }
        }

        // Auto-assign lab for Urgent/Critical or if tests requested
        let labId = null;
        let assignedLabName = "";
        let labTests = [];
        let testStatus = 'None';
        const needsLab = triageResult.level !== 'Standard' || req.body.testsDone;

        if (needsLab) {
            const lab = await PathologyLab.findOne({ tenantId: req.tenantId });
            if (lab) {
                labId = lab._id;
                assignedLabName = lab.name;
                labTests = LAB_TESTS_MAP[triageResult.recommendedDepartment] || LAB_TESTS_MAP['General Practice'];
                testStatus = 'Pending';
            }
        }

        const journey = buildJourney(needsLab && !!labId);

        const newPatient = new Patient({
            id: uuidv4(),
            tenantId: req.tenantId,
            name, age,
            phone: phone || "",
            address: address || "",
            symptoms,
            history: history || "",
            vitals: vitals || {},
            triageLevel: triageResult.level,
            department: triageResult.recommendedDepartment,
            score: triageResult.score,
            recommendedDoctor: assignedDoctorName,
            assignedDoctorId,
            departmentId,
            labId,
            assignedLabName,
            labTests,
            triageReasoning: triageResult.triageReasoning,
            estimatedWaitTime: triageResult.estimatedWaitTime,
            status: "waiting",
            testsDone: req.body.testsDone || false,
            testStatus,
            journey,
            timestamp: new Date()
        });

        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add patient" });
    }
};

const updatePatientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updateData = { status };
        if (status === 'treated') {
            updateData.dischargedAt = new Date();
            updateData.$set = { 'journey.$[last].status': 'completed', 'journey.$[last].completedAt': new Date() };
        }
        const patient = await Patient.findOneAndUpdate({ id }, updateData, { new: true });
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
};

const updateLabStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { testStatus } = req.body;

        const patient = await Patient.findOne({ id });
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        patient.testStatus = testStatus;

        // Advance journey steps
        if (testStatus === 'Processing') {
            const step = patient.journey.find(s => s.step === 'Lab Processing');
            if (step) { step.status = 'active'; step.completedAt = new Date(); }
        }
        if (testStatus === 'Released') {
            const labStep = patient.journey.find(s => s.step === 'Lab Processing');
            if (labStep) { labStep.status = 'completed'; labStep.completedAt = new Date(); }
            const resultsStep = patient.journey.find(s => s.step === 'Results Released');
            if (resultsStep) { resultsStep.status = 'completed'; resultsStep.completedAt = new Date(); }
            const consultStep = patient.journey.find(s => s.step === 'Doctor Consultation');
            if (consultStep) consultStep.status = 'active';
        }

        await patient.save();
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to update lab status" });
    }
};

const assignDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendedDoctor } = req.body;
        const patient = await Patient.findOneAndUpdate({ id }, { recommendedDoctor }, { new: true });
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to assign doctor" });
    }
};

const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Patient.findOneAndDelete({ id });
        if (!result) return res.status(404).json({ error: "Patient not found" });
        res.json({ message: "Patient record purged successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete patient" });
    }
};

const bulkOnboardPatients = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file provided" });
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const processed = [], errors = [];

        for (const row of rows) {
            try {
                const { name, age, phone, address, symptoms, history, heartRate, bloodPressure, oxygenLevel } = row;
                if (!name || !symptoms) { errors.push({ row, error: "Missing required fields" }); continue; }
                const vitals = { heartRate: heartRate?.toString() || "", bloodPressure: bloodPressure?.toString() || "", oxygenLevel: oxygenLevel?.toString() || "" };
                const triageResult = computeTriageScore(symptoms, vitals, parseInt(age) || 30, history || "");
                const patient = new Patient({
                    id: uuidv4(), name, age: parseInt(age) || 30,
                    phone: phone?.toString() || "", address: address?.toString() || "",
                    symptoms, history: history?.toString() || "", vitals,
                    triageLevel: triageResult.level, department: triageResult.recommendedDepartment,
                    score: triageResult.score, recommendedDoctor: triageResult.recommendedDoctor,
                    triageReasoning: triageResult.triageReasoning, estimatedWaitTime: triageResult.estimatedWaitTime,
                    status: "waiting", journey: buildJourney(false), timestamp: new Date()
                });
                await patient.save();
                processed.push(patient);
            } catch (innerErr) { errors.push({ row, error: innerErr.message }); }
        }
        res.json({ message: `Successfully processed ${processed.length} patients`, count: processed.length, errors });
    } catch (err) {
        res.status(500).json({ error: "Bulk onboarding failed" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ tenantId: req.tenantId });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};

const getLabs = async (req, res) => {
    try {
        const labs = await PathologyLab.find({ tenantId: req.tenantId });
        res.json(labs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch labs" });
    }
};

module.exports = {
    getPatients, createPatient, updatePatientStatus, updateLabStatus,
    bulkOnboardPatients, getPatientStats, assignDoctor, deletePatient,
    getMyRecord, getDepartments, getLabs
};
