# Guide coverage — two functions, every active route (10 October 2026)

This is the source-level audit of **informational/contextual Guides** (history, meaning, custom, posture, doctrine and linked original sources) and **practical guided companions** (step-by-step prayer, study or sacramental preparation). It follows the text and speaker-label corrections in merged PR #878.

Canonical route-based ledger: [guide-coverage-two-function-audit.v1.json](../data/app/guide-coverage-two-function-audit.v1.json). Every entry maps to the existing [navigation registry](../data/app/content-navigation-registry.v1.json) and identifies evidence source, coverage classification, missing or incomplete functions, and a concrete follow-up. All evidence strings are checked by the app contract suite.

## Measured source coverage

| Measure | Count |
|---|---:|
| Navigation registry routes covered, including aliases/hubs and gated records | 63 |
| Active real surfaces/modules assessed for guidance | 51 |
| Routes requiring contextual Guide review (partial or no dedicated Guide evidenced) | 29 |
| Routes requiring practical walk-through review (partial, absent or editorial-only) | 15 |
| Gated unpublished research routes correctly excluded | 2 |

**These 29 and 15 are not additive.** Many modules need both reviews. 'PARTIAL' and 'GAP_CANDIDATE' denote source-level evidence that dedicated Guide coverage is not complete or not established; they are **not a claim** that users see no instructions. No item is marked browser-tested. Hubs, aliases and passive references must not be forced into an artificial Next/Previous flow.

## Immediate priorities

**Mass:** The historical R17 Guide registry validates 32 entries (30 earlier card positions plus Asperges and post-Mass), while the native product uses 48 LIVE cards. The app does offer Guides and a live follow-along sequence, but the audit has **not proven an explicit source-approved Guide assignment for each of the 48 cards or every exceptional rite**. Build a one-to-one 48-card coverage and exception matrix; avoid downgrading the product to the obsolete 30-card reader.

**Prayer:**
- Short standalone texts (De profundis, Eternal Rest, Prayer Library): provenance is available in the library, but a contextual *why/when/how* Guide is not demonstrated for each prayer. This does not imply an extra guided step for every one-line prayer.
- Seven Penitential Psalms, Litany of the Saints and Seven Last Words: guided progression exists; richer contextual/historical purpose and posture notes need review.
- Angelus/Regina Cæli: history and meanings exist; check individual/group recitation cues rather than adding a duplicate guide.
- Litany of the Holy Name, Sacred Heart, Communion Treasury, Good Death and Dying Companion: intros, sources and some practical segmentation exist, but not a consistent two-function Guide. Prioritise the Dying Companion's urgent 'call a priest' and the distinction between lay prayers and priest-only rites.
- Morning/Evening Prayer and Nightly Examination already have working guided cards; add historical/contextual explanation without changing canonical prayers.

**Formation:**
- Sexual Ethics has sourced Q&A and debate material, but no assessed guided thematic study journey across its 147 public questions. Do not duplicate or reword doctrinal answers.
- The full Catechism has a live reference reader; independent approval of the separate 181-claim Guided Catechism remains pending, so it cannot be treated as released.
- Existing sacramental guides have practical static PREPARE/RECEIVE sections but not an assessed interactive walk-through. Evaluate individually; do not simulate priest-only ritual instructions.
- Mass Formation, Latin lessons, Spiritual Life and server responses already have sequenced teaching/training pathways and source material.

**Calendar / Explore:** Calendar needs a concise source-bound legend for class, colour and commemoration, rather than another date engine. The six Explore lenses expose source-backed records but are not proven to provide a unified classification/context Guide. A pilgrimage walk-through must use a verified documented route, not an invented itinerary; worldwide or cross-country practices must not be misleadingly attributed to one nation.

## Governing acceptance for each corrective batch

Every relevant module should make historical/doctrinal context available without crowding prayer text, and expose an optional, sequenced companion only where genuine participation or learning has stages. Each Guide claim must link to its original source where appropriate; EN/FR parity and source integrity remain hard gates. Phone acceptance must confirm opening/closing the Guide, Next/Previous, changing language without losing place, returning to its module and not covering prayer text.

**This PR records gaps. It does not inject generic Guides, certify unsourced commentary, publish Apologetics/Church Crisis research, or change runtime navigation.**
