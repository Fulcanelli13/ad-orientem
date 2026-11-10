# Sacred Art 2026 — coverage-first handoff

This workstream explicitly replaces individual-photo-acquisition churn as the immediate operating priority. Its two derived files provide **one auditable matching queue** for the 2026 Calendar and canonical Prayer artwork. No new images, date decisions, or app content are published by this PR.

## Current coverage (main branch inventory, 10 November 2026)

| Surface | Established / proposed mapping | Needs next action |
| --- | ---: | ---: |
| 2026 Calendar | 134/365 mapped or proposed (25 prior-date images, 105 contextual branch mappings, 4 frozen source previews) | 231/365 unselected/held; **134 does not mean 134 live** |
| Class I, 53 days | 24 prior mappings + 4 frozen previews | 23 selected-image unreleased and 2 rights-held. **29 release/open-file holds in total including 4 previews. Do not restart art selection.** |
| Class II, 76 days | 1 prior mapping | **75 unmatched:** 45 with existing research titles and 30 without, including 37 Sundays |
| Class III, 165 days | 34 contextual proposals | **131 unmatched** |
| Class IV, 71 days | 71 contextual proposals | No fresh artwork-choice queue; runtime verification separately |
| Prayer artwork | All 267 positions present in the editorial master | 51 published exact-photo positions, 5 protected existing covers, 138 approved exact photos awaiting production, 31 identity holds, 14 editorial holds, 22 provisional, 5 inherited pool, 1 scope hold |
| Research group taxonomy | 657/989 have **title-based candidate** categories | 332 unclassified. Neither count proves iconographic fidelity |
| User-vetted exact museum photos | 25 approved/35 rejected in the 60-decision import | Photo-only decisions, not date approvals |
| Previously released module photos | 16 module photo registry entries | Not identical to the 51 published Prayer-slot uses |

**Documentary authorities (do not sum heterogeneous totals):**

- `data/artwork/home-2026-annual-release-census.v1.json` — 365 proposed date statuses.
- `data/artwork/2026-prior-date-artwork-evidence.v1.json` — existing 2026 date selections and museum/study research leads.
- `data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json` and `curatorial-master-267-20261101.v1.json` — canonical Prayer slot choices and publication states.
- `data/artwork/sacred-art-category-match-989-267.v1.json` — lexical research groups, not approved artworks.
- `data/calendar/sacred-art-2026-batch01-60-exact-photo-owner-decisions-20261102.v1.json` — exact photo yes/no decisions.
- `data/artwork/sacred-art-batch1-25-release-progress.v1.json` — the 16 existing module photo records and nine earlier production-source candidates.

## Ready for bulk editorial implementation

1. **Class I release queue (29).** Preserve each already named date painting and resolve the 23 selected-image unreleased files, 4 frozen-preview certifications and 2 photo-rights holds as separate statuses. Do not ask for the paintings again.
2. **Class II first (75).** The matching slate includes all 75 dates, every existing recorded catalogue/external/study artwork lead and a ranked first 25-date editorial review batch. **45 already have candidate material**; 30 require genuine scene/saint matching. There are 15 exact Prayer title-and-artist overlap pairs to examine for reuse, without changing the scope of the Prayer selection.
3. **Prayer implementation (138 existing selections).** Treat previously accepted paintings as fixed editorial inputs. Resolve selected exact photo production **without** asking the owner to re-approve the art. Preserve 51 published slots and five fixed covers.
4. **Class III in larger batches (131).** Start from existing 989 title-group candidates, then verify saint/scene; do not equate search keywords with exact Gospel depiction.
5. **Research taxonomy (332).** Categorise against the fixed bilingual theology/saint subject taxonomy. The remaining 332 are not 332 missing images.
6. **Class IV / contextual (71 + 34).** Keep existing season/feria mappings; verify actual release status separately rather than demanding new paintings.

## Protected decisions

Keep the owner's historically approved and rejected works, the protected Prayer covers and the fixed Rosary images unchanged. An `APPROVED_LOCKED` label in a research candidate or an approved image in the 60-photo import **is not an approval to show that painting on another date**. Contextual date reuse proposals are not proof of deployment. No automatic admission of non-handpicked Commons images, no Prado photos, no paid image rights, no museum contact, no Vercel.

The two deliverables are:

- `data/artwork/sacred-art-2026-coverage-first-master-20261110.v1.json` — all **365 date records** with rank, state, previously selected title and research leads, plus all **267 canonical Prayer slots**, slot status, existing selected painting and action.
- `data/artwork/sacred-art-2026-class-ii-existing-match-review-slate-20261110.v1.json` — **all 75 Class II records** with previously documented candidates, and the **first 25** highest-priority existing-candidate reviews. Candidate titles are research suggestions, not published images.

Run `node tests/sacred-art-2026-coverage-first.test.mjs` to check these frozen derived indexes against the authoritative current source inventories. This PR does not modify runtime cards, image files, calendar proper assignments or public GitHub Pages output.
