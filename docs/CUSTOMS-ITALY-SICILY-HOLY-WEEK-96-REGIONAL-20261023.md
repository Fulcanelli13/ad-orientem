# Italian regional Catholic customs — Sicilian Holy Week source research (23 October 2026)

## Parallel-lane nonduplication

This batch belongs to the **Italian regional diocesan/municipal research lane**, intentionally *not* to the parallel English-speaking household-book pipeline. Before extraction, PR #1572 already held 110 source details from four UNESCO processional cities: **Nola (30), Sassari (41), Palmi (18), Viterbo (21)**. None of those records, works, witness pages, or labels was reindexed here.

Instead, this batch extracts **96 source-located research action/detail rows from 12 webpages** about **three other Sicilian Holy Week complexes**: **Enna (48), Trapani (20), Caltanissetta (28)**. These are real locality-specific action descriptions, historical testimony, materials, dramatized scenes, procession segments, and several civic or liturgical contexts. It would be misleading to call them 96 independently verified customs.

## Source family 1: Enna — 48 regional details

Directly reviewed the official **Comune di Enna** municipal historical overview and the 2024 Palm Sunday, Monday, Tuesday, Wednesday, Thursday, Good Friday and combined Easter/In-Albis event pages.

- `https://www.comune.enna.it/eca/festa/Settimana%20Santa`
- `https://www.comune.enna.it/vivere-enna/eventi/Eventi-culturali/17/DOMENICA-DELLE-PALME`
- Event page numbers **18–22** and **24** under the municipality's `/vivere-enna/eventi/Eventi-culturali/` path, all explicitly stored in each source record.

Selected action distinctions: annual confraternity `Ura` devotion visits to the Cathedral (16 guilds over Palm Sunday–Wednesday); dramatized Entry into Jerusalem; Ecce Homo stop near the Addolorata; Good Friday aggregation of processions and veneration of the Marian fercolo; the cemetery blessing with a Holy Thorn relic; the Easter `Paci` encounter and subsequent `Spartenza` separation; growing wheat at Holy Thursday devotional displays.

**Chronological exception:** the municipal webpage titled `Domenica in Albis` includes both Easter Sunday `Paci` and the later return/field-blessing `Spartenza`. It is **not a clean liturgical calendar source**. Three records explicitly say “verify schedule”; no assumption is made that both ceremonies occur on the same Sunday or conform to 1962 rite. The 2024 municipal event pages evidence **that programme only**, not century-long annual practice.

## Source family 2: Trapani — 20 regional details

Three online sources:

1. Local traditions archive `https://www.misteriditrapani.it/le-madri-pieta/`, describing Tuesday `Madre Pietà dei Massari` and Wednesday `Madre Pietà del Popolo`, the `annacata` rocking, overnight vigil, historic `tocco` custody game (pre-1934), and the candle exchange marking peace between rival custodial groups.
2. `https://www.diocesi.trapani.it/accompagnare-la-pieta-popolare/`, **2019 diocesan pastoral guidance**: respect religious/civic event distinction, recognize `annacate` and locally sung devotional practices, discourage certain `girate` and oppose bringing back hooded penitents. **These are 2019 disciplinary/pastoral positions, not requirements of the 1962 Roman Missal.**
3. `https://comune.trapani.it/novita/settimana-santa-2024-firmata-lordinanza-che-disciplina-il-divieto-di-vendita-e-somministrazione-bevande-alcoliche/`, municipal 2024 evidence for several named processions. This confirms occurrence/programme, **not source independence** from local community descriptions.

The Pietà images and guild roles, historical custody practices, route stops and present-day diocesan restrictions must be kept separate from the `Misteri` Good Friday procession itself.

## Source family 3: Caltanissetta — 28 regional details

Official municipality 2025 edition:

`https://www.comune.caltanissetta.it/it/news/settimana-santa-di-caltanissetta-2025-la-passione-di-cristo-nei-riti-della-tradizione-nissena`

Documented subcomplexes: the flower-covered `Gesù Nazareno` Palm Sunday platform and late-nineteenth-century figure change; two-part `A Scinnenza` Passion dramatization; `Real Maestranza` craft confraternity's 1848 changes and city-key handover; Wednesday `Varicedde` small Passion tableaux (19 in the 2025 municipal report) versus Thursday `Vare` main ensembles (16 in that document); the late-1960s shift from shoulder bearing to carts; and Good Friday `Cristo Nero`.

Caltanissetta's cave discovery of `Cristo Nero` is explicitly an **origin legend**, not historically proven fact. Sculptural scenes are not 19 new practices; and 2025 scheduling, procession sizes, guild presidency and stage form cannot be projected back unchanged to the 1962 era.

## Accounting and exact evidence level

| Metric | After this research wave |
|---|---:|
| Previous unified workbench source/detail rows | 2,247 |
| Enna source observations | +48 |
| Trapani source observations | +20 |
| Caltanissetta source observations | +28 |
| **Unified research source/detail rows** | **2,343** |
| Historic distinct Catholic customs newly certified | **0** |
| Provisional Handbook practice groups | **408 unchanged** |
| Earlier overlapping working master identities | **56 unchanged** |
| App/Calendar/publication changes | **0** |

**Important:** these are 96 short paraphrased observations with *specific URL and source-displayed HTML line* metadata, **not scans of 12 original seventeenth-century archives**. Overlapping municipal programme and local devotional accounts do not automatically become independent historical corroboration. Genuine manuscript and liturgical-authorization research remains a separate release gate.

## Artifacts

- `data/customs/master/italy-sicily-enna-trapani-caltanissetta-holyweek-source-actions.v1.json` — 12 online documentary witnesses, 96 noncanonical source-detail IDs with action categories, locality, period and source links.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — all 96 integrated as source observations, preserving established group IDs and raising total to 2,343.
- `tests/customs-full-registry-census.mjs` — ID/reference nonloss, 48/20/28 locality count, source index validity, zero promotions, count preservation.
- This report documents the anti-duplication lane, witness scope and ambiguous feast boundaries.

## Next nonoverlapping Italian research

Focus on genuinely distinct original **Sicilian historical confraternity statutes, diocesan archives, regional REIS inventory manuscripts**, and pre-1962 festival reports before expanding the material variants of these three celebrations again. Also expand geographically to regional saint days not yet covered by the UNESCO four or Holy Week three, rather than keep fragmenting known festival tableaux.

We will **not** implement a new Calendar or directly publish historic rite instructions into Ad Orientem. The research register should later supply context-sensitive entries to the **existing** Calendar after identity, edition, date, devotional-appropriateness and ritual-authorization gates.
