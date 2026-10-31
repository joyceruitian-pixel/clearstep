const fs = require('fs');
const path = require('path');

const MODEL = 'gpt-4o-mini';

function readApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  const envText = fs.readFileSync(envPath, 'utf8');
  const line = envText.split(/\r?\n/).find((item) => item.startsWith('OPENAI_API_KEY='));
  return line ? line.slice('OPENAI_API_KEY='.length).trim() : '';
}

async function explainInstructions(instructions) {
  const apiKey = readApiKey();
  if (!apiKey || apiKey === 'paste-your-key-here') {
    const error = new Error('Missing OpenAI key');
    error.code = 'OPENAI_AUTH';
    throw error;
  }

  const brief = fs.readFileSync(path.join(__dirname, '..', 'BRIEF.md'), 'utf8');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: brief },
        { role: 'user', content: `Explain these homework instructions. Do not do the assignment. Keep the answer short.\n\n${instructions}` }
      ]
    })
  });

  if (!response.ok) {
    const error = new Error('OpenAI request failed');
    error.code = response.status === 401 ? 'OPENAI_AUTH' : 'OPENAI_REQUEST';
    throw error;
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'I could not find an explanation. Please check with your teacher.';
}

module.exports = { explainInstructions };
