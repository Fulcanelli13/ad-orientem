# Pray B27 — Montfort: historical litany completion, no new programme

**Date:** 29 October 2026. Supersedes only the three explicit `SOURCE_TEXT_HELD` prayer slots in B26; keeps the same four-phase 33-day reader, local completion, date arithmetic and Day 34 consecration.

## Original-source admission

| Historical prayer | Digital English witness | What this PR contains | Print certificate |
| --- | --- | --- | --- |
| Litany of the Holy Ghost | *Manual of Adoration of the Most Blessed Sacrament*, B. Herder, 1897, printed pp.235–239, crosschecked against the eCatholic traditional consecration text | 9 opening calls, 21 response-bearing invocations, 14 directed petitions, 3 Lamb-of-God supplications, ℣/℟ and complete collect: **49 source rows** counting the collect | **No** — book scan located; page images not independently word-for-word collated |
| Litany of the Most Holy Name of Jesus | Bonaventure Hammer, *Mary, Help of Christians* (1909), "The Four Approved Litanies"; compared with *Raccolta* 1910, no.56, pp.50–54 | 5 openings, 42 mercy invocations, 2 mercy petitions, 20 deliverance invocations, 3 Agnus Dei, 2 closing responses and both concluding collects: **76 source rows** | **No** — independent photographed pages not collated |
| Prayer attributed to Saint Augustine | *True Devotion* §67, Frederick William Faber's 1863 English translation and Montfort-transmitted Latin | Three complete English paragraphs and three Latin source paragraphs, not a shortened "Noverim te" ejaculation | **No** — citation and historical edition sourced, printed facsimile word-by-word collation pending |

**Correction to previous status:** These historical-language prayers are now present and prayer-ready in the app. This is **digital historical witness completion**, not the stronger claim of original printed-page verification or an independently authenticated Augustinian autograph. The old B26 source-hold entry was formally reconciled rather than left contradictory.

Primary references:
- 1897 *Manual of Adoration* public-domain scan: https://upload.wikimedia.org/wikipedia/commons/0/0c/Manual_of_adoration_of_the_most_Blessed_Sacrament.._%28IA_manualofadoratio00schm%29.pdf
- 1897 historical English Litany and following collect in later devotional transcription: https://www.ecatholic2000.com/montfort/true/devotion.shtml
- 1909 Hammer original English text, Wikisource: https://en.wikisource.org/wiki/Mary,_help_of_Christians/The_four_Approved_Litanies
- *Raccolta* 1910 original entry 56 (comparison only): https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf
- Montfort *True Devotion* §67, Faber's historical English and transmitted Latin: https://www.ecatholic2000.com/montfort/true/devotion.shtml

**Important witness differences:** The eCatholic version contains an optional Eucharistic invocation in its Holy Name litany that is **not** part of the 1909 Hammer default; we have not imported it into a prayer presented as universal. The 1897 Holy Ghost recital is an identifiable period prayer form, but Montfort's own first part, containing directions about this litany, is lost. We therefore do **not** say the 1897 text is Montfort's personal exact recension or that the original lost manuscript has been recovered. No old historical indulgence grants are displayed as presently valid. No 1987 Montfort Missionaries copyrighted translation has been copied.

## Reader design and invocation ownership
- Existing **Pray → Devotions & Novenas → Montfort** programme, *no new top-level Prayer family*.
- Days **13–26** now present the entire English Litany of the Holy Ghost, followed by its own collect, and retain the original canonical 1962 Loreto Litany or Holy Rosary where required.
- Days **27–33** additionally present the entire 1909 Holy Name Litany, its two distinct collects and the optional longer St-Augustine-attributed prayer (full Faber English; original Montfort Latin in its own disclosure).
- The traditional **seven-stanza Ave Maris Stella** remains in Latin. The **short Come Holy Spirit** stays available in the prayer bank but is *removed* from the required-Litany slot in the three preparation weeks; never confuse an ejaculation with this full litany.
- Each long historical litany is presented as a discrete responsive in-place disclosure, with each petition and its response grouped on the same row, full collect, original source link and visible non-certified edition label. No forced long scrolling and no new navigation engine.
- UI navigation and source notes are bilingual EN/FR, but historical prayer language is **English**, not an AI-generated French original.
- Preservation: `data/pray/pray-b27-montfort-three-prayers-source.v1.json` is the single immutable source work inventory; `src/pray/montfort-original-prayers-b27.js` projects the exact same texts for offline runtime. Core 48 Prayer IDs and original 16 Novena IDs are untouched.

## Acceptance
- Source completeness tests: Holy Ghost original response groups and complete collect; Holy Name all 42 invocations and 20 deliverance groups and *both* collects; §67 Augustine in its complete Faber English and Montfort-Latin forms.
- 320/390px actual browser test: phase 13 Holy Ghost litany expansion and final collect, phase 27 Holy Name litany and original prayer, no horizontal overflow, unchanged full Faber Day 34 consecration.
- Required Pray owner regression suite, existing guided cards and phone workflows and exact-merge deployment state must pass before public release.

## Finite closure
After B27, **all three historical prayer gaps identified in B26 have actual English devotional text on the existing reader**. Remaining bibliography work is limited to print-image textual collation and independent French-language witnesses; these are **accuracy/translation enhancements**, not conditions for the complete English programme. Do not reopen a general 97-candidate Prayer Corpus discovery project on their account.
