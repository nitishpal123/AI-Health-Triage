const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { computeTriageScore } = require('./services/ai-triage');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory db for the hackathon prototype
let patients = [
    {
        id: "1",
        name: "Jane Doe",
        age: 45,
        symptoms: "Chest pain, shortness of breath, radiating pain in left arm.",
        vitals: { heartRate: "120", bloodPressure: "160/100", oxygenLevel: "92" },
        triageLevel: "Critical",
        score: 95,
        status: "waiting",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
        id: "2",
        name: "John Smith",
        age: 28,
        symptoms: "Mild headache, slight fever.",
        vitals: { heartRate: "75", bloodPressure: "120/80", oxygenLevel: "98" },
        triageLevel: "Non-urgent",
        score: 15,
        status: "waiting",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
];

app.get('/api/patients', (req, res) => {
    // Sort patients by score descending (Highest priority first)
    const sortedPatients = [...patients].sort((a, b) => b.score - a.score);
    res.json(sortedPatients);
});

app.post('/api/patients', (req, res) => {
    const { name, age, symptoms, vitals } = req.body;
    
    // Call the AI Service to determine triage priority
    const triageResult = computeTriageScore(symptoms || "", vitals, age);
    
    const newPatient = {
        id: uuidv4(),
        name,
        age,
        symptoms,
        vitals: vitals || {},
        triageLevel: triageResult.level,
        score: triageResult.score,
        status: "waiting",
        timestamp: new Date().toISOString()
    };
    
    patients.push(newPatient);
    res.status(201).json(newPatient);
});

app.patch('/api/patients/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex > -1) {
        patients[patientIndex].status = status;
        res.json(patients[patientIndex]);
    } else {
        res.status(404).json({ error: "Patient not found" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`AI Triage Backend running on port ${PORT}`);
});
