# Wider Latin Mass source directory: coverage baseline

**Date:** 2026-10-11. **Status: inventory only, no 1962 typical-edition certification.**

## New denominator (repository files, not liturgical celebrations)

Enumerated the upstream [Divinum Officium Latin Mass directory](https://github.com/DivinumOfficium/divinum-officium/tree/master/web/www/missa/Latin) using its GitHub Contents API. There are **1,052 files**: **526 Tempora**, **524 Sancti**, and **2 Commune**. Of these, **105** are represented in the prior direct four-slot Scripture witness census; **947 additional files** remain outside that previously inspected source-file subset.

The [machine-readable file and blob inventory](../../data/geography/research/mass-latin-upstream-directory-census-20261011.v1.json) stores all 1,052 current `master` paths and blob hashes. Hashes establish file identity at enumeration but the `master` URLs are movable references, not immutable source permalinks.

**Crucial interpretation:** 1,052 is not the number of Masses celebrated according to the 1962 Missal. Additional filenames can be variants, inherited stubs, deprecated or later rubrical states, or non-1962 observances. Conversely, the repository does not supply the missing inherited Common files in its current `Commune` directory and is therefore **not demonstrably a complete 1962 Missal witness**. The 105 previously inspected sources represent **10.0% of this repository-file inventory**, not 10.0% of the 1962 Missal.

## Publication and extraction boundaries

- Existing 105-path four-slot inventory remains unchanged: 420 positions, 364 with direct notes, 536 original citation-note lines.
- The 947 new file paths have **not been individually opened** or compared with a printed 1962 edition. File-list enumeration is only the first of multiple coverage stages.
- Distinguish source file, celebration identity, historical/rubrical edition, chant section, occurrence in liturgical calendar and biblical usage. None is interchangeable with the others.
- For each eligible Proper, extract all genuine `[Introitus]`, `[Graduale]`, special `[GradualeL#]`, Alleluia/Tract/Sequence, `[Offertorium]`, and `[Communio]` sections and their directives. Inheritance must be resolved with cycle detection and precise section matching.
- Use Hazell’s independent [1962 Scripture index](https://catholiclectionary.blogspot.com/2013/06/scripture-index-for-1962-mr-and-some.html) for detection of missing liturgical uses, but do not import its copyrighted text.
- Validate actual biblical words, Psalm numbering, Esther/Daniel additions, and translations against 1962 Missal, Clementine Vulgate, Crampon and Douay before displaying production links.
- Preserve current `learn.mass` and Atlas ownership; do not alter LIVE or assign devotional meditations as quoted Propers.

## Next batch

First partition `Tempora` and `Sancti` into 1962-authorised Proper paths, dated rubrical exceptions, alternate files and references with explicit evidence. Then analyze high-value previously uninspected sections in reproducible path-sized batches. In parallel, resolve independent Common witnesses rather than deducing them from missing upstream filenames.

This report certifies only file enumeration. **Zero additional chants, celebrations, or biblical passages certified for publication.**
