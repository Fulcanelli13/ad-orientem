# Sacred Places P24 — first larger map-first worldwide release

**Date:** 24 October 2026. **Status:** proposed via PR, not yet merged.

## Coverage and throughput

Of **18** individually sourced, named Catholic physical features audited in this release, **two** already existed as frozen canonical Places: the Covadonga basilica and Santa Cueva. Their existing IDs and original OSM geometries are reused rather than introducing duplicate map markers.

The **16 new unique Places** are a geographically diverse cohort, not 16 extra variants of existing places. They span **14 country codes**, including Argentina, Slovenia, Croatia, Philippines, France, Slovakia, Mexico, Spain, Italy, Peru, India, Germany, Palestine/East Jerusalem and Mauritius.

| Owner | Main P23 baseline | P24 proposed |
| --- | ---: | ---: |
| Canonical physical Places | 371 | 387 |
| Typed identity source records | 669 | 685 |
| Heritage crosswalk records | 371 | 387 |
| Places without optional heritage category owner | 112 | 128 |
| Geographic areas | 141 | 141 |
| Verified Directory–Place links | 9 | 9 |
| Original P16 identity/title holds | 16 | 16 |

The records contain only an exact geographic name and type, country/locality, mapped OSM building (or explicitly identified devotional monument/monastery precinct), site-level precision and provenance plus one institutional Catholic identity source. No extra institutionally redundant map-source record, photography, history, EN/FR long profile or Mass Times bridge is mandatory.

## Physical identity distinctions

- **Covadonga**: both basílica and Santa Cueva were already canonical under two separate IDs, and thus generated zero newly published records.
- **Itatí**: the existing Basilica building, not the adjacent parish church.
- **Litmanová**: identified Greek Catholic Zvir Chapel, not the village parish and not Marianka; retained genuine Eastern Catholic identity.
- **Gaboltov**: mapped church of Saint Adalbert; not the unrelated Marianka tourism URL formerly inherited.
- **Peñafrancia**: the present Naga Minor Basilica is distinct from the Old Shrine; only the specifically mapped basilica is included.
- **Conques**: Abbey Church Sainte-Foy, not the distant small chapel with the same dedication.
- **Chapi**: named Church of Our Lady of Candelaria, separate from the greater pilgrimage grounds.
- **Vallarpadam**: actual basilica polygon, not nearby redundant mapped worship nodes.
- **La Verna and Maria Laach**: mapped to Catholic monastic precincts as `monastery` with `complex_anchor` precision; no false claim of one particular chapel doorway.
- **Gethsemane**: actual Franciscan Church of All Nations, separate from Gethsemane Garden and Grotto; the original P21 country label was IL, whereas the established geographic grouping of the mapped East Jerusalem/West Bank site here is PS. No inference about sovereignty.
- **Marie Reine de la Paix**: physically mapped Catholic devotional sculpture in Port-Louis, typed `pilgrimage_destination`; no unsupported claim that the landmark is a church building or that the wider sanctuary's legal boundary is geocoded.

## Safeguards

The minimum publication gate from P22 and the live release ledger from P23 remain mandatory. All old physical IDs and typed provenance preserved; no new Directory bridge, current TLM schedule, relic, apparition approval, calendar programme, rights-cleared photo or historical exception closure. Each new Place has one unique typed identity source and an attributed exact OSM reference.

Use `npm run test:sacred-places-p24` plus the full geography, shrine and required main checks. Only count new Places in the live baseline once this PR merges.

**Next:** continue the first-200 research lane and source-specific map checks for candidates not yet represented by a unique Catholic physical feature. Larger lead-screening volumes must remain distinct from actual admission.
