# Catholic customs registry — French regional evidence and high-similarity action triage (23 October 2026)

## What was completed on the shared research branch

This research wave broadened the unified source/detail register while keeping it separate from published Ad Orientem customs and the existing Calendar.

The unified catalogue contained **1,799** observations/detail rows after the separate Chaney 170-observation intake. **127** French national cultural-heritage source details have been added for a total of **1,926 indexed research source/detail rows**. They are **not 1,926 historically distinct customs**. The earlier **408 provisional Handbook action groups** and **56 working master identities** remain unchanged and potentially overlapping. No new historical distinctness is certified and no app custom is published.

The concurrent Mueller second-pass **100 annotations overlap the original 122 Mueller observations** and are explicitly **not added** to the 1,926.

## 1. Source-located regional inventories (127 details, two complexes)

**France, Brittany:** *Les pardons et troménies en Bretagne* (2020), National Intangible Cultural Heritage Inventory / PCI-Lab HTML witness <https://www.pci-lab.fr/fiche-d-inventaire/fiche/396>. The initial source action pass holds **71 stable IDs** with source URL and line locators:

- 30 contemporary ethnographic descriptions of chapel and route preparation, saint banners, relics, fountains, and pilgrimage actions;
- 14 historically reported practices including processional variations and penances;
- 13 blessings and liturgical components requiring independent authority verification;
- 9 reported folk-belief actions **not endorsed** as Catholic sacramentals;
- 5 civic/festival components which are **not independent devotional customs**.

The French ministerial PDF is also available: <https://www.culture.gouv.fr/Media/Thematiques/Patrimoine-culturel-immateriel/Files/Fiches-inventaire-du-PCI/les-pardons-et-tromenies-en-bretagne.pdf>. This inventory describes variations on the **pardon/troménie tradition**, not seventy-one autonomous practices.

**France, Basque Country:** *Fête-Dieu au Pays Basque : Besta Berri*, French intangible heritage inventory (2018) / PCI-Lab text <https://www.pci-lab.fr/fiche-d-inventaire/fiche/314-fete-dieu-darmendaritz-fete-dieu-au-pays-basque-besta-berri>. **56 stable action/variant IDs**, with particular villages where the text names them:
- 27 contemporary components of the Corpus Christi celebration and procession;
- 12 secular escort, music, or festive-guard actions;
- 6 material and physical preparation actions;
- 10 historical testimony and village variants;
- 1 contemporary local Mass-music usage **not inferred to be an authentic 1962 Roman rubric**.

These 56 source details describe one rich Basque Besta Berri ceremonial complex, not fifty-six new Catholic customs.

Artifacts:
- `data/customs/master/france-2020-breton-pardons-pci-regional-detail-pass.v1.json`
- `data/customs/master/france-2018-basque-besta-berri-pci-detail-pass.v1.json`
- Both are separately indexed in `data/customs/master/comprehensive-customs-working-catalogue.v1.json`, with complete 71/56 crosswalk IDs.

## 2. Action-level label review (105 comparisons, no merges)

The pre-existing Mueller/Kelly automated token retrieval worklist contains **380 cross-source lexical candidate links** across 204 newly indexed source-action rows. Its **top 105** were individually assessed for action/feast distinction **using action labels and existing catalogue descriptions only**. Original witness passages were not independently compared in this particular reconciliation step.

| Reversible triage class | Label-level matches |
| --- | ---: |
| Close action relation, source provenance undecided | 46 |
| Related component or possible variant, not equivalent whole practice | 38 |
| Different action/feast: misleading lexical similarity | 21 |
| **Total reviewed** | **105** |

**275 remaining lexical suggestions** have not been individually triaged in that worklist. **Zero** practices certified identical; **zero** source independent corroboration claims; **zero** automatic merges. Examples of false matches include Easter rather than Epiphany holy water; Advent wreath rather than Candlemas candles; Christmas gifts rather than Confirmation gifts. Other pairs genuinely resemble the same action but may be derivative of an earlier author, not independently attested.

Artifact:
- `data/customs/master/mueller-kelly-top105-curated-label-level-triage.v1.json`

The 24 separately reviewed Chaney candidate pairs, and Mueller's 100 second-pass annotations, are preserved from the concurrent branch without double counting.

## 3. Independent regional source acquisition — what is not yet a verified row

Created `data/customs/master/irish-italian-french-primary-acquisition-queue-20261023.v1.json` with **13 discovery/accession leads**:
- eight identifiable folios from **Ireland's 1930s Schools' Collection**, with exact CBÉS volume/page references from indexed transcript listings (Brigid crosses, St John's Eve fires, Christmas candles, Epiphany/Easter holy water). Individual manuscript detail verification has **not** been completed; some original pages lead to access-protection and the indexed extract should not be described as an exhaustive reading.
- four distinct Italian city-festival historical source leads from the UNESCO/Italian Ministry dossier, **Nola, Palmi, Sassari, Viterbo**. Those are real geographically distinct celebrations but a modern UNESCO dossier alone does not verify their 1962 observance or precise history.
- France's *La Sanch* Good Friday penitential confraternity inventories for a next full-page research pass.

**These 13 leads do not add 13 source-detail rows or 13 certified distinct customs.**

## 4. Validation and release separation

Extended `tests/customs-full-registry-census.mjs` to assert all 127 French source-detail IDs, complete 105-triage review membership, web locator presence, classification consistency, master accounting **1,926**, zero new certified practices, no published content. Legacy test expectations of 1,799 now compare against the new master count.

The draft research branch remains stacked over its existing research base. No Ad Orientem Calendar, Mass LIVE/Missal, prayer texts, Roman Ritual source of truth, UI, or production customs were changed.

## Recommended next source wave

1. Read the 13 queued Irish/Italian/French works in full when accessible. Prioritise **multiple independent Irish CBÉS school districts** and the French La Sanch confraternity with original textual and calendar chronology.
2. Continue source acquisition in **Italian**, including local cathedral/confraternity archives for four distinct UNESCO-noted festivals.
3. Work through **275** remaining Mueller/Kelly retrieval hints in high-volume but keep full source passage identity verification separate from short-label triage.
4. Only create verified distinct practice identities after action/occasion/region/period and source lineage align. Regional variant counts should be separate from distinct core customs.
5. Preserve stable IDs and zero publication until research corpus is broader and distinct-custom identity audits actually pass.
