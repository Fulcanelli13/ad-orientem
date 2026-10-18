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

## P5 — Source-backed dialogue, not generated answers

- The three-character scene imports the **unchanged canonical PR #1391 `src/learn/ask-church-source-digest.js`** (blob `acfc57cee099cb3402c8b5ae6ae066ca0ab136eb`) alongside the already unchanged objective engine and route survey. It is **one original source owner**, not a duplicate Mass/Catechism/Apostolate registry.
- A visitor chooses an objective and branch in the original seven-family/26-branch routing engine; source selection is constrained to the currently chosen path and its publication gates. A dossier in hold/research-only status is not accessible through a guessed route.
- The scene reads the existing Apostolate `READY` answer/explanation and linked source references, or the Formation/Confession introductory description **as separately labelled metadata**. Links must be HTTPS; no fabricated citations, theological prose, Q&A records or purported speech of St Pius X.
- A restrained in-scene source panel displays the original record, owner, publication status, extended explanation on demand, and references supplied by the underlying module. Visitors may advance to another approved record, return to the objective, and revisit earlier source IDs held only in bounded **in-memory** history (last 12; no persistent user chat log).
- Narrow deterministic follow-ups `Why?`, `Where are the sources?`, and `Next/another reference` operate strictly on the already-open approved record. These **are not** a generative chatbot: arbitrary theological follow-up answers, citations and free-form reasoning require a separate audited retrieval/answer layer.
- Late source fetch results are discarded if the user changes guide or objective during loading; no stale material leaks into another speaker's scene.
- The 390px/1280px browser test opens canonical `apostolate:AQ08`, checks original excerpt and HTTPS citations, expands the explanation via `Why?`, follows source provenance, reads `AQ03`, and revisits an earlier record; the source unit test also rejects a held/research-only route and unauthorized cross-objective request.

### Still outside P5

Live unscripted bot conversations, broad arbitrary apologetics retrieval, historical role impersonation, source-certification expansion, full Ask the Church V7 native destinations and final production/physical-device approval are **not implemented by this review stage**. The original Apostolate and other canonical owners remain authoritative. Do not merge solely because the scripted source-reader/browser tests pass.

## P6 — One ephemeral visit across all three guides (review only)

- `previews/visible-mass-3d/living-church-conversation-trail.mjs` adds a **bounded, memory-only** record of confirmed guide visits, objective IDs and canonical source IDs (limit 20). Typed free-text questions, sensitive personal circumstances, script dialogue, source answers and citation bodies do **not** enter that trail. Closing/disposal clears it. No storage, backend mutation or network transmission.
- A discreet **Conversation trail** button within the existing visual-novel panel lists those reviewed steps. The visitor can return to a guide, or reopen an original approved source associated with the **currently selected objective**. Entries from prior objectives remain identifiable but cannot be reopened without new path selection/authorization. Repeated source visits are marked rather than creating duplicate navigation buttons.
- This does **not** claim permanent memory, an autonomous LLM, streaming answer generation or new content certification. The authorized `Ask the Church` director still decides source eligibility.
- `tests/living-church-conversation-trail.mjs` enforces hard bounds, de-duplication, sanitised IDs and zero free-message capture. `tests/living-church-character-scene.mjs` tests the full guide switch → source revisit → new objective denial path at 390px and 1280px.

**Merge conditions unchanged:** #1391 and upstream source branches must be reconciled, existing original church/shell regressions green, and visual and accessibility approval granted. Reader unchanged.

## P7 — Canon source-grounded direct Q&A pilot (non-generative)

**Evidence/release determination:** The canonical source manifests `data/learn/mass-explorer-approved-studies.v1.json` and `data/learn/mass-formation-approved-passages.v1.json` explicitly report `NO_APPROVED_STUDIES` and `NO_APPROVED_PASSAGES`. Accordingly, P7 **must not** synthesize Mass Explorer/Canon historical or rubrical commentary from research drafts, whether manually or by an LLM.

- `previews/visible-mass-3d/living-church-grounded-answer.mjs` implements a restricted, review-only direct-question path for **the Canon**. It imports the **original Ask the Church objective engine** and authorizes only published `practice / eucharist` source targets `apostolate:AQ04` (Mass/Calvary) and `apostolate:AQ05` (Real Presence/transubstantiation), obtained at runtime through unchanged `readAskChurchDigest`. The original answer text, explanation, and source registry are neither copied nor edited.
- An explicitly recognized question returns an original approved paragraph labelled **`Apostolate · VERBATIM_APPROVED_SOURCE`**, with the original title and external source links. A narrow `Why?` follow-up provides that same source owner's existing explanation. There are **no newly generated historical quotations, citations, claims or answer paragraphs**.
- Questions about the silence of the Roman Canon, detailed ceremonial choreography, unapproved editorial explanations, mixed/ambiguous topics, personal details, or unknown questions **fail closed** with a clear insufficiency message. An unsupported question clears the earlier source-follow-up context. No model-generated fallback is enabled.
- The 1962 reader, LIVE/SIMPLE/MISSAL, source registries, PR #1391 objective engine and approved studies are untouched. If either Mass editorial release manifest changes, this P7 pilot refuses to initialise until scope is re-reviewed; a future Mass study release cannot silently enter the chat.
- `tests/living-church-grounded-answers.mjs` exercises original source retrieval, French and English, matching, accurate source provenance/HTTPS citations, unsupported questions, stale-follow-up isolation, and editorial manifest tampering. `tests/living-church-character-scene.mjs` tests the direct Canon question, original citation display, `Why?`, and real refusal at both 390px and 1280px.

**Not yet implemented:** an unrestricted conversational LLM, natural-language answer composition from arbitrary source paragraphs, comprehensive Mass Explorer commentary, generative historical simulation, or Sacristan/Pius X direct-answer retrieval. The current pilot **extracts and displays original approved answers**; a subsequent source-audited inference backend and editorial certification will be required for fully open-ended theological conversation.

## P8 — Source-owned Formation P1 evidence, citation integrity, and editorial review queue

This extends the P7 **extractive, non-generative** approach without creating an alternate Mass knowledge database. The canonical P1 Formation owner `data/learn/mass-formation-campion.v1.json` already carries **8 stages × 3 claims = 24 source-linked, English/French Formation claims**. Source witnesses are four existing works: 1962 Roman Missal, Pius XII's `Mediator Dei`, O'Connell 1962 and the 1954 Campion missal. `src/learn/mass-explorer-published-prayer-context.js` independently documents existing reuse of exact Formation P1 claims; **this does not certify new chat-generated prose**.

- `living-church-formation-p1-evidence.mjs` loads and validates those **original** 24 claim records and their four source URL identities at runtime. Only a narrow set of directly matched questions may display the **exact existing Formation P1 wording** with document-level references. It explicitly labels those links as **not precise textual-witness attestations**. The 24 claims are an indexed evidence pool, not 24 certified free-response topic prompts.
- `living-church-grounded-answer.mjs` keeps the original two approved Apostolate QAs, then consults the existing Formation P1 reader for precisely matched unrelated Mass questions (e.g. low-voice Canon, Mementos, priest/faithful Communion). Unclear, combined, unsupported or detailed 1962 ritual questions still fail closed. Existing source text, original ownership, and bilingual text remain intact.
- `living-church-answer-verifier.mjs` refuses invented new prose, fictitious historical attribution, altered/missing HTTPS references, and false claims that a document-level reference supplies an exact quote. The current scene uses it on returned source records. It is an **exact-match boundary, not a theological entailment verifier**.
- The original Mass Explorer and Formation **deep-study / passage release manifests remain empty**. If they or the P1 claim identifiers/status change, P8 fails to initialise pending review. No automatic promotion of research items, no regenerated liturgical rubrics, and **no LLM/inference backend installed**.
- `data/learn/living-church-p8-mass-chat-witness-review.v1.json` is a **24-ID review queue** with zero approved exact-passage collations and zero new chat-synthesis authorisations. It contains original claim IDs and editorial status only, **not duplicated Formation claim text**. The next source-research action is to verify precise primary/catechetical witnesses (section, page, edition, historical applicability) and obtain explicit editorial/bilingual/rights sign-off for any fresh paraphrase.
- Tests cover: eight-stage/24-claim lineage, two P7 original answers, narrow Formation question routing and French, forged citation/wording refusal, unavailable sources/changed release manifests, editorial approval=zero, and original 390px/1280px scene and native handoff regressions.

**Release decision:** source-extractive pilot only. True open-ended generative chat remains intentionally unimplemented until the provenance/entailment and publishing gate exists; returning a source-backed paragraph is not synonymous with certifying a newly written theological answer.
