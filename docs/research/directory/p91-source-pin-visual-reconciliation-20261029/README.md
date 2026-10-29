# P91 — incremental exact-site evidence, NOT a newly curated gallery

All 385 original P87 images remain present in `p91-all-385-canonical-evidence.json`. The original P90 90 rejections and 12 corroborated church subjects are unchanged.

The P91 evidence audit independently resolves a further **five photograph-to-building identities** across three church sites:

- #75–77, **Marktkirche zur Allerheiligsten Dreifaltigkeit, Grafing**. Original photographer's Commons file identifies the Catholic Marktkirche at Marktplatz 10, with dedicated exact-site category. The independent current Mass register lists the same worship building at Dreifaltigkeitsgasse 3. Both addresses refer to the church at the square; this does not create a new location.
- #119, **Chapelle Saint-Michel d'Ingouville**. Wikidata's church entity Q2956926 lists the otherwise-ambiguous `Façade ouest.JPG` as its exact image; this settles the image-to-chapel relation for the research stage.
- #141, **Prieuré de la Sainte-Croix, Croix, Nord**. Commons photo caption explicitly names this SSPX priory and the village of Croix. The SSPX primary-source bulletin confirms the target at 50 rue de la Gare, Croix. The previously rejected different Sainte-Croix priories remain rejected.

**Totals: 90 wrong images rejected; 17 image subjects corroborated across nine physical sites; 278 unverified images still held.** All 385 audited. There are **zero** new images approved for production, rights-cleared, or published. These results establish building association only, not full-resolution aesthetics, permitted role, image bytes/license or automatic promotion.

This specifically avoids the former failure of treating image filenames, keyword matches, and CC license metadata as sufficient for the app. Evidence is cited at the per-photo level. Do not present 278 held photographs to the user as an editorial batch.

Further efficient processing should enrich **one canonical ledger** with exact physical-site entity matches and inspect plausible source images at actual visual resolution. Do not create additional competing galleries; preserve the zero-cost requirement and all old rejection/approval decisions.

## Effective classification contract (P91 reconciliation)

The earlier `p89_disposition`, `p90_previous_status`, and `exact_subject_research_corrob` fields are historical snapshots and **must not be used alone to count current P91 identities**. Every one of the 385 records now includes `effective_image_site_disposition` (`REJECTED_WRONG_BUILDING`, `EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY`, or `HELD_UNVERIFIED`) and `effective_subject_corrob_research_only`. These fields reconcile to 90/17/278, including five new P91 corroborations, without erasing earlier evidence.

Run `node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs` to assert 385 unique original assignments, the reconciliation counts, 141 still-unresolved physical sites, and **zero image publication, rights or original-byte approvals**. This check does not verify whether any held photograph depicts its intended building, and it does not certify visual quality or image rights.

P92 processing should group the 278 unresolved photos into 141 physical sites, address multi-photo sites first, inspect Commons original-file and independent exact-building evidence, and retain unresolved/rejected results in the same lineage, rather than presenting the held queue as a release-ready gallery.
