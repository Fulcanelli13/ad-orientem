# Mass Gregorian score — implementation and release decisions

Updated 26 October 2026. Draft PR #1749; **not merged**.

## Existing architectural ownership
- `full-mass-preflight.js`: one unified Mass preparation Folio; no second calendar, music app or replacement Mass reader.
- 1962 calendar + selected Proper: authoritative **liturgical texts**. This research feature never changes these.
- `reader-schola.js`: ten Schola tracks, its own phrase progression and **observed** post-Consecration Benedictus release; no synchronization from priest scroll.
- `reader-dom.js`: existing resizable Schola surface, now able to display continuously scrolling offline Gregorian notation.
- `mass-chant-programme.js`: optional *user-reported musical metadata* tied to current Mass identity, not normative proof of what is permitted or sung.

## Source-controlled Gregorian pilot
Seven CC0 GABC transcriptions, all explicitly labelled research reference examples:

| Track | Example | GregoBase ID | 1961 Graduale | 1961 Liber Usualis |
|---|---|---:|---|---|
| Kyrie | Kyrie XVI | 545 | 54* | 59 |
| Kyrie | Kyrie XI | 2982 | 38* | 46 |
| Kyrie | Kyrie VIII | 1184 | 28* | 37 |
| Gloria | Gloria VIII | 961 | 29* | 37 |
| Credo | Credo III | 749 | 64* | 68 |
| Sanctus/Benedictus | Sanctus VIII | 1384 | 30* | 38 |
| Agnus Dei | Agnus Dei VIII | 2760 | 31* | 39 |

All four newly added sources are in `reader-ordinary-scores-1961.js` with the complete Latin GABC body as retrieved from GregoBase on 26 October 2026. Original transcriber for those examples: Andrew Hinkley. **Do not describe any of these as applied to the local Mass unless the user explicitly reports their use.** Variants are independent choices: a Kyrie choice does not infer its matching Gloria/Sanctus/Agnus or a Credo.

GregoBase transcriptions: CC0, https://gregobase.selapa.net/?page_id=2.
Each source page is `https://gregobase.selapa.net/chant.php?id=ID`.
The GABC files need editorial comparison to printed Solesmes witnesses before pitch/repetition acceptance; record individual hashes as part of that process.

## What actually runs
- `assets/vendor/exsurge/exsurge.min.js`: pinned MIT Exsurge from `bbloomf/exsurge` commit `6322cce596b86f9b3d354e7ff3bdcbfe2f3f6ab8`, with LICENSE included.
- `reader-chant-engraver.js` converts bundled GABC to real local SVG, reflowing at viewport width; no remote SVG fetch, third-party script, paid runtime or musical audio. Two independent viewport renderers for inline and expanded score; stale-render suppression.
- App's transactional `sw.js` bootstrap snapshot includes the local Exsurge bundle, even though the script is loaded only when notation is first opened.
- The existing Schola dock offers SCORE for a track only when that track has an example source and when the current performance is not explicitly polyphonic Sanctus. Scores scroll manually, independent of all Mass cards, priest actions and observed Schola progress.

## Pre-Mass selection
In the **existing** Folio reader step, `Chants of this Mass` is optional for sung/solemn **calendar or votive** Masses only. Requiem, Nuptial, Good Friday and Easter Vigil are excluded pending their separate source rules. Five independent slots are available: Kyrie, Gloria, Credo, Sanctus/Benedictus, Agnus Dei. The selection for each defaults to Unknown; no matching Ordinary is assembled automatically.

`createMassChantProgramme` validates each score ID against the local source catalogue, records each choice under one session identity (date, actual Mass, Proper source, form), and leaves all other tracks unknown. Identity changes and Low Mass clear these selections, and no persistent parish-wide defaults are invented.

A **separate** Sanctus/Benedictus choir-practice selector reports: Not known, Continuous Gregorian, or Polyphonic with delayed Benedictus. This is handed to the already-existing Schola performance engine. Selecting a Gregorian score by itself never releases Benedictus or asserts whether the choir sings continuously; declaring polyphonic prevents the Gregorian Sanctus score from being mislabelled as its notation. A later Benedictus is released only by the existing *observed* Schola control.

The programme and performance profile pass through the existing `readerPreferences` session and resumable record; no other reader architecture changes. Audio and listening/study belong to Mass preparation, not the live reader.

## Christmas Day source-matched Proper — first systematic template

Five 1961 Solesmes Proper transcriptions now live in
`src/mass/reader-christmas-proper-scores-1961.js`, keyed by real GregoBase
ID and source pages, **not by a calendar date**:

| Source-owned track | Christmas Mass in die example | GregoBase | GR 1961 |
|---|---|---:|---|
| Introit | Puer natus est | 72 | p. 33 |
| Gradual | Viderunt omnes | 1163 | p. 33 |
| Alleluia | Dies sanctificatus | 324 | p. 34 |
| Offertory | Tui sunt caeli | 1274 | p. 35 |
| Communion | Viderunt omnes (different chant) | 1139 | p. 35 |

`reader-proper-chant-crosswalk.js` accepts a record **only** when the
production `properToReaderSlots` projection has a nonempty source path,
the correct READY slot, and a matching Latin incipit within the source-owned
text. It never uses December 25, the title of the feast, or a requested
formulary as sufficient evidence. A different Christmas Mass, a missing
Proper, an extra independent Alleluia, an ambiguous duplicate candidate
or mismatched chant type must not trigger a score.

The actual native reader is handed **`ready.model.properSlots`**, not
an independently reconstructed calendar or a provisional source title.
Only crosswalk-matched Proper examples appear in the Schola score control;
their visibility means **source score matching**, not that the local choir
was observed singing the melody. This pilot is five records, not a claim
of nationwide Proper repertoire completeness. All five have been directly
parsed and engraved into SVG at 260 and 800 px. Print-facsimile editorial
comparison and actual end-to-end device CI remain release gates.

## Score study within the existing pre-Mass Folio

The optional `Chants of this Mass` disclosure now also contains a
**Study Gregorian notation** area. It lists the user's explicit Ordinary
melodies and any Proper score whose canonical Latin source actually matches
the witness. It displays full locally engraved GABC notation with manual
scrolling and an outbound provenance reference. No second Mass calendar
or separate autonomous music product is introduced.

A versioned recording-permission gate exists in
`src/mass/mass-chant-preparation-study.js`: only edition-reviewed,
copyright-cleared, human-approved audio can be made available. **Zero**
recordings currently satisfy this gate; therefore no playable audio is
presented, rather than introducing synthetic chanting, unlicensed recordings
or a quality-compromised placeholder. The Mass reader imports no audio
study component and never plays sound.

For scaling, subsequent Proper batches must retain the same schema:
GregoBase score ID, 1961 edition/page, full GABC, chant type, Latin incipit,
source history/provenance and a canonical source-text matching rule. New
scores remain unassigned until their owning Proper is resolved. Candidate
discovery and verified promotion are separate gates.

## Bulk Graduale corpus — existing parallel research pipeline

The existing `tools/mass/import-gregobase-graduale1961.mjs` already
ingested the **pinned 5 January 2024 GregoBase SQL snapshot** into six
checksummed, staged JSON batches. Audit figures: **1,254** matching
1961-edition core rows, **1** excluded duplicate, **58** unusable
transcriptions quarantined, **1,195** staged text/notation bodies.
By musical part: 229 Introits, 189 Graduals, 284 Alleluias, 83 Tracts,
185 Offertories and 225 Communions. Source authority remains limited:
a linked GR 1961 page does not independently prove local 1962 usage or
facsimile-correct musical notation. SQL GABCs are raw notation bodies
without full file header, unlike the 12 hand-curated pilot examples.

**No additional scraper or competing archive was created.** The existing
archive remains research-only and is not dynamically imported by the reader.
`tools/mass/gr1961-promotion-gate.mjs` now codifies six required
review decisions for each future promotion: canonical 1962 Proper slot,
actual Latin source-text identity, printed edition/page, musical facsimile,
stable source identity, and separate observed-vs-prescribed programme
status. Every gate needs PASS + reviewer + evidence reference, together
with matching GABC SHA-256 and an explicit promotion manifest.

`tests/gr1961-promotion-gate.mjs` checks every one of the **1,195**
archive rows is withheld by default, a synthetic fully approved item
can pass, and any omitted approval or corrupted GABC fails. It is
added to `npm run test:reader-schola`. **0 records actually promoted**
by this step. Two differently notated same-incipit variant groups and
one exact-notation duplicate group are preserved for identity review;
they are not silently collapsed.

## Validation status and release gates
1. Parse/source guard tests in `tests/reader-chant-score-pilot.mjs`, `tests/mass-chant-programme.mjs`; real Exsurge engravings at 260/420/800 px in `tests/reader-chant-engraver.mjs`; all part of `npm run test:reader-schola`.
2. The existing `tests/full-mass-preflight-phone-e2e.mjs` covers 390px independent selections, changes to Gregorian/polyphonic practice, omission, Low Mass and date reset.
3. The existing `tests/offline-snapshot-e2e.mjs` checks the package and real offline first-use engraving/reflow.
4. **Pending acceptance:** successful latest CI for full Schola and native reader; physical-device glyph/typography review, facsimile comparison, editorial pitches/episemata/repeats; verified Gregorian/other Ordinary repertoire beyond these samples; rubrical presence/omission rules; source-backed Propers mapping.
5. Main production gate also has an **unrelated** hygiene failure because `.github/workflows/hero-subject-quality-20261026.yml` requests `contents: write`. Do not relax this guard in the music PR.
6. Do not merge this draft until these checks and source-identity constraints pass.

The user has committed to a free (€0) infrastructure strategy. No paid storage, metered external notation/audio service, speculative recordings or additional module has been introduced.
