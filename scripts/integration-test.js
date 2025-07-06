#!/usr/bin/env node

/**
 * Integration Test Script for Code Helper
 * Tests the full application workflow and component integration
 */

const { spawn } = require('child_process');
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

class IntegrationTestRunner {
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

    async runIntegrationTest(testName, testFunction) {
        try {
            this.log(`\n${colors.bold}🔄 Integration Test: ${testName}${colors.reset}`, 'blue');
            await testFunction();
        } catch (error) {
            this.failed++;
            this.log(`❌ Error in ${testName}: ${error.message}`, 'red');
            this.results.push({ status: 'ERROR', message: `${testName}: ${error.message}` });
        }
    }

    printSummary() {
        this.log(`\n${'='.repeat(60)}`, 'blue');
        this.log(`${colors.bold}INTEGRATION TEST SUMMARY${colors.reset}`, 'blue');
        this.log(`${'='.repeat(60)}`, 'blue');
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

// Utility Functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runElectronApp(timeout = 10000) {
    return new Promise((resolve, reject) => {
        const appPath = path.join(__dirname, '..');
        const electronProcess = spawn('npm', ['start'], { 
            cwd: appPath,
            stdio: 'pipe'
        });

        let output = '';
        let hasStarted = false;

        electronProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Code Helper initialized successfully') || 
                output.includes('ready-to-show')) {
                hasStarted = true;
            }
        });

        electronProcess.stderr.on('data', (data) => {
            output += data.toString();
        });

        // Set timeout
        const timer = setTimeout(() => {
            if (!hasStarted) {
                electronProcess.kill();
                reject(new Error('App failed to start within timeout'));
            }
        }, timeout);

        electronProcess.on('close', (code) => {
            clearTimeout(timer);
            resolve({ code, output, hasStarted });
        });

        // Kill after timeout regardless
        setTimeout(() => {
            electronProcess.kill();
            resolve({ code: 0, output, hasStarted });
        }, timeout);
    });
}

// Test Configurations and Sample Data
const testData = {
    sampleJavaScript: `function calculateSum(a, b) {
    var result = a + b;
    console.log("Sum is: " + result);
    return result;
}`,
    samplePython: `def process_data(data):
    if data == None:
        print "No data"
        return
    return data`,
    sampleJava: `public class Test {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
    testPrompts: [
        'Fix the issues in this code',
        'Convert to modern JavaScript',
        'Add error handling',
        'Optimize for performance'
    ]
};

// Main Integration Test Function
async function runIntegrationTests() {
    const runner = new IntegrationTestRunner();
    
    runner.log(`${colors.bold}🚀 Code Helper - Integration Test Suite${colors.reset}`, 'blue');
    runner.log(`${'='.repeat(60)}`, 'blue');

    // Test 1: App Startup
    await runner.runIntegrationTest('Application Startup', async () => {
        runner.log('🔄 Testing app startup...', 'yellow');
        
        try {
            const result = await runElectronApp(15000);
            runner.assert(result.hasStarted || result.code === 0, 'App starts without critical errors');
            
            if (result.output) {
                const hasIpcHandlers = result.output.includes('IPC handlers setup complete');
                const hasSettings = result.output.includes('Settings loaded successfully') || 
                                  result.output.includes('Settings file not found, using defaults');
                const hasShortcuts = result.output.includes('Registered shortcut') || 
                                   result.output.includes('Error registering shortcut');
                
                runner.assert(hasIpcHandlers, 'IPC handlers are set up');
                runner.assert(hasSettings, 'Settings system is working');
                runner.log('ℹ️ Shortcuts registration may fail without proper permissions', 'yellow');
            }
        } catch (error) {
            runner.log(`⚠️ App startup test had issues: ${error.message}`, 'yellow');
            runner.assert(false, 'App startup failed');
        }
    });

    // Test 2: Module Integration
    await runner.runIntegrationTest('Module Integration', async () => {
        // Test settings integration
        try {
            const settingsModule = require('../src/main/utils/settings');
            const settings = settingsModule.getSettings();
            runner.assert(typeof settings === 'object', 'Settings module returns object');
            runner.assert(settings.apiKeys, 'Settings has API keys object');
            
            // Test code analyzer integration
            const analyzerModule = require('../src/main/utils/code-analyzer');
            const analysis = analyzerModule.analyzeCode(testData.sampleJavaScript);
            runner.assert(analysis.language === 'javascript', 'Code analyzer detects JavaScript');
            runner.assert(analysis.suggestions.length > 0, 'Code analyzer provides suggestions');
            
            // Test AI providers
            const aiManager = require('../src/main/ai-providers/ai-manager');
            runner.assert(typeof aiManager.generateCodeWithAI === 'function', 'AI manager is accessible');
            
        } catch (error) {
            runner.assert(false, `Module integration failed: ${error.message}`);
        }
    });

    // Test 3: File Structure Integrity
    await runner.runIntegrationTest('File Structure Integrity', async () => {
        const criticalFiles = [
            'package.json',
            'src/main/main.js',
            'src/renderer/pages/overlay.html',
            'src/renderer/pages/settings.html'
        ];

        let allFilesExist = true;
        for (const file of criticalFiles) {
            const filePath = path.join(__dirname, '..', file);
            const exists = fs.existsSync(filePath);
            if (!exists) {
                allFilesExist = false;
                runner.log(`  Missing critical file: ${file}`, 'red');
            }
        }
        
        runner.assert(allFilesExist, 'All critical files exist');
        
        // Test package.json configuration
        const packageJson = require('../package.json');
        runner.assert(packageJson.main.includes('src/main/main.js'), 'Package.json points to correct main file');
        runner.assert(packageJson.scripts.start, 'Start script is defined');
    });

    // Test 4: Code Analysis Workflow
    await runner.runIntegrationTest('Code Analysis Workflow', async () => {
        const { analyzeCode } = require('../src/main/utils/code-analyzer');
        
        // Test different languages
        const jsAnalysis = analyzeCode(testData.sampleJavaScript);
        const pythonAnalysis = analyzeCode(testData.samplePython);
        const javaAnalysis = analyzeCode(testData.sampleJava);
        
        runner.assert(jsAnalysis.language === 'javascript', 'JavaScript detection works');
        runner.assert(pythonAnalysis.language === 'python', 'Python detection works');
        runner.assert(javaAnalysis.language === 'java', 'Java detection works');
        
        // Test suggestions
        runner.assert(jsAnalysis.suggestions.some(s => s.message.includes('var')), 'JavaScript var detection');
        runner.assert(jsAnalysis.suggestions.some(s => s.message.includes('console.log')), 'Console.log detection');
        
        runner.assert(pythonAnalysis.suggestions.some(s => s.message.includes('print')), 'Python print detection');
        runner.assert(javaAnalysis.suggestions.some(s => s.message.includes('System.out.println')), 'Java println detection');
    });

    // Test 5: Settings Persistence
    await runner.runIntegrationTest('Settings Persistence', async () => {
        const { saveSettings, loadSettings, getSettings } = require('../src/main/utils/settings');
        
        try {
            // Test saving settings
            const testSettings = {
                overlayPosition: 'top-left',
                apiProvider: 'gemini',
                temperature: 0.5
            };
            
            await saveSettings(testSettings);
            runner.assert(true, 'Settings can be saved');
            
            // Test loading settings
            await loadSettings();
            const currentSettings = getSettings();
            
            runner.assert(currentSettings.overlayPosition === 'top-left', 'Overlay position persisted');
            runner.assert(currentSettings.apiProvider === 'gemini', 'API provider persisted');
            runner.assert(currentSettings.temperature === 0.5, 'Temperature persisted');
            
        } catch (error) {
            runner.assert(false, `Settings persistence failed: ${error.message}`);
        }
    });

    // Test 6: Build Configuration
    await runner.runIntegrationTest('Build Configuration', async () => {
        const packageJson = require('../package.json');
        
        runner.assert(packageJson.build, 'Build configuration exists');
        runner.assert(packageJson.build.appId, 'App ID is defined');
        runner.assert(packageJson.build.productName, 'Product name is defined');
        
        // Test build files inclusion
        const buildFiles = packageJson.build.files || [];
        runner.assert(buildFiles.includes('src/**/*'), 'Source files included in build');
        runner.assert(buildFiles.includes('package.json'), 'Package.json included in build');
        
        // Test platform configurations
        runner.assert(packageJson.build.mac, 'macOS build config exists');
        runner.assert(packageJson.build.win, 'Windows build config exists');
    });

    // Test 7: Error Handling
    await runner.runIntegrationTest('Error Handling', async () => {
        const { analyzeCode } = require('../src/main/utils/code-analyzer');
        
        // Test with empty code
        const emptyAnalysis = analyzeCode('');
        runner.assert(emptyAnalysis.language === 'text', 'Handles empty code gracefully');
        runner.assert(Array.isArray(emptyAnalysis.suggestions), 'Returns suggestions array for empty code');
        
        // Test with invalid code
        const invalidAnalysis = analyzeCode('invalid@#$%code&*()');
        runner.assert(typeof invalidAnalysis === 'object', 'Handles invalid code gracefully');
        
        // Test settings with invalid data
        try {
            const { getSettings } = require('../src/main/utils/settings');
            const settings = getSettings();
            runner.assert(typeof settings === 'object', 'Settings always returns object');
            runner.assert(settings.apiKeys, 'API keys object always exists');
        } catch (error) {
            runner.assert(false, `Settings error handling failed: ${error.message}`);
        }
    });

    // Print test summary
    runner.printSummary();
    
    // Generate test report
    const reportPath = path.join(__dirname, '..', 'test-results.json');
    const report = {
        timestamp: new Date().toISOString(),
        testType: 'integration',
        results: runner.results,
        summary: {
            total: runner.passed + runner.failed,
            passed: runner.passed,
            failed: runner.failed,
            successRate: ((runner.passed / (runner.passed + runner.failed)) * 100).toFixed(1)
        }
    };
    
    try {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        runner.log(`\n📊 Test report saved to: ${reportPath}`, 'blue');
    } catch (error) {
        runner.log(`⚠️ Could not save test report: ${error.message}`, 'yellow');
    }
    
    // Exit with appropriate code
    process.exit(runner.failed > 0 ? 1 : 0);
}

// Run integration tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests().catch(error => {
        console.error(`${colors.red}Integration test error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = { runIntegrationTests, IntegrationTestRunner };
