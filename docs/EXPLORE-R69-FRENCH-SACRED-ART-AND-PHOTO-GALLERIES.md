# Explore R69 — French Place galleries with sacred art photography

## Published image batch
Four new exact-subject photographs with Wikimedia Commons **CC BY-SA 4.0** licences and mandatory creator attribution are appended to the existing R68 registry, without changing its original two Pontmain files.

| Canonical Place | Artwork or photograph | Photographer | Reader context |
| --- | --- | --- | --- |
| Sainte-Thérèse de Lisieux basilica | Basilica interior (November 2021) | Chabe01 | Monumental architecture |
| Chartres Cathedral | Thirteenth-century nave pavement labyrinth (May 2017) | Fab5669 | Interior pilgrimage / sacred site |
| Chartres Cathedral | North transept medieval stained-glass rose (April 2011) | Txllxt TxllxT | Medieval sacred art |
| Rue du Bac, Paris | Saint Vincent de Paul statue in the chapel's inner courtyard (April 2016) | Thomon | Vincentian devotional context |

These are **photographs** of physical sacred places or sacred objects, not copies of paintings presented without permission. The two sacred-art images are photographs of the actual Church artefacts with a separate photographer's licence. The 1830 apparition artwork at Rue du Bac, Saint Thérèse's manuscripts and the Lourdes grotto art/storyboards remain on independent visual-rights research hold.

All four are stored as locally optimised WebP files under `assets/approved/place-gallery/`, with the **whole original picture retained** (no crop). All have EN/FR titles, descriptions, Commons original page URLs, CC licence hyperlinks, creator credits, source SHA-1 and derivative SHA-256. Acquired via `tools/acquire-approved-place-gallery-r69.py` and a temporarily isolated verification-and-commit workflow. The production workflow was subsequently converted to **read-only** and no longer grants repository write permission.

## App behaviour

The existing Place reader and styling already support bilingual galleries and un-cropped `object-fit:contain` images. R69 adds data, not a duplicate interface or a new gallery component. Gallery tabs appear for four exact Place IDs: Pontmain (2), Chartres (2), Lisieux (1), Rue du Bac (1). **No cross-Place leakage** or external hotlinks are allowed. The independent hero-photo registry retains its 18 originals, and the fourteen long-form bilingual Place guides remain unchanged.

### Checks

- `tests/explore-r69-gallery-file-audit.py`: real local WebP decode, SHA-256, licence and custodian attribution for six total photographs; verifies R68's two binary checksums have not changed.
- `tests/explore-r68-photo-gallery.mjs`: existing Pontmain acceptance is now correctly *scoped* to its original two images so new append-only additions do not falsely break its old denominator.
- `tests/explore-r69-multi-place-gallery.mjs`: 4 physical site readers, 6 approved images, bilingual titles/alt, source URLs, exact owner guards, unchanged 18 hero photos and fourteen guides; executed from `tests/explore-surface.mjs`.
- `.github/workflows/explore-r69-gallery-acquisition.yml`: read-only post-publication image provenance verification.

## Next photography/artwork

Add original-rights-checked new sets for **Lourdes, Paray-le-Monial, Sainte-Anne-d'Auray, Laghet, Rocamadour and Knock/Lough Derg**. Historic paintings, miracle depictions and copies of archival letters should only enter the app with accurate depicted-scene captions, original artist, source and public-domain/compatible licence status; photographs of protected artworks require independent photographic rights assessment.
