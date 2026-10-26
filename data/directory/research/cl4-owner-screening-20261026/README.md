# CL4 — Physical descriptions and exhaustive exception triage

**26 October 2026 — research-only, stacked on CL3 PR #1732 (which stacks on CL2 PR #1729).**

This addition is a **27-record physical-description evidence overlay** plus an exhaustive but **non-verifying** triage of the 40 remaining identity exception rows. It does not alter the protected CL2 or CL3 snapshots, the published Find a Mass app, public Place IDs or historical timetable records.

## Source-backed research work

| Measure | CL2 | CL3 cumulative | CL4 cumulative |
|---|---:|---:|---:|
| Original blank physical descriptions | 113 | 90 remain | **63 remain** |
| Description backfills (cumulative) | 0 | 23 | **50** |
| CL2 identity exception rows held | 49 | 40 | **40** |
| Additional CL4 identity exceptions genuinely resolved | — | — | **0** |
| Exception rows given triage/next-action records in CL4 | — | — | **40** |
| New public Mass pins/schedules certified | 0 | 0 | **0** |

New location research is distributed across France (10), Germany (6), Switzerland (1), USA (5), Great Britain (1), Ireland (1) and Canada (3). Each record contains its original site-group ID, source URL, literal physical description, physical entity/site type, address precision, provenance class and release holds. **The Tralee Rathass street lead is secondary evidence, explicitly held; it is not owner-verified.** All others originate from owner, official administrative/heritage or institutional listings as classified in each record. No addresses are upgraded to geocodes or approved public pins.

First-party or institutional sources include [FSSP France's contemporary priest/house list](https://www.fssp.fr/nous-decouvrir/liste-des-pretres/), [French FSSP church location](https://fsspclermontferrand.fr/horaires-et-lieu/), [German FSSP houses and apostolates](https://www.fssp.org/de/wo-wir-sind/hauser-und-apostolate/), [FSSP Lausitz church](https://fssp.cz/lusatia/), [ICKSP Le Noirmont](https://institut-christus-koenig.de/diozese-basel/apostolate/le-noirmont/), [ICKSP Burlington retreat center](https://shrcburlington.org/), [St Lawrence parish](https://stlawrence.cc/), [Canadian Shrine of Notre-Dame-du-Cap](https://www.sanctuaire-ndc.ca/nous-joindre/), [Purification parish](https://stmaryslindsay.ca/contact), [Historic England's St Mary Brewood record](https://historicengland.org.uk/listing/the-list/list-entry/1039334) and [Regina Anglican host church](https://www.stmarysregina.ca/). Other record-specific original links are in `overlay.json`.

## Specific protection against mistaken publication

**FSSP Fresno** is named in the original physical-site research master, but owner [Holy Cross Chaplaincy](https://www.fsspfresno.org/) says **5693 N Del Mar Ave is correspondence/office**, whereas public Mass is at **St Genevieve, 1127 Tulare Street**. Leave Fresno's office record on hold and cross-check the separately recorded St Genevieve building; do not count office and church as two public Mass destinations.

**Sainte-Cécile school / Sainte-Philomène college** both use **8 rue Blaise Pascal, Annecy**: same campus and non-worship institutional sites, potentially historically overcounted as physical Mass locations. Their two descriptions are backfilled but neither may be advertised as a Mass venue. Do not automatically collapse their frozen groups without site-level decision.

**St Mary the Virgin (Regina)** is an **Anglican-owned building** whose use as a Catholic Latin-Mass venue is described separately by the specialist directory. Never classify the Anglican property's owner as a Roman Catholic celebrant or conflate building/ministries.

**Sebastianskapelle (Partenkirchen)** sources give inconsistent numbering; CL4 records only the Ludwigstraße/Münchner Straße corner, pending street-number verification. **Le Noirmont** lacks a building number; address precision is explicitly limited.

An exact physical description is not a current Mass timetable and does not certify rite, missal, celebrant, Una Cum or canonical recognition.

## Bulk exception triage

`remaining_identity_exception_queue` contains all 40 unresolved rows from CL3: **34 classification-only B92 entries** and **six location-only B98 entries**. Frozen IDs, original location descriptions, any already-stored source URLs and next source-identity action are preserved, but every item remains `SCREENED_STILL_HELD`. This is an exhaustive worklist, not 40 newly corroborated buildings. First priority is owner-backed same-building testing and institution-specific classification where absent.

`remaining_description_queue` preserves all 90 previously blank records: 27 research backfills and 63 holds.

## Validation

From the repository root, with Python 3 stdlib only:

```sh
python3 tools/directory/validate-cl3-reconciliation.py
python3 tools/directory/validate-cl4-owner-screening.py
```

The CL3 script verifies each original CL2 SHA-256 shard, and CL4 checks every CL3-remaining ID, the 27 non-overlapping physical descriptions, exact 40 outstanding identity keys, all four site-type anomalies, and zero release/schedule promotions. The dedicated workflow also rebuilds the CL2 SQLite from the immutable source shards. No new paid services or external packages are required.
