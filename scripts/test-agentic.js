const { generateCodeWithAgenticAI } = require('../src/main/ai-providers/agentic-ai-manager');
const contextAwareSelector = require('../src/main/utils/context-aware-selector');

/**
 * Test script for agentic AI functionality
 */
async function testAgenticAI() {
    console.log('🧪 Testing Agentic AI Functionality...\n');
    
    // Test 1: Context-aware code selection
    console.log('1. Testing Context-Aware Code Selection...');
    const testCode = `
function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 3);
console.log(result);
    `;
    
    contextAwareSelector.handleCodeSelection(testCode);
    const selectedCode = contextAwareSelector.getSelectedCode();
    const codeContext = contextAwareSelector.getCodeContext();
    
    console.log('✅ Code selection working:', {
        hasCode: !!selectedCode,
        language: codeContext.language,
        lines: codeContext.lines,
        hasFunctions: codeContext.hasFunctions
    });
    
    // Test 2: Agentic AI generation
    console.log('\n2. Testing Agentic AI Generation...');
    
    const testPrompt = 'Add error handling to this function';
    const testContext = {
        language: 'javascript',
        lines: 6,
        characters: testCode.length
    };
    
    try {
        const response = await generateCodeWithAgenticAI(
            testPrompt,
            testCode,
            testContext,
            // Thinking callback
            (thinkingState) => {
                console.log('🤔 Thinking:', thinkingState.message, `(${thinkingState.progress}%)`);
            },
            // Generating callback
            (generatingState) => {
                console.log('✨ Generating:', generatingState.message);
            }
        );
        
        console.log('✅ Agentic AI generation successful:', {
            hasResponse: !!response.generated,
            provider: response.provider,
            thinkingSteps: response.thinkingSteps?.length || 0,
            metadata: response.agenticMetadata
        });
        
        if (response.generated) {
            console.log('\n📝 Generated Code:');
            console.log(response.generated);
        }
        
    } catch (error) {
        console.error('❌ Agentic AI generation failed:', error.message);
    }
    
    // Test 3: Code/Instruction extraction
    console.log('\n3. Testing Code/Instruction Extraction...');
    
    const { CodeInstructionExtractor } = require('../src/main/ai-providers/agentic-ai-manager');
    const extractor = new CodeInstructionExtractor();
    
    const mixedInput = `
Please help me with this code:

\`\`\`javascript
function greet(name) {
    return "Hello " + name;
}
\`\`\`

I want to add validation to ensure the name parameter is a string.
    `;
    
    const { codeBlocks, instructions } = extractor.extractCodeAndInstructions(mixedInput);
    
    console.log('✅ Code/Instruction extraction working:', {
        codeBlocksCount: codeBlocks.length,
        instructionsCount: instructions.length,
        hasCodeBlock: codeBlocks.length > 0,
        hasInstructions: instructions.length > 0
    });
    
    console.log('\n🎉 All tests completed!');
}

// Run tests
if (require.main === module) {
    testAgenticAI().catch(console.error);
}

module.exports = { testAgenticAI }; 