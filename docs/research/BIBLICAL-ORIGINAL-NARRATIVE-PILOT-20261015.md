# Biblical Theatre: actual narrative prose pilot — 15 October 2026

**Owner:** existing draft Atlas research PR #1069. This is a genuine editorial prose trial, not a full Bible, published reader, or a reproduction of Knecht/Gilmour. No production code or canonical event records altered.

## What was written
`data/explore/biblical-original-narrative-pilot.v1.json` holds **11 original bilingual episode retellings, 22 anchored paragraph pairs**:
- **6 / 6 canonical Origins milestones**: Creation, Fall, Cain/Abel, Flood, covenant with Noah, Babel.
- **3 Kingdom/Israel samples**: David and Goliath, dedication of Solomon's Temple, division of the monarchy.
- **2 Exile/Restoration samples**: destruction of Jerusalem, return under Cyrus.

This covers **11 of 151 selected canonical milestones with draft prose** (7.3%, not approved). All 11 use the exact current `eventKey`, the Phase 2 proposed reading-chapter ID, bilingual English/French text and at least one direct Scripture reference for each paragraph. Primary narrative is separated from the older authors' commentary and from typology. The 6 Origins entries can be read consecutively as a draft sequence; additional Genesis 2, 6, 8, 9, 11 references supply continuity without adding fake milestone records.

The Kingdom/Exile passages are **discontinuous trials**, not a claim that their entire historical eras are now readable cover-to-cover. Three bridge leads are identified, but not written as approved copy.

## Actual source review, not simple metadata
**Knecht:** Read the transcription of the 1910 third English edition's **chapters I, IV–VIII**, plus chapters **LI, LIX, LXI, LXXV, LXXX** as source leads. The original has a useful explicit **narrative / commentary** split. Historical English-language printed pagination and wording remain uncollated; no historical prose copied. Chapter links and work/edition IDs are held in the JSON solely for handoff to source parser PR #1229.

**Gilmour:** Read the Heritage History mirror of the older `Bible History` narrative for **sections 1, 3, 5–8** and focused monarchy/exile sections. Its compact account and short end-of-lesson questions give a clear model of brevity, but the secondary mirror has not been independently compared line for line against the 1894 Benziger scan. Do not mark it a verified 1894 text edition. Avoid using the old absolute-year tables as current scholarly datings.

### Material explicitly **not** imported
- Gilmour section 5's typology that makes Cain stand for *the Jewish people* as collective agents of Christ's death; it is incompatible with **Nostra aetate §4 / CCC §597**. Likewise do not promote his section 56 equation of Israel/Samaria with Christian heresy, or a claim of collective Jewish rejection.
- The antiquated assignment of all the world's modern peoples to Noah's sons and exact pseudo-historical dating of Babel/Creation; these go beyond the cited passages.
- Ad hoc descriptions of the Flood or other events not anchored in the Scripture reference; no asserted modern coordinate or scientifically certain itinerary.
- Commentary presented as if it were verbatim inspired text, modern website wrapper text, images, or claim that the entire books are already rights-cleared.

## Reading product implications
The default read-through uses **Ad Orientem's original, source-linked connective narrative**, not an unlabeled clipped anthology of Bible verses. An optional **Open Scripture** opens the full native chapter, while **Read further** opens sources via the separate parser once its citation/rights gate is satisfied. Paragraph IDs are stable `eventKey:p1` and `eventKey:p2`. Existing story/arc/theme libraries link to those same paragraphs, with bookmark state keyed by journey rather than browsing position. Map, timeline, genealogy and text remain on one responsive screen; no geography is inferred where source evidence is insufficient.

## Next phase
- Proofread the 22 bilingual paragraph pairs against the native Douay/Challoner and Crampon witnesses, including Old Testament book-name aliases.
- Independently inspect and register Knecht/Gilmour *printed original* edition witnesses with #1229; avoid recreating its parser. No permissions are being requested.
- Draft the **remaining 140/151** milestone narrative treatments, prioritizing the remaining **10/13 Israel** and **19/21 Exile** cases. Then reconcile the full 73-book canonical coverage separately; 151 selected milestones alone cannot become a full 73-book abridgement.
- Build actual saved position and one-screen theatre in a later code phase, only after approving the narrative sample.

**Tests:** `tests/biblical-original-narrative-pilot.mjs` verifies 11 episode IDs, exact source ownership, 22 English/French paragraph pairs, accepted refs and restricted editorial status. The file is committed as an executable check; do not claim CI execution or editorial certification until run.
