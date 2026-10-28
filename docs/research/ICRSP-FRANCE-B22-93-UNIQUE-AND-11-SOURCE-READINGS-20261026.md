# ICRSP B22: 93 distinct source-topic readings and corrected high-volume queue

**26 October 2026** · [Research PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666), research only; original 1962 Mass, Calendar, Saints and Scripture owners unchanged.

## Source-scale baseline and progress
- **855** website article identities indexed.
- **783** articles structurally parsed into **2,856** named/anonymous commentary-panel occurrences.
- **140** pages in the previous B20 selection were independently **machine-screened for lexical signals** across **535 panels** and source-body SHA-256s; these automated signals were **not** human historical/theological adjudications.
- **93 distinct article IDs** have now had *at least one source topic or substantive passage directly examined* across six non-overlapping research strands: B10 **11**, B11 **40**, B20 initial **10**, B21 later **10**, B22 in-B20 **11**, and this B22 outside-B20 **11**. See the [source-ID reconciliation](../source-text/icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json). There are **690 commentary articles** with no recorded direct topic-level examination yet; all are structurally catalogued.
- **0** fully approved explanatory articles, **0** new reproduction/translation rights cleared, **0** production app changes. The existing other B22 workstream has **nine original EN/FR editorial drafts**, all still marked as draft and not published.

## One important queue mistake corrected

The previous [250-article metadata-reading queue](../source-text/icrsp-france-next250-metadata-reading-queue.v1.json) excluded the earlier **160 B20** selected source pages, but it **did not** exclude every B10/B11 direct topic read. A cross-workstream exact article-ID union discovered **17** overlapping pages (12 Lent weekdays and 5 post-Pentecost Sundays). Their identities and reasons are retained in [the corrected 233-article reading manifest](../source-text/icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json).

The truly new queue is **233 IDs**: **43 Temporal + 140 Sanctoral + 25 Commons + 18 particular/local propers + 4 Votive/Requiem + 3 Office**. This batch has **directly read 11** of those pages, leaving **222 as metadata-only/unread in this tranche**. A source-body lexical-screening script and a duplicate-gate test are committed, but **the attempted new Actions workflow creation was blocked** in this session. Accordingly **none of the remaining 222 is falsely marked machine-scanned or topic-reviewed**. Never treat the local scanner script alone as execution.

## Actual direct website reading: 11 new unique article leads

These are *observations of exactly what the source page says* rather than adjudications of legal rubrics, printed critical editions, liturgical authority, copied French prose or existing app gaps. Exact source page locators and preservation of holds are in [the 11-row primary review register](../source-text/icrsp-france-b22-eleven-direct-commentary-topics.v1.json).

| Source article | Useful observed explanatory topic | Proper destination and gate |
| --- | --- | --- |
| [Septuagesima](https://icrspfrance.fr/textes-liturgiques.php?article=a0156_ancien) | The time from Septuagesima to Easter is interpreted as Christ's redemption and its Old Testament types | Existing Calendar/Mass Explorer; no independent prophecy classification |
| [Major Litanies, April 25](https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau) | The source prints procession instructions and discusses penance, abstinence and Easter features | Existing Calendar/customs/Ritual review; independently check 1962 actual rite and distinguish Gregory plague procession from origin of April 25 Major Litanies |
| [September Ember Days](https://icrspfrance.fr/textes-liturgiques.php?article=a0619_ancien) | Historical Christian season fast, related by Guéranger to Zechariah's fasts | Existing Calendar; 1962 date calculation, historic authorship and source origins require independent proof |
| [St Athanasius](https://icrspfrance.fr/textes-liturgiques.php?article=a0114_nouveau) | Death-date and centuries-long reception of the May 2 feast | Existing Saints/Calendar; do not substitute historical rank for current 1962 rank |
| [St Polycarp](https://icrspfrance.fr/textes-liturgiques.php?article=a0640_ancien) | Martyrdom narration; ancient martyrdom date versus Roman Jan 26 feast | Existing Saints/Calendar; precise ancient Martyrium date and variant reception must be verified independently |
| [St Ignatius of Antioch](https://icrspfrance.fr/textes-liturgiques.php?article=a0664_ancien) | Differing East/West feast dates; a later infancy tradition | Existing Saints; do **not** treat Ignatius as the Gospel child as verified biography |
| [Lateran basilica dedication](https://icrspfrance.fr/textes-liturgiques.php?article=a0546_ancien) | Rome's cathedral, liturgical rank history and distinction from Peter-and-Paul basilica commemorations | Existing Calendar; verify Nov 9/Nov 18 source identities |
| [Common of Doctors](https://icrspfrance.fr/textes-liturgiques.php?article=a0044_nouveau) | Church Doctor versus Church Father and historically variable list of Doctors | Existing Commons/reference; neither present membership count nor theological title is a frozen 1962 Common rubric |
| [Translation of St Mansuy](https://icrspfrance.fr/textes-liturgiques.php?article=a0213_nouveau) | A June 15 particular/local translation observance described as distinct from Sep 4, with three proper prayers | Existing particular-calendar owner, diocesan jurisdiction/date/formulary verification, not universal 1962 |
| [Marriage Mass](https://icrspfrance.fr/textes-liturgiques.php?article=a0923_ancien) | Source distinguishes consent placement and customs from Schuster's nuptial blessing interpretation | Existing Nuptial overlay / Mass form owner; local variations and historical ritual editions must not become universal action cues |
| [Prudentius on Peter and Paul](https://icrspfrance.fr/textes-liturgiques.php?article=a0596_ancien) | Website distinguishes a Prudentius *Peristephanon* late-antique poem from Guéranger commentary | Existing reference/Saints; original Latin poem/line attribution required; do not add a Divine Office app module |

## Practical priorities

**Near-term release candidates for *editorial assessment*, not publication:** September Ember Days and Septuagesima sourced explanations; one carefully scoped historical note on Rome's Lateran; local St Mansuy translation only if jurisdiction can be pinned. The Major Litanies and nuptial ceremonies demand separate exact 1962-form/actor review before any priest action or user posture is suggested.

**Do not** invent a rival Customs Atlas, a new Calendar, a Church Fathers chat-summary or another biblical typology registry. Scripture parallels remain outside Historia Salutis narration and must retain the authentic authors' own words, sourced and in context.

CI guards: `tests/test_icrsp_b22_233_distinct_source_scan.py`, `tests/test_icrsp_b22_direct_11_source_topics.py`, `tests/test_icrsp_b22_cross_workstream_93_unique.py`. Existing ICRSP source-integrity workflow runs them. Draft research only.
