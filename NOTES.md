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
