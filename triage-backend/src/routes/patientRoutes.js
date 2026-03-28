const express = require('express');
const router = express.Router();
const { getPatients, createPatient, updatePatientStatus } = require('../controllers/patientController');

router.get('/', getPatients);
router.post('/', createPatient);
router.patch('/:id/status', updatePatientStatus);

module.exports = router;
