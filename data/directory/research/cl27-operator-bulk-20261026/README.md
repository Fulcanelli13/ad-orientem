# CL27 — bulk operator-calendar source screen and false-event regression gates

**26 October 2026, research only.** Stacked above CL26 #1773, CL25 #1772, CL24 #1771 and CL23 #1770. The canonical source of truth remains the existing Ad Orientem repository, not this branch in isolation.

## Scope and measured results

CL27 builds a deterministic **39-row owner-source intake ledger** for the existing German FSSP geospatial pilot, indexed to the existing frozen source-place IDs. This is not a claim that every one of the 39 owners has an individually dated future programme reviewed; **only two pilot sites have new date-specific evidence in this pass**. Most of the 39 still require fresh owner calendars or exception confirmation.

It separately screens **10 source feeds**, adds **9 individually listed future Mass candidate rows** at **5 physical places**, and preserves **6 explicit false-date / wrong-venue guards**. Five events come from a current local Latin-Mass organizer's displayed schedule and four from an Austrian diocesan search-index snapshot whose direct page fetch was stale. The latter four need fresh direct readback and cannot be called independently reverified.

| Dataset | Total, actual |
|---|---:|
| Frozen pilot source locations indexed | 39 |
| Screened source feed classes | 10 |
| New explicit-date research candidates | 9 |
| From directly listed local organizers | 5 |
| From mutable diocesan search-index snapshot, requires refresh | 4 |
| Added candidate dates within 39-site pilot | 3 (Kiel 2, Blaibach 1) |
| Added candidate dates outside pilot | 6 (Bremen 1, Süderbrarup 1, Austria 4) |
| Prior CL25 Nürnberg individual dates | 7 |
| Prior CL26 Freiburg individual dates | 14 |
| Cumulative individually listed source candidate rows CL25–27 | **30** |
| Source-quality regression exceptions | **6** |
| Independently approved new Mass instances or public pins | **0** |

### Source-by-source events

**[Alte Messe im Norden](https://www.alte-messe-im-norden.de/)**, local Latin-Mass apostolate:
- Kiel St Nikolaus, Rathausstraße 5, **Sunday 1 Nov 2026 16:00** and **Sunday 6 Dec 2026 16:00** (pilot ID CL14-DE-FSSP-002)
- Süderbrarup Christ König, Raiffeisenstraße 27, **Monday 2 Nov 2026 18:30** (outside 39-site pilot)
- Bremen-Neue Vahr St Hedwig, Kurt-Schumacher-Allee 62, **Friday 11 Dec 2026 19:00**, Rorate (outside 39-site pilot)

**[Römische Messe Regensburg / Petrus-Canisius-Kreis](https://www.roemische-messe-regensburg.de/cms/?page_id=22)**: **Sunday 1 Nov 2026 11:30** at Blaibach St Elisabeth. One explicit date listed, not a blanket expansion of the first/third Sunday pattern (pilot CL14-DE-FSSP-038).

**[Archdiocese of Vienna: Katzelsdorf parish](https://www.erzdioezese-wien.at/pfarre/14424327)**: search-index result for the live parish feed showed **1 Nov 11:00, 6 Nov 19:00, 8 Nov 11:00 and 15 Nov 2026 11:00** at the parish church in the traditional Roman form, but the opened page returned an **older September snapshot**. All four are saved with `DIOCESAN_PARISH_EXPLICIT_DATE_ON_SEARCH_INDEX_SNAPSHOT`, not certified direct live events. Do **not** invent Sunday 22 Nov from the incomplete result or conflate the parish's ordinary-form Mass with the traditional one. Austria is outside the German pilot. Each record must be independently fetched from a current authoritative parish calendar before public approval.

All new records are source-listed **candidates**, not verified actual celebrations on the day or approved future app calendar entries. Since other parallel Mass Times conversations maintain substantially larger site and schedule corpora, do not claim these are nine globally new Masses until deduplication against that worldwide venue/event master.

### Six source-quality and duplication safeguards

1. **Walldürn:** [GOCATH](https://gocath.org/de/event/heilige-messe-im-ueberlieferten-ritus-wallduern) expands Saturday 10:00 to **every week**, whereas the [underlying traditional-Mass directory](https://www.pro-missa-tridentina.org/heilige-messen/regelmaessige-gottesdienste_1.htm) says **one Saturday monthly**. This is a false-frequency date generator.
2. **Tann:** [GOCATH](https://gocath.org/de/event/heilige-messe-im-ueberlieferten-ritus-tann) includes first Friday 6 Nov 2026; the underlying [original rule](https://www.pro-missa-tridentina.org/heilige-messen/regelmaessige-gottesdienste_1.htm) says **Friday except first Friday**. Suppress this date.
3. **Winterlingen-Harthausen:** [GOCATH](https://gocath.org/de/event/heilige-messe-im-ueberlieferten-ritus-winterlingen) generates 07:30 for November and December. Source rule says **08:00 in winter** and an **alternating church site**; the wrong time and location must not publish.
4. **Potsdam:** [GOCATH's city finder](https://gocath.org/de/messefinder/potsdam) lists three 17:00 traditional-Mass names near the same hospital chapel. The owner identifies the [actual St Josefskapelle](https://www.alexianer-potsdam.de/st-josefs-kapelle); the three syndicated rows must not automatically become three independent Mass instances.
5. **Deining:** syndicated [GOCATH house chapel dates](https://gocath.org/de/event/heilige-messe-haus-st-stola) expand the institution's [recurring FSSP rule](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/mittersthal/messzeiten.php). This does not prove exact future dates, public chapel access or a mapped door.
6. **Katzelsdorf:** indexed future listing versus earlier snapshot when opened. Preserve the difference and refresh before editorial promotion.

The source evidence ledger includes additional future calendar acquisition leads—Saarlouis FSSP November Rundbrief, Reinbek November Mass plan, Oberflockenbach alternate venues, Wigratzbad multiple chapel programmes, Hannover host parish weekly bulletins—with `listed_future_event_count: 0` **until an actual document is read and individually evidenced**. No invented downloads, no counted sources that were not inspected.

### Method and outputs

`evidence.json` contains the 39 frozen owner-site source keys, 10 feed classes, 9 per-date records, and six negative-control cases. `reconcile-cl27-operator-date-bulk.py` rebuilds additive SQLite tables with CHECK-enforced zero publication, verifies all old CL17–26 expected research tables, deduplicates the new nine candidates against CL25's seven and CL26's 14, and asserts all 39 source IDs still match the original pilot staging.

Outputs:
- `cl27_39_pilot_site_operator_date_screen.csv`
- `cl27_9_explicit_dated_source_candidates.csv`
- `cl27_10_source_feed_triage.csv`
- `cl27_6_syndication_quality_exceptions.csv`
- `cl27_summary.json`

After the original CL2–26 research DB rebuild:

```sh
python3 tools/directory/reconcile-cl27-operator-date-bulk.py \
 --db /tmp/ao-cl27.sqlite --out-dir /tmp/ao-cl27
```

Frozen baselines: 39 named site identities, 74 FSSP pilot historic Mass patterns, 256/176 original 1962 wording witness grades, 2,584 canonical sites, 4,681 canonical Mass-time rows, and 38/39 research-supported geospatial places. No public calendar, entrance geocode, canonical venue, Una Cum classification or existing schedule is changed. Research outputs may be regenerated freely without paid services.

**CL28 target:** harvest actual current, individually dated monthly PDF/bulletin calendars at a higher rate (Saarlouis, Reinbek, Wigratzbad, Hanover and wider FSSP/ICKSP/local networks), with dated document snapshots and source-to-venue dedup against the *other* larger Mass Times workstreams before any promotion. Do not spend effort inventing weekly events from recurrence rules.
