# Explore R68: first real illustrated Place gallery — Pontmain

Two distinct original photographs, independently credited to **GO69**, have been downloaded directly from Wikimedia Commons, converted **without cropping** to optimised local WebP files, assigned to the exact canonical `place:FR:pontmain` physical Place, and published in the first bilingual, in-app full-frame visual gallery.

## Photographs and rights

1. Basilica east façade — original Commons file `File:Pontmain (53) Basilique Façade est 01.jpg`, photographed 27 December 2016; CC BY-SA 4.0, author GO69.
2. Interior of the basilica nave — original Commons file `File:Pontmain (53) Basilique Notre-Dame-d'Espérance Intérieur 04.jpg`, photographed July 2011; CC BY-SA 4.0, author GO69.

The images were selected from original file-page previews and original descriptions. Original-image delivery was rechecked live through Commons API; image transformations, source SHA-1, derivative SHA-256, dimensions, alt text, and local approved-asset paths are in the independent `data/geography/approved-place-gallery.v1.json` manifest.

Images are shown *inside* the existing illustrated pilgrimage guide with French/English caption, author, CC licence URL and individual source URL. Gallery images use `object-fit:contain` and **never crop, zoom or replace the subject**.

## Ownership and future batch

- Reader references **local assets only**, not Wikimedia hotlinks or third-party tourism photographs.
- The existing 18 approved hero photos and their R58/R59 tests remain unchanged. Pontmain's new source-owned gallery is separate from the single-hero registry.
- Only the exact canonical Place receives the two images. Other guides without approved photos remain text-first.
- The existing R67 visual storyboard continues to hold unlicensed historic apparition imagery, ex-votos and other art. An original-source link is *not* a license to copy artwork.
- Acquisition is reproducible via `tools/acquire-approved-place-gallery-r68.py` and isolated Github Actions source/checksum verification. Acceptance: `tests/explore-r68-photo-gallery.mjs` plus the canonical Explore suite.
