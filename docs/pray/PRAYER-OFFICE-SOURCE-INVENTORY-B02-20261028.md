# Source inventory B02 — Raccolta numbered headings and Sensus cross-index discovery
**Date:** 28 October 2026  
**Branch:** `research/prayer-office-master-source-inventory-20261028`  
**Mode:** inventory/research only. No include/exclude decisions, no user-facing prayer texts modified, no app runtime changes.

## Deliverables
- [Master source register](../../data/pray/prayer-office-source-inventory.b01.json): **214 stable source-observation rows**. These include non-prayer collection pages and Office Hours, and MUST NOT be reported as unique prayers.
- [Numbered Raccolta headings](../../data/pray/raccolta-1866-numbered-entry-seed.b02.json): **52 directly attested historical numbered headings** from the **1866 St John English** mirrored section pages, each given a provisional functional type; none has full text certified in this inventory.
- All **40 / 40** Raccolta section destinations from the master table of contents followed and rendered at least once; a supplementary Propagation of Faith page and introductory indulgences page also confirmed. The source website can intermittently time out on later direct re-fetches.
- Sensus **15** visible `/tag/novena/` index rows: **6 post bodies rendered** in this pass and **9 title/links supported by tag listing but bodies unavailable by live fetch**. The index includes non-novenas, proving that the tag itself cannot determine a work's type.
- **5 additional Sensus prayer-bearing source leads** beyond the visible novena tag (the 54-day Pompeii Rosary novena, the Divine Maternity novena, Maria Bambina, St Alphonsus's `Glories of Mary`, and Guéranger's Lenten Morning/Night prayers).
- Existing ICKSP / ICRSP research records unchanged: **25 selected initial records**, **98 Office-subsection index entries**, including **12 already overlapping source IDs** across those two research sets. These are source observations, not unique texts.

## Critical source findings

**1. The numbered Raccolta units are mixed kinds.** Some are prayers; some are a sequence of prayers, psalms or hymns; several are historical indulgence notices, prescribed practices, Christian-doctrine activities or historical ritual permissions. Example: §§143–145 do **not** reproduce the complete Gradual Psalms or an entire mental-prayer manual; §§149–151 concern teaching and works of mercy. They cannot be counted as three prayer texts.

**2. Composite historical units demand component extraction.** In §§4, 5, 14, 22, 35, 36, 104, 113 and 127, the entry contains several prayers, different language witnesses, days, verses, or repeating invocations. One source entry may correspond to many prayer units but should remain one historical entry.

**3. The mirror contains potentially displaced content.** Section XXIV (Faithful in their Agony), under §129, contains a heading `18. CHAPLET OF OUR LORD`. Treat as a potential duplicated/misplaced excerpt and require original-edition comparison, not a new §130.

**4. Appendix numbering is scattered.** The page for Section II (Almighty God) includes supplemental §§163–164 under an `APPENDIX` subheading. Section V (Child Jesus) includes supplemental §169 in the same way. Therefore it is WRONG to infer a section's entries from the first number to one before the next section's number, or to assume all entries above §160 reside in one standalone section. The highest observed number 189 remains an identifier, not an independently verified total of prayers.

**5. Sensus page discovery is not exhausted.** Novena-tag page presents 15 records and a `Load More` control, but static `/tag/novena/page/2/` and `/page/3/` could not be fetched. The WordPress API attempt was unavailable; an XML sitemap endpoint was encountered but not processed in the current HTML reader. A cross-index `/tag/gospel/` independently revealed a 54-day Rosary novena and a Marian maternity novena absent from the first novena-tag page. Search only within the novena tag would give a demonstrably incomplete census.

**6. Sensus and 1866 Raccolta provenance remain separate.** Standalone Sensus posts may quote 1910 Raccolta versions; historical editions must be compared individually before canonical matching.

## B02 evidence links
- [1866 Raccolta source table of contents](https://sensusfidelium.com/the-raccolta/)
- [Section I: §§1–7 including §6 and §7](https://staging2.sensusfidelium.com/the-raccolta/the-most-holy-trinity/)
- [Section II: §8, §11, §13, and appended §§163–164](https://staging2.sensusfidelium.com/the-raccolta/almighty-god/)
- [Section V: §§21–22 and appended §169](https://staging2.sensusfidelium.com/the-raccolta/the-child-jesus/)
- [Section VII: §§35–40](https://staging2.sensusfidelium.com/the-raccolta/precious-blood-of-jesus/)
- [Section XXIV: §129 and embedded §18 exception](https://staging2.sensusfidelium.com/the-raccolta/for-the-faithful-in-their-agony/)
- [Section XXVII: §142 Sacrosanctae](https://staging2.sensusfidelium.com/the-raccolta/the-divine-office-and-the-office-of-the-blessed-virgin/)
- [Sensus novena tag, first 15 visible](https://sensusfidelium.com/tag/novena/)
- [Sensus gospel tag, additional novena leads](https://sensusfidelium.com/tag/gospel/)
- [Sensus religion tag, Maria Bambina](https://sensusfidelium.com/tag/religion/)
- [St Alphonsus, Glories of Mary](https://sensusfidelium.com/meditations/st-alphonsus/glories-of-mary-st-alphonsus/)
- [Guéranger, Morning and Night Prayers for Lent](https://sensusfidelium.com/the-liturgical-year-dom-prosper-gueranger/lent/morning-and-night-prayers-for-lent/)

## Next pass before any selection
1. Obtain a machine-readable all-post enumeration of Sensus (XML sitemap parser through an appropriate browse environment, or pagination/API if supported), retain archive/year/tag duplicates as source-observation links.
2. Complete all 1866 historical numbered headings and the scattered appendix, then capture individual prayer components in separate records without copying unverified text to production.
3. Enumerate the full ICKSP/ICRSP site indices (not only the 25 curated works and 98 Office-subsection entries).
4. Map all 1960 Roman Office text files and rubrical permutations into the same witness/identity taxonomy; reuse Scripture Psalm identities.
5. Only after complete source intake: reconcile with actual Ad Orientem prayer IDs and report exact distinct texts, alternate recensions, missing translations, source/rights holds, and app coverage.

**Caution:** source completeness denominators remain unknown. No percentage of all prayers found, added or verified can be supported yet.
