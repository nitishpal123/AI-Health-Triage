const mongoose = require('mongoose');

const PathologyLabSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    name: { type: String, required: true },
    registrationNumber: { type: String },
    contactEmail: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    homeCollection: { type: Boolean, default: false },
    walkIn: { type: Boolean, default: true },
    openHours: { type: String, default: '8:00 AM – 8:00 PM' },
    accreditations: [{ type: String }],
    services: [{
        name: { type: String },
        price: { type: Number },
        turnaround: { type: String },
        homePrice: { type: Number }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PathologyLab', PathologyLabSchema);
