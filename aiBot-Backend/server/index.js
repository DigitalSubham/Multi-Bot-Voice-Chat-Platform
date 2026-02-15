const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const db = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/AppError');

// Routes
const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const chatRoutes = require('./routes/chat.routes');
const voiceRoutes = require('./routes/voice.routes');

const app = express();

// ── Security & Config ────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ msg: "fine", status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// ── Server Start ─────────────────────────────────────────────
const startServer = async () => {
    try {
        // Test DB connection
        const client = await db.pool.connect();
        console.log('✅  Connected to PostgreSQL');
        client.release();

        app.listen(env.port, () => {
            console.log(`🚀  Server running in ${env.nodeEnv} mode on port ${env.port}`);
        });
    } catch (err) {
        console.error('❌  Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('🔥  UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});
