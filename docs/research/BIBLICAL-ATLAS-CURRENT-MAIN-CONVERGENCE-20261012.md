# Biblical Atlas — current-main convergence, 12 October 2026

## Integration owner
This branch was created from the current production `main` at `33783c7c0043053449cd7b22f97be99255d153f6`. It selectively transfers the **151-event / 11-era** source corpus, canonical Bible-context actions, 35 source-qualified geographical anchors and interactive horizontal timeline from draft PR #998. It does not transplant old, conflicting versions of the Explore shell, map runtime, sacred places, Shrine profiles or illustrated guides.

Sources:
- [PR #998 — production candidate Atlas](https://github.com/Fulcanelli13/ad-orientem/pull/998)
- [PR #1010 — 181-scene cinematic design exploration](https://github.com/Fulcanelli13/ad-orientem/pull/1010)
- [PR #1018 — genealogies, lineage, apostolic dispersion, source and 151↔181 crosswalk](https://github.com/Fulcanelli13/ad-orientem/pull/1018)
- [PR #923 — original OpenBible/STEP source acquisition](https://github.com/Fulcanelli13/ad-orientem/pull/923)

## Product boundary
- New Atlas remains a view inside **Explore → More → Biblical Atlas**. Not a top-level destination, and not a substitute for the original Sacred Geography.
- It reuses `src/find/map-runtime.js` and the existing Scripture overlay `data-ao-scripture-context` action.
- Current main's latest Explore source, sacred place guide loaders and renderer remain intact; `allowEmpty` changes only the initial zero-pin Atlas case.
- 151 named milestones are **editorially selected, not an exhaustive 73-book biblical chronology**. Contested or unlocated scenes have no manufactured GPS pins. The 35 map anchors are provenance-qualified; publication requires further historical review.
- Genealogy source claims do **not** automatically become production relationships or travel routes. The 3,231-person bulk database remains a search-only research index; only 90 Genesis source-linked statements and separate Matthew/Luke lineage evidence have undergone targeted editorial extraction, with Vulgate/Crampon variant holds.
- The 181-scene cinematic demonstration is an alternative design sequence, not a replacement of the protected 151 events. Research crosswalk from #1018: 65 exact-reference, 29 passage-overlap and 87 unmatched design scenes; 86 source milestones lack exact design equivalents.
- Apostolic Dispersion: 20 editorial profiles and 55 entries in #1018; Scripture, patristic evidence, later tradition and holds must remain distinct.

## Release gates
1. The new CI must pass native Scripture context, no fabricated geolocations, all 151 items, and fresh mainline Explore UX/phone acceptance. Until it does, PR remains draft and is **not shipped**.
2. A textual-critical verification of Matthew and Luke as separate source lineages (incl. Jeconias, the second Cainan, St Joseph as legal/putative father, maternal relations) must happen before a genealogy page appears in app.
3. Only approve native genealogy navigation after reviewing the already working offline prototype in #1018, and avoid wholesale importing the old OpenBible/STEP corpus into the shipped bundle.
4. No automatic copying of the 181 expanded prototype's route lines or exact ancient geolocations; disputed Exodus routes especially withheld.
5. After successful regression and reviewer acceptance, close old #998/#1010 as superseded by the current-main convergence; keep #1018 as source research until genealogy certification is done. Do not merge speculative research merely to clean the PR list.

## Testing
`tests/explore-bible-atlas-timeline.mjs` and `tests/explore-bible-atlas-phone.mjs` were ported from #998. Their current-main execution is governed by `.github/workflows/biblical-atlas-current-main.yml`. The pre-existing Explore R53/R54 suites must remain green. Until workflow results are available, do not claim they passed on this new branch.

## Review-only genealogy and Apostolic Dispersion (12 October, next batch)

**Implementation:** src/find/bible-lineage-review.js and data/explore/biblical-lineage-curated-review.v1.json are a pinned, lazy-loaded copy of explicitly held evidence from [PR #1018](https://github.com/Fulcanelli13/ad-orientem/pull/1018). The existing Explore owner exposes a single Atlas with three native modes: **Chronology**, **Genealogies**, **Apostolic lives**. The 151-event mode is never replaced. Research modes visibly say **Research preview — not approved for publication**.

- **Genesis:** 90 source-linked family relations with progressive generation reveal, plus focus on Adam, Noah, Abraham, Jacob and Joseph. Homonymous people keep their distinct source IDs; mother annotations do not silently become paternal ancestry.
- **Matthew 1 and Luke 3:** separate 41/76-place textual lists, paginated to 12 records per view. St Joseph is shown as legal/putative father; associated women do not become new paternal ancestors.
- **Apostolic Dispersion:** 20 curated people/55 original-source entries. Scripture, patristic witnesses, qualified identification and later traditions have different explicit statuses. Philip the Evangelist remains distinct from Philip the Apostle, Marian Jerusalem/Ephesus traditions are competing claims, and Revelation's John has an authorial-identification qualification. Held itineraries do not receive invented travel.
- **No research pins:** the 25 imported candidate locations are not map-published; place names are text context only, not precise GPS.
- **Eleven exact canonical-reference joins** are currently available from apostolic entries to one of the 151 timeline references. These are called *related chronology references*, not identity certification. Partial overlap, person similarity and shared cities create no joins.
- The bulk 3,231-person STEP donor stays outside application UI; the smaller 115 kB curated JSON is lazy fetched only on entering research modes.

**Contracts:** tests/biblical-lineage-native-review.mjs covers the schema release hold, Genesis edge citations, Matthew/Luke legal father safeguards, apostolic source classification and unique exact citation joins. The 390px browser journey adds genealogy mode switching, review qualifiers, passage jump and return to 151-event chronology. Full CI must be green before treating this draft as verified.

### Still blocked before release
1. Original-edition Vulgate/Crampon/Douay verse/name audit, including omitted generations and Matthew/Luke differences.
2. Screenshot and physical-device review at 320/390/768 and desktop; automated checks are not aesthetic approval.
3. Event-by-event evaluation of PR #1010's 181 design scenes against PR #998's 151 source events before porting improvements.
4. Separate editorial approval for lineage claims, historical location identities, apostolic traditions and live public scope.

## A3 — Cinematic sequence reconciliation and connected trees (12 October)

The 181-scene, 14-chapter cinematic pilot is preserved **as a review-only view inside the same Explore / Biblical Atlas owner**, not as a replacement timeline, second app, or newly certified geographic route. The canonical chronology still contains exactly 151 bilingual milestones in 11 eras.

**Source crosswalk:** data/explore/biblical-cinematic-studies-review.v1.json is a projection of research PR #1018's AO_ATLAS_151_181_CROSSWALK_V1. It contains all 181 records from PR #1010, with original source references and EN/FR scene synopses, but strips third-party artworks, coordinates and routes. The 14 chapters are ordered by Abraham → Moses → Christ → St Paul; that is a four-journey comparison, not a complete 73-book chronology. Classification is **65 exact citations, 29 partial overlaps, 87 no direct match**. Of the 65 exact citation cases, **64 yield a unique canonical-target citation**; scene index 68 has an exact citation plus an overlapping second candidate, so its automatic jump is suppressed. Citation matching NEVER implies proven scene equivalence, precise date or location.

**UI:** a restrained read-first cinematic study, a 14-chapter selector and scene-by-scene navigation; every scene has a native Scripture reading action and an evidence status label. Exactly matching unambiguous citations alone offer a reversible jump to the 151-event timeline. No image rights, artwork sources or map coordinates have been promoted. Apostolic / genealogy modes retain the unapproved-research warning. No app runtime outside current Explore is replaced.

**Family tree:** Genesis review no longer presents only a flat parent→child list; it displays an actual nested branch structure with connective rails, distinct IDs and a source link attached to each individual parentage record. Five ancestor foci, 1–6 generations and the 90-source-link underlying corpus are unchanged; no inferred relationships from vendor person-name matches.

**QA / proof:** tests/biblical-cinematic-studies.mjs checks all 181 records, 14 complete chapter partitions, 151 protected milestones, 64 safe exact hops, withheld ambiguous links, absent artwork/GPS and failed-schema rejection. The existing real-phone scenario now traverses cinematic chapters and one exact source jump and checks an actual nested Genesis tree. The screenshot capture suite records 320/390/768/1280px views of canonical chronology, family tree and cinematic study into a named CI artifact for human visual appraisal.

**Publication hold remains:** historical-site certification, Latin/French Scripture textual criticism, aesthetic approval of source-aware imagery and 151↔181 semantic adjudication are not replaced by passing automated tests; all evidence modes remain on a draft PR.

