# Did You Know? — 526-card editorial staging (UNAPPROVED)

> Research staging only. This folder is **not a production import path**. No card has owner signoff. Do not deploy, merge or register these records into the live home feed.

## Source and content

- [526-card bilingual candidate CSV](./ao-dyk-owner-selection-526-UNAPPROVED-20261110.csv): exactly **332 priority (interest 4–5)** and **194 reserve (interest 3)** cards. It contains `Fact ID`, proposed EN/FR titles, final editorial EN/FR copy, tier, Claude verdict, editorial caveat, empty `Owner decision`, and explicit not-approved release status.
- [Machine-readable staging manifest](./ao-dyk-owner-selection-526-manifest-20261110.json): counts, excluded issues, source and release safeguards.
- Source of truth for all source IDs/URLs, provenance and full draft history remains [the 1,745-row research master](../registry/ao-dyk-bilingual-draft-master-20261110.csv), at blob `2fc7f31c6594ad9e69530a6241906a3ce2018f0e`. The 225 already-published facts stay in their separate comparator file.

## Structural reconciliation (no source/fact checking)

- Exactly **526** distinct immutable Fact IDs; each exists in the master; all candidate titles/texts are present in both EN and FR.
- **360 KEEP** and **166 REWRITE** editorial decisions; five of those rows are specifically marked `COPY REWRITE PROPOSED · NOT APPROVED`.
- **0** owner approvals. Consequently **0** records are eligible for production import.
- The previous editorial closure parked twelve published-content overlaps. Those parked rows must not silently reappear in the public feed.
- **Title collision:** `Lavabo` is proposed for both `DYK-GX14-013` and `DYK-GL-G216-01`. The facts are not modified; owner/editor must decide the disambiguated titles and whether both are useful.

## Release gates: manual, explicit, sequential

1. Review high-interest 332 first. Reserve 194 remain available without auto-release.
2. Obtain owner decisions per selected card; a Claude `KEEP` verdict is **copy-quality only**.
3. Resolve five proposed rewrites, the Lavabo title collision, and historically uncertain cases. No new unsourced assertion may be introduced by a copyedit.
4. Compare with the 225 published reference facts to keep duplicates out. Preserve the source-master lookup by Fact ID.
5. Only after the owner explicitly approves a release batch, create a *separate* production import with validation and test it on GitHub Actions/GitHub Pages. No Vercel deployment.

**No automatic import path is included in this PR. This CSV remains a research artifact, not app-facing content.**
