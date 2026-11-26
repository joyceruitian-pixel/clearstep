# Other Task 7 — Test Results

Feature tested: “The user can see a list of what to turn in at the end.”

## Results

| # | Test | Expected | Actual result | Status | Notes |
|---|---|---|---|---|---|
| 1 | English response with Friday deadline | Identify response and deadline | Live AI result showed five checklist items, including “One-page response,” “Include two quotes from the story,” “Explain how the quotes support your ideas,” “Submit by Friday,” and “Due: Friday”; it did not write the response. | Pass | Live browser test. |
| 2 | Math worksheet | Preserve problems, page, and show-work requirement | Not run with a live AI request. | Not tested | Schema and UI support these fields. |
| 3 | Science poster | Preserve poster, quantity, advantages, disadvantages | Not run with a live AI request. | Not tested | — |
| 4 | History timeline | Preserve timeline and event count | Not run with a live AI request. | Not tested | — |
| 5 | Multiple deliverables | List every deliverable | Not run with a live AI request. | Not tested | — |
| 6 | Exact formatting requirements | Preserve word count, sources, citations, and file type | Not run with a live AI request. | Not tested | Prompt/schema review only. |
| 7 | Explicit submission method | Show only stated method | Not run with a live AI request. | Not tested | — |
| 8 | No submission method | Do not invent a platform | Code review confirms method is only rendered when returned by the AI. | Pass | — |
| 9 | No deadline | Do not invent a deadline | Code review confirms deadline is only rendered when returned by the AI. | Pass | — |
| 10 | Relative deadline | Preserve teacher wording | Code review confirms returned wording is displayed without date conversion. | Pass | — |
| 11 | No deliverable | Explain uncertainty | Code review confirms missing-information text is shown when no checklist item exists. | Pass | — |
| 12 | Unclear assignment | Tell student to check directions | Code review confirms `missingInformation` is displayed safely. | Pass | — |
| 13 | Optional requirement | Do not make optional work required | Not run with a live AI request. | Not tested | — |
| 14 | Alternative deliverables | Preserve a choice | Not run with a live AI request. | Not tested | — |
| 15 | Homework-completion refusal | Refuse and hide checklist | Existing refusal branch clears/hides checklist fields. | Pass | Code review. |
| 16 | Check an item | Count increases | Live browser: changed from 0 of 1 to 1 of 1 ready. | Pass | Live browser test. |
| 17 | Uncheck an item | Count decreases | Checkbox handler supports independent unchecking; not separately clicked in this run. | Pass | Code review. |
| 18 | Complete all items | Show careful completion message | Live browser showed “You’ve checked every item!” plus teacher reminder. | Pass | No claim of assignment verification. |
| 19 | Independent progress trackers | Keep step progress separate | Live browser kept numbered-step progress at 0 of 4 while checklist reached 1 of 1. | Pass | Live browser test. |
| 20 | Focus Mode | Reach checklist without breaking Focus Mode | Live browser showed “Review what to turn in” in Focus Mode; exiting restored the result. | Pass | Live browser test. |
| 21 | Grade-level changes | Keep requirements stable | Existing grade feature remains in the same result flow; not compared with two new live requests. | Not tested | — |
| 22 | Explain more simply | Preserve requirements | Existing simplify path remains separate; not run in this task’s live test. | Not tested | — |
| 23 | Refresh | Restore matching checklist progress | Signature-based localStorage code review passed; refresh not separately run. | Pass | Code review. |
| 24 | Clear assignment | Remove old checklist | `resetDisplayedResult()` hides and clears checklist state. | Pass | Code review. |
| 25 | New assignment | Replace checklist and state | Live new assignment replaced the old saved result and generated a new checklist. | Pass | Live browser test. |
| 26 | API failure | Avoid misleading old checklist | Error branch hides checklist; failure simulation was not run. | Pass | Code review; simulation not run. |
| 27 | Older saved explanation | Do not crash | Type filtering and empty defaults handle missing old fields. | Pass | Code review. |
| 28 | Mobile layout | Readable with no overflow | Mobile viewport was not separately automated in this run. | Not tested | CSS includes a mobile checklist layout. |
| 29 | Keyboard accessibility | Toggle with keyboard and show focus | Native checkboxes/buttons, labels, progress semantics, and focus styles are present; keyboard-only run not captured. | Pass | Code review. |
| 30 | Long assignment | Stay organized | Not run with a live long assignment. | Not tested | — |

## Automated regression

Command:

```text
/Users/ruitian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/focus-mode.test.mjs
```

Result: **15 passed, 0 failed**.

Additional checks:

- `node --check public/app.js` — passed.
- `node --check server.js` — passed.
- `node --check lib/openai.js` — passed.
- `git diff --check` — passed.

The live AI test used these directions:

> Write a one-page response explaining the main character's motivation. Include two quotes from the story and explain how they support your ideas. Submit your response by Friday.

The actual checklist response contained five items: **One-page response**, **Write a one-page response**, **Include two quotes from the story**, **Explain how the quotes support your ideas**, and **Submit by Friday**. It also showed **Due: Friday**. The AI preserved the requirements in the numbered steps and important-requirements section.

## Scope note

The current checkout does not contain the earlier follow-up-question UI or route, so this task preserved the existing files and did not invent that feature. Other Task 8 was not implemented.
