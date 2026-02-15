const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Express middleware – verifies the JWT from the Authorization header
 * and attaches { userId, role } to req.user.
 */
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required. Provide a Bearer token.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.jwtSecret);

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err instanceof AppError) return next(err);

        if (err.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token.', 401));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Token has expired. Please log in again.', 401));
        }

        next(err);
    }
};

module.exports = authenticate;
