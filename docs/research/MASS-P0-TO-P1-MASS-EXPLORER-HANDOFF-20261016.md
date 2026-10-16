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


## First original-Latin comparison result (same P0 branch)

The governed 41-tab workbook was read for the accessible first 288 micro-unit Latin extracts, and each was compared as NFC-preserving literal text with the frozen Sung donor: **112 whole-cue matches, 170 exact contained subspans, 2 differing text witnesses, 4 variable source slots**. The remaining **147** research units were not compared in this pass. See \`MASS-P0-PARTIAL-LATIN-WITNESS-COMPARISON-20261016.v1.json\`. These are **literal string checks, not printed 1962 liturgical source certification or paragraph/word-trigger approval**.

The two explicit discrepancies are \`AO.V3.0023.U002\` (\`orare\` / \`oráre\`, accent and source correction decision) and \`AO.V3.0084.U001\` (generic \`secúndum N.\` research placeholder against selected canonical Gospel \`secúndum Matthǽum\`). Both stay editorial holds. The remaining 147 source units and all 66 exact word triggers require independent collation; a 435/435 valid cue reference alone does not meet the P0 text acceptance gate.
