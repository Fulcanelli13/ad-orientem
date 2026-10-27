# CL32 — time-bound source quality for all 104 dated Mass research records

**27 October 2026 · Research only.** Stacked above CL31 #1779. Full-chain CL31 CI passed after correction, as did CL27–30. CL32 deliberately updates **evidence confidence**, not the original time/place/venue source records, canonical group IDs, public maps or actual liturgical calendar entries.

## Verified grade distribution

| Evidence class after new source corroboration | Source-listed dated records |
|---|---:|
| Explicit dated Mass in first-party operator/local Latin Mass organizer or host Catholic parish source | **98** |
| First-party bulletin with ambiguous Mass vs Eucharistic adoration wording | **1 held** |
| Austrian parish future date visible only in mutable search-index snapshot, older directly fetched page | **4 held** |
| Compiled secondary exact-date exception without a current local operator witness (Deggendorf, 9 Nov 18:00) | **1 held** |
| **Total original CL25–29 dated research observations (all preserved)** | **104** |

The 98 are **date-specific source-listing evidence**—not 98 guaranteed celebrations, editorial approvals, public occurrences or new globally deduplicated Mass events. The original five phases remain unchanged: CL25 7, CL26 14, CL27 9, CL28 18, CL29 56.

**CL28 #017 and #018: Stephansposching–Loh, pilgrimage church Holy Cross.** The [Catholic host parish's *Neuigkeiten* calendar](https://michaelsbuch-stephansposching.de/neugikeiten/) explicitly lists **Friday 13 November and Friday 4 December 2026 at 19:00** in **Loh** as `Hl. Messe in der außerordentlichen Form des römischen Ritus`. These exactly corroborate both dates already present in the [Pro Missa Tridentina printed exception list](https://www.pro-missa-tridentina.org/heilige-messen/regelmaessige-gottesdienste.htm), previously held as secondary. Preserve the original CL28 secondary grade for lineage; CL32 provides **two supplementary host-parish direct-source grades**. This upgrades their **event-source confidence** but **does not resolve their frozen CL2 physical-anchor ID**, so both are still held from worldwide publication.

**CL27 G26-NORTH-04: Süderbrarup Christ König.** The [regional local Traditional Mass organizer](https://www.alte-messe-im-norden.de/) independently lists **2 November 2026 at 18:30** in Christ König, Raiffeisenstr. 27. The [host Catholic parish](https://pfarrei-stella-maris.de/Katholische-Kirchen-in-Flensburg-und-Angeln__2991) independently identifies the building. This one source-listed event remains held at canonical identity/crosswalk gate: its building has no sufficiently identified frozen CL2 site group. Critically, the local organizer's 18:30 **specific date** must prevail over a separate recurring source statement “once per month at 18:00” or third-party calendars which falsely expand a weekday Mass to near-daily 18:00.

**CL29 private Holnest** remains a **private chapel** with no independently published visitor entrance or frozen physical group. One date-source row remains held. Nothing here requests publication of a residential address or public pin.

## Date-age and freshness (as of 27 October 2026)

| Relative local-calendar-date class | Dated source records |
|---|---:|
| Date before 27 Oct — historical source observation, not an upcoming Mass | **8** |
| Date is 27 Oct — same-day source listing, actual clock/currentness not inferred | **5** |
| Date after 27 Oct — upcoming *as-listed* event, needs recheck nearer date | **91** |

This is a **date-only audit**, not precise operator-time-zone live availability or a record of actual attendance. A source bulletin's entry remains research evidence after its date passes; it stops being describable as a *future* event. A same-day source listing does not guarantee the Mass is still upcoming.

CL31 identity levels are unchanged: **100/104** dated research events map to a working existing CL2 effective anchor across **29/32** venue keys, and **4** source-event rows at three venue keys still lack a suitable existing anchor. This is separate from the source-quality controls. An item is not publishable merely because both its date source and physical-identity candidates are strong: source freshness, actual present operation, no duplicates in the larger timetable master, exceptional calendars and editorial permission remain distinct gates.

## Permanent source ledger and CI

- `evidence.json`: complete **104-row** quality and local-calendar-date grade; each original exact date/time/venue key preserved; explicit host-parish source citations for two Loh dates, Súderbrarup single-event confirmation, private Holnest suppression, binary-PDF preservation caveat, zero-release policy.
- `tools/directory/reconcile-cl32-date-evidence-freshness.py`: deterministic Python-stdlib/SQLite crosscheck with CL31's 104 source-date keys, provenance quality and original CL28 secondary grade, local dates and clock, existing canonical anchor references. Produces auditable 104-record CSV, separate 2-record host parish proof, research-only exception queue and JSON summary.
- Dedicated GitHub Actions CI runs full CL2–32 research chain with **no network download** and uses database CHECK clauses to forbid original-source edits, new canonical/public site admissions and published future Masses.

After rebuilding existing CL2–31 research DB:

```sh
python3 tools/directory/reconcile-cl32-date-evidence-freshness.py \
 --db /tmp/ao-cl32.sqlite --out-dir /tmp/ao-cl32
```

All **2,584** frozen original canonical site groups and **4,681** timetable rows remain untouched; **39** German FSSP pilot IDs and existing research-only 100/104 identity links remain. The 296-row parallel owner-source queue is not duplicated. The original SSPX UK PDF binary remains **unarchived**, with checksum `null`; the utility introduced in CL31 can only record success when real bytes have been fetched and hashed. No paid storage, cloud overage, public map pins or Una Cum changes.

**Next:** (1) adjudicate whether the *real* Süderbrarup and Loh churches need properly vetted **new** canonical venue group admissions or already have alternate obscure frozen IDs; (2) maintain Holnest private access suppression; (3) fetch live Austrian future calendar dates and Deggendorf's local first-party November exception; (4) run explicit site+date+clock conflict comparison against the separate verified historical 4,681-row schedule master before considering any public future dates.
