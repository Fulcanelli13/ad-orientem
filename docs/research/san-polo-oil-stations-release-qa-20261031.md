# San Polo oil-painting Stations — batch evidence and release QA

Audit date: 2026-10-31. Scope: research branch of PR #2121 only. **No production clearance**.

## Verified in repository

- 14 unique WebP derivatives correspond to 14 numbered Stage I–XIV mappings, according to archive checksum manifest and PR file list.
- Source derivative sizes are 1,822–1,920 px wide and 2,056–2,400 px high; 15,141,828 bytes total. Image dimensions and hashes are recorded in the acquisition ledger.
- All 14 sources are oil-on-canvas paintings by Giandomenico Tiepolo, San Polo, Venice, not the etched set. Sources: [Chorus Venezia](https://chorusvenezia.org/en/visita/via-crucis-jesus-falls-the-first-time/) and [Commons category](https://commons.wikimedia.org/wiki/Category:Via_Crucis_by_Giovanni_Domenico_Tiepolo).
- Individual photographs are by Didier Descouens / Archaeodontosaurus, licensed CC BY-SA 4.0. Attribution and adapted-image licence apply to the archive. **This does not satisfy the app's existing PD/CC0-only publication policy**.
- The PR's changed-file list contains research-only archives, manifest, gallery, acquisition workflow, and test. No live reader implementation or established artwork selection file is modified.

## Source preview sampling (not final exact-byte visual QA)

Previews of the exact Commons source pages were visually inspected for Stations I, II, III, V, VI, IX, X, XII. They depict the numbered painted scenes and no substantial ornamental frames are apparent at preview size. **This is limited preview evidence**: it does not verify pixel-level crop boundaries, colour casts, sharpness at mobile size, or exact archived WebP appearance. The other six archived derivatives were not visually examined here.

| Station | Scene | Original image (px) | Source preview | Archive WebP visual QA | Publication |
|---|---|---:|---|---|---|
| I | Jesus condemned to death | 1920 × 2142 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_I_-_Jesus_is_sentenced_to_death_by_Giandomenico_Tiepolo.jpg) | Pending | Hold: CC BY-SA / approval |
| II | Jesus takes up the Cross | 1920 × 2133 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_II_-_Jesus_carries_his_cross_by_Giandomenico_Tiepolo.jpg) | Pending | Hold: CC BY-SA / approval |
| III | Jesus falls for the first time | 1920 × 2074 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_III_-_Jesus_falls_the_first_time_by_Giandomenico_Tiepolo.jpg) | Pending | Hold: CC BY-SA / approval |
| IV | Jesus meets his Mother | 1920 × 2056 | Not sampled | Pending | Hold: CC BY-SA / approval |
| V | Simon of Cyrene helps Jesus | 1920 × 2101 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_V_-_Simon_of_Cyrene_helps_Jesus_carry_the_cross_by_Giandomenico_Tiepolo.jpg) | Pending | Hold: CC BY-SA / approval |
| VI | Veronica wipes the face of Jesus | 1920 × 2084 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_VI_-_Veronica_wipes_the_face_of_Jesus_by_Giandomenico_Tiepolo.jpg) | Pending | Hold: CC BY-SA / approval |
| VII | Jesus falls for the second time | 1920 × 2070 | Not sampled | Pending | Hold: CC BY-SA / approval |
| VIII | Jesus consoles the women of Jerusalem | 1866 × 2400 | Not sampled | Pending | Hold: CC BY-SA / approval |
| IX | Jesus falls for the third time | 1906 × 2400 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_IX_-_Jesus_falls_the_third_time.jpg) | Pending | Hold: CC BY-SA / approval |
| X | Jesus is stripped of his garments | 1889 × 2400 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_X_-_Jesus_is_stripped_of_his_garments.jpg) | Pending | Hold: CC BY-SA / approval |
| XI | Jesus is nailed to the Cross | 1910 × 2400 | Not sampled | Pending | Hold: CC BY-SA / approval |
| XII | Jesus dies on the Cross | 1822 × 2400 | [Sampled](https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_XII_-_Jesus_dies_on_the_cross.jpg) | Pending | Hold: CC BY-SA / approval |
| XIII | Jesus is taken down from the Cross | 1853 × 2400 | Not sampled | Pending | Hold: CC BY-SA / approval |
| XIV | Jesus is laid in the tomb | 1920 × 2146 | Not sampled | Pending | Hold: CC BY-SA / approval |

## Release acceptance (all required before any activation)

1. Reconcile these candidates with all existing user-approved Stations assignments; no implicit replacement of approved art. Do not interpret an omitted checkbox as rejection.
2. Resolve rights without fees: find verified PD/CC0 reproductions for any selected deployment images, or obtain an explicit policy decision for the CC BY-SA photographic derivatives with attribution and same-license distribution. Free-to-use is **not** the same as public-domain.
3. Inspect **each exact archived WebP** at actual reading size on phone and at full resolution for frame intrusion, cropping, focus, compression, tonal consistency and any text/watermarks; use non-destructive cropping only where permitted.
4. Bind only final approved image(s) to the correct Station IDs. Preserve contemplative reader timing, language/rubric presentation and all existing editorial locks.
5. Pass full reader and 14-asset tests on the integration branch; perform direct phone walkthrough and verify imagery stays absent from unrelated devotions unless approved scene reuse applies.

**Current verdict:** 14/14 acquired and staged; 8/14 Commons source previews sampled; 0/14 exact WebP visual approvals; 0/14 production assets enabled. Do not merge PR #2121 as a production activation.
