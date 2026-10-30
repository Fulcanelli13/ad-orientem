# W61 — Categorise first; then visual coverage, then gaps
**15 October 2026 · Research only · Sacred Art owner PR #887 remains authoritative for original artworks and user ratings**

## Correct sequence

1. **Inventory and categorise everything** — original artworks and all image-requiring surfaces in Ad Orientem. Establish one artwork/object ID, subject families, place/saint/event IDs and role distinctions. No feasibility guessing from the date calendar.
2. **Relate a single original to many accurate uses** — approved or candidate artwork may cover multiple calendar days, prayers, Rosary mysteries, saints, Bible narratives, Map of Saints entries and timelines, but only when the iconographic relationship is validated. Repeat use is desired; duplicate files/catalogue IDs are not.
3. **Audit image presence for every eligible target** — iterate the actual 1962 year resolver and the Saints of the Day identity table, all prayer/module landing pages and each live map/timeline event/place. Report whether image is exact, contextual, pending review, rejected or absent. Require one image for every date and each saint/group, with separate visual obligations for app prayers and map/timeline details.
4. **Only then research the real gaps** — first reuse existing 5-star pictures and strong rights-cleared paintings, then seek new images. Give priority to the Bible map/timeline, Saints map and important unillustrated pilgrimages; never resurface rejected originals or excluded artists.
5. **Final aesthetic/technical release** — verify actual image, human score, rights, resolution, crop, mobile use and source. Multiple genuine 5-star images for one subject may rotate dynamically.

## Committed machine-readable classification

- [W61 grouped artwork register](../../data/research/sacred-visual-w61-grouped-artwork-register-20261015.v1.json) — **281** canonical candidate artwork records grouped into a first-pass primary iconographic family, with every source ID, rights status, acquisition SHA where recorded, exact-ID score where recoverable, and multiple module/subject tags; plus separate 49 historic Proper leads and 83 Breviarium plate labels. Groups are useful for browse and triage, **not** individually certified depictions or aesthetic approval.
- [W61 grouped demand and taxonomy](../../data/research/sacred-visual-w61-grouped-demand-and-taxonomy-20261015.v1.json) — all named research/editorial groups and current image-requiring source corpus entries, with distinct owner and unreviewed coverage fields.
- [W61 151 Atlas timeline events](../../data/research/sacred-visual-w61-canonical-bible-atlas-151-era-groups-20261015.v1.json) — every production Atlas event now transcribed from live `src/find/bible-atlas.js` + `bible-atlas-expanded-milestones.js` + `data/explore/bible-places-compact.v1.json`. 48 base sequence rows and before/after insertions produce exactly 151, with six declared narrative precedence adjustments. All **151/151 have titles and Scripture references**, and are grouped by canonical era; **not** one new picture was auto-selected. Maps must distinguish event region or traditional site from an exact historical scene location.

## Subject family structure

| Primary family | Existing master artwork records |
|---|---:|
| Biblical / Gospel sacred narrative | 102 |
| Our Lady / Marian depictions | 74 |
| Individual saints, apostles and holy people | 59 |
| Christ / Trinity | 23 |
| Groups of saints, martyrs or apostles | 9 |
| Eucharist / sacraments | 8 |
| Angels | 3 |
| Devotional theme | 2 |
| Liturgical feast | 1 |
| **Total** | **281** |

Each artwork has exactly one **provisional** principal family, but zero to many supporting subjects, persons, source references and module links. A Marian work may also depict a saint or Gospel scene; this is represented through secondary tags, **not duplicated painting objects**. Other media (site photography, maps, manuscripts, diagrams) live in their source-owning registries.

## Application coverage hierarchy (not summable counts)

| Area | Existing indexed inputs | What counts as a visual |
|---|---|---|
| **Calendar / Today** | 365 observed dates in 2026; 1962 resolver governs | At least one truthful principal image each date; prioritize proper/saint/Gospel; honest seasonal contextual fallback clearly differentiated |
| **Saints of the Day / Saints Map** | W59 historical 252 dates / 311 identity components, 87 legacy art rules; Saints pipeline 119 **name strings**, not 119 unique saints | Portrait, contemporary historical likeness or accurate incident painting for each individual; proper martyr-group picture for a collective entry. Avoid false portrait of ancient saints |
| **Rosary / Stations** | 20 Rosary mysteries incl. five Luminous as optional context in newer bridge; 14 Stations; 15 traditional mysteries + 14 Stations in the 235 subject dossier | Relevant story painting or other visually accurate presentation per mystery/station |
| **Prayer Library** | 48 prayer texts and image subject slots | At least one contextually appropriate visual each prayer; reuse shared subject art with controlled variety |
| **Novenas** | 16 in source inventory | Correct cover image; day-specific visuals where justified by the prayer content |
| **Other Devotions and Formation** | 20 editorial devotion subjects; individual Pray/Formation module routes require later runtime extraction | Module opening image, and targeted case imagery where it improves understanding; do not make up historical portraits or imagery for doctrinal debates |
| **Biblical Atlas map + timeline** | **151** production scenes, all now named and referenced, organised into 11 eras; separate **183** unmerged cinematic research scenes in 14 chapters | Every event/detail gets an accurate painting where one exists; otherwise a truthful historical/map visual, labelled regional, documentary or diagrammatic. An unlocated passage must not acquire an invented pin |
| **Sacred Geography / pilgrimage** | **258** physical place seed records; separately **750** staged physical-site candidates, **98** nonphysical routes/events (not all published) | An exact photo/historical view for each published site/detail or an honest cartographic placeholder pending one; relevant saint/feast painting can supplement but must not pretend to show the building |
| **Relics / Saints sites / Mass directory** | Existing separate module/source registries; per-route demand rows yet to extract | Site-specific image if identifiable; shared saint painting for persons; pin glyphs distinct from real photos |
| **Genealogy** | Research network of 3,231 people, not a gallery of historical portraits | Interactive graph family branch as the main visual. Historical likenesses only where warranted; no synthetic 'true' faces |

**Twenty-four** approved geographical media records were discovered across the existing place-media and gallery registers, attached to **19 distinct IDs among the 258 seed places**. This is **not** a new 19/258 coverage percentage for all published geography, because source registries and staged entries differ; verify per-user-visible pin in the next phase.

**Important scope boundaries:** 235 editorial subjects, 207 research acquisition targets, 281 artwork objects, 87 legacy saint rules and 83 Breviarium labels overlap. They must **not** be added together to claim a unique figure. The source-ledger 5-star score placement count is also not the number of image masters acquired or published.

## Priority of matching for the next audit

For every display demand, construct independent fields:
- `surface_id`: actual route, date, mystery, saint, prayer, map point or timeline event
- `subject_ids`: identity-linked saints, feast, biblical scene, devotion, place
- `candidate_artwork_ids`: single original IDs with relation `DEPICTS_EXACTLY`, `DEPICTS_SUBSCENE`, `SECONDARY_PERSON`, `CONTEXT_ONLY`, or `NOT_RELEVANT`
- `rating` and `rating_source`: existing human decision, with 0–2 physical-original blocks and prohibited artists always excluded
- `image_type`: painting, exact-site photo, manuscript/document or route/graph diagram
- `release_gate`: source identity, rights, original pixel/master, crop, curator and frontend visibility
- `coverage_status`: `APPROVED_VISUAL_EXACT`, `APPROVED_VISUAL_CONTEXTUAL`, `KNOWN_VISUAL_PENDING_REVIEW`, `VISUAL_IDENTIFIED_WRONG_OR_REJECTED`, `NO_KNOWN_VISUAL` or `NOT_AUDITED`

The calendar audit comes **after** this common vocabulary and categories, not before. The old "149 missing saint-feasts" remains an unverified old baseline, not a newly computed gap total. A 365/365 principal-image coverage target does **not** mean 365 different paintings, and 311 historical saint components do **not** necessarily mean 311 different works.

## Remaining classification prerequisites before date-by-date audit

1. Extract a live route/page list from current Pray, Formation, all map layers and their user-visible detail screens. Keep older prototype/research-only inventories distinct from published production routes.
2. Materialise all 311 historical saint components and the current calendar's sanctoral/day overlays as stable individual/group IDs; resolve name aliases and post-1960 saints in the explicitly labelled optional layer.
3. Create precise artifact/media ownership joins for previously approved photographs, old artwork ratings, W59, W48 and Breviarium; the latter's 83 individual Commons file identities still need validation.
4. Keep the 183 cinematic Bible research scenes separate from the 151 live events and adjudicate links before deduplicating their image slots.

**No missing-image percentage, new 'approved art', release changes, merged app branch, or new rating gallery has been claimed.**


## Final W61 grouping additions and validation

The separate grouped-originals register now also indexes all **481** W48 user review placements, with **73** observed person-subject IDs and **93** editorially selected artwork research records from the 235-subject index. They remain *placements/source identities*, not an extra 481 + 93 physical originals. Exactly **24** W48 candidate IDs match 281 canonical registry IDs by unchanged ID; other aliases need physical-object identity matching before they can inherit original-file or rating status. Of the 481 W48 placements, W49 resolves **86 as five-star placements**, **66 as four-star**, and **7 as 0–2**. These are placements, not unique distinct original paintings.

**Source-backed Atlas classification:** after reading the actual live 151-event sequence, all 151 have both EN titles and Scripture references, grouped by 11 eras: Origins 6; Patriarchs 12; Exodus 14; Israel and Prophets 13; Exile 21; Infancy 12; Public Ministry 31; Passion 11; Resurrection 6; Apostles 20; Revelation 5. The 183 separately researched cinematic scenes remain organised in 14 chapters; they must not be appended to the 151 as though those were 334 separately certified live timeline events.

**Validation:** 25 checked classification invariants passed, including 281 unique canonical artwork IDs and a one-to-one 281-family assignment, 481 review placements independently held, 235 editorial subjects, 207 research targets, 48 prayers, 16 novenas, 20 mysteries, 14 stations, 151 fully named timeline events, 183 research scenes, 258 place seeds and 750 unpublished candidate sites. No current per-date or per-route visual-ready coverage claims have been made.
