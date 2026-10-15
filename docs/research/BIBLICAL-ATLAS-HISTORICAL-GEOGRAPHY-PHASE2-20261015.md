# Biblical Atlas — historical-geography reconciliation, Phase 2 (research only)
**15 October 2026 · original repository owner · coordination issue #342**

## Scope, source of truth and result
This is a non-destructive overlay of merged [#1239](https://github.com/Fulcanelli13/ad-orientem/pull/1239), **not a new location owner**. Runtime owner is `src/find/bible-atlas.js:ATLAS_GEO`, existing 151 events and 22 English/French opt-in settlement labels; the immutable Pleiades v1 source crosswalk remains intact. Structured decisions: `data/explore/biblical-atlas-geography-phase2.research.v1.json`.

- **35/35** keyed physical anchors now have a separately described research disposition: 22 displayable alias reviews; 7 no-direct-Pleiades sites with source-specific research; 6 additional feature/tradition/candidate caveats. These buckets are **not** independent proof of 35 ancient identities.
- **28/35** remain plausible Pleiades candidate identities, **not** archaeology-certified or editor-approved matches.
- **0** new published labels, coordinate changes, narrative events, or map layers. **All editorial holds remain.**
- Avoid conflating (1) place named in Scripture; (2) ancient settlement/site/region identification; (3) geographic representative point; (4) claim that a biblical event happened at that exact location.

## Seven direct-match exceptions — site-specific evidence and disposition
| Existing anchor | What the evidence supports | What it does NOT support | Source |
|---|---|---|---|
| `nain` | Modern Nein corresponds plausibly to biblical Nain, the village of Luke 7; Franciscan pilgrimage tradition survives. | Neither the ancient village gate nor the exact point of the raising is fixed by the modern chapel or a Pleiades URI. | [Franciscan Custody](https://www.custodia.org/en/sanctuaries/nain/); [Bible encyclopedia](https://www.biblicaltraining.org/library/nain) |
| `bethesda` | Excavated pool complex near St Anne has two basins and a partition consistent with the five-portico topography in John 5; structural history warrants examination. | Archaeology does not locate the healing within it or eliminate site-phase questions. | [Gibson's stratigraphic study](https://www.academia.edu/22894959/The_Excavations_at_the_Bethesda_Pool_in_Jerusalem_Preliminary_Report_on_a_Project_of_Stratigraphic_and_Structural_Analysis_Text); [Biblical Archaeology Review, 2026](https://www.biblicalarchaeology.org/daily/biblical-sites-places/jerusalem/the-bethesda-pool-site-of-one-of-jesus-miracles/) |
| `siloam` | Second-Temple-period stepped pool area and water infrastructure are excavated at the south of the City of David. | A nearby **later-first-century** plastered pool dated during the Great Revolt is not necessarily the same structure as the John 9-era setting; no pinpoint of miracle. | [IAA excavation report](https://hadashot.iaa.org.il/Report_Detail_Eng.aspx?id=25721); [IAA published later adjacent-pool study](https://publications.iaa.org.il/atiqot/vol101/iss1/6/); [excavation programme](https://cityofdavid.org.il/en/siloam-pool-opened-eng/) |
| `bethphage` | Biblical village near the road between Bethany and Jerusalem and on the Olives slope; modern sanctuary commemorates its role in Palm Sunday. | Exact village boundaries / colt site are not independently fixed by the church. | [Encyclopedia of the Bible](https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Bethphage); [Franciscan Custody](https://www.custodia.org/en/sanctuaries/bethphage/) |
| `olives` | Named north–south **ridge** east of Jerusalem across the Kidron Valley. | A city centroid or a single summit point does not represent the ridge's spatial extent. | [Encyclopedia of the Bible](https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Mount-Olives) |
| `gethsemane` | Near traditional sanctuary, excavations exposed a circa-2,000-year-old ritual bath and later church phases. | Those finds cannot independently draw the garden's Gospel-period boundary or prove the exact site of the Agony. | [Custody's report of IAA/Studium Biblicum Franciscanum excavation](https://www.custodia.org/en/news/presentation-new-archaeological-finds-gethsemane/) |
| `holy-sepulchre` | IAA/Sapienza reports excavated ancient quarrying, funerary reuse and Constantine-era monumentalization; the present site is an important historic traditional identification. | No automatic archaeological proof of the exact crucifixion point or tomb. `golgotha` and `christ-tomb` must remain two owner events sharing **one explicitly qualified** traditional location key. | [IAA, 2024](https://hadashot.iaa.org.il/Report_Detail_Eng.aspx?id=26542); [Sapienza 2025 excavation report](https://iris.uniroma1.it/handle/11573/1763575) |

**Site resolution is not equivalent to a Pleiades match.** None of these seven should be assigned an unrelated nearby Pleiades city to make a coverage metric reach 100%. The absence of a Pleiades URI is not evidence against the place's existence. The pool excavations are evidence of site history and layout; they do not independently establish the Gospel miracle.

## 22 existing settlement-label reviews
The structured Phase 2 JSON gives one *source-recorded ancient spelling for further editorial comparison* per currently displayable bilingual settlement alias, always under `HOLD_NO_RUNTIME_LABEL_CHANGE`. It is **not** an instruction to replace English/French UI titles, and it does not supply automatically eligible year ranges. Main labels remain user-readable in both languages.

| Context | Source comparisons and period gate |
|---|---|
| Jerusalem | `Ierusalem`/`Hierosolyma` may support first-century background. **Reject `Aelia Capitolina` in Gospel-era maps** even though the Pleiades name-range export includes earlier dates: Roman refoundation is c.130 CE. [Oxford reference](https://academic.oup.com/reference/62341/reference-article-abstract/554104460?login=false) |
| Samaria | Settlement **Samaria/Sebaste** is not the whole region of Samaria. Herod renamed the city Sebaste in the late first century BCE, despite Pleiades `Sebaste` candidate name being dated only 300–640 CE in the selected export. **Date ranges can be incomplete or too broad**; collate actual history. [Josephus, Antiquities 15](https://lexundria.com/j_aj/15.267-15.298/wst); [chronological discussion](https://www.jewishencyclopedia.com/articles/13367-sebaste) |
| Caesarea near Banias | `Paneas` is older; Philip the Tetrarch's `Caesarea Philippi` is the Gospels-era place name, but the Bible text says Jesus was in its **district**, not necessarily at a precise feature. [Perseus, classical geography](https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.04.0064%3Aentry%3Dpaneas-geo). No new runtime label until the city-context editorial policy allows it. |
| Caesarea on the coast | `Stratonos Pyrgos` is earlier; first-century `Caesarea` is apt. Existing `Caesarea Maritima` is a practical modern disambiguator, not a claim of the historical phrase in Scripture. |
| Corinth | Distinguish Greek city, destruction (146 BCE) and Roman refoundation (44 BCE). Apostolic Corinth was a Roman colony; `Korinthos` is a recorded ancient form, not an instruction to replace the current bilingual UI label. [Corinth Computer Project](https://www.corinthcomputerproject.org/corinth-timeline/) |
| Nineveh and Babylon | `Ninuwā` and `Bābili` are source-recorded earlier spellings with relevant ancient dates; `Nȋnos` and `Babylon` belong to other language/period contexts. Keep translated names primary. |
| Joppa and Troas | `Ioppe` is apt for later usage and differs from earlier `Yapu/Jappû`; `Alexandria Troas` rather than earlier `Antigoneia` fits apostolic context. |
| Antioch, Tarsus, Philippi, Ephesus | Keep apostolic-era city wording; reject indiscriminate adoption of `Theoupolis`, `Antiochia ad Cydnum`, `Krenides`, or `Arsinoeia` as the period map label. |
| Athens and Rome | Their individual Pleiades representative points are **ROUGH** and have no subordinate location records in the pinned checked exports; name identity does not justify a more precise point. |
| All other reviewed settlements | Existing bilingual labels remain; source-recorded spelling may appear in a future optional, date-qualified historical detail sheet only after historical and linguistic review. |

## Six other non-standard candidate/site records
- `banias`: separate Caesarea Philippi city context from Peter's exact confession setting.
- `bethlehem`: settlement match cannot certify exact Nativity building/site.
- `carmel`: mountain identity cannot prove location of Elijah's altar.
- `ein-karem`: no independently attested Pleiades name in the checked record; traditional Visitation location is not a demonstrated Gospel address.
- `shiloh`: settlement vicinity does not locate the Tabernacle to point precision.
- `tabor`: known mountain name is not Biblical proof it was the Transfiguration mountain.

## Interaction with the other pipelines
The existing Atlas chronology, Gospel ordering, narrative IDs and events remain with `src/find/bible-atlas.js` / the 151-event corpus. The research-only genealogy/theatre [#1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069) keeps its independent source/rights holds. The cinematic review, physical terrain/style, Android pan QA, Saints, and Sacred Art own their respective data. Do not invent new route evidence or new art links here.

**Next gate** (not yet passed): for each of the 28 Pleiades candidates, independently collate the original name attestation, period and place/location association from the full canonical record and the pinned OpenBible witness. Evidence of a matching city name is not evidence that a particular Scriptural event took place exactly at its representative coordinate. Then propose era-aware detail text in a **separate reviewed runtime change**, with no automatic year-date from an 11-era ordinal.

**Status: Phase 2 source review recorded; research-only. No approved new ancient map labels, no site certs, no event/pin mutation.**


## Phase 2B — complete pinned individual-source collation (15 October 2026)

The complete metadata matrix is `data/explore/biblical-atlas-source-collation.research.v1.json`, created on this same, separate research branch. **This is original-record inspection, not merely a title-and-nearby-point join.**

**Methods.** Read each Pleiades `data/json/<digits>/ID.json` file from exact `isawnyu/pleiades.datasets` revision `d8c06f28656312eee6b7a0f76415b34a89e3c728`; check published review status, canonical URI, title, original `reprPoint`, subordinate `names` records (canonical URI, start/end, attestation periods and confidence, association certainty, original provenance), and subordinate `locations` (association certainty, accuracy value, feature type and supporting description). Independently read the **original** `modern.jsonl` Git blob `9da83575127fc5aa1dab7aff61e01d4bc5ac9fdc` from `openbibleinfo/Bible-Geocoding-Data` pinned commit `7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f`: verify the actual source record ID, name, original coordinate, source type, reported precision and ancient associations. Original Git repository source URLs, Pleiades per-place JSON Git paths and blob SHAs are saved for reproducibility. Pleiades © contributors, CC BY 3.0; OpenBible data CC BY 4.0.

**Verified data identity:** 28/28 individual Pleiades resources are published and match the v1 place ID, canonical URI, title and representative coordinates. **128/128 selected historical-name entries** from the v1 crosswalk are present in the original published place objects with unchanged date range and URI. Across the 28 there are **45 subordinate Pleiades location records** with certain place-location association at the record level. **28/28** original OpenBible modern-record IDs exist and reproduce the canonical app's current geographic coordinates. No source-identity check failed.

**Precision and nomenclature traps:**
- Rome (`423025`) and Athens (`579885`) have **no subordinate Pleiades locations** at all in this fixed export; the v1 GIS representative-coordinate precision remains **rough**. OpenBible's independent representative point precision does **not** improve the Pleiades source or locate Paul at an exact city building.
- Ein Karem (`601633374`) has a published place resource with one location and **zero subordinate name entries**. Its modern place heading is **not** evidence of a first-century Visitation toponym.
- OpenBible's `precision.meters` describes its chosen **representative modern point** (often a point at visible ruins, within a settlement or on a mountain). It does **not** grant archaeological certainty to a literary episode at that exact metre coordinate. Pleiades `accuracy_value` has a different provenance and cannot be numerically substituted for OpenBible's precision or the Atlas's original point.
- **Jerusalem:** the original Pleiades resource records forms of `Aelia Capitolina` with anomalously broad time-period attestations, including dates before Hadrian's foundation. This **fails the chronological eligibility gate** for a Gospel narrative despite correct source transcription.
- **Samaria:** Pleiades `Sebaste` name record is scoped to late antiquity in its own attestations, but historic city renaming under Herod occurred by the first century BCE. This is **a dataset limitation**, not a license to relabel all eras indiscriminately; distinguish city Samaria/Sebaste from region Samaria.
- Of the saved name attestations, **two** are explicitly marked `less-confident` (late-antique `Cesarea Paneas`, early first-millennium `Samernāya`) and **one** `confident-inferred` (`Gabinia`); do not treat all date-linked name rows as equally solid.
- Pleiades name association-certainty `certain` and ancient-modern city agreement are **not** testimony that an event happened at the centroid, a particular gate, an exact sanctuary, a tomb or a mountain summit.

**Gate and disposition:** The 28 original place and OpenBible **source records have now been checked**. Their Biblical event-site identifications are **still not individually archaeologically certified**. The 22 existing English/French labels remain the public display; source-period variants are a possible *secondary* contextual annotation only, after independent dated attestation and French transliteration review. The seven site-specific holds remain; none has been misclassified as a missing Biblical name solely because Pleiades lacks an exact object. No live pin, year, chronology, image, map style or route was changed.

**Verification:** `node tests/atlas-pleiades-reconciliation.mjs`, `node tests/atlas-geography-phase2.mjs`, `node tests/atlas-source-collation.mjs`; dedicated `atlas-geography-phase2.yml`. The CI asserts reproducible 28-place provenance and full non-import to existing MapLibre runtime. Repository-wide gates must also pass before any merge.
