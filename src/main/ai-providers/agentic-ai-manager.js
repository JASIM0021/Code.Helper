const { getSettings } = require('../utils/settings');
const openaiProvider = require('./openai');
const geminiProvider = require('./gemini');
const claudeProvider = require('./claude');
const ollamaProvider = require('./ollama');

/**
 * Agentic AI Manager with intelligent context-aware behaviors
 */
class AgenticAIManager {
    constructor() {
        this.currentState = 'idle'; // idle, thinking, generating
        this.contextHistory = [];
        this.thinkingSteps = [];
        this.codeExtractor = new CodeInstructionExtractor();
    }

    /**
     * Generate code using agentic AI with dual-state behavior
     * @param {string} prompt - User prompt
     * @param {string} code - Code context
     * @param {Object} context - Code analysis context
     * @param {Function} onThinking - Callback for thinking state updates
     * @param {Function} onGenerating - Callback for generating state updates
     * @returns {Promise<Object>} AI response
     */
    async generateCodeWithAgenticAI(prompt, code, context, onThinking, onGenerating) {
        const settings = getSettings();
        const apiKey = settings.apiKeys[settings.apiProvider];
        
        if (!apiKey && settings.apiProvider !== 'ollama') {
            throw new Error(`API key not configured for ${settings.apiProvider}. Please add your API key in settings.`);
        }

        try {
            // Phase 1: Thinking State
            await this.enterThinkingState(onThinking);
            
            // Analyze context and extract code/instructions
          const { codeBlocks, instructions } = this.codeExtractor.extractCodeAndInstructions(prompt);
            const enhancedContext = this.buildEnhancedContext(code, context, codeBlocks, instructions);
            
            // Generate thinking steps
            this.thinkingSteps = await this.generateThinkingSteps(enhancedContext, settings);
            await this.updateThinkingProgress(onThinking, this.thinkingSteps);

            // Phase 2: Generating State
            await this.enterGeneratingState(onGenerating);
            
            // Generate final response
            const response = await this.generateFinalResponse(enhancedContext, settings);
            
            // Return agentic response
            return {
                generated: response.content,
                provider: response.provider,
                usage: response.usage,
                thinkingSteps: this.thinkingSteps,
                agenticMetadata: {
                    contextAnalyzed: true,
                    codeBlocksExtracted: codeBlocks.length,
                    instructionsProcessed: instructions.length,
                    thinkingStepsCount: this.thinkingSteps.length
                }
            };

        } catch (error) {
            console.error('Agentic AI generation error:', error);
            throw error;
        } finally {
            this.currentState = 'idle';
        }
    }

    /**
     * Enter thinking state with introspection
     */
    async enterThinkingState(onThinking) {
        this.currentState = 'thinking';
        if (onThinking) {
            onThinking({
                state: 'thinking',
                message: '🤔 Analyzing your code and request...',
                progress: 0,
                steps: []
            });
        }
    }

    /**
     * Update thinking progress with step-by-step reasoning
     */
    async updateThinkingProgress(onThinking, steps) {
        for (let i = 0; i < steps.length; i++) {
            if (onThinking) {
                onThinking({
                    state: 'thinking',
                    message: steps[i].message,
                    progress: ((i + 1) / steps.length) * 100,
                    steps: steps.slice(0, i + 1)
                });
            }
            // Simulate thinking time
            await this.delay(800 + Math.random() * 400);
        }
    }

    /**
     * Enter generating state
     */
    async enterGeneratingState(onGenerating) {
        this.currentState = 'generating';
        if (onGenerating) {
            onGenerating({
                state: 'generating',
                message: '✨ Generating your solution...',
                progress: 0
            });
        }
    }

    /**
     * Generate thinking steps for agentic behavior
     */
    async generateThinkingSteps(context, settings) {
        const thinkingPrompt = `You are an intelligent coding assistant analyzing a user's request. 
        
Context:
- Language: ${context.language || 'Unknown'}
- Code Length: ${context.lines || 0} lines
- User Request: ${context.userRequest}
- Code Context: ${context.codePreview}

Please provide 3-5 thinking steps that show your analysis process. Each step should be:
1. Brief and clear
2. Show logical reasoning
3. Identify key aspects to address

Format as JSON array with objects containing: { "step": number, "message": "thinking step", "focus": "what this step addresses" }`;

        try {
            const response = await this.callAIProvider(thinkingPrompt, '', {}, settings);
            const steps = JSON.parse(response.generated);
            return steps.map((step, index) => ({
                step: index + 1,
                message: step.message,
                focus: step.focus
            }));
        } catch (error) {
            // Fallback thinking steps
            return [
                { step: 1, message: "🔍 Analyzing code structure and language patterns", focus: "code analysis" },
                { step: 2, message: "💭 Understanding user intent and requirements", focus: "requirement analysis" },
                { step: 3, message: "🎯 Identifying key areas for improvement", focus: "optimization planning" },
                { step: 4, message: "⚡ Preparing optimal solution approach", focus: "solution design" }
            ];
        }
    }

    /**
     * Build enhanced context with code/instruction separation
     */
    buildEnhancedContext(code, context, codeBlocks, instructions) {
        return {
            originalCode: code,
            language: context.language || 'Unknown',
            lines: context.lines || 0,
            characters: context.characters || 0,
            codeBlocks: codeBlocks,
            instructions: instructions,
            userRequest: instructions.join(' '),
            codePreview: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
            contextType: codeBlocks.length > 0 ? 'code_and_instructions' : 'instructions_only'
        };
    }

    /**
     * Generate final response with agentic behavior
     */
    async generateFinalResponse(context, settings) {
        const systemPrompt = `You are an expert software engineer and intelligent coding assistant with deep knowledge across all programming languages and frameworks. 

You have just completed a thorough analysis of the user's code and request. Now provide a comprehensive, production-ready solution.

Your Response Should Include:
1. Clear explanation of what you're doing
2. Well-formatted, commented code
3. Any important considerations or notes
4. Brief summary of improvements made

Code Context:
- Language: ${context.language}
- Lines: ${context.lines}
- User Request: ${context.userRequest}

Provide your response in a conversational, helpful tone as if you're pair programming with the user.`;

        const userPrompt = `**Code to work with:**\n\`\`\`${context.language}\n${context.originalCode}\n\`\`\`\n\n**User Request:** ${context.userRequest}\n\nPlease provide your solution with clear explanations and properly formatted code.`;

        return await this.callAIProvider(systemPrompt, userPrompt, context, settings);
    }

    /**
     * Call the appropriate AI provider
     */
    async callAIProvider(systemPrompt, userPrompt, context, settings) {
        switch (settings.apiProvider) {
            case 'openai':
                return await openaiProvider.generate(systemPrompt, userPrompt, context.originalCode, context, settings);
            case 'gemini':
                return await geminiProvider.generate(systemPrompt, userPrompt, context.originalCode, context, settings);
            case 'claude':
                return await claudeProvider.generate(systemPrompt, userPrompt, context.originalCode, context, settings);
            case 'ollama':
                return await ollamaProvider.generate(systemPrompt, userPrompt, context.originalCode, context, settings);
            default:
                throw new Error(`Unsupported AI provider: ${settings.apiProvider}`);
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current agentic state
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get thinking steps
     */
    getThinkingSteps() {
        return this.thinkingSteps;
    }
}

/**
 * Code and Instruction Extractor for intelligent separation
 */
class CodeInstructionExtractor {
    /**
     * Extract code blocks and natural language instructions from input
     */
    extractCodeAndInstructions(input) {
        const codeBlocks = [];
        const instructions = [];
        
        // Split input into lines
        const lines = input.split('\n');
        let inCodeBlock = false;
        let currentCodeBlock = '';
        let currentInstruction = '';
        
        for (const line of lines) {
            // Check for code block markers
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    // End of code block
                    if (currentCodeBlock.trim()) {
                        codeBlocks.push(currentCodeBlock.trim());
                    }
                    currentCodeBlock = '';
                    inCodeBlock = false;
                } else {
                    // Start of code block
                    inCodeBlock = true;
                    if (currentInstruction.trim()) {
                        instructions.push(currentInstruction.trim());
                        currentInstruction = '';
                    }
                }
                continue;
            }
            
            if (inCodeBlock) {
                currentCodeBlock += line + '\n';
            } else {
                // Check for code-like patterns in non-code blocks
                if (this.isCodeLike(line)) {
                    if (currentInstruction.trim()) {
                        instructions.push(currentInstruction.trim());
                        currentInstruction = '';
                    }
                    codeBlocks.push(line);
                } else {
                    currentInstruction += line + '\n';
                }
            }
        }
        
        // Handle any remaining content
        if (currentCodeBlock.trim()) {
            codeBlocks.push(currentCodeBlock.trim());
        }
        if (currentInstruction.trim()) {
            instructions.push(currentInstruction.trim());
        }
        
        return {
            codeBlocks: codeBlocks.filter(block => block.trim()),
            instructions: instructions.filter(instruction => instruction.trim())
        };
    }
    
    /**
     * Detect if a line looks like code
     */
    isCodeLike(line) {
        const codePatterns = [
            /^\s*(function|class|const|let|var|if|for|while|switch|try|catch|import|export|return|console\.|require\(|import\s+)/,
            /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]\s*/,
            /^\s*[{}()[\]<>]\s*$/,
            /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/,
            /^\s*\/\/|\/\*|\*/,
            /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\.\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/
        ];
        
        return codePatterns.some(pattern => pattern.test(line.trim()));
    }
}

// Create singleton instance
const agenticAIManager = new AgenticAIManager();

module.exports = {
    generateCodeWithAgenticAI: (prompt, code, context, onThinking, onGenerating) => 
        agenticAIManager.generateCodeWithAgenticAI(prompt, code, context, onThinking, onGenerating),
    getCurrentState: () => agenticAIManager.getCurrentState(),
    getThinkingSteps: () => agenticAIManager.getThinkingSteps(),
    AgenticAIManager,
    CodeInstructionExtractor
}; 