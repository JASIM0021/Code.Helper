const { clipboard, screen } = require('electron');

/**
 * Context-Aware Code Selection System
 * Provides intelligent code detection and context registration
 */
class ContextAwareSelector {
    constructor() {
        this.selectedCode = '';
        this.codeContext = {};
        this.selectionHistory = [];
        this.isListening = false;
        this.lastSelectionTime = 0;
        this.selectionTimeout = null;
    }

    /**
     * Initialize context-aware selection
     */
    initialize() {
        this.startListening();
        console.log('Context-aware code selection initialized');
    }

    /**
     * Start listening for code selection events
     */
    startListening() {
        if (this.isListening) return;
        
        this.isListening = true;
        
        // Monitor clipboard for changes (when user copies code)
        this.monitorClipboardChanges();
        
        // Monitor for global shortcuts that might indicate code selection
        this.monitorGlobalShortcuts();
        
        console.log('Context-aware selection listening started');
    }

    /**
     * Stop listening for selection events
     */
    stopListening() {
        this.isListening = false;
        if (this.selectionTimeout) {
            clearTimeout(this.selectionTimeout);
            this.selectionTimeout = null;
        }
        console.log('Context-aware selection listening stopped');
    }

    /**
     * Monitor clipboard changes for code selection
     */
    monitorClipboardChanges() {
        let lastClipboardContent = clipboard.readText();
        
        const checkClipboard = () => {
            if (!this.isListening) return;
            
            const currentContent = clipboard.readText();
            
            if (currentContent !== lastClipboardContent && this.isCodeContent(currentContent)) {
                this.handleCodeSelection(currentContent);
                lastClipboardContent = currentContent;
            }
            
            // Continue monitoring
            setTimeout(checkClipboard, 500);
        };
        
        checkClipboard();
    }

    /**
     * Monitor global shortcuts for selection indicators
     */
    monitorGlobalShortcuts() {
        // This would integrate with the existing shortcut system
        // For now, we'll use clipboard monitoring as the primary method
    }

    /**
     * Handle detected code selection
     * @param {string} code - Selected code content
     */
    handleCodeSelection(code) {
        const now = Date.now();
        
        // Prevent rapid-fire selections
        if (now - this.lastSelectionTime < 1000) {
            return;
        }
        
        this.lastSelectionTime = now;
        
        // Analyze the selected code
        const analysis = this.analyzeSelectedCode(code);
        
        // Store in selection history
        this.selectionHistory.unshift({
            code: code,
            context: analysis,
            timestamp: now
        });
        
        // Keep only last 10 selections
        if (this.selectionHistory.length > 10) {
            this.selectionHistory.pop();
        }
        
        // Update current selection
        this.selectedCode = code;
        this.codeContext = analysis;
        
        console.log('Code selection detected:', {
            language: analysis.language,
            lines: analysis.lines,
            characters: analysis.characters
        });
        
        // Emit selection event
        this.emitSelectionEvent(code, analysis);
    }

    /**
     * Analyze selected code for context
     * @param {string} code - Code to analyze
     * @returns {Object} Analysis result
     */
    analyzeSelectedCode(code) {
        const lines = code.split('\n');
        const characters = code.length;
        
        // Detect language based on content patterns
        const language = this.detectLanguage(code);
        
        // Analyze code structure
        const structure = this.analyzeCodeStructure(code);
        
        return {
            language: language,
            lines: lines.length,
            characters: characters,
            structure: structure,
            hasComments: this.hasComments(code),
            hasFunctions: this.hasFunctions(code),
            hasClasses: this.hasClasses(code),
            complexity: this.calculateComplexity(code),
            timestamp: Date.now()
        };
    }

    /**
     * Detect programming language from code content
     * @param {string} code - Code to analyze
     * @returns {string} Detected language
     */
    detectLanguage(code) {
        const patterns = {
            javascript: [
                /function\s+\w+\s*\(/,
                /const\s+|let\s+|var\s+/,
                /console\.log/,
                /require\(|import\s+/,
                /export\s+/,
                /=>\s*{/,
                /\.js$/,
                /document\.|window\./
            ],
            python: [
                /def\s+\w+\s*\(/,
                /import\s+/,
                /from\s+\w+\s+import/,
                /class\s+\w+/,
                /if\s+__name__\s*==\s*['"]__main__['"]/,
                /\.py$/,
                /print\s*\(/,
                /self\./
            ],
            java: [
                /public\s+class/,
                /public\s+static\s+void\s+main/,
                /import\s+java\./,
                /System\.out\.println/,
                /\.java$/,
                /private\s+|protected\s+|public\s+/
            ],
            cpp: [
                /#include\s+<[^>]+>/,
                /int\s+main\s*\(/,
                /std::/,
                /cout\s*<<|cin\s*>>/,
                /\.cpp$|\.h$/,
                /namespace\s+/
            ],
            csharp: [
                /using\s+System/,
                /namespace\s+/,
                /public\s+class/,
                /Console\.WriteLine/,
                /\.cs$/,
                /var\s+|string\s+|int\s+/
            ],
            typescript: [
                /interface\s+\w+/,
                /type\s+\w+/,
                /:\s*\w+[\[\]]?/,
                /\.ts$/,
                /import\s+type/,
                /as\s+const/
            ],
            html: [
                /<!DOCTYPE\s+html>/,
                /<html/,
                /<head/,
                /<body/,
                /<div/,
                /<script/,
                /<style/,
                /\.html$|\.htm$/
            ],
            css: [
                /{[^}]*}/,
                /:\s*[^;]+;/,
                /@media/,
                /@keyframes/,
                /\.css$/,
                /color:|background:|margin:|padding:/
            ],
            sql: [
                /SELECT\s+.+FROM/,
                /INSERT\s+INTO/,
                /UPDATE\s+\w+\s+SET/,
                /DELETE\s+FROM/,
                /CREATE\s+TABLE/,
                /\.sql$/
            ],
            php: [
                /<\?php/,
                /echo\s+/,
                /function\s+\w+\s*\(/,
                /\$\w+/,
                /\.php$/,
                /require_once|include_once/
            ]
        };
        
        for (const [language, languagePatterns] of Object.entries(patterns)) {
            const matchCount = languagePatterns.filter(pattern => pattern.test(code)).length;
            if (matchCount >= 2) {
                return language;
            }
        }
        
        return 'unknown';
    }

    /**
     * Analyze code structure
     * @param {string} code - Code to analyze
     * @returns {Object} Structure analysis
     */
    analyzeCodeStructure(code) {
        const lines = code.split('\n');
        
        return {
            indentationLevel: this.getAverageIndentation(lines),
            hasNestedBlocks: this.hasNestedBlocks(code),
            functionCount: this.countFunctions(code),
            classCount: this.countClasses(code),
            commentRatio: this.getCommentRatio(code),
            lineLengths: this.getLineLengths(lines)
        };
    }

    /**
     * Check if content looks like code
     * @param {string} content - Content to check
     * @returns {boolean} Whether content is code-like
     */
    isCodeContent(content) {
        if (!content || content.length < 10) return false;
        
        const codeIndicators = [
            /function\s+\w+/,
            /class\s+\w+/,
            /const\s+|let\s+|var\s+/,
            /import\s+|export\s+/,
            /def\s+\w+/,
            /public\s+class/,
            /#include/,
            /using\s+System/,
            /<!DOCTYPE/,
            /SELECT\s+.+FROM/,
            /<\?php/,
            /console\.log/,
            /print\s*\(/,
            /System\.out\.println/,
            /std::cout/,
            /Console\.WriteLine/,
            /echo\s+/,
            /{[^}]*}/,
            /\([^)]*\)/,
            /[;{}()[\]<>]/
        ];
        
        const matchCount = codeIndicators.filter(pattern => pattern.test(content)).length;
        return matchCount >= 2;
    }

    /**
     * Get current selected code
     * @returns {string} Selected code
     */
    getSelectedCode() {
        return this.selectedCode;
    }

    /**
     * Get current code context
     * @returns {Object} Code context
     */
    getCodeContext() {
        return this.codeContext;
    }

    /**
     * Get selection history
     * @returns {Array} Selection history
     */
    getSelectionHistory() {
        return this.selectionHistory;
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.selectedCode = '';
        this.codeContext = {};
    }

    /**
     * Emit selection event for other components
     * @param {string} code - Selected code
     * @param {Object} context - Code context
     */
    emitSelectionEvent(code, context) {
        // This would integrate with the event system
        // For now, we'll use a simple callback approach
        if (this.onSelectionCallback) {
            this.onSelectionCallback(code, context);
        }
    }

    /**
     * Set selection callback
     * @param {Function} callback - Callback function
     */
    setSelectionCallback(callback) {
        this.onSelectionCallback = callback;
    }

    // Helper methods for code analysis
    hasComments(code) {
        return /\/\/|\/\*|\*/.test(code);
    }

    hasFunctions(code) {
        return /function\s+\w+|def\s+\w+|public\s+static\s+void/.test(code);
    }

    hasClasses(code) {
        return /class\s+\w+|public\s+class/.test(code);
    }

    calculateComplexity(code) {
        const lines = code.split('\n');
        const complexity = lines.length * 0.1;
        return Math.min(complexity, 10); // Cap at 10
    }

    getAverageIndentation(lines) {
        const indentations = lines
            .filter(line => line.trim())
            .map(line => line.length - line.trimStart().length);
        return indentations.length > 0 ? indentations.reduce((a, b) => a + b, 0) / indentations.length : 0;
    }

    hasNestedBlocks(code) {
        return /{[^{}]*{[^{}]*}/.test(code);
    }

    countFunctions(code) {
        return (code.match(/function\s+\w+|def\s+\w+/g) || []).length;
    }

    countClasses(code) {
        return (code.match(/class\s+\w+/g) || []).length;
    }

    getCommentRatio(code) {
        const lines = code.split('\n');
        const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*'));
        return lines.length > 0 ? commentLines.length / lines.length : 0;
    }

    getLineLengths(lines) {
        return lines.map(line => line.length);
    }
}

// Create singleton instance
const contextAwareSelector = new ContextAwareSelector();

module.exports = {
    initialize: () => contextAwareSelector.initialize(),
    getSelectedCode: () => contextAwareSelector.getSelectedCode(),
    getCodeContext: () => contextAwareSelector.getCodeContext(),
    getSelectionHistory: () => contextAwareSelector.getSelectionHistory(),
    clearSelection: () => contextAwareSelector.clearSelection(),
    setSelectionCallback: (callback) => contextAwareSelector.setSelectionCallback(callback),
    stopListening: () => contextAwareSelector.stopListening(),
    ContextAwareSelector
}; 