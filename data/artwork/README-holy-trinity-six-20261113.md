# Holy Trinity — six owner-selected works (13 November 2026)

Scope: **artwork-level curated-gallery admission**, not image-byte acquisition, a new liturgical placement, or production deployment.

The user explicitly selected works #1, #2, #3, #4, #8 and #9 from the Holy Trinity review. They are now represented in `src/art/sacred-art-holy-trinity-owner-selected.v1.js` and included in the category index by `src/art/sacred-art-taxonomy-v1.js`. Each record has `categoryIds: ["TRINITY", ...]`, `ownerApproval: APPROVED_FOR_CURATED_GALLERY`, catalogue identity, candidate photograph link, independently tracked photo-rights and quality states, and explicit holds against photo release.

| Selected work | Catalogue / object | Photo status |
| --- | --- | --- |
| 1. Peter Paul Rubens, *The Holy Trinity* (1620) | [KMSKA 314](https://kmska.be/en/masterpiece/the-holy-trinity), [CC0 image declaration](https://vlaamsekunstcollectie.be/en/collection/314) | High-resolution Commons reproduction identified; original not acquired |
| 2. Guido Reni, *The Holy Trinity* (1625–26) | [Italian Ministry of Culture object record](https://catalogo.beniculturali.it/detail/HistoricOrArtisticProperty/1200145358) | Hold: existing clean photo insufficient for cinematic/mobile master; reproduction rights not independently cleared |
| 3. Carlo Dolci, *The Trinity in Glory* (c.1640) | [RISD 59.009](https://risdmuseum.org/art-design/collection/trinity-glory-59009) | RISD CC0; available public copy relatively small; original not acquired |
| 4. Giovanni Battista Tiepolo, *A Vision of the Trinity* (c.1735–39) | [National Gallery NG6273](https://www.nationalgallery.org.uk/paintings/giovanni-battista-tiepolo-a-vision-of-the-trinity) | Independent Commons copy is a candidate only; do not treat National Gallery reproduction terms as CC0 |
| 8. Albrecht Dürer, *The Adoration of the Holy Trinity* (1511) | [KHM GG 838 / Google Arts & Culture](https://artsandculture.google.com/asset/adoration-of-the-trinity-landauer-altar/_wGp9zTkz0OVqQ) | Links existing frozen 989 group **HERO::khm:GG-838**; independent Commons reproduction rights review pending |
| 9. José Campeche, *The Trinity* (c.1790) | [Met 2025.244 / collection 917618](https://www.metmuseum.org/art/collection/search/917618) | Met Open Access; image master dimensions and file hash not verified |

## Integrity and release rules

- This is **six curator-selected physical paintings**, not six released or downloadable local JPEGs. A research source URL is not an acquired master. No JPEG files were successfully downloaded in this operation.
- The frozen **989** gallery research work-groups and generated snapshots are untouched. Dürer points to its pre-existing group; do not double-count it as a new physical painting.
- The historical **25-work tranche** had 24 eligible items after the global rejection of the Bouts source. The taxonomy now exposes **30 eligible curated records**, including these six.
- **No** Calendar date, Prayer art slot, protected cover, Rosary painting or module hero has been reassigned.
- None of the six has `image`, `original`, a local master, a release PR, or production eligibility. Do not accidentally install research URL previews in the published app.
- Prior to a photograph release: obtain the actual original bytes and checksum; confirm exact museum object and photographic rights; check uncropped paint boundary, colour and 320/390-pixel presentation; generate separate derivatives.
- The new `Fulcanelli13/ad-orientem-production` repository and GitHub Pages deployment are **not affected**.

Local regression check: `node tests/sacred-art-holy-trinity-owner-selection.mjs`.
