const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    headOfDepartment: { type: String }
});

module.exports = mongoose.model('Department', DepartmentSchema);
