# Prayer B36 — Five Wounds chaplet phone reading
29 October 2026 · bounded visual-first repair

## Found in current code
The source-owned Five Wounds chaplet is a five-group, 30-prayer reader, reusing the existing canonical Gloria Patri and Ave Maria in English, French and Latin. The five wound names were forced to **10px** at phone widths of 420px or less with an 80%-opacity label. Meanwhile the original Previous/Next footer appeared below the prayer body, inconvenient on a short mobile viewport. The prayer itself is already 19px+ serif, and its source disclosure is collapsed.

## Changes
1. Keep the five existing wound jump buttons and the original progress bar. Increase the small wound labels to 12px at 320px and 390px, full opacity, responsive wrapping, and at least 66px rail targets. Do not change their wound names, IDs, prayers or group transitions.
2. Make the **existing** Previous/Next footer sticky within the Five Wounds main reader. Give each control a flexible mobile width, 48px minimum height, an opaque surface and safe-area padding. No replacement toolbar and no new stage-navigation logic.
3. Expose the existing **session-only EN/FR header switch** in Five Wounds (already used by Adoration, Benediction, Stations and Confession), without changing global app settings or resetting the selected prayer. Hide the EN/FR switch while Latin is being prayed; the original Latin toggle remains in the prayer card. Preserve source caveats, historical non-current indulgence status, five wounds × six prayers, source URLs, and the optional private rather than public-rite context.
4. Do not apply the Novena-specific CSS/dimming changes to the chaplet, or change any other devotional reader.

## Validation
- Source route/30-prayer contract remains part of `test:pray-owner`; the existing B17 test is extended to cover legibility and sticky thumb actions.
- Existing chaplets Playwright test gets real 320/390 screenshots, calculated label font/opacity, thumb-target hit testing, scrolled viewport geometry, intact progress jump, Latin→vernacular and session-only English↔French switching (retains the selected prayer), French text with no horizontal overflow, and restoration of English for subsequent readers.
- New bounded CI workflow reuses that **existing** chaplets test and uploads screenshots for a three-day temporary visual review; no permanent image archive or fee.
- Merge only on passing Required Main and the dedicated chaplets phone gate. Inspect screenshot evidence before claiming visual approval.

## Remaining
The Little Crown, full Precious Blood, litanies and Eucharistic Adoration need their own reader-specific checks; B36 deliberately does not redesign them or expand the corpus.
