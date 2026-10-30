# Ad Orientem Prayer artwork · existing-gallery assignment pass (30 October 2026)

This is the **latest state**, replacing the initial 240/267 title-tag trial. Do not quote the earlier counts or treat the original 131 “no explicit route” as missing paintings.

## Current candidate coverage
- 275 editorial blueprint slots; 267 image-bearing, **265/267 with at least one candidate** from the existing 989 artwork groups
- Original **131** “no explicit assignment” slots: **129 now have existing-artwork reuse candidates**
- **176/267** image-bearing slots with an explicit subject identifiable in at least one painting title
- **23** pools below their editorial minimum counts (these are *candidate pool* deficits, **not** certified new-artwork research needs)
- **2** remaining without suitable existing titles: **St Anthony of Padua Nine Tuesdays cover** (`COV-novena.st_anthony_nine_tuesdays`) and **prayer for lost items** (`COV-devotion_st_anthony_lost_items`)
- **1,280** provisional painting-to-slot relationships; each still needs exact visual subject, quality and rights checks

## Reuse examples already present in the source archive
- Twelve separately titled San Polo *Via Crucis* paintings (rights/alternative queue) provide Stations 1–12. Station 13 can use a genuine Deposition; Station 14 can use an Entombment rather than a generic Crucifixion.
- Palm Sunday hero now uses *Christ's Entry into Jerusalem*, **not** a generic image of Christ weeping over Jerusalem.
- The Assumption, Immaculate Conception, St Michael, Nativity, Ascension, Pentecost, Rosary mysteries, *Pietà*, and Calvary all have existing source records.
- **Adoration of the Mystic Lamb**, explicitly accepted by the user for Benediction, and **The Virgin Adoring the Host** offer contextual reuse for otherwise unassigned Eucharistic stages. They are **not** asserted to depict an exposed monstrance or the actual rite of Benediction; that exact imagery may still be absent.
- General Crucifixions are not asserted to depict the precise events of all Seven Last Words, or the individual falls of the Stations.

## Approvals safely carried forward
- Batches 1–5: 250 reviewed, 114 accepted for Prayer, 136 marked *not relevant to Prayer only*. The latter are excluded from *new* Prayer reuse proposals, **not** globally rejected from the sacred gallery or Calendar.
- Batches 6–11: reconstructed from the **exact** unified review HTML rule as displayed to the user. **107 artworks were shown and accepted by the user**. Another 191 were not shown and therefore **not rejected**. These are stored in `data/prayer/artwork-editorial-20261030/approved-unified-b06-b11-from-user-message.v1.json` for reproducibility.
- The reuse suggestions in this pass can include works that were not displayed in those original reviews, as well as existing rights-hold research paintings. They are **new provisional matches**, not a silent extension of the user's earlier approval.
- Every original human choice stays intact, and none of these records has been released into production.

## Source limitations
The 275-slot normalized blueprint from `Ad_Orientem_Art_Matching_Map.xlsx` has not been independently reconciled with **every actual live Prayer card ID**, so 265/267 describes blueprint slot candidate coverage, not a guarantee that the app currently renders a painting on every card. Exact iconographic fit, native file selection and €0-compatible photo rights must be validated before promotion. Source works from `RIGHTS_OR_ALTERNATIVE` remain held. Existing source counts reflect the frozen 548 Q2 and 441 rights/alternative research groups; they are not a count of 989 visually approved paintings.

## Sequence
1. Assign from the existing gallery (this branch; provisional candidate registry).
2. Reconcile 275 editorial slots against the actual app card/stage identifiers; choose exact painting and image for each.
3. Assess genuine gaps *after* removing forced/repetitive matches and checking source/rights.
4. Only then initiate narrow artwork research.

Files:
- `data/prayer/artwork-editorial-20261030/existing-gallery-reuse-for-all-267-slots.v1.json`
- `data/prayer/artwork-editorial-20261030/existing-gallery-reuse-slot-coverage.v1.csv`
- `data/prayer/artwork-editorial-20261030/existing-gallery-reuse-proposed-edges.v1.csv`
