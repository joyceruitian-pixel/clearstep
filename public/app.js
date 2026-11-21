import { loadFocusProgress, loadRequirementChecks, loadSavedExplanations, loadStepChecks, saveExplanation, saveFocusProgress, saveRequirementChecks, saveStepChecks } from './storage.js';

const instructionsInput = document.querySelector('#instructions');
const explainButton = document.querySelector('#explain-button');
const clearButton = document.querySelector('#clear-button');
const charCount = document.querySelector('#char-count');
const resultEmpty = document.querySelector('#result-empty');
const resultLoading = document.querySelector('#result-loading');
const loadingMessage = document.querySelector('#loading-message');
const loadingNote = document.querySelector('#loading-note');
const resultContent = document.querySelector('#result-content');
const completionStatus = document.querySelector('#completion-status');
const simplerResultNote = document.querySelector('#simpler-result-note');
const stepProgress = document.querySelector('#step-progress');
const stepProgressLabel = document.querySelector('#step-progress-label');
const stepProgressPercent = document.querySelector('#step-progress-percent');
const stepProgressBar = document.querySelector('#step-progress-bar');
const stepProgressMessage = document.querySelector('#step-progress-message');
const resultActions = document.querySelector('#result-actions');
const copyButton = document.querySelector('#copy-button');
const copyStatus = document.querySelector('#copy-status');
const simplifyButton = document.querySelector('#simplify-button');
const restoreButton = document.querySelector('#restore-button');
const simplifyStatus = document.querySelector('#simplify-status');
const focusButton = document.querySelector('#focus-button');
const focusPanel = document.querySelector('#focus-panel');
const focusTitle = document.querySelector('#focus-title');
const focusStepHeading = document.querySelector('#focus-step-heading');
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
const previewDemo = document.querySelector('#preview-demo');
const previewDemoButton = document.querySelector('#preview-demo-button');
const previewStatus = document.querySelector('#preview-status');
const teacherReminder = document.querySelector('#teacher-reminder');
const compareButton = document.querySelector('#compare-button');
const comparisonPanel = document.querySelector('#comparison-panel');
const vocabHint = document.querySelector('#vocab-hint');
const definitionCard = document.querySelector('#definition-card');
const definitionWord = document.querySelector('#definition-word');
const definitionText = document.querySelector('#definition-text');
const definitionContext = document.querySelector('#definition-context');
const definitionClose = document.querySelector('#definition-close');
let lastDefinitionTrigger = null;

const EXAMPLES = {
  math: 'Solve problems 1–10 on page 76. Show your work for each problem and circle your final answers.',
  english: 'Read pages 42–48. In your notebook, write three details that show how the main character changes. Use a quote for each detail.',
  science: 'Observe a plant for five days. Record one change each day and write a short conclusion about what you noticed.',
  history: 'Read the primary source about the town meeting. List two points of view and explain which evidence supports each one.',
  spanish: 'Read the short dialogue in Spanish. Circle five words you recognize and write the main idea in English.'
};

const VOCABULARY = {
  analyze: ['Look closely at something to understand or explain it.', 'Here, look closely at the character’s choices and explain what they show.'],
  compare: ['Look at two or more things and explain how they are alike or different.'],
  contrast: ['Explain how two or more things are different.'],
  summarize: ['Tell the main ideas in a shorter way.'],
  evaluate: ['Judge how strong, useful, or successful something is using reasons.'],
  infer: ['Use clues and what you already know to figure something out.'],
  interpret: ['Explain what something means.'],
  describe: ['Tell what something is like using details.'],
  explain: ['Make an idea clear by giving details or reasons.'],
  identify: ['Point out or name the exact thing being asked about.'],
  justify: ['Give reasons or evidence to support your answer.'],
  support: ['Use reasons, facts, or details to back up an idea.'],
  evidence: ['Facts, details, or quotes that help prove an idea.'],
  hypothesis: ['A testable idea or prediction about what might happen.'],
  conclusion: ['The main idea you reach after looking at the information.'],
  predict: ['Use clues to say what you think will happen next.'],
  demonstrate: ['Show how something works or show that you understand it.'],
  classify: ['Put things into groups based on what they have in common.'],
  cite: ['Say where information or evidence came from.'],
  revise: ['Change your work to make it clearer or better.']
};

let isLoading = false;
let latestResult = null;
let originalResult = null;
let currentSteps = [];
let currentStepHeadings = [];
let stepChecks = [];
let focusProgress = { index: 0, completed: [] };
let currentAssignment = '';
let hasSavedFocusProgress = false;
let explanationRequestId = 0;
let loadingMessageTimer = null;

function closeDefinition({ restoreFocus = true } = {}) {
  definitionCard.hidden = true;
  definitionContext.hidden = true;
  if (restoreFocus && lastDefinitionTrigger?.isConnected) lastDefinitionTrigger.focus();
  lastDefinitionTrigger = null;
}

function showDefinition(word, trigger = null) {
  const entry = VOCABULARY[word.toLowerCase()];
  if (!entry) return;
  lastDefinitionTrigger = trigger;
  definitionWord.textContent = word;
  definitionText.textContent = entry[0];
  const context = entry[1] || '';
  definitionContext.textContent = context;
  definitionContext.hidden = !context;
  definitionCard.hidden = false;
  definitionClose.focus();
}

function appendInteractiveText(parent, text) {
  const parts = String(text ?? '').split(/(\b[A-Za-z][A-Za-z'-]*\b)/g);
  parts.forEach((part) => {
    const entry = VOCABULARY[part.toLowerCase()];
    if (!entry || !/^[A-Za-z][A-Za-z'-]*$/.test(part)) {
      parent.appendChild(document.createTextNode(part));
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vocab-word';
    button.textContent = part;
    button.setAttribute('aria-label', `Define ${part}`);
    button.addEventListener('click', () => showDefinition(part, button));
    parent.appendChild(button);
  });
}

const loadingMessages = [
  'ClearStep is organizing your directions…',
  'ClearStep is finding the important details…',
  'ClearStep is shaping clear next steps…'
];

function startLoadingMessages() {
  let index = 0;
  loadingMessage.textContent = loadingMessages[index];
  loadingNote.textContent = 'Illustrative progress while your explanation loads.';
  window.clearInterval(loadingMessageTimer);
  loadingMessageTimer = window.setInterval(() => {
    index = (index + 1) % loadingMessages.length;
    loadingMessage.textContent = loadingMessages[index];
  }, 1100);
}

function stopLoadingMessages() {
  window.clearInterval(loadingMessageTimer);
  loadingMessageTimer = null;
  loadingMessage.textContent = loadingMessages[0];
  loadingNote.textContent = 'Illustrative progress while your explanation loads.';
}

function resetDisplayedResult() {
  stopLoadingMessages();
  explanationRequestId += 1;
  isLoading = false;
  latestResult = null;
  originalResult = null;
  currentAssignment = '';
  currentSteps = [];
  currentStepHeadings = [];
  stepChecks = [];
  focusProgress = { index: 0, completed: [] };
  hasSavedFocusProgress = false;
  explainLabel.textContent = 'Explain directions';
  resultEmpty.hidden = false;
  resultLoading.hidden = true;
  resultContent.hidden = true;
  resultActions.hidden = true;
  completionStatus.hidden = true;
  simplerResultNote.hidden = true;
  stepProgress.hidden = true;
  focusPanel.hidden = true;
  teacherReminder.hidden = true;
  comparisonPanel.hidden = true;
  compareButton.setAttribute('aria-expanded', 'false');
  compareButton.textContent = 'Compare with original directions';
  vocabHint.hidden = true;
  closeDefinition({ restoreFocus: false });
  focusButton.hidden = true;
  focusResume.hidden = true;
  focusContent.hidden = false;
  copyStatus.textContent = '';
  simplifyStatus.textContent = '';
}

previewDemoButton?.addEventListener('click', () => {
  previewDemo.classList.remove('is-replaying');
  void previewDemo.offsetWidth;
  previewDemo.classList.add('is-replaying');
  previewStatus.textContent = 'Sample transformed · not live AI';
  window.setTimeout(() => { previewStatus.textContent = 'Illustrative sample · not live AI'; }, 1800);
});

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
    items.forEach((item, index) => {
      const row = document.createElement('li');
      row.className = 'step-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'step-checkbox';
      checkbox.checked = stepChecks.includes(index);
      checkbox.setAttribute('aria-label', `Mark step ${index + 1} complete`);
      checkbox.addEventListener('change', () => setStepCompleted(index, checkbox.checked));
      const copy = document.createElement('div');
      copy.className = 'step-copy';
      const stepHeading = document.createElement('strong');
      stepHeading.className = 'step-heading';
      stepHeading.textContent = makeStepHeading(item);
      const stepDescription = document.createElement('span');
      stepDescription.className = 'step-description';
      appendInteractiveText(stepDescription, item);
      copy.append(stepHeading, stepDescription);
      row.append(checkbox, copy);
      row.classList.toggle('step-complete', checkbox.checked);
      list.appendChild(row);
    });
    section.appendChild(list);
  } else {
    const text = document.createElement('p');
    appendInteractiveText(text, items);
    section.appendChild(text);
  }
  resultContent.appendChild(section);
}

function updateStepProgress() {
  const total = currentSteps.length;
  const completed = stepChecks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  stepProgressLabel.textContent = `${completed} of ${total} steps completed`;
  stepProgressPercent.textContent = `${percent}%`;
  stepProgressBar.setAttribute('aria-valuenow', String(percent));
  stepProgressBar.querySelector('span').style.width = `${percent}%`;
  stepProgressMessage.hidden = total === 0 || completed !== total;
  resultContent.querySelectorAll('.step-row').forEach((row, index) => {
    const checkbox = row.querySelector('.step-checkbox');
    if (checkbox) {
      checkbox.checked = stepChecks.includes(index);
      row.classList.toggle('step-complete', checkbox.checked);
    }
  });
}

function setStepCompleted(index, completed) {
  stepChecks = completed
    ? [...new Set([...stepChecks, index])].sort((a, b) => a - b)
    : stepChecks.filter((item) => item !== index);
  saveStepChecks(currentSteps, currentAssignment, stepChecks);
  focusProgress.completed = [...stepChecks];
  saveFocusProgress(currentSteps, currentAssignment, focusProgress);
  hasSavedFocusProgress = stepChecks.length > 0;
  updateStepProgress();
  if (!focusPanel.hidden) renderFocus();
}

function makeStepHeading(step) {
  const text = step.trim().replace(/[.!?]+$/, '');
  const match = text.match(/^(Read|Review|Identify|Find|Write|Include|Solve|Show|Observe|Record|List|Explain|Complete|Circle|Think|Look|Use|Analyze|Compare|Describe|Submit|Answer|Ask|Check|Gather|Choose|Calculate|Draw|Create|Practice|Study)\b\s*(.*)$/i);
  if (!match) return text.split(/\s+/).slice(0, 5).join(' ');
  const verb = match[1].toLowerCase();
  const headingVerb = { identify: 'Find', look: 'Look for', use: 'Use', analyze: 'Analyze', observe: 'Observe', record: 'Record', list: 'List', explain: 'Explain', complete: 'Complete', circle: 'Mark', choose: 'Choose', calculate: 'Calculate', describe: 'Describe', compare: 'Compare', gather: 'Gather' }[verb] || match[1];
  const object = match[2].split(/\s+(?:and|that|how|explaining|from|so|to|of|in|on|for|with)\s+/i)[0].split(/[,;:]\s*/)[0].split(/\s+/).slice(0, 4).join(' ');
  return `${headingVerb}${object ? ` ${object}` : ''}`;
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

function renderComparison(result) {
  comparisonPanel.replaceChildren();
  if (typeof result === 'string' || !result || result.responseType === 'refusal' || !currentAssignment) return;
  const originalColumn = document.createElement('article');
  originalColumn.className = 'comparison-column original-column';
  const originalHeading = document.createElement('h3');
  originalHeading.textContent = 'Original teacher directions';
  const originalText = document.createElement('p');
  originalText.className = 'comparison-original';
  originalText.textContent = currentAssignment;
  originalColumn.append(originalHeading, originalText);

  const explanationColumn = document.createElement('article');
  explanationColumn.className = 'comparison-column';
  const explanationHeading = document.createElement('h3');
  explanationHeading.textContent = 'ClearStep explanation';
  const summary = document.createElement('p');
  summary.className = 'comparison-summary';
  summary.textContent = result.summary || '';
  const steps = document.createElement('ol');
  steps.className = 'comparison-steps';
  (Array.isArray(result.steps) ? result.steps : []).forEach((step) => {
    const item = document.createElement('li');
    item.textContent = step;
    steps.appendChild(item);
  });
  explanationColumn.append(explanationHeading, summary);
  if (steps.children.length) explanationColumn.appendChild(steps);
  comparisonPanel.append(originalColumn, explanationColumn);
}

function updateComparisonVisibility(visible) {
  const canCompare = !resultContent.hidden && !teacherReminder.hidden && typeof latestResult !== 'string' && latestResult?.responseType !== 'refusal';
  const open = Boolean(visible) && canCompare;
  comparisonPanel.hidden = !open;
  compareButton.setAttribute('aria-expanded', String(open));
  compareButton.textContent = open ? 'Hide original directions' : 'Compare with original directions';
}

function addRefusalResult(result) {
  const section = document.createElement('section');
  section.className = 'refusal-card';
  const label = document.createElement('span');
  label.className = 'refusal-label';
  label.textContent = 'Directions, not answers';
  const heading = document.createElement('h3');
  heading.textContent = 'I can help you understand the assignment.';
  const summary = document.createElement('p');
  summary.textContent = result.summary;
  const suggestion = document.createElement('p');
  suggestion.className = 'refusal-suggestion';
  suggestion.textContent = result.suggestion || 'Paste the assignment directions, and I can explain them or break them into smaller steps.';
  section.append(label, heading, summary, suggestion);
  resultContent.appendChild(section);
}

function renderFocus() {
  const total = currentSteps.length;
  focusProgress = ClearStepFocus.normalizeProgress(focusProgress, total);
  const index = focusProgress.index;
  focusTitle.textContent = `Step ${total ? index + 1 : 0} of ${total}`;
  focusStepHeading.textContent = currentStepHeadings[index] || '';
  focusStep.replaceChildren();
  appendInteractiveText(focusStep, currentSteps[index] || 'There are no steps to focus on yet.');
  focusProgressBar.style.width = `${ClearStepFocus.completedPercent(focusProgress.completed, total)}%`;
  focusProgressLabel.textContent = `${stepChecks.length} of ${total} steps completed`;
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
  focusCompleteMessage.hidden = total === 0 || stepChecks.length !== total;
  focusPrevious.disabled = index === 0;
  focusNext.disabled = total === 0;
  focusNext.textContent = index >= total - 1 ? 'Review steps' : 'Next step';
  const complete = stepChecks.includes(index);
  focusComplete.textContent = complete ? 'Completed ✓' : 'Mark complete';
  focusComplete.setAttribute('aria-pressed', String(complete));
}

function showResult(result, isError = false) {
  const isRefusal = !isError && typeof result !== 'string' && result?.responseType === 'refusal';
  resultEmpty.hidden = true;
  resultLoading.hidden = true;
  resultContent.hidden = false;
  resultContent.classList.toggle('error-result', isError);
  resultContent.classList.toggle('refusal-result', isRefusal);
  teacherReminder.hidden = isError || isRefusal || typeof result === 'string';
  comparisonPanel.hidden = true;
  compareButton.setAttribute('aria-expanded', 'false');
  compareButton.textContent = 'Compare with original directions';
  resultActions.hidden = isError || isRefusal;
  completionStatus.hidden = isError || isRefusal;
  simplerResultNote.hidden = isError || isRefusal || typeof result === 'string' || result === originalResult;
  stepProgress.hidden = isError || isRefusal || typeof result === 'string';
  focusPanel.hidden = true;
  focusResume.hidden = true;
  focusContent.hidden = false;
  copyStatus.textContent = '';
  simplifyStatus.textContent = '';
  simplifyButton.hidden = isError || isRefusal || typeof result === 'string' || result !== originalResult;
  restoreButton.hidden = isError || isRefusal || typeof result === 'string' || result === originalResult;
  resultContent.replaceChildren();
  currentSteps = [];
  currentStepHeadings = [];
  stepChecks = [];
  stepProgress.hidden = true;
  if (isError || typeof result === 'string') {
    resultContent.textContent = result;
    focusButton.hidden = true;
    vocabHint.hidden = true;
    closeDefinition({ restoreFocus: false });
    return;
  }
  if (isRefusal) {
    addRefusalResult(result);
    focusButton.hidden = true;
    vocabHint.hidden = true;
    closeDefinition({ restoreFocus: false });
    return;
  }
  currentSteps = Array.isArray(result.steps) ? result.steps : [];
  currentStepHeadings = currentSteps.map(makeStepHeading);
  const savedProgress = loadFocusProgress(currentSteps, currentAssignment);
  const savedSteps = loadStepChecks(currentSteps, currentAssignment);
  stepChecks = ClearStepFocus.normalizeProgress({ completed: savedSteps.saved ? savedSteps.checked : savedProgress.completed }, currentSteps.length).completed;
  focusProgress = ClearStepFocus.normalizeProgress({ ...savedProgress, completed: stepChecks }, currentSteps.length);
  hasSavedFocusProgress = savedProgress.saved && (focusProgress.index > 0 || stepChecks.length > 0);
  addResultSection('What your assignment means', result.summary);
  addResultSection('Steps to follow', result.steps, 'list');
  addResultSection('Things to ask your teacher', result.missingInformation, 'list');
  addRequirementChecklist(result.importantRequirements);
  renderComparison(result);
  vocabHint.hidden = !resultContent.querySelector('.vocab-word');
  closeDefinition({ restoreFocus: false });
  stepProgress.hidden = currentSteps.length === 0;
  focusButton.hidden = currentSteps.length === 0;
  updateStepProgress();
}

compareButton.addEventListener('click', () => {
  updateComparisonVisibility(comparisonPanel.hidden);
});
definitionClose.addEventListener('click', closeDefinition);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDefinition();
});

function resultToText(result) {
  if (typeof result === 'string') return result;
  if (result.responseType === 'refusal') return `${result.summary}\n\n${result.suggestion}`;
  const lines = [`What your assignment means: ${result.summary}`, '', 'Steps to follow:', ...result.steps.map((step, index) => `${index + 1}. ${step}`)];
  if (result.importantRequirements.length) lines.push('', 'Important requirements:', ...result.importantRequirements.map((item) => `- ${item}`));
  if (result.missingInformation.length) lines.push('', 'Things to ask your teacher:', ...result.missingInformation.map((item) => `- ${item}`));
  return lines.join('\n');
}

instructionsInput.addEventListener('input', () => {
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
  stepChecks = [];
  hasSavedFocusProgress = false;
  saveStepChecks(currentSteps, currentAssignment, stepChecks);
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
  setStepCompleted(index, !stepChecks.includes(index));
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
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : data.error?.message || 'Something went wrong.');
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
  stepProgress.hidden = true;
  focusPanel.hidden = true;
  resultLoading.hidden = false;
  startLoadingMessages();
  try {
    const response = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions }) });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : data.error?.message || 'Something went wrong.');
    if (requestId !== explanationRequestId) return;
    latestResult = data.result;
    originalResult = data.result;
    currentAssignment = instructions;
    showResult(data.result);
    if (data.result.responseType !== 'refusal') {
      saveExplanation({ instructions, result: data.result, savedAt: new Date().toISOString() });
      savedLabel.textContent = 'Saved on this device';
    } else {
      savedLabel.textContent = 'Not saved';
    }
  } catch (error) {
    if (requestId !== explanationRequestId) return;
    showResult(`I couldn't explain that right now. ${error.message} Please compare with your teacher's original directions.`, true);
  } finally {
    stopLoadingMessages();
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
