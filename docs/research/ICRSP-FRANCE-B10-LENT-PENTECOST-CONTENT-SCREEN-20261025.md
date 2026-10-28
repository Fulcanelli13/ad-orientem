# ICRSP France B10 — First source-content screen: 51 Lent/Pentecost articles

**25 October 2026.** [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [Draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666) · No app runtime changes.

## Corrected source-path baseline

The B09 regex matching numbered Sundays overlooked *24ᵉ et dernier dimanche après la Pentecôte*, source **a0246_ancien**, even though an existing Mass Scripture reading witness already explicitly records **`Tempora/Pent24-0`**. B09 has been corrected in both its file and source-path audit, and the misleading old 94-exception file retired.

The verified B09 source-path situation is **100 of 193 Temporal source articles** with at least one candidate matching a literal existing Scripture source-path witness; **78** of these were not part of the original 27 Temporal-major shortlist. Another **93 articles** have no exact path witness in the seven chosen source registries; these are an exception queue, **not 93 missing Masses**. The remaining 93 are segregated by pre-1955/historic octave (36), speculative Advent feria independent Propers (21), no direct safe owner (16), Great O Antiphons (7), Easter octave (6), Pentecost non-Ember octave (3), pre-existing explicit holds (3), and Ascension Vigil (1).

## B10: whole-article structural screen plus sampled passage-level reading

The specific research target was **29 Lenten weekday/Ember pages** and **22 numbered Sundays after Pentecost (3rd through 24th)**, all already matched to a source-path witness in current Ad Orientem Scripture reference owners.

| Batch measure | Lent weekdays/Embers | Post-Pentecost Sundays | Combined |
| --- | ---: | ---: | ---: |
| Distinct ICRSP article pages | 29 | 22 | **51** |
| Separate source-page commentary panels | 128 | 99 | **227** |
| Explicit Guéranger + Schuster + Parsch website work-family panels | 87 | 66 | **153** |
| Other/editorial, including `Présentation` and `Office du jour` | 41 | 33 | **74** |
| Actual webpage commentary themes individually read in this batch | 6 | 5 | **11** |
| Source bodies not yet read at theme-level | 23 | 17 | **40** |

The 227 panel occurrences are source-page panels, **not** 227 unique original copyrighted work passages. Guéranger, Schuster and Parsch are website attribution labels; their original printed work/edition and the French translation's reproduction rights remain unverified.

Per-day source URL, current source-path owner witnesses, panel count and review status are staged in:
`data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json`.

The key decision is to keep the **40 metadata-only pages** visible and correctly labelled as unread at substance level; a heading alone does not justify AI-generated theological content or a claim that Ad Orientem lacks an explanation.

## Eleven directly examined and potentially useful content themes

The following 11 source articles were inspected at the relevant `Commentaires` blocks. Each bullet names a *research topic*, not a source text excerpt licensed for reuse. The owner decision remains open until exact day-specific comparison to existing Calendar and Mass Explorer text.

**Lenten weekday/Ember (six):**
1. **`a0172_ancien`, Monday Lent I:** Roman station at San Pietro in Vincoli; Ezekiel's shepherd image and repentance. Candidate for historical-day description and station references.
2. **`a0177_ancien`, Lent Ember Saturday:** historical station at Saint Peter and the relationship between earlier vigils and ordinations. **Not** an instruction to modify 1962 ceremonial stages.
3. **`a0184_ancien`, Wednesday Lent II:** Saint Cecilia station, catechumens and the progressively developing Passion theme; requires independent ancient-rite and provenance checks.
4. **`a0197_ancien`, Friday Lent III:** San Lorenzo in Lucina station and water from the Samaritan-woman readings. The presumed explanatory link between a historic well and reading selection **remains hypothetical**.
5. **`a0204_ancien`, Wednesday Lent IV:** ancient Lenten scrutinies and `in aperitione aurium` at Saint Paul; Creed, Lord's Prayer and Gospels entrusted to catechumens. Rich, but historical: do not import as obligatory 1962 rites.
6. **`a0007_nouveau`, Thursday Passion Week:** station at Saint Apollinaris, penitence as expounded with St Mary Magdalene and Babylonian exile imagery.

**Post-Pentecost (five):**
7. **`a0221_nouveau`, Third Sunday:** merciful seeking of sinners; the ancient Office's Saul history is discussed. Treat pre-1960 Office readings as historical context unless independently applicable to the 1962 Office.
8. **`a0244_ancien`, Tenth Sunday:** reflections on Church history, Holy Spirit and the arrangement of post-Pentecost readings; distinguish nineteenth-century commentary claims from binding teaching.
9. **`a0391_ancien`, Thirteenth Sunday:** ten lepers, Samaritan gratitude and eucharistic thanksgiving; potential sourced Mass/Scripture comparison. The source's historic Old/New Testament rhetoric needs careful theological contextualization.
10. **`a0471_ancien`, Eighteenth Sunday:** historical `Dominica vacat` association near September Ember ordinations and liturgical Epistle sequence; historical lectionary evidence, not a calendar rule.
11. **`a0246_ancien`, Last/24th Sunday:** resumed post-Epiphany Sundays and final Sunday Proper/chant distinctions. **The existing 1962 Calendar resolver is the owner of the actual Sunday selection and source-order application**; the ICRSP site must not override it.

## Existing app baseline and what is genuinely new

Current Mass Explorer already has **32 Guide entries, 84 bilingual prayer explanations and eight sourced Formation stages**. The Calendar already calculates the year and delivers source-gated selected Proper projections and customs. This pipeline must not duplicate those already published experiences.

B10 has therefore established **11 directly evidenced topics worthy of content comparison** and **40 source pages still requiring actual reading**, not 11 finished features or 40 proven gaps.

A topic can be classified as a real editorial improvement only after (a) identifying the exact source paragraph/work, (b) checking current day-specific Calendar/Mass Explorer and Bible/Places/Customs owner claims, (c) establishing an authentic edition and/or independent witness where needed, (d) verifying 1962 liturgical applicability, and (e) deciding whether rights permit reproduction or merely an outbound reference. The source's literary historical interpretation should not be presented as a binding rubric.

## Next practical high-volume operation

Complete the 40 source-page substantive review at the level of **short evidence-based topic statements**, not mass copying of the French text. De-duplicate repeated interpretations against the 705 substantial unique normalized Temporal body hashes, and only elevate source-backed topics not already expressed in existing owners.

For the 11 reviewed sample topics, compare specific existing Calendar day explanation and Mass Explorer content immediately. Parallel orchestration must respect that the independent Ordo Missae reader workstream exclusively controls gestures, postures, priest positions, Schola and special liturgical stage mapping.

**Acceptance:** 51/51 current path owners known (already), 51/51 substantive themes inspected (now 11/51), 0 unverified claims published, and every proposed extra with precise original authority plus a specific existing feature owner. No new Calendar, reader or generic prayer explanation library.

## Validation

`tests/test_icrsp_b10_lent_pentecost_content_screen.py` checks all 51 article/source-path identities against the current 193-source crosswalk, 227 panels, the 11 directly reviewed versus 40 not-yet-read scope, no publication flags and intact 84 already-published prayer descriptions. It joins the existing research read-only CI `.github/workflows/icrsp-gap-integrity.yml`.

No production source files or main-branch Mass reader data have been changed. This remains a draft research PR.
