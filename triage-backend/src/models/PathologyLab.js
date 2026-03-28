const mongoose = require('mongoose');

const PathologyLabSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }, // The hospital it's attached to
    name: { type: String, required: true },
    registrationNumber: { type: String },
    contactEmail: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PathologyLab', PathologyLabSchema);
