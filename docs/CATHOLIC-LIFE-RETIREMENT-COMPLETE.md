# Catholic Life Retirement — Complete

**Status:** COMPLETE  
**Date:** 2026-10-07  
**Retired route:** `learn.catholic_life`

## Decision

The standalone Catholic Life curriculum has been retired.

Catholic life is treated as the combined life of the application—Mass, Prayer, Formation, Calendar, Customs, Explore/Directory and Apostolate—not as a catch-all Formation course.

No `Catholic Life 2.0` replacement is authorized by this retirement.

## Coverage gate

The retired corpus contained:

- **10 courses**
- **79 stages**
- **409 claims**
- **101 registered sources**

The retirement gate passes:

- **409 / 409 claims** have exactly one recorded retirement resolution;
- **0 claims** are missing;
- **0 duplicate claim resolutions** exist;
- **101 / 101 sources** are retained in owner-domain salvage corpora;
- **0 source records** are lost.

The original claim/source ledger remains at:

`data/learn/catholic-life-retirement-audit.v1.json`

Resolution batches:

- `data/learn/catholic-life-retirement-resolution.batch1.json`
- `data/learn/catholic-life-retirement-resolution.batch2.json`
- `data/learn/catholic-life-retirement-resolution.batch3.json`

## What happened to the research

Research was re-homed under the concern that actually owns it:

- sacramental formation -> dedicated Baptism, First Communion, Matrimony, Holy Orders and Serious Illness owners;
- Confession -> PRAY;
- Mass preparation, thanksgiving, posture, gesture and reverence -> Mass owners/SOT;
- temporal observance -> Calendar;
- sacramentals, relics, sacred-object care, church conduct and local custom -> Customary SOT;
- shrines and pilgrimage -> Explore;
- church architecture/furnishing vocabulary -> reference/glossary data;
- Brown Scapular -> dedicated Scapular owner;
- product/runtime rules -> removed from learner scope.

The remaining focused Formation research clusters are preserved at:

`data/learn/focused-formation-gaps-catholic-life-salvage.v1.json`

They are explicitly **research-only, not publishable as-is**. They cover Funeral/Requiem, Religious Life, Vocations, Spiritual Life and Catholic Home/Family. They require their own source-complete ownership decisions and may not be used to recreate an umbrella Catholic Life course.

## Runtime removal

The retirement removes:

- the visible Formation launcher;
- the `learn.catholic_life` runtime/registry wiring;
- the 10-course/79-stage runtime corpus;
- the old Catholic Life-specific regression test and phone journey.

The permanent regression gate is:

`tests/catholic-life-retirement.mjs`

It fails if the retired route returns or if claim/source coverage falls below 409 claims / 101 sources.

## Governing rule

`one concern -> one canonical owner -> explicit handoffs`

Research may be reused across surfaces through shared SOTs and references, but no concern should regain a second canonical owner merely to make Formation appear comprehensive.
