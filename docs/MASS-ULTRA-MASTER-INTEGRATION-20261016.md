# Mass Ultra Master — research bridge and product integration boundary

Date: 16 October 2026. Source: `Ad_Orientem_Ultra_Master_Research_Only_Low_Long_Guides_2026-10-16.xlsx` (41-tab editorial master). The source-of-truth workbook is retained outside this PR; this is an **additive non-publishing connector**, not a mass data import or an app release.

## Verified research census

- 435 micro-Latin units; **435/435** link to an existing 279-cue registry ID.
- 279 source ceremonial cues; not additional cards.
- 66 exact-word research anchors; **66/66** refer to valid unit and cue IDs.
- 139 verified author-claim records; **139/139** unit claim links resolve.
- 39 Mystery liturgical study owners, linked by stable guide owner keys.
- 154 historic written Guide variants, of which the existing 32 Guide records retain field parity. **122 historic profile-specific guides are not production-authorized.**
- The long-guide audit flags 18 unapproved short corrections, 35 long rubric/history texts requiring structure review, and 530 evidence associations that must not be represented as 530 certified passages.

## Canonical ownership — no renames, forks, or forced merges

1. **Mass / Attend:** R17 owns rite text, forms, the 1962 event engine, LIVE/SIMPLE/MISSAL presentation and lifecycle. The research bridge has no reader import, runtime effect, navigation hook, source-text rewrite or reader state mutation.
2. **Study of the Mass:** technical/doctrinal Formation instruction remains the Formation owner. Mass Formation's eight lessons cannot be silently converted into Mystery pages.
3. **Mystery of the Mass:** draft #1193 owns its **two distinct** meditative biblical and liturgical journeys (24 provisional scenes, 39 liturgical owners, original EN/FR study content). No auto-merge, rename or publication of its research draft.
4. **References:** reuse `src/learn/source-reference-panel.js` and current `src/reference/*` and `src/source-text/*` reference reading infrastructure; no new competing parser, ebook library or source-drawer implementation.
5. **Scripture & Atlas:** links are typed and reviewed before exposing chapter links; direct Bible quotation, adaptation, allusion, typology and later author interpretation are different edges. Never assert a precise Biblical Atlas pin or event from a liturgical typology.
6. **Sacred Art / Calendar:** reuse approved canonical artwork and calendar IDs. No asset imports, artwork rating mutations or duplicate image libraries.

## Research bridge behavior

`src/learn/mass-knowledge-research-bridge.js` validates the frozen inventory and resolves unit/cue/guide relationships **only into editorial IDs**. It deliberately emits no source quotation, historical exposition, full-text reading URL or ritual instruction. Every unit has the explicit research release gate; any attempt to promote it fails closed. The bridge has no imported runtime entry.

A generated 435-unit JSON extraction was checked against the original workbook (435/435 unit-cue relations, 66/66 word-anchor relations, 139/139 author-claim links), then retained as an external handoff pending editorial approval and explicit import decision.

### Proposed source relationship types

`RUBRIC_1962_NORMATIVE`, `DIRECT_SCRIPTURE`, `ADAPTED_OR_ALLUSION`, `TYPOLOGY`, `AUTHOR_INTERPRETATION`, `MOMENT_RESEARCH`, `DEVOTIONAL_APPLICATION`. All edges additionally require owner, edition/locator, confidence, applicability condition, publication decision, and approved rendering location.

## Release sequencing

- **P1**: editorial IDs and fail-closed pointer resolver (this draft); freeze the 435↔279↔32 parity constraints.
- **P2**: owner-by-owner adjudication of 122 historic Guide profiles, 18 proposed corrections, 35 long-form historical comparisons, 530 Low evidence associations and Scripture-pass recertification. Approval applies to exact records, not to whole workbook tabs.
- **P3**: source-qualified contextual cards in the existing **Study of the Mass** owner first, with an explicit opt-in editorial preview. Integrate reference drawer rather than cloning it.
- **P4**: the standalone **Mystery of the Mass** dual chronology stays distinct; add context-aware jumps into an approved Study topic or Bible chapter using its own owner keys. Do not overwrite its author manuscripts.
- **P5**: add a separate interactive ceremonial Mass Map only when its positions, actors, clocks and rites are independently validated. Static diagrams retire only after feature parity and user acceptance.
- **P6**: link calendar, artwork, Bible Atlas and prayer contexts through canonical IDs. No speculative places, source quotations or duplicate assets.

## Non-deletion rules

Nothing in the current ritual reader, 32 published Guide records, eight Formation lessons, Mystery manuscripts, biblical atlas, research archive or source-reference presentation is deleted or suppressed by this draft. Module/feature retirement is **proposed only** after editorial migration, stable deep links, cross-module QA and user sign-off.

## Tests

`node tests/mass-knowledge-research-bridge.mjs` checks ID selection, one-to-many relations, Scripture candidate hold status, no accidental prose publication, and release-gate rejection. This is a focused adapter test, not a full end-to-end app test.
