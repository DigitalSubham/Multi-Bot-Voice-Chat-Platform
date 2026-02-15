const { QdrantClient } = require('@qdrant/js-client-rest');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const VECTOR_SIZE = 3072; // Gemini text-embedding-004 dimension

const client = new QdrantClient({
    url: env.qdrantUrl,
    ...(env.qdrantApiKey && { apiKey: env.qdrantApiKey }),
});

/**
 * Ensure a Qdrant collection exists for the given namespace.
 * Creates one with the correct vector config if it doesn't exist.
 *
 * @param {string} namespace – collection name (e.g. "bot_<uuid>")
 */
const ensureCollection = async (namespace) => {
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === namespace);

    if (!exists) {
        await client.createCollection(namespace, {
            vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
        });
        console.log(`✅  Created Qdrant collection: ${namespace}`);
    }
};

/**
 * Upsert embedding vectors with metadata into a Qdrant collection.
 *
 * @param {string} namespace – collection name
 * @param {Array<{ text: string, embedding: number[], botId: string }>} vectors
 */
const upsertVectors = async (namespace, vectors) => {
    await ensureCollection(namespace);

    const points = vectors.map((v) => ({
        id: uuidv4(),
        vector: v.embedding,
        payload: {
            botId: v.botId,
            text: v.text,
        },
    }));

    // Qdrant supports batched upserts
    const BATCH_SIZE = 100;
    for (let i = 0; i < points.length; i += BATCH_SIZE) {
        const batch = points.slice(i, i + BATCH_SIZE);
        await client.upsert(namespace, { wait: true, points: batch });
    }

    console.log(`📦  Upserted ${points.length} vectors into "${namespace}"`);
};

/**
 * Search for the most similar vectors in a collection.
 *
 * @param {string}   namespace  – collection name
 * @param {number[]} embedding  – query vector (768 dims)
 * @param {number}   topK       – number of results (default 3)
 * @returns {Promise<Array<{ text: string, score: number }>>}
 */
const searchVectors = async (namespace, embedding, topK = 3) => {
    console.log("namespace", namespace, embedding, topK);
    const results = await client.search(namespace, {
        vector: embedding,
        limit: topK,
        with_payload: true,
    });

    return results.map((r) => ({
        text: r.payload.text,
        score: r.score,
    }));
};

/**
 * Delete an entire Qdrant collection (e.g. when a bot is removed).
 *
 * @param {string} namespace
 */
const deleteCollection = async (namespace) => {
    try {
        await client.deleteCollection(namespace);
        console.log(`🗑️  Deleted Qdrant collection: ${namespace}`);
    } catch (err) {
        // Collection may not exist; log and continue
        console.warn(`⚠️  Could not delete collection "${namespace}":`, err.message);
    }
};

module.exports = { ensureCollection, upsertVectors, searchVectors, deleteCollection };
