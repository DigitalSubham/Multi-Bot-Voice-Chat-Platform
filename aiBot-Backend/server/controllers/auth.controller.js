const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// ── Validation chains ────────────────────────────────────────
const signupValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be admin or user'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ── Helpers ──────────────────────────────────────────────────
const SALT_ROUNDS = 12;

const signToken = (user) =>
    jwt.sign(
        { userId: user.id, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn },
    );

// ── Controllers ──────────────────────────────────────────────

/**
 * POST /auth/signup
 */
const signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 422);
        }

        const { email, password, role } = req.body;

        // Check for duplicate email
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw new AppError('Email already registered.', 409);
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await db.query(
            `INSERT INTO users (email, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
            [email, hashedPassword, role || 'user'],
        );

        const user = result.rows[0];
        const token = signToken(user);

        res.status(201).json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 422);
        }

        const { email, password } = req.body;

        const result = await db.query(
            'SELECT id, email, password, role FROM users WHERE email = $1',
            [email],
        );

        if (result.rows.length === 0) {
            throw new AppError('Invalid email or password.', 401);
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        const token = signToken(user);

        res.status(200).json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { signup, login, signupValidation, loginValidation };
