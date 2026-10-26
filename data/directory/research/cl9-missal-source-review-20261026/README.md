# CL9 — primary-source 1962 Missal reconciliation

**26 October 2026.** Builds on CL8 PR #1744 stacked above CL7 #1742, not on a new venue master.

## Verified scope and result

The CL8 source corpus has **432 candidate Mass timetable rows** at **173 source/group IDs** referring to 1962 through original mass-type labels, transcribed excerpts or researcher notes. These 432 rows share **129 distinct source URLs**. This review inspected **21 URLs** from that set, covering **239 existing rows** and 62 distinct research group IDs; **108 URLs / 193 rows remain outside the reviewed set**.

The 21 reviewed URLs are preserved verbatim with one reviewed-source claim, claim scope, second direct owner page where used, restrictions and release holds in `source-reviews.json`. These are not 239 independently verified event assertions: a source page may support the venue's traditional programme but not every timetable slot and may lack explicit 1962 wording.

Nine reviewed URLs contain explicit site-programme, specific celebration or John XXIII Missal wording, spanning **85 candidate timetable rows**. This is a **first-party evidence-scope screening count**, *not* 85 newly formally accepted 1962 Missal classifications. Each remains held until it can pass a celebration-specific, time-specific owner statement and scope/matching review, including exceptions.

Important corrections:
- London Oratory distinguishes 1962 Masses from other Latin Masses.
- St John Cantius offers 2002 Missal **instead of** its otherwise-1962 Sunday slots on the **first Sunday**, and offers other ordinary/Latin Masses.
- Notre-Dame des Armées has a separate first-party 1962-book policy page supporting its parish's programme, beyond its list of times.
- Lyon Saint-Just uses the **Lyonese rite** on Sundays at 08:30 and some archdiocesan feasts. The FSSP affiliation and other Mass rows cannot overwrite that rite exception.
- The Diocese of Paris' generic 1962 landing page names no particular times in the six candidate rows; those remain not proven at row/site level.
- Arlington Latin Mass Society provides lay-directory evidence, not automatically a celebrant's or diocesan office's first-party statement; the 2026 permission window needs explicit refresh.

At this stage **zero** new formal 1962 acceptances, Una Cum judgments, current schedule releases or public venue pins.

## Reproduction

From repo root with Python 3 standard library:
```bash
python3 tools/directory/rebuild-cl7-research-index.py --output /tmp/ao-cl9.sqlite
python3 tools/directory/audit-cl-completeness.py --db /tmp/ao-cl9.sqlite --output-dir /tmp/ao-cl8
python3 tools/directory/audit-cl9-owner-evidence.py --db /tmp/ao-cl9.sqlite --cl8-csv /tmp/ao-cl8/missal_1962_reconciliation.csv --out-dir /tmp/ao-cl9-review
```

Read `cl9_summary.json`, `cl9_129_source_urls.csv`, `cl9_432_mass_candidates.csv` or query tables `cl9_owner_url_review` and `cl9_mass_candidate` in `/tmp/ao-cl9.sqlite`. **All source-only files and the scripts are committed**, enabling regeneration even after CI artifact expiration. The original CL2 rows and SHA-pinned source parts are not rewritten.

Next: inspect the other 108 URL sources in descending weighted counts, prioritizing explicit 1962 wording, ambiguity between the 1962/1970/2002 Missals, named site and worship room, owner roles and dates. Promote scoped claims only via a separate reviewed classification change and the existing Directory contract. Do not conflate Mass time VERIFIED with canonical/present recurrence or church ownership with minister affiliation.
