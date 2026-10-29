# Pray B32 — coherent source-owned Prayer discovery cards
**29 October 2026 · bounded phone UX pass, no content expansion**

## Audited problem
The existing Pray family panel displays source-owned B19–B28 devotions via five unstyled text buttons below the primary illustrated card grid:
- Passion: Five Wounds Chaplet.
- Devotions: occasional intercessions, St Joseph's Seven Sorrows and Joys, Montfort 33-day Consecration preparation.
- Eucharistic: intercessions for priests and vocations.

The source-owned routes exist but the secondary presentation lacks the full card treatment (canonical icon, category label, concise EN/FR description, aligned arrow and consistent tap area) used by the surrounding Prayer choices. Newer chaplet routes also lacked exact canonical icon mappings, so the card renderer fell back to no icon. This is an app UX problem, not a missing prayer-source problem.

## Changes
1. Preserve **all original** Pray families, 23 source-owned historic entry records and the extra Rosary/Chaplets family; do not change any underlying route, canonical text or reader.
2. Expose five contextual source-owned additions through `prayRelatedFamilyItems` and concatenate **at render time** with the existing family choices. Every entry now invokes the same `prayFamilyItem` card renderer, presenting proper visual hierarchy, icon, title, description and arrow.
3. Reuse ten existing verified core asset IDs in `canonicalAssetIdForPrayRoute` to avoid new assets and external dependencies. No paid visual design tool, no copyright-unsafe artwork or generic placeholder emoji.
4. Preserve source boundaries: a St Joseph icon is only attached to St Joseph; intercessions for priests receive the neutral devotional icon rather than incorrectly depicting St Joseph as a priest. The Little Crown uses the Rosary/chaplet motif; the Precious Blood and Five Wounds use existing Passion/Stations motifs.
5. Keep UI language translations authored as concise *descriptions*, not historical prayer-text translations.

## Tests
- Required `test:pray-owner` includes `tests/pray-related-cards-ux-b32.mjs` for five unique contextual entries, source-owner routing, canonical existing-asset validation, original family inventory immutability and no plain-link regression.
- Existing `tests/pray-chaplets-discovery-phone.mjs` extends 320px and 390px Chromium acceptance. It verifies all five related cards, exact source-owner view transitions, descriptions and icon surfaces, original family cards, and no phone horizontal overflow. It also captures the three affected family screens.
- Existing Prayer and Rosary/chaplet acceptance remain the release authority; no new workflow created.

## Further Prayer UX work, not undertaken here
A consolidated visual review is still needed for source drawer density, low-light typography, bilingual/Latin legibility, long-form guided novena navigation and consistent reader progress indicators. Screenshots from browser acceptance must be **visually reviewed** before claiming the visual aesthetics are signed off. B32 corrects an identifiable rendering inconsistency; it does not certify all of Pray's art, gestures or reader UX.

**Stop condition:** after valid CI, merge and production verification, continue a focused reader-typography/navigation review. Do not reopen corpus expansion or invent a separate UI engine.
