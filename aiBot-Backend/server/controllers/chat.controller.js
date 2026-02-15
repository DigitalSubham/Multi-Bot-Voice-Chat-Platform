const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const { processChat } = require('../services/rag.service');

// ── Validation ───────────────────────────────────────────────
const chatValidation = [
    body('botId').isUUID().withMessage('Valid Bot UUID is required'),
    body('message').notEmpty().withMessage('Message is required'),
];

// ── Controllers ──────────────────────────────────────────────

/**
 * POST /chat
 * Send a message to a bot and get an AI response.
 */
const sendMessage = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 422);
        }

        const { botId, message } = req.body;
        const userId = req.user.userId;

        // 1. Fetch bot details
        const botRes = await db.query(
            'SELECT id, name, personality_prompt, namespace FROM bots WHERE id = $1',
            [botId],
        );

        if (botRes.rows.length === 0) {
            throw new AppError('Bot not found', 404);
        }

        const bot = botRes.rows[0];

        // 2. Generate AI Response (RAG Pipeline)
        const aiResponse = await processChat({ message, bot });

        // 3. Save conversation to DB
        // We insert two rows: one for the user message, one for the assistant response
        // Using a transaction to ensure atomicity
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // User Message
            await client.query(
                `INSERT INTO chat_messages (user_id, bot_id, role, message)
         VALUES ($1, $2, 'user', $3)`,
                [userId, botId, message],
            );

            // Assistant Message
            await client.query(
                `INSERT INTO chat_messages (user_id, bot_id, role, message)
         VALUES ($1, $2, 'assistant', $3)`,
                [userId, botId, aiResponse],
            );

            await client.query('COMMIT');
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            client.release();
        }

        console.log('✅  Conversation saved to DB', aiResponse);

        res.status(200).json({
            status: 'success',
            data: {
                botId,
                response: aiResponse,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /chat/:botId/history
 * Get chat history for the current user and specified bot.
 */
const getChatHistory = async (req, res, next) => {
    try {
        const { botId } = req.params;
        const userId = req.user.userId;

        const result = await db.query(
            `SELECT id, role, message, created_at
       FROM chat_messages
       WHERE user_id = $1 AND bot_id = $2
       ORDER BY created_at ASC`,
            [userId, botId],
        );
        console.log("result all Result", result.rows);
        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: { history: result.rows },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { sendMessage, getChatHistory, chatValidation };
