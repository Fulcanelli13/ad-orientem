# ICRSP France — B11: source-reading themes for the remaining 40 Lent and Pentecost pages

**Date:** 26 October 2026 · [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [Draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## Precisely what is complete

Batch 10 had already source-path-reconciled 51 sources, with **11 sampled for substantive webpage themes and 40 only metadata-screened**. Batch 11 individually visited and inspected the **opening/selected `Commentaires` passages on all remaining 40 ICRSP source pages**. The complete 51-page sample (29 Lent weekday/Ember + 22 Sundays after Pentecost) now has **one specifically grounded thematic lead per page**.

This is **51/51 introductory/selected commentary passage screening**, **not** 51/51 exhaustive Guéranger, Schuster and Parsch textual edition collation. Each of the 40 has its original source article ID/URL, exact already-present Ad Orientem Scripture `sourcePath`, commentary subsection locator, specific research topic, likely owning module, caveat and explicit rights/application gates. These are permanently staged in `data/source-text/icrsp-france-b11-40-commentary-theme-review.v1.json`.

The 40 new page-level topic verdicts are:
- **30** source-grounded theme candidates requiring comparison with existing Calendar, Mass Explorer, Scripture and place-owner explanations;
- **4** predominantly historical-rite/Office leads requiring original scholarly witnesses before even considering publication;
- **6** high-contextualization-risk leads deliberately blocked from publication because they contain potentially polemical or dated Israel/Gentile interpretations or typological inferences.

These dispositions are **not 30 missing features or 30 cleared passages**. Zero direct new user-facing features, copyright permissions or original editions have been authenticated.

### Strongest newly identified Scripture leads (outside the chronological salvation-history narration)

| ICRSP article | Research theme | Responsible target |
| --- | --- | --- |
| `a0191_ancien` (Mon Lent III) | Naaman's washing read as a figure of baptism | Existing Scripture parallels and day-specific Calendar notes |
| `a0186_ancien` (Fri Lent II) | Joseph sold by his brothers and Christ in the vineyard parable | Separate prophecy/typology compendium, **sensitive historical rhetoric** |
| `a0198_ancien` (Sat Lent III) | Susanna's fidelity as a sign of the persecuted Church; early Christian martyr iconography | Scripture parallels + historical artwork witness |
| `a0205_ancien` (Thu Lent IV) and `a0206_ancien` (Fri Lent IV) | Elisha and Elijah raising children as distinct scriptural types of the life-giving Christ | ONE conceptual resurrection-themed research cluster; two independent biblical/source witnesses |
| `a0192_ancien` (Tue Lent III) | Widow's oil and mercy/forgiveness | Scripture links only if exact selected Proper readings and authentic sources agree |
| `a0365_ancien` (Sun XII post-Pentecost) | Good Samaritan plus Psalm 69 and Cassian's prayer tradition | Existing Scripture/Mass Explorer with original Cassian passage lookup |
| `a0487_ancien` (Sun XXI post-Pentecost) | Job and Mordecai/Esther imagery in the Offertory and Introit | Existing Proper and Scripture context, source section exact-match gate |

**The source themes are commentary interpretations**, not independently proven patristic or divinely stated cross-references; never invent quotations from the Fathers. The current app already has source-path ownership of the relevant Mass readings. These additions must be checked against its existing Scripture compendium before considering a new displayed parallel.

### Roman station and historic-context leads

Sources directly name such stations as **Santa Anastasia** (Tue Lent I, Christmas dawn link), **San Lorenzo in Panisperna** (Thu Lent I), **Santi Apostoli** (Ember Fri Lent I), **San Clemente** (Mon Lent II), **Santa Balbina** (Tue Lent II), **San Marco** (Mon Lent III), **Santa Pudenziana** (Tue Lent III), **San Sisto Vecchio** (Wed Lent III), **Ss. Cosma e Damiano** (Thu Lent III), **Quattro Coronati** (Mon Lent IV), **San Lorenzo in Damaso** (Tue Lent IV), **San Martino ai Monti** (Thu Lent IV), and **San Nicola in Carcere** (Sitientes Saturday). Every name is an identification **lead**, not a new `place_id` or confirmed modern mapping.

The shared geography owner (`data/geography/seed-registry.v1.json`) currently contains 498 place records. A targeted check found **no proven corresponding station-church stable ID among the seed records**; this does not exclude dedicated Shrine/Sacred Places registries, and the source review does not create a parallel place catalogue.

**Explicit discrepancy:** on `a0207_ancien` (*Sitientes*, Saturday Lent IV), the page's general introduction refers to an earlier station at *San Lorenzo in Lucina*, whereas the Guéranger section refers to *San Lorenzo fuori le Mura*, both explaining replacement by *San Nicola in Carcere*. Preserve this provenance disagreement rather than choosing an identity based on one text.

### Historical material that must remain historical

- **Lent Ember ordinations**, ancient catechumenal scrutiny and public penance: instructive background, **not current 1962 obligatory posture/minister action**.
- **Saturday in Passion Week** (`a0009_nouveau`): an account of the older papal `fermentum` distribution and almsgiving customs. Not part of the existing 1962 priest-action registry.
- **4th/11th/17th/23rd Sundays after Pentecost**: earlier Gospel relocations, retained chants and questions about cross-week prayer selection. Exact 1962 Mass source owners and calendar computation retain authority.
- **Jerusalem siege and Jewish–Christian relations** (`a0242_ancien`, `a0243_ancien`, `a0486_ancien` and others): nineteenth-century interpretations must not be published as neutral history or doctrinal declarations, nor should their wording be copied into generic explanatory prose. Document original author, critical history and applicable Catholic sources separately.
- **Lenten fasting practices** in historical descriptions cannot create current obligations.

### Already-present Ad Orientem capabilities respected

- Existing 1962 Mass reader and separate Ordo Missae gesture/Schola/rubric adjudication untouched.
- Existing Calendar display, selected Proper and Calendar customs preserved.
- Existing 32 published Mass Guide entries, 84 bilingual Ordinary prayer explanations, and eight Formation stages not duplicated.
- Existing Bible text and historical parallels owned by the separate Scripture compendium, outside Historia Salutis narration.
- Existing shared Place owner must supply any station IDs, with independent site identification and provenance.
- All 51 records already matched current Mass Scripture source paths, but sourcePath equality alone is **not proof** of the exact independent original work edition, manuscript source or 1962 liturgical calendar selection.

## Remaining work / honest acceptance threshold

The first-pass theme detection queue for the original 51-page sample is **51/51**. Remaining gates are: source edition and French translation rights, full relevant commentary-body comparison, cross-source idea deduplication, exact paragraph-level comparison with actual existing day-level Calendar/Scripture/Mass Explorer content, verification of Roman station church identities, and prioritised safe editorial release proposal.

**0** original historical editions critically collated; **0** ICRSP text reproduction rights established; **0** newly proven gaps in existing app; **0** published content changes. Full 855/783 metadata snapshots remain at risk of expiry in GitHub Actions artifacts despite committed curated research summaries and source pointers.

Research artifact: `data/source-text/icrsp-france-b11-40-commentary-theme-review.v1.json`. Dedicated regression: `tests/test_icrsp_b11_commentary_theme_review.py` included in the read-only `icrsp-gap-integrity.yml` workflow.

Next research priority: classify **unique conceptual topic clusters** across the 51 sources, verify source-original bibliographic loci for the top biblical/early Roman history candidates, then check current app explanations at paragraph/claim level. Do **not** propose 51 newly-authored article pages, 51 calendar replacements or new reader sections.


## Supplemental consolidation — 10 conceptual editorial queues

B11 now groups the 51 article-level themes into **10 conceptual research clusters** in `data/source-text/icrsp-france-b11-51-topic-clusters.v1.json`. These hold **39 source-article references covering 33 distinct article pages**; one page may occur in more than one thematic cluster, and **18/51 sampled pages are not among the initial high-priority clusters**. This is a triage shortlist, not a declaration that any source text is identical, historically authenticated or legally reproducible.

Six high-priority clusters cover baptismal and resurrection typology, Susanna and early Christian visual witness, Joseph and Christ, Roman station place identities, ancient catechumenal rites and the `fermentum`, and historic post-Pentecost Gospel/chant redistribution. Three secondary clusters cover Good Samaritan/Cassian prayer, Job/Esther Offertory themes and penitential moral instruction. One **HOLD** group quarantines period-specific Jewish–Christian polemics.

The groups retain concrete source URLs and existing app-domain owners and expressly approve **zero** quotations, original-book editions, modern French translations, new Place IDs, Calendar text or priest rubrics. Regression tests require all group sources to be actual members of the 51-article sample.

The next substantive gate is a **claim-by-claim comparison**, beginning with the baptismal/typology clusters, against already published Calendar, Scripture parallels, Mass Explorer and shared Place-owner claims. This must establish an actual new contribution rather than simply another link to the same theme.
