# Ad Orientem — Prayer sacred-art consolidation and release decision record

**Date:** 5 November 2026  
**Status:** Research-only consolidation; **NOT** artwork publication or permission to change a fixed cover.  
**Source of truth for this review:** `data/prayer/artwork-editorial-20261105/consolidated-approved-prayer-art-b01-b05.v1.json`. This is an additive editorial approval master; the existing 267-position master remains the slot, previous-decision and override authority.

## What was done

- Re-read the five exact user-approval ledgers from draft PRs [#2519](https://github.com/Fulcanelli13/ad-orientem/pull/2519), [#2521](https://github.com/Fulcanelli13/ad-orientem/pull/2521), [#2522](https://github.com/Fulcanelli13/ad-orientem/pull/2522), [#2523](https://github.com/Fulcanelli13/ad-orientem/pull/2523), and [#2528](https://github.com/Fulcanelli13/ad-orientem/pull/2528).
- Preserved exactly **56 approved paintings** (12 + 16 + 5 + 13 + 10) and **one separate non-painting Holy Face subject (Shroud of Turin)**.
- Compared the newly approved artist/title pairs with the existing 267-position artwork crosswalk. All 56 option IDs are distinct and all 56 normalized artist/title pairs are distinct **within these batches**. **PS-2, Aert de Gelder's *King David*** already appears provisionally on **five** Penitential Psalm stages; it is an approval of an existing candidate, not a directive to acquire another copy. Exact-title/artist checks do not cover the entire wider sacred-art gallery.
- Built a conservative candidate-to-slot map across **21 selected subject categories**, and produced candidate recommendations for **all 14 editorial-hold slots** in the 3 November crosswalk.
- Preserved all five explicit fixed-cover locks (Rosary, Seven Sorrows, Saint Thérèse, Benediction and Confession). Prior approvals and specifically scoped/rejected positions remain governed by their original authority.
- Created an independent integrity test: `node tests/prayer-art-b01-b05-consolidation-contract.mjs`.
- **No** assets downloaded, photographic rights certified, production assignments made, existing cover images modified, or GitHub Pages release triggered by this research work.

## Approval inventory by subject

| Category | User-approved option IDs | Candidate Prayer slots considered |
|---|---|---:|
| Sacred Heart | SH-3, SH-4, SH-5 | 7 |
| Good Death | GD-1, GD-2, GD-3 | 2 |
| Holy Eucharist | EU-1, EU-2, EU-5 | 7 |
| Holy Spirit | HS-1, HS-2, HS-4 | 6 |
| Prayer for Priests | PP-1, PP-2, PP-3, PP-5 | 2 |
| Penitential Psalms | PS-1, PS-2, PS-3, PS-4 | 8 |
| Guardian Angels and Saint Raphael | GA-1, GA-2, GA-3 | 2 |
| Salve Regina and Queenship of Mary | QM-1, QM-2, QM-3 | 4 |
| Montfort Consecration | MC-2, MC-3 | 2 |
| Immaculate Heart and First Saturdays | IM-1 | 4 |
| Seven Last Words | SW-2 | 9 |
| Precious Blood | PB-5 | 8 |
| Holy Souls in Purgatory | SO-4, SO-5 | 6 |
| Saint Anthony of Padua | SA-1 | 2 |
| Sick and afflicted | SI-1, SI-2, SI-3, SI-4, SI-5 | 3 |
| Saint Michael | SM-4, SM-5, SM-1, SM-2 | 3 |
| Evening Prayer | EV-1, EV-2, EV-4 | 1 |
| Morning Prayer and Morning Offering | MP-4, MP-5 | 2 |
| Tenebrae and Passion | TN-2, TN-3 | 4 |
| Litany of Saints | LS-2 | 7 |
| Act of Hope and Divine Providence | AH-1, AH-2, AH-3, AH-4, AH-5 | 1 |

These are categories for targeted curation, **not** commands to fill every slot with every artwork, nor permission to rotate or replace protected covers. Artwork-specific semantic fidelity determines a suitable slot.

## Editorial holds: work-to-slot recommendations

The previous crosswalk recorded **14** editorial-hold positions. Every one has at least one previously user-approved **painting candidate**, but none has a ready-to-publish photograph on the evidence produced here.

| Held slot | Stage / section | Research preference | Additional approved candidates |
|---|---|---|---|
| `STG-pray.rosary-16` | Coronation of Our Lady | QM-1 | QM-2, QM-3 |
| `STG-pray.rosary-17` | Closing prayers (Salve Regina) | QM-1 | QM-2, QM-3 |
| `COV-pray.montfort_consecration` | Cover | MC-2 | MC-3 |
| `STG-pray.montfort_consecration-05` | Act of consecration | MC-3 | MC-2 |
| `COV-adoration_lord_i_am_not_worthy` | Card vignette | EU-5 | — |
| `COV-prayer.communion` | Cover | EU-5 | EU-2, EU-1 |
| `COV-marian_hail_holy_queen` | Card vignette | QM-1 | QM-2, QM-3 |
| `STG-litany_loreto_1962-05` | Queen of Angels … Queen of peace | QM-1 | QM-2, QM-3 |
| `STG-pray.litany_saints-01` | Our Lady, angels and archangels | LS-2 | — |
| `COV-pray.penitential_psalms` | Cover | PS-1 | PS-2, PS-3, PS-4 |
| `STG-pray.penitential_psalms-02` | Beati quorum | PS-1 | PS-2 |
| `COV-pray.for_priests` | Cover | PP-1 | PP-2, PP-3 |
| `COV-prayer.good_death` | Cover | GD-1 | GD-2, GD-3 |
| `STG-prayer.good_death-01` | Commendation of the dying | GD-3 | GD-1, GD-2 |

The preference column is **a reviewer triage proposal only**, not a new user decision selecting that specific painting as a final fixed cover. Preserve Rosary mystery card image stability across its decade. For the Montfort consecration, MC-2 and MC-3 are thematic Marian artworks; neither literally shows Saint Louis-Marie de Montfort.

## Five protected covers — explicitly unchanged

- `COV-pray.rosary`: Lorenzo Lotto — *Madonna del Rosario*
- `COV-prayer.seven_sorrows_chaplet`: Master of the Female Half-Lengths (attributed) — *The Virgin of the Seven Sorrows*
- `COV-novena.st_therese`: Historical photograph of St Thérèse — *Therese_lisieux_portrait.jpg*
- `COV-pray.benediction`: Jean-Auguste-Dominique Ingres — *The Virgin Adoring the Host*
- `COV-pray.confession`: Bartolomé Esteban Murillo — *The Return of the Prodigal Son*

## Source-identity and photograph-quality triage

The first-review source links were preserved without upgrading their evidence level. Painting antiquity or a museum's generic Open Access policy does not establish the rights and suitability of the **specific** photograph. Before importing an image, document source object, exact file URL, rights for the painting and photograph, country exceptions where relevant, native width/height, checksum, crop and authorisation.

Source issues already known from the selection review:

| Option | Unresolved issue(s) |
|---|---|
| SH-4 | LOW_RESOLUTION_SOURCE_NOTED_IN_REVIEW |
| SH-5 | LOW_RESOLUTION_PROPOSED_PHOTO |
| HS-2 | LOW_RESOLUTION_PROPOSED_PHOTO |
| QM-2 | LOW_RESOLUTION_PROPOSED_PHOTO |
| IM-1 | LOW_RESOLUTION_PROPOSED_PHOTO |
| SO-4 | LOW_RESOLUTION_PROPOSED_PHOTO |
| SO-5 | CATEGORY_LINK_NOT_EXACT_OBJECT; WORK_IDENTITY_ATTRIBUTION_REVIEW |
| SM-5 | LOW_RESOLUTION_PROPOSED_PHOTO |
| SM-2 | WORK_IDENTITY_ATTRIBUTION_REVIEW |
| MP-4 | LOW_RESOLUTION_PROPOSED_PHOTO |
| AH-1 | ORIGINAL_STOLEN_HISTORICAL_REPRODUCTION_ONLY |

**Particular blockers:** SO-5 links only to a Commons category rather than an exact artwork file; its attribution/photo identity must not be guessed. HF-6 is subject-only: the intended Shroud photograph (possibly a Secondo Pia historical negative) requires exact image/rights choice and review. SM-2 has workshop-attribution uncertainty. AH-1 is a known stolen original, so only verified historical reproductions can be assessed. The small SH-4, SH-5, QM-2, IM-1, SO-4, MP-4, SM-5 and HS-2 images require higher-resolution candidates.

**Cross-module reuse opportunities:** LS-2's Dürer Landauer Altarpiece has an existing held Saints-module source in the earlier hero wave; TN-2's Caravaggio *Taking of Christ* was already approved for Holy Week Tuesday. Check the canonical gallery identities, prior rights ledger and actual source asset before requesting any duplicate. Source URLs or close matching names alone are not sufficient to assert identity.

## Release order

1. Treat this additive master as the exact set of new artistic approvals; **do not** merge the five historical draft PRs independently in a way that duplicates records. They remain traceable as inputs.
2. Join the selected works to the canonical gallery by museum object ID or exact verified work identity, and inherit existing verified original-image files where legally appropriate. Record a conflict rather than silently merging ambiguous identities.
3. Prioritise photo acquisition / rights and pixel QA for the five new held **covers**: Communion, Good Death, Prayer for Priests, Penitential Psalms, Montfort Consecration; then handle remaining held stage positions and existing approved photo-pending slots. Avoid renewed broad art searches.
4. An editorial slot primary can be promoted only after the exact source file and reuse rights pass; cover approvals from earlier instructions retain precedence. The recommended art is a candidate, not an automatic final selection.
5. Make a separate, narrowly-scoped runtime integration PR. Gate it with Prayer/Rosary phone views, complete Holy Card front/back behaviour where relevant, no inconsistent decade scene changes, no visible empty images, and no regressions to the **65-card Mass reader**.
6. Publish **only** via GitHub Actions + GitHub Pages after the required tests. No Vercel deployment, permission outreach or paid assets.

## Remaining unresolved work

- 56 work/photo-specific license, identity and pixel-QA checks (reuse any already verified canonical original).
- Exact historical Shroud photo selection, license, download and framing.
- 14 held-position candidate proposals requiring final scope/source promotion; their positions are **not** yet closed in production.
- The crosswalk also had 138 approved-photo-pending, 31 identity-unverified, 22 provisional, 1 scope-hold and 5 inherited-pool slots on 3 November. **These are snapshot figures, not a present-day production coverage assessment.** They require a fresh runtime/artifact audit before any statement that all Prayer images are live.

The next milestone is **release-ready placement and photograph provenance**, not another batch of art proposals.
