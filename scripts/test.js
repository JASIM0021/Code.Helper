#!/usr/bin/env node

/**
 * Unit Test Script for Code Helper
 * Tests all modules independently to ensure proper functionality
 */

const path = require('path');
const fs = require('fs');

// Test colors for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            this.log(`✅ ${message}`, 'green');
            this.results.push({ status: 'PASS', message });
        } else {
            this.failed++;
            this.log(`❌ ${message}`, 'red');
            this.results.push({ status: 'FAIL', message });
        }
    }

    async runTest(testName, testFunction) {
        try {
            this.log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`, 'blue');
            await testFunction();
        } catch (error) {
            this.failed++;
            this.log(`❌ Error in ${testName}: ${error.message}`, 'red');
            this.results.push({ status: 'ERROR', message: `${testName}: ${error.message}` });
        }
    }

    printSummary() {
        this.log(`\n${'='.repeat(50)}`, 'blue');
        this.log(`${colors.bold}TEST SUMMARY${colors.reset}`, 'blue');
        this.log(`${'='.repeat(50)}`, 'blue');
        this.log(`Total Tests: ${this.passed + this.failed}`);
        this.log(`Passed: ${this.passed}`, 'green');
        this.log(`Failed: ${this.failed}`, this.failed > 0 ? 'red' : 'green');
        this.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        
        if (this.failed > 0) {
            this.log(`\n${colors.bold}FAILED TESTS:${colors.reset}`, 'red');
            this.results
                .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
                .forEach(r => this.log(`  - ${r.message}`, 'red'));
        }
    }
}

// Test Utilities
async function testModuleExists(modulePath, name) {
    const fullPath = path.join(__dirname, '..', modulePath);
    const exists = fs.existsSync(fullPath);
    return { exists, path: fullPath, name };
}

async function testModuleImport(modulePath, name) {
    try {
        const fullPath = path.join(__dirname, '..', modulePath);
        const module = require(fullPath);
        return { success: true, module, name };
    } catch (error) {
        return { success: false, error: error.message, name };
    }
}

// Main Test Function
async function runTests() {
    const runner = new TestRunner();
    
    runner.log(`${colors.bold}🚀 Code Helper - Unit Test Suite${colors.reset}`, 'blue');
    runner.log(`${'='.repeat(50)}`, 'blue');

    // Test 1: File Structure
    await runner.runTest('File Structure', async () => {
        const requiredFiles = [
            'src/main/main.js',
            'src/main/utils/settings.js',
            'src/main/utils/shortcuts.js',
            'src/main/utils/code-analyzer.js',
            'src/main/windows/window-manager.js',
            'src/main/ipc/ipc-handlers.js',
            'src/main/ai-providers/ai-manager.js',
            'src/main/ai-providers/openai.js',
            'src/main/ai-providers/gemini.js',
            'src/main/ai-providers/claude.js',
            'src/main/ai-providers/ollama.js',
            'src/renderer/pages/overlay.html',
            'src/renderer/pages/settings.html',
            'package.json'
        ];

        for (const file of requiredFiles) {
            const result = await testModuleExists(file, file);
            runner.assert(result.exists, `File exists: ${file}`);
        }
    });

    // Test 2: Module Imports
    await runner.runTest('Module Imports', async () => {
        const modules = [
            'src/main/utils/settings.js',
            'src/main/utils/shortcuts.js',
            'src/main/utils/code-analyzer.js',
            'src/main/ai-providers/ai-manager.js',
            'src/main/ai-providers/openai.js',
            'src/main/ai-providers/gemini.js',
            'src/main/ai-providers/claude.js',
            'src/main/ai-providers/ollama.js'
        ];

        for (const modulePath of modules) {
            const result = await testModuleImport(modulePath, modulePath);
            runner.assert(result.success, `Module imports: ${modulePath}`);
            if (!result.success) {
                runner.log(`  Error: ${result.error}`, 'red');
            }
        }
    });

    // Test 3: Settings Module
    await runner.runTest('Settings Module', async () => {
        const { loadSettings, saveSettings, getSettings, DEFAULT_SETTINGS } = require('../src/main/utils/settings');
        
        runner.assert(typeof loadSettings === 'function', 'loadSettings function exists');
        runner.assert(typeof saveSettings === 'function', 'saveSettings function exists');
        runner.assert(typeof getSettings === 'function', 'getSettings function exists');
        runner.assert(typeof DEFAULT_SETTINGS === 'object', 'DEFAULT_SETTINGS object exists');
        
        // Test default settings structure
        const settings = getSettings();
        runner.assert(settings.hasOwnProperty('overlayPosition'), 'Settings has overlayPosition');
        runner.assert(settings.hasOwnProperty('apiKeys'), 'Settings has apiKeys');
        runner.assert(settings.hasOwnProperty('apiProvider'), 'Settings has apiProvider');
        runner.assert(settings.hasOwnProperty('shortcuts'), 'Settings has shortcuts');
    });

    // Test 4: Code Analyzer
    await runner.runTest('Code Analyzer', async () => {
        const { analyzeCode, detectLanguage } = require('../src/main/utils/code-analyzer');
        
        runner.assert(typeof analyzeCode === 'function', 'analyzeCode function exists');
        runner.assert(typeof detectLanguage === 'function', 'detectLanguage function exists');
        
        // Test language detection
        const jsCode = 'const x = 5; console.log(x);';
        const pythonCode = 'def hello():\n    print("Hello")';
        const javaCode = 'public class Test { public static void main() {} }';
        
        runner.assert(detectLanguage(jsCode) === 'javascript', 'Detects JavaScript');
        runner.assert(detectLanguage(pythonCode) === 'python', 'Detects Python');
        runner.assert(detectLanguage(javaCode) === 'java', 'Detects Java');
        
        // Test code analysis
        const analysis = analyzeCode(jsCode);
        runner.assert(typeof analysis === 'object', 'analyzeCode returns object');
        runner.assert(analysis.hasOwnProperty('language'), 'Analysis has language');
        runner.assert(analysis.hasOwnProperty('lines'), 'Analysis has lines');
        runner.assert(analysis.hasOwnProperty('suggestions'), 'Analysis has suggestions');
    });

    // Test 5: AI Providers
    await runner.runTest('AI Providers', async () => {
        const aiManager = require('../src/main/ai-providers/ai-manager');
        const openai = require('../src/main/ai-providers/openai');
        const gemini = require('../src/main/ai-providers/gemini');
        const claude = require('../src/main/ai-providers/claude');
        const ollama = require('../src/main/ai-providers/ollama');
        
        runner.assert(typeof aiManager.generateCodeWithAI === 'function', 'AI Manager has generateCodeWithAI');
        runner.assert(typeof aiManager.testConnection === 'function', 'AI Manager has testConnection');
        
        runner.assert(typeof openai.generate === 'function', 'OpenAI provider has generate function');
        runner.assert(typeof gemini.generate === 'function', 'Gemini provider has generate function');
        runner.assert(typeof claude.generate === 'function', 'Claude provider has generate function');
        runner.assert(typeof ollama.generate === 'function', 'Ollama provider has generate function');
    });

    // Test 6: Package.json Configuration
    await runner.runTest('Package Configuration', async () => {
        const packageJson = require('../package.json');
        
        runner.assert(packageJson.main === './src/main/main.js', 'Main entry point is correct');
        runner.assert(packageJson.scripts.start === 'electron .', 'Start script exists');
        runner.assert(packageJson.scripts.test === 'node scripts/test.js', 'Test script is configured');
        runner.assert(packageJson.devDependencies.electron, 'Electron dependency exists');
    });

    // Test 7: HTML Files
    await runner.runTest('HTML Files', async () => {
        const overlayPath = path.join(__dirname, '..', 'src/renderer/pages/overlay.html');
        const settingsPath = path.join(__dirname, '..', 'src/renderer/pages/settings.html');
        
        const overlayExists = fs.existsSync(overlayPath);
        const settingsExists = fs.existsSync(settingsPath);
        
        runner.assert(overlayExists, 'Overlay HTML file exists');
        runner.assert(settingsExists, 'Settings HTML file exists');
        
        if (overlayExists) {
            const overlayContent = fs.readFileSync(overlayPath, 'utf8');
            runner.assert(overlayContent.includes('overlay-container'), 'Overlay has main container');
            runner.assert(overlayContent.includes('ipcRenderer'), 'Overlay has IPC communication');
        }
        
        if (settingsExists) {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            runner.assert(settingsContent.includes('tab-container'), 'Settings has tab container');
            runner.assert(settingsContent.includes('api-provider'), 'Settings has API provider selection');
        }
    });

    // Print test summary
    runner.printSummary();
    
    // Exit with appropriate code
    process.exit(runner.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = { runTests, TestRunner };
