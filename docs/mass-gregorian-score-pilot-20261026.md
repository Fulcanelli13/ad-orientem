# Gregorian chant score pilot — native Mass reader
Date: 2026-10-26. Status: **experimental / draft only**.

## Purpose
Breviarium Gregorianum is a design and usability reference, not a content
authority or a new Office module for Ad Orientem. The native Schola controller
remains the sole Mass Schola state owner.

Existing actual registry:
- `src/mass/reader-schola.js`: ten track IDs, source-owned `AO.SM.*` cues,
  independent progression, explicit delayed Benedictus release, Low Mass absence.
- `src/mass/reader-native-preview.js`: selected source-owned cards and
  Consecration silence; card navigation cannot certify that singing occurred.
- `src/mass/reader-dom.js`: Schola dock, optional translation and manual controls.

## Pilot implementation
- `src/mass/reader-chant-score-pilot.js`: a small, removable sidecar. On a
  KYRIE Schola track the user may explicitly open the **Kyrie XVI example**.
  The button stays hidden for other tracks.
- The example uses the source page's SVG, not an invented reconstruction:
  https://gregobase.selapa.net/chant.php?id=545
- The **GABC** is retained exactly as retrieved from
  https://gregobase.selapa.net/download.php?elem=1&format=gabc&id=545
  (GregoBase transcription CC0, by Andrew Hinkley; Graduale Romanum 1961,
  p. 54*, Liber Usualis 1961, p. 59).
- The source SVG requires network access. An error state and source links
  are available. The GABC in the module can later be sent to Exsurge for
  locally bundled SVG rendering. The current pilot does **not** load a remote
  JavaScript engine, offer synthetic singing or claim offline score support.
- The dialog is independently closable, returns focus, and cannot advance
  Schola state or change Mass selection.
- Source and example are separate: the selected Kyriale for a Mass remains
  UNKNOWN, even when someone opens the example.

## Release gate before any production rollout
1. Confirm which chant setting was **actually selected** in pre-Mass
   preferences; never infer from the date or an identical text string.
2. Introduce explicit per-celebration Proper melody IDs, Kyriale variant IDs,
   source edition, GABC checksum and licence record, and keep polyphonic
   performances separately named. Never auto-pick Kyrie XVI.
3. Bundle and validate a maintained Exsurge renderer and required permitted
   font assets locally for offline support; do not rely on a CDN in the final
   Android application. Evaluate `bbloomf/exsurge` and
   `@vagdur/exsurge` API / licensing and choose one pinned version.
4. Compare SVG vs the scanned 1962-use source, verify every pitch, clef,
   glyph, psalm tone, repeated incipit and lyric alignment; retain source PDFs
   only as references with separately checked rights.
5. Run `node tests/reader-chant-score-pilot.mjs`, Schola tests,
   existing Mass reader integration/phone/e2e tests and a manual phone
   visual acceptance pass. This draft test only verifies source/model guards,
   not the actual remote SVG availability or musical accuracy.
6. Do not add a Divine Office reader or replace existing Mass cards.
