# Continuous priest and Missal position — source-backed 1962 ordinary Sung Mass

The Mass icon must track **physical station, facing, movement, Missal location, liturgical actor, and transient action independently**. It is not enough to assign an icon per section.

This inventory resolves 49 existing sourced position transitions across **279 canonical source cue IDs, 96 source blocks, and one separately marked synthetic sermon pause**. It does not touch the production reader.

The canonical source file is `data/presentation/mass-priest-position-continuity-20261020.v1.json`; this is its human-readable index.

## Source section index

Entry and exit stations are shown, but each of the 96 blocks contains exact per-cue events and conditional transitions; the section is not necessarily stationary. Missal location is independent of where the priest stands.

| Section | Blocks | Priest: entry → exit | Missal: entry → exit |
|---|---|---|---|
| Prayers at the Foot of the Altar | B001–B010 | FOOT_CENTER → FOOT_CENTER | EPISTLE_SIDE → EPISTLE_SIDE |
| Ascent and Altar Preparation | B011–B013 | ALTAR_STEPS_ASCENDING → ALTAR_CENTER | EPISTLE_SIDE → EPISTLE_SIDE |
| Introit, Kyrie, Gloria and Collect | B014–B019 | ALTAR_EPISTLE_MISSAL → ALTAR_EPISTLE_MISSAL | EPISTLE_SIDE → EPISTLE_SIDE |
| Epistle and Chants before the Gospel | B020–B022 | ALTAR_EPISTLE_MISSAL → Observation needed | EPISTLE_SIDE → EPISTLE_SIDE |
| Gospel Preparation and Proclamation | B023–B026 | ALTAR_CENTER → ALTAR_GOSPEL_MISSAL | EPISTLE_SIDE → GOSPEL_SIDE |
| Optional Sermon | B096–B096 | Preaching location: observed → Observation needed | GOSPEL_SIDE → GOSPEL_SIDE |
| Credo | B027–B027 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Offertory Proper | B028–B030 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Preparation of the Oblations | B031–B038 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Orate fratres and Secret | B039–B041 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Preface and Sanctus | B042–B046 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Canon before the Consecration | B047–B051 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Consecration | B052–B053 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Canon after the Consecration | B054–B061 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Pater noster, Fraction and Pax | B062–B067 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Agnus Dei and Priest's Communion | B068–B076 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE → GOSPEL_SIDE |
| Communion of the Faithful | B077–B082 | ALTAR_CENTER → COMMUNION_RAIL | GOSPEL_SIDE → GOSPEL_SIDE |
| Ablutions and Communion Chant | B083–B085 | ALTAR_CENTER → ALTAR_EPISTLE_MISSAL | GOSPEL_SIDE → EPISTLE_SIDE |
| Postcommunion | B086–B088 | ALTAR_CENTER → ALTAR_EPISTLE_MISSAL | EPISTLE_SIDE → EPISTLE_SIDE |
| Dismissal and Blessing | B089–B092 | ALTAR_CENTER → ALTAR_CENTER | EPISTLE_SIDE → EPISTLE_SIDE |
| Last Gospel | B093–B095 | ALTAR_GOSPEL_MISSAL → ALTAR_GOSPEL_MISSAL | EPISTLE_SIDE → EPISTLE_SIDE |

## Critical rubrical boundaries

| Event | Canonical cue | Priest location | Missal location | Ritus servandus |
|---|---|---|---|---|
| Collect | `C0072` | Epistle-side Missal | Epistle | V.1 |
| Gospel proclamation (Missa Cantata priest only) | `C0086` | Gospel-side Missal | Gospel | VI.2, VI.8 |
| Gospel proclamation (Solemn, by deacon) | `C0086` | Priest remains at Epistle side; deacon Gospel side | Gospel | VI.5 |
| Optional sermon | `B096.SYN` | **Unresolved until preacher/position observed** | Gospel | Conditional homilist |
| Offertory antiphon | `C0109` | Centre, facing altar | Gospel | VII.1 |
| Chalice preparation | `C0113` | Epistle side | Gospel | VII.4 |
| Chalice offering | `C0114` | Centre | Gospel | VII.5 |
| Lavabo | `C0125` | Epistle side | Gospel | VII.6 |
| Suscipe sancta Trinitas | `C0128` | Centre | Gospel | VII.7 |
| Secret | `C0134` | Centre, facing toward book | Gospel | VII.7 |
| Preface | `C0144` | Centre, facing toward book | Gospel | VII.8 |
| Priest's Communion antiphon | `C0249` | Epistle-side Missal, **when observed** | Epistle after ablutions | XI.1 |
| Schola / adjacent Communion cue | `C0250` | **Do not assume movement from the Schola cue** | Epistle, contingent on observed priest's event | XI.1 |
| Postcommunion | `C0253` | Epistle-side Missal | Epistle | XI.1 |

### Missal's three anchored states

- Before Mass: Missal at Epistle side (`C0001`, Ritus II.4).
- Before Gospel: Missal transferred to Gospel side (`C0081`, Ritus VI.1); it **remains there through the Offertory, Secret, Preface, Canon**. The priest can nevertheless be **at the altar centre**.
- After ablutions: Missal carried back to Epistle side (priest `C0249` / observed event `MC-END-010`, Ritus XI.1).

### Source-only position versus actual observed position

For a genuine LIVE tracking surface, advancing user text or Schola text is **not evidence the priest moved**. The canonical 1962 order supplies an *expected reference track*, while actual observed priest movements may be late/early relative to that track. Preserve last independently observed station or display an explicit unknown status. Never invent a stationary icon from `PRIEST_TRACK_ASYNC` or `ROUTE_CONTROLLED`.

The optional sermon `AO.SM.B096.SYN` has a legacy bookkeeping sort number of 265 but is presented **between Gospel block B026 and Credo block B027**; it is *not* the 280th canonical liturgical cue. The priest-preaching icon is only correct if the priest is in fact preaching at that station.

Conditional rites and actors cannot be collapsed: at Solemn Mass the **subdeacon sings the Epistle** and **deacon sings the Gospel**; in Missa Cantata the Epistle may be sung by a minister or read/sung by the priest (Ritus VI.4–VI.8).

## Release safeguards

The existing `reader-priest-positions.v1.json` (49 certified transitions) and 48-card LIVE model remain unchanged. The supplemental `C0249` source-backed correction is deliberately **observer-gated**. The names of approved assets, the rejected-art exclusion registry, and the source event IDs are untouched.

The staged file must next be integrated into the runtime using separate Low/Sung/Solemn form profiles and independently observed priest-event triggers. Before merge, run `node tests/mass-priest-position-continuity.mjs`, `node tests/mass-final-icon-crosswalk.mjs`, and the relevant reader/phone/ceremonial tests. **These tests have not been executed within this chat.**

1962 Ritus servandus, sections II, V, VI, VII, XI:
https://1962ordo.today/1962-rubrics/
