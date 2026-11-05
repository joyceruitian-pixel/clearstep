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
        { role: 'user', content: `Explain these homework instructions. Do not do the assignment. Keep the answer short. Return only a JSON object with these exact fields: summary (one simple sentence), steps (a short array of clear actions), importantRequirements (an array containing only requirements explicitly written in the directions), and missingInformation (an array of important details the student should ask their teacher about, or an empty array). Never invent requirements.\n\nSafety check: If this is not a request to understand schoolwork, or if it asks for harmful, unsafe, inappropriate, or personal-information help, return a JSON object with summary explaining that ClearStep is for understanding homework directions, and leave steps, importantRequirements, and missingInformation empty.\n\n${instructions}` }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = new Error('OpenAI request failed');
    error.code = response.status === 401 ? 'OPENAI_AUTH' : 'OPENAI_REQUEST';
    throw error;
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(content);
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Read the directions carefully and follow the steps below.',
      steps: Array.isArray(parsed.steps) ? parsed.steps.filter((step) => typeof step === 'string') : [],
      importantRequirements: Array.isArray(parsed.importantRequirements) ? parsed.importantRequirements.filter((item) => typeof item === 'string') : [],
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation.filter((item) => typeof item === 'string') : []
    };
  } catch {
    return { summary: content || 'I could not find an explanation. Please check with your teacher.', steps: [], importantRequirements: [], missingInformation: [] };
  }
}

module.exports = { explainInstructions };
