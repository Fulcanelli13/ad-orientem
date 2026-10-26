# ICRSP B29 — 80 additional directly inspected B23 source-topic passages, 18 owner decisions, 443 unique total

**26 October 2026** · [Continuing ICRSP research PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666). This is an editorial/source-evidence checkpoint, not a new Calendar or Mass Reader release.

## Correct and reconciled programme progress

| Work stage | Evidence-backed count | What the count measures |
|---|---:|---|
| Indexed ICRSP article identities | 855 | Structural index, not ready content |
| Commentary-bearing article identities | 783 / 2,856 labelled panels | Structural article/panel census |
| Prior B28 unique article topics directly inspected | 363 | Distinct exact article-ID union |
| B27 unreviewed B23 subqueue | 81 | After 28 B27 new topic readings and B22 deduplication |
| **B29 direct web-page passage readings** | **80** | Exact site introductions or opening named commentary excerpt, not every panel |
| B29 source page inaccessible via direct fetch | **1** | `a0055_nouveau`; indexed excerpt matches directly opened `a0329_ancien` Parsch Sancti tui passage |
| **Current unique direct-topic article count** | **443 / 783 = 56.6%** | 363 + 80 disjoint source article IDs |
| **Remaining without a directly inspected site passage** | **340** | 339 other unstaged corpus records + one search-only duplicate alias |
| **Research-to-owner comparisons** | **18 cases / 40 B29 source IDs** | Narrow scoped file-level comparisons, not canonically approved owner records |
| Independently corroborated source chronology error | **1** | St Fidelis of Sigmaringen: ICRSP 622 versus 1622 |
| Author-original print editions/translation permissions/theological approvals/new production explanations | **0** | Publication gates remain closed |

**Never use 444 as direct coverage:** a source index rendered the substantial Parsch text for `a0055_nouveau`, but direct webpage retrieval returned DisabledError. The comparable `a0329_ancien` article opened correctly and contains the same opening. Its alias is held and the 443 ledger excludes it.

## Durable source of truth

- [First 30 original page excerpts](../../data/source-text/icrsp-france-b29-first30-direct-excerpts.v1.json)
- [Second 30 original page excerpts](../../data/source-text/icrsp-france-b29-second30-direct-excerpts.v1.json)
- [Last 20 original excerpts + one indexed alias](../../data/source-text/icrsp-france-b29-last21-20-direct-one-search.v1.json)
- [Current 443-article direct-source ID union](../../data/source-text/icrsp-france-b29-nine-stream-443-unique-topic-ledger.v1.json)
- [18 scoped existing-owner checks, with corroborated St Fidelis correction](../../data/source-text/icrsp-france-b29-18-owner-comparisons-and-one-confirmed-chronology-error.v1.json)
- [Exact fail-closed integrity tests](../../tests/test_icrsp_b29_80_direct_source_topics_and_owner_holds.py)

The earlier [B28 363-source ledger](../../data/source-text/icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json) remains a valid historical snapshot, not an additive corpus to count a second time. The separate **fresh 200** source-body lexical screening planned in `tools/icrsp/plan_b29_fresh_200.py` intentionally selects from the 339 previously unstaged articles outside the B23 250-wave. This stream is *automated source-body screening*, not human topic reading; it cannot increase the 443 direct-reading figure until individual excerpts are actually inspected.

## Highest-value findings and dispositions

**Confirmed factual error — Fidelis of Sigmaringen.** The [ICRSP page](https://icrspfrance.fr/textes-liturgiques.php?article=a0085_nouveau) writes `Martyr en 622`. Three independent institutions date his death to **24 April 1622**: [Vatican City State](https://www.vaticanstate.va/en/state-and-government/general-informations/saint-of-the-day/4061-april-24-saint-fidelis-of-sigmaringen-martyr.html), [Sigmaringen Catholic parish](https://www.kath-sigmaringen.de/das-leben-feiern/patrozinien-und-feste/fidelisfest/), and [Baden-Württemberg State Archive](https://www.landesarchiv-bw.de/de/themen/praesentationen---themenzugaenge/73752). **622 blocked** in all source reuse. A precise existing Saints person record was *not* found/verified in the checked research files, so no silent live Saints mutation occurred.

**Four former Corpus Christi octave weekdays:** [Friday](https://icrspfrance.fr/textes-liturgiques.php?article=a0970_ancien), [Saturday](https://icrspfrance.fr/textes-liturgiques.php?article=a0971_ancien), [Tuesday](https://icrspfrance.fr/textes-liturgiques.php?article=a0973_ancien) and [Wednesday](https://icrspfrance.fr/textes-liturgiques.php?article=a0974_ancien) explicitly describe the **1955 suppression** and preserve older Matins/Office and eucharistic meditations. These do not authorize restoring a 1962 Corpus Christi octave day or old Mass texts.

**Feast suppression and duplicate saints:** [Anaclet's July 13 page](https://icrspfrance.fr/textes-liturgiques.php?article=a0362_ancien) records its suppression under John XXIII and identification with Cletus. [Felix I old](https://icrspfrance.fr/textes-liturgiques.php?article=a0810_ancien) and [Felix I newer](https://icrspfrance.fr/textes-liturgiques.php?article=a0144_nouveau) reuse the same introduction. [Alexander older](https://icrspfrance.fr/textes-liturgiques.php?article=a0765_ancien) and [newer](https://icrspfrance.fr/textes-liturgiques.php?article=a0116_nouveau) likewise repeat early-cult material. Source aliases must not create extra saints or new universal celebrations.

**Papal martyr-title uncertainty:** [Soter and Caius](https://icrspfrance.fr/textes-liturgiques.php?article=a0751_ancien), [Urban I](https://icrspfrance.fr/textes-liturgiques.php?article=a0803_ancien), [Eleutherius](https://icrspfrance.fr/textes-liturgiques.php?article=a0805_ancien), and [Pius I](https://icrspfrance.fr/textes-liturgiques.php?article=a0358_ancien) contain source-reported distinctions between an historical death record and later Roman martyrological classifications. These may be retained as historical cult notes, not automatic claims of proven martyrdom.

**Specific 1962 Missal form boundaries:** [St Vincent de Paul](https://icrspfrance.fr/textes-liturgiques.php?article=a0370_ancien) distinguishes the ordinary Roman Proper from a supplemental French/Lazarist `Pauperes Sion` form; the site's permissibility claim requires actual rubrical authority and cannot alter Mass Explorer's source-path gate. [August 3 discovery of St Stephen's relics](https://icrspfrance.fr/textes-liturgiques.php?article=a0392_ancien) is suppressed from the universal calendar but reported in the 1962 `pro aliquibus locis` supplement. [St John Francis Regis](https://icrspfrance.fr/textes-liturgiques.php?article=a0211_nouveau) is expressly particular, not universal.

**Repeated Commons and Office exclusions:** `Sancti tui` (a0329/a0055), `Os iusti` (a0334/earlier a0060), and `Sapientiam Sanctorum` (a0326/earlier a0052) share Parsch contextual subjects under multiple URLs. Their printed originals and rights remain uncertified, and the various `Me exspectaverunt`, `Loquebar` and `Vultum tuum` Commons must remain distinct formularies. The four [O-antiphon](https://icrspfrance.fr/textes-liturgiques.php?article=a0834_ancien) meditation pages and two Quinquagesima Matins pages are **Office references**, not material for a new Office module or Mass reading.

**Authentic patristic-source leads:** [Forty Martyrs of Sebaste](https://icrspfrance.fr/textes-liturgiques.php?article=a0717_ancien) names Basil, Gregory of Nyssa and Ephrem; [Maccabees](https://icrspfrance.fr/textes-liturgiques.php?article=a0387_ancien) cites Leo; [Sixtus II](https://icrspfrance.fr/textes-liturgiques.php?article=a0396_ancien) invokes Cyprian. These must go to the existing Catena/Scripture reference owners with exact work, chapter, edition and translation provenance; no synthetic direct quotations of the Fathers.

## Release pathway

The first-pass exercise has now addressed **108 of the B27 reconciled 109** pages (28 in B27, 80 in B29). Do not re-review these as new articles. The search-only Sancti tui duplicate remains held; checking its direct source separately is optional and adds almost no editorial value. The other 339 first-unread articles lie outside the earlier 250 list. The parallel fresh-200 *automated body screen* is complementary but does not increase the directly reviewed total.

The next priority is to close specific domain owner gates for a small number of genuinely additive contexts and history corrections. This includes finding exact existing Saints person IDs and Calendar day IDs, verifying printed sources and 1962 rubrical authority, checking bilingual original prose and translation rights, and publishing only with explicit domain-owner signoff. No Mass Reader, gestures, Schola, posture or icon changes are authorized in this research lane.
