# Biblical Theatre — continuous reading and coverage crosswalk
**15 October 2026 · research-only addition to existing draft PR #1069. No production data owner altered.**

## Binding narrative authorship policy (15 October 2026)

**AI-written biblical narrative is rejected.** The 11 AI-authored bilingual pilot episodes were withdrawn from this draft PR. Biblical Theatre must display only **verbatim existing historical Catholic-author prose** from a verified public-domain or already licensed textual witness, or **the original Scripture text** from the native Catholic Bible reader. Do not create AI paraphrases, AI translations, AI-written summaries, transitions or synthetic prose blends. Different language editions must have their own verified authored witness; do not manufacture a French translation. No permission requests are to be made. If no suitable authored narrative covers a scene or connection, keep it source-only and mark the coverage gap. AI may assist with indexing and source metadata, but never as an uncredited Bible-history author.

## Completed Phase 2 source reconciliation
Using the actual `src/find/bible-atlas.js` construction logic, all `151/151` canonical selected milestones were reconstructed from the existing compact Bible Places data, the expanded pre/post milestones, and the six source-defined within-Gospel precedence rules. Each resulting `eventKey` is unique, and all 151 era/title/reference/position tuples agree with the existing 151↔183 ledger. The derived data file contains these **actual canonical event keys**; no guessed IDs and no duplicate event records.

The main result is `data/explore/biblical-reading-continuity-review.v1.json`: **37 proposed readable chapter groups**, containing each canonical milestone **exactly once**, 150 consecutive editorial bridge checks, source-citation links into the existing 183-scene research inventory, and a 67-event priority queue for events without scene candidates. Group titles are editorial proposals; this is **not 37 finished narrative chapters**.

| Canonical milestone source-citation status | Events |
|---|---:|
| Identical passage in at least one research scene | 67 |
| Overlapping passage only, editorial review needed | 17 |
| No Theatre scene candidate | 67 |
| **Total** | **151** |

**Important denominator distinction:** 183 research *scene records* comprise 67 exact, 29 overlap, 87 no match; the figures in this table count **151 selected canonical milestones**. The existing automatic reversible navigation contract covers **66 scene-to-milestone matches**, and is not expanded here.

## Reading journey and stage design
- One **History of Salvation** path follows the 151 existing keys, divided into 37 smaller editorial chapters. The established **11 historical eras** remain unchanged.
- The previously committed **39 scene-derived primary stories**, **10 larger arcs**, and **9 candidate cross-era themes** stay as linked journeys. They reuse canonical events and scene identities instead of copying text or making new database rows.
- Reader view: persistent narrative pane + contemporaneous map + timeline + genealogy **within one screen**. Mobile uses compact expandable panes; no extra independent module or fake route point.
- `Continue Reading`: per-journey `eventKey/sceneKey`, stable paragraph anchor, translation/edition ID and scroll restoration, stored persistently on device. Free exploration, thematic jumps and opening a full Scripture chapter must preserve each journey's bookmark.
- Source-critical passages with no adequate mapped location remain Scripture-first; Gospel parallel chronology remains qualified; Wisdom/prophecy/Revelation retain their literary genre and are not turned into GPS-dated scenes.

## Existing-author source passages still to be selected
There are **150 neighbouring milestone pairs** in the selected canon path. The machine-readable register classifies them as: `PASSAGE_GAP` 35; `WITHIN_BOOK` 53; `ERA_TRANSITION` 10; `BOOK_TRANSITION` 52. These represent possible editorial transitions, **not 150 automatically required paragraphs or resolved omissions**. Each has `BRIDGE_AND_NARRATIVE_CONTINUITY_NOT_REVIEWED` and `bridgeProse:null` until a real source-checked narrative is written.

At present **none of the 37 proposed reader chapters contains an approved abridged source text in this addition**. Assigning a chapter ID must never be mistaken for finishing the literary work. Scripture passages remain available in the existing native reader.

### High-priority uncovered subject areas
- **ORIGINS:** 6 canonical events without cinematic research scenes; Creation, Fall, Flood, covenant and Babel require a genre-sensitive narrative, no fabricated coordinates.
- **ISRAEL:** 13 uncovered canonical events; Samuel, David, Solomon, divided monarchy, Elias, prophets and Temple history.
- **EXILE:** 21 uncovered canonical events; the dossier mixes narrative, deuterocanonical, wisdom and prophetic units. Do **not** claim their published order is an exact chronological timetable.
- Remaining 27 uncovered events belong to Patriarchs, Exodus, Public Ministry, Passion, Resurrection, Apostles and Revelation. All five Revelation units are visionary, not reconstructed earthly geography.
- **A special editorial issue:** Old Testament poetic, deuterocanonical and wisdom material must be inserted appropriately without pretending every biblical book is a narrative chapter. The current 151-selected milestone path is not comprehensive coverage of 73 canonical books.

## Abridged Catholic Bible witness shortlist
1. **Friedrich Justus Knecht**, *A Practical Commentary on Holy Scripture*, **1910 third English edition**, B. Herder, 839 pages. Source: https://openlibrary.org/books/OL7130336M/A_practical_commentary_on_Holy_Scripture . Strong narrative-plus-Catholic-commentary source candidate. The scanned edition must be aligned to exact chapters and cross-checked for paragraph boundaries before use.
2. **Bishop Richard Gilmour**, *Bible History*, **1894 Benziger Brothers**, 320 pages. Source: https://openlibrary.org/books/OL7069753M/Bible_history . Concise Catholic retelling benchmark; compare against Knecht for omission and readability.

US public-domain general term reference: https://guides.library.cornell.edu/copyright/publicdomain (pre-1931 works in US public domain). **This is not worldwide rights clearance** for app redistribution, not a scanned-witness accuracy certificate, and not a licence for modern reprints or introductions. Record author, edition, witness, paragraph and rights status in the shared **source parsing** pipeline (#1229); do not establish a duplicate parser. In particular, historical theological commentary is not identical with the underlying inspired Scripture.

## Test and release controls
`tests/biblical-reading-continuity-review.mjs` independently rebuilds the 151 canonical stops through `buildBibleAtlas`, checks **exact event-key and reference identity**, 1:1 reading chapter coverage, source candidate relation validity, 150 chained transitions and absence of unauthorized invented narrative/art/coordinates. Run with Node in CI after the file lands. No new production map/reader, source text or images have been shipped; no claim of browser/device acceptance. Approval **HOLD**.

## Next work
Collate the exact Knecht/Gilmour editions against a manageable 4–5-event sample in Creation, Exodus, David, Nativity and Resurrection. Mark which source actually supplies bridging narration, Scripture-only coverage or interpretative commentary. Then select, collate and review existing authors' exact passages, with paragraph anchors, first in Creation → Flood → Babel and the monarchy/exile segments. Where a suitable source passage is absent, show Scripture itself rather than writing a substitute. Only when coherent story text exists should reader-chapter cards display actual reading times. Follow this with one-screen UI integration and persistent-bookmark device tests; no production merge before editorial approval.
