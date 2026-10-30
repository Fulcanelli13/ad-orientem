# 2026 Mass readings → Sacred Art fit-review registry

This is a **365-day working editorial register**, not a change to live 1962 Mass content. The user reviews **broad fit first**, then **exact fit**, then **gaps**; only afterwards may new painting research start.

## Coverage
- 365 dated 1962 general Roman Calendar rows (Jan–Dec 2026)
- 365 first-lesson/Epistle citations and 365 Gospel/Passion citations, all **source-provisional where not independently collated**
- 165 days with at least one existing art candidate; 200 currently without any
- 986 proposed day-to-painting shortlist rows (many-to-many, not approval)
- 10 days have preserved historical Class I art approvals from `src/calendar/approved-class-i-heroes-2026.js`
- 13 multiple-lesson/rite-context days, 5 explicit reading exception overrides

## Major caveats
The yearwide machine-readable baseline (`igorlaguiar/ambo-liturgical-calendars`, MIT, pinned SHA `af4a22a4014e9a46cadafc4c2ede4aa784f5a6f2`) was not fully independently collated against every 1962 Latin source. Its own PROVENANCE.md admits *Pentecost white*, *Palm blessing Gospel mistaken for Mass Gospel*, and incomplete *Christmas three Mass forms*. Fixed explicitly in this register; also Palm, Holy Wednesday, Good Friday, Easter Vigil have source-order protection. No publication until comprehensive Proper source-path verification.

Good Friday is a solemn liturgical action, not an ordinary Mass. The 'first reading' is the first prophecy. Holy Saturday has four prophecies before Mass Epistle; the bogus source citation joining Colossians and Psalm 117 is removed. Christmas carries Midnight, Dawn, Day as distinct formularies. Extra Ember lessons are retained in `additional_readings`; user must not flatten them.

The **first fit** list is proposed by passage overlap and restricted feast-title matching, using the Oct 30 canonical 383 and 989 operational Sacred Art Scripture registers. A verse overlap is never equated with identity of a depicted scene. Candidate photos, exact subject images and rights may still be unverified. Historical approvals are retained separately, with later user dislike of Ugolino da Siena overriding the former Thursday preferred artwork.

## Data
- `data/calendar/2026-calendar-reading-art-fit-review.v1.json` all dated details and review fields
- `data/calendar/2026-calendar-reading-art-fit-review.v1.csv` one row per day for workbook import
- `data/calendar/2026-calendar-art-candidates-fit-review.v1.csv` one row per suggested day→art pairing; editorial decisions must be entered against each stable pair, not against art identity alone

## Review progression
**Stage 1:** Decide broad `FIT / NOT_FIT / ALTERNATIVE / UNDECIDED` for each day-to-artwork proposal, preserving old approvals. **Stage 2:** For fit-approved pairings, inspect image, verify narrative subject, passage and liturgical appropriateness; decide exact/canonical/seasonal/indirect fit with reasons. **Stage 3:** Only then report genuinely unfilled days/feasts. **Stage 4:** Research new artwork solely for confirmed gaps.

No automatic edit to canonical registry or production, no new artwork research.
