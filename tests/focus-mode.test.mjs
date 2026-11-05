import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../public/focus-state.js', import.meta.url), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context);
const Focus = context.globalThis.ClearStepFocus;

const steps = ['Read', 'Find', 'Write'];

const plain = (value) => JSON.parse(JSON.stringify(value));

test('new focus progress starts at Step 1', () => assert.deepEqual(plain(Focus.normalizeProgress({}, steps.length)), { index: 0, completed: [] }));
test('Next moves Step 1 to Step 2', () => assert.equal(Focus.nextIndex(0, 3), 1));
test('Next moves Step 2 to Step 3', () => assert.equal(Focus.nextIndex(1, 3), 2));
test('Previous moves Step 3 to Step 2', () => assert.equal(Focus.previousIndex(2, 3), 1));
test('Previous cannot move before Step 1', () => assert.equal(Focus.previousIndex(0, 3), 0));
test('Next cannot move beyond the final step', () => assert.equal(Focus.nextIndex(2, 3), 2));
test('Marking a step complete records it', () => assert.deepEqual(plain(Focus.normalizeProgress({ index: 1, completed: [1] }, 3).completed), [1]));
test('Next does not automatically complete a step', () => assert.deepEqual({ index: Focus.nextIndex(0, 3), completed: [] }, { index: 1, completed: [] }));
test('Mark Complete does not change the current step', () => assert.equal(Focus.normalizeProgress({ index: 1, completed: [1] }, 3).index, 1));
test('Invalid saved index is reset into bounds', () => assert.equal(Focus.normalizeProgress({ index: 99 }, 3).index, 2));
test('Invalid saved completed steps are removed', () => assert.deepEqual(plain(Focus.normalizeProgress({ completed: [-1, 0, 8, 0] }, 3).completed), [0]));
test('A single-step assignment stays on Step 1', () => assert.equal(Focus.nextIndex(0, 1), 0));
test('Rapid Next clicks cannot skip beyond the final step', () => {
  let index = 0;
  for (let click = 0; click < 20; click += 1) index = Focus.nextIndex(index, 3);
  assert.equal(index, 2);
});
test('Progress percentage uses completed steps', () => assert.equal(Focus.completedPercent([0], 5), 20));
test('Saved progress can restore the same valid step and completion list', () => assert.deepEqual(plain(Focus.normalizeProgress({ index: 1, completed: [0] }, 3)), { index: 1, completed: [0] }));
