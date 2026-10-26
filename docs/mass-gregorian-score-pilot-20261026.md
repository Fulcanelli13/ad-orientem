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

## Validation status and release gates
1. Parse/source guard tests in `tests/reader-chant-score-pilot.mjs`, `tests/mass-chant-programme.mjs`; real Exsurge engravings at 260/420/800 px in `tests/reader-chant-engraver.mjs`; all part of `npm run test:reader-schola`.
2. The existing `tests/full-mass-preflight-phone-e2e.mjs` covers 390px independent selections, changes to Gregorian/polyphonic practice, omission, Low Mass and date reset.
3. The existing `tests/offline-snapshot-e2e.mjs` checks the package and real offline first-use engraving/reflow.
4. **Pending acceptance:** successful latest CI for full Schola and native reader; physical-device glyph/typography review, facsimile comparison, editorial pitches/episemata/repeats; verified Gregorian/other Ordinary repertoire beyond these samples; rubrical presence/omission rules; source-backed Propers mapping.
5. Main production gate also has an **unrelated** hygiene failure because `.github/workflows/hero-subject-quality-20261026.yml` requests `contents: write`. Do not relax this guard in the music PR.
6. Do not merge this draft until these checks and source-identity constraints pass.

The user has committed to a free (€0) infrastructure strategy. No paid storage, metered external notation/audio service, speculative recordings or additional module has been introduced.
