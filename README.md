# Code Helper 🚀

An intelligent, context-aware code assistant that seamlessly works with any code editor as an external overlay, similar to Siri on macOS.


https://github.com/user-attachments/assets/c6c0988c-23d3-4be2-a8ec-188c53007414




## Features ✨

- **Cross-Platform Compatibility**: Works on both macOS and Windows
- **Universal Code Integration**: Compatible with any code editor (VS Code, Sublime Text, etc.)
- **Intelligent Language Detection**: Automatically detects JavaScript, Python, Java, C++, CSS, HTML, SQL, JSON, and more
- **Context-Aware Suggestions**: Provides relevant code improvements and refactoring suggestions
- **Beautiful Overlay Interface**: Siri/Gemini-style overlay with gradient border animations and smooth transitions
- **Code Preview**: Live preview of selected code in the overlay with syntax highlighting
- **AI-Powered Code Generation**: Generate improved code using AI with visual loading feedback
- **One-Click Copy**: Individual copy buttons for each generated code response
- **Real-time Analysis**: Instant feedback on code quality and best practices
- **Draggable Interface**: Fully draggable overlay that stays within screen bounds
- **Responsive Design**: Adaptive layout that works on different screen sizes

## Installation 📦

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Quick Start
```bash
# Clone or download this repository
cd Code.Helper

# Install dependencies
npm install

# Start the application
npm start
```

### Building for Distribution
```bash
# Build for current platform
npm run build

# Build for macOS
npm run build-mac

# Build for Windows
npm run build-win

# Build for all platforms
npm run build-all
```

## Usage 🎯

1. **Launch the App**: Run `npm start` or launch the built application
2. **Select Code**: In any code editor, select the code you want to analyze
3. **Copy Code**: Copy the selected code to clipboard (Ctrl+C or Cmd+C)
4. **Activate Overlay**: Press one of these keyboard shortcuts:
   - `Ctrl+L` or `Cmd+L`
   - `Ctrl+Shift+C` or `Cmd+Shift+C`
   - `F12`
5. **Get Suggestions**: The overlay will appear with your code and intelligent suggestions
6. **Take Action**: Analyze, modify, or copy the improved code back to your editor

## Keyboard Shortcuts ⌨️

### Global Shortcuts (work anywhere)
- `Ctrl+L` / `Cmd+L` - Activate Code Helper overlay
- `Ctrl+Shift+C` / `Cmd+Shift+C` - Activate Code Helper overlay
- `F12` - Activate Code Helper overlay

### In Overlay
- `Escape` - Close overlay
- `Ctrl+Enter` / `Cmd+Enter` - Analyze code
- `Ctrl+Shift+C` / `Cmd+Shift+C` - Copy to clipboard

## Supported Languages 🌐

- **JavaScript/TypeScript**: ES6+ features, async/await, strict equality checks
- **Python**: Import patterns, print statements, PEP 8 compliance
- **Java**: Logging frameworks, best practices
- **C++**: Namespace usage, modern C++ features
- **CSS**: Selectors, media queries, animations
- **HTML**: Semantic markup, accessibility
- **SQL**: Query optimization, syntax
- **JSON**: Structure validation
- **Generic**: Line length, TODO/FIXME detection, code smell detection

## Code Analysis Features 🔍

### JavaScript/TypeScript
- Suggests `const`/`let` over `var`
- Recommends strict equality (`===` over `==`)
- Identifies console.log statements for removal
- ES6+ syntax recommendations

### Python
- Python 3 syntax enforcement
- Import statement optimization
- PEP 8 style guidelines
- Function and class analysis

### Java
- Logging framework suggestions
- Code structure improvements
- Best practice enforcement

### C++
- Modern C++ feature recommendations
- Namespace usage optimization
- Memory management suggestions

### Generic Analysis
- Line length optimization (120 characters)
- TODO/FIXME comment detection
- Code complexity analysis
- Formatting suggestions

## Architecture 🏗️

```
  Please take a look PROJECT_ARCHITECTURE.MD
```

## Development 🛠️

### Project Structure
- **main.js**: Electron main process handling global shortcuts and IPC
- **overlay.html**: The intelligent overlay interface with code analysis
- **index.html**: Welcome screen and settings (hidden by default)

### Adding New Language Support
1. Add language detection pattern in `detectLanguage()` function
2. Create analysis function (e.g., `analyzeNewLanguage()`)
3. Add case in `analyzeCode()` switch statement
4. Test with sample code

### Customizing Analysis Rules
Edit the analysis functions in `main.js`:
- `analyzeJavaScript()`
- `analyzePython()`
- `analyzeJava()`
- `analyzeCpp()`
- `analyzeGeneric()`

## Troubleshooting 🔧

### Common Issues

**Global shortcuts not working:**
- Make sure no other application is using the same shortcuts
- Try running as administrator (Windows) or with accessibility permissions (macOS)

**Overlay not appearing:**
- Check if the application is running in the system tray
- Verify clipboard contains text before activating

**Code not analyzed:**
- Ensure the code is copied to clipboard
- Check if the language is supported
- Try manual analysis using the "Analyze Code" button

### macOS Permissions
You may need to grant accessibility permissions:
1. Go to System Preferences > Security & Privacy > Privacy
2. Select "Accessibility" from the left sidebar
3. Add Code Helper to the list of allowed applications

### Windows Permissions
For global shortcuts to work properly:
1. Run as administrator if needed
2. Add to Windows Defender exceptions if blocked

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new language support
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details.

## Roadmap 🗺️

- [ ] AI-powered code suggestions using local models
- [ ] Plugin system for custom analyzers
- [ ] Code formatting and auto-fix capabilities
- [ ] Integration with popular code repositories
- [ ] Team collaboration features
- [ ] Custom rule configuration
- [ ] Code metrics and analytics
- [ ] Dark/light theme support
- [ ] Multi-language documentation generation

## Support 💬

For issues, feature requests, or questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

---

**Made with ❤️ for developers who want smarter code assistance**
