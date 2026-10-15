# Biblical Atlas — optional historical-place-name disclosure preview
**15 October 2026.** Owner: `src/find/bible-atlas.js`. Coordination: #342. Editorial source: merged #1243.

## Purpose
The existing opt-in cinematic Biblical Atlas can render the **11 curated bilingual historical-name notes** inside its **existing event detail sheet**, behind a second explicit review flag. The current ordinary Atlas and the cinematic-only mode show **no historical-name disclosure**.

**Review entry (only after deployment):** `?atlasCinema=1&atlasHistory=1` → Explore → Biblical Atlas → select an eligible event → expand the existing event sheet → open **Historical name / Nom historique**.

- The existing 151 canonical events, eventKey identity, Scripture handoff, follow/pan behavior, 35 pin keys, source accuracy, physical map, and 22 permanent EN/FR map labels remain as before.
- The historical panel is a `<details>` disclosure (closed by default), adjacent to—not replacing—the existing independent geographical qualification and canonical **Read Scripture** action.
- **11** source-linked notes are projected from `data/explore/biblical-atlas-contextual-name-proposals.research.v1.json`, keyed to **existing source geo key and narrative era**. Every note includes one source Pleiades name URI and scholarly/ancient-source links. This is a small display projection, **not a new gazetteer**.
- Other 11 reviewed settlement aliases were intentionally suppressed by the editorial owner; they never get a new note. A note appears only when its broad narrative era fits the existing event. No year/date is inferred from an ordinal era.
- The separate `atlasHistory` URL flag has **no effect** without `atlasCinema=1`. No changes to the unflagged public experience or existing cinematic-only review.

## Test/acceptance
`node tests/atlas-historical-name-disclosure.mjs` asserts exact parity of the 11 rendered annotations with the frozen editorial notes (EN/FR, named URI, sources), suppression of 11 redundant extras, no appearance without the explicit opt-in, unchanged 151 event identities and original geo owner. `node tests/atlas-historical-name-disclosure-phone.mjs` exercises actual mobile Playwright Chromium at **320, 390 and 768 px**, opening the compact event sheet and historical disclosure, validating overflow and safe links, switching to a suppressed location, then entering and returning from the original native Scripture reader. Dedicated workflow `atlas-historical-disclosure-review.yml` combines source tests and screenshot artifacts.

**Remaining manual QA:** inspect all 3 screenshots for legibility, tactile sizing, scroll behavior and styling; real physical Android Chrome thumb/drag/Follow remains separately held. Release requires explicit editorial sign-off of bilingual historic explanations and references. This rollout is deliberately review-only; neither map labels nor story narratives are automatically historically renamed.
