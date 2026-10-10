# Batch A — 1962 Calendar artwork reuse audit and accelerated research plan
**10 October 2026 · issue #885 · PR #887 · 2026 observed general Roman calendar**

## Outcome: existing archive first, no new image acquisition required

The source registry still has **194 candidates, 179 acquired SHA256 originals, 97/168 canonical subjects meeting their existing optional depth target, 20/26 principal-feast targets meeting depth minimum, and 0 publication-approved images**. One painting may legitimately serve multiple liturgical contexts, but a painting reused six times remains **one** original.

**Research-matching tiers:**

| Grade | Observed I-class dates | % of all 53 | Counted? |
|---|---:|---:|---|
| **A** — exact feast/title / titular saint / explicitly appointed Gospel subject | **16** | **30.2%** | Yes, as source-subject research, **not published** |
| **B** — justified and specifically labelled contextual subject | **20** | **37.7%** | Yes, as **provisional** A+B thematic coverage, **not exact readings** |
| **C** — no defensible source-subject or B decision yet | **17** | **32.1%** | **No** |
| **A+B** provisional candidates | **36** | **67.9%** | No image is aesthetically or legally approved |

The exact matches are [18 original-to-observed-ID records](../../data/calendar/sacred-art-1962-exact-feast-source-links.v1.json) on **16** dates, while the [20 contextual associations](../../data/calendar/sacred-art-2026-i-class-contextual-reuse.v1.json) are in a distinct ledger **excluded from strict original observed-source IDs**. Every record includes the painting's museum/foundation link and its existing SHA256. Grade A is 16/53 in the **strict original-to-resolved-ID mapping**, not 36/53. Every source must undergo final image inspection and applicable rights/crop review.

Example A newly reconciled: **II Sunday of Lent**, 1 March 2026, observed `tempora:Quad2-0:1:v`, Gospel **Matthew 17:1–9** (Transfiguration), source painting `kress-k2016`. Scripture cross-reference: [1962 Missale Meum II Sunday of Lent](https://missalemeum.com/en/calendar/2056-02-27). This original is **Kress rights-held**, not production-cleared.

Example B: the Resurrection painting may support multiple Easter-octave days; it does **not** claim to illustrate each day's individual readings. The Pentecost painting similarly serves the octave as **contextual** art, with the Commons file rights-held. Good Friday's Crucifixion and Holy Thursday's Last Supper depict central mysteries, not images of every 1962 ritual action.

**Rights:** **10 of the 36** provisionally associated dates use at least one rights-held source. Grade A/B is a liturgical appropriateness assessment, **not rights approval**. All **53/53** observed identities were independently read from the production 2026 DayResolver audit; its independent checkpoints are bounded, not full-year external certification.

## Only 17 first-class days remain without A or B

| Date (2026) | Observed principal | What research must establish |
|---|---|---|
| 2026-02-18 | Ash Wednesday | liturgy and gospel research; exact Gospel/rite/subject image required |
| 2026-02-22 | I Sunday of Lent | gospel research; exact Gospel/rite/subject image required |
| 2026-03-08 | III Sunday of Lent | gospel research; exact Gospel/rite/subject image required |
| 2026-03-15 | IV Sunday of Lent | gospel research; exact Gospel/rite/subject image required |
| 2026-03-22 | Passion Sunday | liturgy and gospel research; exact Gospel/rite/subject image required |
| 2026-03-30 | Feria II of Holy Week | holy week scripture research; exact Gospel/rite/subject image required |
| 2026-03-31 | Feria III of Holy Week | holy week scripture research; exact Gospel/rite/subject image required |
| 2026-04-01 | Feria IV of Holy Week | holy week scripture research; exact Gospel/rite/subject image required |
| 2026-04-04 | Holy Saturday | complex rite subject; exact Gospel/rite/subject image required |
| 2026-04-12 | Low Sunday | gospel research; exact Gospel/rite/subject image required |
| 2026-05-01 | St. Joseph the Workman | related saint different feast; exact Gospel/rite/subject image required |
| 2026-06-12 | Sacred Heart of Jesus | exact feast; exact Gospel/rite/subject image required |
| 2026-10-25 | Christ the King | exact feast; exact Gospel/rite/subject image required |
| 2026-11-29 | I Sunday of Advent | gospel research; exact Gospel/rite/subject image required |
| 2026-12-06 | II Sunday of Advent | gospel research; exact Gospel/rite/subject image required |
| 2026-12-13 | III Sunday of Advent | gospel research; exact Gospel/rite/subject image required |
| 2026-12-20 | IV Sunday of Advent | gospel research; exact Gospel/rite/subject image required |

No seasonal or subject-pool painting was automatically counted for these dates. The [complete 53-day source crosswalk](../../data/calendar/sacred-art-first-class-2026-research-crosswalk.v1.json) and [repeatable A/B/C report](../../tools/calendar/report-sacred-art-liturgical-priorities.mjs) now provide per-day image IDs, original rights and evidence, plus research candidates for each unresolved day.

### Reprioritise the C dates in large groups

1. **Six dated liturgical Proper clusters**: Ash Wednesday; I/III/IV Lent, Passion Sunday; Holy Monday–Wednesday; Holy Saturday and Low Sunday. Recover appointed Gospel/ritual paintings, not a generic Passion backdrop.
2. **Four Advent Sundays**: recover the distinctive Gospel scenes. The existing broad `calendar.advent` pool is a research lead only; no false date-level coverage.
3. **Saint Joseph the Worker**: need labor/workshop-specific iconography. A normal Holy Family picture remains insufficient for an exact trade-specific subject.
4. **Two difficult principal feasts**: Sacred Heart and Christ the King remain exact subject gaps (zero qualified acquired original for each). [Museum/image-rights source blockers](../../data/calendar/sacred-art-hard-feast-blockers.v1.json) recorded.

## Research quality expansion (effective only for new acquisition research)

See the [v2 research quality tiers](../../data/calendar/sacred-art-research-qa-tiers.v2.json).

- **Preferred**: museum-original full-colour painting of >=2500px longest dimension, colour fraction >=0.07; retain as original, still not approved.
- **Borderline retained**: original >=1800px and colour fraction >=0.025; retained with full SHA256 and contact-sheet preview, **never automatically credited to subject minimums**, before human review.
- **Too small/near-monochrome**: reject until a stronger reproduction is found.
- Freely reproducible historical frescoes, painted icons and altarpiece cycles may enter *manual research screening*. This does **not** imply museum API classifications or image rights are automatically proven.
- Exact subject provenance, original object ID, worldwide commercial reuse rights, physical pixel quality, source hash, a readable mobile crop and curatorial approval are separate mandatory publication gates.
- **First-pass coverage:** one defensible A/B source per day before chasing second/third alternatives; **do not lower canonical original-depth targets or fake progress by rewriting minima**.

The broad source-research acquisition lane now records preferred and borderline research originals separately rather than discarding all subdued-colour/1800–2499px reproductions. **No new candidate is imported automatically into the master registry or published.**

## Next gated phases

**Batch B:** research the **17 C dates**, plus the six existing major feast subject-minimum shortfalls (Palm Sunday, All Saints, All Souls, Transfiguration, Sacred Heart, Christ the King); process large museum-API batches, deduplicate by original object and hash, and retain all rejected-source reasons. **Module inventory** follows, then observed II/III/IV ranks, keeping canonical source-of-truth IDs across all branches.

**Only as final phase:** a comprehensive standalone HTML with actual artwork thumbnails and large-image viewing grouped by 1962 class, obligation, observed feast, Pray, Formation, Rosary, Stations and Scripture. Human decisions Accept / Reject / Needs Review / crop note; export versioned JSON. Reconcile that JSON against canonical image ID, SHA256, rights, actual liturgical identity and mobile crop **before** app release. No HTML has been built in this phase.

**Important storage risk:** original GitHub Actions archives have finite retention, commonly 30 days. Future consolidation must preserve accepted originals durably and recheck their hashes; a list of archive IDs does not by itself preserve image bytes.
