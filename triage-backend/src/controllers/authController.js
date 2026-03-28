const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

const generateTokens = (user) => {
    const payload = { id: user._id, role: user.role, tenantId: user.tenantId?._id || user.tenantId };

    const accessToken = jwt.sign({ ...payload, type: 'access' }, SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

// POST /api/auth/login
const loginTime = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('tenantId').populate('departmentId');
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        // Build a plain object with resolved IDs before generating tokens
        const tokenPayload = {
            _id: user._id,
            role: user.role,
            tenantId: user.tenantId?._id || user.tenantId
        };
        const { accessToken, refreshToken } = generateTokens(tokenPayload);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?._id || user.tenantId,
            tenantName: user.tenantId?.name,
            departmentId: user.departmentId?._id,
            departmentName: user.departmentId?.name,
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/auth/refresh
const refreshAuthToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: 'Refresh token required' });

        let decoded;
        try {
            decoded = jwt.verify(token, SECRET);
        } catch {
            return res.status(403).json({ message: 'Invalid or expired refresh token', code: 'REFRESH_EXPIRED' });
        }

        if (decoded.type !== 'refresh') {
            return res.status(403).json({ message: 'Invalid token type' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: 'Session revoked. Please login again.', code: 'SESSION_REVOKED' });
        }

        const tokens = generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json(tokens);
    } catch (err) {
        res.status(403).json({ message: 'Token refresh failed' });
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    try {
        const { token } = req.body;
        if (token) {
            const user = await User.findOne({ refreshToken: token });
            if (user) { user.refreshToken = null; await user.save(); }
        }
        res.json({ message: 'Logged out successfully' });
    } catch {
        res.status(500).json({ message: 'Logout failed' });
    }
};

// POST /api/auth/register
const registerHospital = async (req, res) => {
    try {
        const { hospitalName, hospitalEmail, adminName, adminEmail, adminPassword } = req.body;

        if (await Tenant.findOne({ name: hospitalName }))
            return res.status(400).json({ message: 'Hospital already registered' });
        if (await User.findOne({ email: adminEmail }))
            return res.status(400).json({ message: 'Email already exists' });

        const tenant = await Tenant.create({ name: hospitalName, contactEmail: hospitalEmail });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await User.create({
            name: adminName, email: adminEmail, password: hashedPassword,
            role: 'HospitalAdmin', tenantId: tenant._id
        });

        res.status(201).json({ message: 'Hospital registered', tenantId: tenant._id, adminId: admin._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

module.exports = { loginTime, refreshAuthToken, logout, registerHospital };
