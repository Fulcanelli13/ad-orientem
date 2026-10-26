# CL28 — cross-network dated Mass calendar evidence, no publication

**Research-only, 26 October 2026.** Stacked above CL27 #1774. Extends the already existing Ad Orientem Mass Times register, with no new canonical site or changes to any public map/listing. CL28 deliberately separates **first-party local date lists**, **host-parish dated celebrations**, and **secondary compiled exact dates**. It does **not** interpret recurrence expansion as an independently confirmed future Mass.

## Extracted source date evidence

| Source and confidence | New dated candidates | Geographic worship sites |
|---|---:|---:|
| [FSSP Bedford/Chesham 18 Oct 2026 bulletin](https://fssp.org.uk/sunday-bulletin-18-october-2026/) | 13 | 3 |
| [St Willibald host parish Pfarrbrief](https://pfarrei-etting.de/pfarrbrief.html) | 2 | 1, existing CL14-DE-FSSP-021 |
| [Pro Missa Tridentina specifically printed 2026 dates](https://www.pro-missa-tridentina.org/heilige-messen/regelmaessige-gottesdienste.htm) | 3 | 2, not yet linked to global master |
| **Total newly extracted** | **18** | **6** |

From the UK bulletin, the separately named worship buildings are **Our Lady of Ransom**, Kempston (weekday and All Souls dates), **All Saints**, Kempston (1 Nov 8:30), and **Our Lady of Perpetual Succour**, Chesham Bois (1 Nov 12:00 and All Souls). **Six distinct 2 November All Souls Masses** are individually published: Our Lady of Ransom at 17:00, 17:30, 18:00; Chesham Bois at 06:30, 10:00, 10:30. The weekday exact times 27–30 October and 1 November times are all copied to the ledger as dated source claims, **not approvals**.

The UK 31 October line reads `Sat 31 Oct 11:30am Eucharistic adoration` *within a Mass-intentions table*. It likely denotes a Mass with adoration separately, but the label is ambiguous. Thus its source date/time is captured and **held for operator clarification**, not released as a verified Mass. There are 13 source rows from the UK but only **12 not held for this specific ambiguity**.

[St Michael Etting host parish](https://pfarrei-etting.de/pfarrbrief.html) publishes FSSP Latin Mass at **St Willibald** on **Sunday 1 and Sunday 8 November 2026 at 10:00**. Its separate 08:30 parish Mass is explicitly **excluded** from the FSSP dataset. Both FSSP Mass rows link to the **existing** frozen `CL14-DE-FSSP-021` pilot source identity; no second Ingolstadt venue is created.

The [compiled Pro Missa Tridentina directory](https://www.pro-missa-tridentina.org/heilige-messen/regelmaessige-gottesdienste.htm) explicitly identifies **Deggendorf's shifted November Mass on Monday 9 November 2026 18:00** (instead of mechanically generating the first Monday) and **Stephansposching–Loh Friday 13 November and Friday 4 December at 19:00**. These are **three secondary-specific-date leads**, lower grade than an owner's directly dated document, and remain held until local operator corroboration.

This adds **18** *not previously recorded in the CL25–27 phase ledgers* to the previous **30** source-listed candidate rows, making **48 cross-phase research source rows**. This is not a count of deduplicated new events in the entire worldwide Ad Orientem register. Four CL28 entries are additionally **held** (one ambiguous service text plus three secondary dates). **Zero are independently approved for publication**.

## Bulk workflow and actual gaps

The permanent manifest `evidence.json` contains all 18 individual source dates and their normalized keys, all six worship identities, nine source readback/negative controls, and nine prioritized operator feeds. We inspected links and source classes for Saarlouis and Reinbek November 2026 programmes, Wigratzbad, Munich and Hannover, but **did not successfully retrieve current future-dated programme content** from those sources in this pass. Do not treat a search-index PDF link as evidence of its constituent Mass dates.

Critical documentary caution:
- Saarlouis November 2026 newsletter appeared in a recently indexed result, but direct HTML readback was older August/September. **0 admitted November events** pending the current actual PDF.
- Reinbek November 2026 `Meßplan` link appeared in an indexed site, but the PDF could not be accessed. **0 admitted events**, despite its recurring Sunday 15:00 Mass.
- [Wigratzbad directly inspected weekly PDF](https://petrusbruderschaft.de/media/Niederlassungen/Distriktshaus_St_Michael/GDO-2026-10d.pdf) covered **18–25 October**, entirely before this future-date intake. It cannot support an October 26–November projected period. Its 07:55 Sühnekirche, 10:15 Seminarkapelle and 17:15 Gnadenkapelle are different venues.
- Munich's monthly newsletter at source readback was October, not November; no November dates inferred.
- All Souls 2026 is **Monday 2 November**, not **Monday 3 November 2025**. The prior year's FSSP bulletin must never be reused.

## Reconciliation and publication lock

`tools/directory/reconcile-cl28-crossnetwork-dates.py` (Python 3 standard library) checks strict 2026 future-date semantics, Europe/London vs Europe/Berlin timezones, source grades, the two existing Ingolstadt pilot rows, all six All Souls venue/time tuples, specific exceptions and empty approval fields. A normalized `site|localDate|localTime|timezone` SHA-256 fingerprint aids deterministic **research-level** local duplicate checking against CL25–27 rows. The script does not claim or enact matching against the *global* venue master: every nonpilot source record is explicitly marked `matched_worldwide_master_id=null`.

After the existing CL2–27 SQLite reconstruction:

```sh
python3 tools/directory/reconcile-cl28-crossnetwork-dates.py \
  --db /tmp/ao-cl28.sqlite --out-dir /tmp/ao-cl28
```

Outputs `cl28_18_date_specific_candidate_events.csv`, `cl28_9_source_backlog.csv`, `cl28_9_exception_readback_controls.csv`, and `cl28_summary.json`, with additive research-only SQL tables. **Hard gates remain frozen:** 39 FSSP German pilot sites; 38 named georeferences; 74 historical pilot patterns; 256 supported/176 held liturgical-book evidence rows; 2,584 canonical site and 4,681 Mass-time rows. No public events, entrances, map pins, new venues, or Una Cum classifications are approved.

## Direction after CL28

**Prioritize source acquisition and currentness rather than multiplying geocoding microbatches.** The next workstream should bulk-ingest the actual dated monthly PDFs/bulletins from FSSP, ICKSP and local operators, with date-level provenance, secondary-vs-first-party classifications and automatic duplicate comparison against the *existing worldwide* Mass Times venue/event master. Deduplication and release certification are separate gates. Keep the work strictly €0, using permanent small evidence metadata and reproducible free CI, not temporary seven-day artifacts as primary preservation.
