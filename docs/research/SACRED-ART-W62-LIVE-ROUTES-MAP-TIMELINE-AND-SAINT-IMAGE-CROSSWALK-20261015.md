# W62 — Live route and Map/Timeline source-image classification
**15 October 2026 · stacked research on W59/W60/W61 · NO app/UI or source-owning module changed**

## Governing order

**Group all physical originals and their subjects → group every actual application surface and source identity → add source-backed artwork/media associations without implying approval → date-by-date and per-surface audit → research the confirmed gaps → ratings only for never-reviewed genuine physical originals.**

These files do not merge anything into `main`, do not publish paintings, do not override the user’s W48/W49/W58 ratings and cannot close the former "149 missing saint-feasts" metric.

## Files added in W62

1. [Route and saint identity inputs](../../data/research/sacred-visual-w62-live-route-and-saint-identity-inputs-20261015.v1.json): groups **66** app/feature surfaces into Pray, Formation, Today/Calendar, Mass, Explore, Bible Atlas, and explicitly **unmerged** Saints Map/Genealogy research. Routes are inventoried from owner source, not necessarily individually browser-tested. The source has 31 Prayer routes, 15 Formation layout routes, one extra lazy Formation route, seven map lenses, four biblical Atlas surfaces, six Today/Calendar/Mass surface categories and two pending research features.
2. [Map/Timeline image-evidence inventory](../../data/research/sacred-visual-w62-map-timeline-media-evidence-20261015.v1.json): links **151** actually published sequence event IDs to **183** independent cinematic research scene IDs and original 44 editorial art-association records. Holds **258** actual geography seed places separately from **750** unpublished physical site candidates (plus 98 routes/nonphysical events). No unverified painterly or photography links were imported as approved.
3. [Saints Map identity/artwork links](../../data/research/sacred-visual-w62-saints-map-identity-art-image-links-20261015.v1.json): the 119 shrine dedication strings plus old 87 saint-art rules, 79 aliases and the separate six-person holiness-first bios, so that sainthood roles and reported extraordinary events remain owned by the Saints pipeline, while correct artwork physical IDs remain owned by Sacred Art.

## Canonical Bible Atlas and map grouping

- **151/151 production timeline milestones:** canonical event labels and Scripture text from `src/find/bible-atlas.js`, not inferred from a name-only picture database; all 11 source eras retained.
- **183** unmerged cinematic research scenes: separate 14-chapter bibliography/scenes. Do **not** use `151+183` as a count of production timeline events; research scenes may overlap events or describe subepisodes.
- An existing **44-row art-subject-to-Bible-scene research crosswalk**, whose `release` flag is **false for every row**, covers **20 research scenes** and contains **19 directly source-ID-linked associations across 12 canonical Atlas events**. A link such as Annunciation ↔ Nazareth event is an editorial relation, NOT proof that a particular 5-star original and crop is currently rendered on the event screen.
- Existing place photo registers hold **24 approved media entries** bound to **19 distinct source IDs among 258 physical site seeds**. Of the 258 seeds, all 258 identify mappable sites. An unillustrated pin may still be legitimately mapped; an unrelated painting cannot be presented as a photograph of the actual building.
- The 750-site curated backlog is NOT 750 live user-facing pins. Reconcile site IDs to production before using the 750 as an image-completion denominator. Its 98 separately recorded nonphysical routes/events are not churches.
- An unlocated biblical scene gets a contextual/map-diagram visual but NEVER an invented exact geographical pin.

## Historical saints and the new Saints Map

From old frozen v43.33 (not current-rubrical certification):
- **252 saint-bearing month-days / 311 component-occurrences**, monthly expected totals transcribed exactly and checksum-tested (12 months, dates total 252, components total 311). These are historical target counts, NOT 311 recovered date/identity records.
- **87** legacy saint-art resolver identities, **79** aliases, **27** date-override days with **47** ID slots, **36** named date-identity locks. The union of these available IDs contains **104** distinct old canonical IDs. Comparing 104 unique IDs to 311 occurrences is invalid: the units differ.
- Saints pipeline's **119** existing shrine name strings: **41** have at least one art subject research association across **41 distinct art subject IDs**, but no old research association by itself confirms an approved saint portrait; 11 names have a single normalized exact historical display-alias match, marked **name-only pending owner confirmation**.
- Six Saints holiness-first biographical pilots have meaningful saint role classifications (Doctor, religious, mystic, pastoral, martyr, etc.) and optional source-backed extraordinary-event fields. The pilot currently reports **zero approved artwork IDs** for those six identities; no one should infer that there are zero appropriate approved paintings elsewhere.
- Blessed, Saint, Doctors of the Church and named martyr groups remain different editorial entities; the user wants collective martyrs represented together, not individually enumerated by default. A place named for a saint is NOT evidence of where that saint lived.
- The separate six-person post-1960 living sanctoral calendar pilot remains explicitly optional, never automatically changing the 1962 Mass or feast precedence.

**Blocker for 311 names:** the original Saint-Art v43.33 `buildManifest()` constructs component rows at runtime from `calendarEngine.loadSource` and date overrides. Its 311 components are not stored as 311 rows in the W59 JSON. Rebuilding them accurately requires running/recovering the pinned historic 1960 sanctoral source and verified current resolver; the preserved monthly denominator cannot generate identities on its own.

## Image association policy for next phase

For each scene/person/place/prayer, maintain:
- primary canonical subject ID and group,
- exact source event/person/place ID,
- candidate artwork original ID (or exact-site approved media ID),
- artwork *relationship* (`DIRECT_EXACT`, `SUBEPISODE`, `CONTEXTUAL`, `PORTRAIT`, `SITE_PHOTO`, `MAP/GRAPH`) and independent evidence,
- historical and current W48/W49/W58 user score, 0–2 rejected physical originals exclusion, Fra Angelico / El Greco exclusion,
- source original accession/Commons file and publication rights,
- crop/resolution/rendered-on-actual-reader confirmation,
- final per-surface `EXACT_APPROVED`, `CONTEXTUAL_APPROVED`, `CANDIDATE_HOLD`, `EXPLICITLY_REJECTED`, `MISSING`, or `NOT_YET_AUDITED`.

Until actual current image path/rendered view and reader are inspected, these W62 ledgers mark image coverage **not yet audited**. The count of researched scene links is *not* a coverage percentage, and a no-photo source ID may still be an adequately mapped pin.

## Next execution, without duplicating other pipelines

1. Extract the **current** resolved 1962 calendar occurrences through the Calendar owner, separately preserving living-sanctoral overlays; join each *date's* principal image and each distinct saint/group/commemoration image requirement. Bring the legacy 311 component identities in only when fully source-generated.
2. Link visual demands for the **66 grouped screens** to the Prayer and Formation owned UI routes and exact user-facing sub-items (48 prayers, 16 novenas, 20 Rosary mysteries, 14 Stations, 65 curated Mass cards as navigational moments, not obligatory paintings).
3. Use the W62 **151/183/258/750** map input ledgers as source IDs for actual artwork-to-subject review; classify other source art joins as candidates until image identity, rights, user rating and on-screen placement are confirmed.
4. Only after these joins calculate exact per-domain visual coverage and begin acquiring **genuinely missing** and not previously reviewed physical originals, prioritising story illustrations for Atlas and images for Saints Map.

**Existing owners remain unchanged:** Sacred Art PR #887, Calendar, Saints biographies, Prayer, Bible Atlas and Sacred Geography. This is source consolidation of pointers, not a duplicate catalogue.
