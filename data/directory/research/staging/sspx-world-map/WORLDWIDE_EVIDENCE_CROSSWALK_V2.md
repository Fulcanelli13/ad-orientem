# SSPX world-map — evidence crosswalk (9 October 2026)

This is a bulk second-pass **research review**, not a registry publication. It joins all 210 Sunday-badged source identities that were heuristically unresolved in PR #493 to the existing 336 approved official-map geolocation links from PR #477, and compares their locality to all 576 SSPX Mass-evidenced snapshot records.

## Results

- All **336/336** earlier approved official place links rejoin to the 941 official HTML-index identities.
- Of the **210** initially unresolved Sunday identities, **30** are already linked by an official source slug to an existing registered venue; **85** have city-matched registered candidates requiring physical deduplication; **95** lack a strict same-locality registry candidate and require source-detail inspection. No automatic publication.
- The **41** previously geolocated Mass records now without an HTML Sunday badge are an acquisition/snapshot inconsistency, not evidence that public Mass stopped.
- PR #477 reports an API acquisition of **942** entities (**655** Sunday-labelled); PR #493 recovered **941** entities (**577** with rendered-HTML Sunday badges). Run item-level API↔HTML diffs before interpreting the delta. The existing 336 approved links are strong evidence of previously reviewed entity identity, not permanent certification of timetable accuracy.

| District | Initially unresolved | Previously source-linked | City-only candidates | No city candidate |
|---|---:|---:|---:|---:|
| poland | 34 | 9 | 14 | 11 |
| mexico | 23 | 0 | 7 | 16 |
| australia | 22 | 5 | 9 | 8 |
| asia | 18 | 7 | 3 | 8 |

## Mexico district review

The first-party district listing at https://fsspx.mx/es/capillas-2 gives a Sunday Mass or Sunday-labelled site for **23/23 Mexico-district unresolved source entries**. Seven have a same-locality record requiring name/address deduplication. The remaining 16 lack a matching registry locality. Of these, **10 have explicit street addresses and official district evidence** (Aguascalientes, Chilapa, Ensenada, Morelia, Cuernavaca, Corregidora, San Ignacio Cerro Gordo, San Luis Potosí, Toluca and Zacatecas). Those ten are annotated individually in `worldwide-evidence-crosswalk.v2.json`, including the public first-party link and a faithful schedule-note transcription. They are strong candidates for the next controlled Mass-record addition, **not** 10 newly added venues in this branch.

Six more Mexico-district cases (Cancún, Jalapa, Mérida, Oaxaca, Veracruz and Havana) have city-level evidence but insufficient street-location precision for automatic mapping.

**Conflicting source schedule:** Aguascalientes has 4th Sunday 17:00 on the district aggregate list but 3rd Sunday 17:00 on the individual page at https://fsspx.mx/es/mision-nuestra-senora-la-asuncion-aguascalientes-33405. Mark the time disputed; do not publish a fixed 2026 Mass time without a local update.

## Controls and next batch

Do not conflate an official district Sunday badge, an individual Sunday schedule, an official CRM identity, a physical building, or an approximate locality coordinate. Use direct address and first-party Sunday evidence to promote true new venues; compare street addresses and map CRM IDs before adding a second venue in an already represented city.

The current registry remains at **1,411 source rows, 1,174 Mass-evidenced rows, including 576 SSPX**. This review intentionally changes none of them. Next controlled insertion batch is the ten street-addressed Mexico candidates, after case-level source/duplicate review; then investigate the 95 remaining no-locality cases and the 41 Sunday-label disagreements.

Sources: https://github.com/Fulcanelli13/ad-orientem/pull/477 ; https://github.com/Fulcanelli13/ad-orientem/pull/493 ; https://fsspx.mx/es/capillas-2
