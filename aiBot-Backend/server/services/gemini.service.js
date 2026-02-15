const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');

const client = new GoogleGenAI({ apiKey: env.geminiApiKey });

// ── Text generation ─────────────────────────────────────────

/**
 * Generate a text response using Gemini.
 * @param {string} prompt – full prompt (system + user context)
 * @returns {Promise<string>}
 */
const generateText = async (prompt) => {
    const result = await client.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt
    });

    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("No response from Gemini");
    }

    const parts = result.candidates[0].content?.parts || [];

    return parts.map(p => p.text || '').join('');
};

// ── Embeddings ──────────────────────────────────────────────

/**
 * Generate a 768-dimensional embedding for a text string.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (text) => {
    // Using text-embedding-004
    // NOTE: SDK expects 'contents'[] (plural) for embedding, not singular 'content'.
    const result = await client.models.embedContent({
        model: 'gemini-embedding-001',
        contents: [
            { parts: [{ text }] }
        ]
    });
    // result.embeddings is an array corresponding to input contents.
    // We only sent one content item, so take the first embedding.
    // Each embedding object has a 'values' property.
    console.log("result", result);
    return result.embeddings[0].values;
};

// ── Speech-to-Text ──────────────────────────────────────────

/**
 * Transcribe audio to text using Gemini multimodal.
 * @param {Buffer} audioBuffer – raw audio bytes
 * @param {string} mimeType   – e.g. 'audio/webm', 'audio/wav'
 * @returns {Promise<string>}  transcribed text
 */
const transcribeAudio = async (audioBuffer, mimeType) => {
    const audioBase64 = audioBuffer.toString('base64');
    const result = await client.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
            { text: 'Transcribe the following audio accurately. Return only the transcribed text, nothing else.' },
            { inlineData: { mimeType, data: audioBase64 } }
        ]
    });

    const parts = result.candidates[0].content?.parts || [];

    return parts.map(p => p.text || '').join('');
};

module.exports = { generateText, generateEmbedding, transcribeAudio };
