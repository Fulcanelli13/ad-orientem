# Mass Music M10 — 99 weak-source cases, complete same-role archive rescreen

Date: 31 October 2026 · stacked on M09 #2164, M08 #2162, M07 #2161, M06 #2159, M05 #2157, M04 #2156, M03 #2154, M02 #2153, M01 #2152.

## What was actually done
The M09 first-level source-line audit held **99** donor-line occurrences with no secure four-word contiguous prefix against their proposed chant's Latin GABC text. M10 re-read the **original six 1961 source GABC batches (1,195 scores) already acquired in research PR #1749**, together with the original 342-rich-evidence triage and M09's six source-locked ledgers. Nothing was redownloaded or silently assigned to a Mass.

For **every one** of these 99 occurrences, we:
1. Compared the complete normalized 1962 donor-line words with the originally suggested score, measuring actual longest contiguous shared span, and whether the first word matches.
2. Searched **every other existing GABC of the SAME musical role** (`in`, `gr`, `al`, `tr`, `of`, or `co`) for a complete contiguous donor-line match or at least its first eight words. No Gradual or Alleluia score can substitute for a Tract, even if part of the text matches.
3. Preserved the exact donor Proper source path, original Proper blob SHA, source-section position and risk classification, original score's historical GregoBase ID, GABC SHA-256, and each alternative's ID, original edition folio, GABC SHA and text-only match class.
4. Recorded both the original score and **all** alternate leads (no deduplication of a distinct GABC by incipit alone) in six new source-hash-bound review batches.
5. Kept all replacement choices **provisional research**: no actual selected 1962 Mass authorization, no printed-note facsimile check, no automatic score reassignment, no user approval, no publication.

## Research results (occurrences, not distinct approved scores)

| Screening outcome | Count |
| --- | ---: |
| Weak source occurrences adjudicated at the text-lead level | **99** |
| Distinct originally suggested score IDs involved | **54** |
| Occurrences with ≥1 same-role alternative source-text lead | **54** |
| Occurrences with no same-role alternative found in the 1,195 archive | **45** |
| Total alternative score relationships (duplicates by donor occurrence retained) | **114** |
| Occurrences with multiple possible alternatives | **17** |

Among the **original** 99 failures:
- **26** have a noninitial or discontinuous shared passage of at least four words (so a failed prefix screen does not mean the entire score is unrelated).
- **8** begin with the same word but diverge before a secure four-word phrase.
- **65** start differently and lack an independently found four-word shared phrase.

These are **descriptive computational classes**, not editorial diagnoses of which chant is definitively wrong. The 54 replacement leads can contain valid alternative strophes, multiple old sources, or the *wrong proper of the correct chant role*. A complete donor-line match proves words, not melodic notation or the actual selected Mass.

| Original role | Weak source occurrences |
| --- | ---: |
| Gradual | 14 |
| Tract | 21 |
| Alleluia | 27 |
| Introit | 25 |
| Offertory | 4 |
| Communion | 8 |
| **Total** | **99** |

Concrete cases (for illustration, **not approved assignments**):
- `GREGOBASE-38` candidate Gradual, `Tempora/Pent05-0`: source line begins `Domine Deus virtutum exaudi...`, but the original score continues `...converte nos...`; same-role `GREGOBASE-1226` has the entire donor line in its transcribed Latin.
- `GREGOBASE-230` Communion, `Tempora/Pent14-0`: `GREGOBASE-868` contains the complete donor line `Primum quaerite regnum Dei...`.
- `GREGOBASE-536` Introit, `Tempora/Pasc1-0`: several alternate `in` scores share the complete donor-line text `Exsultate Deo adiutori nostro...`. All must be retained and compared as variants.

## Durable evidence
New research files: `data/research/mass-music-m10-weak-reassignment-001.v1.json` through `-006.v1.json`. These are compact **evidence metadata**; original GABC notation is **not recopied**.

New pure nonpublishing auditor: `src/mass/reader-m10-reassignment-evidence.js`.

New required regression: `tests/reader-mass-m10-weak-reassignment.mjs` (imported by existing `test:reader-schola`). It cross-checks all original source file Git blob identities, GABC SHA, original source role, selected Proper donor blob, M09 weak occurrence, text evidence match class, candidate role and approval holds. It also tests corrupted hashes, musical-role substitution, forged matched text and spoofed approval flags. A source metadata audit cannot itself reconstruct or authenticate notes without checking the original printed 1961 sheet; this remains a separate M11–M12 task.

## What the counts mean and do not mean

**54 occurrences have a useful alternative text candidate; they are NOT 54 resolved Mass assignments.** The same original and alternative IDs can appear on several source paths, and 17 occurrences have more than one candidate. **45 occurrences remain without any same-role source-text alternative within this bounded 1,195-score archive**, but this is not evidence that a score is invalid or missing in the 1961 book.

These ledgers do not supersede the original 1962 DayResolver, the 1961 chant source metadata, the M08 five Sequence sources, the 65-card Mass LIVE reader, or the existing Exsurge renderer in #2111.

## Residual acquisition queue — 45 occurrences

A separate `data/research/mass-music-m10-residual45-priority.v1.json` now contains the **45 unmatched donor occurrences**, representing **28 distinct original score IDs**. Musical roles: 17 Tract, 16 Alleluia, 10 Gradual, 1 Offertory, 1 Communion; therefore **43 of the 45 are pre-Gospel research priorities**.

The 17 Tract and 16 Alleluia references appear under broad "Graduale" sections in the source metadata, which is **not by itself proof of the selected 1962 chant role**. Investigate exact rite/season before claiming missing music or searching for replacements. The queue preserves source owner/SHA, original score identity, normalized Latin, and explicitly says none of these 45 is rejected or proved absent from the printed book. The regression suite checks 45 source-exact records, 28 distinct IDs and nonapproval alongside the six large M10 batches.

## Priorities for the next pass

**M11A — Adjudicate and extend existing alternatives:** take the 54 same-role alternative relationships first and verify original 1961 printed text, musical mode, verses and *actual* selected 1962 Proper/role. Preserve multiple exact matches for final editorial review. Prioritize structurally ambiguous graduale section relationships.

**M11B — Source the remaining material:** inspect the 45 without an archive alternative, then the 57 Tracts without source-text leads and the 58 original GABC importer exceptions, using page/source-specific retrieval rather than another raw bulk download. The 5 traditional Sequences remain separate from the 1,195 six-part archive.

**M11C — Complete Ordinary/ritual musical gaps:** whole Pater noster and oration tones, Gospel, regular Ite/Deo gratias, Requiescant/Amen, Benedicamus/Deo gratias and Paschal double-Alleluia variants, and source-verified special-rite chants. Keep unapproved musical scores out of production.

**M12 — Musical witness verification:** compare notes and complete verses against original 1961 facsimile, with exact musical editorial source-status per candidate. CC0 GABC licence does not prove correct transcription.

After the full quality-screened collection is ready, prepare **one consolidated user editorial review**, then source-gated integration into the existing offline Exsurge and R17 Mass reader. No new default score assignments, no audio, no new Schola clock, and no visual design departure are authorized by M10.
