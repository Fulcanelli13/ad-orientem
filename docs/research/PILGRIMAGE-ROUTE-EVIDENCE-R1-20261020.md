# Pilgrimage route evidence — R1/R2, 20 October 2026

**Status: 17/20 documented route IDs with 64 published named-stage records; 0/20 routes with certified walking-line geometry.** All 240 underlying pilgrimage records and 20 canonical route identities are preserved.

## Publication boundary

- Canonical owners: `data/shrines/shrines-pilgrimages-seed.v1.json` and `data/shrines/source-registry.v1.json`. Named stages are a separate evidence overlay at `data/shrines/route-stage-evidence-20261020.v1.json`.
- Each stage records source document, edition and ordinal; `lat=null`, `lng=null`, `geometry_status=NAMED_UNMAPPED`. Thus 64 named locations **do not** mean 64 map pins or a GPS route.
- `PASS_THROUGH` marks streets, villages and forests passed through, not formal devotional stopping stations. The UI distinguishes source-reported stage count, organizer's meeting point, and true route terminus.
- Route lines must await an organizer-released edition-specific GPX/KML/GeoJSON or independently reviewed line with license/publication rights. Straight-line joins, estimated walks and automatching to Google routing are forbidden.

## Current stage coverage

| Route ID | Names | Primary published evidence | Edition / exception |
| --- | ---: | --- | --- |
| `route:FR:paray-pilgrim-path` | 4 | https://sacrecoeur-paray.org/parcours-du-pelerin-fr/ | Four on-site chapels; canonical shrine point does not geolocate La Colombière chapel |
| `route:FR:paris-chartres-pentecost` | 4 | https://www.nd-chretiente.com/pelerinage-chartres/pelerins-marcheurs/ | Saint-Sulpice, Choisel and Gas bivouacs, Chartres; three days, four named anchors |
| `route:US:walk-to-mary` | 4 | https://walktomary.com/our-path/ | Four named official joining points; external organizer's My Maps only, edition announced 2027 |
| `route:MU:pere-laval-saint-louis` | 2 | https://dioceseportlouis.org/informations-sur-le-pelerinage-au-caveau-du-pere-laval/ | 2026 Saint-Louis Cathedral to Sainte-Croix |
| `route:MU:pere-laval-saint-joseph` | 2 | https://dioceseportlouis.org/informations-sur-le-pelerinage-au-caveau-du-pere-laval/ | 2026 Saint-Joseph Terre-Rouge to Sainte-Croix |
| `route:US:lake-george-auriesville-restoration` | 2 | https://pilgrimage-for-restoration.org/arrival/check-in-thursday/ | 2026 Lake George Wood Park departure and Auriesville endpoint |
| `route:DE:preith-bettbrunn` | 9 | https://preith.bistum-eichstaett.de/wallfahrt/ | Includes seven forests, towns or areas passed through; none is automatically a prayer station |
| `route:BR:belem-cathedral-nazare` | 7 | https://www.ciriodenazare.com.br/noticias/diretoria-da-festa-de-nazare-apresenta-o-roteiro-das-14-procissoes-do-cirio-2026 | 11 October 2026 Círio Cathedral–Basilica procession, ordered streets |
| `route:FR:laghet-paillon-old-road` | 2 | https://sanctuaire-laghet.fr/pelerinage-du-doyenne/ | 20 May 2024, parish church of La Trinité to Laghet sanctuary; intermediate prayer halts unnamed |
| `route:FR:sainte-anne-chemin-nicolazic` | 2 | https://www.sainteanne-sanctuaire.com/?id_geoloc=209&langue=fr&mode=organiser_un_pelerinage | Starts at Maison Nicolazic; broad sanctuary-site endpoint only, booklet needed for internal circuit |
| `route:CA:canadian-martyrs-traditional` | 3 | https://ontario.sspx.ca/en/events/canadian-martyrs-pilgrimage-2026-transmitting-faith-next-generation-60303 | **26 September 2026:** St Ignace II at 1645 Rosemount Road is the actual start, Crystal Beach Park the lunch stop, Martyrs Shrine the relic-veneration finish. Canonical route name and origin corrected; later Mass at Sainte-Marie Park is a separate service, not a mandatory walking stop |
| `route:GB:ely-walsingham-lms` | 3 | https://www.lmschairman.org/2026/03/lms-walsingham-pilgrimage-booking-open.html | **27–30 August 2026:** Ely, Stoke Ferry campsite, Walsingham **Priory grounds**. Concluding Mass no longer at Catholic Shrine. Linked Catholic Shrine remains a related Place, not mapped edition terminus |
| `route:GB:holywell-church-to-well` | 2 | https://lms.org.uk/pilgrimages | LMS High Mass at St Winefride's RC parish church, followed by Rosary procession to the Well |
| `route:NL:winthagen-maastricht-sterre-der-zee` | 4 | https://olv-sintpieter.nl/3-10-2026-pelgrims-voettocht-sterre-der-zee/ | **3 October 2026:** Winthagen chapel, Schin op Geul church, St Gerlachus church Houthem, Maastricht Basilica; intermediate reflection stops |
| `route:MX:guadalajara-zapopan-romeria` | 10 | https://www.zapopan.gob.mx/v3/noticias/zapopan-prepara-el-plan-operativo-integral-para-recibir-la-romeria-292 | **12 October 2026:** municipal published sequence from Guadalajara Cathedral through Plaza de Armas, Exconvento del Carmen, Parque de la Revolución, Rectoría UDG, Glorieta Colón, Punto São Paulo, Plaza Patria, Arco de Zapopan to Basilica. Landmarks are pass-through, not prayer stations |
| `route:PT:braga-cathedral-sameiro` | 2 | https://santuariodosameiro.pt/santuario/pastoral-e-culto/peregrinacoes/ | Annual archdiocesan first-Sunday-of-June Cathedral–Sameiro walk. Do **not** confuse with emigrants' annual Bom Jesus–Sameiro procession |
| `route:US:amsterdam-auriesville` | 2 | https://www.ourladyofmartyrsshrine.org/featured-events | **17 October 2026:** official event identifies Amsterdam as starting town, NOT exact gathering point, and Auriesville Shrine as destination |

## Why three are held at zero ordered stages

1. `route:NG:nne-enyemaka-rosary-procession` — the FSSP source documents a recurring 30-km Rosary procession but does not publish identifiable start/finish waypoints or a prescribed directional path: https://www.fsspnigeria.org/pages/donate/associate-membership.php . The shrine coordinate cannot safely stand in for a walking loop.
2. `route:NZ:nga-tapuwae-russell` — the Auckland Diocese provides a **regional** suggested journey through Hokianga, ferries and Russell, including multiple numbered local subroutes and mixed driving/ferry modes. The published PDF is https://www.aucklandcatholic.org.nz/wp-content/uploads/2024/08/NGA-TAPUWAE-Route-Overview-1.pdf . It should be modelled as a grouped itinerary by region/mode, not coerced into one continuous walk ending at the St Peter Chanel shrine.
3. `route:US:great-meadows-doylestown-czestochowa` — the destination shrine confirms the pilgrimage identity but available official material has not established dated, named intermediate stops: https://czestochowa.us/en/ministries/6-pilgrimage . Request organizer route documentation before inventing stages.

## Required reconciliations

- **Walsingham canonical venue vs route endpoint:** Canonical `place:GB:walsingham-catholic-shrine` remains the related Catholic sanctuary, while the 2026 pilgrimage terminus is the Priory grounds. The overlay sets `destination_relation=RELATED_SHRINE_NOT_EVENT_ENDPOINT`. UI suppresses an exact "Show destination" action, warns clearly, offers the linked shrine as a related Place, and can show the shrine's wider regional map context without claiming it is Priory grounds.
- **Canadian Martyrs origin:** The canonical seed erroneously called Crystal Beach the start while the official 2026 schedule names St Ignace II as departure and Crystal Beach as a midday stop. Corrected the canonical route label and origin without changing its route ID or downstream linked place.
- **Sainte Anne / Paray anchors:** Broad sanctuary marker is not every individual interior chapel. Do not conflate a source-published liturgical itinerary with geocoded architectural elements.
- **Annual date scope:** Older published itineraries are historical evidence only, never live instructions. Sites with changing entry times, ferries, road closures or rights restrictions require current organizer confirmation before a navigable mode exists.
- **Rights:** External Google My Maps embeddings are links, not sublicenses; Wikidata, official maps and OSM may have separate reproduction/license conditions. Never copy geometry directly without review.

## Acceptance status

`tests/explore-pilgrimage-journey.mjs` asserts all **20 IDs**, **64 names**, **17** source-backed entries, zero coordinates and zero fabricated paths, bilingual stages, pass-through semantics, Walsingham venue separation and canonical Canadian start correction. `tests/explore-medallion-visual-acceptance.mjs` captures Chartres plus 2026 Walsingham warnings on 320/390/1440 px views.

**No walking polyline is published.** Work remaining: three route identities need better route-model evidence, and all 20 route geometries still require licensing and topological certification.
