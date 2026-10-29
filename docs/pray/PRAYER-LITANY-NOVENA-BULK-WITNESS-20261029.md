# Prayer bulk witness pass — 29 October 2026

**Scope:** one bounded pass over the existing public-Litany source and **all 16** existing novena programmes. No new Prayer engine; original registers preserved. Machine-readable evidence: `data/pray/prayer-litany-novena-source-sweep-20261029.v1.json`.

## What the external sources establish

### Greater Litanies — eight source sections

The [ICRSP Latin/French Greater Litanies](https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau) includes **all** of the following, not just the invocations:
1. Assembly and `Exsurge Domine` antiphon (HTML lines 94–101).
2. Kneeling and first invocations through `Sancta Maria` (102–111).
3. Rising for procession and saint-invocation sequence (112–180).
4. Deprecations and petitions through `Agnus Dei`, `Christe`, `Kyrie` (181–229).
5. Quiet `Pater noster` with response (230–233).
6. Psalm 69 and `Gloria Patri` (234–243).
7. Versicles for Pope, benefactors, dead, absent brethren and other needs (244–268).
8. Multiple collects and final versicles (269–289).

**Authoritative rubric boundary:** 1960 `Rubricae generales` n. 82: `Litaniae Sanctorum (quae tamen non duplicantur) cum suis precibus`. The ICRSP page also contains older commentary stating an invocation was repeated; do **not** let that pre-1962 comment override 1960 rubrics. Nn. 80–90 govern Greater and Lesser Litanies, transfers, other supplications and vernacular recitation in their specified contexts. [ICRSP Lesser Rogations page](https://icrspfrance.fr/textes-liturgiques.php?article=a0106_nouveau) points to the Greater procession form.

These eight section boundaries have been inspected on the public HTML source, **not** independently compared word-for-word against the actual 1962 printed ritual or approved 1962 French translation. The public Prayer reader remains source-link-only. Do not import the ICRSP French translation wholesale, or swap in the older private 1883 English / 1862 French editions. The web line numbers are source navigation coordinates, **not** historical printed page numbers.

### Sixteen novena programmes — one pass

| Source cluster | Programme IDs | Verified scope / caution |
| --- | --- | --- |
| Callan (1925), one Wikisource page with two separate headings | `christmas`, `holy_ghost` | Christmas and Pentecost are separate sections of a legitimately shared URL; historical 300-days and years/quarantines notices are **not** current indulgence grants. |
| 1883 prayer book | `corpus_christi`, `sacred_heart`, `immaculate_conception`, `st_joseph` | Two repeat-form novenas versus two nine-day texts; existing digital Sacred Heart transcription visibly has apparent typographical blemishes, so do not treat it as an original-print certificate. |
| Hammer, *Mary, Help of Christians* (1909) | `annunciation`, `seven_sorrows`, `assumption` | Three distinct sections III, IV, V on one Gutenberg eBook; retain all nine meditations/practices each and their repeated devotional components. |
| Modern online Holy Souls prayer-book transcription | `holy_souls` | Original printed edition unresolved; existing reader restores daily four-line verse and seven intercessions. |
| *With God* (1911) scanned page | `perpetual_help` | Source page 699 explicitly marked **not proofread**; neither translation nor edition-verbatim certified. |
| Modern EWTN reproduction | `st_therese` | Reproduces older Twenty-Four Glory Bes practice but not a 1925 print facsimile. |
| Australian Catholic Truth Society 1966 pamphlet | `st_anthony_nine_tuesdays` | No fixed obligatory nine prayer texts; pamphlet rights not yet cleared for any **new** reproduction. Hosting site asserts all previous indulgence grants remain valid in modern form; that is **not** evidence of present law. Reader now explicitly distinguishes historical notices from current concessions in English and French. |
| Historical French Christ-King compilation | `christ_the_king` | Existing PDF is 29MB and could not be fetched for this pass; text and page image not independently certified. French original / editorial English remain separately qualified. |
| Single-prayer adaptations to nine repetitions | `immaculate_heart`, `st_michael` | Online prayer witnesses support the prayer form; **not** nine original independently composed day-prayers. |

**Result:** 16/16 programme-to-witness identities and exact existing source links reconciled, 15 online source/section locations inspected, one oversized French PDF held, and no claim of 16 original printed-book or trilingual verbatim certifications. Earlier reviewed English day-body anchors remain **72**, not 72 print-verified texts. Material original-print comparison remains 0/16.

## Fixed in this pass

In the existing St Anthony Novena source guidance, replace the vague notice about old sacramental recommendations with a clear **EN and FR** statement that historical indulgence notes and a host website's assertion of continuing validity **cannot** certify current grants or conditions. Preserve the existing prayer, its reader, its nine-Tuesdays recurrence, and the historical source reference. No new indulgence metadata is published as current.

## Release and next substantive batch

The existing Prayer source-integrity workflow and `test:pray-owner` now run `tests/pray-litany-novena-bulk-witness-20261029.mjs`: all 16 live IDs and witness URLs; two distinct Callan source headings; exact eight ordered ICRSP sections; original-print and French caution; no current indulgence claims.

**Next:** a **single bulk** 16-programme print-facsimile comparison, using source page images and stable revisions wherever accessible. Reconcile all 72 distinct English day bodies plus shared closing prayers, then independently verify French translations. Hold the specific oversized, unproofread or rights-ambiguous witnesses as exceptions; do not fragment the programme into tiny prayer-by-prayer releases.
