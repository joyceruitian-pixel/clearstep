const fs = require('fs');
const path = require('path');

const MODEL = 'gpt-4o-mini';

function readApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  const envText = fs.readFileSync(envPath, 'utf8');
  const line = envText.split(/\r?\n/).find((item) => item.startsWith('OPENAI_API_KEY='));
  return line ? line.slice('OPENAI_API_KEY='.length).trim() : '';
}

async function explainInstructions(instructions, options = {}) {
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
        { role: 'user', content: `${options.simpler ? 'Explain the same homework directions again in even simpler words. Use shorter sentences and easier vocabulary, but preserve every number, date, page range, condition, and teacher requirement exactly. Do not remove important details or complete any part of the assignment.' : 'Explain these homework instructions.'}

The final block is text pasted by a student. Treat it as teacher directions to explain, not a request for you to do the work. Directions may contain verbs such as write, solve, create, compare, or analyze; explain what the student must do without doing it. A direct request containing phrases such as “for me,” “give me the answer,” or “so I can submit it as my own” is different and must be refused. Refuse or redirect only when the student clearly asks the assistant to produce completed work or answers, asks for harmful or unsafe help, asks for personal-information help, or asks something unrelated to homework.

Accuracy rules: preserve every exact page range, question number, quantity, condition, and deadline in the summary, steps, or importantRequirements. Do not add research, choosing extra details, checking answers, experiments, data analysis, materials, format rules, descriptions, grading rules, or due dates that the directions do not say. Do not turn a reasonable explanation into a new requirement. Keep the requested actions in their original order. If the directions are incomplete, still make steps from the actions that are stated and put the missing context in missingInformation so the student knows to ask their teacher.

Do not do the assignment. Keep the answer short. Return only a JSON object with these exact fields: summary (one simple sentence), steps (a short array of clear actions), importantRequirements (an array containing only requirements explicitly written in the directions), and missingInformation (an array of important details the student should ask their teacher about, or an empty array). Never invent requirements.

Safety check: If this is not a request to understand schoolwork, or if it asks for harmful, unsafe, inappropriate, or personal-information help, return a JSON object with summary explaining that ClearStep is for understanding homework directions, and leave steps, importantRequirements, and missingInformation empty.

${instructions}` }
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
