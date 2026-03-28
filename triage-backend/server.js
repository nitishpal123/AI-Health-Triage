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
        history: "Hypertension, heavy smoker",
        vitals: { heartRate: "120", bloodPressure: "160/100", oxygenLevel: "92" },
        triageLevel: "Critical",
        score: 95,
        recommendedDoctor: "Emergency Physician (Cardiologist Consult)",
        status: "waiting",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
        id: "2",
        name: "John Smith",
        age: 28,
        symptoms: "Mild headache, slight fever.",
        history: "None",
        vitals: { heartRate: "75", bloodPressure: "120/80", oxygenLevel: "98" },
        triageLevel: "Non-urgent",
        score: 15,
        recommendedDoctor: "Infectious Disease Specialist",
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
    const { name, age, symptoms, history, vitals } = req.body;
    
    // Call the AI Service to determine triage priority
    const triageResult = computeTriageScore(symptoms || "", vitals, age, history || "");
    
    const newPatient = {
        id: uuidv4(),
        name,
        age,
        symptoms,
        history: history || "",
        vitals: vitals || {},
        triageLevel: triageResult.level,
        score: triageResult.score,
        recommendedDoctor: triageResult.recommendedDoctor,
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

app.get('/api/reports/history', (req, res) => {
    try {
        if (patients.length === 0) {
            return res.status(404).json({ error: "No history found" });
        }
        
        let csvRows = [];
        const headers = ['ID', 'Name', 'Age', 'Symptoms', 'History', 'Heart Rate', 'Blood Pressure', 'Oxygen Level', 'Triage Level', 'Score', 'Suggested Doctor', 'Status', 'Timestamp'];
        csvRows.push(headers.join(','));
        
        patients.forEach(p => {
            const hr = p.vitals?.heartRate || '';
            const bp = p.vitals?.bloodPressure || '';
            const o2 = p.vitals?.oxygenLevel || '';
            
            const escapeCSV = (str) => {
                if (str === null || str === undefined) return '';
                const stringified = String(str).replace(/"/g, '""');
                return `"${stringified}"`;
            };
            
            csvRows.push([
                p.id,
                escapeCSV(p.name),
                p.age,
                escapeCSV(p.symptoms),
                escapeCSV(p.history),
                escapeCSV(hr),
                escapeCSV(bp),
                escapeCSV(o2),
                escapeCSV(p.triageLevel),
                p.score,
                escapeCSV(p.recommendedDoctor),
                escapeCSV(p.status),
                escapeCSV(p.timestamp)
            ].join(','));
        });
        
        const csvString = csvRows.join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=triage_history_report.csv');
        res.status(200).send(csvString);
    } catch (err) {
        console.error("Error generating CSV:", err);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`AI Triage Backend running on port ${PORT}`);
});
