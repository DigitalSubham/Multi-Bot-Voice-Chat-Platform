const env = require('../config/env');

/**
 * Global error-handling middleware.
 * Must be registered LAST with app.use(errorHandler).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    // Log non-operational (unexpected) errors in full
    if (!err.isOperational) {
        console.error('🔥  UNEXPECTED ERROR:', err);
    }

    res.status(statusCode).json({
        status,
        message: err.message || 'Internal server error',
        ...(env.isDev && { stack: err.stack }),
    });
};

module.exports = errorHandler;
