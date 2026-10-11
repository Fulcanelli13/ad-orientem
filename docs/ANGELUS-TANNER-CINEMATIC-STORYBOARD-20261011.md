# Angelus — Tanner cinematic storyboard and asset-integration plan
**Decision (11 October 2026):** Henry Ossawa Tanner, *The Annunciation* (1898), selected as the **single master painting** for the ordinary Angelus. This supersedes the unselected multi-artist direction from the preliminary artwork board; it does **not** select a work for the Paschaltide Regina Cæli.

### Authentic artwork / rights evidence
- Philadelphia Museum of Art, *The Annunciation*, accession W1899-1-1: https://www.philamuseum.org/objects/104384 — confirms artist, year, accession and that Gabriel is rendered as a shaft of light.
- Wikimedia Commons, separately hosted Google Art Project digital reproduction: https://commons.wikimedia.org/wiki/File:Henry_Ossawa_Tanner,_American_(active_France)_-_The_Annunciation_-_Google_Art_Project.jpg — Commons describes it as a faithful photographic reproduction and marks it Public Domain. Prefer **this identified Commons reproduction** for any local derivative. Record its filename, URL, license mark and access date. Museum-site photography has its own educational-use note: do not conflate the two.
- Museum records may impose different download/use conditions; check the precise source before packaging, particularly if monetisation is planned.
- Source-of-truth declarative storyboard: `src/pray/angelus-tanner-storyboard.js`. Runtime progressive enhancement: `src/pray/angelus-cinematic.js`. The artwork has **not yet been packaged as a local offline asset**.

### The continuous composition
The painting's visual grammar has just three fixed physical anchors: **Gabriel as light on the left, Mary seated on the right, and their shared architectural interior**. Four stage compositions must preserve their relative positions. Camera travel is inside the actual canvas; never invent animation of Mary's fingers, eyes, mouth, clothing, or Gabriel as a human figure. This painting does not depict the dove or a Nativity; do not manufacture them.

| Stage | Canonical units (exactly) | Camera centre; scale | Transition | Light | Conclusion |
| --- | --- | --- | --- | --- | --- |
| I — Angelus Domini | Announcement ℣/℟; Ave Maria | (40%,46%), 1.10× | 1,250 ms reveal from left | glow 0.13 | End with Gabriel and Mary in a legible shared frame |
| II — Ecce ancilla | Fiat ℣/℟; Ave Maria | (73%,53%), 1.30× | 1,350 ms camera travel toward Mary | 0.05 | Stop on her hands and expression |
| III — Et Verbum | Incarnation ℣/℟; Ave Maria | (51%,48%), 1.11× | 1,450 ms back toward beam | 0.21 | Moment of luminosity; **canonical word-triggered posture still owns kneel/bow** |
| IV — Oremus | Ora pro nobis ℣/℟; *Gratiam tuam* collect | (72%,52%), 1.24× | 1,050 ms return toward Mary | 0.04 | Complete stillness; no extra Ave |

The numbers are **initial storyboard values**, not fixed artistic acceptance; eye-level, subject-safe and text-safe crops must be reviewed on phone screenshots.

### Interaction model, not an animation timeline
- User moves horizontally on the timeline, presses Previous/Next, or uses a deliberate horizontal swipe. Vertical prayer reading remains normal. Tapping a prayer still switches vernacular ↔ Latin through the existing canonical owner.
- Camera motion occurs **only on explicit stage changes**. When the transition finishes, every composition remains stationary as long as needed; never auto-advance or give a fixed amount of prayer time.
- The in-between sequence is not a blocking modal and must not obscure full prayer text during regular scrolling. When two stages use the same painting, retain one rendered image DOM element; adjust camera focus rather than crossfading duplicate pictures.
- Reduced-motion user receives static compositions and immediate stage changes. No sound, vibration, counters or performance-gamification.
- Localisation: all existing English/French prayer units and Latin faces are preserved. Individual/group ℣/℟, automatic Paschaltide substitution, Saturday-after-Vespers/ Sunday posture logic, Incarnation cue and optional historic conclusion remain in their existing modules. No duplicate prayer corpus.
- **Regina Cæli:** Paschaltide automatically loads its existing structure; a separate Resurrection art direction will be reviewed. Do not show Tanner's Annunciation in this different devotion by default.

### Integrating the actual artwork safely
1. Download the **identified Commons reproduction**, not an unspecified museum photo, and verify file provenance, pixel dimensions and faithful full-canvas colouring.
2. Make a single responsive **WebP** art master at `assets/pray/angelus/tanner-annunciation-1898.webp` (e.g. 1,280–1,920px on the long edge, quality tuned by inspection). Keep crop logic in CSS/metadata, not by saving four unrelated crops. Prefer <=400 KB for the client master if detail remains adequate. Preserve a non-web optimization/source note outside shipped bundle.
3. When this local file is present, register all four chapter keys against **that same path** in `window.AO_ANGELUS_ARTWORK_V1.angelus`, each with `alt`, `credit` and official object link. Registry must not set `regina` entries to Tanner. Lazy-load one scene/image and predecode it on module entry, not four separate copies.
4. Ship the source/attribution metadata beside the derivative in a JSON ledger. No automatic third-party fetch at prayer time: **offline-first**.
5. Enable it only after image load/error fallback testing. The creative direction is selected now, but the feature branch deliberately falls back to atmospheric background until the rights-safe image file has been committed.
6. Preload based on a user's first entry, not at cold Home. Provide image error fallback to dark atmosphere and fully usable prayer.

### Phone and quality gates before release
- 320, 360, 390, 430 px: Gabriel and Mary's head must not be clipped in stages I/III; Mary's face/hands retain attention in II/IV. Contrast must permit long Collect reading without text-over-image interference.
- 760px tablet/desktop: no excessively cropped picture; portrait-ish artwork should be appropriately letterboxed or framed rather than forcibly filling an ultrawide hero.
- Both languages, all four stages: canonical unit count and order remain unchanged; keyboard reachable stage milestones have `aria-current`; previous and next disable at boundaries.
- On stage III *Et Verbum caro factum est*, visible posture/gesture exactness unaffected; returning to II clears gesture; the current ribbon state remains profile-aware.
- Flipping an existing text face must not advance stage. Manual vertical scroll must not change stage unexpectedly. Back returns to the prior Prayer context.
- No extra narrations, artificial spiritual-progress timers or simulated animation of sacred bodies.
- Run `npm run test:angelus-cinematic`, `npm run test:pray-owner`, relevant design-system tests and real Android visual acceptance. Merge only after these green and a visible-art mobile review.
