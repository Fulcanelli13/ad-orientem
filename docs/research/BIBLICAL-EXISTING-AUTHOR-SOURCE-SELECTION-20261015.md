# Biblical Theatre — existing Catholic author sources, 151-event selection (15 October 2026)

**Editorial decision:** existing, correctly attributed Catholic-authored prose or original Scripture only. No AI-generated Bible stories, AI abridgements, translations, added transitions or fabricated Gospel harmonies. The withdrawn 11 AI narratives remain excluded. No permissions requested.

## Substantive findings

- **Knecht (English), *A Practical Commentary on Holy Scripture*, third revised English edition, B. Herder 1910.** The [historical edition](https://openlibrary.org/books/OL7238387M/A_practical_commentary_on_Holy_Scripture_for_the_use_of_those_who_teach_Bible_history) and [navigable original-book table of contents](https://www.ecatholic2000.com/knecht/untitled-198.shtml) are identified. The contents run across 86 Old Testament and 99 New Testament narrative headings (185 chapter-level units), with separate Commentary headings. The online transcription is not itself independently proofread against the historical scan.
- **Gilmour (English), *Bible History*, Benziger 1894, 320 pp.** [Historical edition](https://openlibrary.org/books/OL7069753M/Bible_history) located, as a short-form Catholic book alternative. Text not imported; original print comparison pending. Some historic prose carries erroneous assertions and collective-blame interpretations: no unreviewed adoption.
- **Lesêtre (French), *Histoire sainte*, P. Lethielleux 1903, 248 pp.** Independently verified in a [French diocesan library](https://lasource.diocese85.org/index.php?id=155651&lvl=notice_display) and a [digitized ebook listing](https://play.google.com/store/books/details/Henri_Les%C3%AAtre_Histoire_Sainte?id=elOAVmSkfnUC). The exact chapters/paragraphs are NOT yet verified.
- **Drioux (French), *Histoire sainte*, E. Belin 1875 fifth edition, 348 pp.** [Bibliographic lead](https://books.google.com/books/about/Histoire_sainte.html?id=vV6s0QEACAAJ). Distinguish from the much longer *Bible populaire* and later revised editions; no chapter or passage approved.

## Complete metadata pass

The machine-readable file `data/explore/biblical-existing-author-selection-review.v1.json` contains **151/151 existing Atlas eventKeys**. There are **101 distinct tentative Knecht section identifiers** covering **135 event-level topic candidates**. This is deliberately **not** a claim that Knecht contains 135 independently verified identical events: the same Knecht chapter can cover several Atlas stops, and historical text/Scripture references may differ.

| English event evidence class | Count |
|---|---:|
| Original online Knecht chapter *opened*, printed text not collated | 10 |
| Candidate chapter title from author TOC only | 125 |
| No specific chapter assigned | 16 |
| **Total** | **151** |

Nine distinct direct chapter URLs were checked as examples. These correspond to six Origins event stops (Creation, Fall, Cain and Abel, Flood, Noah's covenant, Babel), David and Goliath, Temple dedication and the Babylonian captivity chapter (the latter can cover more than one Atlas stop). **All French event-to-chapter matches remain unassigned**, since an authentic printed/digital French passage has not yet been collated. **Approved historical author text: zero.** Native Catholic Scripture provides the only presently available fallback.

The first English opening [Creation](https://www.ecatholic2000.com/knecht/untitled-09.shtml) contains an identifiable narrative before a separately headed Commentary section. [Genesis 3](https://www.ecatholic2000.com/knecht/untitled-12.shtml) is more complicated: the narrative of the Fall is followed by commentary, after which a second narrative part discusses punishment and the promise of redemption. **An indiscriminate HTML-to-text grab would wrongly mix commentary into the cover-to-cover story.** Specific boundary handling must belong to the source parser (#1229). For the [Temple](https://www.ecatholic2000.com/knecht/untitled-67.shtml) and [Babylonian captivity](https://www.ecatholic2000.com/knecht/untitled-83.shtml), separate older Bible-book naming (3/4 Kings) and asserted absolute dates must remain original-author attributes rather than automatically overwrite the canonical Bible timeline.

## What the parser pipeline receives

Hand off four work identifiers and their edition/witness URLs to the existing **PR #1229**; do not create another parser or duplicate imported text. For every eligible authored passage, the shared parser eventually needs: exact print edition, language, scan/page image locator, transcription checked against print, exact narrative territory and excluded commentary territory, a stable paragraph identifier, original biblical reference, and territory-specific public-domain/rights review. A public online mirror is evidence of *access*, not an automatic distribution licence for the mirror's site content, illustrations or modern editorial additions.

No permissions are being requested. Before any import, use independently verifiable public-domain or already-licensed sources. A pre-1931 United States publication date does not itself settle every other country's copyright status or translation authorship.

## How this will appear in the Theatre

The Library's Stories, Historical Arcs, Themes and continuous History of Salvation remain **indices pointing to one source passage**. A user can open the unchanged author's authored section or the full Catholic Scripture chapter. An event with no appropriate authored narrative stays Scripture-only, visibly labelled as such. The map, timeline and genealogy are one synchronized workspace, using existing stable Atlas IDs, never generated narrative assertions. Saved reading position is independent for each journey and protected when opening cross-references. No gamified streaks.

## Research status and next large batch

**Completed:** 151 source-selection records, existing IDs retained; 4 candidate historical works; 101 author TOC chapter selectors; 10 event-level direct page observations; explicit evidence grades; no author or AI prose copied.

**Still to do:** verified French chapters and scans; full English printed-edition collation; review of historic textual errors; actual paragraph mapping; source text rights; any full-text UI; native mobile read-and-return; preservation of bookmarks; 73-book corpus gap coverage. Do not report chapter candidate coverage as narrative completion.

**PR #1069 remains draft. Main/released Ad Orientem unchanged.**
