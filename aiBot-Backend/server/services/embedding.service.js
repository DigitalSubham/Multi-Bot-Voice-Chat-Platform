const { generateEmbedding } = require('./gemini.service');

/**
 * Generate embeddings for an array of text chunks.
 * Returns objects pairing each chunk with its embedding vector.
 *
 * @param {string[]} chunks
 * @returns {Promise<Array<{ text: string, embedding: number[] }>>}
 */
const generateEmbeddings = async (chunks) => {
    const results = [];

    // Process sequentially to respect API rate limits.
    // For production scale, consider batching with concurrency control.
    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        results.push({ text: chunk, embedding });
    }

    return results;
};

module.exports = { generateEmbeddings };
