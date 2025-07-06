        const { ipcRenderer } = require('electron');
        
        // Elements
        const overlayContainer = document.getElementById('overlay-container');
        const header = document.getElementById('header');
        const codePreview = document.getElementById('code-preview');
        const codeSnippet = document.getElementById('code-snippet');
        const codeContent = document.getElementById('code-content');
        const languageTag = document.getElementById('language-tag');
        const lineCount = document.getElementById('line-count');
        const expandBtn = document.getElementById('expand-btn');
        const promptInput = document.getElementById('prompt-input');
        const generateBtn = document.getElementById('generate-btn');
        // const analyzeBtn = document.getElementById('analyze-btn');
        // const copyBtn = document.getElementById('copy-btn');
        const closeBtn = document.getElementById('close-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const positionBtn = document.getElementById('position-btn');
        const positionSelector = document.getElementById('position-selector');
        const loading = document.getElementById('loading');
        const responseSection = document.getElementById('response-section');
        const responseContent = document.getElementById('response-content');
        const providerTag = document.getElementById('provider-tag');
        // const copyResponseBtn = document.getElementById('copy-response-btn');
        // const applyBtn = document.getElementById('apply-btn');
        const errorMessage = document.getElementById('error-message');
        
        // Code Editor Modal Elements
        const codeModal = document.getElementById('code-modal');
        const codeEditor = document.getElementById('code-editor');
        const saveCodeBtn = document.getElementById('save-code-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        
        // State
        let currentCode = '';
        let currentCodeContext = {};
        let settings = {};
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        // Initialize
        init();
        
        function init() {
            loadSettings();
            setupEventListeners();
            // setupDragAndDrop();
            focusPromptInput();
        }
        
        function loadSettings() {
            ipcRenderer.send('get-settings');
        }
        
        function setupEventListeners() {
            // Button events
            generateBtn.addEventListener('click', generateCode);
            // analyzeBtn.addEventListener('click', analyzeCode);
            // copyBtn.addEventListener('click', copyCode);
            closeBtn.addEventListener('click', closeOverlay);
            settingsBtn.addEventListener('click', openSettings);
            positionBtn.addEventListener('click', togglePositionSelector);
            expandBtn.addEventListener('click', toggleCodeExpansion);
            // copyResponseBtn.addEventListener('click', copyResponse);
            // applyBtn.addEventListener('click', applyChanges);
            
            // Code Editor Modal
            saveCodeBtn.addEventListener('click', saveCodeChanges);
            closeModalBtn.addEventListener('click', closeCodeModal);
            
            // Input events
            promptInput.addEventListener('keydown', handlePromptKeydown);
            promptInput.addEventListener('input', handlePromptInput);
            
            // Position selector
            document.querySelectorAll('.position-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const position = e.target.dataset.position;
                    updatePosition(position);
                });
            });
            
            // Click outside to close position selector
            document.addEventListener('click', (e) => {
                if (!positionSelector.contains(e.target) && e.target !== positionBtn) {
                    positionSelector.style.display = 'none';
                }
            });
           

             ipcRenderer.on('settings-data', (event, settings) => {
               settings = settings;
             });
            // IPC events
            ipcRenderer.on('show-overlay', handleShowOverlay);
            ipcRenderer.on('settings-data', handleSettingsData);
            ipcRenderer.on('code-analysis', handleCodeAnalysis);
            ipcRenderer.on('code-generated', handleCodeGenerated);
            ipcRenderer.on('code-generation-error', handleGenerationError);
        }
        
        function setupDragAndDrop() {
            let startX, startY, currentX, currentY;
            
            function handleMouseDown(e) {
                // Only allow dragging from header
                if (!header.contains(e.target)) return;
                
                isDragging = true;
                overlayContainer.classList.add('dragging');
                
                const rect = overlayContainer.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                
                startX = e.clientX;
                startY = e.clientY;
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                e.preventDefault();
            }
            
            function handleMouseMove(e) {
                if (!isDragging) return;
                
                currentX = e.clientX;
                currentY = e.clientY;
                
                const newX = currentX - dragOffset.x;
                const newY = currentY - dragOffset.y;
                
                // Keep overlay within screen bounds
                const maxX = window.screen.width - overlayContainer.offsetWidth;
                const maxY = window.screen.height - overlayContainer.offsetHeight;
                
                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(0, Math.min(newY, maxY));
                
                overlayContainer.style.position = 'fixed';
                overlayContainer.style.left = constrainedX + 'px';
                overlayContainer.style.top = constrainedY + 'px';
            }
            
            function handleMouseUp(e) {
                if (!isDragging) return;
                
                isDragging = false;
                overlayContainer.classList.remove('dragging');
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
            
            header.addEventListener('mousedown', handleMouseDown);
        }
        
        function handleShowOverlay(event, selectedCode) {
            currentCode = selectedCode || '';
            
            if (currentCode.trim()) {
                updateCodePreview(currentCode);
                analyzeCode(); // Auto-analyze the code
            } else {
                showNoCodeState();
            }
            
            focusPromptInput();
            hideError();
            hideResponse();
            hideLoading();
        }
        
        function handleSettingsData(event, settingsData) {
            settings = settingsData;
            updatePositionIndicator();
        }
        
        function handleCodeAnalysis(event, analysis) {
            currentCodeContext = analysis;
            languageTag.textContent = analysis.language.toUpperCase();
            lineCount.textContent = `${analysis.lines} lines`;
        }
        
        function handleCodeGenerated(event, response) {
            hideLoading();
            overlayContainer.classList.remove('generating');
            generateBtn.classList.remove('generating');
            showResponse(response.generated, response.provider);
        }
        
        function handleGenerationError(event, error) {
            hideLoading();
            overlayContainer.classList.remove('generating');
            generateBtn.classList.remove('generating');
            showError(error);
        }
        
        function updateCodePreview(code) {
            currentCode = code;
            const lines = code.split('\\n');
            const previewLines = lines.slice(0, 3);
            const displayCode = previewLines.join('\\n');
            const hasMore = lines.length > 3;
            
            codeContent.textContent = displayCode + (hasMore ? '\\n...' : '');
            lineCount.textContent = `${lines.length} lines`;
            
            // Reset expansion state
            codeSnippet.classList.remove('expanded');
            codeSnippet.classList.add('collapsed');
            expandBtn.textContent = '👁️ View Code';
        }
        
        function showNoCodeState() {
            codeContent.textContent = 'No code detected. Copy code and press the shortcut!';
            languageTag.textContent = 'UNKNOWN';
            lineCount.textContent = '0 lines';
            currentCode = '';
            currentCodeContext = {};
        }
        
        function toggleCodeExpansion() {
            if (!currentCode.trim()) {
                // Open code editor modal
                openCodeEditor();
                return;
            }
            
            if (codeSnippet.classList.contains('expanded')) {
                codeSnippet.classList.remove('expanded');
                codeSnippet.classList.add('collapsed');
                expandBtn.textContent = '👁️ View Code';
                updateCodePreview(currentCode);
            } else {
                // Open code editor modal for better editing experience
                openCodeEditor();
            }
        }
        
        function openCodeEditor() {
            codeEditor.value = currentCode;
            codeModal.style.display = 'flex';
            codeEditor.focus();
        }
        
        function closeCodeModal() {
            codeModal.style.display = 'none';
        }
        
        function saveCodeChanges() {
            const newCode = codeEditor.value;
            currentCode = newCode;
            updateCodePreview(newCode);
            if (newCode.trim()) {
                analyzeCode();
            } else {
                showNoCodeState();
            }
            closeCodeModal();
        }
        
        function generateCode() {
          const prompt = promptInput.value.trim();
          loadSettings();
            if (!prompt) {
                showError('Please enter a prompt describing what you want me to do with the code.');
                return;
            }
            
            if (!currentCode.trim()) {
                showError('No code detected. Please copy some code first or use the code editor.');
                return;
            }
          loadSettings();
            
            const currentProvider = settings.apiProvider || 'openai';
            const apiKey = settings.apiKeys && settings.apiKeys[currentProvider];
            
            if (!apiKey) {
                showError(`API key not configured for ${currentProvider}. Please add your API key in settings.`);
                return;
            }
            
            showLoading();
            overlayContainer.classList.add('generating');
            generateBtn.classList.add('generating');
            hideError();
            hideResponse();
            
            ipcRenderer.send('generate-code', {
                prompt: prompt,
                code: currentCode,
                context: currentCodeContext
            });
        }
        
        function analyzeCode() {
            if (!currentCode.trim()) {
                showError('No code to analyze. Please copy some code first.');
                return;
            }
            
            ipcRenderer.send('analyze-code', currentCode);
        }
        
        function copyCode() {
            if (currentCode.trim()) {
                ipcRenderer.send('copy-to-clipboard', currentCode);
                showTemporaryFeedback(copyBtn, '✅ Copied!', '📋 Copy');
            }
        }
        
        function copyResponse() {
            const response = responseContent.textContent;
            if (response.trim()) {
                ipcRenderer.send('copy-to-clipboard', response);
                showTemporaryFeedback(copyResponseBtn, '✅ Copied!', '📋 Copy Response');
            }
        }
        
        function applyChanges() {
          const response = responseContent.textContent;
        
          if (response.trim()) {
                currentCode = response;
              updateCodePreview(currentCode);
                 ipcRenderer.send('apply-code', code.trim());
                ipcRenderer.send('copy-to-clipboard', response);
                showTemporaryFeedback(applyBtn, '✅ Applied!', '✅ Apply Changes');
                hideResponse();
            }
        }
        
        function closeOverlay() {
            ipcRenderer.send('hide-overlay');
        }
        
        function openSettings() {
            ipcRenderer.send('show-main-window');
        }
        
        function togglePositionSelector() {
            const isVisible = positionSelector.style.display === 'block';
            positionSelector.style.display = isVisible ? 'none' : 'block';
        }
        
        function updatePosition(position) {
            ipcRenderer.send('update-overlay-position', position);
            positionSelector.style.display = 'none';
            settings.overlayPosition = position;
            updatePositionIndicator();
        }
        
        function updatePositionIndicator() {
            document.querySelectorAll('.position-option').forEach(option => {
                option.classList.remove('active');
            });
            
            const activeOption = document.querySelector(`[data-position="${settings.overlayPosition}"]`);
            if (activeOption) {
                activeOption.classList.add('active');
            }
        }
        
        function showLoading() {
            loading.style.display = 'flex';
            generateBtn.disabled = true;
        }
        
        function hideLoading() {
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
        
        function showResponse(content, provider) {
            // responseContent.textContent = content;
            providerTag.textContent = provider;
          responseSection.style.display = 'block';
          
          renderLLMResponse(
            content,
            document.getElementById('response-content'),
          );
        }
        
        function hideResponse() {
            responseSection.style.display = 'none';
        }
        
        
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        
        function hideError() {
            errorMessage.style.display = 'none';
        }
        
        function showTemporaryFeedback(button, tempText, originalText) {
            const original = button.textContent;
            button.textContent = tempText;
            setTimeout(() => {
                button.textContent = originalText || original;
            }, 2000);
        }
        
        function focusPromptInput() {
            setTimeout(() => {
                promptInput.focus();
            }, 100);
        }
        
        function handlePromptKeydown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                generateCode();
            } else if (e.key === 'Escape') {
                if (codeModal.style.display === 'flex') {
                    closeCodeModal();
                } else {
                    closeOverlay();
                }
            }
        }
        
        function handlePromptInput() {
            // Auto-resize textarea
            promptInput.style.height = 'auto';
            promptInput.style.height = Math.min(promptInput.scrollHeight, 80) + 'px';
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && codeModal.style.display !== 'flex') {
                closeOverlay();
            }
        });



      function renderLLMResponse(rawText, containerElement, onApplyCallback) {
        containerElement.innerHTML = '';

        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(rawText)) !== null) {
          const [fullMatch, language = '', code] = match;

          if (match.index > lastIndex) {
            const plainText = rawText.slice(lastIndex, match.index).trim();
            if (plainText) {
              const markdown = parseMarkdown(plainText);
              containerElement.appendChild(markdown);
            }
          }

          const codeContainer = document.createElement('div');
          codeContainer.className = 'code-block';

          const pre = document.createElement('pre');
          const codeEl = document.createElement('code');
          codeEl.textContent = code.trim();
          codeEl.className = `language-${language || 'plaintext'}`;
          pre.appendChild(codeEl);

          const buttonBar = document.createElement('div');
          buttonBar.className = 'code-buttons';

          const copyBtn = document.createElement('button');
          copyBtn.textContent = '📋 Copy';
          copyBtn.className = 'copy-button';
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
              copyBtn.textContent = '✅ Copied!';
              setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
            });
          });

          const applyBtn = document.createElement('button');
          applyBtn.textContent = '✅ Apply';  
          applyBtn.className = 'apply-button';
          applyBtn.addEventListener('click', () => {
            // Send code to main or renderer logic to replace selected area
            ipcRenderer.send('apply-code', code.trim());

            // Optional: update local UI
            if (typeof onApplyCallback === 'function') {
              onApplyCallback(code.trim());
            }
          });

          buttonBar.appendChild(copyBtn);
          buttonBar.appendChild(applyBtn);
          buttonBar.style.alignItems = "center"
          codeContainer.appendChild(pre);
          codeContainer.appendChild(buttonBar);
          containerElement.appendChild(codeContainer);

          if (window.hljs) {
            hljs.highlightElement(codeEl);
          }

          lastIndex = codeBlockRegex.lastIndex;
        }

        if (lastIndex < rawText.length) {
          const remainingText = rawText.slice(lastIndex).trim();
          if (remainingText) {
            const markdown = parseMarkdown(remainingText);
            containerElement.appendChild(markdown);
          }
        }
      }


        // Minimal markdown parser for headers, bold, etc.
  function parseMarkdown(text) {
    const container = document.createElement('div');
    const lines = text.split('\n');

    let currentList = null;

    lines.forEach(line => {
      if (/^#{1,6} /.test(line)) {
        const level = line.match(/^#+/)[0].length;
        const heading = document.createElement(`h${level}`);
        heading.textContent = line.replace(/^#{1,6} /, '').trim();
        container.appendChild(heading);
        currentList = null;
      } else if (/^[-*+] /.test(line)) {
        if (!currentList) {
          currentList = document.createElement('ul');
          container.appendChild(currentList);
        }
        const li = document.createElement('li');
        li.innerHTML = line.replace(/^[-*+] /, '').trim();
        currentList.appendChild(li);
      } else if (line.trim() === '') {
        currentList = null;
        container.appendChild(document.createElement('br'));
      } else {
        const p = document.createElement('p');
        p.innerHTML = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(
            /\[(.*?)\]\((.*?)\)/g,
            '<a href="$2" target="_blank">$1</a>',
          );
        container.appendChild(p);
        currentList = null;
      }
    });

    return container;
  }


  // Add this to your existing overlay.js
function handleResize() {
    const container = document.getElementById('overlay-container');
    const content = document.querySelector('.scrollable-content');
    
    // Calculate max height based on viewport
    const maxHeight = window.innerHeight - 100;
    content.style.maxHeight = `${maxHeight}px`;
    
    // Adjust position if near edges
    const rect = container.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        container.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
        container.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
}

// Call on load and resize
window.addEventListener('load', handleResize);
window.addEventListener('resize', handleResize);