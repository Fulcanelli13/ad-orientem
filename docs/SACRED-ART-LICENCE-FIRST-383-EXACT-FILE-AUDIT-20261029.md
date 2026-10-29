# Sacred Art — licensing first, complete 383-work file-rights inventory

**29 October 2026 · Licensing audit ONLY · €0 · No images downloaded · No photographic QA or production mutation**

This is the source-specific rights pass requested before *any further* quality work. All 383 canonical artwork records have individual licence dispositions, institutional evidence, source URL where known and a concrete next legal/source action. The 22 Prayer primary works and 83 Breviarium plates belong to overlapping annexes; those numbers cannot be added to the 383.

## Results

| Rights-source disposition | Number | What is actually established |
|---|---:|---|
| **Official Met/CMA CC0 images with exact source-archive provenance** | **92** | 17 live-object/sha identical, 1 prior verified identical whose current Met API returned HTTP 403, 74 frozen original SHA linked to official institutional Open Access origin |
| **Commons exact file page currently declares Public Domain** | **60** | Specific file declaration captured from live Wikimedia ImageInfo; archived selected JPEG has **not** universally been proven identical to that current file version |
| **Commons CC BY-SA photographer licence** | **14** | Royalty-free reuse with attribution, a licence URL, change notice, ShareAlike obligations for adaptations. **Not CC0; do not treat as unrestricted** |
| **US National Gallery of Art object pages** | **34** | NGA images that are individually *offered under its Open Access designation* are CC0; image-eligibility/download and exact archived source not yet independently established per work |
| Other rights/source holds | **173** | See breakdown below |
| Historically rejected/unwanted artwork records | **9** | Do not revive, even with a new image |
| Historical approval/rejection conflict | **1** | CMA 122338 Albert Bouts: contradictory authorizations, locked hold |
| **Total** | **383** | All records dispositioned; neither rights nor visual quality declared complete for the remaining holds |

### Why 173 are still held

| Precise outstanding condition | Count |
|---|---:|
| No exact source URL joined | 112 |
| No full image exists or only partial source | 25 |
| Museum CC0 object known, chosen archive JPEG identity unproven | 22 |
| Met object API transient access denied: needs live object check | 8 |
| Official museum CC0 photograph variant differs from archive | 3 |
| Kress photographic rights/permission source hold | 3 |
| **Total** | **173** |

The rights pass used **134 distinct live museum object API requests** (125 explicitly CC0, 9 access or rights holds) and **74 exact Commons File image metadata checks**, with **zero Commons API batch errors**. The NGA and Met policies were separately checked at their official documentation. Source-file licence metadata is not equivalent to the copyright of the depicted original painting, and a source file version can differ from the version archived for the app.

### For the 107 already-approved paintings

| Current rights disposition | Approved paintings |
|---|---:|
| Official museum CC0 source SHA and provenance linked | **19** |
| Commons current exact file publicly marked PD, archive-file byte join pending | **58** |
| Commons CC BY-SA, conditional free licence; attribution/share-alike unresolved | **14** |
| Museum CC0 chosen image version requires exact join | **3** |
| No exact source file pointer | **11** |
| Missing original image | **1** |
| Historical approval/rejection conflict (Albert Bouts CMA 122338) | **1** |
| **Total** | **107** |

Thus **19 selected approved paintings have museum-sourced CC0 photographic provenance**, with stronger evidence than a generic PD label. A further **58 specific Commons pages indicate public-domain image files**, but the user-selected original's SHA-256 must still be reconciled against the current Commons version before treating that individual stored file as completely cleared. The **14 CC BY-SA** photographs are freely licensed but conditional; choosing a PD/CC0 alternative may avoid extra attribution/share-alike work.

### Official policy evidence

- Met Open Access image policy: https://www.metmuseum.org/policies/image-resources
- Cleveland Museum of Art CC0 image rights: https://www.clevelandart.org/terms-and-conditions
- National Gallery of Art, **Washington, USA**, specific Open Access image CC0 terms: https://www.nga.gov/terms-and-notices
- Wikimedia Commons exact file rights and reuse requirements: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia

**Do not confuse the US National Gallery of Art with the National Gallery of Australia** (different reproduction policy).

## Persistent actionable lists

- [All 383 per-artwork licence dispositions (machine-readable)](../data/calendar/sacred-art-licence-first-383-exact-source-audit-20261029.v1.json)
- [All 383 per-artwork licence outcomes in CSV](../data/calendar/sacred-art-licence-first-383-review-20261029.csv)
- [291 non-green / conditional / excluded rights records in CSV](../data/calendar/sacred-art-licence-first-383-holds-20261029.csv)
- [Original live official museum & Commons licensing audit script](../scripts/art/sacred-art-licence-first-full-383-20261029.py)
- [Seven missing Commons filenames and 34 NGA policy reconciliation](../scripts/art/sacred-art-licence-first-filetitle-nga-followup-20261029.py)
- [Rights-only integrity guard](../scripts/art/validate-sacred-art-licence-first-383-20261029.mjs)

**Next stage only after licensing**: use the above disposition to decide which **precise source image bytes** are legally reusable. Do not inspect aesthetic/photographic quality, crop frames, acquire alternate photography or publish assets in this licensing stage.
