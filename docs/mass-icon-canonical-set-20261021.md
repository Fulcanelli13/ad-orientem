# Mass icons: canonical set and lane model (21 October 2026)

Source of truth: `data/presentation/mass-icon-canonical-set-20261021.v1.json`.
Runtime: `src/mass/reader-canonical-icons.js` (resolver) and `src/mass/reader-canonical-icon-set.js` (generated; run `node tools/mass/build-canonical-icon-module.mjs` after editing the JSON).
Review page used for the picks: https://claude.ai/artifact/Rps1E97xC5HwAjZpEmGMRF

## Lanes

| Lane | Shows | Never shows |
|---|---|---|
| Faithful posture | stand, sit, kneel | |
| Faithful gesture | sign of the cross, Gospel crosses, bows, breast strike, genuflection, Look (Elevations, Ecce Agnus Dei), Listen | |
| Priest position | where the priest stands and which way he faces: foot, ascending, centre, Epistle side, Gospel side, facing the people, sedilia, pulpit, rail | what his hands do |
| Priest action | what his hands, body or the sacred vessels do: orans, greeting, reads at the Missal, genuflects, bows, kisses the altar, crosses, offertory, elevations, fraction, commingling, Communion, ablutions, incense | where he stands; movements |
| Priest voice | chant (sung forms only), aloud, low voice, silent | Schola or server sound |

Example: Collect = Epistle side + hands extended + chant/aloud. Preface = centre (Missal on the Gospel side of the centre) + hands extended + chant/aloud.

Movements (ascends, turns to the people / Missal / altar, goes to a side) change the position lane only.

## How each form resolves

* **Low Mass**: per-cue table `lowActionByCue` (275 cues, classified against the Latin of each cue), station and voice from the Low form state.
* **Missa cantata / Solemn**: action labels from `reader-priest-actions.v1.json`, the gesture matrix and Solemn R04 overrides through `actionLabelMap`; `actionCueOverrides` where the cue decides (greeting, orans at Oremus, Lavabo vs the two ablutions).
* **Missal, Simple and LIVE** use the same resolver. Curated LIVE keeps priest voice event-scoped.

## Coverage (cues with an icon / cues with that source state)

| Lane | Low | Cantata | Cantata + incense | Solemn |
|---|---|---|---|---|
| Faithful posture | 259/259 | 279/279 | 279/279 | 279/279 |
| Faithful gesture | 29/29 | 47/49 | 47/49 | 47/49 |
| Priest position | 259/259 | 275/279 | 273/279 | 266/279 |
| Priest action | 89/259 | 48/71 | 53/77 | 59/92 |
| Priest voice | 209/259 | 252/279 | 252/279 | 240/279 |

Before this change Low Mass showed no priest action icon at all (0/259).

## Text only until art exists

Priest: breast strike, head bow, moderate bow, hands joined, hands over the oblations, Consecration (bowed over Host/Chalice), final blessing, Gospel crosses on the book, kissing the Gospel book, minor elevation, Ecce Agnus Dei.

## Corrections made

* C0247 *Quod ore sumpsimus* is the first ablution (chalice); C0248 *Corpus tuum* is the ablution of the fingers. The 20 Oct crosswalk had them reversed.
* Server and Schola sung cues (C0054, C0074, C0076, C0087, C0090, C0255) never show priest Chant.
* Donor PNG wrappers are unwrapped by file, not key name, so canonical aliases render as silhouettes.
* *Oramus te* is *inclinatus* (moderate), not the profound-bow picture.

## Open questions for review

1. Sung forms have 77 priest action events against 275 in Low Mass. Should Cantata/Solemn take the celebrant's manual actions from the Low table where the sung sources are silent (excluding incense, sedilia, chant and minister-owned moments)?
2. C0225-C0227 (prayers before Communion): the sung registry says PROFOUND BOW, the Low source says bows over the altar. The Ritus says *inclinatus*. Confirm before changing the sung registry.
3. Schola silent / at rest is approved but no source state produces it yet.
4. Special-rite readers (Ash Wednesday, Candlemas, Palm Sunday, Good Friday, Easter Vigil, Requiem absolution, nuptial Mass, processions) have no posture or gesture events yet; their icons are in the set but unbound.
