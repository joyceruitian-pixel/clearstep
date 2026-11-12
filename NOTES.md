# ClearStep notes

After each save point, push it to GitHub.

## How to run it

From this folder, run this one command:

```bash
/Users/ruitian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.js
```

Then open http://localhost:3000 in your browser.

## What is done

- Version 1 focuses on one job: paste confusing homework directions and choose Explain it.
- The AI returns a short explanation and clear steps without doing the assignment.
- The “Try an example” button fills in made-up homework directions for a quick demonstration.
- The server reads the OpenAI key only from `.env`; the browser never receives it.
- The server sends `BRIEF.md` as the AI system instructions for every explanation request.
- The OpenAI model is `gpt-4o-mini`.
- Models available to this key with “luna” in the name: `gpt-5.6-luna` and `gpt-6-luna`.
- The button shows “Thinking…” while waiting and is disabled to prevent double requests.
- A completion message says “Done — your clear steps are ready” after a successful explanation.
- Focus Mode shows one AI-generated step at a time, supports completion and navigation, and restores progress locally after reload.
- Explicit assignment requirements appear as checkboxes, and the project has a `competition-evidence/` folder with real test records and templates.
- Friendly error text appears when the key or internet connection does not work.
- Explanations and three made-up sample items are saved in localStorage, so data stays in this browser for now.
- Saves on this computer only for now.
- `.env` is ignored by Git.

## Championship polish progress

- AI results now use clear sections for the assignment meaning, numbered steps, explicit requirements, and questions for the teacher.
- Added Math, English, Science, and History examples, a Clear button, empty-input protection, Copy explanation, accessibility announcements, reduced-motion support, and a clearer first impression.
- Final checks passed for the real AI flow, structured Math response, off-topic safety refusal, empty input, copy confirmation, reload saving, homepage loading, and API-key privacy.

## Remaining limits

- Recent-history management, dark mode, and a real database remain in Maybe Later. Explain More Simply is working and now marks the easier version clearly while keeping the original available.
- More middle school student feedback is still the best next improvement for wording and usefulness.
- The 30-case AI evaluation plan is not all complete yet; cases marked “Not run” need honest testing before being called passed.

## Keep Improving progress

- Completed Rounds 5–7: stronger off-topic safety, clearer privacy wording, and a more obvious “Explain directions” action.
- Tested with made-up homework directions, an off-topic harmful request, the example button, the loading state, the AI response, and saving after reload.
- Next change: test the wording with more middle school students and use their feedback to improve the explanations.

## Focus Mode fix

- Focus Mode now starts new assignments on Step 1, keeps Previous and Next inside the available steps, and shows completed-step progress separately from the current step.
- Students can mark a step complete without being moved, and reopening an assignment shows a clear Resume or Start over choice instead of silently restoring an old step.
- Verified with a real five-step assignment in the browser and 15 automated state tests. All 15 automated tests passed.

## ClearStep 3.0 polish

- Added a working Explain more simply action that uses the private server-side AI route, then lets students return to the original explanation.
- Tested the action through the real website with the saved homework example. The original explanation, simpler explanation, and return button all worked.
- The UI-state bug found during testing was fixed before the save point.
- Focus Mode now also shows a compact overview of current, unfinished, and completed steps, plus a friendly message after every step is checked.

## ClearStep 4.0 design round

- The page now uses a premium “Clarity in Motion” visual direction: sticky brand bar, stronger hero composition, connected before-and-after preview, and a two-column input/results workspace on larger screens.
- Smaller screens switch to one column, preserve comfortable controls, and keep the homework input before the explanation.
- Verified the rendered page in a live browser, selected the Math example, reached a real three-step AI result, and opened Focus Mode at Step 1.
- Still needs a careful phone-size visual pass and more student feedback before calling the design finished.

## ClearStep UX upgrade

- Added a direct Try ClearStep link, selected-state feedback for subject examples, a clearer loading message, and a more readable numbered-step path with subtle connecting lines.
- Live browser checks confirmed the Try ClearStep action is visible, a Math example becomes selected, typing a new assignment clears the selection, and the existing explanation still renders five steps.
- All 15 Focus Mode tests and JavaScript checks passed after the UI changes.

## Creative redesign round

- Replaced the plain hero rail with a layered product preview showing a confusing assignment becoming three clear steps.
- Added a navy, ivory, coral, lavender, and teal visual system plus a Paste → Understand → Start journey to make the product feel more distinctive without adding clutter.
- Tested the rendered page with a screenshot at a 319px mobile viewport: no horizontal overflow, Try ClearStep is visible, and Focus Mode still opens at Step 1 with five overview items.

## Competition transformation round

- Removed the repeated full before-and-after section so the hero preview is the main demonstration and the actual tool appears sooner.
- Added explicit empty, loading, and success state handling, including protection against an older AI request replacing newer input.
- Live browser verification showed success state as content only, then showed the empty state only after new text was typed; no horizontal overflow was found at a 363px viewport.

## MVP feature check

- Checked the main feature with a made-up reading assignment containing pages 12–18, a 200-word minimum, two themes, two examples, and a Friday deadline.
- The real API response preserved those directions in simpler language and numbered steps without writing the paragraph.
- Checked a made-up request to solve a math equation; ClearStep returned no solution steps, so it did not complete the homework.
- No code fix was needed for this feature after the live checks. The current prompt and BRIEF.md safety rules are working as intended.

## Stop-for-today checkpoint

- What works now: ClearStep’s example, input, AI explanation, numbered steps, safety guidance, friendly errors, polished screen, and browser saving after reload.
- Very next change: Test the wording with more middle school students and use their feedback to improve the explanations.

## How to check the main job

1. Run the command above.
2. Open http://localhost:3000.
3. Paste the sample directions shown in the box.
4. Choose Explain it and wait for the clear one-sentence summary and numbered steps.
5. Refresh the page or check the browser’s local storage to confirm the saved explanation stays on this computer.

## Maybe Later

- Add a small history drawer for saved explanations.
- Add a teacher-check reminder card for unclear directions.
- Test the wording with more middle school students.
- Add a printable explanation for a student’s video demonstration.
- Replace localStorage with a real database after the first version is tested.
