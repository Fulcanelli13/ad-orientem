# Ad Orientem · Mass Music M07 — full source-first candidate census
31 October 2026 · stacked on M06 #2159, M05 #2157, M04 #2156, M03 #2154, M02 #2153, M01 #2152

## Editorial policy
**Collect / provisionally classify all candidates first. One editorial user review when the complete quality-screened collection is ready.** No more piecemeal approval batches. In particular:
- Neither score sourcing nor the 1962 calendar text match constitutes approval of musical notes, seasonally allowed variant, printed edition identity or commercial recording rights.
- The existing H7 → R17 LIVE/MISSAL reader, 36-event Schola clock and existing #2111 Exsurge viewer remain the ONLY intended runtime surfaces.
- No source from M07 is imported by the production reader. No GABC, sound file, hidden streaming engine, second UI, or artist permission is published.
- The complete 1,195-record GABC archive stays in unmerged research PR #1749. **Do not download or re-encode it again.** M07 copies only its metadata identities and stable source hashes for editorial routing.

## Census — all 1,195 candidates organized
Based on existing primary research in [PR #1749](https://github.com/Fulcanelli13/ad-orientem/pull/1749), archived `gr1961-proper-index.json` and six pinned `gr1961-proper-00N.json` source batches:

| Category | Proper chants | Source status |
|---|---:|---|
| Introits (`in`) | 229 | Indexed research only |
| Graduals (`gr`) | 189 | Indexed research only |
| Alleluias (`al`) | 284 | Indexed research only |
| Tracts (`tr`) | 83 | Indexed research only |
| Offertories (`of`) | 185 | Indexed research only |
| Communions (`co`) | 225 | Indexed research only |
| **Total** | **1,195** | **Zero musical approvals** |

M07 stores 6 metadata-only review files `data/research/mass-music-m07-gr1961-review-001.v1.json` through `-006.v1.json` (200, 200, 200, 200, 200, 195 records). Each has the source research branch/path, Git blob SHA, original GregoBase identity, exact Proper role, incipit, 1961 printed folio, original GABC SHA-256 and source URL. The GABCs themselves are not recopied.

The original importer screened 1,254 source-matched entries, staged 1,195 GABC rows, excluded one duplicate and recorded 58 transcription exceptions. Never interpret these figures as 1,195 actual resolved Mass assignments.

## Source text screening — 342 limited leads
The original 1961 archive contains **342** Proper-source textual leads, here indexed separately as `mass-music-m07-342-source-triage.v1.json`:
- 275 strong initial-text agreements
- 39 partial initial-text agreements
- 28 early text divergences
- 506 occurrence-level references spanning 91 source Proper paths
- 157 simple-slot records (Introit/Offertory/Communion); 185 pre-Gospel records (Gradual/Alleluia/Tract)
- 46 contested source-section contexts
- **0** confirmed 1962 selected Proper assignments in the original triage; **0** facsimile note approvals; **0** releases.

These 342 are a **subset** of the 1,195 archive, not additional 342 scores. All 342 are linked by stable `GREGOBASE-N` ID and identical original GABC SHA; section/position risks and canonical donor text/source path are retained, not collapsed into a 'matched' boolean.

## Actual 2026 selected-Mass sample — evidence, not release
The earlier real 2026 production Calendar-day sweep checked 365 days, and recorded **three distinct textual candidate IDs** across four occurrences:
- `GREGOBASE-195` — Offertory, 14 September, `Sancti/09-14`
- `GREGOBASE-346` — Communion, 14 September, `Sancti/09-14`
- `GREGOBASE-389` — Introit, 4 and 5 October, `Tempora/Pent19-0`.

The bounded observations (source-bound, not musical) are preserved in `mass-music-m07-selected-2026-text-evidence.v1.json`. The other 339 candidates from that earlier limited sweep are **unobserved**, not rejected. A text match against one day's selected Proper is not full 1961 musical facsimile parity.

## 27 additional sources and gaps, separately tracked
`data/research/mass-music-m07-priority-source-queue.v1.json` contains **27** research positions beyond the six Graduale Proper parts, of which 8 have a concrete GregoBase chant ID and 19 have a 1961 indexed folio or a source requirement, but still need an exact selected-score identity.

Important results:
- 1961 Liber Usualis p100 source [#4488](https://gregobase.selapa.net/chant.php?id=4488) describes an **old ad-libitum solemn oration tone which is allowed even in ferial or Requiem Masses**; do not derive it automatically from the feast's class.
- The distinct simple tone [#4489](https://gregobase.selapa.net/chant.php?id=4489), p101, is described for aspersion/blessings/litanies and other prayers, with explicit rules for Super populum; not a generic substitute for the main Collect.
- Gospel sources #4490–4492, LU pp106–108, have edition references but at least #4490–4491 specifically lack a fully transcribed example Gospel reading.
- Separate opening Preface material #7674–7675, LU p109, must be compared with the already complete paired M05 scores #4449–4450 before reuse or playback.
- Five **Sequence** folios: `Victimae paschali` (780), `Veni Sancte Spiritus` (880), `Lauda Sion` (945), `Stabat Mater` (1634), `Dies irae` (1810). These are not included in the 1,195 `in/gr/al/tr/of/co` archive, and their 1962 day, optionality and musical form must be verified separately.
- Ordinary `Ite missa est/Deo gratias`, Requiem `Requiescant in pace/Amen`, and specified processional `Benedicamus Domino/Deo gratias` **need distinct canonical Mass score/response pairs**. The M05 `Ite Ia` #2988 explicitly has *alleluia, alleluia*, and is not default.
- **Office warning:** the similarly named `Benedicamus Domino` settings listed in Liber Usualis pp124–127 are **Lauds/Vespers**, not evidence for Mass dismissal. Excluded from Mass adaptation.
- The original 58 GABC importer failures and exact-duplicate/variant collisions have separate research slots.

Primary index: [1961 The Liber Usualis — GregoBase](https://gregobase.selapa.net/source.php?id=3), [1961 Graduale Romanum — GregoBase](https://gregobase.selapa.net/source.php?id=2). GregoBase CC0 is the transcription-data claim only; it is not facsimile approval or the licence of a recording.

## Validation
`src/mass/reader-m07-score-review-ledger.js` supplies a pure, fail-closed metadata audit. `tests/reader-mass-m07-review-ledger.mjs` runs inside the already required `test:reader-schola` pipeline.

The test cross-checks all six source batch IDs and Git blob SHAs, all 1,195 distinct chant/source hashes and exact role subtotals, 342 source-triage records and their hashes/506 donor references, 27 candidate/gap positions, the 2026 bounded sample, and non-promotability even with spoofed editorial flags. There is no public score loader. The test does **not** claim note-by-note validity or per-day liturgical assignment.

## Remaining work after M07
M08 should batch-screen source-edition facsimiles and record full versus partial melodic/text parity, with emphasis on actual selected 1962 Proper, 83 Tracts, five required/possible Sequences, the full sung orations and Pater noster, plus complete dismissal/response pairs. Retain variants and precise source roles; do not conflate sequences with Alleluia or merge distinct melodies sharing an incipit. Further canonical source retrieval can operate by page/chant identity, not bulk re-downloading files.

When the **whole quality-screened musical collection** is ready, present a consolidated editorial review; only then authorize approved sources for the already existing offline Exsurge renderer and R17 LIVE/MISSAL music cue surface. Until then PRs remain draft, unmerged, and score publication remains closed.
