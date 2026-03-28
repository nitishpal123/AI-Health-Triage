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
        const password = await bcrypt.hash('password@123', salt);

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

        // Pathologist & Pathology Labs (multiple with rich data)
        const labTech = await User.create({ name: "Sarah LabTech", email: "lab@hospital.com", password: password, role: "Pathologist", tenantId: tenant._id });

        const COMMON_SERVICES = [
            { name: 'Complete Blood Count (CBC)', price: 18, homePrice: 28, turnaround: '4-6 hrs' },
            { name: 'Lipid Panel', price: 35, homePrice: 50, turnaround: '6-8 hrs' },
            { name: 'Blood Glucose (Fasting)', price: 12, homePrice: 20, turnaround: '2-4 hrs' },
            { name: 'HbA1c', price: 28, homePrice: 40, turnaround: '6-8 hrs' },
            { name: 'Liver Function Test (LFT)', price: 40, homePrice: 58, turnaround: '6-8 hrs' },
            { name: 'Kidney Function Test (KFT)', price: 38, homePrice: 55, turnaround: '6-8 hrs' },
            { name: 'Thyroid Profile (TSH, T3, T4)', price: 45, homePrice: 65, turnaround: '8-12 hrs' },
            { name: 'Urinalysis', price: 15, homePrice: 25, turnaround: '2-4 hrs' },
            { name: 'ECG', price: 30, homePrice: 50, turnaround: '1-2 hrs' },
            { name: 'Troponin I', price: 55, homePrice: 75, turnaround: '2-4 hrs' },
            { name: 'D-Dimer', price: 60, homePrice: 80, turnaround: '4-6 hrs' },
            { name: 'CRP (C-Reactive Protein)', price: 25, homePrice: 38, turnaround: '4-6 hrs' },
            { name: 'Chest X-Ray', price: 45, homePrice: null, turnaround: '2-4 hrs' },
            { name: 'CT Scan (Head)', price: 280, homePrice: null, turnaround: '24-48 hrs' },
            { name: 'MRI Brain', price: 450, homePrice: null, turnaround: '24-48 hrs' },
            { name: 'X-Ray (Limb)', price: 35, homePrice: null, turnaround: '2-4 hrs' },
            { name: 'Electrolytes Panel', price: 30, homePrice: 45, turnaround: '4-6 hrs' },
            { name: 'ABG (Arterial Blood Gas)', price: 65, homePrice: null, turnaround: '1-2 hrs' },
            { name: 'Blood Type & Cross Match', price: 40, homePrice: 55, turnaround: '4-6 hrs' },
            { name: 'Spirometry', price: 80, homePrice: null, turnaround: '1-2 hrs' },
        ];

        const lab = await PathologyLab.create({
            tenantId: tenant._id,
            name: "Core Diagnostics Lab",
            contactEmail: "lab@hospital.com",
            phone: "+1 (310) 555-0101",
            address: "8700 Beverly Blvd, Los Angeles, CA 90048",
            city: "Los Angeles",
            rating: 4.8,
            reviewCount: 1240,
            homeCollection: true,
            walkIn: true,
            openHours: "6:00 AM – 10:00 PM",
            accreditations: ["CAP Accredited", "CLIA Certified", "ISO 15189"],
            services: COMMON_SERVICES
        });

        await PathologyLab.create({
            tenantId: tenant._id,
            name: "MedPlus Diagnostics",
            contactEmail: "info@medplus.com",
            phone: "+1 (310) 555-0202",
            address: "1250 Sunset Blvd, Los Angeles, CA 90026",
            city: "Los Angeles",
            rating: 4.5,
            reviewCount: 876,
            homeCollection: true,
            walkIn: true,
            openHours: "7:00 AM – 9:00 PM",
            accreditations: ["CLIA Certified", "CAP Accredited"],
            services: COMMON_SERVICES.map(s => ({ ...s, price: Math.round(s.price * 0.88), homePrice: s.homePrice ? Math.round(s.homePrice * 0.88) : null }))
        });

        await PathologyLab.create({
            tenantId: tenant._id,
            name: "QuickTest Express",
            contactEmail: "hello@quicktest.com",
            phone: "+1 (310) 555-0303",
            address: "3400 Wilshire Blvd, Los Angeles, CA 90010",
            city: "Los Angeles",
            rating: 4.2,
            reviewCount: 432,
            homeCollection: false,
            walkIn: true,
            openHours: "8:00 AM – 6:00 PM",
            accreditations: ["CLIA Certified"],
            services: COMMON_SERVICES.filter(s => !['MRI Brain','CT Scan (Head)','Spirometry','ABG (Arterial Blood Gas)'].includes(s.name))
                .map(s => ({ ...s, price: Math.round(s.price * 0.75), homePrice: null }))
        });

        await PathologyLab.create({
            tenantId: tenant._id,
            name: "HealthFirst Labs",
            contactEmail: "contact@healthfirst.com",
            phone: "+1 (310) 555-0404",
            address: "6200 Sepulveda Blvd, Van Nuys, CA 91411",
            city: "Van Nuys",
            rating: 4.6,
            reviewCount: 654,
            homeCollection: true,
            walkIn: true,
            openHours: "7:00 AM – 8:00 PM",
            accreditations: ["CAP Accredited", "CLIA Certified"],
            services: COMMON_SERVICES.map(s => ({ ...s, price: Math.round(s.price * 0.95), homePrice: s.homePrice ? Math.round(s.homePrice * 0.92) : null }))
        });

        // Patient User Account (To Login)
        await User.create({ name: "John Doe (Patient Login)", email: "patient@hospital.com", password: password, role: "Patient", tenantId: tenant._id });

        console.log('Creating Patient Triage Records...');
        const dummyPatients = [
            {
                tenantId: tenant._id,
                departmentId: cardioDept._id,
                doctorId: drSmith._id,
                assignedDoctorId: drSmith._id,
                labId: lab._id,
                assignedLabName: "Core Diagnostics Lab",
                labTests: ['ECG', 'Troponin', 'CBC', 'Lipid Panel'],
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
                testStatus: "Processing",
                triageReasoning: "Critical symptom detected: chest pain | Critical hypoxia (SpO2: 88%) | Critical BP (180/110)",
                journey: [
                    { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Tests Ordered', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Processing', status: 'active' },
                    { step: 'Results Released', status: 'pending' },
                    { step: 'Doctor Consultation', status: 'pending' },
                    { step: 'Discharged', status: 'pending' }
                ]
            },
            {
                tenantId: tenant._id,
                departmentId: neuroDept._id,
                doctorId: drPatel._id,
                assignedDoctorId: drPatel._id,
                labId: lab._id,
                assignedLabName: "Core Diagnostics Lab",
                labTests: ['CT Scan', 'MRI Brain', 'CBC'],
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
                testStatus: "Pending",
                triageReasoning: "Urgent symptom detected: severe pain | Urgent symptom detected: dizzy",
                journey: [
                    { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Tests Ordered', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Processing', status: 'active' },
                    { step: 'Results Released', status: 'pending' },
                    { step: 'Doctor Consultation', status: 'pending' },
                    { step: 'Discharged', status: 'pending' }
                ]
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
                testStatus: "None",
                triageReasoning: "Urgent symptom detected: fever",
                journey: [
                    { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Consultation', status: 'active' },
                    { step: 'Discharged', status: 'pending' }
                ]
            },
            {
                tenantId: tenant._id,
                departmentId: cardioDept._id,
                doctorId: drSmith._id,
                assignedDoctorId: drSmith._id,
                labId: lab._id,
                assignedLabName: "Core Diagnostics Lab",
                labTests: ['ECG', 'CBC', 'Lipid Panel'],
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
                testStatus: "Released",
                triageReasoning: "Abnormal HR (115 bpm) | Patient history risk: heart disease",
                journey: [
                    { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Tests Ordered', status: 'completed', completedAt: new Date() },
                    { step: 'Lab Processing', status: 'completed', completedAt: new Date() },
                    { step: 'Results Released', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Consultation', status: 'active' },
                    { step: 'Discharged', status: 'pending' }
                ]
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
                testStatus: "None",
                triageReasoning: "No high-risk indicators detected.",
                journey: [
                    { step: 'Patient Onboarded', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Assigned', status: 'completed', completedAt: new Date() },
                    { step: 'Doctor Consultation', status: 'active' },
                    { step: 'Discharged', status: 'pending' }
                ]
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
