# Worldwide Sacred Places — identity-first consolidation (15 October 2026)

**Status: research review only. Not publication, not approval of any apparition, relic authenticity, or local schedule.**

## Scope and objective

Build one reliable worldwide major-destination baseline before photos, lengthy historical introductions, or additional map effects. Reuse the existing 750-site R70 master and the canonical Place/Shrine owners; do **not** start an independent geographical catalogue.

Review evidence is in `data/geography/research/world-major-sacred-places-review-2026-10-15.v1.json` (**141 priority review cases**, drawn from Essential, multi-source and well-known subject families) with original candidate IDs and **13 collisions** where several candidate sites point to one published Place ID. Selection does not mean 141 individually certified places.

## Facts established in the current original-repository `main`

- 750 physical research candidates, 229 published physical Places, 225 shrine/heritage records, 211 pilgrimage destinations.
- Original R70 classification: 44 explicit promotion matches, 106 tentative name/ID matches, 600 without a validated identity link. These are *research matching statuses*; they cannot be used as a percentage of Catholic pilgrimage coverage.
- The priority heuristic itself needs correction. Međugorje has four discovery-source appearances yet is labelled Strong rather than Essential; several generic locally named shrines with zero cross-list evidence are Essential.
- Important **false missing flags**: the following are already published under the verified canonical IDs: St Peter's Basilica (`place:VA:saint-peter-vatican`), Church of the Holy Sepulchre (`place:PS:holy-sepulchre-jerusalem`), Church of the Nativity (`place:PS:nativity-bethlehem`), Basilica of St Francis at Assisi (`place:IT:basilica-san-francesco-assisi`), Croagh Patrick (`place:IE:croagh-patrick-murrisk-pilgrimage-base`). No second pin should be created. The Holy Sepulchre's candidate/Place country-code discrepancy is not justification for a duplicate.
- **Confirmed missing:** Međugorje is not in published `places`, `shrines`, `pilgrimages` or `apparitions` records, although it is candidate `SG-INV-0317`. Its church is locally identifiable through the official parish address and OSM way centre.
- **Wrong research links to correct:** Basilica of St Francis / St Clare / Santa Maria degli Angeli (Assisi); Catholic/Anglican Walsingham shrines; Guadalupe at Allentown/La Crosse and Zacatecas/Mexico City; Old Goa Bom Jesus/Se Cathedral; Montmartre/Paray-le-Monial; Rosario/San Nicolás; Armagh/Lough Derg; Zeitoun/Assiut; San Luca/San Domenico Bologna; Sainte-Chapelle/Notre-Dame Paris. Saint Charbel's shrine and Maronite monastery in Annaya require a more nuanced shared-complex decision, not reflexive duplication.

## First release priority: worldwide anchor sites without confirmed canonical links

**Immediately qualify the physical site and original sources**, then reuse or add a Place and a minimal category association. Do not pretend these are all definitely missing from the app merely because the automatic crosswalk failed.

- **Balkans**: Međugorje (Bosnia and Herzegovina) — confirmed missing. Core pilgrimage site independent of supernatural authenticity of alleged messages.
- **Italy / Eucharistic devotion**: Lanciano, Saint Anthony's Basilica in Padua, and Orvieto.
- **Central / Eastern Europe**: Máriapócs (Hungary), Levoča (Slovakia), Święta Lipka (Poland), Niepokalanów (Poland), Velehrad (Czechia).
- **Iberia**: Santarém Eucharistic shrine (Portugal), Caravaca de la Cruz (Spain); Zaragoza's El Pilar requires alias reconciliation, since a Basilica of El Pilar appears among live Place names.
- **Asia**: Sheshan (China), Santo Niño Cebu and Manaoag (Philippines), St Anne Bukit Mertajam (Malaysia), and House of the Virgin Mary at Ephesus (Türkiye).
- **Latin America / Caribbean**: Esquipulas (Guatemala), Caacupé (Paraguay), Suyapa (Honduras), Nuestra Señora de los Ángeles in Cartago (Costa Rica), El Cobre (Cuba).
- **Africa**: work through major national Catholic Marian/martyr shrines rather than selecting capital-city churches as automatic Essential examples.

These are initial priority identity cases, not an exhaustive country-by-country census. Include important local places once the worldwide core has an explicit disposition.

## Nomination and publication rules

1. **Nomination**: use the previously selected discovery collections—Destinationes, Wikipedia's Christian pilgrimage index (Catholic entries only), Catholic Journeys, 206 Tours—plus original diocesan, shrine, congregation or Vatican resources. Cross-listing supports editorial prominence but is not an absolute recognition gate.
2. **Editorial priority**: `WORLD_CORE` (globally major); `NATIONAL_MAJOR` (national/continental importance); `REGIONAL`. Importance of a pilgrimage does not prove supernatural events.
3. **Publication minimum**: unique physical site ID, original name and useful aliases, country/locality, source URL proving site identity, defensible place/complex-level coordinates with precision, category labels, and explicit current custody / ecclesiastical qualification where relevant.
4. **Relics**: record veneration and documented custody separately from authenticity. One monastery holding several saints' relics remains one physical pin.
5. **Apparitions**: distinguish approved/recognised devotional site, `nihil obstat`, unapproved alleged apparition, and formally negative judgment. **Međugorje**: the DDF's 19 September 2024 *nihil obstat* permits public devotion but does **not** declare the alleged supernatural apparitions authentic. [Original DDF note](https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2024/09/19/240919d.html).
6. **Site components**: Međugorje St James parish church, Apparition Hill and Cross Mountain are distinct visit locations; keep a single destination parent with justified sub-site records rather than duplicating the shrine as three competing main entries. [Official parish](https://www.medjugorje.hr/en/contact); [prayer sites](https://medjugorje.hr/en/prayer-sites).
7. **Coverage closure**: every nominated world-core/national-major site eventually receives one explicit disposition: `LIVE_VERIFIED`, `NEW_PUBLISHABLE`, `RESEARCH_HOLD`, `OUTSIDE_CATHOLIC_SITE_SCOPE`, `ALIAS_OF_VERIFIED_PLACE`. No silent candidate loss.

## Customs: repurpose; do not destroy

The Customs Atlas is a poor default geographical lens for devotional and liturgical customs. Stop expanding that map. Preserve the original SOT-07 and SOT-07G claim-level provenance and the current 13 customs / 71 attestations.

Rehome every historical or devotional custom according to original owner:
- seasonal feasts/processions and date-bound traditions → **Calendar / Liturgical Year**;
- popular devotions and novena variations → **PRAY / Novenas**;
- explanatory cultural and devotional histories → **Formation → Catholic Life & Traditions**;
- customs observed at a specific sanctuary → **existing Place or pilgrimage profile**;
- ritual gestures during 1962 Mass → **Mass Guide / local custom profile**, distinctly non-normative.

Only after routing/links are tested should the standalone *Customs Atlas* screen/shortcut be removed. Do not delete sourced research or convert regional customs into false single-point map markers.

## Explicit next actions

1. Resolve all 13 candidate-ID collision cases. Only physically identical buildings/complexes may share a canonical pin.
2. Correct existing R70 false unresolved statuses for the five verified existing Sites and the obvious Zaragoza alias; preserve audit history.
3. Publish Međugorje once proper cross-dataset Place, Shrine, Pilgrimage and qualified apparition relations pass regression tests; do not apply a photo or long description gate before pin coverage.
4. Review the remainder of the 141 priority cases in large regional batches, escalating source quality only where pin identity is genuinely ambiguous.
5. Review the other 609 R70 candidates, expressly closing national-major candidates before calling the worldwide map coverage complete.

**No product data, UI routes, custom records or publication gates are changed by this research-only file.**
