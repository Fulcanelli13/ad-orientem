# Pray / Formation / Apostolate — Contextual Guide Integration · Batch 1

Date: 10 October 2026. Parent: merged PR #902, commit `a6b46c96b1a550982ae36472f68de576b24da9b7`.

## Product rule

Cross-module connections are **situational actions shown where they are needed**, not a row of links below every page. Follow canonical owners; never copy a prayer text into Formation or a catechism argument into Prayer. The original reader continues to own its translation, state, rubrics, guide, provenance and navigation.

## Source-level integrations

| Context | Exact source location | Canonical destination | Treatment |
| --- | --- | --- | --- |
| Mental Prayer | Spiritual Life, lesson SL03 | `pray.adoration` | Optional setting for quiet prayer; does not conflate adoration with the method of mental prayer |
| General Examination | Spiritual Life, lesson SL06 | `pray.nightly_examen` | Guided daily examen, distinct from sacramental Confession |
| Serious Illness | Formation → Serious Illness, PREPARE | `pray.good_death` | Ordinary devotional preparation; emergency Dying Companion remains more salient |
| Good Death | Prayer → Good Death | `learn.rites.sick` | Explanation of priestly/sacramental care; not a substitute for it |
| Communion Treasury | Prayer → before Communion | `learn.rites.first_communion` | Only for users preparing a child; private prayers are not sacramental instruction |
| Sexual Ethics | Section `confession` | `pray.confession` | **Pre-existing:** the canonical related-details renderer and route target already implement it |
| First Friday | Reparatory stage 3 | `pray.sacred_heart` | **Pre-existing:** do not add a duplicate shortcut |

The older `pray.holy_souls` link in the Serious Illness funeral section was an obsolete route and is replaced with the canonical `pray.eternal_rest` entry. Other valid prayer texts for the departed remain untouched.

## Guide improvement

**Holy Name of Jesus litany:** retain the exact historical Latin, English and French texts, complete by default and with reversible vernacular/Latin interaction. Provide an optional **seven-section guided reading** based only on existing blank-line paragraph boundaries (5, 4, 38, 23, 3, 2, 3 lines). Include Previous / Next, with no streak, saving, completion certification, or invented recitation words. All seven divisions align across the original three translations. Original sources and provenance remain visible.

## Link ledger after this batch

Of the 20 editorial candidate relationships, **16** have identified implementation evidence and **four** remain intentionally unwired:

- `learn.rites.matrimony → learn.sexual_ethics`: needs a correct *same-Formation-owner* deep-link and return contract, not a raw registry launch.
- `learn.latin → learn.glossary`: individual Latin words already have local contextual explanations; an exact Glossary-owner route with course-position restoration requires separate testing.
- `pray.confession → learn.catechism`: source-specific doctrine context should not interrupt the active preparation flow or collect user data.
- `pray.adoration → learn.catechism`: a discretionary Eucharistic doctrine link belongs in the non-timed orientation/Guide, not the silence and response stages.

**Evidence state is not mobile acceptance.** Do not present these source-wired links as verified tap/back without browser acceptance. The former Guide audit's 25 source-level follow-ups are a snapshot, not 25 proven missing guides. Library already has `libraryOverviewGuide()` and `libraryContextMarkup()`; avoid a second library Guide.

## Regression gates

Run Content architecture census and App convergence (including the phone suite), Prayer guided cards, Formation research preview, Marian devotional acceptance, and Visual acceptance. The IA contract checks exactly 16/4 links, living owner IDs, removal of the dead alias, presence of the five new handoffs and the seven-language-aligned Holy Name section boundaries.

No Mass reader, Mass source, Calendar or source-original text is modified. The separate editorial-style PR #896 remains unmerged and must be reconciled against the current Pray/Formation grouping before styling changes are applied.
