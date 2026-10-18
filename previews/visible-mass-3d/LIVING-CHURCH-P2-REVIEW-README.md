# The Living Church — P2 character-scene review

**Status: DRAFT / NOT PRODUCTION READY.** This branch is stacked on PR #1397 and ultimately depends on #1395, #1309 and the separate #1391 Ask the Church owner.

## What exists

- An opt-in **Meet the guides · preview** button in the **original** `sanctuary-hotspot-pilot.html` behind its existing `?aoLivingChurchReview=1` gate.
- Full-screen cinematic presentation over the same original photograph; fixed sprite position, integrated on-screen dialogue, optional free-question keyword routing, and reversible Sacristan → Canon → St Pius X → Sacristan transitions.
- The original `AO_VISIBLE_MASS_LIVING_CHURCH_P1` state owner is called for character selection. Scene ID, photograph pose, existing object, original guide trail and question history are never replaced.
- **No fabricated historical quotations or new theological answer registry.** Free input is only deterministic subject triage in this review.
- Responsive phone presentation and reduced-motion preference support.
- A Playwright regression at 390px and 1280px is staged in `tests/living-church-character-scene.mjs`.

## Approved assets — still need to land as files

The working local review prototype and its separate ZIP pack contain image assets already approved by the user. This PR's JavaScript expects them at `previews/visible-mass-3d/assets/living-church/` with the following naming pattern:

- `sacristan_{neutral,welcoming,explaining,thoughtful,grave}.webp`, derived from user-approved uploaded `image(20261018-043420).png` and same-face emotion variations.
- `canon_{neutral,welcoming,explaining,thoughtful,grave}.webp`, from the locked young-Lefebvre-inspired expression set. Keep that face; **not** a new generated Canon.
- `pius_{neutral,welcoming,explaining,thoughtful,grave}.webp`, from the approved five-image St Pius X ZIP.

The asset paths intentionally fail visibly and do **not** silently substitute a different generated face. Do not call this visual QA-complete until actual assets are committed and in-browser screenshots have been accepted.

## Known limits / next steps

1. Add original approved sprite assets, inspect their transparency and consistent face/costume at both widths, then re-run visual tests.
2. Integrate source-verified original Catechism question IDs and Mass Explorer native handoffs via the #1391 destination owner. The present buttons explain those source-ownership limits instead of claiming navigation.
3. Check P1 source authority/scene restriction, French editorial gating, dialogue source language, normal browser/phone flows, and accessible text/contrast.
4. Do not merge until upstream stacked PR dependencies and editorial publication gates are satisfied.

The LIVE, SIMPLE and MISSAL Mass reader, rubrics, source prayer texts and Schola are unmodified.
