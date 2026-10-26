# CL27 — One-source bulk timetable reconciliation and source review

**26 October 2026 · RESEARCH ONLY · based on CL26 #1773.**

This is an actual **frozen-ID, row-level audit of every one of the 4,681 historical Mass timetable assertions**, plus the 2,584 historic canonical-site records used to resolve five same-building aliases. It does **not** open another independent location discovery stream or make a new provider corpus.

## Outcomes

| Population | Records | Correct interpretation |
|---|---:|---|
| Historical timetable rows audited | 4,681 | Original 28 columns unchanged |
| Historically VERIFIED status | 3,347 | Source audit status, **not** a 26 Oct live-bookable/public certification |
| Unverified | 1,334 | Includes source-less placeholders |
| Unverified with source URL **and** exact time/day string | **296** | Existing assertions to adjudicate, not 296 newly discovered or verified Masses |
| Cohort 1 | **200** | Provider/organizational-source rows **with existing frozen source IDs**; ranked for first review |
| Cohort 2 | **71** | Further provider/organization URL reviews, **including five missing-source-ID Mauritius holds** |
| Unverified rows with no frozen venue-source ID | **5** | Special B74-labelled Mauritius entries; within Cohort 2; require identity linkage, do not mint duplicates |\n| Historically VERIFIED rows with no venue-source ID | **8** | B74-labelled existing source entries; provenance linkage required before any public use |\n| Secondary-source replacement holds | **25** | Twenty adorientem.church plus five Latin Mass Directory-type research claims: obtain owner source |
| Unverified missing an actionable source/day/time combination | 1,038 | Of these, 998 lack an official source URL and 40 contain some source but miss day or clock |
| Verified but Mass-type/rite blank | 2,108 | No inference of 1962 Missal |
| Verified but timezone blank | 6 | Hold calendar exports requiring local zone |
| Verified seasonal qualifier | 478 | Must model season and exceptions |
| Verified feast/holiday exception | 593 | Must model exceptions |
| **Same-site/day/clock collision candidates** | **106 keys / 234 rows** | Candidate repeats after the *five existing* same-building aliases; **do not delete or merge automatically** |
| Newly approved public Mass times | **0** | Production gates remain closed |

## What is saved permanently

- `audit.v1.json` — all 296 unverified source/time candidates with original B53 source-row label plus immutable CL2 `historical_row` identity, supplied venue source ID (possibly empty), group ID, effective physical anchor ID, original exact-day pattern, clock, frequency, original source URL/excerpt, review flags, and publication hold. Separately contains all 106 candidate same-anchor/day/time collisions and all 234 contributing original verified rows.
- `tools/directory/validate-cl27-bulk-schedule-audit.py` — reconstructs original rows from **CL2 checksum-pinned shards**, ensures 200+71+25 exact coverage and explicit holds for five unlinked Mauritius rows and 106 collisions, confirms no source IDs/groups lost or new approvals introduced.
- `.github/workflows/directory-cl27-bulk-schedule-review.yml` — runs the permanent regression, not a short-lived downloader.

**A same-site/same-clock match is not proof of a duplicated Mass**. Different seasons, dates, editions or genuinely distinct parallel rites must be adjudicated before any row is retired.

## Direct owner-page spot checks, 26 October

These checks are source *readbacks*, not publicity approvals.

1. **Naples / Rosariello:** [ICRSS Napoli](https://www.icrss.it/napoli/) directly lists rows B53 **261 / 2047 / 2048 / 2049**: Sunday/feast 11:00 sung and 19:00 low, Mon–Fri 18:30 low, Saturday 11:00 low. Matching text exists on the owner site; keep original `UNVERIFIED` pending official timeliness and release-gate review.
2. **Orléans / two satellite sites:** [ICRSP France](https://icrspfrance.fr/?org=27) lists B53 **243 / 244** (Saint-Martin Sunday 08:30 and Conflans first Sunday 18:00), but **explicitly directs visitors to recheck the local apostolate**; do not remove that qualification.
3. **Australia / ambiguous clock:** [SSPX Australia/New Zealand](https://sspx.au/en/list-sspx-chapels-0) says Singleton Sunday **10:00 OR 16:00** (check bulletin) and Irymple first/third Sunday **09:00 OR 18:00** (check bulletin). In particular B53 **305, 955, 2137, 2138, 821, 2132** must not be represented as several unconditional parallel Masses.
4. **Mexico / relative monthly patterns:** [SSPX Mexico district](https://fsspx.mx/es/capillas-2) lists Masses on a Friday/Saturday *before* or Monday *after* a given monthly Sunday. Examples **2294, 2296, 2300, 2306, 2308–2313, 2317, 2318** cannot be converted to an ordinary weekly recurrence by dropping the relative qualifier.

## Execute, review, release

```bash
python3 tools/directory/validate-cl27-bulk-schedule-audit.py
```

1. **Work the 200-row first-party/source-owner queue as a genuine batch**, sharing fetches across repeated URLs. Record exact page text/date, venue identity, recurrence, season, bulletin precedence, rite-specific evidence, and source-site key; separate *page fetched* from *slot corroborated*.
2. Resolve the **106 collision keys** under the canonical effective physical anchor: compare day/time/frequency, validity range, venue and exact celebration. Merge only after verified same-event identity and preserve all source IDs and provenance.
3. Continue the other 71 provider-source reviews; separately replace the 25 secondary-only links with owner evidence. The 1,038 partially empty unverified rows are a different provenance and timetable-discovery queue, **not 1,038 fixed Mass times**.
4. Only after physical worship-building check, current slot verification and rite-specific review may a separate, explicit public app release be prepared. **CL27 does not modify `src/find`, published map pins, canonical site IDs, Una Cum, or liturgical filters.**

No subscriptions, paid APIs, metered geocoding, or paid storage.
