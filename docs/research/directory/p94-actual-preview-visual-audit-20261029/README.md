# P94 — actual photograph preview visual screening (not metadata-only)

This pass is intentionally **different from P91–P93**. I visually inspected **13 actual rendered previews of the exact Wikimedia Commons files**, not image-search substitutes, category names or filenames. Source URLs are stored at **per-photo** level inside the existing 385-image canonical ledger, as `p94_actual_preview_visual_review`. The inspection scope is the **visible Commons preview**, not the original downloaded bytes. P93 was merged before this review.

## Directly observed editorial screening

| P87 ID | Church | Visible role / editorial result | Reason |
|---:|---|---|---|
| [380](https://commons.wikimedia.org/wiki/File:St._John_Cantius_Church_(Chicago)_Nave.jpg) | St John Cantius, Chicago | **Preferred interior candidate** | Symmetrical nave, aisle, complete altar and rich ceiling, minimal distractions |
| [381](https://commons.wikimedia.org/wiki/File:St._John_Cantius_Church_(Chicago)_Sanctuary.jpg) | St John Cantius | **Preferred altar detail** | Strong main altar and apse; does not replace a full nave photograph |
| [378](https://commons.wikimedia.org/wiki/File:Saint_John_Cantius_Church_Chicago.jpg) | St John Cantius | Viable exterior | Full recognizable facade; cars and lights near lower margin |
| [379](https://commons.wikimedia.org/wiki/File:St._John_Cantius_Church_(Chicago)_Exterior.jpg) | St John Cantius | **Reject for primary hero role** | Severe sunlight flare compromises facade contrast |
| [202](https://commons.wikimedia.org/wiki/File:Inside_the_Oratory_church_of_St_Aloysius_Gonzaga_-_geograph.org.uk_-_8096124.jpg) | Oxford Oratory | **Preferred interior candidate** | Cohesive central nave/altar axis with rich Gothic/Byzantine detailing and even illumination |
| [203](https://commons.wikimedia.org/wiki/File:Oxford_Oratory_church_of_St_Aloysius_Gonzaga_Oxford_-_geograph.org.uk_-_8095191.jpg) | Oxford Oratory | Secondary exterior only | Porch, bicycles and adjacent buildings obstruct an ideal hero; source 900 × 1200 |
| [343](https://commons.wikimedia.org/wiki/File:Holy_Family_-_Saginaw_01.jpg) | Holy Family, Saginaw | Viable exterior | Full centered brick facade; flat overcast sky limits richness |
| [325](https://commons.wikimedia.org/wiki/File:Cathedral_Basilica_of_Our_Lady_of_Peace_-_Honolulu_03.jpg) | Honolulu Cathedral | Secondary exterior only | Oblique side/tower view, substantial neighboring office building and blue sky |
| [327](https://commons.wikimedia.org/wiki/File:Cathedral_Basilica_of_Our_Lady_of_Peace_interior_05.jpg) | Honolulu Cathedral | **Reject for church-wide hero role** | Ambo, Christmas poinsettias and seasonal setting dominate; not a full nave or altar portrait |
| [163](https://commons.wikimedia.org/wiki/File:%C3%89glise_Saint-Gr%C3%A9goire_des_Minimes_Tours.jpg) | St Grégoire des Minimes, Tours | Viable secondary interior | Tall wooden vault and high altar visible; dark foreground and strong perspective |
| [339](https://commons.wikimedia.org/wiki/File:Holy_Family_Log_Church_Cahokia_063.jpg) | Historic Holy Family Log Church, Cahokia | Viable exterior | The historic log building is fully recognizable, while high-contrast sky/trees are distracting |
| [349](https://commons.wikimedia.org/wiki/File:Holy_Name_of_Jesus_Cathedral.jpg) | Raleigh Cathedral | Secondary exterior only | Church and dome are legible but framing crops the right portion of the building |
| [175](https://commons.wikimedia.org/wiki/File:Eglwys_Babyddol_Wrecsam_The_Cathedral_Church_of_Our_Lady_of_Sorrows_Wrexham_09.JPG) | Wrexham Cathedral | **Reject for primary hero role** | Dull light, awkward side facade and adjacent brick building obscure much of composition |

Screen categories: **2 preferred interiors, 1 preferred altar detail, 3 viable exteriors, 1 viable interior, 3 secondary exteriors, 3 unsuitable primary heroes.** These are tentative editorial *role* decisions, not independent final art approval or rejection of the source's exact church identity.

## Licence observations — NOT cleared rights

Commons file page currently labels:
- **CC0 1.0:** #378, with source author Sjcantius.
- **CC BY-SA 2.0:** #202 and #203, Bill Nicholls via Geograph.
- **CC BY-SA 3.0:** #163, #175 and #339.
- **CC BY-SA 4.0:** #325, #327, #343, #349 and #379–381.

These are **claims read from file pages**, not a lawyer's validation, proof of original provenance, an original-file checksum, or completed attribution and share-alike compliance. Rights-cleared count stays **zero**. An editorial preferred candidate is *not* approved to ship.

The working container was unable to download Commons originals in this session, so **zero actual original bytes have been acquired or rehashed**. Even the highest quality candidates remain on hold.

## Unchanged physical-site identity totals

- **385** original candidate assignments
- **90** independently rejected wrong-image assignments
- **83** corroborated *building identities*, with 13 visually screened in this pass
- **212** unresolved original assignments across 124 physical sites
- **0** production-approved new images

Do not subtract the three hero-role rejects from the 83 subjects: these images may depict the right church but be aesthetically inappropriate. Preserve P93's Park City same-parish/different-worship-building hold. Preserve all old approval/rejection and source identifiers.

## Next execution gate

1. Work from the **actual exact Commons file URL and original-byte download** rather than a generic stock/photo search.
2. Verify original SHA-1/checksum, dimensions, valid MIME and present license/author attribution; store only truly free assets within documented limits.
3. Inspect full-resolution composition, sharpness, orientation, and intended role for **all 83 already corroborated**; inspect remaining 212 by grouped site and identity.
4. Present a single site-grouped shortlist with exterior/interior/altar choices only after each has passed its own gates; preserve rejected details and reasons in the canonical ledger.
5. Release to the app only after explicit editorial approval and verified rights; never classify a thumbnail inspection as final artwork acceptance.

Local ledger audit (dependency-free):

```bash
node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs
```

**Zero-cost, zero-owner-contact, no paid storage.**
