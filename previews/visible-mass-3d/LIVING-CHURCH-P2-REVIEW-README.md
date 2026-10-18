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

1. Review locked sprite proportions, dialogue spacing and the genuine Brompton photograph on real devices. A separate best-effort real-photo capture workflow has been added; network-dependent screenshots (even when available) still need human visual acceptance.
2. The Canon's Mass Explorer button delegates to the source-owned P5 adapter (research contextual edge AL01 → AO.CARD.015; standalone failure stays safe). **St Pius X Question 322** now has a *review-only same-document* native bridge using the original `AO_LEARN_APP_V1.openModule("learn.catechism",{catechismQuestion:322})` and the already-established P0 token-and-return contract. The question number is verified against `data/learn/ltfaith-pius-x-en-witness-index.v1.json`; no Catechism answers were copied.
   - Native handoff is authorised only for canonical `PX1912-Q322`, the approved Brompton photo scene, guide `pius-x`, an idle same-document Formation owner and the active review flag.
   - Return closes only the Catechism session opened by this bridge, restores the original photograph scroll/camera pose, retains the selected guide and dialogue node, and returns focus.
   - Standalone photography pages **cannot** silently access parent-frame native modules; they report unavailability. Current 390px/1280px Chromium E2E uses an injected source-owner contract to test opening and return. **Real-shell Catechism opening, dismissal and complete navigation in the integrated app remain unverified**, pending coordination with #1391. Do not claim otherwise.
3. Check P1 source authority/scene restriction, French editorial gating, dialogue source language, normal browser/phone flows, and accessible text/contrast.
4. Do not merge until upstream stacked PR dependencies and editorial publication gates are satisfied.

The LIVE, SIMPLE and MISSAL Mass reader, rubrics, source prayer texts and Schola are unmodified.

## P3 cross-owner tests and visual review

- `tests/living-church-catechism-native.mjs` checks the exact Q322 witness, anti-impersonation/source scope, double-opening guard, owned native closing, exact pose restoration and standalone refusal.
- `tests/living-church-character-scene.mjs` checks the same-document injected native-owner contract plus original standalone refusal at 390px and 1280px; it does **not** substitute for a full live Formation shell test.
- `tests/living-church-real-photo-visual.mjs` runs a separate network-dependent original-photo screenshot review, expressly not a release gate or proof of editorial acceptance.
