const express = require('express');
const router = express.Router();
const { loginTime, refreshAuthToken, logout, registerHospital } = require('../controllers/authController');

router.post('/login', loginTime);
router.post('/refresh', refreshAuthToken);
router.post('/logout', logout);
router.post('/register', registerHospital);

module.exports = router;
