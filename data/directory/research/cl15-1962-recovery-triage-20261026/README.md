# CL15 — targeted recovery triage for all 197 remaining 1962 wording candidates

**26 October 2026. Research-only, additive descendant of CL14 PR #1754.**

The CL8 candidate pool contained 432 historic timetable rows with literal/source research mentions of 1962; CL10–13 adjudicated every row, and CL14 recovered 73 FSSP Germany held rows using specific first-party named churches and schedule hours. **235** rows now have accepted *source-scoped evidence* of their liturgical book, while **197** still lack independently accepted exact evidence at the original worship site/time. This is NOT a percentage of worldwide churches or current verified public Masses.

CL15 has a different deliverable from all preceding work: **classify the 197 holds by their precise recovery blocker and identify what proof would close each one.** It does not automatically approve more rows. It records **197 row decisions across 94 unique source URLs**, cross-referenced to original frozen IDs and all CL10–14 previous research decisions.

## Recovery lanes

Six mutually exclusive, priority-ordered *research workflows*, automatically generated from previous audited source categories and explicit narrowly scoped exceptions:

| Lane | Meaning | Release test |
|---|---|---|
| A — Retrieve primary page or bulletin | Original page is a 403, 404 or inaccessible; some alternate dated evidence is available | Obtain direct, retrievable parish or diocesan statement applying to the specific site/time and book |
| B — Reconcile time or weekday | Compact `M S a` wording in Kalamazoo or Passau frozen 19:00 vs diocesan 17:00 | Owner source at exact day and local clock time, documenting effectivity |
| C — Reconcile mixed rite or edition | Lyonese vs Roman; Latin 1970/2002 vs traditional; some Vetus Ordo unspecified | Slot/date/rite-specific owner witness, with substitutions encoded |
| D — Reconcile site or permission | Park Hills worship-site move, Arlington indult review, Niagara construction | Current diocese/owner approval and correct physical site/time correspondence |
| E — Obtain explicit owner book statement | Generic traditional/Latin/EF/Vetus Ordo label, no exact Missal edition at row scope | First-party explicit 1962 or John XXIII linked to named venue and day/time; otherwise keep held |
| F — Replace secondary/aggregator evidence | Self-referential or non-owner original website | Independent primary church/diocesan/celebration-organizer provenance |

**Priority tier 1** covers access, exact time, and site/permission cases (A+B+D). **Tier 2** covers mixed rite/edition (C). **Tier 3** covers owner edition-statement acquisition (E), grouped by URL/institution rather than paying researchers to repeat the same singletons. **Tier 4** covers particularly weak aggregator-only records (F). The ranks prioritize validation, not acceptance likelihood.

**New source leads (not promotions):**
- [Messes.info Angers diocesan-linked listing](https://messes.info/horaires/paroisse%3Aan%2F49%2Fcathedrale-saint-maurice-notre-dame) records 25 Oct 2026 Sunday 10:30 and 26 Oct Monday 18:30 Masses according to St John XXIII, but distinguishes 25 Oct Sunday 09:00 and Saturday 18:30 as current Missal. It cannot on its own prove all eight frozen Angers times.
- [Pensacola secondary schedule](https://catholicmasstime.org/church/st-stephen-roman-catholic-chr/4827/) mentions feasts of 1962 calendar, but records Mon/Fri 08:00 against frozen 08:30 rows. A third-party page does not authorize automatic classification.
- [2013 St Mary Norwalk official parish music archive](https://www.stmarynorwalk.net/author/davidh/page/88/) specifically distinguishes a weekly 1962 Solemn Mass from Latin Mass according to the 2002 Missal. However, thirteen-year-old programme data does not certify exact 2026 day/time rows.

**Never** conflate supporting evidence with independent direct-owner approval. Historical timetable `VERIFIED` cannot be used as 2026/27 public recurrence release. CL2 retains three prior accepted classification-source witnesses, distinct from the 235 celebration-level research acceptances.

## Reproduce

Python 3 standard library from GitHub repository root. Rebuild the original CL7 SQLite and append the CL8–CL14 research layers using each phase's documented script/CI, then:

```bash
python3 tools/directory/triage-cl15-1962-holds.py \
 --db /tmp/ao-cl15.sqlite \
 --out-dir /tmp/ao-cl15
```

Creates tables `cl15_recovery_source_queue` and `cl15_1962_hold_triage` as **research-only appendages**, never editing earlier source/acceptance rows. Generated reports:

* `cl15_197_held_rows.csv`: original record, URL, group, expected proof, exception flags, priority, current approval flags all zero.
* `cl15_94_priority_source_queues.csv`: one owner/source action per URL with candidate count and evidence needed, sorted by priority and volume.
* `cl15_priority_1_first_party_recovery.csv`: concentrated blockers involving directly retrievable primary evidence, clock contradiction, physical moves and permissions.
* `cl15_summary.json`: counts by lane, exact audit invariants and next-gate strategy.

The validator checks every held row is disjoint from all 73 CL14 matches; the union remains **235 accepted + 197 held = 432**, with **zero** public venue, public Mass, current recurrence, Una Cum, physical-geocoding, legal-owner or celebrant promotions. Original source ids, site groups and literal timetable times are never overwritten. The full set of audit rules and new leads remain committed in the GitHub repository after a one-day Actions download expires.

### What this closes

The missing-edition cohort is now a finite source-by-source exception queue, not a vague 'more research' instruction. More research should be performed only against these explicit evidence gaps or a separately approved expansion of the wider 4,681-row corpus. Publication and citywide/global physical-location completion are **different programmes**, and the unfinished 195 institutional source URL reviews from CL8 remain outside this 432-row adjudication's scope.
