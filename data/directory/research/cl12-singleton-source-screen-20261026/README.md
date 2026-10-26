# CL12 — 75 singleton URL screening and exact 1962 book witnesses

**26 October 2026. Research-only.** Based on CL11, whose 33 multi-candidate URL reviews are already complete. CL12 covers all **75 remaining URLs with exactly one candidate row each** from the frozen CL9 432-row pool.

## Decisions

- **75/75 singleton URLs screened**, not all 75 independently source-certified.
- **12** first-party parish, diocesan, cathedral, shrine or directly responsible celebration-organizer evidence statements explicitly tie the **1962 Roman Missal** to the same site, day and time as the frozen timetable row. These are accepted as scoped *liturgical book evidence only*, not as currently recurring public Mass times.
- **63** held: most checked pages give only TLM, Latin, EF, parish affiliation, an outdated or unrelated source, or insufficient time/celebrant scope.
- **One important time conflict:** Passau Studienkirche St Michael's diocesan calendar explicitly gives a **17:00 Sunday 1962 liturgy**, but historical row **4522 gives 19:00**. Exact historical row acceptance is **HELD**, not silently corrected; preserve contemporary observed 17:00 as a source exception for schedule reconciliation.
- Four original links were not retrievable during the review: three Ad Orientem-derived overseas directory pages and a third-party Blogspot event article. Another Ad Orientem directory entry cites a low-confidence third-party post; its 1962 wording is not a primary-source owner assertion.
- Distinguish London parish/diocesan properties, chapels vs cathedral addresses, and programmes using different rites: no site-wide inference.

### Examples of direct evidence

* Holy Trinity Poughkeepsie: parish says the Sunday 13:00 Mass is according to the 1962 Roman Missal.
* Saint-Mathieu Quimper: parish lists Sunday 10:30 *selon le Missel 1962*.
* Notre-Dame La Roche-sur-Yon: parish identifies Sunday 10:00 as using the 1962 Missal.
* Norwich Cathedral: monthly first Sunday 15:00 expressly identified as 1962 rite.
* St Augustine Ramsgate: Sunday noon sung 1962 Mass; Friday's Ordinariate use separately distinguished.
* St Therese Alhambra: Sunday 13:00 historical parish 1962 programme and explicit accompanying missal use.
* Sacred Heart Palm Desert: owner says Sunday 14:30 uses 1962 Extraordinary Form.
* San Giovanni in Foro Verona: celebration organizer explicitly describes its Sunday 09:00 programme as *Messale del 1962*. An organizer's statement is not proof of the church's property owner or priest's wider status.
* Armidale Our Lady of the Angels chapel: diocesan page explicitly labels Saturday 08:00 traditional Mass **1962 Missal**. It must not be merged into the cathedral's ordinary Saturday liturgy.
* St Michael North Melbourne: parish calendar explicitly lists Sunday 17:00 Latin Mass with 1962 Missal in 2026–27.
* St Philip Blackburn North: owner timetable explicitly marks Saturday 09:00 Latin Mass, 1962 Missal.
* Immaculate Conception & St Egwin, Evesham: Tuesday 18:30 expressly under a 1962 Missal Latin Rite heading.

## Rebuild

After CL2–CL11 rebuild (same commands as preceding research phases):

```sh
python3 tools/directory/reconcile-cl12-singletons.py \
 --db /tmp/ao-cl12.sqlite \
 --cl9-csv /tmp/ao-cl9/cl9_432_mass_candidates.csv \
 --out-dir /tmp/ao-cl12
```

Committed source-of-truth documents: `evidence-decisions.json` + `tools/directory/reconcile-cl12-singletons.py`. Query `cl12_singleton_evidence` in SQLite or inspect the generated 75-row CSV and summary JSON. Regenerates without paid services or expiring GitHub artifacts.

## Completeness accounting

**All 129 URL references now have a first-pass screen or deeper CL9/CL11 review** (21 + 33 + 75). This is **source URL screening completeness**, not liturgical verification. Across CL10–CL12, **278/432 timetable rows** have a direct row-level adjudication: **133 accepted narrowly scoped book claims**, **145 held**. Another **154** candidates at 12 CL9-reviewed but insufficiently specific URLs still require row-level adjudication. The older CL2 three source-level owner witnesses remain **unchanged and separately counted**.

Do not publish a map pin, Missal filter, celebrant role, Una Cum value or currently recurring Mass from this overlay. Historic VERIFIED schedule status is not an operational release gate. Separate classification evidence and current recurrence/physical site checks remain necessary.
