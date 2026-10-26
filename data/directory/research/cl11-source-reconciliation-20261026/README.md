# CL11 — systematic review of all remaining multi-row 1962-source URLs

**26 October 2026.** This is research-only and stacked on CL10, not a new master or public Find-a-Mass import.

## Work performed

The CL9 432-row/129-URL evidence cohort had 108 source URLs not reviewed in CL9. CL11 inspects and disposes **all 33 of those sources with two or more candidate rows**, covering **118 preserved timetable rows**. The other **75 single-row URLs** remain as a bounded research queue. Of 33 URL dispositions, 30 were accessible directly; three were not (one 404 and two 403/index-only). The full source review contains owner/diocesan attribution, second-page owner witness where applicable, exact claim scope, original source URL, held reason and structured exceptions.

The 118-row direct matching concludes:

| Outcome | Rows |
|---|---:|
| Exact owner / diocesan source explicitly says **1962 Roman Missal**, and candidate day/time matches source programme | **42** |
| Historical timetable suggests 1962 but owner wording only says Latin, Extraordinary Form, Vetus Ordo, or access/source scope does not pass direct-evidence gate | **76** |
| **All newly adjudicated rows** | **118** |

The 42 correspond to **ten original source URLs** (some URLs describe multiple sites). This does **not** mean 42 new locations, 42 verified currently recurring Masses or 42 new public listings. The old CL2 three site-source owner witnesses and CL10 79 existing accepted celebration-row evidence statements remain **separate populations**; 121 distinct CL10+CL11 celebration-row evidence claims now have explicit accepted owner scope, none released.

### Principal findings

* **St Stephen Portland:** the archdiocesan parish finder lists 12 Latin day/time rows; the parish's own Mass FAQ explicitly states all Masses except its Saturday Missal of Paul VI Mass use the **1962 Missale Romanum**. The schedule itself is subject to the current bulletin.
* **Holy Rosary Indianapolis:** the owner distinguishes 1962/2002 Missals, confirming six candidate slots at source-programme scope. Its January 2026 change notice confirms first-Saturday 09:00 is 1962 but Sunday 07:00 **may instead use 2002 if priest cover fails**. Store that exception at individual row level.
* **Portland, Maine:** a **separate diocese** from Portland, Oregon. Its chaplaincy page directly attaches 1962 Missal to three named sites and their distinct recurring times. Do not merge into the Oregon venue.
* **Oxford, Toledo, St Anthony Laurel, Sacred Heart Boulder, Cottage Grove, Cagliari and Kevelaer:** directly scoped 1962 owner claims matched to original hours, with monthly, ferial and seasonal qualifications. Cagliari already has an accepted CL2 source-level witness, and must never be double-counted as an additional site.
* **Notre-Dame des Victoires, Angers:** the current parish indexed page and a January 2026 parish bulletin name the Missal of St John XXIII and the eight candidate slots, but direct retrieval returned **403**. The eight therefore remain held at the CL11 direct-owner-content gate, pending retrievable source.
* **Holy Family Toronto:** once per month its Sunday 11:00 Latin Mass uses the **Latin Novus Ordo**, and weekday Latin labels alone do not identify 1962 Missal. Six candidates remain held.
* **St John the Beloved (McLean):** Fourth Sunday noon uses Latin Novus Ordo instead of TLM under the 2024 indult; a separate Monday 20:00 historical row was not established by the inspected website.
* **Brescia:** the official cathedral PDF explicitly distinguishes a Latin Mass using the post-Vatican II rite from *Vetus Ordo* at **San Zeno al Foro**. The latter does not directly name the 1962 Missal.
* **Trieste:** the diocesan page identifies the historical Roman-rite Sunday/first-Friday celebrations and a 2024 dicastery authorization. It does not independently specify exact Missal edition in text reviewed.
* **Kevelaer:** the sanctuary publishes **1962-Missal Sunday 08:00 from 1 May–1 Nov** and **09:00 from 2 Nov–30 April** at the same Kerzenkapelle; neither schedule may be flattened across seasons.

## Reproduce from committed sources

From the repository root (Python 3 stdlib only):

```bash
python3 tools/directory/rebuild-cl7-research-index.py --output /tmp/ao-cl11.sqlite
python3 tools/directory/audit-cl-completeness.py --db /tmp/ao-cl11.sqlite --output-dir /tmp/ao-cl8
python3 tools/directory/audit-cl9-owner-evidence.py --db /tmp/ao-cl11.sqlite --cl8-csv /tmp/ao-cl8/missal_1962_reconciliation.csv --out-dir /tmp/ao-cl9
python3 tools/directory/adjudicate-cl10-missal-evidence.py --db /tmp/ao-cl11.sqlite --cl9-csv /tmp/ao-cl9/cl9_432_mass_candidates.csv --out-dir /tmp/ao-cl10
python3 tools/directory/reconcile-cl11-owner-sources.py --db /tmp/ao-cl11.sqlite --cl9-csv /tmp/ao-cl9/cl9_432_mass_candidates.csv --out-dir /tmp/ao-cl11
```

This creates `cl11_source_url_review` and `cl11_mass_source_scope` in the same research SQLite, plus a 33-URL decision CSV, a 118-row adjudication CSV and summary JSON. It checks frozen original IDs, exact day/time claims, source URLs, 3 existing original CL2 accepted source-level witnesses, 85 prior CL10 rows (79 accepted), 42 new source-scoped claims, 76 held, unchanged integrity, **zero** current recurrence/public/Una Cum promotions.

## Coverage after CL11

* **54/129 source URLs** received a CL9 or CL11 review disposition, covering **357/432 historical candidate rows**.
* **203/432** rows have received **celebration-level adjudication** in CL10–CL11: 121 source-scoped book claims accepted, 82 held.
* The other 229 rows remain to be adjudicated (154 at less conclusive CL9-reviewed URLs, 75 at singleton URLs). These are separate from the 76 already researched and held.
* Continue with **75 singleton URLs** using indexed institutional domain clusters, plus revisiting high-volume held sources only when new first-party evidence is available. Do not re-search the already resolved 42 rows or re-open the whole world location census.

Any formal application release requires a **separate** building/identity, current timetable and publication gate. Source-scope evidence is necessary but not sufficient.
