# Ad Orientem · Minimal icon family specification (14 October 2026)

**Binding design target for draft icon repair. No production artwork or mappings are changed.**

## Source hierarchy and ratings

The only visual-family authority is **previously reviewed original artwork**, not the recent generative engravings. `priest_sedilia_rich` (5/5) is the confirmed priest-family exemplar. `priest_elevation`, `priest_ambo_rich` and `priest_rail_after_rich` (4/5) are comparative references awaiting final selection. `priest_centre_rich` (3/5) may provide altar layout geometry, but a 3 is **not** an aesthetic approval. Approved 4/5 faithful gestures show desired functional restraint but cannot be reused as priest actor drawings.

| Rating | Mandatory treatment |
|---|---|
| **0, 1, 2** | **Reject permanently** — do not harmonize, recolour or return the original as a proposal |
| **3** | Research indicator; no auto-approval |
| **4** | Show for explicit final review; not automatically selected |
| **5** | **Confirmed and selected automatically** |
| Unrated | Pending; do not infer selection |
Historical selections are retained as provenance but never override this new review's disposition.

## Visual construction — silhouette first

- **Priest:** simplified head with no facial portrait detail, no drawn eye/nose/hair textures. Rear view remains preferred. One continuous chasuble silhouette and simple alb; retain only the *minimum* simple cross or band that the confirmed family actually uses. No textile brocade, ornate embroidery or lace engraving.
- **Hands:** correct arm direction and spatial relationship to the Host, chalice, paten, thurible or altar. Gesture anatomy must remain readable; **never sacrifice rubrical accuracy** to minimalism. Show individual thumb/index contours *only* when the action depends upon them.
- **Altar:** same recognizable, elementary altar base between illustrations, with no carved panels or patterned cloth. Crucifix and candles only where necessary for station context. Never turn the icon into a miniature church engraving.
- **Ministers:** one unmistakable simple actor silhouette differentiated from the celebrant by placement and essential vestment shape; do not draw extra figures unless necessary for exact ritual action.
- **Objects:** one clearly recognizable necessary object (or Host-and-chalice pair, when the source demands it). Do not add ornaments, smoke clouds, shadows or scenery.
- **Graphics:** flat monochrome silhouette, deliberate broad negative spaces, minimal interior contours, no woodcut / etching / hatching / texture / gradients / shading; a single immutable viewpoint relative to the approved master.
- **Format:** true transparency and tint through `currentColor` (prefer proper vector paths; a one-channel alpha mask is an honest temporary fallback). An SVG wrapper holding a PNG does **not** count as vector. Never change original donor bytes.
- **Composition:** one square standalone icon, same relative actor height and baseline as the chosen accepted exemplar, no captions, borders or composite sheets.

## Two display scales, not one over-detailed picture

| Surface | Rule |
|---|---|
| **48–64 px LIVE rail** | **One instantly readable posture/gesture silhouette**. If complex handwork cannot read, use a simple approved cue plus a source-backed text rubric, not a full decorated altar |
| **96–128 px / expanded rubric guide** | Minimal priest + altar context allowed when needed; use the exact same family and anatomy |

A draft passes only if the posture/gesture is correct, actor ownership is correct, its silhouette matches the confirmed family, the small-size rendering conveys the essential action, and the ink changes colour cleanly over both light and dark backgrounds. Colour tint alone does **not** prove stylistic consistency.

## The recent detailed drafts

The highly detailed generated incense priest, altar-engravings and labeled overview sheets are **not approved styles**. They may be consulted *only* for action geometry, never as the source for artwork density. No further attempts to harmonize toward their lace, hair, altar carvings or smoke effects.

## Sequence

1. Freeze the 5-rated style reference and reject every 0–2 original.
2. Resolve wrong-section / wrong-gesture items with remapping and exact source text first.
3. Simplify 13 surviving visual-family defects using one template; favour existing icon reuse and tiny silhouette adjustments.
4. Diagnose two non-specific revisions and complete B13 crop; then test all repairs at 48/64/96/128px and with dynamic colour.
5. Only after source-by-source coverage recheck, generate genuinely missing gestures three at a time.

**Primary source review:** `Ad_Orientem_Full_Mass_Icon_Review_2026-10-14.json`. **Source-owned cue map:** `data/mass/gesture-matrix.v1.json`. **Work orders:** `data/presentation/mass-icon-harmonization-16-workorders-20261014.v1.json` and `data/presentation/mass-icon-harmonization-source-resolutions-20261014.v1.json`.
