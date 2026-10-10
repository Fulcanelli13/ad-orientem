# Pray + Formation — canonical information architecture and relationship map

**10 October 2026 — architectural decision draft, not a live UI or content publication.**

Machine-readable, source-reconciled crosswalk: [`data/app/pray-formation-ia-crosswalk.2026-10-10.v1.json`](../data/app/pray-formation-ia-crosswalk.2026-10-10.v1.json). Baseline `main` SHA: `75273300dcae8809885938d167f4a1f41b8bcced`.

## 1. The organising rule

Prayer execution belongs exclusively to Pray. Positive doctrine is owned by the Catechism and its own Formation courses. Questions and debates are projections of their canonical owners; Apostolate owns conversational practice, not second answers; Scripture and Glossary own contextual references. Calendar owns timing, Mass its own liturgical execution and reader. The experience can link them but must never duplicate their data. Existing module IDs, aliases, source links and reader state must survive the presentation reorganisation.

**Do not ship another flat grid of cards.** Make the main entrances few, salient and action-oriented; let search and family-level browsing provide access to the full corpus one level deeper. Permanent app tabs do not change.

## 2. PRAY: the proposed first two levels

At the landing screen, a compact `Pray now` focus selects an available canonical route based on documented time/season signals; `Continue` appears only for genuine resumable Prayer state. A single thematic artwork and a limited set of meaningful actions should occupy the initial viewport, not one decorative image per module. Prayer Library is always reachable via search.

**Four primary discovery families** (plus the Library tool) lead to controlled nested content, with a quiet *At Life's End* subfamily inside Devotions:

| Entry | Existing routes retained (not cloned) |
|---|---|
| **Daily & Marian** (5) | `pray.morning_evening`, `pray.angelus_regina`, `pray.rosary`, `pray.meal_prayers`, `pray.nightly_examen` |
| **Before the Blessed Sacrament** (4) | `pray.adoration`, `pray.benediction`, `pray.forty_hours`, `pray.communion_treasury` |
| **Penance & the Passion** (5) | `pray.confession`, `pray.penitential_psalms`, `pray.litany_saints`, `pray.stations`, `pray.seven_words` |
| **Novenas & Devotions** (6) | `pray.novenas`, `programme.first_friday`, `programme.first_saturday`, `pray.sacred_heart`, `pray.holy_name_litany`, `pray.sacred_hymns` |
| **At Life's End (nested)** (2) | `pray.good_death`, `pray.dying_companion` |
| **Prayer Library (search tool)** (1) | `pray.library` |

Each route has exactly one primary navigational home in the JSON. Contextual exposures such as 'Today → Rosary' or 'Formation → Confession preparation' point to that same ID. The current source maintains the original families `daily`, `eucharistic`, `penance`, `passion`, `devotions`, `library` until an independently tested UI migration.

The leaf interface depends on content type: short prayer, search/detail reader, guided sequence (Rosary or Stations), public-rite companion (Benediction), novena/programme, pastoral-care guide. Do not force all of them through a step-counter, checklist, giant card or one common 'Next'.

## 3. FORMATION: three user intentions, not six unrelated catalogues

1. **Learn the Faith** — four compact subject families: Foundations; Christian Life & Morals; Sacraments & Life; Liturgy & Latin. Keep all published courses, guides, Catechism study and 40 Latin lessons. Group by user need, not programming module boundary.
2. **Questions & Debates** — question-search and concise-answer presentation first, with cited argument/objection depth on request. `learn.sexual_ethics` is the live substantive questions owner; `learn.catechism` remains doctrine owner even when its existing questions are discovered here. Apologetics and Church Crisis remain unpublished until independently certified.
3. **Put It into Practice** — existing Apostolate route and its 36 ready scenarios / nine skills. Present Answer / Help / Introduce / Practise as actions within one experience, retaining the six original scenario-family codes and all existing texts and source links.

`learn.glossary` is a contextual lookup and discoverable reference tool—not an equal homepage tile that competes with whole Formation families. Scripture is the other shared reference service. The `learn.catholic_life` catch-all stays retired, and `learn.seasonal_rites` remains compatibility-only.

**Canonical mapping of every published Formation launcher:**

| Current module ID | User-facing entrance | Cluster / ownership |
|---|---|---|
| `learn.catechism.daily` | learn | foundations · learn.catechism |
| `learn.catechism` | learn | foundations · catechism |
| `learn.spiritual_life` | learn | christian-life · spiritual-life |
| `learn.sexual_ethics` | questions | christian-life · sexual-ethics |
| `learn.scapular` | learn | christian-life · formation-devotional-guide |
| `learn.mass` | learn | worship-latin · mass-formation |
| `learn.serve_mass.responses` | learn | worship-latin · mass-formation-practice |
| `learn.rites.sick` | learn | sacraments · sacramental-formation |
| `learn.rites.baptism` | learn | sacraments · sacramental-formation |
| `learn.rites.first_communion` | learn | sacraments · sacramental-formation |
| `learn.rites.confirmation` | learn | sacraments · sacramental-formation |
| `learn.rites.holy_orders` | learn | sacraments · sacramental-formation |
| `learn.rites.matrimony` | learn | sacraments · sacramental-formation |
| `learn.latin` | learn | worship-latin · latin |
| `learn.glossary` | reference | reference · glossary |

Repeated exposure is not a duplicate owner. `learn.sexual_ethics` may appear as an adjacent option from Christian Life, but its primary browse and in-depth questions stay in Questions. `learn.catechism.daily` remains a review projection of the Catechism, not 433 new duplicated content items.

## 4. Contextual relationships (already coded vs still proposed)

The old [`data/app/content-navigation-registry.v1.json`](../data/app/content-navigation-registry.v1.json) supplies **15 declared cross-surface handoff classes**, including Calendar→Novena, Prayer→Scripture, Formation→Glossary, Apostolate→canonical Formation/Prayer and Explore→related devotion. `src/app/contextual-study.js` already knows specific Glossary IDs; `src/learn/discovery.js` searches public Formation and references. Do not replace either owner.

Every proposed related-action control must resolve a **real canonical ID** and satisfy: published target; verified claim-level relevance; known source/provenance; same-return route; no duplicated text; no false full-text Bible claims.

Priority pathways:

| User starts at | Contextual destination | Canonical owner |
|---|---|---|
| Formation: Confession / Penance teaching | `pray.confession` (guided preparation) | Pray |
| Pray: Confession | Doctrine/meaning of Penance, `G036` Glossary | Catechism / Glossary |
| Formation: Marian doctrine | `pray.rosary`, `pray.angelus_regina` where semantically appropriate | Pray |
| Formation: Sacramental preparation / the dying | `pray.good_death`, `pray.dying_companion` with strict priest-only boundaries | Pray |
| Pray: Rosary mystery | verified passage capsule | Scripture |
| Calendar / Coming Up | canonical `pray.novenas` item with dated programme | Calendar dates / Pray execution |
| Apostolate pastoral scenario | exact canonical Formation or Prayer target | Formation / Pray |
| Formation: Catholic moral question | existing 150-item Sexual Ethics reader, not another Q&A bank | Sexual Ethics |

**Return semantics:** capture `originSurface`, `originRoute`, `originItemId`, `view`, focus target and scroll/step before the transition; restore them on Back. Keep return-to-origin with lazy loaders. An error must leave the caller in place and identify the exact failed destination. Do not reimplement the separate navigation fixes under PR #889.

## 5. Cross-link findings from the existing Apostolate corpus

**72 scenario-level handoffs** are declared across 36 Apostolate scenarios. These are links in source, not 72 successfully opened journeys. Their source-level categories are: **56** declared ordinary targets awaiting end-to-end verification, **10** Mass-related targets deferred to the final Mass phase, and **six problematic handoffs**:

| Scenario | Target | Finding |
|---|---|---|
| `AQ01` | `pray.marian` | No matching visible canonical Prayer module ID among the 23 public entrances; reconcile exact intended existing module before exposing |
| `AQ07`, `HS05`, `HS06` | `pray.holy_souls` | Same direct-route discrepancy; a suitable existing Prayer Library item may be preferable, but inspect canonical prayer keys first |
| `DV04`, `DV05` | `calendar` | The Apostolate handler currently allows `learn`, `pray`, `find`, `mass` but excludes `calendar` and rejects it |

An unlisted `pray.*` target is a **source-level reconciliation finding**, not a declaration that its intended devotional text is missing. Do not manufacture replacement text or an extra Prayer module. The two Calendar transitions are **code-level router exclusions**.

## 6. Guide policy by reader type

The existing [`data/app/guide-coverage-two-function-audit.v1.json`](../data/app/guide-coverage-two-function-audit.v1.json) distinguishes meaning/context from walkthrough. Both matter where the experience genuinely calls for them. However, a small Prayer Library text or Glossary definition should not be forced through a guided sequence.

- Guided prayer: optional short historical/contextual Guide, followed by user-paced active recitation with posture/response cues where authentic and sourced.
- Programme: purpose, start-date rule and sources, then existing step/day state (e.g. novena or First Fridays).
- Formation course: short orientation, indexed lessons, citations and continuation point; optional review when supported.
- Questions/debates: concise answer first, then authentic opposing argument, sourced response, pastoral implications and full deep links. Do not show internal editorial comments as traditional commentary.
- Apostolate scenario: short answer or practical action, source evidence, limits, relevant canonically owned continuation; keep input/draft state on outbound handoff.
- Reference lookup: short meaning, source and precise backlink. No fabricated guide progress.

Source-level guide audit currently records **29 information follow-ups and 15 walkthrough follow-ups** across assessed app routes. These are follow-up candidates, not 44 verified missing interfaces. The JSON crosswalk preserves available per-route status.

## 7. Visual design once relationships are correct

Both sections inherit the Calendar/Today v3 sacred editorial language: elegant display hierarchy, dark ground, liturgical accents only where meaningful, restrained real artwork, 44px touch targets, bilingual typography, and predictable navigation. Avoid large equal-priority card walls or separate dashboards inside every module.

PRAY: one salient 'Pray now' focus and one featured devotion, then a compact four-family selector and persistent Library search. FORMATION: one clear header, `Learn / Questions / Practice`, contextual search and four simple subject families; open course/article readers only after selection. Apostolate keeps its separate scenario player behind Practice. Artwork and icon choices should follow canonical subject identity, not decorative abundance.

## 8. Implementation phases and acceptance gates

1. **Link repair and ownership:** solve six identified Apostolate handoffs, add precise existing Prayer Library identities rather than creating modules. Complete 23/23, 15/15, 36/36 reachability (source and actual phone) and exhaustive outbound scenario checks. Route fixes require tests.
2. **Pray IA migration:** change only the hub's presentation grouping/search, keeping the existing player components, saved prayer states, 23 IDs, source provenance and EN/FR copy.
3. **Formation IA migration:** implement Learn/Questions/Practice projections over current 15 modules and Apostolate. Make approved content-only index searchable; no APOL/CR release; keep retired aliases.
4. **Content-level linking and guide refinement:** claim-verified links for catechism, sacraments, spiritual life, confession, Marian prayer and Apostolate; expand guide material only after existing audit reconciliation.
5. **UX acceptance and coherent artwork:** 320/360/390/430px, keyboard, long French labels, offline/failed source states, search, deep-link aliases, focus and scroll restoration. Only merge after CI/phone tests.
6. **Other modules afterwards; Mass UI/UX is last.** Protect existing 48-card R17 LIVE and its lifecycle.

**This batch does not modify any public route, prayer text, formation answer, Mass reader, Calendar calculation or active module presentation.** It supplies the canonical target map and testable architecture contract for the subsequent code PRs.
