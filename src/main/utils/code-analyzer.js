/**
 * Analyze code and provide suggestions
 * @param {string} code - Code to analyze
 * @returns {Object} Analysis results
 */
const hljs = require('highlight.js/lib/core');
const javascript = require('highlight.js/lib/languages/javascript');
const swift = require('highlight.js/lib/languages/swift');
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('swift', swift);


function analyzeCode(code) {
    // Basic code analysis
    const analysis = {
        language: detectLanguage(code),
        lines: code.split('\n').length,
        characters: code.length,
        suggestions: [],
        errors: [],
        improvements: []
    };

    // Language-specific analysis
    switch (analysis.language) {
        case 'javascript':
            analysis.suggestions = analyzeJavaScript(code);
            break;
        case 'python':
            analysis.suggestions = analyzePython(code);
            break;
        case 'java':
            analysis.suggestions = analyzeJava(code);
            break;
        case 'cpp':
            analysis.suggestions = analyzeCpp(code);
            break;
        default:
            analysis.suggestions = analyzeGeneric(code);
    }

    return analysis;
}

/**
 * Detect programming language from code
 * @param {string} code - Code to analyze
 * @returns {string} Detected language
 */

function detectLanguage(code) {
  const res = hljs.highlightAuto(code);
  return res.language || 'text';
}
// function detectLanguage(code) {
//     const patterns = {
//         javascript: /(?:function|const|let|var|=>|console\.log|require|module\.exports)/,
//         python: /(?:def |import |from |print\(|if __name__|class |:$)/m,
//         java: /(?:public class|public static void|System\.out\.println|import java\.)/,
//         cpp: /(?:#include|using namespace|int main\(|std::cout|std::cin)/,
//         css: /(?:\{[^}]*\}|@media|@import|@keyframes)/,
//         html: /(?:<html|<body|<div|<span|<p>|<!DOCTYPE)/,
//         sql: /(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i,
//         json: /^\s*[\{\[]/
//     };

//     for (const [lang, pattern] of Object.entries(patterns)) {
//         if (pattern.test(code)) {
//             return lang;
//         }
//     }
//     return 'text';
// }

/**
 * Analyze JavaScript code
 * @param {string} code - JavaScript code
 * @returns {Array} Suggestions array
 */
function analyzeJavaScript(code) {
    const suggestions = [];
    
    // Check for common improvements
    if (code.includes('var ')) {
        suggestions.push({
            type: 'improvement',
            message: 'Consider using const or let instead of var',
            line: code.split('\n').findIndex(line => line.includes('var ')) + 1
        });
    }
    
    if (code.includes('== ') || code.includes('!= ')) {
        suggestions.push({
            type: 'improvement',
            message: 'Consider using strict equality (=== or !==) instead of loose equality',
            line: code.split('\n').findIndex(line => line.includes('== ') || line.includes('!= ')) + 1
        });
    }
    
    if (code.includes('console.log')) {
        suggestions.push({
            type: 'warning',
            message: 'Remove console.log statements before production',
            line: code.split('\n').findIndex(line => line.includes('console.log')) + 1
        });
    }
    
    return suggestions;
}

/**
 * Analyze Python code
 * @param {string} code - Python code
 * @returns {Array} Suggestions array
 */
function analyzePython(code) {
    const suggestions = [];
    
    // Check for common Python improvements
    if (code.includes('print ')) {
        suggestions.push({
            type: 'improvement',
            message: 'Use print() function instead of print statement (Python 3)',
            line: code.split('\n').findIndex(line => line.includes('print ')) + 1
        });
    }
    
    if (code.match(/^\s*import \*/m)) {
        suggestions.push({
            type: 'improvement',
            message: 'Avoid using wildcard imports (import *)',
            line: code.split('\n').findIndex(line => line.match(/^\s*import \*/)) + 1
        });
    }
    
    return suggestions;
}

/**
 * Analyze Java code
 * @param {string} code - Java code
 * @returns {Array} Suggestions array
 */
function analyzeJava(code) {
    const suggestions = [];
    
    if (code.includes('System.out.println')) {
        suggestions.push({
            type: 'improvement',
            message: 'Consider using a proper logging framework instead of System.out.println',
            line: code.split('\n').findIndex(line => line.includes('System.out.println')) + 1
        });
    }
    
    return suggestions;
}

/**
 * Analyze C++ code
 * @param {string} code - C++ code
 * @returns {Array} Suggestions array
 */
function analyzeCpp(code) {
    const suggestions = [];
    
    if (code.includes('using namespace std;')) {
        suggestions.push({
            type: 'improvement',
            message: 'Consider avoiding "using namespace std;" in header files',
            line: code.split('\n').findIndex(line => line.includes('using namespace std;')) + 1
        });
    }
    
    return suggestions;
}

/**
 * Analyze generic code
 * @param {string} code - Generic code
 * @returns {Array} Suggestions array
 */
function analyzeGeneric(code) {
    const suggestions = [];
    
    // Generic suggestions
    const lines = code.split('\n');
    lines.forEach((line, index) => {
        if (line.length > 120) {
            suggestions.push({
                type: 'improvement',
                message: 'Consider breaking long lines for better readability',
                line: index + 1
            });
        }
        
        if (line.includes('TODO') || line.includes('FIXME')) {
            suggestions.push({
                type: 'warning',
                message: 'TODO/FIXME comment found',
                line: index + 1
            });
        }
    });
    
    return suggestions;
}

module.exports = {
    analyzeCode,
    detectLanguage,
    analyzeJavaScript,
    analyzePython,
    analyzeJava,
    analyzeCpp,
    analyzeGeneric
};
