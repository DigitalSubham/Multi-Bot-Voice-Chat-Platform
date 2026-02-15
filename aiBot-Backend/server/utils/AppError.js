/**
 * Custom operational error class.
 * Throw this for expected / handled error conditions.
 */
class AppError extends Error {
    /**
     * @param {string} message  – human-readable message
     * @param {number} statusCode – HTTP status code (default 500)
     */
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
