# Mass 1962 — prayer sequence, responses and paragraph ownership

**Date:** 13 October 2026  
**Branch:** `fix/mass-oration-structural-dialogue-20261013`  
**Integration PR:** #1148  
**Status:** Corrective implementation and automated audit in progress. This is **not** whole-Mass liturgical certification.

## Authoritative source and preservation

- Immutable source units: `data/presentation/reader-text-low.v1.json` and `data/presentation/reader-text-sung.v1.json`; 96 canonical display blocks in each form. The user-facing reader must follow these identities and derived 1962 rubric data, not inferred text order from UI cards.
- Existing Rubrics / French research: PRs #1144, #1146, #1147; `docs/MASS-PARAGRAPH-RAILS-AND-DYNAMIC-GUIDANCE-CONTRACT-20261013.md`; `data/research/mass-rail-paragraph-coverage-20261013.json`.
- The 1962 *Rubricae generales Missalis Romani*, nn. 433–438 (oration/commemoration grouping), 480–481 (Secrets), and the 1960 General Rubrics nn. 106–114 govern the explicit prayer grouping decisions. [Original Missal 1962](https://www.fichier-pdf.fr/2018/06/03/missale-romanum-1962/), [Divinum Officium rubrical transcription](https://www.divinumofficium.com/www/horas/Help/Rubrics/Missal1960%20rubrics.html).
- Preserve canonical cue IDs, wording, form-specific speaker and priest/faithful clocks, default native reader, and 1962 calendar resolution. Only verified presentation paragraphs may be inserted or separated.

## Concrete defects and implemented corrections

| Defect | Source ownership / correction | Status in PR #1148 |
|---|---|---|
| One additional, separately concluded Collect lacked its own `Oremus` | B018/C0072 remains the principal invitation; insert a derived *Orémus* before each **additional concluded group** (not every source text), with stable group ID | Code + regression |
| Intermediate Collect/Postcommunion had no separately labelled respondent `Amen` | Insert intermediate `RESPONSE`; canonical B019/C0074 and B088/C0255 remain the last responses | Code + regression |
| Two commemorations joined under one conclusion could be presented as two independent concluding prayers | Group two sourced commemorations as two focus paragraphs within one additional concluded group; no third *Oremus* | Code + regression |
| Mission Sunday `sub unica conclusione` and separately concluded following commemoration conflated | Keep mission paragraph under principal group, preserve one final conclusion; separate following St Luke group only if the source form permits | Code + regression |
| Secret conclusion `Per omnia ... Amen` duplicated against B041/C0135–C0136 | Strip the **certified last Secret's** terminal audible formula from Proper display when Latin and vernacular align; the canonical public B041 supplies the formula and response. Prior Secrets remain private. | Code + regression; unmatched Latin tails remain to audit |
| Psalm 42 minister half-verses looked like undifferentiated celebrant text | Exact C0005/C0007/C0009/C0011 displayed as minister responses, preserving source and `M.` | Code + regression |
| Low Mass alternating Kyrie minister turns not typed as responses | C0045/C0047/C0049/C0051 are typed `RESPONSE` only in Low; Sung retains choir owner | Code + regression |
| Source Proper prayer role and liturgical grouping lost between resolution and DOM | Preserve speaker, group, prayer role and source path; render restrained principal/commemoration heading within paragraph | Code + regression |

## Order gates recorded in tests

The sequence assertions apply to both source families, keeping their published source block order without deleting optional branches. Principal anchors:

1. `B017` Dóminus vobíscum → `B018` Orémus → `B019` Collect(s) + response → `B020` Epistle.
2. `B023–B026` Gospel preparation/proclamation → `B096` sermon → `B027` Creed (when prescribed).
3. `B028–B030` Offertory dialogue and antiphon → `B039` Oráte fratres → `B040` silent Secret(s) → `B041` audible ending + response → `B042–B045` Preface dialogue and text.
4. `B046–B061` priest/choir Sanctus and Canon sequence including **distinct** Host and Chalice Consecration moments.
5. `B062–B068` Pater noster, Libera nos, Pax Domini and Agnus Dei.
6. `B073–B085` priest's Communion, optional local Communion Confiteor where selected, Communion of the faithful, ablutions and Communion antiphon.
7. `B086–B088` postcommunion invitation and prayers → `B089–B095` dismissal, blessing and Last Gospel.

Test files: `tests/proper-reader-slots.mjs`, `tests/reader-speaker-roles.mjs`, `tests/reader-text.mjs`, `tests/reader-dom.mjs`, `tests/mass-1962-mission-sunday.mjs` and real 2026 witness browser E2E tests.

## Remaining mandatory gates (not certified)

1. End-to-end **real-day, all-form** native UI inspection: Low, Missa Cantata simple, Missa Cantata with incense and Solemn, EN/FR.
2. **Special Proper and alternative order**: Ember-day multiple readings, Lenten Oratio super populum, Requiem, Holy Week, nuptial and rogation overlays and calendar/votive branching.
3. **Sung parallel clocks**: priest and Schola Sanctus/Benedictus and Gospel, distinct cue ownership, no claim that public chant marks the priest's silent position.
4. **Each substantive text paragraph**: speaker classification, exact source cue or stable derived-group anchor, Latin–vernacular pairing; no artificial prayer repetition, omission or duplication.
5. **Gestures and rubrics**: every paragraph's left faithful posture/gesture, right priest position/gesture, in-text action rubric and replacement guidance ribbon according to the separate 13 October contract. Current source gap audit notes **42 of 58 Canon cues** with newly verified priest actions but no detailed matching rubric. Do not report this as implemented or certified.
6. **Publisher gate**: mandatory CI and live phone-browser acceptance successful after all changes; source branch must be merged and deployed before making a claim about production/Vercel.

## Editorial rule

A regression passing on a static Ordinary source verifies ordering **only for that source**, not correct applicability for every local calendar, Mass form or optional rite. Any unresolved proper, rubric or translation must remain visibly unverified rather than be inferred from a nearby section.
