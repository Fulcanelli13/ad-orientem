# CL29 — 5-page SSPX Great Britain service PDF + FSSP Warrington owner bulletin

**26 October 2026, research only.** CL29 is stacked immediately above CL28 #1776. It advances source-backed **dated event intake**, not the master venue count. Read the entire five-page original district PDF visually before transcribing the SSPX service cells. Every source candidate is tagged `public_calendar_event_approved=false` and `worldwide_master_match_state=UNRESOLVED_NEVER_AUTOCREATE`.

## What has actually been screened

| Operator-owned dated source | Source dates considered | Source-backed Mass cells |
|---|---|---:|
| [SSPX Great Britain: Priory Mass Times, issued 25 Oct 2026](https://fsspx.uk/sites/default/files/documents/PrioryMassTimes-261025.pdf) | 26 October–1 November 2026, five pages | **50** |
| [FSSP St Mary's Shrine Warrington, 18–31 October bulletin](https://fssp.org.uk/category/notices-mass-schedule/) | 26–31 October 2026, archive issue 17 October | **6** |
| **Total newly recorded** | Seven-calendar-day research window | **56** |

Those are **56 dated source listings**, not promises that 56 services actually occurred. Some are already in the past at the moment of research, and later cancellations must be considered. They do NOT add 56 public Mass times.

The **SSPX 50-event set** covers 18 district-level venue references. **17** worship places can be named using the original [SSPX chapel directory](https://fsspx.uk/en/chapels-directory) (some are chapels within residence/school properties, for which an exact public entrance is not implied); the one unresolved **Holnest** entry remains locality-only. The **FSSP Warrington shrine** is an additional, independently named place, making **19 total references**, **18 named** and **1 held as town-only**.

### Explicit service-grid examples and identity safeguards

- **London, Holloway**: Ss Joseph and Padarn, Salterton Rd: Friday 30 October 19:00, Saturday 31 October 11:00, All Saints 1 November **08:30 and 10:00**. Wednesday and Thursday are NOT to be generated as public Masses; the chart marks no Mass in corresponding columns.
- **London, Wimbledon**: St George's House, 125 Arthur Rd: Monday 26 October 11:00, Tuesday 27, Friday 30, Saturday 31 October 07:15, All Saints Sunday 1 November 17:00. **28 and 29 October are explicitly No Mass.** A religious residence address is not an independently surveyed worship doorway.
- **Burghclere, St Michael's School/chapel**: Mon–Fri 26–30 October 07:30, Sat 31 October **07:30 and 12:00**, Sun 1 November **07:30 and 10:00**.
- **Bristol, St Saviour's House chapel**: 26 October **07:30 and 11:00**, 27–30 October **07:30**, 31 October **07:30 and 11:00**, 1 November **09:00 and 11:00**. The same source's Sunday **Taunton 11:00** and **Holnest 16:00** are separate venues, not additional Bristol parish Masses.
- **Preston**: Our Lady of Victories, East Cliff, 26 Oct 11:00, 30 Oct 11:00, 31 Oct 12:15 and 1 Nov 09:30. The 1 Nov “Preston & Manchester 9:30” explicitly denotes **two** venues, not two names for the same church.
- **Scotland**: Glasgow St Andrew's 31 Oct 10:00; 1 Nov **08:30 and 10:00**. Edinburgh Ss Margaret and Leonard 26 Oct 07:00 and 1 Nov **09:00 and 11:00**. The Carluke St Andrew's House name and address appear as regional priory header and must **not** be substituted for Glasgow or Edinburgh's actual Mass buildings.
- **Satellite missions**: Leicester St Anne, Woking Holy Cross, Groombridge St Pius V, Herne Ss John Fisher & Thomas More, Rhos-on-Sea St David, Liverpool Ss Peter & Paul, Bingley The Little House and Gateshead Holy Name are specifically cross-referenced to the operator's distinct chapels; each is independently keyed by physical venue, not by serving priory. “Herme” on the 1 Nov London sheet is a likely typo for *Herne*—recorded transparently, not silently normalized.
- **Warrington**: St Mary's Shrine, Smith Street, Monday 26–Saturday 31 October **12:00** from the FSSP's expressly dated Mass-intentions table. Do not infer 1 November Sunday Mass from this bulletin's date range ending 31 October.

No confessions, vespers, Eucharistic adoration, rosary, benediction, generic parish office, or *No Mass* cell is an event. Multiple Masses at one venue and date remain separate by clock time.

## Duplication check: **not a worldwide merge**

CL29's source keys are stable **research identifiers**, `UK-<place>-CL29`. They do not replace or mint canonical Ad Orientem venue IDs. Every output Mass event is finger­printed deterministically from `research_venue_key|date|local_time|Europe/London`; this prevents duplicate ingestion *within* CL29, but does **not** establish no duplicates in the parallel wider B44/B46 pipelines. The existing [Latin Mass Directory research crosswalk](../../approved-mass-worldwide-crosswalk-20261009.v1.json) already contains an **unmatched research lead** for St Mary's Shrine Warrington, but that lead has no admitted canonical ID and cannot be promoted merely because an owner bulletin exists.

A non-public architectural/site reference or church address does not confirm a surveyed entrance. The source operator's tag `SSPX` is preserved literally, without asserting Una Cum, ecclesiastical communion status, public app eligibility, or the exact missal edition for each occasion. **SSPX and FSSP services remain distinguishable** even when within one UK region.

## Permanent source evidence and limitations

- `evidence.json` permanently preserves **all 56 transcribed source date/time/place facts**, URL, owner, original PDF page index (0–4) where relevant, liturgical/source semantics, and eight material exception controls.
- **Original PDF binary is NOT included in this PR.** The original URL is stored and all five source pages were visually inspected, but no PDF SHA-256 is invented. `document_binary_sha256=null` signals that the underlying source document remains at external operator hosting and could change. The record is durable metadata, not a permanent media archive or proof of original binary integrity.
- The five-page SSPX PDF's page-zero-indexed screenshots were inspected; the actual Warrington archive HTML was read in its dated issue. The recurring September–October SSPX planner is **not substituted** for the dated service timetable.
- Owner site's source version 25 Oct 2026 is only evidence as at publication. Later cancellations, changes and revised PDF editions need another comparison.

## Reproducible, release-safe rebuild

`tools/directory/reconcile-cl29-uk-dated-owner-pdf.py` (standard-library SQLite, SHA-256, CSV) checks all **50 SSPX + 6 FSSP** date/time cells, source specificity and PDF pages, the 19 venue identities, **8** negative controls, the unique research fingerprint, and a known LMD research lead. It verifies that the original canonical 2,584 sites, 4,681 mass-time rows, German pilot 39 source sites / 74 historical patterns / 256 accepted and 176 held book-evidence rows remain unchanged. It then adds four strictly research-only tables with SQL CHECK clauses enforcing **zero public Mass instances, map pins, entrance approvals, Una Cum and cross-source canonical mappings**.

Run after CL2–28 full reconstruction (CI does this automatically):

```sh
python3 tools/directory/reconcile-cl29-uk-dated-owner-pdf.py \
 --db /tmp/ao-cl29.sqlite --out-dir /tmp/ao-cl29
```

Exports `cl29_56_dated_mass_source_rows.csv`, `cl29_19_worship_place_identity_research.csv`, `cl29_8_release_exception_holds.csv`, `cl29_summary.json`. All metadata stored in existing GitHub repository using €0 dependencies. CI must pass before merging the stacked PRs.

**Next:** systematic automated retrieval of operator-owned dated monthly PDF bulletins, checksum + source timestamp when binaries really are fetched, safe daily schedule normalization, and cross-source venue/event dedup against *the latest* global B44/B46 master—not the 2026-10-09 LMD research crosswalk as though it were canonical.
