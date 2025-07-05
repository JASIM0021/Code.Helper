# Code Helper - Project Structure

## 📁 Directory Organization

```
code-helper/
├── 📂 src/                          # Source code
│   ├── 📂 main/                     # Main Electron process
│   │   ├── 📄 main.js               # Application entry point
│   │   ├── 📂 ai-providers/         # AI provider implementations
│   │   │   ├── 📄 ai-manager.js     # AI provider orchestrator
│   │   │   ├── 📄 openai.js         # OpenAI API integration
│   │   │   ├── 📄 gemini.js         # Google Gemini integration
│   │   │   ├── 📄 claude.js         # Anthropic Claude integration
│   │   │   └── 📄 ollama.js         # Ollama (Local AI) integration
│   │   ├── 📂 ipc/                  # Inter-process communication
│   │   │   └── 📄 ipc-handlers.js   # IPC event handlers
│   │   ├── 📂 utils/                # Utility modules
│   │   │   ├── 📄 settings.js       # Settings management
│   │   │   ├── 📄 shortcuts.js      # Global shortcuts handling
│   │   │   └── 📄 code-analyzer.js  # Code analysis engine
│   │   └── 📂 windows/              # Window management
│   │       └── 📄 window-manager.js # Window creation & control
│   └── 📂 renderer/                 # Renderer process (UI)
│       ├── 📂 pages/                # HTML pages
│       │   ├── 📄 overlay.html      # Code helper overlay
│       │   └── 📄 settings.html     # Settings interface
│       ├── 📂 components/           # Reusable UI components
│       └── 📂 utils/                # Renderer utilities
├── 📂 scripts/                      # Build & test scripts
│   ├── 📄 test.js                   # Unit test runner
│   └── 📄 integration-test.js       # Integration test runner
├── 📂 assets/                       # Static assets
│   └── 📂 icons/                    # Application icons
├── 📄 package.json                  # NPM configuration
├── 📄 README.md                     # Project documentation
├── 📄 PROJECT_STRUCTURE.md          # This file
└── 📄 settings.json                 # User settings (generated)
```

## 🏗️ Architecture Overview

### Main Process (`src/main/`)
The main process is responsible for:
- Application lifecycle management
- Window creation and management
- Global shortcuts registration
- Inter-process communication
- AI provider coordination
- Settings persistence

### Renderer Process (`src/renderer/`)
The renderer process handles:
- User interface rendering
- User input processing
- Code editing and display
- Real-time feedback

### AI Providers (`src/main/ai-providers/`)
Modular AI provider system supporting:
- **OpenAI**: GPT-3.5, GPT-4
- **Google Gemini**: Gemini Pro
- **Anthropic Claude**: Claude-3 Sonnet
- **Ollama**: Local AI models

## 📋 Module Dependencies

### Core Dependencies
```
main.js
├── utils/settings.js
├── windows/window-manager.js
├── utils/shortcuts.js
└── ipc/ipc-handlers.js
    ├── ai-providers/ai-manager.js
    │   ├── ai-providers/openai.js
    │   ├── ai-providers/gemini.js
    │   ├── ai-providers/claude.js
    │   └── ai-providers/ollama.js
    └── utils/code-analyzer.js
```

### Settings Flow
```
settings.js → main.js → ipc-handlers.js → renderer
```

### Code Analysis Flow
```
overlay.html → ipc → code-analyzer.js → ai-manager.js → AI Provider
```

## 🔧 Configuration Files

### `package.json`
- Entry point: `./src/main/main.js`
- Scripts: start, build, test
- Dependencies: Electron, Electron Builder
- Build configuration for cross-platform distribution

### `settings.json` (Generated)
User preferences including:
- API keys for AI providers
- Overlay position and appearance
- Keyboard shortcuts
- Application behavior settings

## 🧪 Testing Structure

### Unit Tests (`scripts/test.js`)
- Module import verification
- Function functionality testing
- Settings system validation
- Code analyzer accuracy
- File structure integrity

### Integration Tests (`scripts/integration-test.js`)
- Application startup verification
- Module integration testing
- End-to-end workflow validation
- Error handling verification
- Build configuration testing

## 🚀 Build Process

### Development
```bash
npm start          # Launch in development mode
npm run dev        # Launch with dev tools
```

### Testing
```bash
npm test           # Run unit tests
npm run test-integration  # Run integration tests
```

### Production Build
```bash
npm run build      # Build for current platform
npm run build-mac  # Build for macOS
npm run build-win  # Build for Windows
npm run build-all  # Build for all platforms
```

## 📊 Code Metrics

### File Sizes (Approximate)
- Main process: ~2,000 lines
- AI providers: ~800 lines
- Utilities: ~1,000 lines
- Renderer: ~1,500 lines
- Tests: ~600 lines

### Module Complexity
- **Low**: Settings, Shortcuts, Window Manager
- **Medium**: Code Analyzer, IPC Handlers
- **High**: AI Manager, Main Process

## 🔄 Data Flow

1. **User Interaction**: User selects code and presses shortcut
2. **Global Shortcut**: Main process detects shortcut and shows overlay
3. **Code Input**: Overlay receives clipboard content via IPC
4. **Analysis**: Code analyzer detects language and provides suggestions
5. **AI Processing**: AI manager routes request to appropriate provider
6. **Response**: AI response displayed in overlay with actions
7. **Result**: User can copy, apply, or modify the generated code

## 🛠️ Extension Points

### Adding New AI Providers
1. Create new file in `src/main/ai-providers/`
2. Implement `generate()` function
3. Add to `ai-manager.js` switch statement
4. Update settings to include new provider
5. Add API key management

### Adding New Languages
1. Add detection pattern to `code-analyzer.js`
2. Implement language-specific analysis function
3. Add to analysis switch statement
4. Create test cases

### Adding New Features
1. Define IPC events in `ipc-handlers.js`
2. Implement backend logic in appropriate module
3. Add frontend UI in overlay or settings
4. Write tests for new functionality

## 📝 Best Practices

### Code Organization
- Single responsibility per module
- Clear separation of concerns
- Consistent error handling
- Comprehensive documentation

### Security
- API keys stored securely
- Input validation on all user data
- Safe IPC communication
- No eval() or dangerous operations

### Performance
- Lazy loading of heavy modules
- Efficient file operations
- Minimal memory footprint
- Fast startup time

### Maintainability
- Modular architecture
- Comprehensive test coverage
- Clear naming conventions
- Detailed documentation
