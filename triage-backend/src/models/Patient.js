const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Attached to which hospital
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
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
    triageReasoning: { type: String },
    estimatedWaitTime: { type: String },
    status: { type: String, default: "waiting" },
    timestamp: { type: Date, default: Date.now },
    dischargedAt: { type: Date },
    medicalReport: { type: String, default: "" },
    reportAttachments: { type: Array, default: [] }
});

module.exports = mongoose.model('Patient', PatientSchema);
