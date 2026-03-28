const mongoose = require('mongoose');

const JourneyStepSchema = new mongoose.Schema({
    step: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    completedAt: { type: Date }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'PathologyLab' },

    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    symptoms: { type: String, required: true },
    history: { type: String, default: "" },
    vitals: {
        heartRate: { type: String, default: "" },
        bloodPressure: { type: String, default: "" },
        oxygenLevel: { type: String, default: "" }
    },
    triageLevel: { type: String },
    department: { type: String },
    score: { type: Number },
    recommendedDoctor: { type: String },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedLabName: { type: String, default: "" },
    labTests: [{ type: String }],
    triageReasoning: { type: String },
    estimatedWaitTime: { type: String },
    status: { type: String, default: "waiting" },
    timestamp: { type: Date, default: Date.now },
    dischargedAt: { type: Date },
    medicalReport: { type: String, default: "" },
    reportAttachments: { type: Array, default: [] },

    testsDone: { type: Boolean, default: false },
    testStatus: { type: String, enum: ['Pending', 'Processing', 'Partial', 'Released', 'None'], default: 'None' },
    onboardedAt: { type: Date, default: Date.now },

    journey: { type: [JourneyStepSchema], default: [] }
});

module.exports = mongoose.model('Patient', PatientSchema);
