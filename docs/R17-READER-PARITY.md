# R17 Reader Parity and Release Contract

Date: 2026-10-04

R17 has completed technical reader certification. The production default remains **LEGACY** until an explicit promotion decision changes the feature gate.

## Current authority

The release architecture is source-first rather than a byte-for-byte recreation of the historical v1.83 card enumeration.

Authoritative runtime contracts:

1. `data/presentation/reader-release-gate.v1.json`
2. `src/mass/reader-live-source.js`
3. `data/presentation/reader-canon-source-map.v1.json`
4. the canonical/session engine and form-specific reader controllers in `src/mass/**`

Current LIVE structure:

- 39 source-first LIVE steps
- 25 retained non-Canon macro steps
- 14 source-backed Canon prayer units covering `AO.SM.B047`–`AO.SM.B060`
- SIMPLE and MISSAL remain 30-card projections

The historical v1.83 48-card reader remains valuable compatibility evidence, but it is **not release authority** and is not required to certify the source-first runtime.

## Historical donor role

The v1.65 mobile-native donor remains evidence for geometry and surface behavior. The v1.83 recovery files remain evidence for historical reader behavior, including:

- Host elevation gate: `AO.SM.C0173 → AO.SM.C0174`
- Chalice elevation gate: `AO.SM.C0180 → AO.SM.C0181`
- transient state clearing across card changes
- Gradual ownership: `B021` main reader, `B022` Schola, `B023` Munda cor meum

No historical donor may silently override certified source-first block/cue/event ownership.

## Certified surfaces

R17 certifies:

- MISSAL, SIMPLE and LIVE as pre-Mass presentation selections
- source-first LIVE navigation
- phone/touch focus behavior
- persistent posture and priest position ownership
- exact transient gesture/response ownership
- native Schola ownership for Missa Cantata
- recovered 32-entry Guide continuity
- host icon-bank bridge with fail-closed missing assets
- native bell/cinematic ownership
- LOW, Missa Cantata and SOLEMN form-state parity
- plan-aware special structures and full-year special-day projection
- Nuptial insertions
- Asperges / Vidi aquam, Palm Sunday, Ash Wednesday and Easter Vigil native structures
- Proper witness replacement and provenance guards
- form lifecycle and Leonine-prayer separation

## Mode switching

MISSAL / SIMPLE / LIVE are presentation modes, never Mass forms.

The initial mode is selected before Mass. In-reader mode switching remains intentionally locked to avoid structural churn during Mass. This is a field-use decision, not an unresolved release blocker.

## Feature gate

Production remains reversible:

- default: `LEGACY`
- shadow/preview paths remain available for controlled comparison
- R17 native reader is technically certified
- production promotion requires an explicit feature-gate decision

The legacy reader must not be removed merely because the technical certification gate is green.

## Historical 48-card recovery

`data/presentation/v1.83-reader-map-recovery.v1.json` is a historical audit ledger only.

One v1.81 Canon decompression boundary remains unrecovered. It must not be guessed. Recovering it later may improve historical fidelity or provenance, but it must not re-block or replace the certified source-first LIVE runtime without a separate architecture decision.
