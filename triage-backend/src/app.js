const express = require('express');
const cors = require('cors');

const patientRoutes = require('./routes/patientRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const virtualDoctorRoutes = require('./routes/virtualDoctorRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/virtual-doctor', virtualDoctorRoutes);

module.exports = app;
