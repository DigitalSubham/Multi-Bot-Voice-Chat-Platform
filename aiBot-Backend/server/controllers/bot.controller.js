const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const { chunkText } = require('../services/chunking.service');
const { generateEmbeddings } = require('../services/embedding.service');
const { upsertVectors, ensureCollection, deleteCollection } = require('../services/vector.service');

// ── Validation ───────────────────────────────────────────────
const createBotValidation = [
    body('name').notEmpty().withMessage('Bot name is required'),
    body('personality_prompt').notEmpty().withMessage('Personality prompt is required'),
    body('avatar_color').optional().isHexColor().withMessage('Invalid color hex'),
    body('knowledge_base')
        .optional()
        .isString()
        .withMessage('Knowledge base must be a string'),
];

// ── Controllers ──────────────────────────────────────────────

/**
 * POST /bots
 * Create a new bot, process its knowledge base, and store embeddings.
 */
const createBot = async (req, res, next) => {
    const client = await db.getClient();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 422);
        }

        const { name, personality_prompt, avatar_color, knowledge_base } = req.body;

        await client.query('BEGIN');

        // 1. Insert bot into PostgreSQL
        // We generated a UUID in the DB, so we need to return it to use for namespace
        const insertRes = await client.query(
            `INSERT INTO bots (name, personality_prompt, namespace, avatar_color)
       VALUES ($1, $2, 'temp_namespace', $3)
       RETURNING id, created_at`,
            [name, personality_prompt, avatar_color],
        );

        const botId = insertRes.rows[0].id;
        const namespace = `bot_${botId}`;

        // 2. Update the namespace now that we have the ID
        await client.query('UPDATE bots SET namespace = $1 WHERE id = $2', [
            namespace,
            botId,
        ]);

        // 3. Process Knowledge Base (if provided)
        if (knowledge_base && knowledge_base.trim().length > 0) {
            // Chunk text
            const chunks = chunkText(knowledge_base);

            if (chunks.length > 0) {
                // Generate embeddings
                const vectors = await generateEmbeddings(chunks);

                // Add botId to metadata for stricter filtering if needed later
                const vectorsWithMeta = vectors.map(v => ({ ...v, botId }));

                // Upsert to Vector DB
                await upsertVectors(namespace, vectorsWithMeta);
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            status: 'success',
            data: {
                bot: {
                    id: botId,
                    name,
                    namespace,
                    created_at: insertRes.rows[0].created_at,
                },
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

const editBot = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 422);
        }

        const { botId } = req.params;
        const { name, personality_prompt, avatar_color, knowledge_base } = req.body;

        await client.query('BEGIN');

        // 1️⃣ Check if bot exists
        const botRes = await client.query(
            `SELECT id, namespace FROM bots WHERE id = $1`,
            [botId]
        );

        if (botRes.rows.length === 0) {
            throw new AppError('Bot not found', 404);
        }

        const bot = botRes.rows[0];

        // 2️⃣ Update bot basic details
        await client.query(
            `UPDATE bots
             SET name = $1,
                 personality_prompt = $2,
                 avatar_color = $3
             WHERE id = $4`,
            [name, personality_prompt, avatar_color, botId]
        );

        // 3️⃣ If knowledge_base is provided → reprocess embeddings
        if (knowledge_base && knowledge_base.trim().length > 0) {

            // 🗑 Delete old collection
            await deleteCollection(bot.namespace);

            // 📦 Recreate collection (optional, upsert will create if needed)
            await ensureCollection(bot.namespace);

            // ✂ Chunk text
            const chunks = chunkText(knowledge_base);

            if (chunks.length > 0) {
                // 🧠 Generate embeddings
                const vectors = await generateEmbeddings(chunks);

                const vectorsWithMeta = vectors.map(v => ({
                    ...v,
                    botId
                }));

                // ⬆ Upsert new vectors
                await upsertVectors(bot.namespace, vectorsWithMeta);
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: 'success',
            message: 'Bot updated successfully'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};


/**
 * GET /bots
 * Retrieve all bots.
 */
const getAllBots = async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, name, personality_prompt, avatar_color, created_at FROM bots ORDER BY created_at DESC',
        );
        console.log("result all", result);
        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /bots/:id
 * Delete a bot and its vector collection.
 */
const deleteBot = async (req, res, next) => {
    const client = await db.getClient();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // 1. Get bot namespace
        const botRes = await client.query('SELECT namespace FROM bots WHERE id = $1', [id]);
        if (botRes.rows.length === 0) {
            throw new AppError('Bot not found', 404);
        }
        const { namespace } = botRes.rows[0];

        // 2. Delete from PostgreSQL
        await client.query('DELETE FROM bots WHERE id = $1', [id]);

        // 3. Delete from Vector DB
        await deleteCollection(namespace);

        await client.query('COMMIT');

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

module.exports = { createBot, editBot, getAllBots, deleteBot, createBotValidation };
