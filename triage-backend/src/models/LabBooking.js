const mongoose = require('mongoose');

const LabBookingSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    patientAddress: { type: String },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'PathologyLab', required: true },
    labName: { type: String },
    tests: [{ type: String }],
    bookingType: { type: String, enum: ['home', 'walkin'], required: true },
    appointmentDate: { type: String },
    appointmentTime: { type: String },
    totalPrice: { type: Number },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' },
    patientRecordId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LabBooking', LabBookingSchema);
