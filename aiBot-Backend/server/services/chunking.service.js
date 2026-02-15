/**
 * Chunk a long text into overlapping segments of roughly minWords–maxWords
 * words each, splitting on sentence boundaries where possible.
 *
 * @param {string} text
 * @param {object} opts
 * @param {number} opts.minWords    – minimum words per chunk (default 500)
 * @param {number} opts.maxWords    – maximum words per chunk (default 800)
 * @param {number} opts.overlapWords – overlap between consecutive chunks (default 100)
 * @returns {string[]}
 */
const chunkText = (text, { minWords = 500, maxWords = 800, overlapWords = 100 } = {}) => {
    if (!text || typeof text !== 'string') return [];

    const words = text.split(/\s+/).filter(Boolean);

    // If the text is shorter than the minimum chunk size, return it as-is
    if (words.length <= maxWords) {
        return [words.join(' ')];
    }

    const chunks = [];
    let start = 0;

    while (start < words.length) {
        let end = Math.min(start + maxWords, words.length);

        // Try to find a sentence boundary near the end of the chunk
        if (end < words.length) {
            // Look backwards from end for a sentence-ending word
            let bestBreak = -1;
            for (let i = end - 1; i >= start + minWords; i--) {
                const word = words[i];
                if (/[.!?]$/.test(word)) {
                    bestBreak = i + 1; // include the sentence-ending word
                    break;
                }
            }
            if (bestBreak > 0) {
                end = bestBreak;
            }
        }

        const chunk = words.slice(start, end).join(' ');
        chunks.push(chunk);

        // Advance, accounting for overlap
        start = end - overlapWords;

        // Safety: always advance at least 1 word
        if (start <= chunks.length > 1 ? end - overlapWords : 0) {
            start = end > overlapWords ? end - overlapWords : end;
        }

        // Prevent infinite loop
        if (start >= words.length) break;
        if (end === words.length) break;
    }

    return chunks;
};

module.exports = { chunkText };
