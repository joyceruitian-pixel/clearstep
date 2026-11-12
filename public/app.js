import { loadFocusProgress, loadRequirementChecks, loadSavedExplanations, saveExplanation, saveFocusProgress, saveRequirementChecks } from './storage.js';

const instructionsInput = document.querySelector('#instructions');
const explainButton = document.querySelector('#explain-button');
const clearButton = document.querySelector('#clear-button');
const charCount = document.querySelector('#char-count');
const resultEmpty = document.querySelector('#result-empty');
const resultLoading = document.querySelector('#result-loading');
const resultContent = document.querySelector('#result-content');
const completionStatus = document.querySelector('#completion-status');
const simplerResultNote = document.querySelector('#simpler-result-note');
const resultActions = document.querySelector('#result-actions');
const copyButton = document.querySelector('#copy-button');
const copyStatus = document.querySelector('#copy-status');
const simplifyButton = document.querySelector('#simplify-button');
const restoreButton = document.querySelector('#restore-button');
const simplifyStatus = document.querySelector('#simplify-status');
const focusButton = document.querySelector('#focus-button');
const focusPanel = document.querySelector('#focus-panel');
const focusTitle = document.querySelector('#focus-title');
const focusStep = document.querySelector('#focus-step');
const focusProgressBar = document.querySelector('#focus-progress-bar');
const focusProgressLabel = document.querySelector('#focus-progress-label');
const focusOverview = document.querySelector('#focus-overview');
const focusCompleteMessage = document.querySelector('#focus-complete-message');
const focusPrevious = document.querySelector('#focus-previous');
const focusComplete = document.querySelector('#focus-complete');
const focusNext = document.querySelector('#focus-next');
const focusClose = document.querySelector('#focus-close');
const focusResume = document.querySelector('#focus-resume');
const focusContent = document.querySelector('#focus-content');
const resumeStepNumber = document.querySelector('#resume-step-number');
const resumeButton = document.querySelector('#resume-button');
const startOverButton = document.querySelector('#start-over-button');
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
let originalResult = null;
let currentSteps = [];
let focusProgress = { index: 0, completed: [] };
let currentAssignment = '';
let hasSavedFocusProgress = false;
let explanationRequestId = 0;

function resetDisplayedResult() {
  explanationRequestId += 1;
  isLoading = false;
  latestResult = null;
  originalResult = null;
  currentAssignment = '';
  currentSteps = [];
  focusProgress = { index: 0, completed: [] };
  hasSavedFocusProgress = false;
  explainLabel.textContent = 'Explain directions';
  resultEmpty.hidden = false;
  resultLoading.hidden = true;
  resultContent.hidden = true;
  resultActions.hidden = true;
  completionStatus.hidden = true;
  simplerResultNote.hidden = true;
  focusPanel.hidden = true;
  focusButton.hidden = true;
  focusResume.hidden = true;
  focusContent.hidden = false;
  copyStatus.textContent = '';
  simplifyStatus.textContent = '';
}

function updateCount() {
  charCount.textContent = `${instructionsInput.value.length.toLocaleString()} / 12,000`;
  explainButton.disabled = isLoading || !instructionsInput.value.trim();
}

exampleButtons.forEach((button) => button.addEventListener('click', () => {
  resetDisplayedResult();
  exampleButtons.forEach((item) => {
    item.classList.toggle('selected', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  instructionsInput.value = EXAMPLES[button.dataset.example];
  updateCount();
  instructionsInput.focus();
}));

function addResultSection(title, items, type = 'paragraph') {
  if (!items || (Array.isArray(items) && items.length === 0)) return;
  const section = document.createElement('section');
  section.className = 'answer-section';
  if (type === 'list') section.classList.add('steps-section');
  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);
  if (type === 'list') {
    const list = document.createElement('ol');
    list.className = 'answer-list';
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
  focusProgress = ClearStepFocus.normalizeProgress(focusProgress, total);
  const index = focusProgress.index;
  focusTitle.textContent = `Step ${total ? index + 1 : 0} of ${total}`;
  focusStep.textContent = currentSteps[index] || 'There are no steps to focus on yet.';
  focusProgressBar.style.width = `${ClearStepFocus.completedPercent(focusProgress.completed, total)}%`;
  focusProgressLabel.textContent = `${focusProgress.completed.length} of ${total} steps completed`;
  focusOverview.replaceChildren();
  currentSteps.forEach((step, stepIndex) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const complete = focusProgress.completed.includes(stepIndex);
    button.type = 'button';
    button.className = 'focus-overview-item';
    button.textContent = `Step ${stepIndex + 1} — ${complete ? 'Complete' : stepIndex === index ? 'Current' : 'Not started'}`;
    if (stepIndex === index) button.setAttribute('aria-current', 'step');
    button.addEventListener('click', () => {
      focusProgress.index = stepIndex;
      saveFocusProgress(currentSteps, currentAssignment, focusProgress);
      hasSavedFocusProgress = true;
      renderFocus();
    });
    item.appendChild(button);
    focusOverview.appendChild(item);
  });
  focusCompleteMessage.hidden = total === 0 || focusProgress.completed.length !== total;
  focusPrevious.disabled = index === 0;
  focusNext.disabled = total === 0;
  focusNext.textContent = index >= total - 1 ? 'Review steps' : 'Next step';
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
  simplerResultNote.hidden = isError || typeof result === 'string' || result === originalResult;
  focusPanel.hidden = true;
  focusResume.hidden = true;
  focusContent.hidden = false;
  copyStatus.textContent = '';
  simplifyStatus.textContent = '';
  simplifyButton.hidden = isError || typeof result === 'string' || result !== originalResult;
  restoreButton.hidden = isError || typeof result === 'string' || result === originalResult;
  resultContent.replaceChildren();
  currentSteps = [];
  if (isError || typeof result === 'string') {
    resultContent.textContent = result;
    focusButton.hidden = true;
    return;
  }
  currentSteps = Array.isArray(result.steps) ? result.steps : [];
  const savedProgress = loadFocusProgress(currentSteps, currentAssignment);
  focusProgress = ClearStepFocus.normalizeProgress(savedProgress, currentSteps.length);
  hasSavedFocusProgress = savedProgress.saved && (focusProgress.index > 0 || focusProgress.completed.length > 0);
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

instructionsInput.addEventListener('input', () => {
  resetDisplayedResult();
  exampleButtons.forEach((item) => {
    item.classList.remove('selected');
    item.setAttribute('aria-pressed', 'false');
  });
  updateCount();
});
clearButton.addEventListener('click', () => {
  instructionsInput.value = '';
  resetDisplayedResult();
  savedLabel.textContent = 'Your device only';
  updateCount();
  instructionsInput.focus();
});
focusButton.addEventListener('click', () => {
  resultContent.hidden = true;
  resultActions.hidden = true;
  focusPanel.hidden = false;
  if (hasSavedFocusProgress) {
    focusResume.hidden = false;
    focusContent.hidden = true;
    resumeStepNumber.textContent = focusProgress.index + 1;
  } else {
    focusResume.hidden = true;
    focusContent.hidden = false;
    renderFocus();
  }
});
resumeButton.addEventListener('click', () => { focusResume.hidden = true; focusContent.hidden = false; renderFocus(); });
startOverButton.addEventListener('click', () => {
  focusProgress = { index: 0, completed: [] };
  hasSavedFocusProgress = false;
  saveFocusProgress(currentSteps, currentAssignment, focusProgress);
  focusResume.hidden = true;
  focusContent.hidden = false;
  renderFocus();
});
focusClose.addEventListener('click', () => {
  focusPanel.hidden = true;
  resultContent.hidden = false;
  resultActions.hidden = false;
});
focusPrevious.addEventListener('click', () => { focusProgress.index = ClearStepFocus.previousIndex(focusProgress.index, currentSteps.length); saveFocusProgress(currentSteps, currentAssignment, focusProgress); hasSavedFocusProgress = true; renderFocus(); });
focusNext.addEventListener('click', () => {
  if (focusProgress.index >= currentSteps.length - 1) { focusClose.click(); return; }
  focusProgress.index = ClearStepFocus.nextIndex(focusProgress.index, currentSteps.length);
  saveFocusProgress(currentSteps, currentAssignment, focusProgress);
  hasSavedFocusProgress = true;
  renderFocus();
});
focusComplete.addEventListener('click', () => {
  const index = focusProgress.index;
  focusProgress.completed = focusProgress.completed.includes(index) ? focusProgress.completed.filter((item) => item !== index) : [...focusProgress.completed, index];
  saveFocusProgress(currentSteps, currentAssignment, focusProgress);
  hasSavedFocusProgress = true;
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
simplifyButton.addEventListener('click', async () => {
  if (isLoading || !originalResult) return;
  isLoading = true;
  simplifyButton.disabled = true;
  simplifyButton.textContent = 'Simplifying…';
  simplifyStatus.textContent = '';
  try {
    const response = await fetch('/api/explain-simply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions: currentAssignment }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    latestResult = data.result;
    showResult(latestResult);
  } catch (error) {
    simplifyStatus.textContent = `I couldn't simplify that right now. ${error.message}`;
  } finally {
    isLoading = false;
    simplifyButton.disabled = false;
    simplifyButton.textContent = 'Explain more simply';
  }
});
restoreButton.addEventListener('click', () => {
  latestResult = originalResult;
  showResult(originalResult);
});
explainButton.addEventListener('click', async () => {
  const instructions = instructionsInput.value.trim();
  if (!instructions) { instructionsInput.focus(); return; }
  const requestId = ++explanationRequestId;
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
    if (requestId !== explanationRequestId) return;
    latestResult = data.result;
    originalResult = data.result;
    currentAssignment = instructions;
    showResult(data.result);
    saveExplanation({ instructions, result: data.result, savedAt: new Date().toISOString() });
    savedLabel.textContent = 'Saved on this device';
  } catch (error) {
    if (requestId !== explanationRequestId) return;
    showResult(`I couldn't explain that right now. ${error.message} Please compare with your teacher's original directions.`, true);
  } finally {
    if (requestId !== explanationRequestId) return;
    isLoading = false;
    explainLabel.textContent = 'Explain directions';
    updateCount();
  }
});

const savedItems = loadSavedExplanations();
const latestSaved = savedItems.find((item) => !item.sample);
if (latestSaved) {
  instructionsInput.value = latestSaved.instructions;
  currentAssignment = latestSaved.instructions;
  latestResult = latestSaved.result;
  originalResult = latestSaved.result;
  showResult(latestSaved.result);
  savedLabel.textContent = 'Saved on this device';
}
updateCount();
