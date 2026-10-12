# Ad Orientem: critical UI/UX review and phone acceptance ledger
11 October 2026. Status: REVIEW ONLY. No design approval or release certification.

## Scope and evidence

The dedicated Playwright workflow opens **actual app routes**, not static mockups, and captures Today, Calendar Month, Mass Entry, Pray Hub, Rosary, Formation, Scripture, Explore, and Settings at 320x700, 390x844 and 430x932, in English and French. That is a 54-frame target matrix. The archive includes index.html for side-by-side visual inspection and matrix.json for measurements, route availability and JS errors.

The scanner reports horizontal overflow, a representative sample of text below 11 CSS pixels, and representative controls below 40 CSS pixels. These measurements require classification, not automatic redesign. Language is set through real Settings, not inferred from browser locale. CI uploads partial evidence even when captures fail, but marks the job failed for missing required screens.

Limitations: browser captures are not physical phone acceptance; Explore tiles may depend on external transport. Mass Entry shots do not certify LIVE or special structures. The Rosary frame is a sample, not full traditional method, Stations or Benediction acceptance. Original Mass, source, art-rights, doctrine and historical donor gates remain separate.

## Section-by-section critical findings

| Section | Evidence | Criticism | Fix | Acceptance |
| --- | --- | --- | --- | --- |
| Global shell | Source-based architectural finding | Historic six-destination contracts coexist with the five-destination shell and feature-specific presentation vocabularies | One primary navigation, one Back system, one modal grammar | Stable Home/Mass/Pray/Formation/Explore, exact returns, no hidden legacy surface |
| Today | Source-confirmed | A no-art frontispiece can still consume roughly 205–280px and bury the principal action | Compress empty hero; make celebration and Open/Resume Mass dominant | Clear primary Mass action at all phone widths even without art |
| Calendar | Source-based interaction finding | Day selection can await whole-week preparation | Render chosen date first, neighbour prefetch later | Fast responsive date changes with no speculative feast state |
| Mass Entry | Source-confirmed | Celebration, form, reader mode, calendar and local exceptions are crowded together | Separate actual Mass from reading choice; collapse advanced differences | One understandable Start, no invented Proper or rites |
| LIVE | Source-confirmed | 7–10px ribbon/Guide labels and fixed 120px top chrome compete with prayer text | Raise secondary font size, protect reading viewport, hide inactive channels | Meaningful cues legible with 48-card production unchanged |
| Missal | Proposed, PR #1037 unmerged | Two columns on a small phone may compromise legibility | Single-column phone option; paired columns when space permits | No truncated Latin/French; section anchor conserved |
| Pray | Source-confirmed | The legacy cream-sheet CSS exists, but actual production screenshots show a dark integrated Prayer hub; the outstanding concerns are overly small captions and vertical content density | Preserve the current integrated dark Prayer hub; refine microtype and section density; keep parchment only if useful inside reading | Consistent navigation while preserving all source prayers |
| Rosary and Stations | Design risk | Method, meditation, progression and artwork may compete with recitation | Remember preference; one Begin, optional guide, restrained art | All original mysteries/methods/prayers retained |
| Formation | Source-confirmed | Two-column cards still forced below 430px; many long descriptions | Full-width intent-first navigation: search, question, course | Short answers accessible without excessive category traversal |
| Scripture | Architecture risk | Context reading and book-library controls coexist in one overlay | Prioritize cited verses and progressive disclosure | Accurate citations and exact return context |
| Explore | Source-confirmed | Heterogeneous map lenses and compact filter bar consume map space | Unified map with subject-specific cards/filter hierarchies | Pins and confidence accurate; map stays usable |
| TLM Directory | Product gap | Large provisional geocode research corpus is not the same as reliable public venue coverage | Name, credible pin, affiliation, source first; times later | Physical venue identity/source for every published site |
| Settings | Source-confirmed | Many advanced local custom switches may overburden normal use | Essential vs Advanced, explain immediate/future changes | No configuration required for ordinary usage; LIVE locks retained |
| Sacred Art | Editorial gate | Many acquired originals, zero final user art/crop approvals | Exact-source associations, one exception-only HTML audit | Rights/subject/crop approval before production |
| Apostolate | Design risk | Practical responses risk duplicating Formation's long dossier layout | Concise response first, deeper reasoning on request | Canonical Formation owner, no duplicate doctrinal text |

## Severity standard

P0: Broken route; incorrect language; hidden or unreachable controls; actual horizontal clipping; accidental Mass action; source substitution; stale/conflicting displayed state.

P1: Reproducibly illegible secondary labels; critical targets too small; confusing preparation/reader mode choices; cross-module visual discontinuity; unnecessary steps to common prayers.

P2: Redundant captions, weak information hierarchy, visual polish, optional artwork/crop balance and minor dense metadata.

A source-code observation must be marked SOURCE-CONFIRMED, a screenshot-visible issue VISUALLY-CONFIRMED, and an uncertain issue NEEDS-PHONE. Do not convert a test pass into visual or liturgical certification.

## Review workflow

1. Run the dedicated workflow and open the critical-ui-ux-review-matrix artifact, index.html.
2. Compare 320 / 390 / 430 and EN / FR for each section. Record only concrete discrepancies, screenshots and severity.
3. First adjudicate Pray presentation, LIVE typography (using additional dedicated R17 captures), Mass preflight and core navigation. Then Formation and Today; Explore next; Calendar, Scripture, Settings and Apostolate after.
4. Reconcile any implementation with current main and existing canonical module owner. No transplant of obsolete UI branches or replacement of R17 source data.
5. Every accepted change requires its original domain tests, current app convergence and affected phone/visual acceptance. Human approval remains explicit.

This is an audit branch; it changes no production UI, Mass canon, Prayer texts, maps or source registries.

## First real-screen visual adjudication — 11 October

First run: 48/54 frames; six Mass Entry captures absent because the test chose the hidden legacy host rather than opening the real Home preflight. The capture was corrected using the canonical Today action.

**Second run: 54/54 frames captured, CI green, zero measured global horizontal overflow.** [Actions run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38158624770). This certifies the capture harness, **not** product visual quality.

Confirmed from actual screenshots:

1. **P1 French UI-content mismatch** — FR Today and FR Mass Preflight show the observed liturgical title **“XX SUNDAY AFTER PENTECOST”** in English and an English Marian commemoration. Labels around them are French. Fix display-name provenance/translation centrally and source-first; do not invent a translated feast or mutate the 1962 resolved observance. The user-facing French title is NOT certified.
2. **P1 Mass Entry ambiguous close/back** — two visually similar × affordances occupy both top corners, at 320 and 390 widths. Verify their handlers and eliminate ambiguity without losing cancellation/safe leave behaviour.
3. **P1 Today no-art density** — large vacant painting block above the Mass CTA at 320 and 390 widths. Separate focused draft PR #1052 reduces only the no-art fallback block; approved artwork remains immersive. Requires after-shot acceptance.
4. **P1 Mass Preflight density** — separate header for observed day, repeat Mass of the Day selection, Vox/Missal, three language-availability badges and the deeper “Prepare your Mass” section compete at the initial viewport. Simplify flow without removing the source readiness gate.
5. **P1 tiny secondary text** — measured visible samples below 11 CSS pixels in Today, Pray, Rosary and Mass; enough to warrant targeted per-control review, not a global blanket font override.
6. **P1 Formation scanning** — two-column 390px introductory family cards truncate long explanatory text; a full-width, intent-first alternative should be compared before changing all sections.
7. **PENDING Explore** — early captures show “Loading documented places...” rather than rendered map. A screenshot of a loading screen cannot establish map appearance or map failure. The next capture must await the canonical Explore loadState=ready and mark source/tile readiness explicitly.
8. **CORRECTION Pray** — production Prayer hub screenshots **are dark and integrated**; the older cream-sheet stylesheet does not justify labelling the current product visually disconnected. Preserve the live design and focus on text size/selection depth.

No claims are made that the French liturgical source, Mass actual actions, or map loading have been fixed. Separate mobile human review remains required.

## Explore basemap acceptance correction — 11 October

The audit's successful 54/54 **route screenshots** must not be treated as 54
successful visual approvals. Its prior Explore screenshots included a
`Loading documented places…` screen without rendered geography or pins.

The capture now records distinct `localDataState` and `mapState`, a visible
canvas probe and explicit `mapAcceptance` classification. A screenshot with
loading, stalled, empty or unavailable map is `MAP_UNVERIFIED`; even a canvas
with `mapState=ready` is only `RENDERED_CANDIDATE_NEEDS_HUMAN_REVIEW`.
The `matrix.json` summary includes totals and unresolved examples, while the
HTML review board shows each Explore state alongside its capture.

This keeps the 54-frame route-coverage number separate from **actual basemap
visual acceptance**. The status and late-CDN recovery fix belongs to existing
[Explore PR #1058](https://github.com/Fulcanelli13/ad-orientem/pull/1058),
not to this read-only design review. It makes no claim about pin source
accuracy, tile provider availability, or physical phone acceptance.


## Completed non-Mass UI fixes — 12 October 2026

This read-only audit's original observations have been reconciled against production merges, rather than remaining misleadingly listed as unimplemented proposals.

| Finding | Status | Production evidence |
| --- | --- | --- |
| Today no-art hero height | **MERGED** | PR #1052, after checks; only the empty artwork fallback is compact |
| Formation narrow two-column subject cards | **MERGED** | PR #1054, full-width 320–430px rows and visible descriptions |
| Pray tiny family categories/descriptions | **MERGED** | PR #1054, scoped dark-hub typography, prayer content untouched |
| Explore truncated site names | **MERGED** | PR #1056, two-line place search labels |
| Scripture touch-target sizing | **MERGED** | PR #1056, source reading controls at least 44px high |
| Settings lost focus on repaint / modal escape | **MERGED** | PR #1056, preference focus retention and Tab focus trap |
| Explore blank map without readiness explanation | **MERGED** | PR #1058, independent remote map loading/stalled/no-pins states, source records unaffected |
| Calendar month categories wrap and split at phone width | **MERGED** | PR #1060, five categories on one horizontal rail at 320/390/430, 42-day grid unchanged |
| Mass Entry duplicate close/hierarchy and LIVE type | **DEFERRED** | The user explicitly deferred Mass UI changes |
| French liturgical-title source mismatch | **DEFERRED** | The user explicitly deferred French localization corrections |

**Important:** A merged CSS/accessibility fix and green CI are not a physical-phone visual sign-off; the audit's local dataset and map rendering acceptance remain separate. The 54-frame workflow records actual screen state, not approval, and the persistent Sacred Geography source/pin gate remains mandatory. No devotions, Mass rubrics, reader cards, proper texts or French liturgical titles were intentionally modified by the non-Mass repairs above.
