# 1962 priest-position and Missal-continuity map

**Scope:** Ordinary 1962 Sung Mass, both Missa Cantata variants; the current source position registry has 49 transitions, but 96 source blocks with 280 source cue entries. The priest's normative station is projected across the entire source sequence; this is a reference track, not a live sensor.

**Source of truth:** `data/presentation/mass-priest-position-continuity-20261020.v1.json`. No original liturgical text, icon name, old position registry or LIVE 48-card structure is changed.

## Architecture

- Priest **station** (foot, centre, Epistle side, Gospel side, sedilia, Communion rail), **facing**, and **route** are persistent but independent variables.
- The **Missal's location** is another persistent variable. The priest can stand at altar centre while the Missal remains on the Gospel side.
- **Action** (kiss, genuflect, offer, incense, read) is momentary; it must not overwrite the physical station.
- **Actor** (priest/deacon/subdeacon/server/people/schola) must be explicit.
- **Conditions** (incense, sedilia, Requiem, special days) must be applied before selecting a position.
- A text swipe, even in LIVE mode, is not an independent observation of the priest. `PRIEST_TRACK_ASYNC` never becomes a physical location.
- **Solemn Mass** uses separate minister movements: the deacon chants the Gospel while the celebrant remains at the Epistle side (Ritus VI.5); the subdeacon chants the Epistle while the celebrant listens seated (VI.4). At Missa Cantata, Epistle reader identity can also differ (VI.8).
- **Low Mass** requires its own separately verified transition projection. Do not relabel the Sung matrix as Low Mass.

## Section overview (entry and exit of source position baseline)

These are **entry and exit snapshots, not an instruction that the priest stays in one location for the whole section**. Inspect all 96 block entries and 280 cue entries in JSON for intervening movements.

| Source section | Source blocks | Priest station at entry → exit | Missal at entry |
|---|---|---|---|
| /P/r/a/y/e/r/s/ /a/t/ /t/h/e/ /F/o/o/t/ /o/f/ /t/h/e/ /A/l/t/a/r/ | AO.SM.B001–AO.SM.B010 | FOOT_CENTER → FOOT_CENTER | EPISTLE_SIDE |
| /A/s/c/e/n/t/ /a/n/d/ /A/l/t/a/r/ /P/r/e/p/a/r/a/t/i/o/n/ | AO.SM.B011–AO.SM.B013 | ALTAR_STEPS_ASCENDING → ALTAR_CENTER | EPISTLE_SIDE |
| /I/n/t/r/o/i/t/,/ /K/y/r/i/e/,/ /G/l/o/r/i/a/ /a/n/d/ /C/o/l/l/e/c/t/ | AO.SM.B014–AO.SM.B019 | ALTAR_EPISTLE_MISSAL → ALTAR_EPISTLE_MISSAL | EPISTLE_SIDE |
| /E/p/i/s/t/l/e/ /a/n/d/ /C/h/a/n/t/s/ /b/e/f/o/r/e/ /t/h/e/ /G/o/s/p/e/l/ | AO.SM.B020–AO.SM.B022 | ALTAR_EPISTLE_MISSAL → Observed only | EPISTLE_SIDE |
| /G/o/s/p/e/l/ /P/r/e/p/a/r/a/t/i/o/n/ /a/n/d/ /P/r/o/c/l/a/m/a/t/i/o/n/ | AO.SM.B023–AO.SM.B026 | ALTAR_CENTER → ALTAR_GOSPEL_MISSAL | EPISTLE_SIDE |
| /O/p/t/i/o/n/a/l/ /S/e/r/m/o/n/ | AO.SM.B096–AO.SM.B096 | ALTAR_CENTER → ALTAR_CENTER | EPISTLE_SIDE |
| /C/r/e/d/o/ | AO.SM.B027–AO.SM.B027 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /O/f/f/e/r/t/o/r/y/ /P/r/o/p/e/r/ | AO.SM.B028–AO.SM.B030 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /P/r/e/p/a/r/a/t/i/o/n/ /o/f/ /t/h/e/ /O/b/l/a/t/i/o/n/s/ | AO.SM.B031–AO.SM.B038 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /O/r/a/t/e/ /f/r/a/t/r/e/s/ /a/n/d/ /S/e/c/r/e/t/ | AO.SM.B039–AO.SM.B041 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /P/r/e/f/a/c/e/ /a/n/d/ /S/a/n/c/t/u/s/ | AO.SM.B042–AO.SM.B046 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /C/a/n/o/n/ /b/e/f/o/r/e/ /t/h/e/ /C/o/n/s/e/c/r/a/t/i/o/n/ | AO.SM.B047–AO.SM.B051 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /C/o/n/s/e/c/r/a/t/i/o/n/ | AO.SM.B052–AO.SM.B053 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /C/a/n/o/n/ /a/f/t/e/r/ /t/h/e/ /C/o/n/s/e/c/r/a/t/i/o/n/ | AO.SM.B054–AO.SM.B061 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /P/a/t/e/r/ /n/o/s/t/e/r/,/ /F/r/a/c/t/i/o/n/ /a/n/d/ /P/a/x/ | AO.SM.B062–AO.SM.B067 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /A/g/n/u/s/ /D/e/i/ /a/n/d/ /P/r/i/e/s/t/'/s/ /C/o/m/m/u/n/i/o/n/ | AO.SM.B068–AO.SM.B076 | ALTAR_CENTER → ALTAR_CENTER | GOSPEL_SIDE |
| /C/o/m/m/u/n/i/o/n/ /o/f/ /t/h/e/ /F/a/i/t/h/f/u/l/ | AO.SM.B077–AO.SM.B082 | ALTAR_CENTER → COMMUNION_RAIL | GOSPEL_SIDE |
| /A/b/l/u/t/i/o/n/s/ /a/n/d/ /C/o/m/m/u/n/i/o/n/ /C/h/a/n/t/ | AO.SM.B083–AO.SM.B085 | ALTAR_CENTER → ALTAR_EPISTLE_MISSAL | GOSPEL_SIDE |
| /P/o/s/t/c/o/m/m/u/n/i/o/n/ | AO.SM.B086–AO.SM.B088 | ALTAR_CENTER → ALTAR_EPISTLE_MISSAL | EPISTLE_SIDE |
| /D/i/s/m/i/s/s/a/l/ /a/n/d/ /B/l/e/s/s/i/n/g/ | AO.SM.B089–AO.SM.B092 | ALTAR_CENTER → ALTAR_CENTER | EPISTLE_SIDE |
| /L/a/s/t/ /G/o/s/p/e/l/ | AO.SM.B093–AO.SM.B095 | ALTAR_GOSPEL_MISSAL → ALTAR_GOSPEL_MISSAL | EPISTLE_SIDE |

## Rubrical checkpoints: crucial examples

| Moment | Exact cue | Priest position | 1962 source determination |
|---|---|---|---|
| Collect and Oremus | `AO.SM.C0072` | `ALTAR_EPISTLE_MISSAL` | Collect at Epistle-side Missal, not Gospel side |
| Offertory antiphon | `AO.SM.C0109` | `ALTAR_CENTER` | Offertory antiphon read at altar centre, not Epistle side |
| Preparation of chalice | `AO.SM.C0113` | `ALTAR_EPISTLE_MISSAL` | Chalice prepared toward Epistle side, before returning to centre |
| Offering the chalice | `AO.SM.C0114` | `ALTAR_CENTER` | Offers chalice in front of middle of altar |
| Lavabo | `AO.SM.C0125` | `ALTAR_EPISTLE_SIDE` | Priest at Epistle side, servant assists with water |
| Suscipe sancta Trinitas | `AO.SM.C0128` | `ALTAR_CENTER` | Returns to middle of altar after Lavabo |
| Secret | `AO.SM.C0134` | `ALTAR_CENTER` | Standing in middle, facing the missal |
| Preface | `AO.SM.C0144` | `ALTAR_CENTER` | Preface proclaimed at centre, not at Gospel side |
| Postcommunion | `AO.SM.C0253` | `ALTAR_EPISTLE_MISSAL` | Moves to Missal for Postcommunion after public greeting |
| Communion antiphon — priest | `AO.SM.C0249` | `ALTAR_EPISTLE_MISSAL` | Only after independent MC-END-010 priest event; never from a swipe |

The 1962 Ritus servandus distinguishes:
- Collect / Oration: **Epistle-side Missal** (V.1).
- Offertory antiphon: **altar centre** (VII.1).
- Chalice preparation and Lavabo: **Epistle side** (VII.4, VII.6), while Host/chalice offerings occur at the **centre** (VII.2, VII.5).
- Secret / Preface: **priest at the altar centre**, facing the book (VII.7–8); the **Missal remains on the Gospel side** until after the ablutions (VI.1, XI.1).
- Communion antiphon after purification: the **Missal returns to Epistle side** and the priest is there to read it (XI.1); `AO.SM.C0249` / `MC-END-010` is the **independent priest event** that must be observed. Do not drive it from the subsequent schola or user swipe.
- Postcommunion: priest returns from centre greeting to the **Epistle-side Missal** (XI.1).

Source: https://1962ordo.today/1962-rubrics/ (Ritus servandus II, V, VI, VII, XI). This is backed by the repository's certified source blueprint for original station cue IDs.

## Integration requirements

1. Keep all 49 position source rows unchanged.
2. Resolve the additional 1962-source omission in the **independently observed** Communion-antiphon return at `C0249`, not as an automatic C0250 turn.
3. Map altar-centre icon to **priest centre**, even when the Missal is at Gospel side; optionally show Missal location as context, never substitute the Gospel-side priest silhouette as if he had moved.
4. Respect temporary route transitions and resume the correct source-observed station; never leave `ROUTE_CONTROLLED` or `PRIEST_TRACK_ASYNC` as if they were places.
5. Apply the Missa Cantata/Solemn/Low/Requiem branches to **actor** and **priest station** before choosing a reviewed original image.
6. Run `node tests/mass-priest-position-continuity.mjs` and full reader regressions before integrating the projection into `reader-icons.js`.

**Validation pending:** No in-repo test runner or browser visual suite was executed in this mapping-only pass. The 280 source text cues should also be reconciled with any earlier runtime assertion of 279 cue IDs rather than normalizing away a cue.
