# Sacred Art — 2026 Class I/II multiple-work crosswalk and Home rotation

**31 October 2026 — Research-only, no image deployment or curatorial override.**

## What was reconciled

The 2026 Calendar source has **53 Class I and 76 Class II observed principal dates** (129 exact `YYYY-MM-DD + observedPrincipalId` keys). A new additive file, `data/calendar/sacred-art-2026-class-i-ii-multiwork-crosswalk.v1.json`, joins:

- All 53 dated Class I choices from the October 20 non-destructive research overlay, the ten protected 19 October primaries already in `main`, and the explicit 27 October selections of Reni's St Michael, Murillo's Immaculate Conception (Cleveland `cma-135659`) and Bernardo Cavallino's Adoration of the Shepherds (Cleveland `cma-143644`).
- The **383 active artwork-ID B48 acquisition census**, without treating physical source evidence as photo release permission. 360/383 had a source; 358 provisional complete original images; 107 frozen old artwork approvals; 68 rejected IDs were not eligible.
- A conservative exact painting-title index, not an indiscriminate artist- or saint-key fuzzy match. It produces **85 catalogue date-to-ID candidate links across 36 distinct dates**, including **15 dates with at least two catalogue IDs**. Multiple IDs can be **the same physical original**; verify and dedupe by exact original identity before any production rotation.
- **13 additional museum painting leads** on nine Class II feast dates, none falsely claimed downloaded or approved (B03/B14/B15/B16; see PR #1231).
- Any earlier 102-date Sunday scene research references are kept separate, **not treated as verified actual Gospel assignments**.

These numbers count **dated research links**, not fully cleared live artworks or true missing pictures. The other 93 days are not 93 missing painting originals. Some have prior selected works outside the 383 collection; many seasonal/sunday dates have unverified subject matches requiring Gospel/source checking.

## Latest editorial precedence

Preserve every frozen approval and rejection. A later date-specific direction outranks an older date-primary suggestion, but does not retroactively remove an artwork's global rating.

**Holy Thursday:** User's later expressed strong preference is **Philippe de Champaigne, `La Petite Cène`**, instead of the older Ugolino Last Supper. The research crosswalk records the historical Ugolino choice separately and holds date-primary publication until the approved current source is reconciled. It does not silently rewrite the existing production ten-date registry.

**Easter Vigil:** Two approved prophecy illustrations are not an approved generic one-image Easter Vigil hero; preserve that distinction.

**Institutional leads:** Poussin Baptism, Andrea di Bartolo Nativity Virgin, Ricci True Cross, Lochner Simon/Jude, Ricci da Novara Lateran fresco, two separately accessioned Cornelis van Haarlem Innocents oils, and related sources are new exact/related subject research, not authorised published variants.

## Home rotation design

A single calendar day may have **one protected primary** and **multiple independently approved exact-subject painting originals**. Each published variant must have:
1. Exact 1962 observed `date + principalId` and approved date placement.
2. Independently verified exact physical original ID, not merely a filename or catalogue alias.
3. Exact image SHA, locally packaged WebP, permission-free/licence-cleared reproduction for the app, unframed/whole-painting visual QA and reviewed phone hero crop.
4. Artist, title and source for the painting's **i** information control.
5. Exact subject, or a deliberately user-approved thematic primary; an ordinary thematic/research suggestion never rotates automatically.

For each **new Home entry or browser refresh**, choose the next distinct certified painting. A stable `visitKey` retains the same image during Home re-renders; no sudden mid-reading changes. Cycle primary → verified alternatives → primary (per actual user-visit history). Do not share state with Prayer's independently rotating artwork. Persist only a last-physical-object identifier in optional browser storage, falling back to the primary when storage is unavailable. Zero network requests are required for selection. Respect the user's mobile hero crop preferences and source-title info control.

`src/home/sacred-art-visit-rotation.js` implements the **release-gated pure selector**. It is *not yet wired into the production Home hero*, because the archival sources and source licences have not passed the final gate. No extra visual UI, no legacy Home override and no unapproved images are shipped.

To activate after certifying at least two works for one date:
- Create approved, source-owned per-date placement records with `physicalObjectId`, exact file SHA, release flags, and a packaged local asset.
- Integrate one explicit route-entry `visitKey` into the actual H7/C3 Home hero. Do **not** call the rotation helper on every render.
- Render the returned artwork's approved source caption, link and crop. Keep single-image days unchanged.
- Verify mobile 320px/390px and regression-proof 1962 principal mismatch, excluded artwork, wrong iconography, photo reuse rights and same physical original under multiple IDs.

## Non-negotiable

Strictly €0; no emails/contacts/licence requests/payments; no Prado source or unjustified reuse. No re-rating, rejection reversal or speculative source approvals. No production artwork release is claimed.

Run research tests: `node tests/sacred-art-class-i-ii-multiwork-rotation.mjs`.
