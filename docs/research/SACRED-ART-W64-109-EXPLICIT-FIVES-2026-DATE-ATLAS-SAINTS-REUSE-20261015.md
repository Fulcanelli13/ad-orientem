# W64 — Reconcile existing user-approved 5-star artworks before new acquisitions
**15 October 2026 | Sacred Art research overlay on source owner PR #887 | No runtime changes**

## Outcome

This pass DOES NOT re-rate user-reviewed images. It brings together prior explicit numeric 5/5 decisions and attaches potential subject/image relationships to the 2026 production-resolved calendar, biblical timeline, and initial Saints Map. It separates *aesthetically approved picture* from *the correct photographed physical original*, *a feast-appropriate depiction*, *rights-cleared file*, and *actually deployed visible artwork*.

### Rating corpus recovered

| Authority | Explicit five-star evidence | Distinct record IDs accounted for |
|---|---:|---:|
| W49 14 Oct latest review | 86 placements (4 placements of `cma-150955`) | 83 |
| W46 effective earlier 13 Oct direct score | 10 | 10 |
| W46 historic baseline only explicit numeric 5 | 14 | 14 |
| W46 new W36 reviewed portraits | 2 | 2 |
| **Total** | **112 placement/record evidences** | **109 unique record keys** |

`109` is **not yet 109 distinct physical originals**, because attribution, repeated composition, accession/URL collisions and the reviewed-photograph identity still need their physical-object dedupe. It is also NOT necessarily every 5/5 rating in the user's lifetime (the earlier 277-scored external export is not wholly available in the repo).

- **15 record IDs** have a prior suspicious photographed artwork/label mismatch or explicit wrong-identity flag. Preserve the numeric score but hold their particular source artwork identity for human/source reconciliation. This is not a reason to re-rate the artwork.
- **0 of these 109** conflicts by unchanged record ID with the W49 current 95 global 0–2 rejected original IDs or the banned-painter policy. This check does not eliminate possible yet-unmatched physical aliases of rejected artworks.
- Preserve `cma-150955` (a multi-person Pittoni image) as **one record** with four reviewed saint subject placements, not four original paintings and not necessarily a separate solo portrait of each saint.
- Earlier W46 rated 5 original `met-442491` Bartolomeo Manfredi *Saints Peter and Paul* is found in the old **29 June 2026** exact feast artwork research ledger. It is score-5, the **source image/reproduction still has no production release approval**.

Machine-readable source: [explicit user 5-star artwork record authority](../../data/research/sacred-visual-w64-explicit-user-5star-physical-record-authority-20261015.v1.json).

### 2026 source calendar, fully materialised

The original GitHub Actions [2026 all-year production resolver audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38052691678) yielded 365/365 ready dates and 72 external calendar checks. W63 had its 365-day archive export but only 53 first-class feast row titles directly in its compact GitHub research JSON. W64 now commits **all 365 dated source rows** including actual principal source ID, title, rank and liturgical colour, plus **112 days with raw commemorations and 111 days with structured commemoration source paths**. These are **not** newly computed alternate rubrics.

Source: [full 365 day and commemoration index](../../data/research/sacred-visual-w64-2026-production-observed-day-id-and-commemorations-20261015.v1.json). This materialised copy was taken from the W63 full-year matrix generated from the original Actions artifact. It is for research joins, not a competing calendar engine.

### Reuse matches to observed 2026 feasts or commemorations

Using whole saint-name matches, explicit group-feast membership and observed source-date + title aliases, **51 rated-five saint subject IDs** have candidate links across **53 distinct 2026 observed calendar dates**, accounting for **56 saint/commemoration identity associations** and **99 five-star subject–artwork placements**.

These **do not** imply:
- 53 finished/approved calendar hero images;
- 99 separate paintings or 99 finished saint portraits;
- any image should replace the observed principal title when the saint is only commemorated;
- the wrong apostle or a namesake should be given credit for an unrelated feast.

The matcher explicitly fences ambiguous Peter, John, Joseph, Thomas, Philip, Lawrence, Jude, Simon and James IDs. Seven source-aware name aliases are separately review-marked:
1. Thérèse of Lisieux → *Theresa of the Infant Jesus* (3 Oct).
2. Ignatius of Loyola → *Ignatius Loyola* (31 July).
3. Jean Vianney → *John Mary Vianney* (8 Aug).
4. Raphael Archangel → *Raphael the Archangel* (24 Oct).
5. Sebastian → *Fabian and Sebastian* grouped feast (20 Jan).
6. Peter Damian → *Peter Damien* (23 Feb commemoration).
7. Ephrem → *Ephrem of Syria* (18 June).

All seven remain **Saints owner / historical ID verification required**, not physical image release acceptance. **15 five-rated subject IDs** in the 75-person W49 roster have no matched *observed* source-name occurrence here, which may simply mean Sunday or special-rite displacement, an alias or omission from the universal current scope. Do not list them as missing art. The Saints-of-the-Day module has separate nominal festival needs even when those feasts are not the observed Mass.

Source: [2026 dated 5-star saint and commemoration source joins](../../data/research/sacred-visual-w64-2026-dated-5star-saint-commemoration-source-join-20261015.v1.json).

### Priority: Biblical Atlas and Saints Map

Two already five-star works have concrete research-scene reuse relationships to the original source-backed 151-event timeline:
- **Genesis 3:1–24, Event 1, The Fall** → John Faed, *Expulsion of Adam and Eve*, Cleveland Museum of Art `cma-150046` (**subepisode**, not an exact depiction of all Genesis 3).
- **Luke 2:1–20, Event 69, Birth of Jesus and adoration of the shepherds** → Savoldo, *Adoration of the Shepherds*, NGA `nga-46185` (**subepisode**, not all Luke 2:1–20).

Both had numeric 5 from W46, not new scores; source scene relationship is a proposal for the Atlas owner, **neither is marked deployed in the live timeline**.

Two out of six holiness-first Saint pilot identities already have source-rated 5 artwork candidates:
- **Saint Thérèse of Lisieux** → Céline Martin, *Thérèse aux roses* (`carmel-lisieux-1925-therese-aux-roses`); devotional image, check rights and exact photo object.
- **Saint Margaret Mary Alacoque** → Apparition depiction attributed to Francesco Podesti (`podesti-margaret-mary-source`); depicts a mystical event including her, not necessarily her standalone portrait; verify attribution and source/photo.

Four other pilot people retain no explicit score-5 source-image link **in this pass**; this is not proof no suitable image exists in the wider museum corpus or that existing shrine photos are invalid.

Source: [Atlas + Saints map 5-star reuse candidates](../../data/research/sacred-visual-w64-rated5-bible-atlas-and-saints-map-exact-subject-reuse-20261015.v1.json).

## Source and score guardrails

1. Numeric user 5 = aesthetically approved, but may still be wrongly labelled or depicted in the reviewed photo; never blindly promote a museum accession on a screenshot mismatch.
2. Numeric 4 = awaiting user's decision, NOT a renewed search obligation; 0–2 original blocklisted, 3 research only, no repetition in user-facing rating gallery.
3. Only stable museum/Commons physical work IDs or explicitly source-confirmed original compositions may inherit a prior five; never same painter + generic title.
4. Existing Calendar observed source ID, 1962 precedence and nominal saint identity remain owned by their source pipelines.
5. One historic saint work can be reused on saint day, Saints Map, specific Mass celebration and biblical event when the scene relationship is genuinely evidenced. Distinct subjects must not be collapsed.
6. Historical martyr collectives can share one grouped image; don't invent distinct portraits for anonymous people.
7. Site photographs in Sacred Geography are additional media with independent source and map pin gate; paintings cannot masquerade as photographs of church sites.
8. The Bible Atlas 151 production events and 183 unmerged cinematic scenes are different inventories and never added as 334 unique live images.
9. **No 2026 hero or other actual runtime painting deployment was inspected/marked approved**.

## Audit invariants

**31/31 W64 validation checks passed**: 365 source rows, 112 commemorating dates, 109 distinct protected numeric-5 IDs, 15 photo identity holds, zero unchanged-ID overlap with user 0–2 blocklist, 53 2026 saint-candidate dates, 56 saint connections, 99 candidate placement edges, one old dated exact original user-five coincidence and two each Atlas and pilot-Saint reuse relationships.

## What comes next — not another aesthetic rating cycle

1. Resolve the 15 photograph/source artwork identity discrepancies; use source custody and actual reviewed image, not re-scoring.
2. Match 5-star paintings that are absent from W49's 75-person roster, including other dates and relevant Mass, prayer and Bible scenes; do not assume all were reviewed in W49.
3. Reconcile full calendar actual 365 daily hero picture **rendering** and nominal saint cards separately; verify the in-app image/crop and original file rights before calculating true coverage.
4. Pull in the full 311 historical sanctoral occurrence identities only when properly reconstructed from the pinned source, and preserve the distinct optional living-sanctoral layer.
5. Build full subject-aware Map/Timeline image demand and rated-five match audit for 151/183 and geography pins; only after this identify true subject artwork gaps.

This research PR is intentionally unmerged and contains no production code changes, no user-rating mutation and no unverified new art downloads.

## W65 (15 October) — two 5/5 saints artworks: final media clearance, not re-rating

The 5/5 user aesthetic choice remains confirmed for both exact W64 artwork IDs. Neither artwork is newly approved for Ad Orientem reproduction. Source review and release evidence are tracked in `data/research/sacred-visual-w65-first-user-five-saints-technical-release-gates-20261015.v1.json`, with a regression test and CI.

**Thérèse of Lisieux, `carmel-lisieux-1925-therese-aux-roses`:** Céline Martin (Soeur Geneviève), artist and Thérèse's sister, died in **1959**, per the [Carmel of Lisieux archive](https://archives.carmeldelisieux.fr/personnage/celine-martin/). In creator-life-plus-70 territories, copyright can ordinarily last until **end of 2029**, subject to local rules and extensions. The source photograph and original work must be matched to the user-rated image; suitable exact reproduction and either permission or a valid rights basis remain to be established. Do not quietly replace it with a photographic print or stock devotional copy.

**Margaret Mary Alacoque, `podesti-margaret-mary-source`:** [the Wikimedia Commons source file](https://commons.wikimedia.org/wiki/File:Apparizione_a_Marguerite_Marie_Alacoque.jpg) describes a 19th-century oil attributed to **Francesco Podesti**, listed in the Vatican Museums, claims a faithful public-domain reproduction and also lists an uploader **CC BY-SA 4.0** licence. It has **800 × 600 pixels / 49,529 bytes** and gives the source photographer as the uploader's own work, without a verifiable museum accession. The old underlying painting is widely public domain, but precise reproduction attribution, original-object identity, high-quality matching media, and valid jurisdiction/credit requirements need verification. The depiction is a **mystical apparition scene including Margaret Mary**, not a standard solo portrait.

The release ledger preserves both existing artwork IDs, both existing 5/5 ratings and explicitly sets releaseAllowed=false, with no local image assigned. Neither the Saints Map PR #1227 nor the Calendar PR #1226 is permitted to promote the artwork until a positive exact-reproduction rights and visual-quality review occurs. Do not send these original images to the user for another aesthetic rating.

**Action order:** (1) confirm physical original and previously user-viewed file, (2) obtain or verify exact work-photo rights and required credits, (3) acquire sufficient resolution of the *same painting*, (4) certify safe mobile/desktop cropping, (5) have art owner approve final file ID for reuse across Calendar and Map.
