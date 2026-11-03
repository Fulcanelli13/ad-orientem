# Sacred Atlas — 3 November 2026 photo production reconciliation

**Classification:** read-only crosswalk; no new published media, no relaxed rights gate, no replacement of the approved Explore UI.

## Verified production baseline

| Measurement | 31 October source audit | Current canonical production registry |
|---|---:|---:|
| Canonical physical Places | 530 | **530** |
| Approved Place cover photos | 120 | **312** |
| Places without approved cover | 410 | **218** |
| Approved Place gallery photographs | older review 33 | **35** across **31** Places |
| Approved gallery records explicitly linked with `subject_relic_id` | no certified linkage | **0** |

The 192 newly approved **site covers** close 192 prior site-cover gaps; they do not automatically close original sacred-object photo gaps. In the old 125-site cover recovery cohort, 13 now have covers and **112** remain without covers. The 50 “strong leads” in that old run were source/metadata suggestions, **not** original-byte, image-identity or legal approvals. Reuse those candidates before starting redundant searches.

## Source subject registry — reuse without replacing canonical data

The October research index contains **268 subject records at 139 unique Places**: 88 source-described pilgrimage stops, 127 canonical relic identities, 33 apparition contexts (not photographs of purported events), and **20 manually researched precise physical/photo targets across 10 Places**. All Place IDs, relic IDs and apparition IDs resolve against present canonical registries.

**Different cohort:** the user separately kept **20 presented photographic previews at 20 Places**. Only **8** of those approval rows refer to IDs in the original 268-subject index; the other **12** are provisional Round 1 review labels requiring an explicit source-subject join. Do not confuse these 20 kept previews with the 20 original precise targets.

## User-kept Round 1 photographic previews

All twenty original `KEEP` decisions are preserved, without claiming that Commons proposals necessarily reproduce the exact on-screen preview. Two *candidate Commons file pages* independently match current approved general-gallery assets at **Jasna Góra** and **Altötting**. These two image files are already acquired, locally published, credited and licensed in the Place gallery. However, **the in-chat preview image bytes were not retained**, so the two matches do not by themselves establish that these were the exact approved preview pixels.

| # | Exact depicted target | Approved Place cover | Exact candidate Commons source in approved Place gallery | Remaining source action |
|---|---|---|---|---|
| 1 | Apparition Chapel with original church gable | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 2 | Original Grotto of Massabielle | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 3 | Glass shrine of Saint Bernadette in the Saint-Gildard chapel | Cover missing | No same-source published gallery | Preview identity/rights still unpinned |
| 4 | Saint Anthony's tongue reliquary | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 5 | Venerated Marian statue in the Chapel of the Apparitions | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 6 | Original Black Madonna icon in its chapel | Cover yes | Same Commons source in independently approved gallery | Preview identity/rights still unpinned |
| 7 | Original Guadalupan tilma in the New Basilica | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 8 | Madonna inside the Holy House at Loreto | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 9 | Black Madonna of the Chapel of Grace | Cover yes | Same Commons source in independently approved gallery | Preview identity/rights still unpinned |
| 10 | Magna Mater Austriae on the Altar of Grace | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 11 | Black Madonna of Rocamadour in the Notre-Dame chapel | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 12 | Head of Saint Oliver Plunkett displayed in Saint Peter's | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 13 | Silver casket/reliquary of Saint Francis Xavier | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 14 | Statue of Our Lady in the Catholic Slipper Chapel | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 15 | Notre-Dame du Pilier statue at Chartres Cathedral | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 16 | Original Our Lady of Aparecida statue in its niche | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 17 | Venerated statue of Saint Anne in the Basilica | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 18 | Apparitions Chapel associated with Saint Margaret Mary | Cover yes | No same-source published gallery | Preview identity/rights still unpinned |
| 19 | Chapel of the Virgin of the Poor at Banneux | Cover missing | No same-source published gallery | **Archival reference only** |
| 20 | Apparition memorial statuary at La Salette | Cover missing | No same-source published gallery | **Exclude wrong site** |

**Hard gates:** the proposed La Salette Commons image depicts a **different physical site at La Rabatelière** and must not be published as La Salette. The Banneux candidate is historical postcard evidence, not a verified contemporary image of the specific chapel. A valid alternative is not automatically covered by the original KEEP vote; substitution requires a separate visible approval. Other candidate pages still need verified exact preview identity, original bytes/checksums and photographer + underlying artwork rights.

## Zero-duplication action order

1. **Retain both already-approved general-gallery files** for Jasna Góra and Altötting. Do not fetch or re-encode duplicate originals. Their rights-checked general-gallery approvals are independent of any Round 1 preview identity claim.
2. **Preserve 20 KEEP votes**, reconcile the **12 provisional source-subject joins**, and resolve the 16 unpinned ordinary candidates against their original file pages/subject specificity. Keep the wrong-site and historical postcard exceptions explicit.
3. For source-cleared candidates, use existing publication gates: independently verify original file bytes, license/version, rights in depicted artwork/reliquary, exact canonical Place and subject, quality, any necessary substitution approval and bilingual captions. Do not infer physical relic authenticity.
4. **Finish current 218 Place-cover gaps from prior selections first**; the 112 remaining targets of the old 125-site recovery are already researched. Do not confuse site covers with sacred-object images.
5. Audit the 268 owned subject records against the 35 approved gallery photographs, preserving the original source text. The broad unsourced photo-search programme and new subject research come **after** this review and publication work.

## Provenance and merge boundary

This crosswalk retains source branch SHAs and original source paths in `data/geography/research/sacred-atlas-photo-production-crosswalk-20261103.v1.json`. The old [PR #2116](https://github.com/Fulcanelli13/ad-orientem/pull/2116) is hundreds of commits behind production. Do **not** merge it wholesale, its bulk acquisition runners, auto-select pipeline, photo-finder interface, or historical cover-gap snapshots into the current app. Main's approved cover/gallery, current Place/relic/apparition registries and editorial source owners remain authoritative.

No network fetching, Commons automatic selection, publication or photos were performed in this reconciliation.
