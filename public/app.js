import { loadSavedExplanations, saveExplanation } from './storage.js';

const instructionsInput = document.querySelector('#instructions');
const explainButton = document.querySelector('#explain-button');
const charCount = document.querySelector('#char-count');
const resultEmpty = document.querySelector('#result-empty');
const resultLoading = document.querySelector('#result-loading');
const resultContent = document.querySelector('#result-content');
const exampleButton = document.querySelector('#example-button');

const EXAMPLE_INSTRUCTIONS = 'Read pages 42–48. In your notebook, write three details that show how the main character changes. Use a quote for each detail.';

function updateCount() { charCount.textContent = `${instructionsInput.value.length.toLocaleString()} / 12,000`; }

exampleButton.addEventListener('click', () => {
  instructionsInput.value = EXAMPLE_INSTRUCTIONS;
  updateCount();
  instructionsInput.focus();
});

function showResult(result) {
  resultEmpty.hidden = true;
  resultLoading.hidden = true;
  resultContent.hidden = false;
  resultContent.textContent = result;
}

instructionsInput.addEventListener('input', updateCount);
explainButton.addEventListener('click', async () => {
  const instructions = instructionsInput.value.trim();
  if (!instructions) { instructionsInput.focus(); return; }
  explainButton.disabled = true;
  resultEmpty.hidden = true;
  resultContent.hidden = true;
  resultLoading.hidden = false;
  try {
    const response = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    showResult(data.result);
    saveExplanation({ instructions, result: data.result, savedAt: new Date().toISOString() });
  } catch (error) {
    showResult(`I couldn't explain that right now. ${error.message} Please compare with your teacher's original directions.`);
  } finally { explainButton.disabled = false; }
});

loadSavedExplanations();
updateCount();
