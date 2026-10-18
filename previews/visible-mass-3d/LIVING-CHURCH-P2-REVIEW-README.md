# The Living Church — P2 character-scene review

**Status: DRAFT / NOT PRODUCTION READY.** This branch is stacked on PR #1397 and ultimately depends on #1395, #1309 and the separate #1391 Ask the Church owner.

## What exists

- An opt-in **Meet the guides · preview** button in the **original** `sanctuary-hotspot-pilot.html` behind its existing `?aoLivingChurchReview=1` gate.
- Full-screen cinematic presentation over the same original photograph; fixed sprite position, integrated on-screen dialogue, optional free-question keyword routing, and reversible Sacristan → Canon → St Pius X → Sacristan transitions.
- The original `AO_VISIBLE_MASS_LIVING_CHURCH_P1` state owner is called for character selection. Scene ID, photograph pose, existing object, original guide trail and question history are never replaced.
- **No fabricated historical quotations or new theological answer registry.** Free input is only deterministic subject triage in this review.
- Responsive phone presentation and reduced-motion preference support.
- A Playwright regression at 390px and 1280px is staged in `tests/living-church-character-scene.mjs`.

## Approved assets — installed and hash-locked

The exact fifteen WebP sprite exports from the approved character package are now committed under `previews/visible-mass-3d/assets/living-church/`. `manifest.json` records their original character provenance, per-file SHA-256 and natural image dimensions. The P2 browser regression checks all 15 byte hashes and that each on-screen selected sprite loads and decodes in Chromium.

**Casting preservation:** the Sacristan matches user-selected `image(20261018-043420).png` (aged approximately 80); the Canon uses the locked younger-Lefebvre-inspired face (fictional dialogue guide), not a substitute portrait; St Pius X uses the original approved five-emotion pack. Generated dramatic poses are not authentic historical photographic expressions.

**Image QA:** [P2 CI](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39117131037) produced six 390px / 1280px screenshots with correctly loaded sprites. Those screenshots use a flat neutral photography fixture to ensure deterministic testing; they do **not** establish the finished photographic atmosphere, which needs additional review using the original Brompton image and verified licence.

## Known limits / next steps

1. Review the committed locked sprite proportions, dialog spacing and the genuine Brompton photograph on real devices; the CI photography stub cannot certify appearance.
2. The Canon's Mass Explorer button now delegates to the existing P5 published-Mass-Explorer adapter, with exact research link AL01 → AO.CARD.015 and safe standalone failure. The original St Pius X Catechism handoff and exact native return still require an approved bridge through #1391; do not claim they work.
3. Check P1 source authority/scene restriction, French editorial gating, dialogue source language, normal browser/phone flows, and accessible text/contrast.
4. Do not merge until upstream stacked PR dependencies and editorial publication gates are satisfied.

The LIVE, SIMPLE and MISSAL Mass reader, rubrics, source prayer texts and Schola are unmodified.
