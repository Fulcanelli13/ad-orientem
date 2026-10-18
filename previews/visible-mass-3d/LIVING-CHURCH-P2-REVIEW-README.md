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
2. The Canon's Mass Explorer button delegates to the source-owned P5 adapter (research contextual edge AL01 → AO.CARD.015; standalone failure stays safe). **St Pius X Question 322** has two distinct safe entry paths: an original standalone owner contract, and the **real app-shell** parent-hosted bridge `src/learn/living-church-app-shell-bridge.js`.
   - For the embedded photograph opened as Formation child `learn.visible_mass`, the actual parent app (never a mocked `AO_*` owner) opens the **original** `AO_MODULES.open("learn.catechism")`, then `openNativeCatechismQuestion(322)` on the existing 433-question owner. No Catechism answers were copied.
   - A strict same-origin, review-gated iframe bridge exposes only open/return for `PX1912-Q322`, Brompton `BROMPTON_ALTAR_2019_B`, guide `pius-x`, and the actual original viewer. The parent does **not** give the iframe a general Formation/Catechism API.
   - The host temporarily conceals (but does not unmount) the original church iframe, exposes a parent-owned Return control above the native Catechism, closes only the newly opened original Catechism, then restores the exact photograph scroll position, guide, topic and scene dialogue through the existing P0 return token.
   - **Actual `index.html` app-shell browser tests pass at 390px and 1280px without injecting any fake native owner**. A separate real-shell suite explicitly verifies that the Formation child remains `learn.visible_mass` throughout. See [CI real-shell acceptance](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39121681417) and [screenshots](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39121681417/artifacts/12134945539).
   - The original standalone photography preview still cannot access the parent app and refuses native handoff safely.
   - This **does not** validate the separate Ask the Church PR #1391's guided-objective dialogue returning into this specific visual-novel character scene; its branch must be reconciled separately.
3. Check P1 source authority/scene restriction, French editorial gating, dialogue source language, normal browser/phone flows, and accessible text/contrast.
4. Do not merge until upstream stacked PR dependencies and editorial publication gates are satisfied.

The LIVE, SIMPLE and MISSAL Mass reader, rubrics, source prayer texts and Schola are unmodified.

## P3 cross-owner tests and visual review

- `tests/living-church-catechism-native.mjs` checks the exact Q322 witness, anti-impersonation/source scope, double-opening guard, owned native closing, exact pose restoration and standalone refusal.
- `tests/living-church-character-scene.mjs` checks the same-document injected native-owner contract plus original standalone refusal at 390px and 1280px; it does **not** substitute for a full live Formation shell test.
- `tests/living-church-real-photo-visual.mjs` runs a separate network-dependent original-photo screenshot review, expressly not a release gate or proof of editorial acceptance.
- `tests/living-church-real-shell-e2e.mjs` starts the original `index.html`, visits the existing Formation owner and embedded original church, opens canonical St Pius X Q322 through the actual source registry, and verifies exact-return on 390px and 1280px screens with genuine app components. No synthetic `AO_*` owners are injected.

## P4 — original Ask the Church objectives + Canon exact-return

**Source-of-truth reconciliation:** The canonical `src/learn/ask-church-objective-engine.js` and `data/learn/ask-church-app-route-survey.v1.json` from draft PR #1391 are staged **byte-identically at their original paths** in this stacked review PR. They are **not** a forked answer database or a separate question corpus. Source blob SHA-1 identities: `edd937ddc721ceaecc617c34157e33e38e95addf` and `af787cb864b6fc60f9df9c85537b1e798da7b400`. Before merging, reconcile the corresponding upstream PRs so that there is one authoritative owner rather than independent changes to these two files.

- `previews/visible-mass-3d/living-church-objective-director.mjs` imports the original seven objectives, 26 branches, bilingual labels and its source-route restrictions on demand. Visitors explicitly choose a path and the relevant character; free-text objectives use the original objective engine. The original engine controls publication eligibility. **No new doctrinal answers or fictional attributed quotations** were authored.
- Suggested native modules are presented as existing source route IDs, not necessarily as verified/opened destinations. Only actual reviewed Canon Mass Explorer and St Pius X Q322 buttons trigger native actions, through the existing P0 handoff token. Other #1391 resource routing remains owned by #1391 and must not be claimed integrated.
- `previews/visible-mass-3d/living-church-mass-native.mjs` extends the same original photo + one-use return-token contract to the Canon's existing source link **AL01 → AO.CARD.015**. The parent `src/learn/living-church-app-shell-bridge.js` opens the canonical `learn.mass_explorer` using the real app registry and closes **only** that native module on return.
- At both 390px and 1280px, `tests/living-church-real-shell-e2e.mjs` now verifies the complete **Canon → native Mass Explorer → Canon** journey following the already working **St Pius X → original Q322 → St Pius X** journey, preserving source photograph pose, original Formation child, character and dialogue.
- `tests/living-church-ask-objectives.mjs` checks original objective/branch identities, French/English, guide selection and unpublished apologetics/crisis exclusion. `tests/living-church-character-scene.mjs` verifies actual objective selections/referrals and free objective text in Chromium.

**Limits:** This remains a draft with review URL flags. The #1391 objective UI is not merged as a second independent chatbot; its editorial digest and 8 real-shell destination tests stay in PR #1391. Physical phones, SSO preview visual acceptance, accessibility audit, broader guide handoffs and upstream branch convergence remain required. No public launch, LIVE/SIMPLE/MISSAL edits, or certification of new apologetics answer content.
