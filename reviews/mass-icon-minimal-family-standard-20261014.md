# Ad Orientem · Minimal icon family specification (14 October 2026)

> **Correction, 14 October:** The previous direction accidentally created a different family: geometric stick-figure priests with circular heads and crude table-altars. Those three studies (incense altar, B16 bow, B13 Host reception) are STYLE-REJECTED. Do not reuse or propose them. “Minimal priest features” means minimal facial/hair detail **while preserving** the approved priest's actual Roman chasuble proportions, body geometry, stylistic internal contours and the selected altar's layout. This master-preserving rule supersedes any blanket instruction below to remove all embroidery, altar architecture or vestment detail.


**Binding design target for draft icon repair. No production artwork or mappings are changed.**

## Source hierarchy and ratings

The only visual-family authority is **previously reviewed original artwork**, reproduced as an actual master-derived edit rather than an invented replacement aesthetic, not the recent generative engravings. `priest_sedilia_rich` (5/5) is the confirmed priest-family exemplar. `priest_elevation`, `priest_ambo_rich` and `priest_rail_after_rich` (4/5) are comparative references awaiting final selection. `priest_centre_rich` (3/5) may provide altar layout geometry, but a 3 is **not** an aesthetic approval. Approved 4/5 faithful gestures show desired functional restraint but cannot be reused as priest actor drawings.

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


## Faithful-master reconstruction protocol (supersedes over-simplification)

1. Start from the actual 5/5 `priest_sedilia_rich` for priest morphology and the relevant selected existing altar/priest figure for an altar action. Match scale, angle, shoulders, chasuble side contour, silhouette and internal motifs **as they actually appear**.
2. Keep every visual region not directly involved in the requested action unchanged. For incense, only edit the necessary arm/thurbile/action region; for a bow, reconstruct the same priest bent at the waist; for Host reception, retain the same garment and change hand/head relationship only.
3. Preserve **characteristic** restrained detail already present in the selected master. “No excess detail” means no *new* lace, ornate textiles, smoke clouds, shrine architecture, facial modelling or crosshatching. It does **not** mean deleting all chasuble marking or replacing altars with two sticks.
4. Overlay old and proposed images with the same 1024px frame and highlighted visual differences. Reject a candidate that replaces the whole figure with circle-head or tapering-cylinder icon geometry, even if 64px legibility or `currentColor` technical tests pass.
5. Produce a candidate only when exact source-owned physical hand/object action can be shown and when unchanged portions visually match. Otherwise reuse an existing approved icon plus a short source-backed rubric.
6. Final vector conversion is **after** family/style approval. Genuine SVG paths alone are not proof of family adherence.

Three geometric studies from `reviews/mass-icon-candidates/minimal-20261014/` remain in the repository for traceability only, with `REJECTED_STYLE_MISMATCH` status and no production review eligibility. **No user 0–5 score was assigned to these new trials**; the rejection is explicit stylistic feedback.
