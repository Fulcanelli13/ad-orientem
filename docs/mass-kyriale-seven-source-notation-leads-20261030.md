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

The link opens the original GregoBase research page for the transcription.
This is **not** bundled offline notation. The full GABC + Exsurge viewer
remains in draft PR #1749 and must be separately integrated after source,
licence and printed-facsimile musical verification.

Safety: absent/custom/mismatched choices show no link. Free-text “Mass VIII”
does not imply the indexed melody. Do not auto-select Gregorian scores by date,
Parish, institute, or priest card; do not claim that any choir sang the piece.
No audio, downloads, notation approvals, Mass text, rubrics, card count, or clock
behavior is changed. Preserve the two independent Gregorian/polyphonic
Sanctus–Benedictus policies and local site/choir uncertainty.

Release: require full automated tests; at 320/390 px exercise real Music Plan
profile switching and source references. Keep this as research-preview UI
until scores pass musical approval and the offline viewer is integrated.
