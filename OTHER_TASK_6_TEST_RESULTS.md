# ClearStep — Other Task 6 Test Results

Task 6: The user can pick their grade so the explanation fits their level.

## Grade-level tests

| # | Test | Actual result | Status |
| --- | --- | --- | --- |
| 1 | Default explanation level | The selector offers “Simple language (recommended).” The default is also used when localStorage is empty or invalid. | Pass — code review; fresh-profile browser test not run |
| 2 | Select 5th grade and explain | A live browser request was regenerated with 5th grade. The result was labeled “5th-grade explanation” and kept the two-evidence requirement. | Pass — live AI/browser |
| 3 | Select 8th grade and explain | A live browser request used 8th grade and displayed an “8th-grade explanation” label with numbered steps. | Pass — live AI/browser |
| 4 | Select 12th grade and explain | The allowlisted option and fixed high-school guidance exist, but a live 12th-grade request was not run. | Not tested — live AI |
| 5 | Compare 5th, 8th, and 12th grade | Live 8th- and 5th-grade results were observed for the same assignment. The 8th-grade result had 3 steps; the regenerated 5th-grade result had 2 steps. Both preserved “two pieces of textual evidence.” A 12th-grade response was not run. | Partly tested — live AI |
| 6 | Preserve pages, question numbers, and deadline | The prompt explicitly requires exact requirements to be preserved, but this exact test assignment was not sent live at every level. | Pass — code review; live assignment not tested |
| 7 | Complex science assignment | Fixed guidance covers vocabulary and step complexity, but this assignment was not run live. | Not tested — live AI |
| 8 | Change grade before submitting | The final selected value is read only when Explain directions is pressed; changing the selector itself sends no request. | Pass — code review |
| 9 | Change grade after generating | Changing from 8th to 5th kept the old result labeled “8th-grade explanation” and revealed “Update explanation.” | Pass — live browser |
| 10 | Regenerate explanation | Clicking “Update explanation” made a real request and replaced the result with a “5th-grade explanation” while keeping the original assignment. | Pass — live AI/browser |
| 11 | Failed regeneration | The update handler keeps the previous result visible and shows an update failure message, but a forced network failure was not simulated in the browser. | Pass — code review; failure simulation not tested |
| 12 | Refresh website | The selected grade is stored as one localStorage value and restored after page load. | Pass — code review; refresh was not separately repeated |
| 13 | Reset preference | Selecting “Simple language (recommended)” stores the general mode for future requests. | Pass — code review |
| 14 | Explain more simply | The existing action now sends the selected grade and keeps the selected preference; a live simplify request was not run during this task. | Pass — code review; live AI not tested |
| 15 | Follow-up question | No separate follow-up-question UI or route was found in the inspected repository files, so this approved feature could not be live-tested or modified. | Not tested — existing feature not present in checkout |
| 16 | Homework-completion refusal | The grade guidance is appended to the existing safety instructions and does not change refusal rules. A grade-selected refusal was not run live. | Pass — code review; live AI not tested |
| 17 | Vocabulary definitions | Existing clickable words and “Words that might help” remained visible in the grade-specific live result. | Pass — live browser |
| 18 | Focus Mode | The grade-specific result still showed the existing Focus Mode control; opening and navigating Focus Mode was not repeated after this change. | Pass — code review; live navigation not retested |
| 19 | Progress preservation | Changing the grade without regenerating does not touch progress state. Regeneration uses the existing step signature so unrelated completed steps are not blindly reused. | Pass — code review |
| 20 | Empty input | Existing empty-input guard remains unchanged. | Pass — code review |
| 21 | Invalid grade value | The server uses an allowlist and falls back to `simple` for unsupported values. | Pass — code review |
| 22 | Mobile layout | A responsive single-column selector style was added for small screens, but 390px and 320px browser viewport checks were not available in this run. | Not tested — viewport |
| 23 | Keyboard accessibility | The native select has a visible focus style and is keyboard-selectable; the browser UI was not completed with a keyboard-only pass. | Pass — code review; keyboard-only live test not run |
| 24 | Rapid grade changes | Grade changes only save local preference and update the pending-state label; they do not call the API until Update explanation or Explain directions is pressed. | Pass — code review |
| 25 | Privacy | Only a grade-level string is stored. The selector does not ask for age, birthday, name, school, or other identifying information. | Pass — code review |

## Live comparison observed

For the assignment “Analyze the main character’s motivation and support your explanation with two pieces of textual evidence.”:

- 8th grade: live result was labeled “8th-grade explanation” and displayed 3 numbered steps.
- 5th grade after Update explanation: live result was labeled “5th-grade explanation” and displayed 2 numbered steps.
- Both visible results kept “two pieces of textual evidence”; the 5th-grade screenshot is saved as `other-task-6-proof.png`.
- No 12th-grade response is claimed because it was not generated in this run.

## Regression checks

`node --check public/app.js`, `node --check server.js`, `node --check lib/openai.js`, and `git diff --check` completed successfully. The existing Focus Mode suite remains the project’s automated regression suite and should be rerun before the final commit.
