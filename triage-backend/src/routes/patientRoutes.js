const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isolateTenant, authorize } = require('../middleware/auth');
const {
    getPatients, createPatient, updatePatientStatus, updateLabStatus,
    bulkOnboardPatients, getPatientStats, assignDoctor, deletePatient,
    getMyRecord, getDepartments, getLabs
} = require('../controllers/patientController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/stats',       protect, isolateTenant, getPatientStats);
router.get('/my',          protect, getMyRecord);
router.get('/departments', protect, isolateTenant, getDepartments);
router.get('/labs',        protect, isolateTenant, getLabs);
router.get('/',            protect, isolateTenant, getPatients);
router.post('/',           protect, isolateTenant, createPatient);
router.patch('/:id/status',     protect, isolateTenant, authorize('HospitalAdmin','Doctor','SuperAdmin'), updatePatientStatus);
router.patch('/:id/lab-status', protect, isolateTenant, authorize('Pathologist','HospitalAdmin','SuperAdmin'), updateLabStatus);
router.patch('/:id/doctor',     protect, isolateTenant, authorize('HospitalAdmin','SuperAdmin'), assignDoctor);
router.delete('/:id',           protect, isolateTenant, authorize('HospitalAdmin','SuperAdmin'), deletePatient);
router.post('/bulk', protect, isolateTenant, authorize('HospitalAdmin','SuperAdmin'), upload.single('file'), bulkOnboardPatients);

module.exports = router;
