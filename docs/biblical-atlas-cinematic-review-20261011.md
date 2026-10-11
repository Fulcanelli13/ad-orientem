# Biblical Atlas — cinematic map-first review prototype
**Date:** 11 October 2026  
**Review-only source:** `reviews/biblical-atlas-cinematic-prototype-20261011.html`

## Scope and separation
This is one standalone HTML file with inline CSS and JavaScript and embedded vector geography. It contains **48 episode-specific bilingual milestones** covering three representative journeys:
- Abraham: 12 scenes (Genesis 12–23)
- Christ: 21 scenes (Luke, Matthew, Mark, John, and Acts 1)
- St Paul: 15 scenes (Acts 9–28)

The **production Atlas remains PR #998**, with **151 milestones** and 35 qualified geographic anchors. This review prototype **does not supersede that corpus, move source ownership, or alter production code**. It is the interaction and art-direction gate before porting changes into the production component.

## What to test
1. **Map first**: the map, timeline and compact event summary should appear on entry. There is no compulsory opening splash.
2. **One chronology**: the horizontal milestone rail is continuous from Abraham through Christ to Paul. Its three slim journey bands are direct shortcuts into the same rail rather than separate isolated timelines.
3. **Spatial continuity**: selecting a milestone reframes an SVG map and reveals a cumulative, dashed, explicitly **schematic** path, fading earlier points. Coastlines rather than anachronistic modern borders are shown. These are illustrative connections, not verified ancient roads.
4. **Geographic qualification**: verified ancient-city *context points* use solid markers; traditional locations and large/uncertain regions use dashed rings and a qualification in the detail. An event is never asserted to have happened at an exact pixel merely because its city is known.
5. **Cinematography**: entering an era triggers a temporary, dismissible chapter plate; the initial screen remains map first. Frequent small scrubs avoid repeated cinematic interruptions. `prefers-reduced-motion` is honoured.
6. **Reader continuity**: tapping Read opens an inline, reversible context surface and returns to the exact milestone. **The complete Bible text is intentionally not bundled** in the standalone prototype; production must route the exact reference to Ad Orientem's existing full Douay–Rheims/Crampon reader and commentary, rather than presenting this synopsis as Scripture.
7. **On mobile**: the detail is a collapsible bottom sheet, the map remains pannable, the Follow control re-enables camera following, and the timeline uses native horizontal scrolling. English/French switches in place.

## Artwork, provenance and offline fallback
Chapter transitions optionally load public-domain artworks from source repositories. Their source/artist credits are visible and clickable in the plate. Core geography, routes, milestones and all UI interactions work offline; paintings require a network connection in this single-file review.

- **Pieter Lastman**, *Abraham on the Road to Canaan* (1614): [Wikimedia Commons, Public Domain](https://commons.wikimedia.org/wiki/File:Lastman,_Pieter_-_Abraham%27s_Journey_to_Canaan_-_1614.jpg).
- **Gerard David**, *Archangel Gabriel; The Virgin Annunciate* (c. 1510): [The Metropolitan Museum of Art, Public Domain/Open Access](https://www.metmuseum.org/art/collection/search/459062).
- **Gerard David**, *Christ on the Cross* (c. 1515): [Wikimedia Commons, Public Domain](https://commons.wikimedia.org/wiki/File:David_Crucifixion_1515_berlin.jpg).
- **Piero della Francesca**, *The Resurrection* (c. 1463–65): [Wikimedia Commons, Public Domain](https://commons.wikimedia.org/wiki/File:Resurrection_(Piero_della_Francesca).jpeg).
- **Caravaggio**, *The Conversion on the Way to Damascus* (c. 1600–01): [Wikimedia Commons, Public Domain](https://commons.wikimedia.org/wiki/File:Michelangelo_Caravaggio_036.jpg).

The existing independent sacred-art pipeline retains final rights and crop sign-off for shipping assets. Review images are **not** automatic approvals for production.

## Editorial reservations
- The three sample journeys are **illustrative narrative selections**, not an exhaustive 73-book Bible history, definitive biblical chronology or complete Gospel harmony.
- Published source references are visible for each event. Dates and exact routes are deliberately not invented. Many historical settlement or traditional-position map anchors require provenance reconciliation against the existing Sacred Geography registry before porting.
- A regional focus (e.g. Cana, the Jordan baptism, Moriah, the shipwreck) is not evidence for that specific coordinate.
- The endpoint for the in-app reader must be the canonical Scripture module; no outbound Bible website or generic article page should replace it.

## Promotion gates
Before translating the prototype to the active Atlas: (1) approve the phone visual hierarchy; (2) validate swipe and camera-follow ergonomics on a physical device; (3) confirm chronological editorial ordering with Bible research; (4) reconcile coordinates and links against canonical geography; (5) confirm art licensing, attribution and crop; (6) integrate app-wide colour and icon tokens; (7) preserve the larger 151+ source event corpus and the existing reader runtime; and (8) run the existing Explore, MapLibre, R53 phone, Scripture and wider app regression suites.

## Automated smoke checks
`node tests/biblical-atlas-cinematic-prototype.mjs` covers screen widths 320/390/768, timeline continuity and event count, navigation between story bands, chapter transitions, French, reader roundtrip, free map pan/follow and page overflow. A passing smoke test does not replace artistic review or historical/source certification.
