# P2 — The Mass icon necessity standard

**Authority:** 19 October 2026 icon review and the instruction that accurate essential icons should be created when missing, while most minor gestures can remain within the existing rubrics.

**Policy data:** `data/presentation/mass-icon-necessity-policy-20261019.v1.json`  
**Coverage audit:** `src/mass/reader-icon-necessity-audit.js`  
**Regression:** `tests/mass-icon-necessity-policy.mjs` (included in `npm run test:mass-icon-review`)

## Classification of the existing canonical inventory

| Scope | Essential | Selective | Rubric-only | Total |
|---|---:|---:|---:|---:|
| Priest action labels (distinct) | 6 | 7 | 22 | 35 |
| Priest action cue records | 6 | 16 | 55 | 77 |
| Priest station names (distinct) | 6 | 2 | 2 | 10 |
| Priest station cue records | 43 | 2 | 4 | 49 |

All four faithful posture states (stand, sit, kneel, genuflect) are essential. The faithful's Gospel triple-cross gesture deserves its own exact visual; ordinary head bows can remain text-only.

**This proposal classifies icon necessity only. It is deliberately not yet used to suppress existing LIVE action icons.** The resolver still enforces previously reviewed reject/repurpose decisions from P0 and P1. Applying additional visual reductions requires a separate presentation change and phone regression, never changes to source-owned Mass cues.

## What does not merit new artwork

Routine bows, altar kisses, paten crosses, most priest genuflections, turns already conveyed by the station, Fraction and particle commingling: all remain in the Mass rubrics. The earlier 17 priest gestures without approved imagery must **not** be interpreted as 17 images to generate.

Where posture, voice or an altar-side station is already visible, do not repeat the same information as a separate action icon. Non-observed priest station tracks must never receive a guessed pictogram.

## First true generation brief: celebrant's own Communion (two images)

1. **Priest receives the Sacred Host:** Roman priest at the altar, in 1962 ceremonial vestments, clearly consuming the consecrated Host; not holding the Host aloft, not giving Communion to a communicant, no lay figure at a rail.
2. **Priest receives from the chalice:** the same celebrant, posture, vestments and viewpoint, drinking the Precious Blood from the chalice at the altar; not elevating it, not pouring wine, no altar server administering it.

They should belong to a **single matched art family**, ideally one priest/avatar silhouette viewed from a consistent three-quarter or lateral angle. Strong recognizability at 32–48 px, restrained black/white sacred visual language, crisp silhouette, no decorative frame, no text, no modern free-standing altar.

For review, first produce candidate artwork, then extract/correct clean and scalable SVG silhouettes for `currentColor`. Generated raster imagery is **never** the frozen Mass icon master and must not be assigned to the runtime before user acceptance.

## Verify existing before generating

- **Foot of altar:** current art was marked `repurpose` without a destination.
- **Altar centre:** same: no approved reassignment.
- ***Ecce Agnus Dei*:** showing the Sacred Host to the people differs from raising it during Consecration; verify donor first.
- **Gospel triple crosses:** the approved `cross` and `gospel_crosses` source files are identical, so their semantics are not yet visually distinct.

These are *review candidates*, not an instruction to generate everything immediately.

## Acceptance gates

- Preserve actor: priest vs faithful vs deacon/subdeacon/server/thurifer.
- Preserve timing/source ownership: never infer action from image or scroll progress.
- Do not add a visual if the rubric already communicates the action and the icon provides no new information.
- Require exact image provenance, purpose, approved subject and mobile legibility before wiring new art.
- Test native LIVE, Simple, bilingual Missal, Low/Sung/Solemn, Requiem and special rites for absent illustration without absent source text.
