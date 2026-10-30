# Kyriale — seven research notation leads (30 October 2026)

Scope: existing LIVE Schola MUSIC PLAN, no second Kyriale or Schola controller.

The source-indexed Kyriale catalogue in `src/mass/reader-kyriale-catalogue.js`
continues to own Mass I–XVIII / Credo I–VI identity and personal selections.
This change only exposes seven independently selected, source-linked research
notation leads from draft score pilot PR #1749:

| Movement | Explicit selection | GregoBase ID | 1961 printed page |
| --- | --- | ---: | --- |
| Kyrie | Mass XVI | 545 | 54* |
| Kyrie | Mass XI | 2982 | 38* |
| Kyrie | Mass VIII | 1184 | 28* |
| Gloria | Mass VIII | 961 | 29* |
| Credo | Credo III | 749 | 64* |
| Sanctus/Benedictus | Mass VIII | 1384 | 30* |
| Agnus Dei | Mass VIII | 2760 | 31* |

The existing source link opens GregoBase as before. In addition, explicit
indexed choices expose **Read score offline**, opening a responsive in-app SVG
viewer built from the *same seven original, unmodified GABCs* and the pinned
MIT-licensed local Exsurge renderer ported from draft PR #1749. The offline
service worker snapshot includes the local Exsurge asset. No network dependency
or audio is required for engraving after the completed snapshot.

This is **research notation**, not seven editorially approved scores. The
wider 1,195-GABC archive, ten Proper score references, complete future
facsimile approval, and full score-release gate remain in draft PR #1749.
None of those scores or source rights is auto-promoted by this feature.

Safety: absent/custom/mismatched choices show no link. Free-text “Mass VIII”
does not imply the indexed melody. Do not auto-select Gregorian scores by date,
Parish, institute, or priest card; do not claim that any choir sang the piece.
No audio, downloads, notation approvals, Mass text, rubrics, card count, or clock
behavior is changed. Preserve the two independent Gregorian/polyphonic
Sanctus–Benedictus policies and local site/choir uncertainty.

Release: require full automated tests; at 320/390 px exercise real Music Plan
profile switching and source references. Keep this as research-preview UI
until scores pass musical approval and the offline viewer is integrated.

## Implementation and validation

- Research score index: `src/mass/reader-kyriale-catalogue.js`.
- Seven exact GABCs: `src/mass/reader-kyriale-research-gabc.js` and the
  original `src/mass/reader-ordinary-scores-1961.js`.
- Renderer: `src/mass/reader-chant-engraver.js` + pinned
  `assets/vendor/exsurge/exsurge.min.js` + its MIT LICENSE.
- Viewer: `src/mass/reader-kyriale-notation-viewer.js`, opened by the
  existing Music Plan's `reader-dom.js`.
- SW: snapshot Exsurge as a required first-use offline asset.
- Deterministic tests: real Exsurge GABC parsing and SVG engraving at
  narrow widths, seven exact source mappings, rejection of custom/unknown
  sources, lifecycle and no audio.
- Existing Schola real-phone test now opens and closes Kyrie VIII score at
  320 px and 390 px, verifies the SVG and screen bounds, and confirms
  no priest-card movement. Do not weaken test assertions to release.

The existing #2051 Schola session-observation changes are deliberately
not duplicated or merged into this branch. Resolve its unrelated H4 Home
acceptance-test conflict separately before merging #2051.
