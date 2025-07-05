function renderLLMResponse(rawText, containerElement) {
  containerElement.innerHTML = ''; // Clear previous content

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const [fullMatch, language = '', code] = match;

    // Add plain text before the code block
    if (match.index > lastIndex) {
      const plainText = rawText.slice(lastIndex, match.index).trim();
      if (plainText) {
        const paragraph = document.createElement('p');
        paragraph.textContent = plainText;
        containerElement.appendChild(paragraph);
      }
    }

    // Create code block container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-block';

    const pre = document.createElement('pre');
    const codeEl = document.createElement('code');
    codeEl.textContent = code.trim();
    if (language) codeEl.className = `language-${language}`; // For Prism or highlight.js

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy';
    copyBtn.className = 'copy-button';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
      });
    });

    pre.appendChild(codeEl);
    codeContainer.appendChild(pre);
    codeContainer.appendChild(copyBtn);
    containerElement.appendChild(codeContainer);

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Add remaining plain text after last code block
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
  const div = document.createElement('div');
  const lines = text.split('\n');
  lines.forEach(line => {
    if (line.startsWith('# ')) {
      const h1 = document.createElement('h1');
      h1.textContent = line.replace('# ', '').trim();
      div.appendChild(h1);
    } else if (line.startsWith('## ')) {
      const h2 = document.createElement('h2');
      h2.textContent = line.replace('## ', '').trim();
      div.appendChild(h2);
    } else if (line.startsWith('- ')) {
      const ul =
        div.lastElementChild?.tagName === 'UL'
          ? div.lastElementChild
          : document.createElement('ul');
      const li = document.createElement('li');
      li.textContent = line.replace('- ', '').trim();
      ul.appendChild(li);
      if (ul.parentElement !== div) div.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.textContent = line.trim();
      div.appendChild(p);
    }
  });
  return div;
}


const response = `
Here’s how you can use the fetch API in JavaScript:

\`\`\`js
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

## Notes
- This is async.
- Handle errors properly.
`;

renderLLMResponse(response, document.getElementById('response-content'));
