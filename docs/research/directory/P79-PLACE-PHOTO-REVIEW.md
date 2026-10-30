# P79 canonical Place photo quick reviewer

Open `docs/research/directory/p79-canonical-place-photo-review.html` in a browser (download the raw HTML file first). This is an offline, single-page reviewer for the **existing** P79 Commons candidate assignments; thumbnails load from Wikimedia Commons when online.

- 430 assignments for 109 canonical Places; default view shows the **79 P79 Places without already-approved media**.
- Up to six photos per Place are visible initially; reveal more as needed. You can choose one photo, choose none, or hold each Place. Existing `REJECT` and wrong-location dispositions remain unselectable, never silently rehabilitated.
- Save/reopen in the same browser to retain choices in local storage; export or import a complete JSON decision snapshot. **Never use export decisions as automatic approvals**. They remain research-only and explicitly mark identity, rights, original bytes, approval and publication false.
- Author, stated licence, original SHA1 and full-size dimensions are source claims. P79 does **not** consistently include reliable per-file Commons category, geotag or Wikidata P180 depicts statements; we intentionally do **not** invent an identity-confidence percentage.
- Before applying any selection, verify the exact building and file source, permissible rights (including modern artworks / local freedom-of-panorama exceptions), people/privacy, originality and composition; download and hash original bytes, archive the WebP and licence/author/source evidence, then use the existing approved media registries and visible credit UI.
- Rebuild with `node tools/directory/build-p79-place-photo-review.mjs` after source changes. Run `node tools/directory/build-p79-place-photo-review.mjs --check` in CI. The generated file is a **snapshot**, not a new master.
- Remaining uncovered Places must go through the same pipeline after this existing backlog is handled; do not create a separate acquisition catalogue.

This is not a production app or a public photo page. It does not contact owners, incur paid storage or publish any photos.
