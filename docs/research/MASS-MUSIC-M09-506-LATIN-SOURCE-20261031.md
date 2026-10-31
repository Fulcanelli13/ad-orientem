# Ad Orientem Mass Music M09 — Latin donor-line screening and 1962 Sequence placement

31 October 2026 · Stacked on M08 #2162 → M07 #2161 → M06 #2159 → M05 #2157 → M04 #2156 → M03 #2154 → M02 #2153 → M01 #2152

## Complete second-stage Latin-text screen

This M09 pass reads **the original 1961 Graduale GABC source strings from existing draft PR #1749** and the 342 originally triaged source candidates. The records are not downloaded again. The review source in M07/M08 is preserved unchanged.

For each one of the 506 source occurrences, the original source-Proper donor line is normalized (accents and ligatures, punctuation and V. siglum), and compared with the Latin **text stream** obtained from the corresponding GABC by stripping note groups and typographical commands (not by changing the original score).

Six new ledgers, `data/research/mass-music-m09-1962-line-qa-001.v1.json` through `-006.v1.json`, retain original score ID and hash, candidate tier, source Proper path, donor blob SHA, source section, positional flags, total source words, and matches.

| Comparison | Occurrences | Meaning |
| --- | ---: | --- |
| Complete normalized source line found contiguously | 239 | This donor line's Latin words appear somewhere inside candidate score text, but **not necessarily** the complete score or correct Mass slot |
| Eight or more initial words | 124 | Prefix found, full donor-line text not established |
| Four to seven initial words | 44 | Ambiguous or incomplete textual alignment |
| No secure four-word prefix | 99 | Potential wrong text, different strophe, unrelated source role, local source variation or parsing gap; **do not reject automatically** |
| **Total** | **506** | **0 musical approvals** |

There are **342 distinct candidate GABC IDs**, with 506 occurrence-level donor references; overlapping donor paths are preserved as different source relationships. The source-original 2026 production sweep found three distinct textual IDs across four occurrences, which is separate bounded evidence and does not certify these scores for all calendar/votive Masses.

**Critical limitations:**
- Removing `(...)` GABC note groups gives a Latin text stream, not a complete syllable-by-note musical collation. A complete *donor line* can match a wrong melodic variant.
- `sourceSection` and `sourcePosition` are carried forward and **not adjudicated** by a line match. No generic Graduale source-text bucket may replace a dedicated Tract/Sequence rule.
- Neither the 1,195-archive source ID, source URL, lyric prefix nor a 1961 printed edition reference is a recorded **actual 1962 Proper** decision or printed 1961 note parity.
- These 99 weak occurrences are an investigative queue, **not rejected scores**. Retain all historic variants and exact IDs.
- New scores remain unapproved research; no live score, audio or enhanced notation button is released.

## Exact 1962 Sequence decision gate

`src/mass/reader-m09-sequence-eligibility.js` and its new test check an authenticated actual Mass, a **source-exact** identified Mass Sequence, and certified pre-Gospel role.

1962 `Missale Romanum` General Rubrics §469: Gradual, Alleluia and Tract as specified in the Mass. §470: Sequence is said **before the last Alleluia** or **after the Tract**, and **omitted in votive Masses**. §399: `Dies irae` mandatory in first-class Masses of the Dead, otherwise may be omitted, subject to the special All Souls three-Mass exception. See [original rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html).

Source-only candidate IDs previously identified in M08:
- Victimae paschali — GregoBase #1086.
- Veni Sancte Spiritus (the actual Sequence, **not** Alleluia #181) — #68.
- Lauda Sion — #308.
- Dies irae — #1198.
- Stabat Mater — #681.

The rule accepts none of these by feast-title/date alone. The actual selected `1962_PROPER_RESOLVER` must certify the same Proper source and `SEQUENTIA` identity; the pre-Gospel source must establish where the last Alleluia or Tract stands. A Requiem class and its exceptional three-Mass context are examined separately. The result is `SOURCE_ELIGIBLE_NOT_MUSIC_APPROVED` at best, with `renderedScoreAllowed:false`.

For All Souls where three Masses are said without intermission, the rule deliberately returns a source hold pending the precise ceremonial choice rather than guessing which specific Mass requires the `Dies irae`. This is intentionally conservative.

## Implementation and acceptance

New:
- `src/mass/reader-m09-1962-latin-discrimination.js`: normalized Latin text screening and source-provenance audit; no runtime reader imports and public score release always null.
- Six `data/research/mass-music-m09-1962-line-qa-00N.v1.json` audit batches.
- `src/mass/reader-m09-sequence-eligibility.js`: independent 1962 rubrical source rule for Sequence, Tract/Alleluia and Requiem.
- `tests/reader-mass-m09-1962-latin-line-screen.mjs`: source count, identity and corruption checks.
- `tests/reader-mass-m09-sequence-eligibility.mjs`: no votive Sequence, exact day owner, All Souls exception, last-Alleluia/Tract placement and Requiem I vs II–IV.
- Both imported into existing required `tests/reader-schola-source-itinerary.mjs`.

No Mass reader UI, event timing, score renderer, audio, selected 1962 Proper, liturgical text, or editorial approval state is changed.

## Next

M10 should investigate the 99 insecure donor-line occurrences first, including section/role mismatches, textual variants, truncated witness lines and cases where source name matches but actual phrase does not. Then validate complete Latin and **note-by-note facsimile** for high-priority candidates, distinguish actual selected 1962 Mass rules, and fill full oration, Gospel, Pater noster and dismissal/response scores. All candidates remain collected for a single final editorial review rather than individual approvals.
