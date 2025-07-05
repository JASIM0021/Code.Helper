const http = require('http');

/**
 * Generate code using Ollama (Local AI)
 * @param {string} systemPrompt - System prompt
 * @param {string} prompt - User prompt
 * @param {string} code - Code context
 * @param {Object} context - Code analysis context
 * @param {Object} settings - Application settings
 * @returns {Promise<Object>} AI response
 */
async function generate(systemPrompt, prompt, code, context, settings) {
    const data = JSON.stringify({
        model: 'codellama:latest',
        prompt: `${systemPrompt}\n\nCode Context (${context.language || 'Unknown'}):\n\`\`\`\n${code}\n\`\`\`\n\nUser Request: ${prompt}\n\nResponse:`,
        stream: false,
        options: {
            temperature: settings.temperature || 0.7,
            num_predict: 1000
        }
    });

    const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve({
                            generated: response.response,
                            provider: 'Ollama (Local)'
                        });
                    }
                } catch (error) {
                    reject(new Error('Failed to parse Ollama response: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('Ollama connection failed. Make sure Ollama is running locally: ' + error.message));
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    generate
};
