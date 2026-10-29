# Prayer B34 — Guided Novena progress cue
**29 October 2026 — finite reader usability correction**

## Defect confirmed from source
The Novena reader defines `stageRail(n)` and ships its CSS, yet `renderDay` never invokes it. The shared devotional timeline deliberately hides stop numbers in this reader. Therefore a reader following a guided nine-day Novena has a selected day but lacks clear progress through that day's source-owned chapters.

## Implemented
- Render the existing segmented progress rail **only in Guided mode**, between the compact nine-day selector and the prayer card.
- Derive the segment count from `stages(n)`, preserving historical variant patterns: three, four, five or six chapters, never a fixed five.
- State the current stage in EN and FR, with a proper progressbar accessible name, min/max/now/value-text; mark decorative segments as hidden from assistive technology.
- Make the caption a readable 13px text and use a restrained liturgical accent on the active segment. Keep the user-facing title timeline and the original forward/backward stage navigation unchanged.
- Simple mode continues to show the complete day without any invented intra-day progress.
- No changes to prayer content, editions, calendar date, Rosary, Mass, source qualification, historical French/English witness switching or ownership.

## Evidence and release checks
- `tests/pray-novena-stage-progress-contract.mjs` is part of the existing `test:pray-novenas` chain.
- The current 320px/390px Chromium witness acceptance is extended to assert the English Holy Ghost **4-stage** and French historical Holy Face **3-stage** guided sequences, previous/next controls, visual bar segments, computed minimum caption font size, accessibility attributes, Simple-mode isolation and zero horizontal overflow.
- The existing targeted Novena phone workflow now runs this new contract on every relevant runtime/style change.
- Treat browser acceptance as functional verification; a human aesthetic review of full-screen images remains distinct from any claim that all Prayer reader typography is signed off.

**Exit gate:** required main plus targeted phone acceptance green, merge to main and verify Vercel production READY at the exact commit. The separate Biblical Atlas workflow does not govern source-owned Prayer typography.
