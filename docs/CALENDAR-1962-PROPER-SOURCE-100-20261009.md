# 1962 Calendar — first 100 distinct Mass Proper source identities

**Date:** 9 October 2026 · **Status:** SOURCE-INTEGRITY AUDIT, NOT A COMPLETE TEXT CERTIFICATION.

The historical [132-item date/name/commemoration reconciliation](./CALENDAR-1962-EDITORIAL-CROSSWALK-20261009.md) has been adjudicated in merged [PR #767](https://github.com/Fulcanelli13/ad-orientem/pull/767). It does **not** verify the text of every Proper, each alternative formulary, or the accepted bilingual renderings.

This first larger text-oriented batch is a new, separate layer. It must not recycle or inflate the 731 date/rank/colour figure as a number of certified Mass texts.

## Selection

The executable [100-Proper source-integrity probe](../tools/calendar/proper-source-batch-100.mjs):

- Starts with the **actual pinned production DayResolver**, never a synthetic calendar or translated-name matcher.
- Inspects the canonical calendar records of **2024 and 2027**, selects **50 per year** with **100 distinct source paths** and coverage across **all 12 months of each year**.
- Prioritizes I- and II-class feasts, Sundays and other observed first-order formularies with commemorations; samples the remaining sources systematically. No Gregorian-date exception is added to the product itself.
- Excludes Good Friday as **not a Mass** under the 1962 Roman rite and avoids conflating the unselected II-class violet Rogation Mass with the ordinary date-only Eastertide feria.
- Calls the **real production Proper resolver** for each selected date. Captures observed day, Latin source path, selected Mass source revisions, source fetch provenance, nine ordinary Mass text slots, Collect/Secret/Postcommunion groups, complete preceding readings and additional source sections where applicable, commemoration text ownership and source failures.
- Independently recomputes which Latin-bearing texts lack the English/French rendering rather than trusting only the pre-composition `languageCoverage` indicator. Reports raw `N.`, unresolved inherited references and unexpanded liturgical conclusions for editorial investigation; does not automatically label every raw reference an error.
- Writes an auditable JSON artifact `calendar-1962-proper-source-batch-100.json` with **all 100 individual source identities**, exact pinned source URL, English/French missing sections, Mass prayer counts and source-resolution diagnostics. It fails on unresolved principal Mass source or fewer than 100 independently selected formularies.

## Evidence tiers

1. **Source identity / fetching:** Does the real Calendar day point to one stable pinned Latin Proper and successfully load it? A positive result establishes source access, not textual correctness.
2. **Mass composition and bilingual coverage:** Are the Latin-bearing sections and composed commemorative prayers present in their language slots? Empty translations, missing orations and unexpanded source pointers are source-integrity risks. Their presence alone does not prove a faithful translation.
3. **Critical 1962 source collation:** To certify, a second pass must compare each Latin Proper's actual text, appointed readings, antiphons, Collect/Secret/Postcommunion, ranks, transferred feast, special rite and calendar-specific commemoration **against an independently held original 1962 missal/ordo**. The current test does not do this.

The underlying calendar uses pinned [Missale Meum donor source](https://github.com/mmolenda/missalemeum) and [Divinum Officium](https://github.com/DivinumOfficium/divinum-officium). The independent year/day/class ordo witnesses remain [Missale Online 2024](https://missale.online/festkalender/en/2024/druck), [Missale Online 2027](https://missale.online/festkalender/en/2027/druck), [GCatholic 2024](https://gcatholic.org/calendar/2024/Extraordinary-en) and [GCatholic 2027](https://gcatholic.org/calendar/2027/Extraordinary-en). These independent day calendars do **not** necessarily witness every word of the Proper.

**Hard exclusions:** particular national/diocesan calendars; the optional violet `Exaudivit` Rogation Mass after explicit Litanies ([#714](https://github.com/Fulcanelli13/ad-orientem/issues/714), [#718](https://github.com/Fulcanelli13/ad-orientem/issues/718)); theology or translation certification; structural completeness of the Triduum and Easter Vigil (separate reader/rite acceptance).

## Acceptance

- Each selected record must resolve, with a non-empty source path; failures fail CI. Coverage gaps are disclosed, **not** padded with fictitious text to turn a red metric green.
- A complete workflow can have published bilingual **gaps** and still pass *the source-integrity census*. Such a result must never be described as full 1962 Mass Proper certification.
- Correct actual defects in the existing Proper/Calendar source owner in future PRs, not with a second title engine or generic fallback.
