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
        { role: 'user', content: `Explain these homework instructions. Do not do the assignment. Keep the answer short and use this exact format:\n\nWhat it means: one simple sentence explaining what the assignment asks.\nSteps:\n1. First clear action.\n2. Next clear action.\nAdd a short “Ask your teacher:” note only if something important is unclear.\n\nSafety check: If this is not a request to understand schoolwork, or if it asks for harmful, unsafe, inappropriate, or personal-information help, do not answer it. Say that ClearStep is for understanding homework directions and ask the student to share school instructions without private information.\n\n${instructions}` }
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
