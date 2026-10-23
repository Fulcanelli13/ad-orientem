# Comprehensive Catholic Customs Registry — Handbook normalization pass 1

**As of:** 23 October 2026. **Scope:** independent historical customs research, not app publication.

## Delivered

- Preserved **568/568** independently numbered Handbook observations from all **28/28** indexed chapters.
- Created **308 provisional practice/variant groupings** spanning the 28 chapters, with **309 explicitly mapped source observations** and printed-page references. These are review leads, **not 308 confirmed distinct customs or new releases**. Some overlap the existing 56-identity research master.
- Preserved **42 previously assigned working-master source links**, and added **18 provisional additional links** to existing working identities plus **1** cross-reference to another provisional group.
- Explicitly classified **17** observations as background / general symbolic / mixed-practice references, always retaining original labels.
- Kept **71 COVERED/liturgy observations**, **76 HISTORY_ONLY** and **34 EXCLUDE** observations in dedicated **historical, comparative, context or contested-evidence review queues** rather than deleting them.
- Added **16 observations from the opening preview** of Weiser's separate *Religious Customs in the Family*, within **14 provisional group keys**. The full book is not yet systematically extracted.

| Handbook research route | Observations | Decision stage |
|---|---:|---|
| Proposed practice / historical or regional variant group | 309 | Provisional; many cross-source identity checks outstanding |
| Previously linked to 56-identity master | 42 | Existing research links retained; no new identity |
| Additional proposed links to master | 18 | Provisional overlap to review |
| Proposed alias of another group | 1 | Review; no new identity |
| Background/context or comparative multi-practice mention | 17 | Index-level distinction, revisable |
| Covered liturgy / previously owned context, to reassess | 71 | Explicit pending source-level adjudication |
| Historical custom or background, to reassess | 76 | Explicit pending source-level adjudication |
| Disputed/superstitious or non-Catholic context, to reassess | 34 | Preserved source claims, no endorsement |
| **Total** | **568** | **All entries retained** |

**Important:** The 308 working groups cannot be added to the prior 56 to derive a count of distinct customs. Both may include the same practice, related variant, generic observance or historically terminated use. Likewise the 16 Family-book records are additional source **mentions**, not necessarily additional distinct customs.

## Data locations

- `data/customs/master/full-registry-working-groups-ch01-14.v1.json`: 114 provisional groups; 115 source observations.
- `data/customs/master/full-registry-working-groups-ch15-28.v1.json`: 179 provisional groups; 179 source observations.
- `data/customs/master/full-registry-working-groups-supplement.v1.json`: 15 provisional groups; 15 source observations.
- `data/customs/master/full-registry-observation-crosswalk.v1.json`: 568 one-to-one route records and non-loss classifications.
- `data/customs/master/comprehensive-customs-source-census.v1.json`: original all-chapter source census.
- `data/customs/master/weiser-family-preview-batch01.v1.json`: first 16 observations from second Weiser book.

These are **index-led classifications** grounded in the earlier Weiser first-pass research. Original pages have *not* all been reread or independently checked during this pass. The standardized source labels are not quotations of the copyrighted book. A record is a *working practice candidate* until the exact passage, chronology and local scope have been reviewed.

## Remaining work for a truly complete customs registry

1. **Source-level adjudication of the 181 tagged contextual/historical/contested cases**, identifying which truly describe a practice and should be attached to the catalogue, and which are comparative history or unsupported efficacy claims. Previously marked “excluded” does not mean deleted.
2. **Cross-source identity and variant deduplication** of the 308 proposals, 56 existing identities, 53 SOT-07G families, and new family-book research. Preserve separate regional terms and documentary witnesses.
3. **Full primary-source read** of *Handbook of Christian Feasts and Customs* for completeness beyond the original 568 labelled observations. Chapter enumeration alone does not certify every custom in the printed book was recognized.
4. **Systematic reading of *Religious Customs in the Family***; only a 16-observation preview batch is captured in this branch.
5. **Extraction of additional independent Catholic historical custom collections**, including von Trapp, McLoughlin, feast-day and local diocesan/ethnographic collections.
6. **Publicly neutral evidence statuses**: single-source reported, independently corroborated, disputed or historically discontinued; historical and geographic scope separate from presumed present-day usage.

No calendar integration, module design, prayer formula, custom publication or artwork choice was made. The code/data of the existing app and its liturgical Calendar remain untouched.

### Acceptance definition for a mature research registry

Each independently identifiable custom should have its own stable research ID; variants and same-practice equivalences must be explicit; claimed occasion, participants, steps, material culture, dates and region must have defensible sources; every source observation must link to the appropriate custom, variant, or context record; completeness is audited **source by source**, not measured by a preordained customs target.
