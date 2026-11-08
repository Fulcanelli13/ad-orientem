# Ad Orientem — Sacred Art Phase 51: photograph-ready production queue (2026-11-08)

**Research-only implementation.** No public-gallery, Prayer, Calendar, Home or photo-byte change. No Vercel. Source references are accessible through `data/artwork/phase51-photo-readiness-15-objects.v1.json`. To view the actionable priority order (without any network calls or downloads), run:

```sh
node scripts/art/phase51-photo-readiness.mjs
node scripts/art/phase51-photo-readiness.mjs --json
node tests/sacred-art-phase51-photo-readiness.mjs
```

## Objective and observed evidence

Convert earlier museum-object identity work into a concrete photo-quality work queue. Source cohort = **15 museum-identified physical paintings**, represented by **18 selected/handpicked photograph records**, including three twin-photo objects. The 18 `selected_short_px` measurements are inherited from the Phase 47 `selected_177_to_989_crosswalk.csv`; no new photo bytes were retrieved or visually assessed in Phase 51. The project proposes **1,200px short-side** as the resolution target for high-resolution app presentation, *not a legal or artistic-quality certification*.

**Result: all 18 selected files in this cohort fall below the 1,200px short-side target (478–1,147px). Zero replacement photographs are approved or deployed.** A larger image of the right physical painting is only a research lead until its exact source, photographic edition, reuse rights, quality and editorial status have been verified.

## First actionable painting queue (sorted by current worst selected image)

| Priority | Museum accession | Painting | Current shortest side | Image-source gate |
|---|---|---|---:|---|
| 1 | Bruges 1995.GRO0020.I | Pieter Pourbus, Last Supper | 478px | Art in Flanders: image-specific licence |
| 2 | Toulouse 2004 1 213 | Gabriel Blanchard, Purification | 627px | Eligible Toulouse LO2 object-image only, attribution |
| 3 | Toulouse 2004 1 75 | Jacques Stella, Marriage of the Virgin | 629px | Eligible Toulouse LO2 object-image only, attribution |
| 4 | Lille P.820 | Dieric Bouts, Paradise / Ascension of the Elect | 654px | Exact photographic edition rights pending |
| 5 | Toulouse 2004 1 296 | Pietro Ricchi, Saint Cecilia | 666px | Eligible Toulouse LO2 object-image only, attribution |
| 6 | Dijon 1938 E 332 | Alessandro Allori, Susanna and the Elders | 683px | GrandPalaisRmn commercial/editorial rights |
| 7 | Bruges 0000.GRO0110.I | Pieter Pourbus, Last Judgment | 696px | Art in Flanders image-specific licence |
| 8 | Strasbourg 44.2015.1.1 | Reynaud Levieux, Rest on the Flight into Egypt | 702px | Museum photo requires authorisation |

The other seven works remain in the machine-readable queue. The ranking is reproducible from the selected-photo metadata, with duplicated photos grouped by their physical object ID. It is not a ranking of artistic preference.

## Rights decision applied to each museum cohort

**Toulouse — plausible zero-cost first-party image route:** Musée des Augustins and the municipality provide images under Open Licence v2 when the individual photo and its rights qualify; files marked © or “droits réservés” are not freely reusable. Check the four specific image records before import. Credit: Mairie de Toulouse, Musée des Augustins and the relevant photo credits. Primary policy: https://collections.augustins.toulouse.fr/fr/open-data

**Bruges — do not treat public-domain painting as a CC0 museum photo:** Musea Brugge directs image requests to Art in Flanders. That service's ordinary CC BY-NC-ND licensing blocks commercial use and derivative transformations. Individual works may have other terms, so verify each rendition. Do not automatically import the IIIF response or substitute for a handpicked photo. Sources: https://www.museabrugge.be/en/collection/requesting_image and https://artinflanders.be/en/conditions-use-images-and-free-download

**Strasbourg — independently reusable photograph needed:** Museum-owned photographic content is explicitly not public domain under its own terms. Preserve the already handpicked Commons image while researching an independently usable photographic edition of the same accession. Policy: https://collections.musees.strasbourg.eu/en/legal-mentions

**Lille — source identity exists, but selected photos remain 654px and 674px:** Non-handpicked alternative Commons file https://commons.wikimedia.org/wiki/File:Dirk_bouts,_ascesa_degli_eletti_(o_paradiso_terrestre),_1450_ca.jpg is documented at **3186×4806px**. This is **not auto-admitted**, under the user's curated Commons policy. Investigate institutional-equivalent image/provenance and manually visual-QA exact source rights; keep selected versions intact.

**Dijon — avoid licence/fee workflow:** Musée Magnin's credited RMN imagery can have non-commercial reuse permissions, while commercial/editorial uses require different rights clearance. As the app may be monetized, do not import those restricted museum photographs. Seek properly reusable original editions instead, with their own photo-specific source licence. Policy: https://musee-magnin.fr/en/legal-notices-terms-use-and-credits

## What is genuinely implemented

- **`data/artwork/phase51-photo-readiness-15-objects.v1.json`**: all 18 selected photo page URLs, 15 institutional object IDs/accessions, measurements, source-policy gate, links to respective museum catalogues, repeated-photo object IDs, exact next action, and an explicit no-release flag.
- **`scripts/art/phase51-photo-readiness.mjs`**: offline deterministic CLI work-queue generator, sorted by resolution deficit, grouping 18 photo versions into 15 physical-object work items. It does not fetch, download, modify, publish or silently promote any candidate.
- **`tests/sacred-art-phase51-photo-readiness.mjs`**: policy test refusing missing source identities, duplicate records, release-ready claims, automatic substitutions, inaccurate image-resolution flags and unauthorised unhandpicked Commons promotion.
- The existing Phase 49/50 lineage is preserved: **989 operational groups**, **177 handpicked selected photos**, **14 verified cross-register relationships for 13 selected records**, **156 museum-identified selected records with no reliable 989-group link**, **eight identity holds**, **four within-177 physical-object duplicates**, **1,599 excluded rejected research records**.

## Next implementable photography step

For an actual photo replacement, select the specific painting (starting with the zero-cost Toulouse first-party LO2 route or rights-compatible alternative for the Bruges Last Supper), retrieve the source photograph bytes, verify its exact physical-object identity, check source-specific licence/attribution and release eligibility, visually compare colour/crop/fidelity against the owner-selected original, and stage the result for review. Do not automatically replace a selection or publish an unreviewed Commons image. This phase does **not** claim any photograph has been upgraded.

A complete publication count requires separate route-by-route rendered image checks across Home, Prayer, Calendar, Rosary, Angelus and other modules. The previous 16 registered module URLs returning 200 were not a comprehensive rendered painting census.
