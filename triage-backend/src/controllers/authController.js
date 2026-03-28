const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '15m'
    });
    
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', {
        expiresIn: '7d'
    });
    
    return { accessToken, refreshToken };
};

// @route POST /api/auth/login
const loginTime = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).populate(['departmentId', 'tenantId']);
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
        
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        user.refreshToken = refreshToken;
        await user.save();
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?._id,
            tenantName: user.tenantId?.name,
            departmentId: user.departmentId?._id,
            departmentName: user.departmentId?.name,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route POST /api/auth/refresh
const refreshAuthToken = async (req, res) => {
    try {
        const { token } = req.body; // Expecting refresh token in body
        
        if (!token) return res.status(401).json({ message: 'Refresh token required' });
        
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshsecret');
        const user = await User.findById(decoded.id);
        
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        
        const tokens = generateTokens(user._id);
        user.refreshToken = tokens.refreshToken;
        await user.save();
        
        res.json(tokens);
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

// Utility to create a hospital/tenant setup (Could be an internal ops route)
const registerHospital = async (req, res) => {
    try {
        const { hospitalName, hospitalEmail, adminName, adminEmail, adminPassword } = req.body;
        
        // Check if tenant exist
        const tenantExists = await Tenant.findOne({ name: hospitalName });
        if (tenantExists) return res.status(400).json({ message: 'Hospital already registered' });
        
        // Check if admin email exist
        const userExists = await User.findOne({ email: adminEmail });
        if (userExists) return res.status(400).json({ message: 'Email already exists' });
        
        const tenant = await Tenant.create({
            name: hospitalName,
            contactEmail: hospitalEmail
        });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'HospitalAdmin',
            tenantId: tenant._id
        });
        
        res.status(201).json({
            message: "Hospital and Admin registered successfully",
            tenantId: tenant._id,
            adminId: admin._id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during registration" });
    }
};

module.exports = {
    loginTime,
    refreshAuthToken,
    registerHospital
};
