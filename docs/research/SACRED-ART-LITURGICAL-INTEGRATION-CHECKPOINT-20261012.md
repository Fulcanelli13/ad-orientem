# Sacred Art — Calendar / Home integration checkpoint

Date: 12 October 2026 · Working branch: `platform/885-sacred-art-candidates` · PR [#887](https://github.com/Fulcanelli13/ad-orientem/pull/887)

## Decision authority and historic salvage

1. The latest human export `data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json` is the editorial authority for **235 requirements**: **101 selected, 134 research, 0 excluded**. These are *subject-level artistic choices*, not publication approvals.
2. Older `sacred-art-curator-decisions-20261011.v1.json` preserves 44 prior chosen subject placements and 35 unique hashed originals. Those images remain valuable source acquisitions or alternates; they **cannot** overwrite newer choices. Only the Philippe de Champaigne Annunciation has a verified exact museum URL overlap between the 11 October ledger and the 12 October selected subject export. Other overlaps require verified object identification; blank research URLs do not establish distinct originals.
3. `sacred-art-liturgical-reuse-legacy-salvage-20261012.v1.json` records all 99 nominated occasion rows on 98 unique civil dates, **53 observed Class I dates** and **all 52 Sundays** (16 source-audited Class I Sunday/principal dates, 36 other Sundays whose 1962 principal must be resolved dynamically).
4. `sacred-art-2026-curation.js` is a *generated, read-only editorial index* of all 101 selected artworks and nominated occasions. It is **not** a second ordo, not a source for unrelated liturgical headlines, and not permission to publish image bytes.

## Runtime ownership

- `src/calendar/sacred-art-liturgical-bridge.js` owns the shared release bridge.
- `src/home/presentation.js` uses `selectReleasedHomeArtwork` first, and retains the existing `AO_PHASE1_ART.homeMarkup()` fallback until a source-verified masterpiece is technically released. The new renderer never repeats the current observed feast as a label for a held older painting: it captions **the painting's own actual subject and artist**.
- `src/calendar/calendar-runtime.js` uses `selectReleasedCalendarArtwork` only for a source-resolved observed daily principal and verified artwork association; candidate paintings do not appear merely because a date or title matches.
- Sundays and Class II/III major occasions that have no Class I manifest row can receive an exact feast/appointed Gospel/appointed Epistle painting only through an explicit `release.verifiedOccasions` entry, with that **actual source-resolved observed principal ID**, subject ID, dated association, relationship type, and *liturgical plus iconographic evidence URLs*. `homeSpotlight: true` is additionally required to allow the painting to start a new Home hold interval. No automatic weekly rotations or quotas.

## Release input contract (no released images currently provided)

The integration reads `window.AO_SACRED_ART_RELEASE_V1?.artworks`. This must be an independent, QA-reviewed production registry, not raw `sacred-art-candidates.v1.json`. Every work must independently satisfy the existing `eligibleSacredArtwork` predicate, including recognized public-domain museum source, verified rights, human aesthetic approval, colour full-resolution locally packaged no-frame no-glare image with SHA256, mobile crop approval and `review.status: APPROVED`.

It must also contain:

- `editorial.subjectIds`: actual IDs from the **101 selected** subject decisions.
- `editorial.selectedArtworkId`: the corresponding exact selected ID (for selections lacking recognized direct museum URLs). When a selected work has a recognized direct museum URL, that official original source URL is an additional hard identity constraint.
- `release.calendar: true` for Calendar rendering; separate `release.home: true` plus `release.homepageMasterpiece: true` for Home.
- For independently verified non-Class-I or ordinary Sunday placements: `release.verifiedOccasions: [{date,observedPrincipalId,subjectId,relationship,liturgicalWitnessUrl,iconographyWitnessUrl,homeSpotlight}]`. Relationship is restricted to `EXACT_FEAST_SUBJECT`, `APPOINTED_GOSPEL` or `APPOINTED_EPISTLE`. Source evidence URL strings are a structural gate, not an automated proof of their claims; editorial verification must precede release.

This bridge does **not** implement automatic promotion of the prior 264 acquired candidate originals. It cannot establish image rights or crop QA from research records, and cannot make the missing licensed/local image assets appear in a production build.

## Automated acceptance

- Dedicated [sacred-art runtime bridge validation](https://github.com/Fulcanelli13/ad-orientem/actions/workflows/sacred-art-runtime-bridge.yml) checks syntax, 101 editorial choices, 44 historic placements, 52 Sundays, 53 Class I dates, required source identity, Calendar exact-principal gating, independently certified additional feasts and Sunday Gospel associations, Home hold-vs-newest-anchor precedence, no duplicate Home artwork, and research-image rejection.
- `npm run test:calendar` also includes the new contract suite.
- Prior `src/calendar/sacred-art-selection.js` fail-closed approval predicate remains unchanged. The underlying Mass/Calendar DayResolver, date precedence, rubrics, Proper texts and other module ownership remain untouched.

## Outstanding actions before release

1. Source/reproduction verification for the user's chosen masterworks (particularly those with blank or search-engine-only source URLs), canonical artwork hashes and packaging, historical attribution, global rights and crop approval.
2. Curate roughly 15–25 exceptional Home anchor paintings; reuse suitable ones for Calendar and devotions where scene/subject identity is exact. Do not commission an image per Class I date, Sunday, ordinary saint or monthly slot.
3. Source-certify a small, meaningful set of actual 1962 Sunday Gospel event relationships. Prioritize missing visually important themes (Advent, Lent, Passiontide, Sacred Heart, Corpus Christi, Christ the King, All Saints/All Souls), not 365 fake exact images.
4. Resolve PR #887's current **merge conflict against the advancing main branch** and rerun the full app/browser acceptance suite at the reconciled head before merging. The focused standalone art-bridge test does not replace full release certification.

**Deployment status:** bridge implemented on a draft, unmerged branch; **no new sacred-art image has been published by this work**.
