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
It renders a **continuous, scrollable Gregorian SVG score from local GABC** in
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

## Pre-Mass musical programme — first working handoff

The **existing** unified Mass preparation Folio now contains an optional
`Chants of this Mass` disclosure in its reader step (sung/solemn calendar or
votive Masses only). Requiem, Nuptial and distinct rites are excluded until
specific musical mappings are validated.
It offers **Unknown** by default and the three verified transcribed Kyrie
examples. All other musical opportunities remain unresolved, including
the Proper, Sanctus/Benedictus and Communion; no generic settings are applied
to them merely because the Mass date is known.

`src/mass/mass-chant-programme.js` builds a single identity for the session
(date, actual celebration, host Proper source and selected form). The user's
musical choice is discarded on changes to the identity, including switching
to Low Mass; these choices never mutate the source Proper or 1962 Calendar.
No parish-specific preference is silently stored or generalized to future
Masses. All IDs are validated against locally bundled GABC records.

The existing `createBrowserMassController` handoff includes the optional
programme in `readerPreferences` (and therefore the existing resumable
session record). The native Schola dock initializes its notation selector from
that programme, retaining the label **user-reported, not independently
verified**. The reader remains silent and uses no artificial Schola timing.

Contract tests: `tests/mass-chant-programme.mjs`, invoked from the
existing `test:reader-schola` chain. The 390px unified preflight acceptance
also exercises selection, reader-mode independence, Low Mass removal and
date reset.

## Non-features and necessary distinctions
- Selecting one of these three scores chooses a **reference example**, not
  the Mass's musical setting. `actualChoirMelody` remains `UNKNOWN`.
- Scroll position and manual ↑/↓ never infer an actual syllable, heard cue,
  elapsed musical bar, or Benedictus beginning.
- NO microphone, synthesized singing, playback or auto-scrolling.
- **The SVG is now engraved locally:** `assets/vendor/exsurge/exsurge.min.js`
  is a pinned MIT-licensed build of Benjamin Bloomfield’s Exsurge fork at
  upstream commit `6322cce596b86f9b3d354e7ff3bdcbfe2f3f6ab8` (26 October
  2026). It runs without network access. Its full licence is checked into
  `assets/vendor/exsurge/LICENSE`. The three GABCs remain embedded and source-
  attributed. GregoBase is only an optional outbound source-reference link.
- Exsurge lays out staff systems for the actual viewport width; resizing
  reflows the engraving. The app still needs **physical-device visual and
  facsimile accuracy acceptance** before this can be called production-ready.
- `reader-chant-engraver.js` loads the local bundle on first use and drops
  stale asynchronous renders when the user changes the selected sample.
- Exsurge’s optional Exsurge Characters font is not bundled; specific special
  characters requiring it must be reviewed. No font asset is redistributed.
- Other chant tracks remain textual until their actual score choices have
  been verified, specifically SANCTUS_BENEDICTUS.
- The score is neither a 1962 rubrical directive nor an audio-recording source.

## Release gates
1. Verify score glyphs/staff clefs/episemata/repeats against original printed
   page images, and record checksum and exact preferred edition per variant.
2. Verify existing Gregorian chant source identity and options for Kyriale,
   seasonal Propers, and permitted local additions separately. Gregorian and
   polyphonic settings are distinct media, not interchangeable titles.
3. **Implemented for the pilot:** pinned Exsurge JS; offline GABC-to-SVG;
   adaptive width, stale-render protection and independent inline/full views.
   Remaining: optional special-character font treatment and verified raster/
   vector line wrapping on real phone sizes.
4. **Implemented for pilot Kyrie:** pre-Mass user-reported selection tied
   to the canonical Mass identity and reader session, without assigning the
   liturgical Proper. Remaining: real 1962 musical eligibility, wider
   Kyriale/Proper catalogues, scoped remembered local settings, and verified
   parish programmes before adding further selectable tracks.
5. Build a **separate listening experience** inside Mass preparation, only
   after recording provenance/permissions and score-to-recording sync are
   verified. Audio must never leak into Mass-following mode.
6. Keep Sanctus/Benedictus as separate *performance timing* decisions.
   The existing explicit post-Chalice release must remain authoritative.
7. Run Schola contracts, regression suite, mobile/desktop browser snapshots,
   offline failure tests and actual liturgical expert score review before
   promoting this draft. A mock-renderer test plus vendored API test now ships
   as `tests/reader-chant-engraver.mjs`; it is not an end-to-end music audit.

The new contract is included in existing `npm run test:reader-schola`. CI
passing tests do not certify pitch correctness, mobile visual parity or
network/offline resilience.
