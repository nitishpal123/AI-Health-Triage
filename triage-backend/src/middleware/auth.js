const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET);

        if (decoded.type !== 'access') {
            return res.status(401).json({ message: 'Invalid token type', code: 'INVALID_TOKEN' });
        }

        const user = await User.findById(decoded.id).select('-password -refreshToken');
        if (!user) {
            return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Not authorized', code: 'INVALID_TOKEN' });
    }
};

// Role-based authorization
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            message: `Role '${req.user?.role}' is not authorized for this resource`,
            code: 'FORBIDDEN'
        });
    }
    next();
};

// Tenant isolation — ensures user can only access their own tenant's data
const isolateTenant = (req, res, next) => {
    const requestedTenant = req.query.tenantId || req.body.tenantId || req.params.tenantId;
    if (requestedTenant && req.user.role !== 'SuperAdmin') {
        if (String(req.user.tenantId) !== String(requestedTenant)) {
            return res.status(403).json({ message: 'Cross-tenant access denied', code: 'TENANT_MISMATCH' });
        }
    }
    // Inject tenantId into request for downstream use
    req.tenantId = req.user.tenantId;
    next();
};

module.exports = { protect, authorize, isolateTenant };
