(() => {
  function normalizeProgress(progress, total) {
    const maxIndex = Math.max(total - 1, 0);
    const index = Number.isInteger(progress?.index) ? Math.max(0, Math.min(progress.index, maxIndex)) : 0;
    const completed = Array.isArray(progress?.completed)
      ? [...new Set(progress.completed.filter((item) => Number.isInteger(item) && item >= 0 && item < total))]
      : [];
    return { index, completed };
  }

  function nextIndex(index, total) { return Math.min(index + 1, Math.max(total - 1, 0)); }
  function previousIndex(index, total) { return Math.max(index - 1, 0); }
  function completedPercent(completed, total) { return total ? Math.round((completed.length / total) * 100) : 0; }

  globalThis.ClearStepFocus = { normalizeProgress, nextIndex, previousIndex, completedPercent };
})();
