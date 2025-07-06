const { getSettings } = require('../utils/settings');
const openaiProvider = require('./openai');
const geminiProvider = require('./gemini');
const claudeProvider = require('./claude');
const ollamaProvider = require('./ollama');

/**
 * Generate code using AI with agentic logic
 * @param {string} prompt - User prompt
 * @param {string} code - Code context
 * @param {Object} context - Code analysis context
 * @returns {Promise<Object>} AI response
 */
async function generateCodeWithAI(prompt, code, context) {
    const settings = getSettings();
    const apiKey = settings.apiKeys[settings.apiProvider];
    
    if (!apiKey && settings.apiProvider !== 'ollama') {
        throw new Error(`API key not configured for ${settings.apiProvider}. Please add your API key in settings.`);
    }

    const systemPrompt = `You are an expert software engineer and code assistant with deep knowledge across all programming languages and frameworks. Analyze the provided code context and user request to provide the most helpful response.

Code Context:
- Language: ${context.language || 'Unknown'}
- Lines: ${context.lines || 0}
- Characters: ${context.characters || 0}

Your Capabilities:
1. Code Generation: Create new code from scratch
2. Code Optimization: Improve performance and readability
3. Bug Fixing: Identify and fix issues
4. Refactoring: Modernize and restructure code
5. Documentation: Add comments and explanations
6. Testing: Generate unit tests
7. Security: Identify vulnerabilities
8. Best Practices: Apply industry standards

Instructions:
- Provide clean, production-ready code
- Include explanatory comments when helpful
- Follow language-specific best practices and conventions
- Consider performance, security, and maintainability
- If making changes, briefly explain the improvements
- Format code properly with consistent indentation
- Use modern language features when appropriate`;

    try {
        switch (settings.apiProvider) {
            case 'openai':
                return await openaiProvider.generate(systemPrompt, prompt, code, context, settings);
            case 'gemini':
                return await geminiProvider.generate(systemPrompt, prompt, code, context, settings);
            case 'claude':
                return await claudeProvider.generate(systemPrompt, prompt, code, context, settings);
            case 'ollama':
                return await ollamaProvider.generate(systemPrompt, prompt, code, context, settings);
            default:
                throw new Error(`Unsupported AI provider: ${settings.apiProvider}`);
        }
    } catch (error) {
        console.error('AI generation error:', error);
        throw error;
    }
}

/**
 * Test API connection for a specific provider
 * @param {string} provider - AI provider name
 * @param {string} apiKey - API key to test
 * @returns {Promise<boolean>} Whether connection is successful
 */
async function testConnection(provider, apiKey) {
    const testCode = 'console.log("Hello, World!");';
    const testPrompt = 'Explain this code';
    const testContext = { language: 'javascript', lines: 1, characters: testCode.length };
    
    const tempSettings = {
        apiProvider: provider,
        apiKeys: { [provider]: apiKey },
        model: 'gpt-3.5-turbo',
        temperature: 0.7
    };

    try {
        switch (provider) {
            case 'openai':
                await openaiProvider.generate('You are a helpful assistant.', testPrompt, testCode, testContext, tempSettings);
                break;
            case 'gemini':
                await geminiProvider.generate('You are a helpful assistant.', testPrompt, testCode, testContext, tempSettings);
                break;
            case 'claude':
                await claudeProvider.generate('You are a helpful assistant.', testPrompt, testCode, testContext, tempSettings);
                break;
            case 'ollama':
                await ollamaProvider.generate('You are a helpful assistant.', testPrompt, testCode, testContext, tempSettings);
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
        return true;
    } catch (error) {
        console.error(`Connection test failed for ${provider}:`, error.message);
        return false;
    }
}

module.exports = {
    generateCodeWithAI,
    testConnection
};
