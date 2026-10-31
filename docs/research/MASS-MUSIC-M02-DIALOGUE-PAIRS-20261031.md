# Mass Music M02 — celebrant/minister and response source pairs

**31 October 2026 · Stacked on M01 / PR #2152 · Not released**

## What is implemented
- `src/mass/reader-mass-sung-dialogue-pairs.js`: pure source-cue projection for eight source-dialogue families, reused across ten existing Schola events. These yield fourteen exact source exchanges (some deliberately shared by the intonation and continuation events), without any second clock or duplicating the Latin words.
- `src/mass/reader-schola-event-timeline.js` projects `sungDialogue` on the original 36-event itinerary. Absent Gloria and Credo remain absent; an unverified ceremony never gains a fictitious music event.
- `src/mass/reader-dom.js` shows restrained EN/FR text identifying the source-linked intonation/response pairs in the existing MUSIC event list, clearly indicating that actual tones remain unverified.
- `tests/reader-mass-sung-dialogue-pairs.mjs` checks real cue IDs and block membership in the pinned Sung text source, 1962 actor overrides for split Gloria/Credo intonation, all three Preface responses, three Sung forms, selected source variants, Low structural absence, Requiem exceptions and no date-based musical guessing. The existing Schola test script imports it.

## Source-owned dialogue registry

| Event | Actual source-cue groups | Conditions |
|---|---|---|
| Gloria | celebrant `C0053+C0054` → Schola from `C0055` | Only where Gloria in resolved Mass |
| Collect | `C0070` → `C0071`; `C0072–C0074` are separate, Proper-dependent cues | Resolved oration/Amen text remains the reader's |
| Gospel | `C0082` → `C0083`; `C0084` → `C0085` | Deacon in Solemn; celebrant in Missa Cantata |
| Credo | celebrant `C0089+C0090` → Schola from `C0091` | Only where Credo in resolved Mass |
| Preface | `C0137/138`, `C0139/140`, `C0141+C0142/143` | Three source-exact exchanges; no tone implied |
| Pater noster | `C0209` → `C0210`; `C0208` preceding invitation | Private priest `C0211` is **not** an audible response |
| Postcommunion | `C0251` → `C0252`; `C0253–C0255` are Proper-dependent | Resolved source prayers/response only |
| Dismissal | `C0257/258`, `C0259/260` | Ordinary `Ite`, source-selected `Benedicamus`, explicit Requiem `Requiescant/Amen` |

The 14 exchange entries count duplicated metadata for Gloria and Credo's separate existing Schola itinerary events. There are 12 distinct exchange identities; no second performance is created.

## Liturgical and musical safeguards
- 1962 General Rubrics §507: `Ite missa est` / `Deo gratias` by default; `Benedicamus Domino` for relevant processional endings; `Requiescant in pace` / `Amen` in Masses of the Dead; the actual octave-of-Easter double Alleluia must be resolved from an authenticated Mass/Proper owner, not the Gregorian date alone. Primary witness: https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
- Ritus servandus XIII.1: Requiem-specific changes and suppression remain the existing `reader-requiem-conditions.js` authority.
- Gloria and Credo priest intonation boundaries remain `reader-speaker-roles.js` and the existing combined `ordinary-reader-composition.js` source cues; the final donor syllable is not attributed to the Schola by accident.
- Solemn/ferial tone and compatibility between the celebrant and responding choir/congregation **require musical-source collation**. A seasonal calendar label, feast rank, custom Kyriale title or local parish setting cannot promote a melody.
- No GABC/score, recording, external audio, `Date`-based seasonal assignment, actor gesture, organ permission, choir observation, chant timer, card count or physical text is changed.

## Remaining work
**M03** should attach printed, edition-verified sources for the celebrant's solemn/ferial tones and corresponding responses; source-resolved Gloria/Credo intonations must be compatible with the selected Kyriale/Credo and 1962 use. Where a tone cannot be sourced, keep the exact bilingual words and cue pair with `NOT_SOURCE_CERTIFIED`.

**M04** should complete the three dismissal musical families plus the Easter octave double Alleluia, and then the Proper material, Aspersion and special rites. Do not let the source-only M02 dialogue map become a claim that audio or notation is already in the reader.

## Release boundary
Draft stacked PR, base `feature/mass-music-m01-source-gates-20261031`, never merge into default `main` before M01 and current-head required CI, app, four-form EN/FR phone/visual acceptance. No new score or recording editorial approval is bypassed.
