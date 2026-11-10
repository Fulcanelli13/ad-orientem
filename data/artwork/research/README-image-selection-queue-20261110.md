# Ad Orientem — Sacred Art image-selection queue (10 November 2026)

## What this register is

Research-only editorial and image-acquisition queue. It is **not** the published gallery, not a list of owner approvals, and not an image-import manifest. The source of truth for previously accepted and rejected original artworks remains the historical decision evidence and applicable release gates.

- Machine-readable registry: `m2m-consolidated-image-selection-queue-20261110.v1.json`
- Structural gate: `tests/sacred-art-consolidated-image-selection-queue-research.test.mjs`
- Source ledger: `m2m-calendar-prepublication-triage-198-20261110.v1.json`, five 68-key oil audit batches and the seven original-photo verification records
- **198** dated research relationships, **151** original distinct research keys; **167/170** originally unmatched dates have an integrated research lead
- **68/68** priority direct-subject oil keys triaged; **9 additional original research keys** have an oil-medium relationship outside that exact-priority group — do not misreport 68 as all oil works
- **155** queue keys: 151 originals + 1 Ribera unapproved alternative + 3 supplementary March leads (outside the historical 198-edge denominator)
- **170** original gap-date holds, including March 2, 10 and 11. The three supplemental leads are separately recorded but do **not** silently change the official 362/365 research coverage figure
- **Seven** exact JPEG files retrieved and hashed from original museum/institutional download servers: 6 for original priority candidates and 1 Ribera alternative. GitHub Actions copies are short-lived, not durable publication assets
- **Zero** new date approvals, **zero** formal in-app container crop approvals, **zero** new published photos

## How to read the data

`works[]` contains a unique artwork or provisional research key. `edgeIds[]` and `candidateDates[]` preserve many-to-many relationships. `photographs[]` is a separate entity: one artwork can have different photographic files, licences and QA results. `dates[]` preserves 170 individual decisions/holds and indicates if the March supplemental research remains unintegrated.

`lane` is an **operational triage lane**, not a score or a new artistic selection. `sourceAuditRightStatus` describes original recorded evidence, and `sourceAuditNote` preserves attribution/source caveats. `verifiedPhotoId` is populated only when the exact original file was acquired and its hash established. `releaseReady`, `ownerApprovalForAnyNewDate` and date approval flags must stay false until an explicit future release decision.

## Seven verified originals — distinct editorial tasks

| Image key | Date relationship | Licence evidence | Current composition decision |
|---|---|---|---|
| `Met:724811` — Costanzi, Joseph of Cupertino | 18 September | Met CC0 | Portrait provisionally usable; wide cut excludes vertical narrative. Oil sketch, not full altarpiece. |
| `Met:435901` — Cima, Francis and Clare | 12 August | Met CC0 | Wide provisionally usable; portrait cover crops the two flanking saints. |
| `Met:469892` — Bishop gives palm to Clare | 12 August | Met CC0 | Portrait provisionally usable; wide crop loses bishop and lower scene. Non-Baroque gold ground. |
| `Met:1991.153` — Fetti, Mote and Beam | 2/3 June | Met CC0 | Portrait nearly complete; wide can show central parable but is only a partial composition. |
| `Walters:37.453` — Pope Pius V | 5 May | Walters CC0 | Portrait preserves face, book and blessing; wide cut unsuitable. Workshop-replica attribution. |
| `Wellcome:45078i` — Droochsloot, Great Supper | 7 June | Wellcome V0017627 historical CC BY 4.0; **current exact-file rights signoff pending** | Wide nearly complete; portrait centre-cover loses about 58% of source image area. |
| `Pinakothek:909` — Ribera, Peter of Alcántara | 19 October, **external alternative only** | Bavarian State Painting Collections CC BY-SA 4.0 | Dark Baroque portrait; portrait provisionally usable, wide unsuitable. Never replace the earlier Walters miracle automatically. |

All seven still need in-app 320/390px visual QA, correct source-specific licence/attribution handling, and explicit owner date approval. A technical or aesthetic preference in this document is not an authorization to publish.

## Exception decisions

1. **Walters 37.1146 — Saint Peter of Alcántara:** first-party and donated Commons photographs are monochrome. Keep the original record; a photo's grayscale issue is not a reason to misdescribe the oil as monochrome. Ribera is a separate painting of the same saint, not the same miracle.
2. **ICCD 0900053335 — Saint John Leonardi:** original work key remains uncorroborated. A different exact-saint record was found elsewhere; no automatic substitution or canonical ID repair.
3. **ICCD 0500404703 — Angela Merici:** 1931 work by Agostino Pegrassi (d. 1957). Assess underlying painting copyright in addition to image reuse.
4. **Restricted photographs:** no noncommercial-only, private/copyright-marked, Prado, or unclear-rights original may be promoted solely because the underlying painting is old.
5. **March supplemental leads:** two illustrations cover a subset of the appointed Gospel; one Tissot image is contextual to John 8 only. They require scene verification and remain outside the integrated 198 relationships.
6. **Owner protection:** all 103 globally rejected original artwork identities, 507 owner-accepted Prayer alternatives, 27 protected Prayer NONE positions, and all previous selected/gallery works remain untouched.

## Next operational sequence

1. Inspect the seven acquired originals together using actual application container geometry at 320px and 390px, preserve full artwork when cover crops remove saints or central narrative, and confirm accurate artist/copy attributions. Do not require the owner to review every unpromising source.
2. Resolve Wellcome's current photo-ID licence and associated attribution. For Ribera, preserve CC BY-SA 4.0 and note crop/modification obligations.
3. Among the **50** distinct priority oil works in `C_LOCATE_REUSABLE_COLOUR_SOURCE`, prefer accessible institutional full-colour files with explicit reuse permissions; avoid restricted official photos and investigate equivalent reliable sources rather than paying or contacting museums.
4. Handle the **9** restricted image files, **one** grayscale-only, **one** artwork copyright hold and **one** unresolved identity key explicitly; do not disguise them as completed images.
5. Check the **83** original research keys outside the priority oil group, including the **9 additional oil-medium candidates**, without misclassifying prints and watercolours as oil.
6. Only after editorial signoff, build a **separate** release-candidate manifest that includes image bytes, stable checksum, source, licence, attribution, final crop and approved date. Never feed this research JSON into runtime directly.

The 195 previously named Calendar dates are outside this historic 170-gap audit. This queue **does not** claim to have revalidated all those earlier hero assets or all Prayer artwork. Keep that population separate from the 155 newly reviewed research keys.
