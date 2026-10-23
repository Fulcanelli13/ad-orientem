# Customs registry: 1930s Irish Schools' Collection — 157 indexed leads, 36 folios

**Research date:** 23 October 2026. **Status:** archival discovery, NOT fully inspected original folios and NOT counted as canonical customs, complete source-action observations, or verified Catholic traditions.

## Why this batch is a separate queue

The National Folklore Collection at University College Dublin documents the 1937–39 Schools' Collection: pupils collected local practices and beliefs from parents, relatives and neighbours. It spans hundreds of thousands of pages, providing geographically distributed early-twentieth-century retrospective oral tradition rather than yet another 1970s/1990s family-advice compilation. See [Dúchas: collection history](https://www.duchas.ie/en/info/cbe-collections), and [Smithsonian folklife explanation](https://folklife.si.edu/magazine/1930s-irish-folklore-duchas-project).

**Access limitation:** during this batch, opening the Dúchas site with the available reader returned an **ALTCHA/security-verification** page. Indexed search results still exposed varying lengths of transcribed original-page content and, in many cases, exact CBÉS volume and folio identifiers. Do not claim that all folio facsimiles or complete transcripts were accessed. Exact school, informant, place, original manuscript image and continuation across pages remain separate verification gates. A direct URL on the Dúchas domain is an evidence pointer, **not proof that the complete page was examined**.

The new work retains:
- **36 distinct CBÉS folio references**, including confirmed volume **0378 p.189** for Corrin Well at Fermoy (not an unknown placeholder);
- **157 short indexed action, belief or historical-context descriptions**, with stable IDs and URLs;
- **143** records with a conservative automatic theme/motif lookup hint, **14** without hints. Motif hints are categorisation only, not unique custom identities;
- distinct source-claim gates: **108** reported household/community practices; **10** blessings/devotional contexts requiring ecclesiastical cross-check; **34** folk belief / magic reports **explicitly quarantined**; **5** historical cessation/origin observations.

### Source coverage

| Theme | Index-level observations |
| --- | ---: |
| Easter, Lent and Holy Week | 55 |
| St Brigid and Candlemas customs | 63 |
| St John's Eve | 18 |
| May Eve / May Day | 17 |
| Holy-well pattern days | 4 |
| **Total** | **157** |

Concrete action examples include Easter egg collection (*clúdóg*), mountain-top egg cooking and egg dying; keeping Good Friday eggs; family-making of St Brigid's crosses, an arrival/threshold invitation formula, crosses in outbuildings, and Candlemas associations; St John's bonfires and rosary around the fire; and holy-well prayer rounds. These recur across school folios and **should not be counted once per storyteller as distinct customs**.

Proposed protective crop charms, fairies, healing ribbons, the Easter sun-dance and similar extraordinary folk reports are not presented as confirmed religious or medical claims; the same narratives also contain authentically Catholic prayer and observance. Reports sometimes conflate February 1 (St Brigid) with February 2 (Candlemas); preserve dates as reported pending Catholic liturgical cross-check and do not silently harmonize source error.

## State of the two linked files

- `data/customs/master/irish-cbes-1930s-easter-brigid-john-may-indexed-excerpt-leads.v1.json`: 36 source locators and 157 micro-descriptions, source access level recorded per row; **0 full manuscript pages verified**, **0 identities approved**.
- `data/customs/master/irish-cbes-157-indexed-folklore-motif-screen.v1.json`: all 157 rows linked by original ID to a **31-class, feast-scoped, reversible automated search-facet screen**, with **143** having one or more hints and **14** not matched. It does **not** assign common custom owner, historical corroboration, or automatic source equivalence.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json`: only a **discovery queue pointer and metadata**, not 157 additions to the master source/detail total.
- `tests/customs-full-registry-census.mjs`: asserts the specific nonadditive count, all 157 IDs, 36 referenced folios, folk belief quarantine and zero direct manuscript verification or app publication.

The shared master already contained **2,343** earlier source/detail working rows at the moment of queue-linking, including **96** Sicilian Holy Week documentary components committed by another parallel research worker. The Irish **157 are not an increment** to that total. All research remains on **draft PR #1572** and the pre-existing 408 provisional groups / 56 working owner labels are not altered.

## Next production-quality research gate

1. Obtain direct Dúchas story/facsimile access legally, then inspect and cross-check **36/36** page images and full transcriptions, with original school, collector, informant, date and district verified. Where a passage crosses pages, include its continuation page.
2. Separate *firsthand witnessed practice* from *elder's recollection*, *collector's hearsay*, *origin story*, *supernatural belief* and *intra-family instruction*. Prioritise dated, localized independent testimony. Same collection / same school doesn't prove independent informants.
3. Reconcile the observed primary actions and objects with the canonical working register; allow same action with different variant geography, blessing, date or participant, but never merge because two labels both say 'rushes' or 'eggs'.
4. Screen a high-volume second tranche of **100–200** new source folios after access is obtained, or keep the collection in discovery while other legally accessible archival collections are mined.
5. No Calendar UI, Mass reader, Roman Ritual text, rite authorisation, prescription of folk remedies or public publication before specific evidence and ecclesiastical checks.

**Licensing:** Content and data are credited to the National Folklore Collection/UCD and have page-specific restrictions; the catalogue retains only short original action-label paraphrases and source URLs, not reproduced source stories or illustrations.
