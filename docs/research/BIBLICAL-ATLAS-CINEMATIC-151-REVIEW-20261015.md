# Biblical Atlas — current-main cinematic UX review
**Source prototype:** PR #1010, original single-file 48-event review and 181-scene extension.
**Integration:** PR #342 follow-on. **Published owner:** `src/find/bible-atlas.js` + `src/find/browser-entry.js`, preserving the actual 151 canonical milestones and its MapLibre/Scripture integration.

Review-only entry: `/index.html?atlasCinema=1`, then Explore → Biblical Atlas. Default app remains unchanged until visual and handset approval.

## Transplanted interaction principles

- **One timeline, 151 source-backed milestones.** Eleven chronological era shortcuts point into that timeline; no secondary timeline, copied 48/181 scene corpus, invented year or itinerary.
- **Map-first entry.** No compulsory opening chapter plate. Later era transitions display a brief bilingual, dismissible typography-only chapter scene, without any unreviewed painting. Respect reduced motion.
- **Free pan vs Follow.** Actual MapLibre `dragstart` suspends automatic camera ease-to; scrubbing still updates source-qualified pins and the event detail. Follow restores selected-stop framing. A map that cannot load remains optional and the Scripture/chronology reading route survives.
- **Compact event sheet.** Closed initially in review mode. Expand to reveal the existing original scene summary, geographic qualification, evidence links and **real** Douay–Rheims/Crampon Scripture handoff; close returns to the exact Atlas milestone.
- Native horizontal touch scrolling, keyboard-accessible 44px chapter and sheet controls, French/English derived from the existing era titles and scene corpus.

## Deliberately deferred
- No speculative mapped journey/road segments, inferred Abraham/Exodus itinerary or arbitrary pin coordinates. The prototype's schematic dashed lines need separate source/visual treatment before real-map adoption.
- No remote prototype artwork or newly approved rights claims; Sacred Art retains ownership.
- No substitute Bible synopsis and no copied offline SVG basemap; retain current bounded-world MapLibre.
- #1069 remains a distinct genealogy/theatre research preview with its five editorial holds. #1010 remains a design donor until explicit visual acceptance.

**CI gates:** source/151 chronology, R53 architecture, real Chromium mobile at 320/390/768, canonical 151 phone, app convergence, full visual acceptance, and required main gate. Map drag on CI is asserted when the remote MapLibre canvas is genuinely available; absence of CDN proves nothing about pan acceptance, so a real-device check remains essential. This is a review feature, not artistic or historical certification.
