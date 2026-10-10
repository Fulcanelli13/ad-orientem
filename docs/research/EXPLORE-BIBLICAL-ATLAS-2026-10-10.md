# Biblical Atlas — Catholic Scripture places, figures, events and chronology

## Product scope freeze — compact Bible Places feature (10 October 2026)

**This scope supersedes earlier ambitious all-places Biblical Atlas UI proposals in this document.** Ad Orientem's centre remains the Mass, prayers and Catholic formation. The biblical geography component must be **small, useful and visually subordinate** within Explore, not a parallel biblical-education product.

**Shipping target:** one **“Bible Places”** entry point inside existing Explore; initially **40 curated major sites and biblical landscapes**, rather than thousands of rows. A source-backed [40-site shortlist](../../data/geography/research/bible-places-compact-mvp-2026-10-10.v1.json) is committed for review: 15 Old Testament, four deuterocanonical, 13 events/places from the Life of Christ and eight from the Apostolic Church. **These are 40 editorial candidates from the quarantined 90-case pilot, not published/approved entries yet**.

**Each card:** place name; a maximum of **two concise event-description sentences**; *broad period/century* when historically supportable, else “date uncertain”; principal biblical person(s); **one or two key in-app Scripture passages**. A single option opens the **existing** Scripture passage reader and returns to the same Explore card. Use existing map/List/Place infrastructure with a marker only where credible physical location evidence permits. Two optional list filters (Testament and person/event search) are enough; grouping by Old Testament, deuterocanonical, Life of Christ and Apostles does not require four new top-level navigation routes.

**Excluded from the initial UI:** full 1,342-place gazetteer, 3,232-person biographies, searchable complete verse occurrence index, historical timeline slider, full-screen standalone Atlas app, detailed Paul route animations, ancient borders, deep historical controversies, complete 73-book toponym acquisition as launch dependency, copied map art or reconstructed biblical walking tracks.

**Reuse of already imported 2026 corpus:** the full OpenBible/STEPBible research import remains **backstage data** for provenance, source disambiguation and future expansion. It is **not** bundled wholesale in the production app and imposes **no requirement to build a large Atlas interface**. Only a small reviewed runtime selection should ship.

**Delivery order:** (1) 40-item editorial source validation, shared-Place reconciliation and Bible edition links; (2) compact Explore screen/card with existing UI components, a Bible passage deep link and mobile return behaviour; (3) small phone acceptance test for locations of Our Lord, patriarchs, prophets, Maccabees and Apostles. Feature freeze thereafter unless a clear user need justifies additional places.

**Status:** feature selection and requirements committed to draft PR #923, **no production UI or maps shipped**. The remainder of this document describes an archival long-range vision only; it is **not** the current app scope.

---


## Import completed — pinned upstream data (10 October 2026)

**The earlier "not yet imported" statements below are superseded by this completed acquisition.** The research-only master data is now in the existing draft PR, independent of the native app runtime.

| Dataset | Actual records imported | Notes |
| --- | ---: | --- |
| [OpenBible ancient places](../../data/geography/research/vendor/openbible/ancient-01.jsonl) (five shards) | **1,342** | 8,742 place–verse addresses, in **61 books**; alternate modern identity hypotheses and source IDs retained |
| [OpenBible modern place candidates](../../data/geography/research/vendor/openbible/modern-01.jsonl) (six shards) | **1,596** | Original lon/lat retained as **research-only** modern location hints, not approved canonical map pins |
| [OpenBible source bibliography](../../data/geography/research/vendor/openbible/source.jsonl) | **442** | Original source IDs, authors, editions and URLs; these are distinct from the separate Explore 51-reference thematic bibliography |
| [OpenBible geometry metadata](../../data/geography/research/vendor/openbible/geometry.jsonl) | **588** | Polygon/river/complex geometry metadata, not displayable features or embedded map shapes on its own |
| [STEPBible-derived place entries](../../data/geography/research/vendor/stepbible/places-01.jsonl) (four shards) | **1,016** | Names, Greek/Hebrew forms, Strong IDs, source verses, Pleiades/Wikidata hints; descriptions and independent coordinates deliberately excluded |
| [STEPBible-derived person entries](../../data/geography/research/vendor/stepbible/persons-01.jsonl) (nine shards) | **3,232** | Individual name disambiguation and kinship references; one repeated upstream ID `Malchijah_Ezr.10.25` remains on hold |

**Provenance, pinned upstream revisions and rights:** [complete import manifest](../../data/geography/research/biblical-atlas-vendor-import-manifest-2026-10-10.v1.json). Original upstream Git blob IDs let us reproduce and compare full raw input without adding 11.6 MB ancient/3.2 MB modern unprocessed files to Ad Orientem. OpenBible 2026 source commit `7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f`. The STEPBible place/person adaptation is [PatristicTextArchive's 2024 snapshot](https://github.com/PatristicTextArchive/tipnr_data), **not** automatically identical to the current 2026 master TIPNR.

### Real cross-source reconciliation

The [all-1,016 place-name comparison](../../data/geography/research/biblical-atlas-step-openbible-crosswalk-2026-10-10.v1.json) matches TIPNR place names to OpenBible ancient identities and verifies shared explicit Scripture verse references after normalizing book abbreviations:

| Source crosswalk status | Records |
| --- | ---: |
| Single name **and Scripture-verse** candidate | **899** |
| Multiple plausible same-name + verse candidates | **69** |
| No matching OpenBible title | **44** |
| Name match without shared verse evidence | **4** |
| **Total** | **1,016** |

The 899 are **strong research candidates, not ratified equivalence relationships or app Place IDs**. Name collision is particularly common in biblical cities with reused names, multiple regional senses, and building/site subfeatures; 69 remain explicitly ambiguous. All original canonical identity and physical-place decisions remain held. Foreign-key checks of the normalized data passed: **1,342/1,342 unique ancient IDs, 1,596/1,596 unique modern IDs, zero broken ancient–modern links**. The single known duplicate personal name is preserved rather than silently deduped.

### Actual 73-book coverage state

[Book-code mapping against the live `src/scripture/canon.js`](../../data/geography/research/biblical-atlas-book-code-map-2026-10-10.v1.json) identifies **61 of 73 canonical books with one or more source geocoded verse mentions**. The 12 books with no imported OpenBible place mentions are **Tobit, Judith, 1 Maccabees, 2 Maccabees, Wisdom, Sirach, Baruch, Philemon, James, and 1/2/3 John**. Some genuinely might have no separately geocoded place references; they require a content audit and must **not** automatically become 12 "missing-site" failures. Esther/Daniel's deuterocanonical Greek additions require a separate version-alignment pass regardless.

This is **61/73 book presence, not 83.6% of all biblical places completed**. Imported location-reference completeness is not certified until 73-book supplement + edition versification + place-sense audit.

### Remaining integration gates (non-negotiable)

1. **Catholic 73-book delta:** scan the seven deuterocanonical books and Greek additions, excluding spurious new locations and retaining original canonical verse-reference formats.
2. **Modern geographical links:** compare OpenBible's 1,596 possible modern records and source scores with existing Ad Orientem physical `Place` owners. Do not automatically publish biblical locations; retain rivers, broad regions, historically displaced settlements, unknown sites and competing localisations.
3. **STEP name-vs-verse exceptions:** review the 69 ambiguous, 44 missing, four name-only and one duplicate person ID against actual primary data, before joining to person profiles or geographical identities.
4. **Experience:** create an atlas browse/search and contextual-place sheet inside Explore/Scripture **only after data and version-alignment acceptance**. The native 73-book Scripture reader remains authoritative for passage text, highlighting, language and commentary.
5. **Copyright:** preserve CC BY 4.0 credits to OpenBible and STEPBible, credit the Patristic Text Archive adapter, review **OpenStreetMap-derived ODbL** obligations before shipping coordinate/geometry data, and source original user-facing historical descriptions independently. Imported vendor narratives/images were excluded.

**No production Biblical Atlas UI, source text, ancient-map pins, release approval, or reader integration was changed by this acquisition batch.**

---


## Decision: adopt existing biblical atlases, do not hand-build a new corpus

**Supersedes the manual-seed approach in older sections below.** Following a review of public projects on 10 October 2026, the original **90 manually drafted place/event illustrations have been quarantined** and explicitly prohibited as an authoritative master gazetteer or production import. They can only demonstrate desired fields and reader behaviour after verification. There is no justification for drafting hundreds of biblical toponyms individually.

**Primary data import:** [OpenBible.info Bible-Geocoding-Data](https://github.com/openbibleinfo/Bible-Geocoding-Data) already publishes a documented **1,342 ancient scriptural place entries, 1,596 modern identification records and 442 source entries** (2021 release figures; actual counts must be verified against a pinned current commit). The core under **CC BY 4.0** includes ancient/modern equivalences, alternative scholarly identifications, probable areas, verse references, modern geography and scholarly witness pointers. ODbL rules apply to OpenStreetMap-derived material; image rights are separately listed. This is the default gazetteer. It is a **66-book Protestant source**, hence **Catholic 73-book enrichment** is required, but not rewriting its first 1,342 entries.

**People and name identities:** [STEPBible TIPNR and TVTMS](https://github.com/STEPBible/STEPBible-Data), root README **CC BY 4.0**, provide individual person/place identities, original-language name forms, verse citations, and translation versification methods. The [Patristic Text Archive already converted TIPNR into JSON/XML and connected some places to Pleiades](https://github.com/PatristicTextArchive/tipnr_data). Prefer reuse and comparison with this existing converter over engineering name parsing from scratch. The exact pinned file source/version/right to redistribute must be preserved. TIPNR's long AI-generated biographical prose must **not** be copied into a sourced Catholic educational module.

**Existing full interface and optional online API:** [Bible Atlas](https://bible-atlas.com/) advertises **3,067 people, 1,274 places, 450 events, and 66 books** and provides a documented [public keyless verse-context API and embeddable verse UI](https://bible-atlas.com/developers). It already covers the user's desired people–places–events navigation; use as inspiration and potentially as an optional online enrichment. Its **free public API is not evidence of a CC-licensed bulk downloadable database**; do not silently import the complete narrative/graph into a commercial/offline app without a rights grant, and don't substitute an iframe for the existing in-app Scripture reader.

**Why not simply copy the ready-made Atlas product?** Its theology, chronology, data completeness and source/licensing assumptions are specific to its production; Ad Orientem requires the **Catholic canon**, Catholic historical context and original source support, retained native reader, source provenance and robust offline operation. Only **Catholic-specific differences**, original-site editorial context, translation alignment and the application's own presentation require our work.

### Revised execution sequence

1. Materialise a **pinned OpenBible ancient + modern + geometry + source** corpus with an import-only ingestion pass and full source/license manifest. The >1MB GitHub Contents response previously returned empty; the workaround is now complete using GitHub Git-blob acquisition. Pinned sources are imported and transformed into sharded research JSONL.
2. Count exact imported ancient place entities, verse links, modern site hypotheses and uncertain/unmapped entries. Count neither worldwide Catholic completeness nor unique map pins until dedup/site taxonomy.
3. Materialise current pinned STEPBible TIPNR / relevant TVTMS mappings; attempt existing [PTA format adaptation](https://github.com/PatristicTextArchive/tipnr_data) first, then join by linked source IDs with source-ambiguity flags.
4. Compare source locations to existing Scripture's **73-book** canon, physical `Place` registry and Europe seven-wave leads; **only supplement Catholic deuterocanonical and Greek-additions mentions**, plus novel site tradition and sourced chronological descriptions.
5. Optional provider evaluation: test Bible Atlas public [verse-context endpoint](https://bible-atlas.com/developers) for online event references, avoiding theological and legal assumptions. The native Ad Orientem Passage / Full chapter / Commentary reader remains the sole Bible-text owner.
6. Demonstrate with a small sample, then only implement Explore and native reader UI when provenance, canonical identity, licensing and phone navigation regressions pass.

**Historical pre-import state (superseded by the import-completed section above):** the prior 90-example JSON is marked `QUARANTINED_REFERENCE_SCENARIOS_SUPERSEDED_BY_EXISTING_OPEN_DATA_ADOPTION`; OpenBible master source **not yet downloaded into the repository**, STEPBible TIPNR **not yet imported**, and no production Biblical Atlas UI or canonical pins published. The number of actual imported master places is **zero**, not 90 or 1,342. This makes the next action an acquisition/integration rather than new research prose.

---

**10 October 2026 — research/specification only.** Extends the source-first Explore research [draft #923](https://github.com/Fulcanelli13/ad-orientem/pull/923). **Not a new Bible reader; not a published new Explore route; no new live map pins.**

## Vision and navigation

Let a reader discover **every identifiable place named in the 73-book Catholic Bible**, wherever Scripture occurs, without leaving Ad Orientem. The entry to the atlas should be an intentional **Biblical Atlas** collection inside the existing Explore/Sacred Geography area (not a seventh global Explore map category). Its content is also opened inline from Scripture, the 1962 Mass readings and Formation.

Primary paths:
1. **Place first:** type Nazareth, Jerusalem, Nineveh or Bethlehem; open a succinct historical/site card, show the map only for evidence-based modern localisations, the passages in chronological/scriptural order, people associated with the place, events and a historical period range.
2. **Scripture first:** when reading Luke 1:26–38, tap the named place to open *Nazareth* as an in-app context sheet; retain verse, language, book and scroll/focus; show "read whole passage" and "commentary" in the existing Scripture overlay, and return exactly to the invocation.
3. **Person first:** tap Abraham, Moses, David, Ruth, Our Lady, Christ, St Peter, St Paul or St John; inspect an attested sequence of places/events. A journey route line requires original textual itinerary/order and independent cartography; never infer historic GPS geometry from points.
4. **Historical period first:** Patriarchs, Exodus/wilderness, Judges, united monarchy, divided kingdoms, Exile/Return, Maccabees, Life of Christ, Apostolic missions, Apocalypse; a chronological slider and book filter show *approximate* contemporary geography without anachronistic political boundaries.
5. **Book first:** Genesis through Revelation, including **Tobit, Judith, Wisdom, Sirach, Baruch, 1/2 Maccabees and Catholic additions to Esther and Daniel**. Show all named place references where they occur. Some books may have no concrete geolocatable named places; that is a valid audited result rather than a missing feature.

### Sample user-facing site

**Nazareth — Galilee**

*What happened:* In Nazareth the Angel Gabriel announced the Incarnation to the Virgin Mary (Luke 1:26–38). Later Jesus read in the synagogue and addressed his fellow townspeople (Luke 4:16–30).

*When:* c. first century BC/AD, with separate historical estimates for the Annunciation and early public ministry. No exact year is provided by the scriptural text. Treat dates as historically estimated, not canonical feast dates.

*Who:* Our Lord Jesus Christ; the Blessed Virgin Mary; Gabriel. Distinguish the Luke 1 announcement, Jesus' childhood and later public ministry as **separate events** linked to the same ancient city.

*Read:* [Luke 1:26–38] and [Luke 4:16–30] through the existing in-app passage/chapter/commentary reader, retaining the user's Douay–Rheims, CPDV or Crampon selection and any edition warning. An original-source map location may be shown with explicit archaeological/historical confidence.

## Canonical data model — five joined concepts

`BiblicalPlace` = **ancient scriptural place sense**, aliases, original-language name(s), explicit text references, type `city | region | river | mountain | sea | island | road | camp | building | well | site | symbolic`. An ancient Place is **not itself** `place:XX:...`, the modern geographic identity in Explore.

`BiblicalMention` = **book + chapter + verse range**, mention kind `EXPLICIT_NAME | UNNAMED_CONTEXT | TRADITIONAL_IDENTIFICATION | VISIONARY_SYMBOLIC`, literary context and edition-safe mapping. Most location names require an explicit text ref; named modern churches such as *Basilica of the Annunciation* are postbiblical archaeological/pilgrimage associations, not entities literally named in Luke.

`BiblicalEvent` = event ID, short sourced description, biblical passage(s), one or more `BiblicalPlace` IDs, historical period, associated persons. Examples: Abraham's departure, Sinai theophany, Ruth's return to Bethlehem, David at Hebron and Jerusalem, Elijah on Carmel, Tobit in Nineveh and Ecbatana, Judith's Bethulia, Maccabean battles, the Annunciation, the Baptism, Passion, Pentecost and Paul's journeys.

`BiblicalPerson` = stable identity for a named figure (e.g. **John the Baptist versus John the Apostle**; different Marys and different biblical Josephs). Preserve distinct persons with the same surface name; related people/places must be linked through explicit biblical events/mentions, not name heuristics.

`HistoricalLocationHypothesis` = mapping from ancient `BiblicalPlace` to possible modern `SharedPlace` or geographic shape, original evidence, archaeological/traditional/confidence status and date window. Each biblical place may have **zero, one or many** proposed modern locations. Exact pin, approximate area, alternate sites and not mappable are separate states.

Subsites should be explicit: `Jerusalem` ancient city → physical **Holy Sepulchre** shared Place → **Golgotha** and **Christ's Tomb** subordinate spatial features. Cenacle and nearby Franciscan Ad Coenaculum are distinct facilities. Emmaus in 1 Maccabees 3–4 and Emmaus in Luke 24 are distinct **textual contexts** even when a modern historical identification could overlap.

## Chronology is an evidence problem, not a date-decoration feature

- **Biblical text** and **historical reconstruction** are separate sources. Matthew's "in the days of King Herod" is textual; a circa-birth year derives from extra-biblical historical synchronisms.
- **Patriarchal and Exodus years:** leave numerical dates blank or qualified where scholarship disputes them. Do not present a "creation year", a single exact Exodus year, Eden coordinate or Noah's ark peak as established biblical archaeology.
- **Israelite monarchy, Exile, Persian Empire and Maccabees:** place in historically sourced approximate intervals as appropriate, but events and figures within a region still need their own evidence.
- **Jesus:** represent birth, childhood, ministry, death and Resurrection as separate events with historically debated year choices (e.g. crucifixion around AD 30 or AD 33 depending chronology); avoid treating every Gospel location as a stop on one reliably reconstructible chronological walk.
- **Paul and Apostles:** broad 1st-century AD; certain synchronisms such as Gallio in Corinth can narrow date windows but route chronology must be cited to Acts and scholarship.
- **Visionary/symbolic places** such as the *New Jerusalem* remain searchable in the literary atlas without any earthly coordinates.
- **A date, a feast, an archaeological stratum, a pilgrim tradition and a reconstructed biblical event are different record attributes**, not interchangeable "year" fields.

## Data acquisition: broad coverage without a record-by-record manual crawl

| Source / owner | Use | Limitation / licensing |
| --- | --- | --- |
| [OpenBible.info Geocoding](https://github.com/openbibleinfo/Bible-Geocoding-Data) | Primary *bulk discovery* feed for ancient places, verse references, alternate locations and confidence annotations. Its separate modern-place layer supports map geometry and competing location hypotheses. | **CC BY 4.0**, OSM-based geometry may carry ODbL, images independently licensed. **Protestant 66-book corpus**, not Catholic 73. Website search's 2,938 count includes **ancient and modern entries combined**, **not** unique biblical places or a valid Catholic completion denominator. |
| [STEPBible TIPNR](https://stepbible.github.io/STEPBible-Data/) | Personal-name vs location disambiguation, Hebrew/Greek aliases, references, figure relationships. | Current root licence **CC BY 4.0**; recheck the exact file and pinned commit before redistribution. Some recent *article-length descriptions were AI-generated* according to upstream; do not blindly copy educational prose. ESV-centric references and LXX supplements need original corpus coverage audit. |
| Existing [Ad Orientem Scripture canon](../../src/scripture/canon.js) and [chapter limits](../../src/scripture/chapter-counts.js) | 73-book IDs; Douay–Rheims/Crampon/CPDV versification and chapter boundaries. | Must preserve Esther 16, Daniel 14, Baruch 6, Psalter/Song of Songs verse differences; do not silently shift chapter/verse ranges. |
| [Franciscan Custody](https://www.custodia.org/en/santuari/) | Source identity and history for 27 original Holy Land sanctuary-directory entries. | A traditional pilgrimage church is not necessarily the ancient location that Scripture itself names. Attribution and copyright restrictions remain. |
| Individual biblical passages, primary local custodians and qualified scholarship | Short event summaries, responsible date ranges, high-confidence identifications. | Every user-facing factual assertion gets a traceable citation. Biblically unnamed places and divergent traditions must be labelled. |

### Book completeness and imported-source identity

The corpus has **73 canonical Catholic books**, not 66. Bulk biblical geodata acquired from OpenBible must be crosswalked to the full book census and audited for the seven Catholic-only books and Greek additions. A book's **zero explicit geographic toponyms** is a legitimate audited outcome, while a book with uninspected verse text is not. The full target should be **all identifiable named and descriptive geographic referents**, not "2,938 pins."

No text of Douay–Rheims, Crampon or CPDV should be copied into the geography dataset. The existing Scripture reader is the sole edition/text owner; an atlas reference is a typed normalized address into that reader. The current [source-witness README](../../data/scripture/witness/README.md) notes ongoing edition collation. The concurrent [73-book Douay source-witness PR #932](https://github.com/Fulcanelli13/ad-orientem/pull/932) must not be duplicated or overwritten.

## Completed first research corpus (not yet displayed in the app)

The [90-record educational core](../../data/geography/research/biblical-atlas-core-2026-10-10.v1.json) records:
- **90** ancient geography/place-sense/landscape research entries;
- **128** passage reference spans validated for canonical book ID, chapter maximum and numeric range (not source-edition word alignment);
- **91** distinct plain-text figure labels (not yet deduplicated canonical people identities);
- passages in **27 of 73** canonical books (**37.0% have at least one curated example**; this is **not** 37% of all biblical places or verse occurrences);
- explicit source/chronology/modern coordinate **hold** for each record. No public pins or UI modifications.

The [source/canon census](../../data/geography/research/biblical-atlas-source-census-2026-10-10.v1.json) keeps bulk-feed accession, rights and the **46 books not yet represented by the pilot** separate from any declaration of a complete inventory.

## Acceptance gates

1. **Data:** exact upstream files + pinned SHA/rights; count distinct ancient place identities vs modern positions. Import full 66-book text mentions as referenced names only, then supplement and audit all 73 Catholic books.
2. **Names/links:** canonical biblical IDs, person distinctions, city/town/region vs sanctuary subfeatures; crosswalk to existing 182 shared Places and 232 Europe research leads with one physical site = one Place.
3. **Claims:** each event has biblical passage, sourced chronology, figures and a qualified identification; disputed sites and symbolism are not automatically mapped.
4. **Experience:** in-app browse/search by place, person, event, book and historical period; from any Mass/Scripture/Formation reference, open context within the same mobile reader, then return to precisely the original passage and scroll position.
5. **Testing:** no silent deuterocanon omissions; fail on invalid book/chapter/verse pointers; identify 73-book edition exceptions, missing verses and alternate localisations; unique ID/foreign-key integrity; independent dates, routes and image licences checked; end-to-end 390px phone scenarios for Nazareth, Ruth's Bethlehem, Maccabean Emmaus, Babylon, Acts/Paul and an unmappable biblical place.

**Product recommendation:** make Biblical Atlas an elegant, primarily text-and-map Explore module and a contextual **sheet inside existing Scripture**. Never make the user open Wikipedia or a generic browser page to see Scripture text, person/event context or available original Catholic commentary. A source link is supplementary provenance, not the reading destination.
