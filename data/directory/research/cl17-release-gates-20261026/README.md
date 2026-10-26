# CL17 — a real release-gate pipeline, beginning with 39 FSSP chapels and churches

**26 October 2026. Research-only stacked continuation above CL16 #1757.**

This phase turns liturgical evidence into **actionable publication staging**, not another re-screen of 432 historic records.

## Outcomes and denominators

- The earlier CL10–CL16 chain accepted **255 individual 1962/John XXIII book evidence claims** attached to historical timetable rows. The remaining 177 were held.
- One additional Potsdam hospital chapel row is now supported through *three independent primary-source classes*: the chapel operator directly states Sunday 17:00 is a Tridentine Latin Mass, the FSSP directly lists that exact named chapel and Sunday 17:00, and the FSSP expressly follows the 1962 rubrics. Berlin's archdiocesan site also identifies the same chapel/time. This is **one research-supported 1962-book programme slot**, not a verified future Mass release.
- **256 supported / 176 held** among the original 432 historical candidate rows. Source-level CL2 accepted owner witness count of three stays unchanged; never add it to row counts.
- **39 distinct FSSP owner-named worship locations** and **74 associated accepted source-backed Mass rows** are staged for independent physical-geocode and current-recurrence checks: the 38 named German FSSP sites from CL14 plus the Potsdam hospital chapel. Their owner-published physical addresses are documented, but **none is yet an approved geographic coordinate or public pin**.
- **All 256 accepted rows** now share one auditable, comprehensive evidence→release-gate status table, including original IDs, classification evidence phase, date/clock, original URL, source/group identity, source evidence for physical address when present, exception risk and separate required publication gates.
- Absolutely **zero** new canonical site admissions, user-facing map pins, published schedules, geocoded entrances, Una Cum assertions, institutional ownership assumptions, or confirmed future-dated recurrence.

## Source issue resolved: Potsdam is one chapel, not two

The [Alexianer hospital chapel](https://www.alexianer-potsdam.de/st-josefs-kapelle) says **St Josefs Kapelle, Allee nach Sanssouci 7, 14471 Potsdam**, Sunday **17:00 Tridentinische Messe**. The [FSSP German Mass source](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php) says **Kapelle im Alexianer St. Josefs-Krankenhaus, Zimmerstraße 6**, same Sunday 17:00. The [hospital's campus access directions](https://www.alexianer-potsdam.de/orientierung) explain that Zimmerstraße 6 is the main vehicle campus access, while Allee nach Sanssouci 7 is another access point with no through route. The [Berlin archdiocese](https://www.erzbistumberlin.de/wir-sind/pfarreien/kirchen-und-gottesdienstsuche/?tx_solr%5Bfilter%5D%5B0%5D=categories%3APotsdam) lists **one Kapelle St Josef** at Allee nach Sanssouci 7 with a Sunday 17:00 Mass. The [FSSP's German institutional statement](https://koeln.petrusbruderschaft.de/wer-sind-wir/) explicitly identifies the 1962 rubrics. These sources jointly support one named worship location; record the *chapel address* and *campus vehicle access* separately to prevent accidental duplicate pins and wrong navigation. Exact map point and pedestrian entrance still need check.

## Strict release states

Each accepted historical Mass row has at least the book-evidence research gate passed. A physical location record is *staged* when official sources give a named worship room, city and an address. **Neither a physical description nor a street address alone is enough to release a map pin.** A currently announced recurring schedule, future-date effective exceptions, named site and appropriate source authority must independently pass. A 2026-dated historical `VERIFIED` cell is not operational currentness. Any 1962-vs-2002/1970 or Lyonese exception must be encoded as dated or conditional logic before filter/publication.

| Gate | After CL17 |
|---|---|
| Source-scoped 1962 book witness for an original row | 256 passed |
| Named worship-place and owner address documented within FSSP pilot | 39 sites / 74 rows staged |
| Independently checked coordinates and entrance | 0 approved |
| Future-dated liturgical exception and timetable validity | 0 approved |
| Canonical public site admission | 0 new |
| Current Mass schedule public release | 0 new |
| Una Cum attestation | 0 new |

The **39-address pilot is not a geographic completeness statistic**. Other accepted rows may already have perfectly usable addresses in the frozen physical registry; their precision simply has not yet been independently assessed under the new release gate. CL17 deliberately does not mislabel those sites as missing.

## How to rebuild

Python 3 standard library only. First reconstruct CL2–CL16 research SQLite using the commands in the preceding CL16 CI. Then:

```sh
python3 tools/directory/reconcile-cl17-release-gates.py \
  --db /tmp/ao-cl17.sqlite \
  --out-dir /tmp/ao-cl17
```

This adds three **research-only** SQLite tables:
- `cl17_accepted_mass_gates` — all 256 accepted original timetable rows with separated release gates.
- `cl17_owner_site_stage` — the 39 distinctly identified FSSP worship locations, owner address documentation, existing anchor ID and no-release flags.
- `cl17_potsdam_identity` — original row 20, church address, distinct campus vehicle access address, one-venue assertion and original primary witnesses.

All tables use hard `CHECK` constraints for approval flags, and CI verifies population integrity, no released site, no una cum, no source/classification changes and the complete **256 accepted + 176 held = 432** candidate partition.

Regenerable exports: `cl17_256_mass_evidence_to_release_gates.csv`, `cl17_39_fssp_owner_site_pilot.csv`, `cl17_176_unresolved_claims_carryover.csv` and `cl17_summary.json`. Permanent owners' citation/provenance and pipeline code reside in GitHub; temporary Action exports have one-day retention at no cost.

**Next:** verify the 39 FSSP church coordinates and exact visitor entrances against official building data, normalize 74 conditional Mass rules, recheck effective dates and times, then open a separate *authorized publication* change. Do not attempt automatic map admission from this research PR.
