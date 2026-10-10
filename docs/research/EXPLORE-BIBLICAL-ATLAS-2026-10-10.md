# Biblical Atlas — Catholic Scripture places, figures, events and chronology

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
