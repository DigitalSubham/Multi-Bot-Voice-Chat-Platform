const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const { transcribeAudio } = require('../services/gemini.service');
const { processChat } = require('../services/rag.service');

/**
 * POST /voice
 * Upload audio -> Transcribe -> RAG Chat -> Return Text
 */
const handleVoiceMessage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No audio file uploaded', 400);
        }

        const { botId } = req.body;
        if (!botId) {
            throw new AppError('botId is required', 400);
        }

        const userId = req.user.userId;

        // 1. Transcribe Audio
        const audioBuffer = fs.readFileSync(req.file.path);
        const mimeType = req.file.mimetype;
        const transcribedText = await transcribeAudio(audioBuffer, mimeType);

        if (!transcribedText) {
            throw new AppError('Could not transcribe audio', 500);
        }

        // Cleanup: delete uploaded file
        fs.unlinkSync(req.file.path);

        // 2. Fetch Bot
        const botRes = await db.query(
            'SELECT id, name, personality_prompt, namespace FROM bots WHERE id = $1',
            [botId],
        );

        if (botRes.rows.length === 0) {
            throw new AppError('Bot not found', 404);
        }
        const bot = botRes.rows[0];

        // 3. RAG Pipeline
        const aiResponse = await processChat({ message: transcribedText, bot });

        // 4. Save conversation
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            await client.query(
                `INSERT INTO chat_messages (user_id, bot_id, role, message)
         VALUES ($1, $2, 'user', $3)`,
                [userId, botId, transcribedText], // Save the transcribed text
            );

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

        res.status(200).json({
            status: 'success',
            data: {
                botId,
                transcription: transcribedText,
                response: aiResponse,
            },
        });
    } catch (err) {
        // Cleanup file if error occurred before unlink
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

module.exports = { handleVoiceMessage };
