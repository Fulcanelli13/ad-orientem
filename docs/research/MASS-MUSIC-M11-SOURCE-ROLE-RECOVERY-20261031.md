# Ad Orientem Mass Music M11 — source-role recovery of the 45 remaining chant leads

31 October 2026 · stacked above M10 #2165, M09 #2164, M08 #2162, M07 #2161, M06 #2159, M05 #2157, M04 #2156, M03 #2154, M02 #2153, M01 #2152.

## Actual authoritative source retrieval

M10 found 45 source-text donor occurrences with no full-line or eight-word alternative in the matching original archive role. Most were labelled `gr`, `al` or `tr` solely because they were retrieved from a broad `[Graduale]` section.

M11 **fetched each of the 28 actual Divinum Officium Latin 1962 Missal source files** from `web/www/missa/Latin/{Tempora|Sancti}/...` (GitHub `master`) and checked the returned **Git blob SHA** against the previously pinned source-identity SHA stored in the 45 M10 candidate records.

**28 / 28 identical pinned Git blob identities.** Source lines were then classified by the source text's internal structure:
- `[Graduale]` portion before an explicit `Allelúja, allelúja.` or `!Tractus` marker: provisional **GRADUAL segment**, subject to full 1962 Proper and liturgical exceptions.
- The section after an explicit `Allelúja, allelúja.` opening: **ALLELUIA segment**.
- After source's explicit `!Tractus`: **TRACT segment**. Do not label the initial Gradual itself as a Tract, and do not import a later Tract just because a verse has the same words.
- Actual `[Offertorium]` and `[Communio]` sections are inspected separately rather than being falsely treated as missing from `[Graduale]`.

The section-boundary classification is **source-anchored provisional**. A source's long `[Graduale]` text is not automatically a verified sung chant or a complete selected-Mass musical assignment. R17 still requires the true authenticated selected 1962 Proper and liturgical rules.

## Findings (all 45 original weak occurrences)

| Source-section segment | Occurrences |
| --- | ---: |
| Gradual portion | 36 |
| Alleluia portion | 4 |
| Explicit Tract | 3 |
| Actual Offertory | 1 |
| Actual Communion | 1 |
| **Total** | **45** |

**37 of the 45 previously assumed chant roles conflict with the source-section classification.** Breakdown: 16 candidate Tracts actually point to Gradual text, 15 candidate Alleluias to Gradual text, 1 candidate Tract to an Alleluia text, 3 candidate Graduals to explicit Tract, and 2 candidate Graduals to Alleluia.

The other eight source roles already align with the actual source section (five Gradual, one Alleluia, one Offertory, one Communion).

This is a strong explanation for many apparent missing scores. It is **not** a licence to correct scores live or disregard 1962 actual Mass distinctions.

## Full existing archive rescreen with the corrected source role

For each of the 45, M11 rescanned the original **1,195 Graduale Romanum 1961 GABC research scores** in PR #1749, but **under the role now indicated by the pinned source section**. The original GABCs were not recopied, duplicated or published.

- **30 of 45** source occurrences now have at least one compatible **source-text lead** already in the archive.
- **35** alternative score-occurrence relationships, preserving all different source GABC IDs and source hashes.
- **Five** occurrence cases have more than one possible same-role candidate and must preserve the alternatives.
- **15** source occurrences still have no secure full donor-line or eight-word score candidate, representing **12** distinct original score IDs.

Examples of *provisional* recovery:
- Nativity of St John the Baptist (`Sancti/06-24`): donor line `Misit Dominus manum suam...` previously suggested a Tract score; the source shows a **Gradual** verse, with text candidate `GREGOBASE-647`.
- Second Sunday after Easter (`Tempora/Pasc2-0`): `Ego sum pastor bonus...` was suggested as Tract; the source displays an **Alleluia** passage, with text candidate `GREGOBASE-1220`.
- Fifth after Pentecost (`Tempora/Pent05-0`): `Domine Deus virtutum exaudi...` is part of the Gradual rather than a Tract; `GREGOBASE-1226` is a source-text candidate.

These entries need *actual 1962 day/selected Mass*, complete Latin text with all chant verses, 1961 printed note-by-note facsimile comparison and the user's final editorial approval before any automatic reader assignment. A text-match does not certify a melody.

## Durable evidence and integration

- `data/research/mass-music-m11-source-segment-001..004.v1.json`: 28 pinned source SHA, exact donor lines and section-marker positions.
- `data/research/mass-music-m11-source-role-corrected45.v1.json`: all 45 original donor relationships, corrected source-role classification and 35 provisional GABC alternatives.
- `data/research/mass-music-m11-residual15.v1.json`: the 15 genuinely outstanding *within the current archive and exact text matching threshold*, by actual indicated role: **11 Gradual, two Alleluia, one Offertory, one Communion**. They are not proof of a missing printed chant and none is rejected.
- `src/mass/reader-m11-source-role-audit.js`: pure source-section parser and fail-closed original-Git-SHA/source-hash metadata auditor, with explicit support for repeated, distinct donor occurrences. Nothing here is loaded by the public Mass reader.
- `tests/reader-mass-m11-source-role-recovery.mjs`: required Schola CI, checks 28 pinned source SHA, 45 occurrences, 37 source-role conflicts, corrected candidate part/hash, 30 candidates, 15 residual, duplicate legitimate occurrences, fake approvals and source tampering.

No new GABC, audio, hymnal, parish practice or choir performance claims were imported. No user-facing score buttons, Mass cards, action cues, bells, Schola timeline or R17 visual styles were modified.

## Next source and music work

**M12A:** review the remaining 15, distinguish incomplete GABC text witness from a truly unindexed 1961 score by exact edition folio and genuine 1962 selected Proper. Avoid rescreening the same full archive.

**M12B:** continue exact-source acquisition for the complete sung celebrant responses (Collect/Secret/Postcommunion and variable conclusions), Gospel tones, complete Pater noster, and three dismissal/response families, including Requiem and proper Easter double-Alleluia variants.

**M13:** verify printed source notes and complete Latin for all selected candidates, preserve alternatives, and present **one full editorial review of the completed collection** before exposing any new music in the existing Exsurge viewer and R17 LIVE/MISSAL reader.

All source candidates remain research-only, unapproved, and unavailable for in-app publication.
