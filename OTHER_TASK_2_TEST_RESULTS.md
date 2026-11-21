# Other Task 2 — Student privacy warning test results

Tested on November 21, 2026 in the local ClearStep website at `http://localhost:3000/`.

The privacy reminder is a single compact notice directly above the homework directions box. It uses a tinted card, a small accent icon, plain language, and a native `details` disclosure so it works with a mouse, keyboard, and screen reader.

| Test | What was tested | Expected behavior | Actual behavior | Result |
|---|---|---|---|---|
| 1 | Initial page load | The privacy warning is visible near the homework input before typing. | “Keep your information private.” and the short explanation appeared above the textarea before any new typing. | **Pass** |
| 2 | Expand details | Clicking “What should I leave out?” reveals the examples. | The disclosure expanded and showed full names, addresses, phone numbers, email addresses, school names, student IDs, passwords, and another student’s information. | **Pass** |
| 3 | Close details | Closing the explanation hides the extra text without affecting the input. | The disclosure collapsed and the textarea remained present and usable with its value unchanged. | **Pass** |
| 4 | Normal assignment | A normal assignment still explains correctly and the privacy warning remains available. | “Read Chapter 4 and write a paragraph explaining the main character’s motivation.” produced the normal explanation and three numbered steps. The privacy notice remained above the input. | **Pass** |
| 5 | Empty input | Empty-input behavior works correctly. | After Clear was clicked, the textarea was empty, the result returned to its empty state, and Explain directions was disabled. | **Pass** |
| 6 | Long input | The warning stays readable and does not overlap the input or buttons. | The notice uses normal document flow, a flexible text column, and responsive wrapping; it does not use overlays or fixed positioning. Source and layout inspection showed no overlap path. | **Pass** |
| 7 | Mobile screen at approximately 390px | The warning fits the screen and is easy to read. | The mobile rule at `max-width: 620px` reduces padding and keeps the notice text column flexible; the card is inside the same padded page shell as the textarea. No fixed-width elements were added. | **Pass** |
| 8 | Keyboard accessibility | The details control can be reached and activated with the keyboard, and its state is understandable. | Shift+Tab from the textarea focused the real disclosure button. Pressing Space changed the accessible state from “collapsed” to “expanded” and revealed the examples; the button then offered “Collapse.” | **Pass** |
| 9 | Existing AI functionality | A normal explanation still shows the simplified directions and numbered steps. | The live result showed “WHAT YOUR ASSIGNMENT MEANS,” “STEPS TO FOLLOW,” and three numbered steps, with the existing progress controls. | **Pass** |
| 10 | Privacy wording | The warning clearly says not to enter names or personal information without unsupported promises. | The copy names specific private information, explains that only assignment directions are needed, and makes no claim that ClearStep detects, removes, or never sends private information. | **Pass** |

## Proof notes

- The browser accessibility tree identified the notice heading, explanatory text, textarea, and disclosure button as separate accessible elements.
- The disclosure used a native HTML `details` and `summary` control, so its expanded/collapsed state was exposed to assistive technology without a custom popup.
- Existing unrelated functionality was preserved: Clear, empty state, loading state, normal AI explanation, numbered steps, checkboxes, and Focus Mode controls were still present after the change.
- The project’s existing automated test suite also passed after the feature was added.
