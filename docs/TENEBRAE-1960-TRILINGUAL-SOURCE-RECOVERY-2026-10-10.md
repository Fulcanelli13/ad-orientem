# Tenebrae — three-day 1960/1961 Breviary source acquisition

**Preserved on 10 October 2026. No user-facing reader published yet.**

## Direct textual sources already acquired

Nine exact UTF-8 source leaves from the Divinum Officium project, pinned to upstream commit [`b9f8c8eb15d5`](https://github.com/DivinumOfficium/divinum-officium/commit/b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0):

| Day | Latin | English | French |
| --- | --- | --- | --- |
| Holy Thursday, `Quad6-4` | 14,559 chars | 15,966 chars | 16,768 chars |
| Good Friday, `Quad6-5` | 13,428 chars | 15,636 chars | 16,996 chars |
| Holy Saturday, `Quad6-6` | 11,063 chars | 13,198 chars | 12,968 chars |

All nine are stored under `data/pray/tenebrae-1960-source/{la,en,fr}/`; exactly **9 lessons and 9 responsories per day and locale** are present in the Proper leaves, together with the Matins and Lauds antiphons and office formulas.

This is a **source acquisition**, **not** 3 complete assembled offices. The underlying Breviary's Psalter, seasonal ordinary, incipits, psalm antiphon repeats, Benedictus, orations, and `@` cross-file/source-variant substitutions must be resolved for a playable local in-app text. The source files explicitly contain unexpanded `@` references; a raw text dump is *not* a reader.

The upstream repository's [MIT license](https://github.com/DivinumOfficium/divinum-officium/blob/b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0/LICENSE) is preserved verbatim at `data/pray/tenebrae-1960-source/LICENSE`. The team answered in [discussion #5071 (5 March 2026)](https://github.com/DivinumOfficium/divinum-officium/discussions/5071) that their liturgical texts are open source and require no additional permission. We retain attribution and independent Latin edition-review obligations.

## Strict 1962 rubrical separation

A complete 1962-oriented Tenebrae journey should take **Matins and Lauds for Holy Thursday, Good Friday and Holy Saturday** from the 1960 rubrics / 1961 Breviary edition. Do **not** equate that with the anticipated prior-evening pre-1955 ceremony. The 1960 Code permits limited Matins anticipation but **does not anticipate Lauds**, and the 1961 breviary did not retain some classical candle-hiding/noise rubrics. The rich pre-1955 fifteen-candle service can appear as clearly identified historical or locally observed practice, not as the mandatory 1962 rite.

Independent sources: [1960 Breviary rubrics](https://www.divinumofficium.com/www/horas/Help/Rubrics/Breviary%201960.html); [1955 Office changes — NLM](https://www.newliturgicalmovement.org/2009/04/compendium-of-1955-holy-week-revisions_07.html).

## Product owner and next certification

Ad Orientem should add a **seasonal three-day PRAY journey**, not the entire Divine Office. Display the two hours for each day compactly, with Latin/vernacular in-app text, source-precise active prayer and optional scholarly context. No forced music/game-like progress/candles. Do not publish raw leaves or open an external reader as the final product.

Sequence to readiness:
1. Resolve the exact 1960/1961 year- and version-aware source macro references.
2. Complete the Ordinary/Psalter dependencies for all six hour instances; produce Latin, French and English row identities.
3. Independently collate Lamentations, readings/responsories, and prayers against original 1961/1962 Breviary print; document edition alternatives.
4. Build and phone-test the compact local reader without changing canonical R17 Mass or PRAY modules.

Machine source register: `data/pray/tenebrae-source-registry.v1.json`. CI: `tests/tenebrae-1960-source-acquisition.mjs`; dedicated workflow ensures upstream sources, edition hold and rights notice are not lost.

**Do not mark Tenebrae implemented from this PR.** It is **9/9 donor Proper leaves recovered, 0/6 offices assembled, 0 publication routes**.
