# Explore R60 — sourced place narratives and devotional handoffs

## Editorial ownership

A Place is an aggregation keyed to an existing canonical physical `place_id`. The **shrine and pilgrimage records remain the source of truth**, not the Explore screen. This release adds concise French versions of 20 shrine descriptions and 24 pilgrimage descriptions directly within `data/shrines/shrines-pilgrimages-seed.v1.json`. No new places, pins, feast-date rules, recognition decisions or traditional Mass site joins are created.

Three previously generic English entries (Lisieux, Assisi and Old Goa) were replaced with restrained concrete accounts anchored to the same site-specific official sources. For Assisi, its custody's official tomb page confirms the saint's grave in the Lower Church. The Government of Goa documents Saint Francis Xavier's relics in the Basilica of Bom Jesus. The Lisieux sanctuary publishes devotional pilgrim activities and a reliquary within the basilica. The French text is a faithful translation or limited editorial synthesis of the existing source-owned scope, not a new witness.

## Source-linked reading

The 20 in-focus sites now display an optional **Place reader** with individually evidenced chapters:

- The sanctuary: its source-owned origin or dedication
- Pilgrimage: sourced practice, procession, route or commemorative context; separate documented pilgrimages remain separate paragraphs
- Apparition, relic or tradition only if the original source record supplies its own French text and an original clickable source
- Prayer: a real canonical novena relation when one exists; the link to Pray does not purport to prove the prayer text is identical to that used locally
- Calendar: only semantic dates returned by Calendar; recurring pilgrimages with no fixed date retain their seasonal status
- Visit: site directions, with indicative pins still labelled and never presented as confirmed entrances

Every editorial narrative paragraph has at least one original **direct source link**, not merely a generic sources list. Unsupported and untranslated records remain accessible in the original lens's detailed records, but cannot be presented as complete French editorial passages. Single-category filters (e.g. relics or apparitions) must not silently fall back to an unrelated shrine account.

## Public copy safeguards

The former Novena context `note` strings are internal research commentary. Several referenced the app implementation and made negative scholarly caveats; they are **no longer exposed in place prayer cards**. Public cards instead show the prayer's name, a Pray action, and—where the bridge registry has an exact source—one original devotional association citation. The direct source remains inspectable.

Source relationships are scoped to exact Shrine or Place identity; the stories never infer Mass venues, travel times or local prayer-text equivalence from physical proximity.

## Acceptance

- All 20 major Place readers expose distinct French and English origin/pilgrimage paragraphs with record-specific original URLs
- The 24 French pilgrimage scope passages remain owned by their canonical records
- No internal development notes displayed publicly
- Novena links appear only for existing exact-ID relations and retain contextual evidence
- Calendar jump remains canonical, with no independent date calculation in Explore
- Actual mobile test checks original source links for 44px touch targets and verifies map canvas persistence
- The Bible Atlas #998 workstream must preserve these changes when integrating the shared Explore browser and reader.

## Background primary witnesses

- Sanctuary of Lisieux: https://www.therese-de-lisieux.catholique.fr/se-recueillir/temps-de-priere/
- Basilica of Saint Francis, tomb: https://basilica.sanfrancesco.org/en/explore-the-basilica/tomb
- Government of Goa, Basilica of Bom Jesus: https://www.goa.gov.in/places/basilica-church-for-churches/

The records' remaining provenance is held in `data/shrines/source-registry.v1.json` and their own `source_ids`.
