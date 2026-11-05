import { loadFocusProgress, loadRequirementChecks, loadSavedExplanations, saveExplanation, saveFocusProgress, saveRequirementChecks } from './storage.js';

const instructionsInput = document.querySelector('#instructions');
const explainButton = document.querySelector('#explain-button');
const clearButton = document.querySelector('#clear-button');
const charCount = document.querySelector('#char-count');
const resultEmpty = document.querySelector('#result-empty');
const resultLoading = document.querySelector('#result-loading');
const resultContent = document.querySelector('#result-content');
const completionStatus = document.querySelector('#completion-status');
const resultActions = document.querySelector('#result-actions');
const copyButton = document.querySelector('#copy-button');
const copyStatus = document.querySelector('#copy-status');
const focusButton = document.querySelector('#focus-button');
const focusPanel = document.querySelector('#focus-panel');
const focusTitle = document.querySelector('#focus-title');
const focusStep = document.querySelector('#focus-step');
const focusProgressBar = document.querySelector('#focus-progress-bar');
const focusPrevious = document.querySelector('#focus-previous');
const focusComplete = document.querySelector('#focus-complete');
const focusNext = document.querySelector('#focus-next');
const focusClose = document.querySelector('#focus-close');
const exampleButtons = document.querySelectorAll('[data-example]');
const explainLabel = document.querySelector('#explain-label');
const savedLabel = document.querySelector('#saved-label');

const EXAMPLES = {
  math: 'Solve problems 1–10 on page 76. Show your work for each problem and circle your final answers.',
  english: 'Read pages 42–48. In your notebook, write three details that show how the main character changes. Use a quote for each detail.',
  science: 'Observe a plant for five days. Record one change each day and write a short conclusion about what you noticed.',
  history: 'Read the primary source about the town meeting. List two points of view and explain which evidence supports each one.',
  spanish: 'Read the short dialogue in Spanish. Circle five words you recognize and write the main idea in English.'
};

let isLoading = false;
let latestResult = null;
let currentSteps = [];
let focusProgress = { index: 0, completed: [] };

function updateCount() {
  charCount.textContent = `${instructionsInput.value.length.toLocaleString()} / 12,000`;
  explainButton.disabled = isLoading || !instructionsInput.value.trim();
}

exampleButtons.forEach((button) => button.addEventListener('click', () => {
  instructionsInput.value = EXAMPLES[button.dataset.example];
  updateCount();
  instructionsInput.focus();
}));

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

function addRequirementChecklist(requirements) {
  if (!requirements?.length) return;
  const section = document.createElement('section');
  section.className = 'answer-section requirements-section';
  const heading = document.createElement('h3');
  heading.textContent = 'Important requirements';
  section.appendChild(heading);
  const list = document.createElement('ul');
  list.className = 'requirement-list';
  const checked = loadRequirementChecks(requirements);
  requirements.forEach((requirement, index) => {
    const row = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked.includes(index);
    input.addEventListener('change', () => {
      const nextChecked = Array.from(list.querySelectorAll('input:checked')).map((item) => Number(item.dataset.index));
      saveRequirementChecks(requirements, nextChecked);
    });
    input.dataset.index = index;
    label.append(input, document.createTextNode(requirement));
    row.appendChild(label);
    list.appendChild(row);
  });
  section.appendChild(list);
  resultContent.appendChild(section);
}

function renderFocus() {
  const total = currentSteps.length;
  const index = Math.min(focusProgress.index, Math.max(total - 1, 0));
  focusProgress.index = index;
  focusTitle.textContent = `Step ${total ? index + 1 : 0} of ${total}`;
  focusStep.textContent = currentSteps[index] || 'There are no steps to focus on yet.';
  focusProgressBar.style.width = total ? `${((index + 1) / total) * 100}%` : '0%';
  focusPrevious.disabled = index === 0;
  focusNext.disabled = index >= total - 1;
  const complete = focusProgress.completed.includes(index);
  focusComplete.textContent = complete ? 'Completed ✓' : 'Mark complete';
  focusComplete.setAttribute('aria-pressed', String(complete));
}

function showResult(result, isError = false) {
  resultEmpty.hidden = true;
  resultLoading.hidden = true;
  resultContent.hidden = false;
  resultContent.classList.toggle('error-result', isError);
  resultActions.hidden = isError;
  completionStatus.hidden = isError;
  focusPanel.hidden = true;
  copyStatus.textContent = '';
  resultContent.replaceChildren();
  currentSteps = [];
  if (isError || typeof result === 'string') {
    resultContent.textContent = result;
    focusButton.hidden = true;
    return;
  }
  currentSteps = Array.isArray(result.steps) ? result.steps : [];
  focusProgress = loadFocusProgress(currentSteps);
  addResultSection('What your assignment means', result.summary);
  addResultSection('Steps to follow', result.steps, 'list');
  addResultSection('Things to ask your teacher', result.missingInformation, 'list');
  addRequirementChecklist(result.importantRequirements);
  focusButton.hidden = currentSteps.length === 0;
}

function resultToText(result) {
  if (typeof result === 'string') return result;
  const lines = [`What your assignment means: ${result.summary}`, '', 'Steps to follow:', ...result.steps.map((step, index) => `${index + 1}. ${step}`)];
  if (result.importantRequirements.length) lines.push('', 'Important requirements:', ...result.importantRequirements.map((item) => `- ${item}`));
  if (result.missingInformation.length) lines.push('', 'Things to ask your teacher:', ...result.missingInformation.map((item) => `- ${item}`));
  return lines.join('\n');
}

instructionsInput.addEventListener('input', updateCount);
clearButton.addEventListener('click', () => {
  instructionsInput.value = '';
  resultContent.hidden = true;
  resultEmpty.hidden = false;
  savedLabel.textContent = 'Your device only';
  resultActions.hidden = true;
  completionStatus.hidden = true;
  focusPanel.hidden = true;
  updateCount();
  instructionsInput.focus();
});
focusButton.addEventListener('click', () => {
  resultContent.hidden = true;
  resultActions.hidden = true;
  focusPanel.hidden = false;
  renderFocus();
});
focusClose.addEventListener('click', () => {
  focusPanel.hidden = true;
  resultContent.hidden = false;
  resultActions.hidden = false;
});
focusPrevious.addEventListener('click', () => { focusProgress.index -= 1; saveFocusProgress(currentSteps, focusProgress); renderFocus(); });
focusNext.addEventListener('click', () => { focusProgress.index += 1; saveFocusProgress(currentSteps, focusProgress); renderFocus(); });
focusComplete.addEventListener('click', () => {
  const index = focusProgress.index;
  focusProgress.completed = focusProgress.completed.includes(index) ? focusProgress.completed.filter((item) => item !== index) : [...focusProgress.completed, index];
  saveFocusProgress(currentSteps, focusProgress);
  renderFocus();
});
copyButton.addEventListener('click', async () => {
  const text = resultToText(latestResult);
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Copied!';
  } catch {
    copyStatus.textContent = 'Copy did not work. You can select the explanation instead.';
  }
});
explainButton.addEventListener('click', async () => {
  const instructions = instructionsInput.value.trim();
  if (!instructions) { instructionsInput.focus(); return; }
  isLoading = true;
  updateCount();
  explainLabel.textContent = 'Thinking…';
  resultEmpty.hidden = true;
  resultContent.hidden = true;
  resultActions.hidden = true;
  completionStatus.hidden = true;
  focusPanel.hidden = true;
  resultLoading.hidden = false;
  try {
    const response = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    latestResult = data.result;
    showResult(data.result);
    saveExplanation({ instructions, result: data.result, savedAt: new Date().toISOString() });
    savedLabel.textContent = 'Saved on this device';
  } catch (error) {
    showResult(`I couldn't explain that right now. ${error.message} Please compare with your teacher's original directions.`, true);
  } finally { isLoading = false; explainLabel.textContent = 'Explain directions'; updateCount(); }
});

const savedItems = loadSavedExplanations();
const latestSaved = savedItems.find((item) => !item.sample);
if (latestSaved) {
  instructionsInput.value = latestSaved.instructions;
  latestResult = latestSaved.result;
  showResult(latestSaved.result);
  savedLabel.textContent = 'Saved on this device';
}
updateCount();
