# Sacred Art — Heroes, Major Feasts and Sundays First (21 October 2026)

**Governing correction by user, 21 Oct 2026.** This document supersedes collection-expansion priorities in W101 and W102; historical art, source identities, photo proofs, user approvals, and refusals are retained without modification. Scope is **Ad Orientem homepage imagery and 1962 liturgical coverage**, not a general museum-art survey.

## Correction — six “missing” themes were already selected (21 October, after recovery of October 19 decisions)

**The earlier section calling Holy Thursday, Pentecost, Palm Sunday, Sacred Heart, All Saints and Christ the King “missing suitable heroes” was incorrect as a statement of HUMAN ARTWORK SELECTION.** It described a 13 October phone-visual source-audit status, not the later date-specific user approvals. **Never ask the user to select these again** or replace them on research grounds. Preserve all previously approved original art.

| Actual occasion | Already selected, approved painting | Remaining technical work |
|---|---|---|
| 29 Mar, Palm Sunday | **Anthony van Dyck — The Entry of Christ into Jerusalem** | Original identity/approved photo, whole-surface mobile view, app mapping |
| 2 Apr, Holy Thursday | **Ugolino da Siena — Last Supper** (5/5) | Image photo and app release verification |
| 23 May Pentecost Vigil | **Juan Bautista Maíno — The Pentecost** | Anticipatory theme (not literal Vigil readings), image/photo release check |
| 24 May Pentecost Sunday | **Jean II Restout — Pentecost** (5/5 locked) | Exact identity, approved photo and app mapping |
| 27 May Pentecost Ember Wednesday | **Philippe de Champaigne — La Petite Cène** | Eucharistic thematic association (John 6), not literal depiction; photo release |
| 12 Jun, Sacred Heart | **Juan Patricio Morlete Ruiz — The Heart of Jesus** (5/5 locked, perfect theme) | Reproduction and UI image check; **Van Dyck's The Lance Thrust** also approved as related Passion art |
| 25 Oct, Christ the King | **Ambrosius Benson — Salvator Mundi** | Object/photo and homepage date mapping |
| 1 Nov, All Saints | **Carlo Saraceni — Paradise** | Object/photo and homepage date mapping |
| 2 Nov, All Souls | **Ludovico Carracci — An Angel Frees the Souls of Purgatory** | Source/photo and date mapping |
| 29 Nov, Advent I | **John Martin — The Great Day of His Wrath** | Eschatological thematic link, source/photo and date mapping |

**Source authority:** user's date-specific approval conversations of 19 October 2026, not older 13 October gap matrices. Earlier approvals include Restout's Pentecost and other alternates and must remain protected; unselected alternatives are *not rejected*. The 17 October exported artwork decision freeze explicitly locks Restout and Morlete as five-star accepted originals. Later specific feast assignments do not themselves verify licensed photo files or deployed homepage assets.

[Source-authority reconciliation of the ten approved dates](../../data/calendar/sacred-art-recovered-date-specific-approvals-20261019.v1.json).

**Corrected priority:** P0 is **complete production readiness and actual visible deployment of these already selected artworks** (photo identity, image rights, full painting, mobile test, DayResolver join), then identify which of the remaining feast dates and Sundays truly lack an EDITORIAL SELECTION. Do not source replacement art for the six without an explicit new user request.

## Non-negotiable acquisition order

1. **P0 — Release the already approved hero artwork**: the date-specific decisions above are binding. Audit actual original-photo readiness, licensing and app integration, and only search new hero art for feast themes proven to lack selections. The ~20–25 masterpiece collection is a flexible quality target, not a request to reconsider approved works.
2. **P1 — Every major feast and Sunday**: ensure all **52 Sundays in 2026** and **53 actual Class I dates** have an **explicit, truthful art assignment** when published, plus significant Class II feasts (Candlemas, Holy Family, Baptism, Visitation, Transfiguration, Holy Cross, Seven Sorrows, Holy Rosary, relevant Apostle/evangelist and patrons) based on the actual 1962 DayResolver and jurisdiction-specific observance. This is a **coverage guarantee**, not a quota for 52 different artworks or 365 unique images.
3. **P2 — Release gates, concurrent with P0/P1**: exact physical original IDs; excellent painting quality at 320–390 px, whole painted surface preserved; photo licensing per specific reproduction; approved presentation and attribution; date-sensitive app integration and browser screenshots. Do not postpone image acquisition until every research slot is filled.
4. **P3 — Paused**: routine saint portraits, Doctors, additional Old Testament arcs, W101/W102 expansion, broad Historia Salutis acquisition and additional two-alternatives-per-person quotas. Resume only after hero and major feast/Sunday acceptance.

## Baseline: do not confuse three different coverage notions

- **53** Class I observed 2026 dates; **27** distinct themes in the old library screen. At that older 13 Oct visual baseline **9** strong appropriate themes, **8** conditional, **3** contextual, **6** missing suitable phone hero, **1** separate archived review original. These are **research screen judgments**, not published final selections.
- The distinct 17 Oct source crosswalk had direct exact-source research links for **21/53** Class I dates and none for **32/53**. Reuse/calendar grouping and earlier art selections can still cover many of the latter. Exact-source research is not hero publication.
- Three existing Sunday-Gospel research batches document **32 candidate lead rows for 29 distinct 2026 Sundays**. Neither 29/52 nor 21/53 is a publication-ready count. The 16 original Sunday-gap dates have source leads for most subjects but still need aesthetic/photo and date verification.
- Sunday 5 July 2026: Mark 8:1–9 **feeding of four thousand** is not the feeding of five thousand. Keep only contextual reuse until exact scene is demonstrated.
- A working **52-row Sunday grid** and **53-row Class I date grid**, as well as **17 major non-Class-I spotlights**, now exists in `data/calendar/sacred-art-hero-first-2026-sunday-feast-gap-register.v1.json`. The Sunday grid is a **to-do ledger**, not evidence that 52 actual paintings have been mapped or released. Rows for non-Class-I Sundays deliberately await 1962 DayResolver output.

## Six previously audited themes — NO ARTWORK RESELECTION

The old 13 October matrix assigned six entries the visual research label `NO_SUITABLE_PHONE_HERO_IDENTIFIED`. **After accounting for the explicit user approvals on 19 October, that old label is obsolete as a selection-gap claim.** See the corrected table above. It can still indicate that a rights-cleared phone reproduction or deployed source image was not verified by that 13 October research pass.

Priority order for the six is now **technical reconciliation of the selected images**, not new acquisition/curation. Use `artworkSelected=true`, `sourcePhotoValidated=?`, `commercialUseCleared=?`, `phoneWholePaintingAccepted=?`, `visibleInApp=?` as separate properties. None may silently unset `artworkSelected`.

**Other principal feasts and Sundays** remain part of the audit. Review the 52 Sunday rows and 53 Class I observed dates, but mark a missing selection only after checking all newer user decision sources, including post-17-October approvals. Preserve the distinct 23 May Vigil and 27 May Ember Wednesday art, the unrelated Gospel scene semantics and correct 1962 day precedence.

## Sunday rule

A Sunday **counts as visual-coverage complete only when** a production-available painting has been assigned with one of these relationships:

- `EXACT_APPOINTED_GOSPEL`: exact episode actually shown (best);
- `EXACT_FEAST_THEME`: selected feast/season's liturgical subject rather than just a vague image;
- `TRUTHFUL_CONTEXTUAL`: explicitly relevant scene or subject, caption saying what it depicts;
- `COMPATIBLE_APPROVED_CARRYOVER`: previous masterpiece remains deliberately visible and suitable to the current season.

No date should display a blank hero or low-grade substitute merely to change the image. A liturgical **headline is always the day's actual Mass/observance** from DayResolver, independent from a painting's **accurate artist/title/depicted subject** caption. Do not call a generic painting “today's Gospel” if it does not depict it.

## Acceptance gates

1. `52/52` 2026 Sundays **resolved against the actual 1962 calendar**, each with source-backed Gospel and a deliberate hero or approved carryover.
2. `53/53` 2026 Class I dates with explicit appropriate art logic; 17 spotlight candidates and other major II-class days correctly prioritised *only when their proper/rank is actually observed*. The register's `classI` date count is the baseline; not 53 unique images.
3. The initial 20–25 masterpiece hero collection accepted artistically and packaged with verifiable photo rights, 320–390px no-truncation/mobile legibility checks and authentic source/title.
4. Home and Calendar screenshots and tests proving image actually shows on the correct day with accurate art captions; repeat date-resolution checks in another liturgical year, not just static 2026 matching.
5. NO publishing or score overwrite from W101/W102 and no unapproved hero promotion.

## Authoritative source records

- [New Sunday / Class I / major Class II gap register](../../data/calendar/sacred-art-hero-first-2026-sunday-feast-gap-register.v1.json)
- [2026 major-homepage occasions](../../data/calendar/sacred-art-home-masterpiece-occasions-2026.v1.json)
- [Existing 23-theme masterpiece research](../../data/calendar/sacred-art-masterpiece-anchor-wave-20261012.v1.json)
- [Class I old-phone-screen status](../../data/calendar/sacred-art-class-i-existing-image-matrix-20261013.v1.json)
- [Exact feast source vs production truth](../../data/calendar/sacred-art-feast-coverage-truth-2026-20261017.v1.json)
- [Sunday Gospel source research](../../data/calendar/sacred-art-sunday-gospel-paintings-open-sources-20261017.v1.json)
- [Sunday Gospel second phase](../../data/calendar/sacred-art-sunday-gospel-open-paintings-phase2-20261017.v1.json)
- [Sunday Gospel third phase](../../data/calendar/sacred-art-sunday-gospel-open-paintings-phase3-20261017.v1.json)

**Implementation direction:** update acquisition and hero-selection worklists to follow P0/P1; don't migrate or rewrite the live Calendar and Mass reader source data, don't auto-publish original photos, and don't present an acquisition-only gallery as already covered homepage dates.
