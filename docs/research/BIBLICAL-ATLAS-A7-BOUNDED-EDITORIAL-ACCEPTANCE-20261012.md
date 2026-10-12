# Biblical Atlas A7 — bounded editorial presentation decisions
**12 October 2026 · PR #1069 · Research/view acceptance only — NOT publication certification**

## Scope and source ownership
This A7 pass resolves **how five known disputes are to be displayed safely in the existing review interface**, not whether disputed events, dates, places, historical identifications, or image rights have been finally certified. Source-of-truth remains the one 151-milestone Atlas owner, with 181 separate comparative scenes, existing 90 Genesis edges, and research donor #1018; no alternative theatre, genealogy or map catalogue is introduced.

Five entries in `data/explore/biblical-atlas-editorial-holds.v1.json` now have an explicit `presentationDecision` with `DOCUMENTED_RESEARCH_VIEW_ONLY` status. Their `resolution` deliberately remains `HOLD`, and all unresolved questions remain searchable in the same registry. Do not convert this status into `APPROVED` or remove the visible research-only warning.

## Five decisions, with real source distinctions

| Hold | Bounded user-visible decision now controlled | Still withheld | Source |
|---|---|---|---|
| **John 2 Temple cleansing** (scene 74, canonical 82) | Keep John 2:13–22 after Cana in John's **narrative order**; qualification visible in both languages | Whether John and the Synoptics describe one historical cleansing or two, and precise dates | [John 2 primary text and notes (USCCB)](https://bible.usccb.org/bible/john/2), [Vulgate/Douay text (New Advent)](https://www.newadvent.org/bible/joh002.htm) |
| **John 20 empty tomb** (scene 131, canonical 120) | Narrate the empty tomb, Magdalene's encounter with the risen Christ and their biblical context | Representation of the exact instant of Resurrection **as though narrated by John 20**, or unlicensed artwork | [John 20 text](https://bible.usccb.org/bible/john/20) |
| **Luke 2 overlapping Temple/hidden life** (scene 68, canonical 76/77) | Temple finding is Luke 2:41–52; Luke 2:51–52 is the overlapping return to Nazareth; separate event keys and blocked ambiguous auto-hop | A second Temple finding or a fabricated one-to-one identity for two source events | [Luke 2 text and commentary](https://bible.usccb.org/bible/luke/2) |
| **Magi and Presentation** (scenes 63/64, canonical 72/71) | Newly added bilingual qualifications: two distinct biblical accounts by Matthew and Luke; displayed adjacent order is editorial **reading** order | Claim of a specific calendar date or universally resolved Magi→Presentation vs Presentation→Magi chronology or proved route | [Matthew 2](https://www.newadvent.org/bible/mat002.htm), [Luke 2](https://bible.usccb.org/bible/luke/2) |
| **Public ministry across four Gospels** (scene 74 and selected canonical source IDs) | The six existing source-defined *within-Gospel* precedence rules remain, with no global-dated harmony claim; original event keys survive position moves | A complete harmonised historical timeline, shared dating across Gospel episodes, inferred roads, or conflated events | [John 2 source commentary](https://bible.usccb.org/bible/john/2), [John 4](https://www.newadvent.org/bible/joh004.htm) |

The first three render decisions existed in the source branch before A7; this pass verifies them together, gives all five stable explicit policy text, and adds the missing Matthew/Luke caveats. **The evidence does not support releasing the 181-scene study as a complete historical theatre.**

## Unlocated chronology and phone visual correction
Opening **Creation** has zero evidenced geographic anchors. Display a compact Scripture-first reading composition rather than a visually dominant unfinished map. Source Bible text and native Scripture reader must remain reachable; never assign Creation coordinates. The map component remains mounted but visually suppressed while `atlasMapItems(stops,activeIndex)` is empty, retaining its existing map data and gestures. When the selected era acquires a genuine anchor, restore the existing map instead of building a second map reader. Do not infer an archaeological location from an adjacent narrative panel.

Acceptance checkpoints:
- On a 320/390px phone, Creation has `data-bible-unlocated=true`, a visible explanatory note, and a native Scripture-reading action; the loading basemap is visually suppressed.
- On a stage with source-qualified mapped anchors, `data-bible-unlocated=false`, the existing map is visible, and site-confidence warnings stay attached.
- Horizontal milestone/scene gestures, the 151 chronology, its 35 source-qualified anchor identities, independent genealogy/apostolic modes, and the native reader return are preserved.
- The dedicated 151↔181 crosswalk must still reject stale event keys and mismatched passage refs; ambiguous scene #68 remains non-jumpable.

## Release and provenance gates still OPEN
1. **GitHub integration:** Reconcile *the current* `main` with this draft branch, especially shared `package.json`, rerun source, 320/390px mobile, map, app convergence and mandatory mainline suites **on the final branch head**. Earlier green runs do not certify later commits. If `mergeable_state=dirty`, do not merge or close donor PRs.
2. **Catholic edition witness collation:** retain research #1018's [three verse-division cases](https://github.com/Fulcanelli13/ad-orientem/blob/research/biblical-people-genealogy-explorer-20261011/docs/research/BIBLICAL-ATLAS-CATHOLIC-EDITION-VERSE-DIVISIONS-20261012.md) until the adopted printed Crampon and Challoner witnesses are directly checked; distinguish absent import slots from absent authentic biblical text.
3. **Genealogy and geography:** Keep all unreconciled STEP donor relations, traditional apostolic journeys, and 25 research location candidates *out of public authoritative display*. Certify lineage edges and physical site IDs individually; a 151-event location context is not a claim that an occurrence took place at that exact coordinate.
4. **Art, theatre and rights:** The art-curation owner must match canonical event keys to approved original reproductions, source/copyright evidence, and historical depiction boundaries; no external art pixels were merged here. The 181-scene study remains `REVIEW_NOT_PRODUCTION_CERTIFIED`.
5. **Visual and manual acceptance:** The older 320px map-loading artifact is superseded only if a final-head screenshot actually shows the new unlocated layout without overflow; a green source-test alone is insufficient. Manual/aesthetic sign-off is separate.

## Decision
**A7 scoped presentation decisions are documented; five substantive editorial publication holds remain open.** This is an explicit separation between a *safe provisional reading view* and a *fully certified historical/visual Bible theatre*. The 151-event chronology could proceed through its own narrowed acceptance if every displayed statement is qualified and the current-branch regressions are green; 181-scene theatre, broad genealogy and sacred-art assets must not inherit a blanket sign-off from that narrower release.
