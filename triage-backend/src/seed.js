require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const Tenant = require('./models/Tenant');
const Department = require('./models/Department');
const Patient = require('./models/Patient');
const PathologyLab = require('./models/PathologyLab');

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-health-triage";
        await mongoose.connect(mongoURI);
        
        console.log('Connected to DB. Clearing old collections...');
        await User.deleteMany();
        await Tenant.deleteMany();
        await Department.deleteMany();
        await Patient.deleteMany();
        await PathologyLab.deleteMany();

        console.log('Creating Test Tenant (Hospital)...');
        const tenant = await Tenant.create({
            name: "Cedars-Sinai Medical Center",
            contactEmail: "contact@cedarstesting.com"
        });

        console.log('Creating Departments...');
        const cardioDept = await Department.create({
            tenantId: tenant._id,
            name: "Cardiology",
            description: "Heart and blood vessels"
        });

        const neuroDept = await Department.create({
            tenantId: tenant._id,
            name: "Neurology",
            description: "Brain and nervous system"
        });

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        console.log('Creating System Roles (Users)...');
        
        // Hospital Admins
        await User.create({ name: "Admin Executive", email: "admin@hospital.com", password: password, role: "HospitalAdmin", tenantId: tenant._id });

        // Doctors
        const drSmith = await User.create({ 
            name: "Dr. Gregory Smith", email: "dr.smith@hospital.com", password: password, role: "Doctor", 
            tenantId: tenant._id, departmentId: cardioDept._id 
        });

        const drPatel = await User.create({ 
            name: "Dr. Ananya Patel", email: "dr.patel@hospital.com", password: password, role: "Doctor", 
            tenantId: tenant._id, departmentId: neuroDept._id 
        });

        // Pathologist & Pathology Lab
        const labTech = await User.create({ name: "Sarah LabTech", email: "lab@hospital.com", password: password, role: "Pathologist", tenantId: tenant._id });
        await PathologyLab.create({ tenantId: tenant._id, name: "Core Diagnostics Lab", contactEmail: "lab@hospital.com" });

        // Patient User Account (To Login)
        await User.create({ name: "John Doe (Patient Login)", email: "patient@hospital.com", password: password, role: "Patient", tenantId: tenant._id });

        console.log('Creating Patient Triage Records...');
        const dummyPatients = [
            {
                tenantId: tenant._id,
                departmentId: cardioDept._id,
                doctorId: drSmith._id,
                id: uuidv4(),
                name: "Robert Johnson",
                age: 58,
                symptoms: "Severe crushing chest pain radiating to left arm, sweating, shortness of breath.",
                history: "Hypertension, Smoker",
                vitals: { heartRate: "120", bloodPressure: "180/110", oxygenLevel: "88" },
                triageLevel: "Critical",
                score: 95,
                estimatedWaitTime: "0",
                status: "waiting",
                triageReasoning: "Critical symptom detected: chest pain | Critical hypoxia (SpO2: 88%) | Critical BP (180/110)"
            },
            {
                tenantId: tenant._id,
                departmentId: neuroDept._id,
                doctorId: drPatel._id,
                id: uuidv4(),
                name: "Emily Chen",
                age: 34,
                symptoms: "Sudden onset of severe headache, blurred vision, dizziness.",
                history: "Migraines",
                vitals: { heartRate: "90", bloodPressure: "130/85", oxygenLevel: "98" },
                triageLevel: "Urgent",
                score: 65,
                estimatedWaitTime: "15",
                status: "waiting",
                triageReasoning: "Urgent symptom detected: severe pain | Urgent symptom detected: dizzy"
            },
            {
                tenantId: tenant._id,
                id: uuidv4(),
                name: "Michael Torres",
                age: 42,
                symptoms: "Mild fever, persistent cough for 3 days, low energy.",
                history: "None",
                vitals: { heartRate: "82", bloodPressure: "120/80", oxygenLevel: "97" },
                triageLevel: "Standard",
                score: 25,
                estimatedWaitTime: "60",
                status: "waiting",
                triageReasoning: "Urgent symptom detected: fever"
            },
            {
                tenantId: tenant._id,
                departmentId: cardioDept._id,
                doctorId: drSmith._id,
                id: uuidv4(),
                name: "Amanda Davis",
                age: 65,
                symptoms: "Palpitations, feeling lightheaded after walking up stairs.",
                history: "Atrial Fibrillation",
                vitals: { heartRate: "115", bloodPressure: "145/90", oxygenLevel: "95" },
                triageLevel: "Urgent",
                score: 55,
                estimatedWaitTime: "20",
                status: "waiting",
                triageReasoning: "Abnormal HR (115 bpm) | Patient history risk: heart disease"
            },
            {
                tenantId: tenant._id,
                id: uuidv4(),
                name: "James Wilson",
                age: 28,
                symptoms: "Rolled ankle playing basketball, swelling and unable to bear weight.",
                history: "None",
                vitals: { heartRate: "75", bloodPressure: "118/75", oxygenLevel: "99" },
                triageLevel: "Standard",
                score: 20,
                estimatedWaitTime: "45",
                status: "waiting",
                triageReasoning: "No high-risk indicators detected."
            }
        ];

        await Patient.insertMany(dummyPatients);

        console.log('✅ Rich Dummy Database seeded! All dashboards will now be populated.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
