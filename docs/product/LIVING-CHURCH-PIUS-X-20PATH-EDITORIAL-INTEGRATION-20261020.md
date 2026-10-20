# Living Church P2 — St Pius X 20-path editorial source integration

**20 October 2026 · PR #1402 scene owner + PR #1458 Formation original-content owner. NOT PUBLISHED.**

## What changed

The existing P2 visual-novel scene is extended by three small, optional pieces; the old ten-conversation pilot remains unchanged:
- `previews/visible-mass-3d/living-church-pius20-source-bridge.mjs` verifies the immutable **Formation PR #1458 source commit `6883412a1a5f56c0ff8602910d20024a3744ff33`** and reads exactly 15 original owner JSON files (the nav, ten original Q&A shards, correction, Chanoine eligibility, pose and period-voice research). It enforces 100 source questions / 200 draft turns / zero approved answers. No copy of Catechism doctrine or new generated speech is stored in P2.
- `previews/visible-mass-3d/living-church-pius20-scene.mjs` provides 20-chapter, EN/FR, visitor-choice navigation and opt-in Chanoine eligibility explanation, using the original `#lc-stage` character stage.
- `previews/visible-mass-3d/living-church-character-scene.mjs` accepts `pius20Review` as an optional source-owned object and renders the same approved `pius_*.webp` portraits, native source panel, close button and existing guide choices.

The entry is displayed only for `?aoLivingChurchReview=1&aoPius20Review=1`. The 15 source-owner files are fetched only under that explicit query parameter. A failed source load does not break the normal Living Church, Sacristan, Canon, native Catechism, Mass Explorer, photo view or older ten Pius X pilot.

For a local preview server, open:

`previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1&aoPius20Review=1`

Open **Meet the guides → St Pius X → Explore 20 source-backed Catechism paths · EDITORIAL REVIEW**.

## Source and speaker boundaries

- `PX1905-Qnnn` is an **editorial locator**, not a printed original 1905 question number.
- The character renders bilingual Catechism-derived **unapproved educational paraphrases**, not personally recorded words of Pius X.
- Historical discipline qualifications are shown only as *editorial notes*, not in character.
- The reviewed period-style alternatives remain in Formation's separate opt-in reviewer. No historical voice approvals were silently granted here.
- The number of Denzinger verifications required is **zero** for SPX. There is no Denzinger dependency in the scene.
- Opt-in Chanoine referral checks explain whether a narrow AQ04/AQ05 content-owner candidate exists. Neither a source candidate nor a permitted switch to the pre-existing Canon guide grants approval for a specific new Canon response.
- The form for unconstrained questions and unrelated objective doorway are hidden while the 20-path editorial reader is open. Normal guide mode restores them.
- Existing 1962 LIVE/Simple/Missal Mass readers and canonical `learn.catechism` / `learn.mass_explorer` handoffs are untouched.

## Validation and safety

`tests/living-church-pius20-scene-browser.mjs` runs with Chromium at 390px and 1280px, mocks only the 15 pinned source JSON requests (with original files staged from the exact SHA), checks original P2 portrait visibility, 20-path entry and navigation, language continuity, source panel, editable choice history/no forced next question, return to the regular St Pius X and Canon scenes, and verifies the native Mass/visible-church system is still present.

The older `living-church-character-scene` and `living-church-pius-ten-scene-browser` tests continue to run in the same GitHub workflow. The new feature defaults **off**, and no unapproved reply is marked for production.
