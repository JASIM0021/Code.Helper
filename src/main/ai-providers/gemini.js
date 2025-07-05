const https = require('https');

/**
 * Generate code using Google Gemini API
 * @param {string} systemPrompt - System prompt
 * @param {string} prompt - User prompt
 * @param {string} code - Code context
 * @param {Object} context - Code analysis context
 * @param {Object} settings - Application settings
 * @returns {Promise<Object>} AI response
 */
async function generate(systemPrompt, prompt, code, context, settings) {
    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: `**Context Details:**\n- Language: ${context.language || 'Unknown'}\n- Lines: ${context.lines || 0}\n- Characters: ${context.characters || 0}\n\n**User Request:** ${prompt}\n\n**Code Context:**\n\`\`\`${context.language || ''}\n${code}\n\`\`\`\n${systemPrompt}`
            }]
        }],
        generationConfig: {
            temperature: settings.temperature || 0.7,
            maxOutputTokens: 2000
        }
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/${settings.model}:generateContent?key=${settings.apiKeys.gemini}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
              responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve({
                            generated: response.candidates[0].content.parts[0].text,
                            provider: 'Google Gemini'
                        });
                    }
                } catch (error) {
                    reject(new Error('Failed to parse Gemini response: ' + error.message));
                }
            });
        });
      

        req.on('error', (error) => {
            reject(new Error('Gemini API request failed: ' + error.message));
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    generate
};
