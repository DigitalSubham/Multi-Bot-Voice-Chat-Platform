const { GoogleGenAI } = require('@google/genai');
const env = require('./server/config/env');

async function testNewSDK() {
    const client = new GoogleGenAI({ apiKey: env.geminiApiKey });

    try {
        console.log('Testing generateContent...');
        const genResult = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: 'Say hello!',
        });
        console.log('Generate Result:', JSON.stringify(genResult, null, 2));
    } catch (err) {
        console.error('Generate Error:', err.message);
    }

    // Test 1: content string
    try {
        console.log('Testing embedContent (string)...');
        const embedResult = await client.models.embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text: "Hello world" }] },
        });
        console.log('Embed Result (explicit parts):', JSON.stringify(embedResult, null, 2));
    } catch (err) {
        console.error('Embed Error (explicit parts):', err.message);
    }

    // Test 2: contents array (original attempt that gave 404, might retry with different client version)
    // Skipped for now.

    // Test 3: text-embedding-004 with v1beta (default) gave 404. Let's try v1alpha.
    try {
        console.log('Testing text-embedding-004 (v1alpha)...');
        const clientAlpha = new GoogleGenAI({ apiKey: env.geminiApiKey, apiVersion: 'v1alpha' });
        const embedResult = await clientAlpha.models.embedContent({
            model: 'text-embedding-004',
            content: { role: "user", parts: [{ text: "Hello world" }] },
        });
        console.log('Embed Result (v1alpha):', JSON.stringify(embedResult, null, 2));
    } catch (err) {
        console.error('Embed Error (v1alpha):', err.message);
    }

    // Test 5: batchEmbedContents?
    // If the SDK supports it.
    try {
        if (client.models.batchEmbedContents) {
            console.log('Testing batchEmbedContents...');
            const batchResult = await client.models.batchEmbedContents({
                model: 'text-embedding-004',
                requests: [{ content: { parts: [{ text: "Hello" }] } }]
            });
            console.log('Batch Result:', JSON.stringify(batchResult, null, 2));
        } else {
            console.log('batchEmbedContents not found on client.models');
        }
    } catch (err) {
        console.error('Batch Error:', err.message);
    }

    // Test 6: embedContent with contents array (retry with correct structure maybe) 
    // Maybe "contents" property in embedContent IS required and must be array of parts? 
    // No, `contents` is for generation usually.

    // Test 8: Positional Arguments?
    try {
        console.log('Testing embedContent positional...');
        // Assuming maybe client.models.embedContent(model, content)
        // Wait, typical SDK methods are: method(params, options)

        // Let's try content string directly in params?
        const result = await client.models.embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text: "Hello" }] }
        });
        // Above failed with "Value must be a list...".

        // Let's try "contents" again?
        // Wait, look closely: "Value must be a list given an array path requests[]".
        // This means the API endpoint *demands* a list of requests.
        // This implies the endpoint IS batchEmbedContents.

        // If the SDK maps embedContent -> batchEmbedContents, then we must pass an array of items to embed?

        // Try passing an ARRAY to content?
        // client.models.embedContent({ model: ..., content: ["Hello"] }) ?
    } catch (err) {
        console.error('Positional Error:', err.message);
    }

    // Test 9: Trying to pass an array of parts to content?
    try {
        console.log('Testing embedContent with array content...');
        const result = await client.models.embedContent({
            model: 'text-embedding-004',
            content: [{ parts: [{ text: "Hello" }] }] // Array of contents?
        });
        console.log('Embed Result (array content):', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Embed Error (array content):', err.message);
    }

    // Test 10: Trying to pass just "contents" as the key, again, but ensure structure is correct for batch?
    try {
        console.log('Testing embedContent with contents key (batch-like)...');
        const result = await client.models.embedContent({
            model: 'text-embedding-004',
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log('Embed Result (contents key):', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Embed Error (contents key):', err.message);
    }
}
// Test 4: embedding-001 (older model, should work on default)
try {
    console.log('Testing embedding-001 (std)...');
    const embedResult = await client.models.embedContent({
        model: 'embedding-001',
        content: { role: "user", parts: [{ text: "Hello world" }] },
    });
    console.log('Embed Result (embedding-001):', JSON.stringify(embedResult, null, 2));
} catch (err) {
    console.error('Embed Error (embedding-001):', err.message);
}

// Test 7: embedContent with single content: { role: 'user', parts: [{ text: 'foo' }] }
// This failed with "Value must be a list given an array path requests[]".

// This error "requests[]" strongly suggests the endpoint hit was ...:batchEmbedContents
// Maybe text-embedding-004 maps to batch endpoint?

// Let's try passing "requests" directly to embedContent:
try {
    console.log('Testing embedContent with requests array...');
    const result = await client.models.embedContent({
        model: 'text-embedding-004',
        requests: [{ content: { parts: [{ text: "Hello" }] } }]
    });
    console.log('Embed Result (requests):', JSON.stringify(result, null, 2));
} catch (err) {
    console.error('Embed Error (requests):', err.message);
}

console.log('Embed Result (embedding-001):', JSON.stringify(embedResult, null, 2));


testNewSDK();
