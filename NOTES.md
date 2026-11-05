# ClearStep notes

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
- Friendly error text appears when the key or internet connection does not work.
- Explanations and three made-up sample items are saved in localStorage, so data stays in this browser for now.
- Saves on this computer only for now.
- `.env` is ignored by Git.

## Championship polish progress

- AI results now use clear sections for the assignment meaning, numbered steps, explicit requirements, and questions for the teacher.
- Added Math, English, Science, and History examples, a Clear button, empty-input protection, Copy explanation, accessibility announcements, reduced-motion support, and a clearer first impression.
- Final checks passed for the real AI flow, structured Math response, off-topic safety refusal, empty input, copy confirmation, reload saving, homepage loading, and API-key privacy.

## Remaining limits

- Optional features such as step checkboxes, recent-history management, Explain More Simply, dark mode, and a real database remain in Maybe Later.
- More middle school student feedback is still the best next improvement for wording and usefulness.

## Keep Improving progress

- Completed Rounds 5–7: stronger off-topic safety, clearer privacy wording, and a more obvious “Explain directions” action.
- Tested with made-up homework directions, an off-topic harmful request, the example button, the loading state, the AI response, and saving after reload.
- Next change: test the wording with more middle school students and use their feedback to improve the explanations.

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
