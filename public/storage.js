const STORAGE_KEY = 'clearstep-saved-explanations';

const SAMPLE_ITEMS = [
  { instructions: 'Read pages 42–48 and write three details about how the main character changes.', result: 'Practice example: Read the assigned pages, notice changes in the character, and write three details. Ask your teacher if a page number or format is unclear.', sample: true }
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
