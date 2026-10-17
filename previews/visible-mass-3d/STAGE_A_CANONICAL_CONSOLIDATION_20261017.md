# The Visible Mass — Stage A canonical consolidation decision
Date: 17 October 2026
Status: **inventory and ownership reconciliation; no publication, no merge, no new viewer version.**

## Governing decision
**Freeze standalone prototypes P2–P8.** They are interaction evidence, not seven independent architectural layers or content owners. Reuse **one genuine photographic visitor** (P6 camera continuity, P5 object inspection, P8 form distinction where source-certified) and render source-owned content from existing production services. Do **not** build P9 or another summary/ceremonial registry. The next milestone is one sanctuary vertical slice, not another detached HTML iteration.

Current draft: PR #1309, `feature/visible-mass-3d-explorer-p0`; 17 Oct audit found **128 commits ahead and 40 behind** current `main`, 58 changed files. It is **not merge ready**. The latest head workflow included passing Required main gate and failing R17 Mass convergence / phone-browser job because `tests/learn-owner-e2e.mjs` measured a **43.999996px** Learn navigation control versus a 44px threshold. This test failure is **not** proof of failed Visible Mass event logic and is also not a release pass. Rebase/merge must reconcile newer production features before a PR merge can be contemplated.

## Locked source-owner reconciliation

| Authority and production ownership | Verified existing assets | Visible Mass permission |
| --- | --- | --- |
| Physical church/photo presentation — P1/P4 draft | 170 physical subjects across 13 zones; pilot 30 sanctuary subjects, 134 unique `VMQ` question records; six exactly associated with `BROMPTON_ALTAR_2019_B` | Owns photo navigation and exact same-photo markers **only**. Six marker touch boundaries require real device QA. 170 inventory subjects are not 170 visible hotspots |
| Glossary — `data/glossary/concepts-*.v1.json` | For 170 provisional subjects: 63 direct G### matches; 86 related-parent; 21 missing exact matches | Resolve canonical G### IDs; do not write second definitions. Keep D vs R distinct |
| Phase 1.5 Q&A — `HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json` + `HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json` | **97 unique existing question answers: 28+69, no duplicates or orphan VMQ IDs.** Remaining 37 of 134 | Research-draft preview only. No approval-for-publication claim or duplicate answer owner |
| Same-photo sanctuary Q&A subset | Active `AL01/AL06/AL07/AL19/SN02/SN04`: **21 draft answers out of 30 exact questions** | Object cards should expose approved answers when cleared, otherwise show question or explicit research-preview disclaimer |
| Liturgical topic research — `LITURGICAL_EXPLANATIONS_P1_5_FIRST20_20261017.v1.json` | 20 source-checked, editorially held `VMLQ` topic explanations, **separate IDs** from the 97 VMQ answers | Do not sum with VMQ totals. Link via reviewed topic routes only, preserving Mass/feast/form conditions |
| 1960/1962 rubric research — `LITURGICAL_SOURCE_TO_SUBJECT_CROSSWALK_20261017.v1.json` + `PRIMARY_1960_RUBRIC_PASSAGE_CHECKS_20261017.v1.json` | 44 candidate liturgical themes, 109/170 objects with one or more candidate routes, 24 English rubric passage inspections | Research routing only. Latin/1962 applicability and editorial release pending |
| **Production Mass Explorer** — `src/learn/mass-explorer.js` on **current main** | PR #1293 merged; 32 original Sung Guide moments, 96 source blocks, eight Formation stages; PR #1335 merged **84 bilingual source-aligned prayer readings** in `data/learn/mass-explorer-prayer-readings.v1.json` | Open existing route/entry points with deep-link and return-state preservation; **never reimplement Guide explanations or the 84 prayer readings** inside Visible Mass |
| Separate approved study gate — `data/learn/mass-explorer-approved-studies.v1.json` on main | `NO_APPROVED_STUDIES`, zero entries at audit | Never promote held research into public Mass Explorer studies |
| Ultra Master research bridge — draft PR #1270 | 41-tab research-only workbook; 435 micro-units, 279 canonical cue IDs, 66 word anchors, 139 author claims, 39 Mystery liturgical study owners | Research identity lookups **only when explicitly allowlisted**. Do not import draft claims/copy into UI. Do not promote PR #1270 automatically |
| Mass ceremony — `src/mass/objective-engine.js`, `mc-event-graph.v1.json`, `mc-events-01..06.v1.json` and B005/B006 | Certified maximum test contexts **Low 168**, **Solemn 177** events, union Solemn 178; P8 displays **21/28** selected event records | Use canonical objective engine for form/conditional applicability; don't implement new copy of event clock or universal attendance postures |
| Sung/Cantata reader — `data/presentation/reader-*.v1.json`, `src/mass/*` | Original Sung source-cue/rubric owners and 48-card LIVE presentation | Maintain separate forms and presentation. The B002 objective graph explicitly gates MISSA_CANTATA and forbids inferring it from Solemn. P7's 15-cue sample is **not** a complete Missa Cantata objective traversal |
| Solemn ministers — `data/mass/ritus-1962-solemn-ministers-batch02.v1.json` | Fine minister moves `RESEARCH_SOURCE_CHECKED_NOT_RUNTIME_CERTIFIED` | Review-only secondary annotations, **not** runtime minister events |
| Sacred art, geography and historical churches | Distinct canonical registries and credited photographs | No parallel photo/painting library. The Dublin Newman panorama is **not** proof of regular 1962 Mass there |

## Six-photo vertical-slice reconciliation

| Photo subject | Existing G### match | Research answers / original questions | Retained interaction |
| --- | --- | --- | --- |
| AL01 high altar | G404 **D** | 5/6 | Canonical definition → source-specific Mass context; no fabricated photo-action proof |
| AL06 altar crucifix | G079 **R** | 3/4 | Existing parent definition + question; Calvary inference held |
| AL07 candlesticks | G079 **R** | 4/6 | Existing parent + question; no universal candle-count statement |
| AL19 retable | G418 **D** | 2/4 | Glossary and question; **no unreviewed action edge** |
| SN02 communion rail | G186 **D** | 4/6 | Glossary → `AO.CARD.024/025` contextual study; Ecce photo is not a photo of communion at this rail |
| SN04 sanctuary steps | G181 **R** | 3/4 | Existing parent glossary and question; **no unreviewed action edge** |

The P5 six object→Guide edges on four objects are still **contextual candidates**, not certified 1962 object-to-action rules. Exact photo coordinates and all question IDs remain held by the parallel source registers.

## Code disposition: retain, replace, or hold

| Existing branch item | Disposition | Rationale |
| --- | --- | --- |
| `photographic-scene-bridge.mjs` + `sanctuary-hotspot-pilot.html` | **Retain as the authoritative draft photographic boundary** | Validates exact photo/object/G ID, 6 coordinates and 170 inventory counts |
| P6 photographic continuity / photo credit UX | **Retain presentation behaviour** | Per-photo camera pose and true separate-view labels; do not claim 3D parallax |
| `photographic-object-mass-bridge.mjs` | **Hold** six provisional edges pending contextual source review | Not a second Mass event registry; no production imports |
| `photographic-mass-explorer-bridge.mjs` | **Retire as future content supplier after parity review** | Its 32 Guide snapshot is superseded by main's richer existing Explorer including the 84 readings; keep interim tests |
| `photographic-p7-ceremony-bridge.mjs` | **Retain as a 15-cue diagnostic, not a reader** | Production must read canonical Mass runtime; no new ceremonial engine |
| `photographic-p8-form-bridge.mjs` | **Retain as form-difference diagnostic, not a traversal engine** | 21/28 source-backed events sampled from existing 168/177 graph, not new completeness |
| Full embedded standalone P2–P8 HTML deliveries | **Archive as prior UX evidence; no P9** | Large snapshots don't track changed source approvals or newest main. No replacement/deletion of provenance without user approval |
| `tests/visible-mass-stage-a-reconciliation.mjs` | **Retain as a source-parity gate** | Counts are reconciled from source-owned records; no content duplication or promotion |

## Next execution gates — in strict order

1. **Reconcile PR #1309 with main** before feature edits. Update the reader reference contract to the current production `src/learn/mass-explorer.js` and its 84 bilingual readings. Preserve author IDs/source citations and validate 48-card LIVE noninterference. Do not auto-merge either draft PR #1309 or Ultra Master #1270.
2. **One six-hotspot sanctuary vertical slice:** read canonical G### definitions from original owners, dynamically resolve existing 134-question registry and **97 held research answers** via source IDs, not frozen copied paragraphs. Add an explicit preview/published gate and preserve unavailable answers. Do not deploy.
3. **Verify on devices**, audit licensing and language parity, validate all six exact photo coordinates, and demonstrate three complete object-to-knowledge journeys with correctly restored camera/folio position. Only then review an app route under established navigation.
4. **Ceremonial integration later:** use source-certified objective engine or R17 cue engine for relevant selected action links, not a newly written 168/177 traversal. Requiem, processions and special-day branches remain explicit form-specific gates.

**Stop condition:** No further standalone prototype release, mass study copy rewrite, new object inventory or new object-specific rubric until the current main/source-owner parity checks and six-hotspot release statuses are resolved.
