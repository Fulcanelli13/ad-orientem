# Sacred Atlas — 530-app / 876-research reconciliation (research only)

**As of 2026-11-05. No production registry mutation or release authorisation.**

This branch contains a complete canonical app snapshot crosswalk: **530** existing physical Place records. The original 845-place handoff claimed **261** as published; all 261 have exact Place ID matches in the current application. The other **269** are pre-existing app Places absent from the handoff's published subset, not fresh candidates. All **190** unpublished records marked for canonical reuse point to real app Place IDs; none may create a new pin. The 31 new handoff candidates remain editorial proposals.

Production sources at snapshot:
- `data/geography/seed-registry.v1.json`, SHA `95a051468ea7da952965f8c25d7265d10b81f6c6`
- `data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json`, SHA `52369776a3d98556047f97c65fdf970dd975db30`
- `data/geography/approved-place-media.v1.json`, SHA `9bf1f6b9d01346d4fc4d55f6b7ba2d3ae68438ef`
- `data/geography/approved-place-gallery.v1.json`, SHA `df868b9d8dcb88908b09fc00e718221b7f3155f3`

Image register: **388 unique approved covers**, plus **42** approved gallery entries. The previous workbook's 379 approved covers is an earlier snapshot, not today's main count. Approved cover files and user cover locks must be preserved; approved editorial preferences for unverified originals do not constitute image publication approval.

## Files

- `production-530-crosswalk.csv`: every app canonical ID, name, geography, cover, gallery and existing topic status, with handoff match flag.
- `existing-site-reuse-190.csv`: 190 validated reuse aliases, each assigned to an existing canonical Place ID.
- `new31-gates.csv`: all 31 new handoff candidates, proximity warnings and identity gates.
- `identity-exceptions.csv`: high-risk identity collisions and nearby but distinct features requiring a human decision.

## Safeguards

- No automatic ID renaming, site creation, map pin replacement, photo substitution or publication approval.
- The Place registry and the 2,582-entry CL2 Traditional Latin Mass directory are distinct populations. TLM affiliation/rite/missal/canonical fields remain source-scoped, with site links rather than unsafe merges.
- Use illustrative approximate pin geometry only with explicit precision/source labels and correct external navigation; do not imply a precise entrance or overwrite independently verified geometry.
- Archive and link saints, relics, apparitions, feasts, shrines, routes, art, prayers, and communities by stable IDs, without treating feature records as separate buildings.
- Before importing into app, add relevant identity and evidence decisions to the existing **Excel Location Master** staging surface. A research spreadsheet or branch is not an Excel approval.
- GitHub Actions / GitHub Pages only; no Vercel deploys.

**No publishable net-new Place count is asserted by this report.** The 31 proposals and other distinct research leads still require identity, ecclesial-status, editorial, evidence, and photo-rights review.
