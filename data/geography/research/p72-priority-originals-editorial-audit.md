# P72 — Mauritius/Ireland: nine originals verified, nine editorial preview decisions

Date 2026-10-29. [Successful read-only CI run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40821263185), job `123274029354`. P72 stacked draft PR #1936 on P71 draft PR #1934, itself stacked on P70 draft PR #1924.

## Original-byte evidence

- **9/9 exact Commons original image binaries successfully downloaded** on the CI runner and checked using whole-file SHA-1 against the frozen P70/P71 candidate assignments.
- **9/9 image files decoded** with dimensions matching the Commons metadata and format JPEG/PNG. **0 checksum mismatches, 0 failed downloads.**
- Source licence labels (CC0, CC BY-SA, CC BY) were re-read from MediaWiki metadata and align with the initial claims. This does **not** constitute clearance of all rights in depicted objects or fulfilment of attribution.
- A nine-panel contact sheet was generated from the actual checked originals (each reduced to at most 500×360px). Editorial decisions below are based on that contact sheet, **not full-resolution image inspection**.
- All original downloaded binaries were discarded from the runner and **are not permanently archived**; artifact #12874144874 holds the temporary contact sheet and audit JSONL with one-day retention. Hash-verification evidence is now permanently retained in this PR's companion JSONL.
- **No production assets, image-gallery record or published photograph are changed.** Re-download and recheck original image bytes when assembling a conventional reviewed asset PR.

## Editorial photo decisions — no automatic publication

| Place/subject | File | Decision | Proposed role | Reason |
| --- | --- | --- | --- | --- |
| `place:MU:saint-louis-cathedral-port-louis` | [File:Port Louis, Saint Louis Cathedral.jpg](https://commons.wikimedia.org/wiki/File:Port_Louis,_Saint_Louis_Cathedral.jpg) | **IMPORT** | HERO | Entire cathedral façade, centered and legible; no decorative frame or visible watermark; moderate overcast light, acceptable original composition. |
| `place:MU:marie-reine-de-la-paix-port-louis` | [File:MU-port-louis-kirche-maria.jpg](https://commons.wikimedia.org/wiki/File:MU-port-louis-kirche-maria.jpg) | **IMPORT** | HERO | Wide sanctuary garden and Marian site with mountain backdrop; clean bright composition. Attribute Balou46; preserve complete frame. |
| `place:IE:ballintubber-abbey-church` | [File:Ballintubber Abbey eastern elevation.JPG](https://commons.wikimedia.org/wiki/File:Ballintubber_Abbey_eastern_elevation.JPG) | **IMPORT** | GALLERY_ARCHITECTURE | Full identifiable historic abbey photographed at three-quarter angle with roof and sanctuary elevation; good exterior backup, no frame. |
| `place:IE:ballintubber-abbey-church` | [File:Ballintubber Abbey cloisters.JPG](https://commons.wikimedia.org/wiki/File:Ballintubber_Abbey_cloisters.JPG) | **IMPORT_WITH_CORRECTIONS** | GALLERY_ARCHITECTURE | Correct monastery ruins with cloister remains; avoid hero because this is a secondary architectural angle, and caption accurately as cloister remains. |
| `place:IE:ballintubber-abbey-church` | [File:BALLINTUBBER ABBEY - panoramio.jpg](https://commons.wikimedia.org/wiki/File:BALLINTUBBER_ABBEY_-_panoramio.jpg) | **REJECT** | NONE | Photo shows cemetery crosses and distant mountain, rather than the abbey building; unsuitable for church-specific gallery under strict exact-subject visual policy. |
| `place:IE:knock-shrine` | [File:Knock Shrine.jpg](https://commons.wikimedia.org/wiki/File:Knock_Shrine.jpg) | **IMPORT_WITH_CORRECTIONS** | GALLERY_SITE | Correct-looking Knock Shrine campus photograph but church appears distant and small; gallery-only, keep date and source licence attribution; do not present as striking shrine hero. |
| `place:IE:st-peters-oliver-plunkett-drogheda` | [File:St Oliver Plunkett's head 2007-10-5.jpg](https://commons.wikimedia.org/wiki/File:St_Oliver_Plunkett%27s_head_2007-10-5.jpg) | **IMPORT_WITH_CORRECTIONS** | RELIC_DETAIL | Visible reliquary/glass display with strong reflections; exact object documented by source, not suitable as church hero. Caption 'head attributed to Saint Oliver Plunkett, glass shrine' and do not claim independent authentication. |
| `place:IE:st-peters-oliver-plunkett-drogheda` | [File:St. Peter's R.C. Church in West Street (2803321471).jpg](https://commons.wikimedia.org/wiki/File:St._Peter%27s_R.C._Church_in_West_Street_(2803321471).jpg) | **REJECT** | NONE | Facade truncated in composition and a large foreground car obstructs street-level view. Seek clearer building view; not suitable for curated gallery. |
| `place:IE:ballintubber-abbey-church` | [File:Ballintubber Abbey East Range 2007 08 12.jpg](https://commons.wikimedia.org/wiki/File:Ballintubber_Abbey_East_Range_2007_08_12.jpg) | **IMPORT** | HERO | Clear full-building front, straight composition with visible historic stone façade and cross, no frame. Preferred abbey hero of this batch. |

**Decision counts**: IMPORT 4; IMPORT_WITH_CORRECTIONS 3; REJECT 2. `IMPORT` means **selected for an asset acquisition PR**, not published. Corrections mainly concern presentation and honest captions, not altering church architecture or retouching sacred objects. REJECT applies to this candidate-to-card placement, not deletion from Commons.

## Next release gate

Prepare a separate **reviewed asset PR** from the stacked research work. For every selected source: reacquire original, compare byte SHA-1; convert to uncropped, unframed local WebP at maximum 1,280 px; compute derivative SHA-256; provide bilingual alt/caption and photographer credit/licence, plus explicit object/Place link and slot. Update `data/geography/approved-place-gallery.v1.json` and the committed WebPs atomically; run existing production-tree hygiene, data integrity, mobile card tests and required main gate.

**Do not use ephemeral Actions artifacts as final storage.** No hotlinking, no paid storage, no €-costs. For the reflected Saint Oliver Plunkett relic image, document that the photo shows the glass display and does not independently authenticate the relic; cropping or removing reflections may misrepresent it.

Remaining batch-0 candidate assignments: **493** unreviewed by this image-preview procedure (502 total assignments, nine reviewed), though P71 already excludes nine clearly wrong-location assignments. For scaling, process grouped Place galleries and object identities in bounded 50–100 original-file inspections, prioritizing no-photo Places; avoid fresh unrestricted Commons searches until present candidates are processed.
