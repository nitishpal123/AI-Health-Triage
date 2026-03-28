const { v4: uuidv4 } = require('uuid');
const Patient = require('../models/Patient');
const { computeTriageScore } = require('../services/ai-triage');

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({ score: -1 }); // Sort by score descending
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

const createPatient = async (req, res) => {
    try {
        const { name, age, phone, address, symptoms, history, vitals } = req.body;
        
        // Call the AI Service to determine triage priority
        const triageResult = computeTriageScore(symptoms || "", vitals, age, history || "");
        
        const newPatient = new Patient({
            id: uuidv4(),
            name,
            age,
            phone: phone || "",
            address: address || "",
            symptoms,
            history: history || "",
            vitals: vitals || {},
            triageLevel: triageResult.level,
            department: triageResult.recommendedDepartment,
            score: triageResult.score,
            recommendedDoctor: triageResult.recommendedDoctor,
            triageReasoning: triageResult.triageReasoning,
            estimatedWaitTime: triageResult.estimatedWaitTime,
            status: "waiting",
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
        }

        const patient = await Patient.findOneAndUpdate({ id }, updateData, { new: true });
        
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
};

module.exports = {
    getPatients,
    createPatient,
    updatePatientStatus
};
