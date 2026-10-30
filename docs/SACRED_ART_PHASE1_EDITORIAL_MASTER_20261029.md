# Sacred Art Phase 1 — Consolidated editorial register
**29 October 2026 · Research-only · €0 · No production-image or UI mutation**

## Verified source-bound decisions
- **2,455 reviewed artwork cards**, across the initial 60-card review and B3–B13.
- **772 IMPORT**, **84 IMPORT_WITH_CORRECTIONS**, **1,599 REJECT**; **856 accepted or conditional** in total.
- **2,455 unique source IDs**; zero exact-source-ID collisions in these batches.
- B4R **123/123** and B5R **250/250** recovered from the original user-exported JSON files. B12 **250/250** and B13 **250/250** also preserved.
- Initial 60-card original user JSON recovered: 60 titles, 53 nonblank historical artist fields, 58 source URL joins from the prior research source; seven author fields were blank already in the source, and two KMSKA review IDs lack matching research-source URLs.
- The 383-artwork existing main gallery remains a **separate locked catalogue**. Four exact source-page crosswalks currently match, **not four newly approved canonical promotions**.
- Thirty-four candidate duplicate-work groups share normalized title and artist. Some groups contain contradictory IMPORT/REJECT choices across distinct artwork IDs. **No automatic physical-work merges.**

## B13 reviewed-source divergence
The user's frozen B13 export matches `sacred-art-b13-french-museums-250-20261029.v1.json` (SHA256 `2cc8695e6a34b24e88aa7ad6b290111134659e5d9f3a3fd5a1a0566f5cb09fe8`), **not** the subsequently re-screened v2 source (SHA256 `8fec98262dab823bc461c3e73117f5e01f356e565db4fc6facf6a20d001db858`).

The later screener replaced ten image-source IDs. Four of the replaced older cards had received user IMPORT choices:
- `commons:123828337` — Saint Apollonia
- `commons:81902276` — Martyrdom of Saint Catherine
- `commons:163856846` — Rubens, *Christ Triumphant over Death and Sin* (detail)
- `commons:85666930` — Saint Jerome Writing

Preserve all ten original choices against their original source IDs, including the four approvals. All ten substitute IDs in the later screener remain **unreviewed**, and none inherits the choices of a removed image.

## Governing source authority
`data/calendar/sacred-art-editorial-master-20261029.v1.json` is the discovery/validation entry point and source-ID index. It references four immutable, source-bound editorial shards (`shard-01` to `shard-04`) and their Git blob SHAs. Individual source batches and complete user choice ledgers remain separately preserved, rather than replaced by title matching. The entry point contains the four confirmed exact-source-page links and the 34 unresolved possible duplicate-work groups. Run `node scripts/art/validate-editorial-phase1-20261029.mjs` to check ledger and snapshot integrity.

The 383 existing master, 22 Prayer primary hero selections, and 83 Breviarium source plates are overlapping but **not additive** catalogues. The 856 accepted review cards are **not** certified as 856 physically distinct paintings.

## Remaining Phase 1 release gates
1. Research the 34 possible same-physical-work groups using museum accession, physical work identity and exact photo-source evidence. Preserve conflicting source-ID decisions; do not reinterpret a REJECT as a rejection of every alternative image of the subject.
2. Resolve the seven blank original artist fields only where an authoritative catalogue establishes attribution; preserve “unknown” otherwise. Recover two unresolved original source URLs if possible.
3. Triage the four B13 selected works that were removed by later automated screening; request better photographs of the **same chosen work**, not approval by proxy of a new work. Keep the other six removed/replaced records source-bound.
4. Reconcile all 856 accepted or conditional new records against the existing 383 canonical artwork identities. Record source/photograph/physical-work distinctions separately and leave ambiguous joins for manual evidence review.
5. Only after identity reconciliation, hand the work to Phase 2 **image-specific rights, original photo acquisition, native visual certification and frame/crop QA**. No automatic publication.

## Explicit exclusions
The index does not grant photo rights, certify the visual content or true colour, download high-resolution originals, change the canonical 383 editorial locks, release any images, or update the live app. `productionImported:false` is the frozen review-lane field, **not** proof that an unrelated existing app asset is absent. All work uses existing GitHub research storage and no paid services.


## Follow-up evidence triage — 34 title/artist groups (29 October)

Machine-readable outcomes: [34-group identity triage](../data/calendar/sacred-art-phase1-identity-triage-34-20261029.v1.json). These flags came from a naive normalized title/artist collision test, not physical-object matching.

| Disposition | Groups | Effect |
|---|---:|---|
| Different museum inventory records with unique accession identifiers | **28** | Keep each museum item independent; shared subject/title alone cannot justify deleting one |
| Further institutional/provenance evidence establishes distinct works | **2** | Simon Vouet's NGA vs Louvre *Madonna and Child*, and Zurbarán's Houston vs Christie’s-source *Veil of Veronica* are separate holdings/works |
| Whole/composite vs part, or triptych/ensemble member | **3** | Cleveland Schlägl Passion altarpiece `1951.453` vs `1951.453.a`; KMSKA *Adoration of the Magi* `208` vs `208–210`; KMSKA *Adoration of the Lamb* `413` vs `413–424` |
| Same physically identified painting with separate source-image records | **1** | Met Rubens Workshop *Saint Teresa* `17.190.19` = Commons `Avilai.jpg`. Both source-image approvals persist |
| **Total** | **34** | **No approval propagation, no deletion, no automatic production merge** |

Official object evidence:
- Cleveland: https://www.clevelandart.org/art/1951.453 and https://www.clevelandart.org/art/1951.453.a
- KMSKA: https://kmska.be/nl/meesterwerk/aanbidding-door-de-koningen-4 and https://kmska.be/nl/meesterwerk/aanbidding-van-het-lam-gods-0
- Met: https://www.metmuseum.org/art/collection/search/437542, Commons accession corroboration: https://commons.wikimedia.org/wiki/File:Avilai.jpg
- Houston MFA: https://emuseum.mfah.org/objects/22064/veil-of-veronica

**Important**: “different accession identifiers” establishes separate museum *catalogue records*; it does not rule out a more distant relationship as parts of the same ensemble. Those remain independent until explicit parent-child evidence is entered. The 34 are now classified for triage; 34 were not confirmed duplicate paintings.

## Follow-up — Four protected B13 approvals affected by later screening

Machine-readable, source-bound repair cases: [B13 four approved source repairs](../data/calendar/sacred-art-b13-four-approved-source-repairs-20261029.v1.json).

| User-accepted original ID | Original issue | Evidence-based remedy or hold |
|---|---|---|
| `commons:123828337` — Zurbarán *Sainte Apolline* | Image includes frame | Same physical Louvre object MI 724 has a distinct unframed Commons image candidate, 1,908×3,345 px. Verify exact image bytes, rights and painted-area fidelity before switching source |
| `commons:81902276` — Vouet *Martyrdom of Saint Catherine* | “Avant restauration” photograph | Current “après restauration” Commons filename alone is insufficient: its file history disputes restored-state pixels. Confirm exact restored photographic version with Strasbourg museum |
| `commons:163856846` — *Christ Triumphant over Death and Sin* | Detail-only photo, photographer mistaken for artist | The independently user-approved `commons:163856843` is a whole-composition candidate; original detail approval remains separate. Official Strasbourg catalogue describes painting as *after* Rubens (MBA 235), not necessarily an autograph Rubens |
| `commons:85666930` — Blanchard *Saint Jérôme écrivant* | Incorrect “artist” = uploader; **photograph rights falsely classified as PD** | Musée de Grenoble confirms painter Jacques Blanchard, accession MG 4292. Exact Commons photograph by Jvillafruela is **CC BY-SA 4.0** with attribution/share-alike duties. **Production rights HOLD** until obligations are handled or another lawful image source selected |

Source checks:
- Saint Apollonia Louvre MI 724: https://collections.louvre.fr/en/ark:/53355/cl010064908 ; no-frame Commons version: https://commons.wikimedia.org/wiki/File:Sainte_Apolline_-_Francisco_de_Zurbar%C3%A1n_-_Mus%C3%A9e_du_Louvre_Peintures_MI_724.jpg
- Vouet restoration history: https://commons.wikimedia.org/wiki/File:Simon_Vouet,_Martyre_de_Sainte-Catherine_(apr%C3%A8s_restauration).jpg
- Strasbourg Rubens attribution: https://pop.culture.gouv.fr/notice/joconde/00190023042
- Grenoble artist: https://www.museedegrenoble.fr/oeuvre/2261/1922-saint-jerome-ecrivant.htm ; Commons source-photo copyright: https://commons.wikimedia.org/wiki/File:Jacques_Blanchard_-_Saint_J%C3%A9r%C3%B4me_%C3%A9crivant.jpg

**Remaining priority**: reconcile the 856 accepted review-card subjects to the canonical 383 *physical-artwork* identities (and to module/day placements), retaining unique source-image variants. The 84 correction holds and photographic rights gates cannot be treated as publishable merely from editorial acceptance. All decisions and production assets are still untouched.


## Phase 1 accepted-to-canonical 383 crosswalk (29 October)

A complete, non-mutating comparison of all **856 IMPORT / IMPORT_WITH_CORRECTIONS** entries to the existing **383 canonical art records** is now in [accepted-to-canonical crosswalk](../data/calendar/sacred-art-accepted-856-to-canonical-383-20261029.v1.json).

| Evidence class | Accepted cards | Significance |
|---|---:|---|
| Same exact canonical institutional object ID | **63** | Verified canonical object identity via stable museum identifier |
| Same exact canonical Commons File source page | **4** | Identical referenced photo source to canonical record |
| Same exact Commons filename encoded in old `C32/C34` artwork ID | **4** | Historic canonical artwork ID encodes this Commons File name, despite missing `source_page` |
| Independent accession join, Met / Commons | **1** | `commons:45282804` (*Saint Teresa Interceding*) identifies Met object `437542`, accession `17.190.19` |
| **Evidence-backed links to 383** | **72** | 72 individually matched existing canonical records; no change to frozen editorial flags |
| **Not yet canonically linked** | **784** | *Unlinked does not imply a new physical painting.* These entries require source/physical-work evidence before identity promotion |
| **Total accepted and conditional** | **856** | 856 user-review card choices preserved without changing production |

The original 281-row research candidate file contains **74** of these 856 accepted source IDs, including **11** currently unlinked to the 383. This is a *research staging overlap*, not 74 production-ready artworks.

Of the 72 canonical matches, **20** already have either `APPROVED_LOCKED` or `APPROVED_5` canonical editorial states. All **72** have `production_approved:false` in the current curatorial audit. A user photo approval never supersedes the historic master lock or native photo/rights requirements.

Cross-reference trace:
- Met Saint Teresa museum object: https://www.metmuseum.org/art/collection/search/437542
- Commons alternate source `Avilai.jpg` records Met object `437542` and accession `17.190.19`: https://commons.wikimedia.org/wiki/File:Avilai.jpg
- Four filename ID alias links: `commons:160380`, `commons:37938802`, `commons:15056772`, `commons:52718091`; audit retains each original Commons object page and corresponding older `C32:/C34:` canonical ID.

### Remaining physically ambiguous identities

[13 weak title/artist similarity leads](../data/calendar/sacred-art-phase1-identity-review-13-20261029.v1.json) were isolated from the 784 unlinked cards. They are **not** positive matches. Some are plainly different Saint subjects or different artists despite shared tokens (e.g., Ribera Saint Bartholomew versus Saint Philip; Bernardo Strozzi versus Bernardo Cavallino). Four high-value leads for further source identity confirmation are:
- `nga:63264`: Veronese *Martyrdom and Last Communion of Saint Lucy* vs canonical `G17-010`;
- `nga:45640`: Rubens *Meeting of Abraham and Melchizedek* vs legacy artwork ID `ART-eter-aul-ubens-eeting-of-braham-and-elchizedek`;
- `met:436257`: van Dyck *Saint Rosalie Interceding* vs legacy `ART-nthony-van-yck-aint-osalia-nterceding-for-alermo`;
- `met:439120`: Subleyras *Mass of Saint Basil*, 1746 oil modello vs legacy `ART-ierre-ubert-ubleyras-he-ass-of-aint-asil-oil-modello`.

A source/artwork title match is insufficient to transfer the 1962 date or phone hero placement from canonical to new image. Obtain source accession, collection and/or exact original image evidence first.

### Next release-aware steps

1. Verify the 13 weak identity leads against physical source identifiers and resolve any exact-object joins. Keep all remaining unlinked choices as candidates, **not** automatically 784 new paintings.
2. Triage the accepted and conditional cards for exact-image rights, native unframed whole-painting QA, colour, and historic editorial approvals. The **84 conditional approvals** remain on their correction gates.
3. Freeze the **physical-work identity** separately from **photo-source identity** and **app placement**, including the four already-reviewed B13 photo repair holds and old canonical 383 locks.
4. Bring the best already-approved Home, Class I, Sunday and Prayer works to the production QA queue. Do not resume low-priority discovery merely to increase raw reviewed counts.

The Phase 1 validator checks the crosswalk against source-bound decisions, known object identities and master count invariants. It was extended in this research branch; an actual CI execution still must be verified. No new images were downloaded or deployed by this crosswalk.


## Follow-up: 856 accepted-to-canonical crosswalk and Phase 2 image-inspection intake

### Physical-work identity — why 784 is NOT the number of genuinely new works
- All **856 frozen user-accepted or conditionally accepted source cards** were reconciled against the **383 canonical artworks**: **72 have verified identity links** and **784 have no verified canonical identity link**. An unlinked card is not necessarily a unique physical painting, nor necessarily a future app hero.
- The existing 281-record candidate research registry overlaps 74 accepted cards, of which 11 are not yet linked to the 383 canonical. It is **not** 281 additional accepted artworks.
- The 72 confirmed historical links have no finished native-image production certification. Their prior states include three first-pass visually clean image-source cases, nine with external non-art border, and one historical editorial conflict requiring manual adjudication.
- Thirteen weak title/artist candidates were screened; eight were distinguished by object/subject evidence, while five remain unproven identity links. Source museum object accessions and official source URLs have now been attached to those five in the existing [weak identity triage](../data/calendar/sacred-art-phase1-weak-identity-13-triage-20261029.v1.json). Without canonical image provenance or source accession evidence, none can be promoted safely.

### Operational high-volume photo verification

A **200-photo first QA worklist** has now been constructed, not as 200 visual approvals but as **200 source-anchored original artwork image candidates**:
- all **72** confirmed canonical artwork links
- all **4** selected original B13 cards affected by later screening
- **124** other accepted source cards, prioritized toward primary museum open-access policies
- **656** other accepted source cards retained in the source-bound crosswalk as the next queue

The 200 sources are: **100 Met**, **42 Cleveland**, **45 NGA**, **13 Wikimedia Commons**. All 200 have a frozen preview-image pointer; **112 have recorded native/full-resolution candidate URLs** and **88 only review-preview URL pointers**. Actual image bytes and exact-photo rights have **not** been verified in this pass.

Primary research evidence:
- [Compact phase 2 manifest](../data/calendar/sacred-art-phase2-856-image-qa-intake-200-first-20261029.v1.json)
- [Ordered first-200 source worklist](../data/calendar/sacred-art-phase2-first200-qa-worklist-20261029.v1.json)
- [First 88 source photo links](../data/calendar/sacred-art-phase2-first200-photo-source-index-01-20261029.v1.json)
- [Remaining 112 source photo links](../data/calendar/sacred-art-phase2-first200-photo-source-index-02-20261029.v1.json)

**Do not conflate preparation with image certification.** Every file has `firstNativeQualityInspection:false`, `exactPhotoLicenseAccepted:false` and `release:false`. A source policy stating CC0/open-access does not certify the exact selected JPEG as framed, whole-work, colour-faithful or publication ready. The earlier incorrectly labeled CC BY-SA photograph of the Blanchard Saint Jerome remains on hold.

### Next release-oriented execution gate
1. Pull the **exact native originals**, not merely metadata thumbnails, into temporary zero-cost working storage and verify bytes and hashes against official/Commons source file and licence declarations.
2. Visually inspect images in **substantial operational groups**: whole artwork versus detail, frame/support, restorations, colour, subject and painting attribution. Record actual pass/fail and proposed repairs per source ID; never assume that a different photo inherits a user IMPORT choice.
3. Clear photo rights, final visual crop/colour check, and identity/attribution before marking any item publication-ready.
4. Test small actual app placements (Home fixed-date heroes, Class I, Sunday, Prayer modules) and then expand only after those release gates pass. Avoid new general museum discovery while this approved backlog has no production certification.

No image was acquired, visually certified in native resolution or deployed during this staging operation. No paid services were used.

## Phase 1 museum-accession audit — all 479 remaining institution-backed records (29 October)

Full machine-readable audit: [479 museum accession records](../data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json). This is an **internal, source-bound accession/URL consistency pass** across the **479 museum-backed records** within the 784 canonical-unlinked accepted cards. It does **not** verify that 479 live museum records still exist, that these represent 479 distinct physical paintings, or that any artwork can be published.

| Institution | Unlinked source cards | Conditional imports | Existing 281-registry matches |
|---|---:|---:|---:|
| National Gallery of Art | 126 | 16 | 3 |
| KMSKA Antwerp | 89 | 33 | 0 |
| Metropolitan Museum | 73 | 2 | 6 |
| Rijksmuseum | 66 | 4 | 0 |
| SMK Copenhagen | 54 | 2 | 0 |
| Walters Art Museum | 42 | 2 | 0 |
| Cleveland Museum of Art | 29 | 8 | 2 |
| **Total** | **479** | **67** | **11** |

- All **479/479 source URLs are syntactically aligned** with the expected institution domain and the frozen source object's ID or accession number. This is **not independent URL-response or object-page confirmation**.
- All **479 source IDs have distinct (institution, accession) pairs among all 2,455 frozen review cards**, including rejected cards. Distinct accession pairs are not proof of separate physical paintings, especially where catalogue entries refer to components, studies, or ensembles.
- **11** records are also independently indexed in the separate **281-entry research candidate registry**. They are catalogue cross-references, not imports into the 383-master nor publication clearance.
- **11** museum-backed source cards also carry unresolved textual canonical leads in the older 13-lead review queue; **3** repeated title/artist groups occur within these 479. None was promoted by title.
- The other **305** Commons-source unlinked cards remain for Commons file / museum accession resolution.
- The Phase 1 integrity script now contains read-only guards for source decisions, accession keys, URL consistency, registry cross-references and closed image/rights/release gates. This script was updated in the repository, but **no independent Node or CI execution is claimed**.
- **New confirmed links to the 383 catalogue: 0** in this pass. Total previously evidence-linked source cards remain **72** (71 canonical artworks). No new unique-physical-artwork total is justified.

Next evidence gate: visit or fetch each official museum object entry in bulk by institutional API or stable source page, store object-level attribution/accession/physical-object and grouping evidence, then distinguish exact identity from photo variants. Keep conditional choices and historic exclusions unchanged.

## Official museum source-page pass — 102 of 479 (29 October 2026)

[Official CMA 29 / Met 73 verification ledger](../data/calendar/sacred-art-phase1-official-cma29-met73-verification-20261029.v1.json) preserves a separate, more authoritative evidence layer beyond internal source-URL formatting.

- **102/479 remaining institution-backed unlinked cards (21.3%)** have corresponding official collection pages resolved by source accession/official object ID: **29 Cleveland**, **73 Metropolitan Museum**. Cleveland's 1920.150 required retrieval through its indexed official collection page after a direct fetch timeout.
- The museum's object title was checked against each original user-reviewed card. Cleveland's object pages display institution accession data; five Met accession/object-number pairings were explicitly transcribed into the ledger as samples. **Do not describe all 73 Met accession numbers as independently transcribed from page contents.**
- **11 authorship/anonymous-attribution exceptions** flagged without changing user choices or silently rewriting original editorial records: notably follower of Ricci (Cleveland 1916.785), follower of Luini (1916.824), attributed to Luini (1916.812), attributed to Maulbertsch (1963.326); follower of Bosch (Met 26.244), workshop of Bernardo Cavallino (43.23), attributed to Pieter Huys (15.133), follower of Jan Joest (1982.60.22). Three Cleveland cards correctly remain unnamed/anonymous.
- **Five linked grouping/surface records** warrant physical-object careful handling: the Francesco Guardi parent `cma:126770` (accession `1949.187`) represents a pair, not a third painting in addition to components `cma:126771` and `cma:126772`; Met `met:436990` is a two-sided physical panel (front/reverse); Met `met:436721` is one official accession record with two named subject treatments and must not be split by title alone.
- The original frozen IMPORT/IMPORT_WITH_CORRECTIONS choices are retained for all 102. Institutional object-page verification does **not** establish an exact original photograph, photographic rights, frame-free image, faithful colour, mobile crop, new unique physical-work count, or identity with one of the existing canonical 383.
- **377/479 museum cards still require official-site verification** (NGA 126, KMSKA 89, Rijks 66, SMK 54, Walters 42). Separately, **305 Commons-origin unlinked cards** still need attribution to physical work IDs.
- **72/856 accepted source cards retain prior confirmed links to 71 existing canonical artworks; 784 remain unlinked** to those 383 despite this official museum verification. The new pass **does not** automatically create 102 new canonical links because these are museum objects not already established as identical to works in the existing 383.
- Read-only validation checks for the 102 official source rows, immutable user decisions, crosswalk membership, source URL identity, attribution exceptions and closed release gates have been added to `scripts/art/validate-editorial-phase1-20261029.mjs`. **Standalone Node execution and CI have not been verified.** No expenditure or production mutation.

## NGA official collection pass — 42 of 126 (29 October 2026)

Evidence ledger: [NGA 126 source cards, 42 object pages confirmed](../data/calendar/sacred-art-phase1-nga-126-official-firstpass-20261029.v1.json).

- **42/126 NGA source cards have independently observed official National Gallery of Art object-page title and object-ID matches.** The other **84** retain their source-bound accession/URL records but remain unverified by independent museum-page review. The official NGA Open Data `objects.csv` repository is identified as a suitable bulk authority; **the large CSV was not ingested in this pass**.
- **12 individual apostle panels** (`1960.6.11.a`–`1960.6.11.l`), oil on wood, are associated as the Timken series. The NGA describes their painter as anonymous, *after Sir Anthony van Dyck*. Retain the twelve physical panels individually with a shared series identity. Do not call them autograph Van Dyck paintings or twelve photographs of the same object. Their conditional source-image IMPORT decisions remain unchanged.
- **Tiepolo's two `Madonna of the Goldfinch` paintings** at `nga:12138` / `1943.4.40` and `nga:101678` / `1997.60.1` have different provenances and are separate paintings, despite identical normalized title and artist.
- **`nga:3200` / `1942.16.2.a`** is described by NGA as a modern imitation of fifteenth-century Flemish painting, likely early twentieth century; a critical factual/chronology warning. The painted reverse `Saint Margaret` and the `Saint Bernard` obverse share one support.
- **`nga:41659` / `1952.5.46.a`** has `Saint Veronica` on the obverse and `Chalice of Saint John the Evangelist` on the reverse. Keep one physical panel identity with independently describable surfaces.
- **`nga:282` / `1939.1.141`** is a physical component of Duccio's `Maestà` predella, not an unrelated isolated painting; **`nga:45640` / `1958.4.1`** is Rubens's painted modello for the Eucharistic tapestry programme, not the finished tapestry.
- **`nga:159063` and `nga:159064`** (*Saint Mark* and *Saint Luke*, Vasari) were companion painted panels commissioned for Pope Pius V's Vatican chapel; retain separate accession identities and shared provenance.
- **`nga:234272` / `2026.46.1`** is a new 2026 museum acquisition, Tomás de Merlo's *Lamentation over the Dead Christ*, oil on copper. No previous-date assumption should exclude it.
- Additional attribution, studio, cycle and uncertain companion links are flagged for source QA; the official museum data is **not evidence of exact approved photographic bytes, native crop quality or production rights**.

**Overall museum verification:** prior CMA 29 + Met 73 = 102; newly observed NGA 42 = **144/479** institution-backed canonical-unlinked cards with an official-page identity check. **335** remain without independent official-site confirmation (NGA 84, KMSKA 89, Rijks 66, SMK 54, Walters 42), and separately 305 Commons-origin unlinked cards. Crosswalk to canonical 383 remains **72 accepted cards linked / 784 unlinked**: neither finding an NGA record nor identifying series/components constitutes a new exact crosswalk link. No editorial decisions changed, canonical master promotions, image certification, production releases or spending.

Validation guards now include all 126 NGA source rows and their 42 confirmed official object-page identities, 12-panel series, 84 still-pending records, Tiepolo separate object evidence and all closed release gates. **The Node validator has not been executed in CI.**

### NGA official Open Data bulk follow-up (staged; not yet run)

Instead of doing 84 more manual title/URL lookups, the research branch now includes `scripts/art/reconcile-nga-opendata-126-20261029.mjs`. It accepts the NGA's official [CC0 collection metadata CSV repository](https://github.com/NationalGalleryOfArt/opendata), joins all 126 frozen source IDs to `objects.csv` by exact numeric `objectID`, checks accession numbers and normalized titles, and optionally reads `object_associations.csv` for parent/child relationships. It records `isVirtual`, attribution, medium, series and provenance and generates a separate research-only report at a new output path; **it never modifies the review ledger or production artwork registry**.

Usage after obtaining the official NGA metadata files:

```sh
node scripts/art/reconcile-nga-opendata-126-20261029.mjs \
  --objects=/path/to/nga-opendata/data/objects.csv \
  --associations=/path/to/nga-opendata/data/object_associations.csv \
  --output=/tmp/nga-126-verified.json
```

The CSV parser's quoted-field/multiline test passed in isolated logic. **No live NGA CSV was downloaded or parsed in this conversation**, and the standalone Node script was **not** executed on the authoritative dataset. Do not count the pending 84 as verified before the resulting report is independently checked and committed. This workflow is designed to use free factual metadata without downloading images or spending money.

### NGA Open Data bulk execution — all 126 source cards verified (29 October 2026)

**The live official-data execution succeeded.** GitHub workflow `Sacred Art NGA 126 official object data reconcile (€0 research)` ([run 40938158126](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40938158126)) downloaded NGA `objects.csv` and `object_associations.csv` on a free public-repository runner, executed `scripts/art/reconcile-nga-opendata-126-20261029.mjs`, passed the earlier Phase 1 Node integrity validation, and **committed the compact result permanently to the research branch**. The large official CSVs were kept outside the repository and not saved as expiring Actions artifacts.

Permanent source-linked output: [NGA authoritative 126/126 reconciliation](../data/calendar/sacred-art-phase1-nga126-official-csv-report-20261029.v1.json).

| NGA official CSV outcome | Source cards |
|---|---:|
| NGA object IDs found | **126 / 126** |
| Exact reviewed accession matches | **126 / 126** |
| Normalized official/reviewed title matches | **126 / 126** |
| Museum classification `Painting` | **126 / 126** |
| Accession conflicts, missing objects, virtual cover objects | **0** |
| Source cards with NGA parent/child or front–reverse associations | **18** |

The authority fingerprints are NGA `objects.csv` SHA256 `53d0757fd5a4fb53785adefdb7e6eeb3290d97157eb5d59bfdc203d6d8e909c0` and `object_associations.csv` SHA256 `59dd0f38d2756fe9400267d91c355bbbd1ff3a4165f9d76e47e9ce76a4325ca6`. These identify the **actual content read by the workflow**, rather than assuming the NGA `main` branch is immutable. The output was generated `2026-10-29T19:13:59Z`.

**New authoritative physical-work relationships from the NGA dataset:**
- `nga:46035` (`1960.6.11.a`) is the structural parent of eleven other **separable** apostle panels. This is a **series of 12 distinct physical panels**, not a single work photographed twelve ways or twelve autograph Van Dycks.
- `nga:3200` has an **inseparable** child `3201` for another painted side; `nga:41659` has inseparable child `41660`. Neither child is an additional physical panel.
- `nga:282` links separably to parent `10` (Duccio's `Maestà` context); `nga:30` links separably to parent `206127`. Preserve the actual NGA relation instead of guessing a catalogue merge.
- `nga:46054` is a parent with three separable component records, including accepted `nga:228926`.

**Source identity and image certification are separate:** official accession verification does not identify any of these works as equal to an existing canonical-383 artwork, does not resolve the 305 Commons-origin cards, and does not prove image bytes/licence/crop/frame/colour. All user decisions stay fixed; no new artwork was promoted to production.

**Revised museum-backed queue:** CMA **29** + Met **73** + NGA **126** = **228/479 (47.6%)** externally verified by official museum source pages or metadata. **251** museum-backed unlinked cards still need independent verification: KMSKA **89**, Rijksmuseum **66**, SMK **54**, Walters **42**. The accepted-to-canonical-383 crosswalk remains **72 linked source cards / 784 not yet linked**. The next step is institution-first acquisition of these 251 official records, then the 305 Commons file-to-physical-work joins.

A further integrity guard was added to `scripts/art/validate-editorial-phase1-20261029.mjs` for the exact official NGA CSV hashes, 126 frozen choices and IDs, 18 object relationships and closed release gates. This **new post-report guard** requires its own CI execution after the script change; the preceding GitHub run passed the prior version of the Phase 1 validator.

## KMSKA Antwerp — 89 source records, first exact institutional evidence (29 October)

All 89 accepted/conditional KMSKA selections now have a [source-bound, accession-string-preserving audit queue](../data/calendar/sacred-art-phase1-kmska-89-official-identity-queue-20261029.v1.json). Counts: **56 IMPORT + 33 IMPORT_WITH_CORRECTIONS**; 89 distinct original museum source IDs, 89 distinct source inventory strings, 89 source URL/ID internal matches. All are reconciled against the original user review rather than taking the title as an identity. The 89-row queue is deliberately **pre-external-verification baseline** and must not be represented as museum-certified.

The exact first [two official object pages](../data/calendar/sacred-art-phase1-kmska-89-official-first2-20261029.v1.json) are independently matched by accession, title and maker:
- `kmska:7v3wb4`, inv. **208**, *Aanbidding door de koningen* (Master of the Adoration in Antwerp) = centre panel of triptych **208–210**, KMSKA [official object page](https://kmska.be/nl/meesterwerk/aanbidding-door-de-koningen-3).
- `kmska:9tct5i`, inv. **209bis**, *Annunciatie* = outer surface/wing of the same historical triptych, [official object page](https://kmska.be/nl/meesterwerk/annunciatie). The other annunciation wing/surface **210bis**, source ID `kmska:hyinp7`, had an original **REJECT** and is **not** automatically accepted.
- [KMSKA's triptych record](https://kmska.be/nl/meesterwerk/aanbidding-door-de-koningen-4), inventory **208–210**, had original review source `kmska:z5h6lf` with **REJECT**. The original **IMPORT** decisions for the selected component and Annunciation surface remain independent and protected. Do **not** count the triptych parent as another painting or transfer a rejection to accepted panels.

An official-source API probe has been committed via `.github/workflows/sacred-art-kmska-89-official-source-probe-20261029.yml` and `scripts/art/probe-kmska-official-sources-20261029.mjs`; its objective is to establish a reliable current endpoint across legacy short IDs before performing all 89 official-record joins. The probe does **not** certify artwork identity by itself and may be queued; only count verified object records actually retrieved. This approach uses free official museum metadata and no photo downloads.

**Updated museum-backed evidence:** 29 CMA + 73 Met + 126 NGA + 2 KMSKA = **230/479** institution-backed source cards with independent official records, **249 remaining** (KMSKA 87; Rijks 66; SMK 54; Walters 42). The separate **305 Commons-origin** source cards are still unresolved. The accepted-to-canonical-383 identity crosswalk remains **72 linked source cards / 784 unlinked**: checking an official museum page does not itself establish sameness with a painting in the locked catalogue.

The Phase 1 validator now verifies the 89-source immutable queue, both official-page joins, their 208–210 ensemble boundary, and the zero-publication gate. **No current GitHub CI completion is claimed for these latest changes until the exact run finishes.**

### KMSKA official inventory-number bulk verification — complete, 89/89 (29 October 2026)

The official-site discovery workflow [run 40952823687](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40952823687) established that old `/collection/work/data/<shortID>` source links currently 404, and `datahub.kmska.be` was unreachable on the public GitHub runner. Instead, the museum's current inventory-number entry point `https://kmska.be/nl/meesterwerk/<inventoryNumber>` resolves to a current collection-page slug (tested with inventories 40, 208, and 209bis).

The new zero-cost read-only GitHub workflow [KMSKA 89 run 40953796725](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40953796725) then retrieved **all 89/89 official pages** and permanently committed the [full source-bound KMSKA official-inventory evidence ledger](../data/calendar/sacred-art-phase1-kmska-89-official-inventory-report-20261029.v1.json). Each of the 89 matched its frozen accession **as an explicit inventory label on the page**, its normalized title, and the official museum host. There were **0 lookup failures, 0 unresolved title/inventory differences, 0 artist-text flags**, and all **33** conditional user selections remained intact. Every source-page response has its own HTML SHA256 fingerprint; no image files were acquired or saved.

[Separate four-source physical-work evidence](../data/calendar/sacred-art-phase1-kmska-physical-special-cases-20261029.v1.json):
- Two same-title and same-artist Cossiers *Aanbidding door de herders* records are **distinct paintings**, not alternate photographs: inventory **37** (152 × 237 cm; source `kmska:4opepv`) and **40** (300 × 275 cm; source `kmska:0csw4p`). The authoritative Flemish Art Collection lists independent physical dimensions, accession numbers and original KMSKA persistent IDs.
- The centre panel **208**, Annunciation surface **209bis**, historical whole triptych **208–210**, and companion Annunciation **210bis** are related. Preserve each original source's **IMPORT/REJECT decision independently**; the whole triptych's REJECT cannot be transferred to the accepted component, nor the component's IMPORT transferred to the rejected whole or opposite wing.
- These four source-identity confirmations form a subset of the **89**, not additional works to add to the total.

**Revised museum official-object verification progress:** CMA 29 + Met 73 + NGA 126 + KMSKA 89 = **317/479 (66.2%)** institution-backed accepted cards officially checked. Remaining **162**: Rijksmuseum 66, SMK Copenhagen 54, Walters Art Museum 42. Separately **305** Commons-source cards remain for exact photographic-work reconciliation. The accepted-to-locked-canonical-383 count remains **72 linked source cards / 784 unlinked** pending *same physical work* crosswalk; do not report 89 new unique works from this official-source confirmation.

No approved photo bytes, full native visual QA, exact rights checks, artwork counts promoted to canonical 383, UI changes, public releases, or costs. The validator now checks 89/89 exact source matches, the four independent physical relations, frozen user decisions and closed publication gates; inspect the **latest** GitHub integrity workflow run before claiming this newly extended test has passed.

## Rijksmuseum — official Linked Art bulk verification complete, 66/66 (29 October)

The Rijksmuseum's [official no-key Linked Data resolver](https://data.rijksmuseum.nl/docs/http) serves accessioned artwork records as Linked Art JSON-LD; the frozen registry links each record to a canonical `https://id.rijksmuseum.nl/<objectID>` persistent URI. A three-object diagnostic [probe](../data/calendar/sacred-art-phase1-rijks-api-probe-20261029.v1.json) established the object identifier schema, including the Rijks object-number Identifier classification `https://id.rijksmuseum.nl/22015218`. The full [66-record authoritative report](../data/calendar/sacred-art-phase1-rijks-66-official-linked-art-report-20261029.v1.json) was then generated and committed by [successful GitHub Actions workflow 40955669139](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40955669139).

- **66/66** canonical persistent object IDs exactly match the frozen source IDs, and **66/66** institution-classified inventory numbers exactly match frozen accessions.
- **66/66** original titles match a museum title after normalization; **66/66** have a museum painting classification; no fetch failures or accession conflicts.
- The four original `IMPORT_WITH_CORRECTIONS` selections remain unchanged. No physical painting identity was promoted into the locked canonical 383.
- **28 source cards** need qualified artist metadata reconciliation. Earlier reviewed metadata said `Attribution not identified` or `anonymous` in many cases, while the Rijks data gives explicit *copy after*, *attributed to*, *workshop of*, *circle of*, *manner of*, signed artist, or anonymous-school details. Examples include `rijks:200108285` (copy after Bosch), `rijks:200111837` (Pieter Lastman, signed), `rijks:20027536` (workshop of Rubens), and `rijks:20027869` (circle of Rembrandt). Preserve original decisions and represent qualifiers faithfully, never implying a follower's work is autograph.
- **Four physical-type review cases**: `rijks:200108254` is classified also as wall decoration; `rijks:200109463` as an altarpiece wing; `rijks:200111840` as a triptych; `rijks:20025870` as an altarpiece wing with two painted subjects/surfaces. These classifications are **research leads**, not proof that the four are duplicates or component identifications with existing 383 works.
- Official `member_of` Set links appear on all 66 objects but refer to collection groupings; they **must not be naively interpreted as 66 historical artistic ensembles**.
- All complete source JSON responses are SHA256-fingerprinted in the research ledger. The verified output stores only necessary textual metadata, not photography or downloaded image files.

[Complete 28-author / four-work-structure exception queue](../data/calendar/sacred-art-phase1-rijks-66-curatorial-exceptions-20261029.v1.json).

**Museum identity gate:** Cleveland 29 + Met 73 + NGA 126 + KMSKA 89 + Rijks 66 = **383/479 institution-backed source cards (80.0%)** independently verified against official museum pages/metadata. Remaining **96**: SMK Copenhagen **54**, Walters Art Museum **42**. Separately **305 Commons-source cards** still require file-to-physical-work reconciliation. The accepted-to-canonical-383 crosswalk is **72 linked source cards / 784 unlinked**, unchanged; museum ID verification is not itself a link to a locked physical artwork.

No photograph/frame/crop/colour/native-resolution or image-licence certification, production import, silent attribution edit, user-approval change or cost. The Phase 1 integrity validator was extended for 66 official IDs, artist/type exception queues, frozen user decisions and release safeguards. **Its newest CI execution must be checked separately** from the successful data-harvest run.

## SMK Copenhagen — 54 official collection source records (29 October 2026)

Authoritative service: [SMK Open API documentation](https://www.smk.dk/en/article/smk-api/), `https://api.smk.dk/api/v1/art/?object_number={inventory}&lang=en`. Read-only [SMK first three API response probes](../data/calendar/sacred-art-phase1-smk-api-probe-20261029.v1.json) demonstrate live access to `KMS`, `KMSSP`, `KMSST` inventory families. The [complete 54-record source evidence ledger](../data/calendar/sacred-art-phase1-smk-54-official-object-report-20261029.v1.json) uses official API response SHA256 fingerprints, verifies accession identifiers and original titles, and preserves each selected source ID and historical editor decision. [GitHub Action run #40956781460](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40956781460) completed the 54 HTTP 200 metadata harvest and passed frozen-release gates.

### Exact object-number casing exception and resolution

The official JSON spells `KMSsp...` and `KMSst...`, while the selected source cards spell `KMSSP...` and `KMSST...`. Original strict case-sensitive logic classified 20 exact-case records as verified and 34 as pending *even though all 34 had exact museum title matches, valid HTTP responses, and case-fold-identical inventory numbers*. This is not a different artwork or object-number mismatch. The committed report records **54/54 identity and normalized title matches** after permitting **ASCII case-only** variation, of which **20 exact-case and 34 case-fold matches**, while preserving both the exact official spelling and the frozen editorial spelling on each record. No other identifier discrepancy was permitted. The source-harvest script is also corrected for future execution, so reruns do not recreate the false pending queue.

- **54/54** official source identifiers confirmed; **0** source fetch failures; **0** title mismatches after official normalization; **2** original `IMPORT_WITH_CORRECTIONS` decisions preserved.
- All **54/54** currently carry a `public_domain: true` metadata flag. **This is not photographic approval**; exact photographed subject, file size, colour, frames, native pixels, crop, licensing provenance and suitability remain separately unexamined.
- **18** records have artist qualification or attribution-history research leads, independently recorded in the [SMK curatorial exception queue](../data/calendar/sacred-art-phase1-smk-54-curatorial-exceptions-20261029.v1.json). Examples: `smk:KMS3924` is catalogued as **follower of Bosch**, not an autograph Bosch; `smk:KMS4550` carries **follower of Giordano** and past ascriptions; `smk:KMS387` is a **copy after Annibale Carracci**; `smk:KMSSP405` names **Rembrandt's workshop** and retains a historical ascription to Rembrandt. Roles such as *attributed to*, *copy after*, *follower*, *workshop*, and *earlier ascribed to* are not interchangeable.
- **Three unconfirmed physical-group leads**, based on review-title context only: dual-narrative `KMS1168`; `KMS1898` + `KMS1899` Paradise before/after Fall; `KMS6468` + `KMS6469` Prodigal Son sequence. These are not automatic duplicates, ensembles, or separate physical work-count promotions.

**Cumulative accepted museum-backed source identity:** Cleveland 29 + Met 73 + NGA 126 + KMSKA 89 + Rijksmuseum 66 + SMK 54 = **437 / 479 (91.2%)**. Remaining museum institution: **Walters Art Museum 42**. The separate **305 Commons-origin unlinked source cards** remain untouched by these official museum identity passes. The 856-to-locked-canonical-383 crosswalk stays **72 source cards linked / 784 unlinked**; independently proving a museum entry exists is **not proof of identity with an artwork already in the canonical 383**.

No new exact image rights, frames/crops/native visual quality, physical uniqueness, production imports, spending, or changes to the original 2,455 editor decisions. The Phase 1 validator now protects all 54 SMK exact/case-only matches, 18 author-review leads, frozen decisions and zero-publication gates. Verify the new CI run separately; its successful output must not be inferred from source-harvest success.

## Walters Art Museum — institutional source identity closure (30 October 2026)

The Walters' historical live API was retired in 2023. Its official [static collection-data repository](https://github.com/WaltersArtMuseum/api-thewalters-org) provides `art.csv` (22,193 object records) and `relationships.csv` (6,749 explicit object relationship records) under the museum's stated CC0 data policy. The repository's official artefacts were fetched in GitHub Actions without collecting image bytes; CSV content SHA256 checksums are retained in the [complete 42-source machine join report](../data/calendar/sacred-art-phase1-walters-42-official-csv-report-20261030.v1.json).

**Official archived institution source identifiers: 42/42.** Each of the 42 selected source cards matched all four independently stored institutional fields: its numeric `ObjectID`, accession `AccessionNumber`, normalized museum `Title`, and exact source `ResourceURL`. **0 missing records or conflicts**; both original `IMPORT_WITH_CORRECTIONS` decisions preserved. The authoritative [bulk workflow #41002001851](https://github.com/Fulcanelli13/ad-orientem/actions/runs/41002001851) passed.

A separate live-site [current museum page audit](../data/calendar/sacred-art-phase1-walters-42-current-page-report-20261030.v1.json) independently confirmed **38** selected art pages through official HTML document title and accession labels. The other **four** current pages returned HTTP **403** to the GitHub runner: source IDs `walters:1016`, `walters:12854`, `walters:14271`, `walters:15290`. These four still **have exact official archived CSV matches**; do not present them as directly scraped current-page proofs. The first run had incorrectly required a server-rendered `<h1>` on the Walters website; the site does not expose one in its returned HTML, so 38 exact page-title and accession proofs were recovered from the already downloaded HTML `<title>` metadata without making new or fabricated requests. Both the report and its verifier were corrected. **This is a transparent verification-method correction, not an artistic change.**

[Separate curatorial exception registry](../data/calendar/sacred-art-phase1-walters-42-curatorial-exceptions-20261030.v1.json):
- **Seven independent inventory numbers for seven painted Passion altarpiece panels** (`37.663`, `37.664`, `37.667`, `37.668`, `37.669`, `37.670`, `37.671`). The museum explicitly links the seven accepted paintings through `See Also, Part of Set` relations. They remain **seven distinct selected physical panel records belonging to a historical ensemble**, not seven duplicates, and a separately created eighth whole-object record is **not** implied by this identity pass. The related `37.674` panel is not in the 42-source accepted set.
- `walters:82254`, inventory `37.531B`, is the **Saint Louis[e] of Toulouse component** within Cristoforo Caselli's larger triptych, parent accession `37.531`, museum object ID `3723`; the official `relationships.csv` explicitly marks it **Component** to **Whole**. Historic English museum record spells the reviewed source title *Saint Louise of Toulouse*, while the whole ensemble is labelled *Saint Louis of Toulouse, Saint Francis, and the Blessed John Capistrano*. This naming discrepancy is editorial review only; no silent rewriting or approval-transfer to the whole.
- `walters:22554`, inventory `37.776`, *Passion of Christ*, is one Netherlandish painting showing multiple biblical episodes as a continuous narrative, **not** a stack of separate physical painted panels.
- `walters:16411`, inventory `37.788`, Rottmayr *Deposition*, is a **preparatory oil sketch**, not the commissioned larger monastery altarpiece.
- **Five artist/source qualifier cases**: `37.234`, Van Dyck *and workshop*; `37.582`, **Domenico Fetti copy after Titian**, not Titian autograph; `37.509`, Luini / Solario stylistic and disputed attribution; `37.372`, **Jan Boeckhorst (?)**, *style of Van Dyck* rather than Van Dyck autograph; `37.256`, one Pieter Coecke creator repeated in the imported source artist field. All source user choices unchanged.

### Close of museum-backed identity phase, and what remains

**479/479 institution-backed accepted-source identities independently verified** by combinations of official object pages, authoritative museum data files and accession IDs:
Cleveland **29**, Metropolitan Museum **73**, National Gallery of Art **126**, KMSKA Antwerp **89**, Rijksmuseum **66**, SMK Copenhagen **54**, Walters **42**. This closes *museum source identity verification*, not the app's artwork inventory. It does not establish that 479 correspond to 479 unique new paintings, or that any is physically identical with an already locked canonical artwork.

The broader accepted-to-canonical-383 evidence crosswalk remains **72/856 linked cards, 784/856 unlinked**. The remaining 784 comprise **479 now-museum-source-verified but still unlinked** plus **305 Commons-origin unlinked cards**. The next high-volume programme should **reconcile the 305 Commons-origin source cards against physical artwork IDs**, with explicit source file identity and author/rights information; then perform cross-institution work identity linkage and unique-work deduplication, while preserving every frozen editorial decision.

Neither the museum source identity passes nor their CC0 statements are *exact photograph certification*: frames, native pixel quality, colour fidelity, crop suitability and photographic provenance must pass separate per-image gates. **No new canonical 383 links, physical uniqueness promotions, exact image rights/visual approvals, or production imports were made; €0 spent.**

The Phase 1 integrity validator now asserts the Walters source four-way joins, the 38+4 current-page outcomes, physical grouping exception safeguards and the 479/479 master status. The newest expanded CI outcome must be checked separately after this validator edit.
