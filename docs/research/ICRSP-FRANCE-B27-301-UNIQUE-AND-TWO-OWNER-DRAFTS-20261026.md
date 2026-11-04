# ICRSP B27 — 109-source dedup, 28 new topic readings, exact 301-article union

**26 October 2026** · [Existing research PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666). **Research and editorial draft only; no app content or 1962 rubrics changed.**

## Numbers that must not be conflated

| Metric | Verified in programme ledger | Status |
|---|---:|---|
| Site article identities | 855 | Structurally indexed |
| Commentary-bearing source article identities | 783 | Panel inventory 2,856 instances |
| Distinct source bodies automatically screened in B21+B23 | 373 | Lexical/hash screen only, not direct editorial reading |
| B23 tranche | 233 | Previously bulk-screened |
| Prior B23 direct pass (B23, B24, B25) | 20 + 25 + 75 = 120 article passes | 113 distinct within this tranche |
| Unread after previous B23 pass | 113 | Four found in older B22 93-article review |
| **B27 unique unread B23 sources** | **109** | Four exact source IDs excluded before reading |
| **New B27 directly inspected source topics** | **28** | 28/109; 81 remain in this queue |
| Parallel B26 review in B21's other cohort | 20 | Non-overlapping |
| Parallel B27 review in B21's other cohort | 47 | Non-overlapping |
| **Unique article topics actually examined across seven ledgers** | **301/783 (38.4%)** | Exact source-ID union after 7 historic repeat passes |
| **Remaining distinct articles without directly examined topic** | **482** | Across indexed 783, not just current 81 queue |
| Newly approved user-facing explanations / rights / original-edition certifications | **0** | All release gates held |

The 301 total comes from **308 research article passes minus 7 already-read article IDs**. B24/B25's seven historical repeats remain visible as earlier-source evidence, not new distinct pages. B27's four additional B23-queue repeats are excluded from this B27 review count and were already included in the earlier 93. The parallel B26 (20) and B27 (47) records are disjoint from the first 254 ID union; **do not add them again in future work**.

## Source-of-truth files

- [109 exact fresh source IDs and four prior-reviewed exclusions](../../data/source-text/icrsp-france-b27-reconciled-109-unread-article-queue.v1.json)
- [28 directly inspected source topic passages](../../data/source-text/icrsp-france-b27-28-direct-source-topic-readings.v1.json)
- [12 content-owner parity comparisons and 2 bilingual drafts](../../data/source-text/icrsp-france-b27-12-scoped-owner-parity-and-two-drafts.v1.json)
- [Seven-cohort 301-article union ledger](../../data/source-text/icrsp-france-b27-seven-stream-301-unique-direct-topic-ledger.v1.json)
- [Parallel B27 review of 47 different B21 sources](../../data/source-text/icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json)

### B27 four exact research repeats found before direct reading

`a0087_nouveau` Major Litanies; `a0114_nouveau` Athanasius; `a0640_ancien` Polycarp; `a0923_ancien` Marriage Mass. These each existed in the B22 93-review ledger. Hence 113 *metadata-pending* does not equal 113 truly topic-unread.

### Direct-reading findings worth retaining

**Palm Sunday:** [a0010_nouveau](https://icrspfrance.fr/textes-liturgiques.php?article=a0010_nouveau) is explicitly pre-1955; [a0593_ancien](https://icrspfrance.fr/textes-liturgiques.php?article=a0593_ancien) points readers to the historical commentaries and repeats the opening Guéranger account. Calendar and Guide already own Palm Sunday and the Palm procession exception. No independent rite, old form or reader modification.

**Ascension:** [a0111_nouveau](https://icrspfrance.fr/textes-liturgiques.php?article=a0111_nouveau) and [a0279_ancien](https://icrspfrance.fr/textes-liturgiques.php?article=a0279_ancien) similarly share introductory explanation, including an explicitly older octave context. The current Calendar already computes the feast; Mass Explorer displays only the already-approved Proper. Text dedup candidate, not automatic 1962 equivalence.

**Sacred Heart:** [a0220_nouveau](https://icrspfrance.fr/textes-liturgiques.php?article=a0220_nouveau) clearly distinguishes the original pre-1929 and revised post-1929 formularies. It is a historically useful source *because* it stops accidental import of older Mass texts into the 1962 Proper. One original bilingual explanatory draft exists pending independent 1856/1929 authority and canonical owner match.

**In Albis / Quasimodo:** [a0038_nouveau](https://icrspfrance.fr/textes-liturgiques.php?article=a0038_nouveau) combines the white-robed neophytes with the Roman St Pancras station and the liturgical readings. This suggests a contextual note under the existing Calendar day (not a new feast or ceremony). A concise bilingual draft remains unpublished until 1962 source-path, station, and history verification.

**Precise Saints editing:** [Irenaeus](https://icrspfrance.fr/textes-liturgiques.php?article=a0227_nouveau) mixes original feast history with the 2022 Doctor title. [St Gerard of Toul](https://icrspfrance.fr/textes-liturgiques.php?article=a0096_nouveau) and [local companion page](https://icrspfrance.fr/textes-liturgiques.php?article=a0225_ancien) repeat much biography, but the latter explicitly limits observance to particular dioceses. [Our Lady of Bonsecours](https://icrspfrance.fr/textes-liturgiques.php?article=a0153_nouveau) has history/art/place leads for Nancy; no physical-place or painting record authorized merely by article mention.

**Historical-only and excluded:** [Former Baptist octave](https://icrspfrance.fr/textes-liturgiques.php?article=a0204_nouveau), [former Assumption octave](https://icrspfrance.fr/textes-liturgiques.php?article=a1035_ancien), and [St John Baptist vigil fasting notes](https://icrspfrance.fr/textes-liturgiques.php?article=a0199_nouveau) must not import obsolete calendar or fast rules. [O antiphons](https://icrspfrance.fr/textes-liturgiques.php?article=a0833_ancien) are Vespers material: only link-level Advent context could be relevant under the user's no-Office policy. Modern [G*lias polemic](https://icrspfrance.fr/textes-liturgiques.php?article=a0238_ancien) and [2007 two-form article](https://icrspfrance.fr/textes-liturgiques.php?article=a0239_ancien) are not current permission rules or 1962 Mass texts.

### Actual inspected ownership

- `src/calendar/liturgical-year.js` already owns Palm Sunday, Low Sunday/In Albis, Ascension, and season computation; no new Calendar subsystem or dates are authorized.
- `src/calendar/traditional-year-v384.js` and `src/calendar/customs-read-model.js` already surface Rogation events and an optional private Rogation prayer walk. The Easter V Sunday source cannot create another procession trigger.
- `src/learn/mass-explorer-selected-calendar-proper.js` already requires an existing ready Calendar resolution and matched sourcePath. ICRSP historical formularies are only evidence leads, not alternative Proper providers.
- `data/learn/mass-explorer-approved-studies.v1.json` remains empty. The [Parsch Abbots Common](https://icrspfrance.fr/textes-liturgiques.php?article=a0060_nouveau) is an interesting named-Common reference, but not an approved published new study.

Two original English/French notes were drafted for In Albis and Sacred Heart and are **research drafts only**, never presented as reproduced words of Parsch, Schuster or Guéranger. Actual original printed editions, translation rights, critical theological review, and exact canonical owner-day IDs still need proof.

## Continuation

The next B23 task should inspect **the 81 unreviewed B27 queue IDs**, after filtering them against any newly committed parallel work. Since the B21 parallel topic review has reached 98/160 direct webpage excerpts, its 62 remaining sources are a different cohort and should not be double-assigned. A future successful release requires specific source-backed information not present in the existing Calendar, Saints, Customs or Mass Explorer **at its actual canonical record**, original edition/rights checks, and final owner sign-off.

No change to the live Mass reader, Schola, icons, local postures or ritual texts is implied by any of these source commentaries.
