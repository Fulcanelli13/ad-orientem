# Calendar-first editorial design foundation — 10 October 2026

Status: **implementation branch / acceptance pending**. The current production `main` remains authoritative. This document is not a release certification.

## Direction

The Full Calendar (Day / Month / Liturgical Year) provides the structural reference; Today v3 provides the artwork-led editorial direction. A single canonical stylesheet (`src/app/design-system.js`) owns global editorial typography, spacing and affordances. Sanctifica is inspiration for art and visual salience, not a template or a source of content.

The five main destinations remain Today, Mass, Pray, Formation and Explore. Full Calendar remains directly accessible from Today, and Mass's certified 48-card R17 LIVE reader is excluded from editorial layout changes.

## Included in this branch

- Bump shared visual owner to `ao-design-system-v3`, retaining all existing v2 design tokens so downstream consumers continue to work.
- Add shared opt-in CSS primitives: `aoEditorialHero`, `aoEditorialKicker`, `aoEditorialTitle`, `aoEditorialLead`, `aoEditorialMeta`, `aoEditorialSection`, `aoEditorialReading`, `aoEditorialPrimary`, `aoEditorialArtwork`, `aoEditorialToolbar`.
- Apply lightweight class hooks to Home, Calendar Day/Year, Formation landing, Explore header and Pray family entry. Existing action/data attributes, route identities, source resolvers and state contracts are unchanged.
- Apply 12px kicker minimum, responsive title sizing, 44+px existing controls, and 48px primary actions where opted-in; preserve existing source/disclosure treatment and reduced-motion rules.
- Extend `tests/design-system-coherence.mjs` with consumer and R17 isolation assertions.

## Explicitly not included

- Replacing today's Home composition with the complete v3 art-led hero, moving Mass CTAs, changing navigation architecture, or introducing any new celebration logic.
- Altering Mass LIVE cards, postures, rubrics, reader projection, prayer-text typography, novena programmes, Calendar computations, maps or formation content.
- Adding paintings, artwork data records, generated reproductions, image downloads, external hotlinks or new copyrighted artwork.

## Next controlled work

1. **Artwork acquisition gate:** resolve an approved local, high-resolution public-domain/licensed painting and rights/provenance record; use approved seasonal/symbolic art when feast-specific imagery is unavailable. Do not ship generated art under historical attribution.
2. **Today v3 composition:** frontispiece + clearly visible native-R17 Open/Resume CTA + slim Calendar context + Pray now + Scripture/Saint/Formation + Coming up. Consume existing Calendar, Mass, Prayer and Formation owners.
3. **Accessibility and device gates:** validate 320/360/390/430px; long French feast titles; no horizontal overflow; CTA visible on standard-height devices; focus navigation and reduced motion; offline art fallback; source incompleteness states.
4. **Application integrity:** run `npm run test:design-system`, `npm run test:home-presentation`, `npm run test:calendar`, `npm run test:learn-owner`, `npm run test:explore-reachability-phone`, Pray checks, `npm run test:r17`, and whole-app CI. The foundation branch alone cannot be declared phone certified.

## Ownership and rollback

Design tokens: `src/app/design-system.js`. Calendar observed days and seasons: existing Calendar owner. Mass open/resume: existing R17 session guard. Devotions: Pray owner. Gospel and saint links: canonical Scripture/Formation owner. Explore maps and customs: Find/Explore owner.

The new classes are opt-in; removing a consumer's `aoEditorial*` class restores its prior presentation. No parallel CSS injection, app route, artwork registry, or content database is introduced.
