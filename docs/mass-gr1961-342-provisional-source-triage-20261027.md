# Gregorian 1961 — complete 342-candidate source-slot text triage

27 October 2026. Draft PR #1749 only. **Research evidence, not production reader scores.**

## Scope and reproducibility

The existing **one** frozen 1,195-GABC archive was already text-screened against 106 pinned DivinumOfficium Latin Proper source files. This pass unifies the three previously separate detailed discrimination results (55 first-400 simple Proper + 47 first-400 pre-Gospel + 240 remaining) into a single source/path/slot evidence ledger. It does **not** screen the same archive again or duplicate any score.

- Ledger: `data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json`.
- Exact reconstruction: `node tools/mass/build-gr1961-342-source-slot-triage.mjs --verify`.
- Corpus/source regression: `tests/gr1961-342-source-slot-triage.mjs`, included in `test:reader-schola`.
- The ledger captures a frozen Git blob hash for each of **nine** predecessor evidence files, as well as each attested source-file blob identity from the pinned Latin witness manifest.
- Every record retains its original GregoBase identity, GABC SHA-256, office part, intended research track, candidate source paths and individual source-line text evidence. No GABC bodies are copied to the report.

## Audited denominators

| Exclusive text disposition | Candidates |
| --- | ---: |
| Strong initial text (eight or more initial words in best source occurrence) | **275** |
| Partial initial text | **39** |
| Early textual divergence | **28** |
| **Total** | **342** |

Of the 342, **157** are Introit/Offertory/Communion candidates (130 strong), and **185** are Gradual/Alleluia/Tract candidates (145 strong). The joined detailed evidence comprises **506 source-line occurrences** across **91** distinct source paths; **63** candidates appear in more than one source path.

**46 source-path/track groupings contain more than one strong score candidate.** This is an attention queue, *not* a count of errors or alternative musical settings: a source can include more than one chant, antiphon, verse or permitted form, and a group can contain different liturgical parts in the same pre-Gospel container. A simplistic “source + role = score” join would be unsafe. The detailed discrimination preserved three additional same-path section/line instances that did not appear individually in the earlier, coarser count (503), hence 506 rather than 503. All original evidence and previous batch totals remain intact.

## Release gates — no false progress

1. **Actual source-selected 1962 Proper:** All 342 remain unverified against the live DayResolver/Proper source selected for that Mass, including source inheritance, common formularies, calendar rank, and temporal variants.
2. **Three-language pre-Gospel separation:** All 185 pre-Gospel candidates remain unresolved for certified Gradual/Alleluia/Tract/Sequence identity, Latin/French/English source boundaries and selection of the actual chant; an initial word match is insufficient.
3. **Printed-edition musical review:** All 342 remain without full note-for-note/clef/accidental/text underlay certification against the original *Graduale Romanum* 1961 pages.
4. **Human editorial release:** Zero approved. The six-gate `tools/mass/gr1961-promotion-gate.mjs` stays authoritative and untouched.
5. **Local musical programme:** Neither shared score references nor ICKSP/FSSP/SSPX affiliation prove that a particular parish's Schola actually sang a given melody. Keep the local programme optional and evidence-specific.
6. **Requiem and non-Roman rites:** Separate formularies, variants and `Dies irae` are not inferred from a normal Sunday five-score template.

## Next high-volume step

Run the 342-record research ledger against the **actual resolved 1962 Proper slots** for a larger date/formulary fixture set: select exact source path; confirm Introit/Offertory/Communion *opening* under their own slots; identify inherited and alternate source owners; then triage the combined pre-Gospel source through the pre-existing trilingual boundary resolver. Evaluate overlapping candidates as ambiguous until exact text/chant position/variant is established. The 853 other GABCs still need new source discovery, but not a repeat of the original 106-file sample.

Until the actual resolver and printed score are verified, **none of these 342 is ready for automatic notation assignment or publication**. No new catalogue, local parish defaults, audio, paid storage, or merger is authorized.
