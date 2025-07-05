const https = require('https');

/**
 * Generate code using Anthropic Claude API
 * @param {string} systemPrompt - System prompt
 * @param {string} prompt - User prompt
 * @param {string} code - Code context
 * @param {Object} context - Code analysis context
 * @param {Object} settings - Application settings
 * @returns {Promise<Object>} AI response
 */
async function generate(systemPrompt, prompt, code, context, settings) {
    const data = JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: settings.temperature || 0.7,
        messages: [{
            role: 'user',
            content: `${systemPrompt}\n\n**Code Context:**\n\`\`\`${context.language || ''}\n${code}\n\`\`\`\n\n**User Request:** ${prompt}`
        }]
    });

    const options = {
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKeys.claude,
            'anthropic-version': '2023-06-01',
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
                            generated: response.content[0].text,
                            provider: 'Anthropic Claude'
                        });
                    }
                } catch (error) {
                    reject(new Error('Failed to parse Claude response: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('Claude API request failed: ' + error.message));
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    generate
};
