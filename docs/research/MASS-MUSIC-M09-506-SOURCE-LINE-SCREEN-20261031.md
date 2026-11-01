# Mass Music M09 — 506 independently screened Latin donor-line occurrences

**31 October 2026 · stacked on M08 #2162 → M07 #2161 → M06 #2159 → M05 #2157 → M04 #2156 → M03 #2154 → M02 #2153 → M01 #2152 · research only, no published scores**

## Completed source comparison

From the **existing GregoBase 1961 Graduale GABC** in draft PR #1749 and its original **342 source-path/section/text references** we performed a new, source-wide normalized Latin comparison. There was **no new GABC download**, no substituted PDF artwork and no cloned Mass/Schola engine.

Six research-only source/evidence ledgers `data/research/mass-music-m09-1962-line-qa-001.v1.json` through `-006.v1.json` retain 342 score identities, all 506 recorded occurrences and every candidate's original:
- `GREGOBASE-N` ID, source role (`in/gr/al/tr/of/co`) and GABC SHA-256 from original Graduale archive;
- `Tempora/...` or `Sancti/...` original Proper donor path, source-file Git SHA and actual source section;
- existing positional/context risk;
- normalized donor-line word count and **contiguous score-text word-prefix agreement**, computed from the original source GABC text with only notes/markup removed;
- strict research status: `NOT_VERIFIED` for actual selected Mass, `NOT_COMPARED` for printed neumes, no editorial approval, no public use.

### Exact occurrence counts

| M09 secondary check | Source occurrences |
| --- | ---: |
| Entire normalized source *donor line* is a contiguous substring of GABC Latin text | 239 |
| At least eight contiguous first words from donor line, but not the whole line | 124 |
| Four through seven contiguous first words | 44 |
| No secure contiguous four-word prefix | 99 |
| **Total** | **506** |

This improves discrimination of ambiguous GABC candidate sources. **A complete matched donor line is NOT equivalent to complete score text**: a Gradual, Tract or Introit can contain multiple verses, repeated chant material and context-specific appended `Alleluia`. The verification requires every necessary verse, all source/response boundaries, and note-by-note printed comparison. Even a full textual match to an occurring Proper is not evidence that *that Proper was chosen* in a 1962 Mass.

The 99 failed strict-prefix occurrences are **research exceptions, not rejected music**. They include false initial-incipit relatives, embedded text fragments, alternative phrases, role collisions and data where the original GABC text is not the same source variant. They must be reviewed against the exact selected 1962 Proper and printed book.

Original collection source provenance is preserved from PR #1749. The narrower observed 2026 DayResolver sweep still proves only **three distinct text candidate IDs across four day/Proper occurrences**, not mass coverage of 1962, musical score certification, or approval.

## Specific 1962 Sequence rubric established

Source: [General Rubrics of the Roman Missal, §470](https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html), with §399 for *Dies irae*.

- The Sequence's proper liturgical position is **before the last Alleluia or after the Tract**, not simply after every Alleluia.
- **Votive Masses omit the Sequence** even when a Sequence occurs on the calendar day. Do not inherit the day’s score into a selected votive Mass.
- For Masses of the Dead, *Dies irae* is obligatory in I-class Masses; **II–IV-class Requiems may omit it**. The All Souls concession for three Masses in immediate succession demands a specific ceremony context before the score can be marked required.
- A Sequence must be certified as the `SEQUENTIA` belonging to the **actual selected 1962 Proper**, with its correct source role and original 1961 score identity. Having *Veni Sancte Spiritus* in an Alleluia record does not make it the Sequence.
- The five candidate identities remain M08's actual Solesmes 1961 catalogue entries: #1086 Victimae, #68 Veni Sancte Spiritus, #308 Lauda Sion, #1198 Dies irae, #681 Stabat Mater. None is approved notation.
- Gospel and Sequence placement in Holy Week must continue using the existing native liturgical source stage, not the position of an arbitrary card in the Schola clock.

New research-only `src/mass/reader-m09-sequence-eligibility.js` enforces the owner of actual selected Mass, matching source path, source-exact Sequence score ID, §399 Requiem class, §470 votive exclusion and pre-Gospel boundary. Its public score export always returns null. It does not guess selected Mass or feast from month/date/title.

## Code and tests

- `src/mass/reader-m09-1962-latin-discrimination.js` implements strict normalization and a pure source evidence audit. It validates original score hashes and all 342 exact source registry identities; 239/124/44/99 comparison cells and 506 occurrences; preserves the bounded current 2026 selected-Proper sample.
- `tests/reader-mass-m09-1962-latin-line-screen.mjs` verifies source counts and per-occurrence ID/path/role/hash, test fixtures with an exact Alleluia versicle, malformed data, forged review flags, no public import or score promotion.
- `tests/reader-mass-m09-sequence-eligibility.mjs` verifies all five 1961 Sequentia roles, correct placement, variable Requiem obligation and optionality, the All Souls multiple-Mass exception, votive exclusion, source mismatch, seasonal ambiguity and the intentionally closed release gate.
- Both tests import into existing `test:reader-schola` / mandatory regression pipeline. No new test runner or paid dependency.

## Next actual missing work

**M10** needs a printed-facsimile musical-note comparison on a targeted high-impact subset; the current source archive includes GABC, not independently adjudicated 1961 printed-note facsimile decisions. Start with the 13 source-ID priority dialogues and five Sequences, then 83 Tracts, then the selected 1962 Proper catalogue. For each candidate, record exactly which original musical folio and variant was compared, matched neumes, omitted verses, cantus/rubric, and edition rights.

Continue mass-source identification and complete Latin/response matching on the 99 insecure and 44 short-prefix cases before any editorial release. Distinguish all 27 remaining/partially resolved musical priority families and preserve identity variants. A candidate with a plausible Latin match and CC0 GABC licence is **not approved** until printed musical parity and the user's **single final collection review**.

**No user review requested now. No merger/deployment.** All public score gates remain closed; R17 LIVE/MISSAL and native ceremonial timing remain unchanged.
