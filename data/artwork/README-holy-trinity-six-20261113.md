# Ad Orientem Holy Trinity — owner-selected gallery, source-quality closeout (14 November 2026)

The owner has selected **exactly six historic paintings** for the curated Sacred Art gallery: numbers **1, 2, 3, 4, 8, 9**. Selection is artwork-level and remains locked. The app's cinematic camera can navigate wide paintings: aspect ratio is **not** a reason to reject or substitute a work.

The records are in `src/art/sacred-art-holy-trinity-owner-selected.v1.js` and integrated only with the **curated artwork taxonomy**, not the published photo registry, Prayer module, calendar or production app. Dürer is linked to the existing frozen research group `HERO::khm:GG-838`; no extra 989-work research group was created.

## Actual files, not merely source leads

All six authentic-source JPEGs were acquired and SHA-256 checked in separate, downloadable research archives. Source-pixel dimensions and hashes are in `data/artwork/holy-trinity-six-reproduction-quality-audit-20261114.v1.json`. Full-source review ZIP: **`Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip`**. Mobile quality pass: **`Ad_Orientem_Holy_Trinity_Mobile_Quality_Pass_2026-11-14.zip`**. These conversation files are **not** installed into either GitHub app repository.

| Owner selection | Exact object and image source | Verified master | Photograph status / next step |
| --- | --- | --- | --- |
| **1** Rubens, *Holy Trinity* (1620) | [KMSKA 314](https://kmska.be/en/masterpiece/the-holy-trinity) · [CC0 source](https://vlaamsekunstcollectie.be/en/collection/314) | **19,178 × 19,721** / 56.2 MB | CC0; excellent clean master; WebP variants 768/1200/2000/3200 long edge, ready for final image visual acceptance, **not deployed** |
| **2** Guido Reni, *Holy Trinity* (1625–26) | [Roman original](https://catalogo.beniculturali.it/detail/HistoricOrArtisticProperty/1200145358) · [reference image](https://commons.wikimedia.org/wiki/File:La_Trinit%C3%A0_-_Guido_Reni.jpg) | **634 × 1,193** | **Hold**: inadequate clean-master resolution. Larger church-installation photographs and the different Osimo Trinity are not substitutes. Factum recorded an excellent scan but did not provide a verified free releaseable master. |
| **3** Carlo Dolci, *Trinity in Glory* (c. 1640) | [RISD Museum 59.009](https://risdmuseum.org/art-design/collection/trinity-glory-59009) | **877 × 1,024** | Exact museum object's CC0 image acquired. Clean colour but limited detail; no upscaling or deep-zoom animation. API and catalogue probe from GitHub returned HTTP 403; no bigger free public source verified. |
| **4** Tiepolo, *A Vision of the Trinity* (c. 1735–39) | [London National Gallery NG6273](https://www.nationalgallery.org.uk/paintings/giovanni-battista-tiepolo-a-vision-of-the-trinity) · [Yorck Project photograph](https://commons.wikimedia.org/wiki/File:Giovanni_Battista_Tiepolo_094.jpg) | **2,024 × 2,623** | **Hold**: independent Commons PD-Art claim does not constitute museum CC0. [National Gallery terms](https://www.nationalgallery.org.uk/terms-of-use) restrict official downloads to non-commercial NC-ND; independent photo rights and warm colour balance need further review. The Munich altarpiece is a different work and is **not** substituted. |
| **8** Dürer, *Adoration of the Holy Trinity* (1511) | KHM **GG 838** · [Google Art Project reproduction on Commons](https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Adoration_of_the_Trinity_(Landauer_Altar)_-_Google_Art_Project.jpg) | **4,969 × 5,434** | Excellent clean, frameless source but **hold** for source-specific rights review. Official [KHM image terms](https://shop.khm.at/en/general-terms-and-conditions) are restrictive; Commons' PD-Art description is legally distinct from museum authorisation. |
| **9** José Campeche, *The Trinity* (c.1790) | [The Met 2025.244](https://www.metmuseum.org/art/collection/search/917618) · [actual full-size source](https://images.metmuseum.org/CRDImages/ad/original/DP-44679-003.jpg) | **2,700 × 4,000** / 3.69 MB | Met Open Access CC0. Derivatives trim only the black studio background while preserving the painting boundary; 768/1200/2000/3200 long-edge options; full master unmodified. |

## Source-file and production distinction

- The archival source originals are immutable in the ZIP. No source JPG is replaced with a compressed derivative.
- Responsive WebP files for **1/3/9** are review candidates only. The 6 MB mobile-quality ZIP has WebP previews for the three held paintings in an expressly separate `reference_only_NOT_CLEARED/` directory.
- Image metadata includes exact pixel dimensions, file bytes, SHA-256 and image-use status. No fabricated larger file, no AI enhancement, no regrading and no aspect-ratio forcing.
- The painted surface must remain visible in full; cinematic navigation may pan through the painting without destructive cropping.
- The user did **not** authorise contacting museums, paying for image licences, inventing a replacement painting, reassigning Prayer slots, or putting research work directly into the new `ad-orientem-production` repository.
- The current branch/PR does **not** publish new images, add physical master bytes to Git, or change the existing 16 released exact-photo entries.
- Source research may continue for Reni, Dolci, Tiepolo and Dürer. Record real holds instead of creating a fake image-ready status.

## Evidence and test

- Exact source/quality audit: `data/artwork/holy-trinity-six-reproduction-quality-audit-20261114.v1.json`
- Run `node tests/sacred-art-holy-trinity-owner-selection.mjs` to assert six selected works, one pre-existing Dürer group link, no new Prayer assignments and no production photograph releases.
- The temporary GitHub Actions research artifacts were successfully generated on 14 November 2026; their 30-day retention is not permanent gallery hosting. The complete user-facing ZIP packages are separate deliverables.
