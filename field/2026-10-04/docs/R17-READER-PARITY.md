# R17 Reader Parity Gate

Date: 2026-10-03

This landing is deliberately reversible. The production default remains the existing GitHub Mass reader.

## Donor / contract basis

Reader parity is checked against:

1. `Ad_Orientem_04Oct2026_Sung_Mass_DEFINITIVE_PROTO_v1.65_MOBILE_NATIVE_V48.html`
2. `data/presentation/reader-contract.v1.json`
3. the R17 canonical/session engine already landed in this branch

The v1.65 donor provides the proven mobile-native surface geometry and state surfaces. R17 owns canonical Mass/session state. The legacy GitHub reader remains the rollback DOM until parity is proven.

## Feature gate

Query string overrides storage.

- default: `LEGACY`
- `?aoR17Reader=shadow` — legacy reader remains visible; R17 audits required reader surfaces without DOM mutation
- `?aoR17Reader=preview` — legacy reader still runs underneath; a new R17 shell is mounted over it and mirrors the current legacy content/state
- `?aoR17Reader=r17` is currently an alias for `PREVIEW`, not a production switch

Storage key for controlled testing: `ao-r17-reader-ui`.

There is intentionally no code path in this wave that deletes the legacy reader or makes the preview the default.

## Required parity surfaces

### Modes
- MISSAL
- SIMPLE
- LIVE

### Reader + navigation
- reader surface
- previous / next
- card counter

### State ribbon
- priest position
- current section / Guide copy
- priest action

### Faithful rail
- persistent posture
- transient gesture
- response cue

### Audio / Schola
- priest voice
- Schola live surface
- Schola text
- Schola translation
- bell cue remains optional as a separate visual surface

### Cinematic / Guide
- part transition cinematic
- Guide next/current-rubric state

## Ownership rules

- R17 canonical/session engine must never be mutated by the reader.
- Posture is persistent until a sourced transition.
- Gesture is transient at its exact anchor.
- Incarnatus is a transient genuflection, never persistent kneeling.
- MISSAL / SIMPLE / LIVE are presentation modes, never Mass forms.
- Schola is continuous when active except when the public text is identical to the reader text.
- Missing Guide rubric data fails closed; the reader does not invent rubric prose.
- v4.8 icon semantics remain `currentColor`/mask compatible.

## This wave

Added:

- `src/mass/reader-gate.js`
- `src/mass/reader-parity.js`
- `src/mass/reader-shadow.js`
- `src/mass/reader-preview.js`

The preview is intentionally a **mirror shell**. It reuses the legacy reader only as a temporary content/state donor while the new shell geometry is tested. Closing the preview immediately reveals the untouched legacy reader underneath.

The next reader wave replaces individual mirrored state channels with R17-native projections one by one. The legacy reader is removed only after all required parity channels are independently sourced and tested.
