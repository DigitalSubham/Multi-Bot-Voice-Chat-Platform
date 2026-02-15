const { generateEmbedding, generateText } = require('./gemini.service');
const { searchVectors } = require('./vector.service');

/**
 * Full RAG pipeline for a chat message.
 *
 * 1. Embed the user's message
 * 2. Search the bot's vector namespace for relevant chunks
 * 3. Construct a knowledge-grounded prompt
 * 4. Generate a response via Gemini
 *
 * @param {object} params
 * @param {string} params.message         – user's message
 * @param {object} params.bot             – bot row from PostgreSQL
 * @param {string} params.bot.name
 * @param {string} params.bot.personality_prompt
 * @param {string} params.bot.namespace
 * @returns {Promise<string>}              – AI response text
 */
const processChat = async ({ message, bot }) => {
    // 1. Generate embedding for the user query
    const queryEmbedding = await generateEmbedding(message);
    // 2. Retrieve top-K similar knowledge chunks
    let retrievedChunks = [];
    try {
        retrievedChunks = await searchVectors(bot.namespace, queryEmbedding, 3);
    } catch (err) {
        console.warn('⚠️  Vector search failed, proceeding without context:', err.message);
    }
    console.log("retrievedChunks", retrievedChunks);
    // 3. Build knowledge context
    const knowledgeBlock =
        retrievedChunks.length > 0
            ? retrievedChunks.map((c, i) => `[Chunk ${i + 1}] (relevance: ${c.score.toFixed(3)})\n${c.text}`).join('\n\n')
            : 'No relevant knowledge found.';

    // 4. Construct the RAG prompt
    const prompt = `System:
You are ${bot.name}.
Personality: ${bot.personality_prompt || 'Helpful and professional.'}

Only answer using the provided knowledge below.
If the knowledge is insufficient to answer the question, respond with:
"I don't have enough information to answer that question."

Do NOT make up facts. Do NOT answer outside the provided knowledge.

Knowledge:
${knowledgeBlock}

User:
${message}`;
    console.log("prompt", prompt);
    // 5. Generate response
    const response = await generateText(prompt);

    return response;
};

module.exports = { processChat };
