# ICRSP France B25 — complete next100 topic-read pass and scoped content-owner parity

**26 October 2026** · [Continuity PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666) · **Research only. No canonical Calendar, Mass reader, Saints, Customs or Mass Explorer production changes.**

## Completion ledger

| Measurable stage | Actual total | What is (and is not) done |
|---|---:|---|
| All indexed website source article identities | 855 / 855 | Exact article inventory only |
| Commentary-bearing article pages | 783 | Structural author/panel census of 2,856 instances |
| B21+B23 unique original webpage body screens | 373 / 783 | Automated topic / source-hash evidence, not approved prose |
| Direct topic passage reading before B24 | 113 / 783 | At least one original source passage per article |
| B24 direct article-topic pass | 25 article passes / 21 previously unread | Source-specific notes and publication holds; four earlier source IDs revisited |
| **B25 direct article-topic pass** | **75 article passes / 72 previously unread** | Original webpage introductory or named commentary opening inspected; three earlier source IDs revisited |
| **B23 next100 prioritized pass completed** | **100 / 100** | 93 new unique topic articles and seven useful repeated source reviews, not full-panel critical collation |
| **Unique directly examined topic articles** | **206 / 783 (26.3%)** | Exact ID union of 93 B22 + 20 B23 + 25 B24 + 75 B25, minus 7 duplicated article IDs |
| **Remaining commentary articles without direct topic-reading in this programme** | **577** | Not necessarily outside other research projects; reconciliation scope only |
| Focused content-owner comparisons in B25 | **14 comparisons / 23 source IDs** | Narrow actual file-level parity; not repo-global gap certification |
| Publication rights, printed-edition authorship, domain owner approval | **0** | No new content approved or released |

**Correction to the B23 queue:** A fresh exact ID reconciliation exposed **seven articles** in the ranked next100 that had already received earlier B22 topic reading. Four reappear in B24 (`a0619_ancien`, `a0044_nouveau`, `a0156_ancien`, `a0546_ancien`); three in B25 (`a0664_ancien`, `a0213_nouveau`, `a0596_ancien`). All 100 source pages were inspected in B24+B25, but only **93** were newly covered. This correction supersedes preliminary **213/783** and **570 left** figures. Preserve original source IDs and all observations; do not pretend repeats were new.\n\n**B25 breakdown:** 10 Temporal; 50 Sanctoral; 8 Commons; 5 particular propers; 1 votive; 1 poetry/reference.

The 75 individually anchored descriptions live in [the direct-read record](../../data/source-text/icrsp-france-b25-75-direct-webpage-topic-passages.v1.json); the 14 real-owner comparisons are in [scoped parity](../../data/source-text/icrsp-france-b25-scoped-owner-content-parity.v1.json). The unaltered but imperfect input remains B23's [next100](../../data/source-text/icrsp-france-b23-next100-human-editorial-priority.v1.json); no existing research cohorts were overwritten.

## Specific nonduplication and publication decisions

1. **Historical 1955/1960 exclusions.** The [ICRSP Dec 7 Immaculate Conception Vigil](https://icrspfrance.fr/textes-liturgiques.php?article=a0604_ancien), [Corpus Christi octave Monday](https://icrspfrance.fr/textes-liturgiques.php?article=a0972_ancien), and [Peter–Paul octave](https://icrspfrance.fr/textes-liturgiques.php?article=a0587_ancien) explicitly identify now-abolished forms. Similarly the [Latin Gate St John feast](https://icrspfrance.fr/textes-liturgiques.php?article=a0119_nouveau), [Gargano apparition feast](https://icrspfrance.fr/textes-liturgiques.php?article=a0121_nouveau), and [28 April St Vital](https://icrspfrance.fr/textes-liturgiques.php?article=a0758_ancien) carry 1960 exclusions. These may enrich a strictly historical reference, **never the universal 1962 Calendar**.
2. **Reuse across source IDs is not new independent scholarship.** [Intret version A](https://icrspfrance.fr/textes-liturgiques.php?article=a0051_nouveau) and [Intret version B](https://icrspfrance.fr/textes-liturgiques.php?article=a0325_ancien) reproduce matching Parsch commentary openings. The same is true for [Salus autem A](https://icrspfrance.fr/textes-liturgiques.php?article=a0053_nouveau) and [B](https://icrspfrance.fr/textes-liturgiques.php?article=a0327_ancien), while [St Vit article A](https://icrspfrance.fr/textes-liturgiques.php?article=a0190_nouveau) and [B](https://icrspfrance.fr/textes-liturgiques.php?article=a0519_ancien) repeat early-cult summary. Treat these as **one thematic review target per pair, two precise URL identities**, pending normalized full-body SHA comparison.
3. **Canonical owner already provides relevant infrastructure.** `src/calendar/traditional-year-v384.js` computes Pentecost Ember days and displays an existing custom/calendar note; `src/mass/preflight-study-proper.js` gates explicit votive choices rather than inferring them from weekday; `data/learn/mass-explorer-approved-studies.v1.json` has **zero deep-study releases**. None of these proves a missing user-facing feature. A legitimate explanatory addition must compare exact existing day and Mass text.
4. **Particular Saint/Mass separation.** [St Mansuy's Sept 4 feast](https://icrspfrance.fr/textes-liturgiques.php?article=a0248_ancien) and [June 15 translation](https://icrspfrance.fr/textes-liturgiques.php?article=a0213_nouveau) differ in prayers and Gospel, under particular diocesan scope. Likewise [St Nicholas Lorraine local proper](https://icrspfrance.fr/textes-liturgiques.php?article=a0250_ancien) is distinct from [the common Roman feast](https://icrspfrance.fr/textes-liturgiques.php?article=a0602_ancien) and the **existing** regional household St Nicholas Custom. None deserves a new universal Mass or Calendar record.
5. **Biblical and authorial precision.** [Easter Wednesday](https://icrspfrance.fr/textes-liturgiques.php?article=a0034_nouveau) interprets the 153 fish as baptized neophytes, attributed vaguely to the Fathers: a candidate Scripture-parallels research locus, **not** a quotation from any named Father without original evidence. [Magdalene](https://icrspfrance.fr/textes-liturgiques.php?article=a0374_ancien) contains historically divergent identifications, not proof that multiple named Gospel women are one person. [St Jean-Marie Vianney](https://icrspfrance.fr/textes-liturgiques.php?article=a0399_ancien) uses an Année liturgique edition with 1922 supplementary matter, not a guaranteed Dom Prosper Guéranger autograph.

## Distinction between source content and the existing app

The [Mass Explorer](../../src/learn/mass-explorer.js) reads the existing ordinary Mass Guide and the 84 bilingual prayer explanations; these are not interchangeable with a feast- or Proper-specific commentary. [Approved deep studies](../../data/learn/mass-explorer-approved-studies.v1.json) are still empty. Calendar-selected Proper publication remains controlled by [the existing strict proper projection](../../src/learn/mass-explorer-selected-calendar-proper.js), not ICRSP historical date labels.

No contents of a hosted Guéranger, Schuster, Parsch, Prudentius or modern papal text have been copied into the app. The original print editions, authorship boundaries, translations and rights have **not** been cleared. The 75 records are primary-webpage *topic* readings rather than entire commentator corpora.

## Next operating stage after this tranche

The next high-volume pass should use the 113 remaining unreviewed article IDs in B23's 233 group and then the untouched remainder of the 783-page catalogue, after checking all parallel workflow manifests. For genuinely valuable topics, use the existing owner and its exact canonical day/form/saint ID to compare current explanation paragraphs, not just source title keyword absence. Publication can begin only after that actual differential review plus original-work and rights checks.

**Validation:** `tests/test_icrsp_b25_75_direct_topic_and_owner_parity.py` asserts the reconciled 93 + 20 + 25 + 75 source-ID union with seven documented overlaps, exact source-title/URL matching against the frozen next100, all release booleans false, and the 14 scoped parity cases. It is wired into the existing ICRSP source-integrity workflow. Do not mistake passing the test for theological or legal approval.
