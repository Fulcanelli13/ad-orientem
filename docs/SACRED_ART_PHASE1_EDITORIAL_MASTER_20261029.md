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

