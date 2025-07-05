const https = require('https');

/**
 * Generate code using OpenAI API
 * @param {string} systemPrompt - System prompt
 * @param {string} prompt - User prompt
 * @param {string} code - Code context
 * @param {Object} context - Code analysis context
 * @param {Object} settings - Application settings
 * @returns {Promise<Object>} AI response
 */
async function generate(systemPrompt, prompt, code, context, settings) {
    const messages = [
        { role: 'system', content: systemPrompt },
        { 
            role: 'user', 
            content: `**Code to analyze:**\n\`\`\`${context.language || ''}\n${code}\n\`\`\`\n\n**User Request:** ${prompt}\n\nPlease provide your response with clear explanations and properly formatted code.`
        }
    ];

    const data = JSON.stringify({
        model: settings.model || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 2000,
        temperature: settings.temperature || 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKeys.openai}`,
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
                        const modelName = settings.model === 'gpt-4' ? 'GPT-4' : 'GPT-3.5';
                        resolve({
                            generated: response.choices[0].message.content,
                            provider: `OpenAI ${modelName}`,
                            usage: response.usage
                        });
                    }
                } catch (error) {
                    reject(new Error('Failed to parse OpenAI response: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('OpenAI API request failed: ' + error.message));
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    generate
};
