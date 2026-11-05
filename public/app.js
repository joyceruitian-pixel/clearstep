import { loadSavedExplanations, saveExplanation } from './storage.js';

const instructionsInput = document.querySelector('#instructions');
const explainButton = document.querySelector('#explain-button');
const charCount = document.querySelector('#char-count');
const resultEmpty = document.querySelector('#result-empty');
const resultLoading = document.querySelector('#result-loading');
const resultContent = document.querySelector('#result-content');
const exampleButton = document.querySelector('#example-button');
const explainLabel = document.querySelector('#explain-label');
const savedLabel = document.querySelector('#saved-label');

const EXAMPLE_INSTRUCTIONS = 'Read pages 42–48. In your notebook, write three details that show how the main character changes. Use a quote for each detail.';

function updateCount() { charCount.textContent = `${instructionsInput.value.length.toLocaleString()} / 12,000`; }

exampleButton.addEventListener('click', () => {
  instructionsInput.value = EXAMPLE_INSTRUCTIONS;
  updateCount();
  instructionsInput.focus();
});

function addResultSection(title, items, type = 'paragraph') {
  if (!items || (Array.isArray(items) && items.length === 0)) return;
  const section = document.createElement('section');
  section.className = 'answer-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);
  if (type === 'list') {
    const list = document.createElement('ol');
    items.forEach((item) => { const row = document.createElement('li'); row.textContent = item; list.appendChild(row); });
    section.appendChild(list);
  } else {
    const text = document.createElement('p');
    text.textContent = items;
    section.appendChild(text);
  }
  resultContent.appendChild(section);
}

function showResult(result, isError = false) {
  resultEmpty.hidden = true;
  resultLoading.hidden = true;
  resultContent.hidden = false;
  resultContent.classList.toggle('error-result', isError);
  resultContent.replaceChildren();
  if (isError || typeof result === 'string') {
    resultContent.textContent = result;
    return;
  }
  addResultSection('What your assignment means', result.summary);
  addResultSection('Steps to follow', result.steps, 'list');
  addResultSection('Important requirements', result.importantRequirements, 'list');
  addResultSection('Things to ask your teacher', result.missingInformation, 'list');
}

instructionsInput.addEventListener('input', updateCount);
explainButton.addEventListener('click', async () => {
  const instructions = instructionsInput.value.trim();
  if (!instructions) { instructionsInput.focus(); return; }
  explainButton.disabled = true;
  explainLabel.textContent = 'Thinking…';
  resultEmpty.hidden = true;
  resultContent.hidden = true;
  resultLoading.hidden = false;
  try {
    const response = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    showResult(data.result);
    saveExplanation({ instructions, result: data.result, savedAt: new Date().toISOString() });
    savedLabel.textContent = 'Saved on this device';
  } catch (error) {
    showResult(`I couldn't explain that right now. ${error.message} Please compare with your teacher's original directions.`, true);
  } finally { explainButton.disabled = false; explainLabel.textContent = 'Explain directions'; }
});

const savedItems = loadSavedExplanations();
const latestSaved = savedItems.find((item) => !item.sample);
if (latestSaved) {
  instructionsInput.value = latestSaved.instructions;
  showResult(latestSaved.result);
  savedLabel.textContent = 'Saved on this device';
}
updateCount();
