const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat, saveAssessment, getLabsForTests, bookLabAppointment, getDepartmentPriority } = require('../controllers/virtualDoctorController');

router.post('/chat', protect, chat);
router.post('/save-assessment', protect, saveAssessment);
router.get('/labs', protect, getLabsForTests);
router.post('/book', protect, bookLabAppointment);
router.get('/priority/:department', protect, getDepartmentPriority);

module.exports = router;
