# Gregorian score in native Mass Schola — draft integration
Updated 26 October 2026. **Draft only; not merged.**

## Source of truth
This change extends existing `reader-schola.js` and the ordinary production Schola
dock. It does not establish an Office module, a second Mass calendar, a new
liturgical event engine or a replacement reader/card count.

Existing canonical ownership:
- Mass Calendar and the resolved Proper determine **liturgical text**.
- `reader-schola.js` owns the Schola's ten musical **opportunities** and its
  independent phrase controls. It cannot know what the choir actually sings.
- `reader-native-preview.js` retains the independently observed restriction
  during the Consecration and the explicit post-Chalice Benedictus release.
- `reader-dom.js` owns the presentation and the resizable Schola dock.

## Implemented pilot
`src/mass/reader-chant-score-pilot.js` adds the button **GREGORIAN SCORE**
to the current Schola dock only while the Schola KYRIE track is eligible.
It reveals one **continuous, scrollable, original Gregorian SVG score** in
the dock, with manual up/down movements and a FULL expanded view. On mobile
the reader reserves additional vertical space; it does not cover the prayer
by accident. Finger scroll and keyboard navigation are independent from
the priest's reader and the Schola's phrase clock.

Three 1961-Solesmes-sourced reference choices (NOT assigned automatically):
- Kyrie XVI — GregoBase **545** — Graduale Romanum (1961) p. 54*;
  Liber Usualis (1961) p. 59
- Kyrie XI — GregoBase **2982** — Graduale Romanum (1961) p. 38*;
  Liber Usualis (1961) p. 46
- Kyrie VIII — GregoBase **1184** — Graduale Romanum (1961) p. 28*;
  Liber Usualis (1961) p. 37

Source pages:
https://gregobase.selapa.net/chant.php?id=545
https://gregobase.selapa.net/chant.php?id=2982
https://gregobase.selapa.net/chant.php?id=1184

GregoBase explicitly releases its **transcriptions** under CC0:
https://gregobase.selapa.net/?page_id=2
The Kyrie XVI GABC is embedded unchanged (transcriber Andrew Hinkley,
proofread gdweber in 2022). All three original GABCs have now been embedded verbatim; source checksums,
local engraving and facsimile comparison remain future release gates.

## Non-features and necessary distinctions
- Selecting one of these three scores chooses a **reference example**, not
  the Mass's musical setting. `actualChoirMelody` remains `UNKNOWN`.
- Scroll position and manual ↑/↓ never infer an actual syllable, heard cue,
  elapsed musical bar, or Benedictus beginning.
- NO microphone, synthesized singing, playback or auto-scrolling.
- The external SVG requires internet. The GABC metadata remains inspectable
  in source and an explicit offline failure message is shown.
- Other chant tracks remain textual until their actual score choices have
  been verified, specifically SANCTUS_BENEDICTUS.
- The score is neither a 1962 rubrical directive nor an audio-recording source.

## Release gates
1. Verify score glyphs/staff clefs/episemata/repeats against original printed
   page images, and record checksum and exact preferred edition per variant.
2. Verify existing Gregorian chant source identity and options for Kyriale,
   seasonal Propers, and permitted local additions separately. Gregorian and
   polyphonic settings are distinct media, not interchangeable titles.
3. Bundle a pinned Exsurge renderer with verified font rights for **offline**
   responsive line wrapping, replacing the remotely served full SVG.
4. Build a pre-Mass selection model keyed by the canonical Mass choice; do not
   attach free-form setting choices to liturgical text until admissibility
   and source ownership are proven. Remember customary user preferences
   separately from a verified local programme.
5. Build a **separate listening experience** inside Mass preparation, only
   after recording provenance/permissions and score-to-recording sync are
   verified. Audio must never leak into Mass-following mode.
6. Keep Sanctus/Benedictus as separate *performance timing* decisions.
   The existing explicit post-Chalice release must remain authoritative.
7. Run Schola contracts, regression suite, mobile/desktop browser snapshots,
   offline failure tests and actual liturgical expert score review before
   promoting this draft.

The new contract is included in existing `npm run test:reader-schola`. CI
passing tests do not certify pitch correctness, mobile visual parity or
network/offline resilience.
