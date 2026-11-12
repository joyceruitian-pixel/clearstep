const STORAGE_KEY = 'clearstep-saved-explanations';
const FOCUS_KEY = 'clearstep-focus-progress';
const REQUIREMENTS_KEY = 'clearstep-requirement-checks';
const STEPS_KEY = 'clearstep-step-checks';

const SAMPLE_ITEMS = [
  { instructions: 'Read pages 42–48 and write three details about how the main character changes.', result: 'Practice example: Read the assigned pages, notice changes in the character, and write three details. Ask your teacher if a page number or format is unclear.', sample: true },
  { instructions: 'Solve problems 1–10 on page 76 and show your work.', result: 'Practice example: Solve problems 1 through 10, and show the steps you used. Ask your teacher if “show your work” means a specific format.', sample: true },
  { instructions: 'Observe a plant for five days and record one change each day.', result: 'Practice example: Watch the plant for five days and write down one change you notice each day. Ask your teacher what to do if you do not see a change.', sample: true }
];

export function loadSavedExplanations() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ITEMS));
  return SAMPLE_ITEMS;
}

export function saveExplanation(item) {
  const saved = loadSavedExplanations().filter((entry) => !entry.sample);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...saved].slice(0, 5)));
}

function focusSignature(steps, assignmentKey) { return `${assignmentKey}\u0000${steps.join('|')}`; }

export function loadFocusProgress(steps, assignmentKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(FOCUS_KEY));
    if (saved?.signature === focusSignature(steps, assignmentKey)) return { index: saved.index, completed: saved.completed, saved: true };
  } catch {}
  return { index: 0, completed: [], saved: false };
}

export function saveFocusProgress(steps, assignmentKey, progress) {
  localStorage.setItem(FOCUS_KEY, JSON.stringify({ signature: focusSignature(steps, assignmentKey), ...progress }));
}

export function loadRequirementChecks(requirements) {
  try {
    const saved = JSON.parse(localStorage.getItem(REQUIREMENTS_KEY));
    if (saved?.signature === requirements.join('|')) return saved.checked || [];
  } catch {}
  return [];
}

export function saveRequirementChecks(requirements, checked) {
  localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify({ signature: requirements.join('|'), checked }));
}

export function loadStepChecks(steps, assignmentKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(STEPS_KEY));
    if (saved?.signature === focusSignature(steps, assignmentKey)) return { checked: saved.checked || [], saved: true };
  } catch {}
  return { checked: [], saved: false };
}

export function saveStepChecks(steps, assignmentKey, checked) {
  localStorage.setItem(STEPS_KEY, JSON.stringify({ signature: focusSignature(steps, assignmentKey), checked }));
}
