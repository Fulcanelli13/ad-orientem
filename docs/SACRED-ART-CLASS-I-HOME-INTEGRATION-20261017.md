# Class I artwork: 18 approved physical paintings wired to the Home release boundary

**17 October 2026.** This is a focused implementation companion to Sacred Art draft PR [#1231](https://github.com/Fulcanelli13/ad-orientem/pull/1231), not a new ratings catalogue or a replacement of the Calendar resolver.

## Implemented now

- `src/home/sacred-art-selection.js` projects **18** dated, curator-approved physical artwork IDs from the immutable 17 October export; aesthetic approval means rating 5 or explicit lock.
- Assignments distinguish **Gospel scene**, **feast event/iconography/persons**, **Passion event**, and **Holy Thursday's Eucharistic theme**. The latter does NOT claim that the Last Supper illustrates the day's John 13 Gospel of the washing of feet.
- `src/home/presentation.js` has a controlled artwork release handoff. It only displays a newly released local painting when the active day principal, actual Proper source path, Gospel start where applicable, image-master identity, reusable rights/credit, SHA-256, size, crop and technical release gate all agree.
- The old Home gallery can no longer display its **four known historical source conflicts** for Fra Angelico and El Greco: Annunciation, Pentecost, Trinity Sunday (including trailing-r variant) and Ninth Sunday after Pentecost. In all four, the Home retains its typographic no-art hero rather than silently substituting an unrelated painting. This is a source-path fail-closed guard; it does not modify the 1962 calendar or Mass reader.
- The tests enforce approved identities, contextual vs exact roles, live Proper matching, image-release holds, and artist exclusions.

## Source-media inspection (separate from release)

An inspection of the supplied 17 October standalone-review archive found **17 distinct selected primary originals across the 18 dates**. **13 originals have local review WebP copies**, covering 14 date associations; **four do not**: `met-459131` (Last Supper), `cma-136507` (Trinity), `met-442491` (Peter and Paul), `cma-143784` (Adoration of the Shepherds). None of the 13 WebP review derivatives may be treated as a production master without independent checks.

**Incorrect source-picture association to repair outside this mapping:** `ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross` is assigned a review image whose Commons filename explicitly identifies Station VIII (women of Jerusalem), and the displayed picture is not the Death on the Cross. Hold that media asset regardless of the physical artwork's 5-star/locked approval; do not repurpose or rewrite the rating.

## Deliberately NOT claimed

- **0 newly cleared local painting-master images.** `RELEASED_SACRED_ART_MASTERS` is intentionally empty; a 5-star rating never establishes image licence, exact physical original, suitable image bytes, cropping, resolution or verified renderer. Therefore the 18 mappings do NOT suddenly render 18 paintings.
- The old selector remains active on other dates; its historical GREEN flags are not rewritten to user approvals.
- The 53-day 2026 research audit is a candidate/coverage register, not proof that all 53 have a publishable image.
- No permission requests, paid licenses, museum correspondence or transfer of rating to a different original.
- No changes to native MISSAL/SIMPLE/LIVE reader, Calendar precedence, other devotions or Saints.

## Next release batch, without further rating

Use the user's already acquired images inside `Ad_Orientem_Sacred_Art_Final_Selection_Full_Images_2026-10-17.zip` and their exact source-file metadata to verify physical-original matching, open reuse terms, SHA, credit, pixel dimensions and safe crop. For a passing image, add a local `assets/approved/sacred-art/<master>.webp` file and a fully verified record to `RELEASED_SACRED_ART_MASTERS`. Include image-on-phone and EN/FR screenshots for the selected proper/date. Begin with Epiphany, Laetare, Annunciation, Low Sunday, Pentecost, Assumption, St Michael and Immaculate Conception; do not publish by date alone.

Review the existing 53-date research JSON and PR #1231 before sourcing anything else. Fix remaining literal Gospel vs feast-event distinctions and avoid re-showing any of the **68** frozen rejected IDs. No artwork changes to `main` or production are claimed before this PR is reviewed and merged.
