const AppError = require('../utils/AppError');

/**
 * Higher-order middleware – restricts access to specified roles.
 * Must be used AFTER authenticate middleware so req.user exists.
 *
 * @param  {...string} allowedRoles  e.g. 'ADMIN', 'USER'
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...allowedRoles) => (req, _res, next) => {
    if (!req.user) {
        return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
        return next(
            new AppError('You do not have permission to perform this action.', 403),
        );
    }

    next();
};

module.exports = requireRole;
