


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
