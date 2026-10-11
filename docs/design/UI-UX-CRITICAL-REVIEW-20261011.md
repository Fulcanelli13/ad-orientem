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
| Pray | Source-confirmed | The 94dvh cream bottom-sheet does not resemble the dark main app | Make Prayer a real full-screen destination; parchment reading optional | Consistent navigation while preserving all source prayers |
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
