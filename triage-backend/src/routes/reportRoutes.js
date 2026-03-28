const express = require('express');
const multer = require('multer');
const { processReport } = require('../controllers/reportController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Setup temporal file upload using multer
const upload = multer({ dest: 'uploads/' });

// Route to process unstructured medical text reports (PDF / TXT)
// Using 'authorize' to ensure only registered medical entities can upload documents
router.post('/upload', authorize(['HospitalAdmin', 'Doctor', 'Pathologist']), upload.single('report'), processReport);

module.exports = router;
