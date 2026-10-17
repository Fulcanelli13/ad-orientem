# P0 → P1 handoff: Mass Explorer owner contract
Date: 16 October 2026 · canonical snapshot `7d88a0f193d947565259d8a41ed3c53aa38d1980`

**State:** P0 structural implementation present in draft PR #1270. **Not** the P0 exit sign-off. P1 may start UI planning and consume existing *published* Guide/Formation owners, but it must not expose unapproved research pointers as if certified.

## Evidence and owner inputs

- `MASS-P0-BASELINE-MANIFEST-20261016.v1.json` — workbook SHA, frozen donor/version owners and unverified claims.
- `MASS-P0-CANONICAL-CUE-CROSSWALK-20261016.v1.json` — 435 research units, forward and reverse source-cue IDs, Guide pointers, 34 reverse-only source entries and 66 word-anchor holds.
- `MASS-P0-GUIDE-CONTENT-CROSSWALK-20261016.v1.json` — 32 existing published Guides, 122 held historical variants; preserves original short/long copy.
- `MASS-P0-STUDY-OWNERS-20261016.v1.json` — eight existing Formation stages and 39 separate Mystery study-owner IDs; Mystery manuscripts remain editorial drafts.
- `MASS-P0-SCRIPTURE-AUTHOR-RELATIONSHIPS-20261016.v1.json` — 48 typed Scripture research candidates and 139 historical claim pointers, all held; PR #1082 remains Scripture authority.
- `MASS-P0-DISCREPANCY-REGISTER-20261016.v1.json` — individual source-only/Guide identity cases and grouped certification gates.
- `src/learn/mass-knowledge-research-bridge.js` — research-only validation, bidirectional canonical source resolver and explicitly owner-gated approved-link lookup. `tests/mass-knowledge-research-bridge.mjs` validates these safety boundaries.

The external 41-tab source workbook is authoritative for research content, **not** for what liturgical text or ceremonial cue the app performs. The published Mass reader, live text corpus, resolved Proper, conditional rite graph and cardinality-protected presentations remain the ritual authority.

## Identity model and API

Research `unitId` (one of 435) ≠ ritual `cueId` (279 historical ceremonial IDs) ≠ source block/paragraph ≠ reader card. Multiple research micro-units can identify substrings in one canonical cue. A source cue may contain no research micro-unit. The corpus has one additional synthetic source entry, `AO.SM.B096.SYN`, that is not a new Mass ceremonial event. These distinctions must persist across P1.

`reconcileMassResearchToCanonical(bridge,{sungCorpus,guideRegistry,researchLatinByUnitId,enforceCensus})` takes validated editorial bridge IDs, original-workbook Latin witnesses provided by a controlled editorial process, canonical Sung text corpus and continuity-certified 32-entry Guide registry. It produces `units`, `canonicalReverse`, `guideReverse`, explicit text dispositions and donor provenance. It never copies ritual or draft prose into the runtime.

`massP1ApprovedLinkIds(reconciliation,{cueId,approvals})` only exposes target IDs when the unit is an exact full-cue text match, an owner has explicitly certified source text and ritual applicability, editorial and publication decisions are affirmative, a stable target owner/ID and evidence locator exist, and the approval's donor hash matches the current Sung source revision. Held subspans remain blocked pending explicit span-level certification. Absence of approved links must be a valid result, **not** a trigger to generate or publish explanatory text.

P1 can use the committed research crosswalk for editorial tooling only. **It must not be placed in a production import, public reader asset, or P1 client bundle.** A separate allowlisted, versioned projection of certified IDs is required when P1 is authorised.

## P1 integration responsibilities

1. Select the existing canonical Mass moment and active ritual context from the reader, retaining form, selected Proper, conditional overlays and actor/clock source. Do not reverse-engineer ritual truth from Research Guide IDs.
2. Resolve `cueId` → relevant certified `unitId`/Guide/study targets through the approved projection. Preserve one-to-many source units and many-to-one guides. Missing links render no links.
3. Short/long explanatory copy initially comes from the existing published 32-entry `data/presentation/guide-registry.v1.json`, without synthesising new theological copy. Historical variants require separate editorial certification. Mass Moments is an existing reuse owner.
4. The eight `learn.mass` Formation stages retain their original public destination and authorship. The 39 Mystery liturgical owners from PR #1193 retain their own original manuscripts and review gate. A Mass Explorer topic may link *to* those owners after approval, not assimilate or republish them.
5. Scripture links retain direct/adapted/allusive/typological/narrative distinctions, original edition and precise verse numbering. Validate against existing Scripture reader/PR #1082; do not create a new Bible reader or turn biblical parallel into a quotation.
6. Historical commentary is author interpretation unless a separate 1962 normative source establishes a rubric. Use existing `src/learn/source-reference-panel.js` and source-text infrastructure; retain edition, translated/original provenance and rights.
7. For a deep-link jump, store a return token with origin route, active Mass form, selected Proper key, liturgical variant, source cue, current reader card/paragraph, language and focus/scroll state. On return, restore using existing reader contracts, not invented card numbering.
8. The 65–67-card curated LIVE projection and 48-card rollback survive without reordering, renumbering or regeneration. P1 explorer displays explanations in a distinct reader/context surface.

## Required P0 remaining acceptance before editorial release

- Compare all 435 exact workbook Latin witnesses with the frozen canonical corpus, recording whole-cue vs subspan identity, missing words, accents, corrections, translations, branch/Proper and exact paragraph boundaries.
- Independently verify the 66 exact word triggers for actor, gesture, canonical paragraph and ritual applicability. Structural 66/66 links are insufficient.
- Decide 34 canonical cue entries without microtext units; do not force research granularity into reader cards. Give four published Guides with no microtext link an explicit moment-level route where appropriate.
- Certify and adjudicate only needed historical guide variants, Scripture links and original-author passages; unresolved records can remain held. Do not require approval of every draft in order to publish unrelated reviewed content.
- Reconcile to latest `main` and other owner PRs before attempting P1 integration; repeat parity checks on 65–67 and 48 presentation contracts, conditional Mass forms, actor/clock and 32 published Guide field integrity.
- Obtain explicit editorial approval of the public allowlist, and separately test on real phone/desktop, accessible references and back navigation before merging or deploying.

## Product decision

The proposed **Mass Explorer** is P1's consolidated educational experience over approved existing explanations and relationships. Retirement of overlapping Mystery/Formation/Mass Guide UI is **not** authorised in P0. Retire or redirect only after P1 content parity, attribution, original manuscripts, stable deep links, rollback and user acceptance are independently verified. This handoff does not rename the separate Mystery of the Mass authoring pipeline.


## Complete workbook-to-donor research text comparison (same P0 branch)

All **435/435** source research Latin micro-units have now been checked against the frozen canonical Sung donor without copying the research workbook into a public runtime asset. The first 288 were literal NFC string comparisons in `MASS-P0-PARTIAL-LATIN-WITNESS-COMPARISON-20261016.v1.json`; the remaining 147 used paired independent 32-bit Unicode/UTF-16 fingerprints plus exact length against whole canonical cues and all equal-length source subspans, recorded in `MASS-P0-REMAINING-LATIN-FINGERPRINT-COMPARISON-20261016.v1.json`. Fingerprint matching is probabilistic, unlike comparing the original full strings directly.

Across these two methods: **153 full-cue text-equivalences, 274 exact contained-subspan candidate equivalences, three mismatches and five variable source slots**. The mismatches are `AO.V3.0023.U002` and `AO.V3.0237.U002` (the same `orare` vs `oráre` accent difference in two Confiteor positions), plus `AO.V3.0084.U001` (`secúndum N.` placeholder versus the donor's named Gospel). These are not automatic defects in the published Mass; they are recorded as an editorial text/variant review.

**The P0 source-text identity census is therefore 435/435 compared, but 0/435 independently printed-Missal certified and 0/66 exact-word triggers independently certified.** A research-unit subspan match alone is not authorisation to use it as a UI trigger or publish an historical statement. Every row remains explicitly non-public until owner and applicability sign-off. The 34 canonical reverse-only cue entries, four moment-level Guide link gaps and publication holds remain for P0 adjudication.


## Full structural event and word-cue reconciliation

The frozen workbook `09 PRIEST EVENTS 279` has been reconciled by explicit event-ID → source-cue-ID relationships, with 279 unique event IDs and 279 corresponding canonical Sung cue IDs; see `MASS-P0-PRIEST-EVENT-IDENTITIES-20261016.v1.json`. No actor, voice or rubrical instruction has been promoted from this structural mapping.

The `23 WORD CUE 66` worksheet's offsets now match the exact UTF-16 substrings in the canonical Sung donor for all 66 triggers; see `MASS-P0-CANONICAL-WORD-ANCHOR-VERIFICATION-20261016.v1.json`. Offsets are relative to the **canonical source cue**, not necessarily to the fine-grained research micro-unit. Gesture/actor/ritual applicability approvals remain zero. This distinction must be enforced by P1 and by any future precise-word UI highlights.

The 34 canonical source-only entries are classified as **15 source-action states, 18 variable Proper/ritual placeholders and 1 optional sermon synthetic entry**. Four published Guides are section-level owners (`AO.CARD.006`, `AO.CARD.008`, `PRE.ASPERGES`, `POST.MASS`) and must not be forced into microtext units; see `MASS-P0-REVERSE-COVERAGE-DISPOSITIONS-20261016.v1.json`.

The original workbook has complete internal microtext-to-source-cue literal continuity (159 exact whole cue, 276 exact subspan), which does **not** negate three comparison differences and five variable slots against the production Sung donor. On the advancing `main`, source file SHA comparisons confirm unchanged Sung/Low corpora, Guide registry, curated reader, 48-card rollback and rubric overlay from the original snapshot. Branch divergence still requires a normal integration check and no release is implied.


## P0 word-trigger owner concordance and conditional liturgical exceptions

The 66 text-located workbook anchors were checked against two existing canonical ceremonial registries, `reader-rubric-events.v1.json` and `reader-priest-actions.v1.json`, without importing manuscript instructions. **53 anchors** have at least one owner at cue level (18 have rubric events, 37 have priest-action items, some overlap); **13 anchors** have neither, and these are **not** a mandate to create a gesture. Only two existing rubric-overlay trigger strings contain the literal selected span, so a cue-level match cannot certify exact-word timing. See `MASS-P0-WORD-ANCHOR-RUBRIC-OWNER-CONCORDANCE-20261016.v1.json`.

**1962 Sung Creed guard:** `Et incarnatus est` is not an unconditional instruction that every participant kneels. Code of Rubrics 1960 §518(b) (applied in 1962): priest genuflects while *reciting*; when sung and *standing*, genuflects; when *seated*, inclines uncovered head profoundly; at the three Christmas Masses and Annunciation the special instruction for all to kneel applies. §522 distinguishes choral actions during the celebrant's recitation and Last Gospel. Any conditional UI must preserve form, celebrant position, choir phase and solemnity. Evidence: https://maternalheart.org/library/1962rubrics.pdf, pp.94–97 (PDF physical pages 54–55).

**Three Latin discrepancies adjudicated for research identity, not publication:** `orare` versus `oráre` in C0023 and C0237 is a stress-accent display variance, so do not change canonical text. C0084's fixed `secúndum Matthǽum` conflicts with the research's generic Gospel-author slot `secúndum N.` as a *potential production relationship error*. Source-first `reader-model.js` derives `ordinaryVariants` from the Holy Thursday Canon, while the Gospel reading is supplied via independent `GOSPEL` Proper slot; a test-only Johannine Gospel fixture is used in the P0 research suite to check whether the announcer heading incorrectly remains Matthew. Until verified and corrected in the **owning canonical Mass/Proper pipeline**, neither P0 nor P1 should certify the Gospel-author heading as universally applicable. See `MASS-P0-THREE-LATIN-DISCREPANCY-DECISIONS-20261016.v1.json`.

The original reader code, LIVE presentation, posture/gesture registries and production Proper logic are untouched by these checks. All research-cue ceremony promotions remain gated; approve only intended P1 educational links when independent owners supply evidence and conditions.


**Verified Gospel runtime fixture (16 October):** The P0 test-only John Gospel through `createMassReaderModel` confirms the ordinary C0084 announcement still names Matthew when the resolved Gospel Proper is according to John. GitHub Actions research-integrity run **38876627431** passed with `CONFIRMED_STATIC_MATTHEW_HEADING_OWNER_RISK`. This is *verified for the source-first model*; production UI must be checked separately. **Mass/Proper owner must fix and regression-test** Gospel author announcements on two distinct evangelists and LIVE/SIMPLE/MISSAL before content/linkage is approved. This bug is not remedied by copying the generic workbook `N.` text into the reader.


**Mass/Proper owner completion — 16 October:** The separate Gospel announcement correction [PR #1297](https://github.com/Fulcanelli13/ad-orientem/pull/1297) has been **merged to canonical `main`** as commit `e198a0a65536180830dbf0d6cb1c198abcf480d5`. It projects Gospel-author C0084 from the app's existing selected-Proper Scripture witness, or uses an unnamed heading on unresolved/conflicting evidence. All four evangelists, Low/Simple/Missal and Sung/LIVE, both languages, R17 phone suite and required main gate were verified. P0 still retains the historical donor `secúndum Matthǽum` versus workbook `secúndum N.` as a *literal research-source variant*, but the source-first UI presentation defect is fixed by the actual Mass owner. This is **not** publication certification for source manuscripts or new ritual actions; keep P0 research branch draft and fail-closed.
