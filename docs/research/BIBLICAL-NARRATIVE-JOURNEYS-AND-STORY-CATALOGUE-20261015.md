# Biblical Theatre — Story, Arc and Theme Classification (15 October 2026)

## Binding narrative authorship policy (15 October 2026)

**AI-written biblical narrative is rejected.** The 11 AI-authored bilingual pilot episodes were withdrawn from this draft PR. Biblical Theatre must display only **verbatim existing historical Catholic-author prose** from a verified public-domain or already licensed textual witness, or **the original Scripture text** from the native Catholic Bible reader. Do not create AI paraphrases, AI translations, AI-written summaries, transitions or synthetic prose blends. Different language editions must have their own verified authored witness; do not manufacture a French translation. No permission requests are to be made. If no suitable authored narrative covers a scene or connection, keep it source-only and mark the coverage gap. AI may assist with indexing and source metadata, but never as an uncredited Bible-history author.

**Status: research-only overlay in existing draft PR #1069. Not deployed, not an alternative chronology.**

## Governing decision

The user wants a readable *History of Salvation*, with smaller narrative arcs, individual stories and cross-era themes. The map, timeline, genealogy and narrative remain **one synchronized workspace** (compact/expandable panes on mobile). Continuous-reading position is saved per journey; exploratory jumps and Scripture chapter opens do not move that bookmark.

**One event, one canonical owner, multiple reading paths.** The 151 selected milestones of `src/find/bible-atlas.js` are unchanged. The 183 theatrical research scenes in `data/explore/biblical-cinematic-studies-review.v1.json` are unchanged. This overlay adds only IDs and ordering of journeys; all source text, locations, genealogy, artwork and Scripture references remain with their respective canonical owners.

## Machine-readable Phase 1 inventory

`data/explore/biblical-narrative-journeys-review.v1.json` contains:

- **11 existing eras**, using the production IDs unchanged (not the provisional 12-era outline).
- **10 proposed major arcs**, including History of Salvation, Story of Israel, Life of Christ, beginnings, and Apocalypse.
- **39 smaller stories**, with exactly **one primary story assigned to each of the 183 existing research scene IDs**. Those are research reading groups, not yet fully authored narrative chapters or reviewed Gospel harmonies.
- **9 cross-cutting thematic journeys**; scenes may be referenced by many themes without copies. Typological, doctrinal and historic correspondences explicitly require source review.
- A precise per-journey bookmark and context contract for the eventual UI. No reader or storage implementation is included.

The arcs centered on the 151-record chronology may include moments without theatrical scenes; the 39 stories **only** classify the existing 183 scene corpus. Do not mistake 100% research scene-classification for 100% Bible narrative coverage.

## Verified gaps from the existing A13 151-versus-183 ledger

| Canonical era | Canonical events | Identical citation scene | Overlap only | No scene candidate |
|---|---:|---:|---:|---:|
| ORIGINS | 6 | 0 | 0 | 6 |
| PATRIARCHS | 12 | 2 | 4 | 6 |
| EXODUS | 14 | 11 | 1 | 2 |
| ISRAEL | 13 | 0 | 0 | 13 |
| EXILE | 21 | 0 | 0 | 21 |
| INFANCY | 12 | 10 | 2 | 0 |
| PUBLIC | 31 | 23 | 3 | 5 |
| PASSION | 11 | 6 | 3 | 2 |
| RESURRECTION | 6 | 3 | 1 | 2 |
| APOSTLES | 20 | 12 | 3 | 5 |
| REVELATION | 5 | 0 | 0 | 5 |
| **Total** | **151** | **67** | **17** | **67** |

These columns count **canonical events**. Separately, among **183 scene records**, 67 have exact citations, 29 have overlapping citations and 87 have no direct match. Only 66 scene→milestone jumps satisfy the stricter unique/reversible navigation rule. Never conflate the two sets of denominators or treat citation identity as event/harmony identity.

**P0:** create scene/narrative treatments for the six Origins milestones, without geographic inventions.
**P1:** add kingdom/prophet and exile/restoration coverage for 34 canonical events (13+21), including the deuterocanonical books already covered by the canonical registry.
**P2:** fill the remaining patriarchal/Exodus and Gospel/Apostolic narrative gaps, source-check synoptic order and Catholic verse-number exceptions.
**P3:** handle Revelation as inspired prophetic visions, not an earthly chronological travel itinerary.

In addition, a continuous reading path needs verified existing Catholic-authored source text, or the biblical text itself where no suitable authored prose exists. Selected milestone coverage is not equivalent to a full retelling of all 73 books. Compare Knecht and Gilmour editions as *sources of structure* and possible rights-cleared wording only after edition and rights verification. Schuster's commercially published text is not licensed by this research.

## Interface and persistence contract

The **Narrative** pane presents a short chapter/episode, a discreet Scripture-reference control and an **Open full chapter** action through the existing native reader. The **Map**, **Timeline** and **Genealogy** panes stay present together, synced by canonical event ID and explicit qualified place/person links. A researched scene without a reversible exact link keeps the narrative visible but **does not** generate a fake event stop, kinship edge, pin or route.

The Stories library has three entry points: **Stories**, **Historical arcs**, **Themes**, plus a **Continue the whole story** option. Each story card shows truthful estimated reading time only after words are authored (no invented minutes). Reading bookmarks are keyed by `journeyId` and identify the existing `eventKey` or `sceneKey` plus paragraph anchor; chapter drill-down and free exploration preserve that cursor. Store locally in the pilot; device sync, if needed, is a later separate task. No streaks/gamification.

## Ownership and release boundaries

- Chronology: `main` via #1108, owned by `src/find/bible-atlas.js`.
- Scene corpus and optional research UI: this draft #1069.
- People, places and kinship research: donor #1018; problematic family relations remain blocked.
- Mass–Bible typology: #1082; link rather than duplicate.
- Scripture editions/parser: native reader and independent rights-gated #1229.
- Painting identities, provenance, licenses and subject mapping: Sacred Art owners.
- Earlier Explore "compact Bible Places" scope #923 is not overwritten; this records the user's renewed broader **Biblical Theatre** proposal as research only, with no navigation or deployed map changes.

**Release gates:** independent Catholic witness/verse-number review; approval of all cross-era typological links; no unsafe GPS or family assumptions; final rights-cleared narrative; mobile one-screen map–timeline–genealogy usability; native Scripture reader return; per-journey bookmark tests; genealogy/scene art approval. Current approval remains **HOLD**.

## Phase 2 next

Build the source-text continuity matrix: for every canonical event, assign one verified existing-author passage range or Scripture-only fallback, a reading-journey place, a Scripture witness and a documented connection to the next passage; mark uncovered or uncertain records as gaps, not complete stories. Extend the taxonomy only through existing stable identifiers. No duplicate scriptural scene database.
