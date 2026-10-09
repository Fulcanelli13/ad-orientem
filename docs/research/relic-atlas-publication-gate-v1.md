# Sacred Atlas: selection gate for major relics and pilgrim destinations

Status: **editorial shortlist, not an authentication decree or a published map import**.

## Three different questions

1. **Devotional reach of the saint** is sourced separately: scriptural/church-wide mission, transnational pilgrimage or religious-order devotion, national patronage, regional/diocesan cult, or as yet unassessed. This is neither a holiness score nor a popularity poll. A prominent saint can have hundreds of tiny fragments, but only one principal custody destination.
2. **Significance of the particular object and place**: bodily corpus, head/heart/notable part, historically important singular object, principal shrine, historically documented but incomplete or disputed body tradition, or minor/travelling fragment. The `2017 Instruction` calls a body or notable portion **significant** and a small fragment or direct-contact object **non-significant**; that is separate from the ordinary first/second/third-class vocabulary.
3. **Evidence quality of identity and custody**: current original custodian or ecclesiastical inventory, translated object with provenance, plausible ancient tradition, contested material identification, former custodianship, and no presently identifiable bodily remains. Relic claims are not authenticated by inclusion in the atlas.

Primary norms:
- Vatican 2017 relic authenticities: https://www.vatican.va/content/dam/wss/roman_curia/congregations/csaints/documents/rc_con_csaints_doc_20171208_istruzione-reliquie_en.html
- French 2017 text: https://www.vatican.va/roman_curia/congregations/csaints/documents/rc_con_csaints_doc_20171208_istruzione-reliquie_fr.html
- Vatican 2002 Directory on Popular Piety §§228–230: https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_fr.html

## Publication tiers

**WORLD_ANCHOR**: principal major relic custodian and documented substantial pilgrimage relevance, or an internationally significant special sacred object, with attribution qualified. This is a **recommendation**, not an automatic map pin.

**REGIONAL_ANCHOR**: regional or national patron's principal shrine/relic or important local custody. Discoverable at the appropriate map level, not treated as second-rate sanctity.

**HISTORICAL_ASSOCIATION / PILGRIMAGE_CONTEXT_ONLY**: notable historical tomb or sanctuary, but material is lost, moved, contested, or not known to be present. A pilgrimage pin may exist, yet the relic lens must not assert authentic body custody.

**PROFILE_FRAGMENT_ONLY / SOURCE_AND_OBJECT_HOLD**: small or travelling fragments, uncertain objects, multi-part collections lacking individual evidence, or custody sourced only to an insufficient account; no new relic map pin until review.

Existing canonical Places are reused; multiple saints sharing a basilica are **one site-level map marker**, not duplicated by individual saint or reliquary. `relic-atlas-site-selection.review.v1.json` supplies the curated saint-related decisions. `relic-exceptional-sacred-objects.review.v1.json` handles the Passion, Marian and extraordinary textile/holy-place traditions separately so these are not incorrectly called first-class bodily relics.

## Outstanding release gates

- For each **new** site: establish original institutional source actually describes the named relic, current custody and owner, suitable destination address, map coordinates and official visitor/pilgrimage page.
- For existing sites: preserve the current Place and avoid presenting more than one marker per Place; do not silently replace the shrine, apparition or historical-site lenses.
- Resolve duplicate or contradictory principal bodily claims (notably Benedict at Fleury/Monte Cassino, Magdalene at Vézelay/Provence) before claiming a single authenticated corpus.
- Verify first/second/third material, canonical authentication documents (if available), and whether an item is exhibited routinely or only exceptionally. Expositions (e.g., Aachen, Turin, Trier, Argenteuil) are not continuous display.
- Review 1962 *general versus particular* sanctoral calendars from original books separately. No automatic 1962 feast rank or Calendar entry is asserted by current devotional popularity.
- Expand beyond the **original 133 subject-priority research list**; it did not include every saint or sacred historical subject.

## Inspection

Run `node tools/atlas/report-relic-publication-shortlist.mjs` for the grouped totals, or append `--json` for site-by-site evidence source URLs, subject associations and release gates.

No data in this stage automatically rewrites `data/explore/sacred-phenomena-seed.v1.json`, `data/geography/seed-registry.v1.json`, or the active map projection. A subsequent explicitly approved implementation may publish screened new locations using the shared canonical Place registry.
