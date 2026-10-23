# Customs Registry — Elsa Chaney source intake and identity triage (23 October 2026)

## Executive record

This research-only source batch added **170 source-located observations** from *The Twelve Days of Christmas* (Elsa Chaney, Grailville Writing Center, Liturgical Press, 1955) and screen-routed all 170 against earlier research and source labels. It does **not** add 170 verified distinct customs, validate blessing rubrics or publish anything in Ad Orientem.

- Total source/detail working catalogue increased from **1,629 to 1,799 rows** (not 1,799 customs).
- Pre-existing **408 provisional action groups** remain unchanged and may overlap each other and the **56** prior master identities.
- **170/170** Chaney source-action descriptions have independently worded action labels, stable IDs and page-independent **EWTN HTML line locators**.
- Full [EWTN online transcription](https://www.ewtn.com/catholicism/library/twelve-days-of-christmas-10410) inspected for the targeted descriptions. Text explicitly gives 1955 copyright and May 25, 1955 imprimatur (web lines 89–101). The printed pages, book-kit images and musical scores were **not** directly examined. **Do not invent original printed page numbers or treat web transcription as a facsimile.**
- **90** author recommendations/adaptations; **52** described practices; **7** home liturgical-text adaptations; **9** ritual/minister authority questions; **6** historical/comparative claims; **5** author/Grailville first-person examples; **1** explicitly attributed second-author example.
- Individual actions from one paragraph may have separate IDs for reversible component review. Every one remains **SOURCE_OBSERVATION_UNVERIFIED_DISTINCTNESS_OR_VARIANT**.

## Provenance and meaning

This is a distinct **1955 publication by Elsa Chaney**, not one of the already catalogued Weiser, McLoughlin, Stokes, Mueller or Kelly works. Chaney's Grailville account, though, cites or draws on other authors (including Mueller) and repackages traditions. The appearance of a practice in this book **does not automatically provide an independent attestation** of the same practice in the other author's work. Reported local actions, historical claims, instructions for making crafts and new suggested adaptations were given separate source claim types.

An imprimatur on a historical booklet does not validate every household blessing as the Church's approved Roman Ritual formula. In particular, Chaney's lay-led Christmas tree blessing, domestic crib blessing, adapted Saint John wine prayers, Holy Innocents father-led blessing and Epiphany home water/chalk ceremony require precise distinction between official rites, domestic prayers and lay adaptations before liturgical/legal use. No such claim was upgraded.

**Text-access/licensing boundary:** no recipe, play, prayer, image, hymn or source passage was reproduced at length. Source-action labels are brief original paraphrases with locators, and the full source remains linked.

## Nonmerging high-volume relation screening

`data/customs/master/chaney-1955-170-cross-source-nonmerging-candidate-review.v1.json` compared all **170** Chaney observations against **490** prior labels (56 working master identities, 408 provisional groups, 26 McLoughlin source families) and **604** prior separately indexed other-author source observations. It contains **380** lexical lookup hints: **50** rows have a candidate prior research group, **103** have at least one prior source-observation hint, and **65** have no label-based hint at all.

**Warning:** these three row counts overlap, and lexical hints can be nonsense. No-hit does not mean unique. Nothing was merged.

### 24 manually classified label/action relationships

`data/customs/master/chaney-1955-action-description-24-manual-relations.v1.json` preserves 24 labeled comparisons with original Chaney text line and the prior record ID/description:

| Review decision | Pairs | Example |
| --- | ---: | --- |
| Same described core action (not verified historical identity) | 12 | Jesse Tree salvation-history ornaments; German Stollen; Magi figure progression; Saint John wine blessing; Epiphany chalk |
| Specific component of a related action | 2 | Family Posadas adaptation; candles in Nativity crib procession |
| Ritual preparation distinct from subsequent action | 1 | Blessing chalk versus applying a door inscription |
| Same proposed lay activity, ecclesiastical authority uncertain | 1 | Family Christmas tree blessing |
| Clearly different actions with coincidental words | 6 | Posadas versus Latin American pastry; table straw versus hanging straw crowns; Christmas cards versus reliquary displays; Holy Innocents candles versus Advent wreath |
| Related occasion but different primary action | 2 | O antiphon singing versus opening Advent House windows; waking for Midnight Mass versus post-Mass reveillon |

These are **action-description relationships**, adjudicated against Chaney's located text and prior label-level descriptions, **not complete two-witness original-page source verification**. All 24 records explicitly deny historical identity certification, independence of witnesses, equality of regional variants, Roman Ritual authorization and publication.

## Source coverage and next high-volume gates

The Chaney witness covers late Advent through Epiphany, not the whole annual cycle. Add fresh original/archival sources for **Lent, Holy Week, Easter, Pentecost, Assumption, All Souls, patronal feasts, marriage and death** to counterbalance the Christmas-heavy author base. Primary historical printed editions and regional archival witnesses deserve higher weight than later reused compilations; multi-author secondary collections remain available for discovery only.

1. Keep **source observations** distinct from **action identities** and **variants**, and keep regional/historical/context/belief/ritual/legal status at a separate evidence gate.
2. Screen future full texts in **100–200 action records per batch**, aiming for 300–500 acquisition leads in discovery, while retaining stable IDs and immutable source references.
3. Use the 24 reviewed pairs as explicit negative and positive **reversible action-description relation examples**. Build action/occasion/object/actor/region/period facet comparison so obvious false lexical hits are suppressed.
4. Require original-witness agreement and provenance independence verification for any eventual promotion into a unique Catholic custom identity. Do not infer global distinctness from the absence of matches.
5. Keep research independent of Ad Orientem Calendar, Mass, prayers, UI and publication policy; the pre-existing Calendar is authoritative.

## Committed work

- `data/customs/master/chaney-1955-twelve-days-christmas-ewtn-source-intake.v1.json`
- `data/customs/master/chaney-1955-170-cross-source-nonmerging-candidate-review.v1.json`
- `data/customs/master/chaney-1955-action-description-24-manual-relations.v1.json`
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json`
- `tests/customs-full-registry-census.mjs`

CI must pass on the **current commit**, not a preceding successful build. The prior commit before this batch had passed all three workflows; no merge or publication is authorized by this research report.
