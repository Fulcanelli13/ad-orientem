# Ad Orientem — Scripture story reader v3: 30-story research review
**16 October 2026 · Draft research PR #1069 · Source text comparison only, not approved Bible pack**

## Goal and scope
Expand the existing **story-first**, intentionally selective Catholic Scripture path so users can understand coherent biblical events and then decide to read further. **Do not** reintroduce mandatory 73-book completion or impose 264/299 units. **Do not change** the agreed Bible editions, the 151 Atlas IDs, 37 reading sections, 460 publisher reference rows, Mass or production Bible reader.

### Current deliverables
- `data/explore/biblical-story-scripture-three-edition-witness-collation.v3.json`: **30 story review records** in natural Atlas progression, **92 scope options**, **29 distinct source chapters**, **87 chapter×edition extracts**, **3,708 original numbered verse strings**. 14 previous stories preserved and 16 new story candidates.
- `data/explore/biblical-story-scripture-review-offline.v3.html`: one self-contained (~580 KB) offline interactive review tool, with inlined source Scripture text, story search, previous/next navigation, selectable coherent/short/context scopes and their context risks; CPDV English initially selected with optional Challoner English, plus Crampon French. Scores/notes/verdicts are **per excerpt option**, rank is **per story**, JSON review export/import is version 3 (accepts v2 review exports). Local draft storage is optional, and no network script is loaded.
- `tests/biblical-story-scripture-three-edition-review-v3.mjs`: intended to lock the exact source chapter cells against the original `UNCOLLATED_SOURCE_WITNESS` repository files, story IDs/parent associations, preservation of the first 14 options, 92 scope options, number warnings, valid embedded inline script and no final approved passages.

## Sixteen added stories
1. Creation and man created in God's image — Genesis 1:1–31.
2. The call of Abraham — Genesis 12:1–9.
3. Joseph betrayed and sold — Genesis 37:18–36, paired with Joseph's reconciliation in Genesis 45.
4. Moses at the burning bush — Exodus 3:1–15.
5. Crossing the Red Sea — Exodus 14:15–31, with Exodus 14:5–14 as preceding context option.
6. David and Goliath — 1 Samuel 17:1–54, internal sections rather than compulsory multiple lessons.
7. Elijah on Carmel — 1 Kings 18:19–39.
8. Judith delivers her people — Judith 13:1–20 *as a cross-witness common research unit only*.
9. Susanna vindicated — Daniel 13:1–64.
10. Birth of Christ and worship of the shepherds — Luke 2:1–20.
11. Cana — John 2:1–11.
12. Samaritan woman — John 4:4–26.
13. Good Samaritan — Luke 10:25–37 (existing supplemental candidate 033).
14. Prodigal Son — Luke 15:11–32 (existing supplemental candidate 034).
15. Agony in Gethsemane — Matthew 26:36–46.
16. Road to Emmaus — Luke 24:13–35.

The original 14 remain in the same underlying JSON and all their excerpt choices are unchanged. The programme is intentionally selective: narrative continuity, meaning, typology and interest outrank book-count quotas.

## Critical cross-translation research findings
- **John 6:** CPDV/Challoner 72 slots vs Crampon 71. English slots 51–52 combine in French 51, then downstream labels shift. Peter's confession differs meaningfully in French and English; the review displays each source verbatim and the range crosswalk is explicitly provisional.
- **Genesis 3:15:** Challoner has Marian-tradition "she shall crush" and Crampon "celle-ci te meurtrira". Preserve original words and theological/witness labels.
- **Judith 13:** CPDV and Challoner store **31** verses; Crampon stores **20**. The new main story choice deliberately stops at shared **1–20** (Judith acts and returns) rather than pretending that French 1–20 maps to all English 1–31. Longer chapter-based equivalence requires printed-edition collation.
- **Daniel 13:** CPDV/Challoner **65** vs Crampon **64**. The succession transition in English 13:65 is incorporated at the end of French 13:64. Susanna ends naturally without treating these ending labels as identical.
- **Half-verse liturgical short forms:** Genesis 22:9a and John 11:33b cannot be reconstructed exactly from whole-verse imported witness records. Short-form previews include the containing full verse and conspicuously warn that this is an *approximation*, not the exact printed liturgical choice.

## Boundaries, quality gates and caveats
The source files are labelled **`UNCOLLATED_SOURCE_WITNESS`**; the appearance of verses in the offline research HTML is **not** certification against printed Challoner, Crampon or the original CPDV author master, nor proof that those candidate pack texts are authorised for release. No Bible translations have been reselected. The app catalogue's English traditional default remains Challoner, with CPDV the already user-approved contemporary alternative. The independent reviewer starts with CPDV for readability. The standalone HTML is not the app reader.

The 92 choices mix original complete story anchors, internal beats, optional context and previously published reading cuts. **Research proposals are labelled; they are not all 92 verified publisher abridgements.** Ratings are editorial preferences only, not approval for liturgical reading, publication or automatic Scripture replacements.

No Scripture passage has been given a final approved range, and no canonical Atlas IDs, source rows or production assets were changed. New regression test committed, but GitHub Actions execution must be checked independently.

### Practical review
Use **Download raw file** for `data/explore/biblical-story-scripture-review-offline.v3.html`, open locally, read each story in CPDV (switch to Challoner for traditional comparison), compare short and long choices, score 0–5 each excerpt, rank story importance, write any omission warnings, and export the V3 ratings JSON. V2 JSON reviews can be imported, so earlier ratings can be reused.

Follow-on work after reviewer decisions: refine or remove weak stories and verse boundaries, make a printed-edition/source collation pass on highly ranked passages, and link approved full story references into the existing Ad Orientem Scripture reader.
