# Ad Orientem — Sacred Art image-selection queue (10 November 2026)

## What this register is

Research-only editorial and image-acquisition queue. It is **not** the published gallery, not a list of owner approvals, and not an image-import manifest. The source of truth for previously accepted and rejected original artworks remains the historical decision evidence and applicable release gates.

- Machine-readable registry: `m2m-consolidated-image-selection-queue-20261110.v1.json`
- Structural gate: `tests/sacred-art-consolidated-image-selection-queue-research.test.mjs`
- Source ledger: `m2m-calendar-prepublication-triage-198-20261110.v1.json`, five 68-key oil audit batches and the original-photo verification ledgers
- **198** dated research relationships, **151** original distinct research keys; **167/170** originally unmatched dates have an integrated research lead
- **68/68** priority direct-subject oil keys triaged; **9 additional original research keys** have an oil-medium relationship outside that exact-priority group — do not misreport 68 as all oil works
- **156** queue keys: 151 originals + 2 distinct unapproved alternatives (Ribera and Wenceslas burial) + 3 supplementary March leads (outside historical 198-edge denominator)
- **170** original gap-date holds, including March 2, 10 and 11. The three supplemental leads are separately recorded but do **not** silently change the official 362/365 research coverage figure
- **Ten** exact JPEG files retrieved and hashed from original museum/institutional download servers: 8 from original research artwork keys and 2 unapproved distinct alternatives (Ribera and Met Wenceslas). GitHub Actions copies are short-lived, not durable publication assets
- **Zero** new date approvals, **zero** formal in-app container crop approvals, **zero** new published photos

## How to read the data

`works[]` contains a unique artwork or provisional research key. `edgeIds[]` and `candidateDates[]` preserve many-to-many relationships. `photographs[]` is a separate entity: one artwork can have different photographic files, licences and QA results. `dates[]` preserves 170 individual decisions/holds and indicates if the March supplemental research remains unintegrated.

`lane` is an **operational triage lane**, not a score or a new artistic selection. `sourceAuditRightStatus` describes original recorded evidence, and `sourceAuditNote` preserves attribution/source caveats. `verifiedPhotoId` is populated only when the exact original file was acquired and its hash established. `releaseReady`, `ownerApprovalForAnyNewDate` and date approval flags must stay false until an explicit future release decision.

## Ten verified originals — distinct editorial tasks

| Image key | Date relationship | Licence evidence | Current composition decision |
|---|---|---|---|
| `Met:724811` — Costanzi, Joseph of Cupertino | 18 September | Met CC0 | Portrait provisionally usable; wide cut excludes vertical narrative. Oil sketch, not full altarpiece. |
| `Met:435901` — Cima, Francis and Clare | 12 August | Met CC0 | Wide provisionally usable; portrait cover crops the two flanking saints. |
| `Met:469892` — Bishop gives palm to Clare | 12 August | Met CC0 | Portrait provisionally usable; wide crop loses bishop and lower scene. Non-Baroque gold ground. |
| `Met:1991.153` — Fetti, Mote and Beam | 2/3 June | Met CC0 | Portrait nearly complete; wide can show central parable but is only a partial composition. |
| `Walters:37.453` — Pope Pius V | 5 May | Walters CC0 | Portrait preserves face, book and blessing; wide cut unsuitable. Workshop-replica attribution. |
| `Wellcome:45078i` — Droochsloot, Great Supper | 7 June | Wellcome V0017627 historical CC BY 4.0; **current exact-file rights signoff pending** | Wide nearly complete; portrait centre-cover loses about 58% of source image area. |
| `Pinakothek:909` — Ribera, Peter of Alcántara | 19 October, **external alternative only** | Bavarian State Painting Collections CC BY-SA 4.0 | Dark Baroque portrait; portrait provisionally usable, wide unsuitable. Never replace the earlier Walters miracle automatically. |
| `Rijks:SK-A-868` — van Rijck (attributed), Rich Man and Lazarus kitchen | 5 March | Rijksmuseum public domain, exact official IIIF bytes verified | **Acquired but NOT a mobile Gospel hero:** Lazarus and the rich man are tiny figures in the upper-right background; gallery-only candidate unless owner explicitly approves a coherent presentation. |
| `MSKGent:S-43` — Luigi Primo, St Raymond of Peñafort venerating the Christ Child | 23 January | MSK Ghent IIIF Public Domain Mark; online collection reuse allowed, commercial/publication terms separately qualified | **Original acquired but hero HOLD:** very tall 2,000×3,887 image, conspicuous diagonal mark, portrait cover loses sections of narrative. Use contain or hold; require final rights and editorial approval. |
| `Met:437005` — Master of Eggenburg, Burial of Saint Wenceslas | 28 September, **external unapproved alternative** | Met official Open Access CC0, full original JPEG independently SHA-verified | 2,453 × 3,832 portrait, burial scene legible. **Different scene, Gothic rather than Baroque**; do not replace Škréta cycle. Source photo QA only, no owner selection or app crop approval. |

All ten still need in-app 320/390px visual QA, correct source-specific licence/attribution handling, and explicit owner date approval. A technical or aesthetic preference in this document is not an authorization to publish.

## Exception decisions

1. **Walters 37.1146 — Saint Peter of Alcántara:** first-party and donated Commons photographs are monochrome. Keep the original record; a photo's grayscale issue is not a reason to misdescribe the oil as monochrome. Ribera is a separate painting of the same saint, not the same miracle.
2. **ICCD 0900053335 — Saint John Leonardi:** original work key remains uncorroborated. A different exact-saint record was found elsewhere; no automatic substitution or canonical ID repair.
3. **ICCD 0500404703 — Angela Merici:** 1931 work by Agostino Pegrassi (d. 1957). Assess underlying painting copyright in addition to image reuse.
4. **Restricted photographs:** no noncommercial-only, private/copyright-marked, Prado, or unclear-rights original may be promoted solely because the underlying painting is old.
5. **March supplemental leads:** two illustrations cover a subset of the appointed Gospel; one Tissot image is contextual to John 8 only. They require scene verification and remain outside the integrated 198 relationships.
6. **Owner protection:** all 103 globally rejected original artwork identities, 507 owner-accepted Prayer alternatives, 27 protected Prayer NONE positions, and all previous selected/gallery works remain untouched.

## Latest acquisition batch: original-source verification

- Rijksmuseum SK-A-868 was downloaded from its **official linked-data / IIIF image** as a 6,132 × 4,483 RGB JPEG. SHA-256: `507a9317f4aaa9a8ba217aa1d75a889a2f82cc2233a93484d1ab955e7d93ca73`. Its historical owner date status is unchanged, and the Gospel scene is visibly small on mobile. Full-image gallery option only, not automatic 5 March hero.
- Nationalmuseum NM420 and NM1134 are marked public domain, but their exact object-linked JPEG endpoints returned **HTTP 403** in the controlled source acquisition run. These are **0 acquired photographs**, not two successes.
- Source proof: `m2m-open-colour-batch2-source-verification-20261110.v1.json`; official acquisition manifest: `m2m-open-colour-photo-batch2-nationalmuseum-rijks-20261110.v1.json`.

## Museum photo-rights filter — 10 November

The existing direct-source photo search queue was reduced from **49 to 40** keys after a policy review of **9** museum photograph records. They moved into the separate restricted-source lane (**18 total**, including the prior 9). **No artwork was deleted or globally rejected.** The underlying paintings may still qualify if an independently reliable, commercially reusable colour reproduction is identified and passes exact-photo rights and quality QA.

- Six Louvre artwork keys: commercial gallery/app use is outside the Louvre collections site's no-fee purposes and requires a separate reproduction licence. This is **not** an open photography source for Ad Orientem.
- One Cincinnati Art Museum original (Zurbarán's Peter Nolasco): the museum sends high-resolution commercial publication image use to Bridgeman licensing.
- One Timken Museum Bruegel (*Parable of the Sower*): reproduction permission is required; its 2026 schedule explicitly lists commercial fees, so no direct museum-photo acquisition.
- One Kunsthistorisches Museum Veronese (*The Raising of the Youth of Nain*): no identified blanket commercial-use authorisation for its photographs; hold official images.
- MSK Ghent S-43 and two Kraków National Museum sources are now in a **separate three-item technical acquisition probe**. Images are not licensed for app use merely because a research download succeeds. The MSK collection allows reuse of collection-site resolutions, but high-resolution/commercial usage calls for separate review or Art in Flanders item-specific open image evidence.

Review ledger: `m2m-open-source-batch3-msk-mnk-20261110.v1.json`. Acquisition source code: `scripts/sacred-art-acquire-msk-mnk-batch3.py`. No fees or contact requests have been made.

## ICCD official-image policy — decisive 27-key reclassification

On 10 November, the Italian Ministry's official [Catalogo generale terms](https://www.catalogo.beniculturali.it/termini-uso) were checked. The catalogue's Creative Commons CC BY 4.0 licence **does not automatically grant reuse of its photographs**: photographs require a reproduction request to the relevant authority and can incur fees. The same restriction is reiterated in the [ICCD photo reproduction guidance](https://www.iccd.beniculturali.it/it/consultazione-riproduzione-immagini). Since Ad Orientem will neither seek paid rights nor contact institutions, **27 exact ICCD original oil work keys have been moved from active official-image acquisition into the distinct open-photo-equivalent search lane**. This is a **photo-source restriction only**, not rejection of the underlying original paintings, which can qualify with a separately documented, genuinely open exact reproduction.

**Earlier interim census (before final eight-source triage):** 8 directly actionable first-party/open-source searches, 4 browser-only portal records and 45 restricted institutional photographs, with nine verified museum originals. **This has been superseded by the final current census below.** The 155 candidate artwork keys and 198 original relationship edges are unchanged.

## Recovery routes and the first MSK/Kraków job

- Nationalmuseum launched its own [public high-resolution media portal](https://media.nationalmuseum.se/search/all) in June 2025. NM420 and NM1134 should be searched by **inventory number** there and matched to an exact media record with its own licence. This avoids retrying the blocked collection-site .large.jpg URLs. The first-party media IDs and bytes have **not** been identified or approved. Non-handpicked Commons files remain excluded.
- The initial MSK Ghent/Kraków batch3 run **42821076217** attempted three artworks but acquired **zero**. The older MSK IIIF parser did not find a unique service; the exact service ID and photographer from the museum manifest have now been recorded, and the code corrects the lookup using the specifically pinned service. Both Kraków pages exposed no object-linked og:image, so those remain source-image discovery holds.
- **The corrected MSK run succeeded**: official S-43 IIIF JPEG 2,000 × 3,887, independent SHA-256 `b4ee3e06d0ec7de6b9ade82502e80098e564d50157a0d284a2a0b563da9c134b`. The cropped mobile hero is unsuitable without explicit review: very tall narrative image and a prominent diagonal line of unknown origin. The museum marks the source image Public Domain, but separate MSK published terms refer commercial uses and publications to Art in Flanders; no paid licensing or outreach is authorised. Both Kraków originals remain without object-specific image links.

## Exact museum portal discovery — completed technical investigation

GitHub Actions run **42837900450** checked Nationalmuseum NM420 and NM1134 via the Nationalmuseum media search, and Kraków MNK II-a-448 and MNK II-a-9 via their original object pages. All four websites returned **JavaScript application shells**, not server-rendered asset URLs: Nationalmuseum returned 1,129-byte shells for each query, while the Kraków pages returned 2,621-byte shells without their accession or any image/download anchors. The probe passed as an investigation, but **0 new photographs were retrieved**.

These four are now in a distinct **client-rendered museum portal** lane. Do not send more static GET or og:image probes to the same URLs. Obtain an exact named photo through the browser-rendered public download action or a documented institutional API before running image-size/colour, SHA and licence checks. The pre-existing nine verified museum photographs and all owner selections remain unchanged.

The two Kraków subjects have also been disentangled from misleading historical labels: Tadeusz Kuntze's **MNK II-a-448** illustrates Saint John Cantius repairing a poor woman's broken milk jug and restoring the milk. Juliusz Knoor's **MNK II-a-9** shows Saint Stanislaus **excommunicating King Bolesław**, not the martyrdom or murder of Stanislaus. Do not apply the image to a martyrdom-scene target solely because the museum lists older alternate titles. Neither is newly approved.

Research evidence: `m2m-museum-portal-static-client-blockers-20261110.v1.json`. The separate research manifest and source scanner remain in the same directory.

## Latest source-closure milestone — direct acquisition exhausted

The last eight source-photo leads have been examined against institution-specific image reuse policies and actual object-page files. The result is **four newly restricted official photo sources** (Thoma/Athanasius; UMMA/Champaigne; Lombardia/Gregory Barbarigo; Olomouc/Wenceslas), **two object records lacking a downloadable exact painting photo** (IAPH/Claret and POP/de La Salle), and **two source-specific unresolved cases** (Holburne/Andrew Avellino attribution and photograph; Lviv/Hedwig photograph rights). The first-party direct acquisition lane has therefore been closed at **0**, rather than being retried indefinitely.

**Current research source census, 10 November 2026:** ten acquired photo files, **49** restricted institution-selected photographs (candidate artworks are not rejected), **4** client-rendered portal holds, **2** object-only/no-file records, **2** unresolved rights/identity records, and zero original first-party photographs presently approved for new date placement. The 156 review artwork keys include the new Met Wenceslas burial as a separate unapproved alternative; the original 151 keys and 198 historical research edges are preserved.

The source decision ledger is `m2m-eight-priority-oil-source-closure-20261110.v1.json`. Read its policy URLs before reclassifying a painting, and never conflate object public-domain status with its digital photo.

### Replacement research strategy

Open a new research-only lane with **three institutional APIs providing documented commercial-use-friendly open-access/CC0 images**: Cleveland Museum of Art, the Metropolitan Museum of Art (use the current `/v1.1/search` endpoint, not its retired predecessor), and the Art Institute of Chicago. Target the same eight saint/Gospel subjects first, using 24 bounded search queries and filters for paintings, public-domain original works and a declared image source. Records returned by these APIs are not automatically exact-iconographic matches or owner selections; they must first pass visual scene identity, non-rejection, and in-app crop checks. See `m2m-open-museum-alternatives-batch4-20261110.v1.json`.

## First independently open Wenceslas alternative — research only

An explicit institutional catalogue match is now recorded at the Met: **Master of Eggenburg, *The Burial of Saint Wenceslas*, 44.147.2, object 437005**, c.1490–1500, oil and gold on spruce. The museum declares the object **Public Domain** and provides its official collection API. This is distinct from Škréta's Saint Wenceslas preparing Eucharistic hosts, with a **different scene** and **non-Baroque** visual style, and has **no previous owner approval**.

Manifest: `m2m-met-437005-wenceslas-alternative-20261110.v1.json`.
Acquisition workflow: `.github/workflows/sacred-art-met-wenceslas-alternative.yml`; reusable official Met object-ID fetch script: `scripts/sacred-art-acquire-met-verified-object.py`. Only exact first-party original JPEG bytes and new SHA may establish an acquired tenth image; no Commons promotion or Calendar assignment is permitted.

## Batch 4 outcome — screened metadata and one new verified Met original

Official API search run **42855524422** made **85 bounded API requests** across the Met, Cleveland Museum of Art and Art Institute of Chicago and returned **35 raw photo-linked painting records** for eight original saints/Gospel subjects. Iconographic screening excluded **33** wrong subjects and retained just **2** distinct thematic alternatives:

1. **Met 437005 — The Burial of Saint Wenceslas**, Master of Eggenburg, oil and gold on spruce. Same saint but different funeral narrative from Škréta's Eucharistic-preparation cycle. **Actual first-party original acquired** under separate run **42855525191**; JPEG 2,453 × 3,832, SHA-256 `468b1255c8114607a665e38f81da679409166da76aa0f42cf82bc3c41c1c4608`, CC0 marked by Met. Portrait may preserve the full burial; wide cover does not. Never auto-promote or treat as owner-approved.
2. **Art Institute of Chicago 111444 — Retable of Saints Athanasius, Blaise, and Agatha**, Master of Riglos, tempera on panel. Contains the saint, but it is a multi-scene late-Gothic retable, **not** a straightforward Athanasius Baroque portrait or oil painting. No new source photo acquired, no placement proposed.

All 33 other API hits are irrelevant subjects, not 33 newly curated artworks. The AIC name search was particularly imprecise; e.g. Andrew Avellino became Apostle Andrew or an unrelated Andrew, while Jean Baptiste de La Salle returned painters with Jean-Baptiste as given names. Keep the editorial screening instead of recursively acquiring image files for these hits.

Evidence: `m2m-cc0-batch4-exact-iconographic-screening-20261110.v1.json`, `m2m-met-437005-verified-native-photo-20261110.v1.json`. Both new research alternatives are separate from the existing Calendar 198 edges, existing approved works, and 103 globally rejected historical artwork IDs. Full owner-rejection recheck remains pending for Wenceslas before any future gallery placement.

## Next operational sequence

1. Inspect the ten acquired originals together using actual application container geometry at 320px and 390px, preserve full artwork when cover crops remove saints or central narrative, and confirm accurate artist/copy attributions. Do not require the owner to review every unpromising source.
2. Resolve Wellcome's current photo-ID licence and associated attribution. For Ribera, preserve CC BY-SA 4.0 and note crop/modification obligations.
3. **Zero** original priority-oil artworks remain in the directly actionable first-party photograph queue; all eight were reconciled into explicit access/rights/identity holds. Switch to cross-institution open-access **alternative artwork discovery**, while preserving the original accession keys and owner's previous selections.
4. Handle the **45** institutionally restricted source-image records, **one** grayscale-only, **one** artwork copyright hold and **one** unresolved identity key explicitly; do not disguise them as completed images.
5. Check the **83** original research keys outside the priority oil group, including the **9 additional oil-medium candidates**, without misclassifying prints and watercolours as oil.
6. Only after editorial signoff, build a **separate** release-candidate manifest that includes image bytes, stable checksum, source, licence, attribution, final crop and approved date. Never feed this research JSON into runtime directly.

The 195 previously named Calendar dates are outside this historic 170-gap audit. This queue **does not** claim to have revalidated all those earlier hero assets or all Prayer artwork. Keep that population separate from the 156 currently staged research and alternative artwork keys.
