# Canonical 383 Sacred Art → Scripture tagging (30 Oct 2026)

Research-only evidence, **not** a biblical-episode reader or Calendar day placement. Baseline: `data/calendar/sacred-art-curator-queues-383-20261029.v1.json` (`af29e19b4107762a5fff8b4ecdf5c1e7f6bee93c`) from `archive/sacred-art-master-20261030-v2`. Every one of the 383 stable canonical artwork IDs has a row, including historical exclusions without changing their state. This does not add the 548 Q2 artworks or the 856 Phase 1 review cards to the canonical gallery.

## Output
- `sacred-art-canonical383-scripture-tags-20261030.v1.json` — full painting-identity records and typed Scripture relationships
- `sacred-art-canonical383-scripture-links-20261030.csv` — flattened artwork/passage relationships for join/audit

## Counts
- Canonical records: **383**; distinct IDs: **383**
- Records with at least one tagged Scripture reference (direct or explicitly contextual): **374**
- Records with an identifiable direct biblical scene by title: **150**
- Records without a defensible Scripture match: **9**
- Typed artwork–reference relationships: **448**
- Status breakdown: {"CONTEXTUAL_MATCH_REQUIRES_EDITORIAL_CONFIRMATION":220,"DIRECT_SCENE_TITLE_MATCH_REQUIRES_IMAGE_QA":150,"UNMATCHED_NEEDS_RESEARCH":9,"AMBIGUOUS_SCENE_REQUIRES_IMAGE_QA":4}

## Editorial safety
- Scripture reference does **not** certify an exact painted scene, image source, art quality, human approval, or publication.
- Historical saints and miracles after the apostolic era are not biblical episodes. Their passages are marked thematically, not as depicted events.
- Assumption, Coronation, Immaculate Conception, Purgatory, Sacred Heart and similar subjects carry theological or typological relationships, never invented literal eyewitness verses.
- Non-biblical traditional Stations (falls, meeting Our Lady, Veronica) are explicitly tagged `TRADITIONAL_STATION_WITH_BIBLICAL_MEDITATION`; a biblical reflection does not turn them into direct Gospel scenes.
- Saint Mary Magdalene must not be silently identified with the unnamed sinner of Luke 7.
- Composite scenes and titles that conceal more than one event require native-image review.
- Calendar link arrays intentionally remain blank; next step is an editorial per-day mapping with precedence for the user's existing feast and module selections, not an automatic verse-overlap join.

## Example joins
- `commons-morlete-sacred-heart-1759` The Heart of Jesus: John 19:34 (DEVOTIONAL_DOCTRINAL_NOT_LITERAL_SCENE)
- `ART-ug-ne-elacroix-eliodorus-riven-from-the-emple` Heliodorus Driven from the Temple: 2 Machabees 3:24–36 (DIRECT_BIBLICAL_SCENE)
- `nga-46` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `nga-18` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `nga-50280` The Assumption of the Virgin: Apocalypse 12:1 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE); 1 Corinthians 15:52–54 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE)
- `nga-46470` The Assumption of the Virgin: Apocalypse 12:1 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE); 1 Corinthians 15:52–54 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE)
- `nga-46131` The Assumption of the Virgin: Apocalypse 12:1 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE); 1 Corinthians 15:52–54 (TYPOLOGICAL_DOCTRINAL_NOT_LITERAL_SCENE)
- `W07-007` Saint Jerome Writing (Borghese original): Ecclesiasticus 39:1–5 (POST_BIBLICAL_SAINT_THEMATIC_CONTEXT)
- `ART-usepe-de-ibera-aint-erome-riting` Saint Jerome Writing: Ecclesiasticus 39:1–5 (POST_BIBLICAL_SAINT_THEMATIC_CONTEXT)
- `ART-hilippe-de-hampaigne-he-nnunciation` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `ART-iandomenico-iepolo-an-olo-ia-rucis-tation-06-eronica-ipes-is-ace` San Polo Via Crucis — Station 06: Veronica Wipes His Face: Isaias 53:2–3 (TRADITIONAL_STATION_WITH_BIBLICAL_MEDITATION)
- `cma-122338` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `met-436791` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `met-436502` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
- `cma-127572` The Annunciation: Luke 1:26–38 (DIRECT_BIBLICAL_SCENE)
