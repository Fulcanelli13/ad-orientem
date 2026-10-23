# Catholic Customs Research — Portugal PCI four inventories, 140 sourced details and 28 relation checks

**Research branch:** research/customs-full-registry-census-20261023. **Date:** 23 October 2026 (Mauritius, October 24 local). **Status:** draft research, NOT Calendar or ritual publication.

## Why this batch matters

The preceding registry had extensively screened American family-practice guides and European major Catholic festivals. This batch adds directly consulted and source-located **Portuguese national intangible heritage inventory** documentation, including ordinary household/neighbor Epiphany acts, parish-to-house Easter visits and the living Lent tradition of praying/singing for the dead. It is not another index of the same family guide and is geographically separate from concurrent Italian, French, Irish, and Spanish research.

| National inventory | Municipality/region and source scope | Newly indexed action/details |
|---|---|---:|
| [INPCI_2022_004](https://matrizpci.patrimoniocultural.gov.pt/InventarioNacional/DetalheFicha/525?dirPesq=3) | Braga: Lenten Lausperene, Holy Week processions, Marian Sorrows and Easter Compasso | **49** |
| [INPCI_2015_003](https://matrizpci.patrimoniocultural.gov.pt/InventarioNacional/DetalheFicha/293?dirPesq=3) | Entre-os-Rios: Endoenças, Passion images and sermon, households, river lighting and Easter Compasso | **32** |
| [INPCI_2021_002](https://matrizpci.patrimoniocultural.gov.pt/InventarioNacional/DetalheFicha/539?dirPesq=3) | Alenquer: *Pintar e Cantar dos Reis*, house paintings, singers, variants and later charitable gifts | **42** |
| [INPCI_2023_015](https://matrizpci.patrimoniocultural.gov.pt/InventarioNacional/DetalheFicha/763?dirPesq=3) | North/central Portugal: women’s polyphonic singing, including the Lenten *Encomendação das Almas* | **17** |
| **Total** | **Four heritage inventory documents, encompassing multiple local behaviors and variations** | **140** |

All 140 rows in `data/customs/master/portugal-four-pci-lent-easter-epiphany-local-details.v1.json` have stable `PT-PCI26-[B|E|A|V]-###` IDs, the original Matriz PCI record identifier and HTML extracted line, brief separately worded action label, action/rite classification and a verified scope boundary. **No printed archival folio is inferred** from HTML line labels. Multiple steps in one inventory are *components*, not independent practices or independent witnesses.

## Research distinctions and source reliability

**Braga:** Lenten *Lausperene* is a scheduled Eucharistic adoration observance over multiple churches and days. It is not the same as the Holy Thursday custom of visiting repositories. The Corpus of Braga's unique liturgical **Bracarense rite** must not be imported as an authorized variant of Ad Orientem's existing 1962 Roman Missal: it has its own rites and historical status. Older and later forms of the *Burrinha* procession also differ; the contemporary Holy Wednesday narrative pageant is not the same category as the priest-led Holy Thursday and Good Friday ceremonies.

**Entre-os-Rios:** Household cleaning, lights facing the rivers, special Easter food, fulfillment of vows, the Thursday Encounter and Good Friday funeral procession, and Easter cross visiting are described separately. Historically the procession used boats, more recently the bridge. Those are chronological changes in a LOCAL action, not two customs. Household Pascal cross reception is not merely a secular Easter social visit.

**Alenquer:** Local Reis singers and painters paint house walls using pigments and locality-specific hearts, vessels, Magi stars, inscriptions and five wounds symbols; they sing various doorstep or central-square chants on the night of 5–6 January. Painted wall designs **are not automatically the Catholic ritual of blessing Epiphany chalk**; the public heritage inventory includes social symbols and changes in gender participation over time. The later collection of gifts may fund Mass intentions for the departed. The 42 lines are different details under a distinct local practice complex, not 42 independent customs.

**Lenten souls singing:** The women’s polyphonic-singing inventory covers secular agricultural work and concerts as well as religious singing. Only explicitly religious local contexts (the Lenten *Encomendação das Almas*, New Year or patronal Mass contexts) count as potential Catholic custom research. The general techniques of voice leading and transmission are **context/skills**, not Catholic rituals.

**Ritual authority:** A modern national ethnographic inventory may accurately describe a community but is not a Church approval of every included ritual formula, indulgence, alternative rite or popular folk practice. Primary diocesan/ritual documents must be checked before any publication of blessings or rite text. Historical origin claims quoted inside inventories are NOT newly consulted underlying archival documents.

## 28 explicit action identity/variant contrasts

`data/customs/master/portugal-four-pci-28-action-contrast-review.v1.json` manually compares a selected 28 new action descriptions with existing Weiser-derived working labels. Cases include:

- Alenquer painted Magi symbols versus **blessed Epiphany chalk**: distinct material, actor and authority; *Os Reis* carolling is a broader typological family with local painting/singing variants.
- Braga Lent Eucharistic adoration versus Holy Thursday church visits: different occasion and practice.
- Braga and Entre-os-Rios localized Good Friday entombment processions versus the wide `CAT-WEISER-B-012` label: related family, NOT a global merged identity.
- Portuguese Easter *Compasso* with parish sacred Cross versus general social Easter visiting: different primary action.
- Alenquer Epiphany donations funding Mass for souls versus All Souls Day private prayer/bread giving: related Catholic intention but different occasion and mechanics.
- Lenten songs for the dead in Portuguese streets versus individual Monday prayers for the dead or Philippine All Souls door-to-door songs: different feast or ritual form.

**Method caveat:** These are direct current Portuguese source descriptions compared with **older research labels**; not full dual-original-text verification. Consequently they certify **zero same-practice historical identities, zero independent confirmations, zero new globally distinct customs, zero automatic merges and zero publications**. Strongest value is preventing false merges and organizing later document review.

## Repository totals and next gates

The shared branch baseline at integration was **2,602 research/source-detail rows** including parallel work already completed. This intake is **+140** = **2,742 research rows**. The existing 408 overlapping provisional action groups and 56 earlier working master identity labels are unchanged. The **157 indexed Irish folklore discovery leads** and **100 duplicate Mueller second-pass observations** remain NONADDITIVE.

No new Calendar, Missal, ritual, saints, prayers or UI code was edited. `tests/customs-full-registry-census.mjs` asserts every ID, exact source line/URL, label-review source pointers and zero promotions, preventing future duplicate inflation.

**Next research:** Expand Portuguese ordinary household and saint-day practices from distinct parish or original historical witnesses rather than mining ever-smaller steps from these same four inventory files. Prioritize first-hand community evidence for Compasso Paschal, May Marian practices, All Souls prayers, saints' processions and named regional customary observances, and promote only after independent primary source confirmation. Maintain 100–200 **source/action screen** rows per substantial batch; retain separate 300–500 discovery candidate queues before evidentiary certification.
