const express = require('express');
const router = express.Router();
const { getPatients, createPatient, updatePatientStatus } = require('../controllers/patientController');
const { updateReport } = require('../controllers/reportController');

router.get('/', getPatients);
router.post('/', createPatient);
router.patch('/:id/status', updatePatientStatus);
router.patch('/:id/report', updateReport);

module.exports = router;
