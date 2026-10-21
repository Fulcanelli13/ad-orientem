# Historia Salutis · Three supplementary Scripture collections (pilot)

**Research status:** Not approved for publication. Kept off the main Ad Orientem Home, Mass, Rosary and P3 reader routes. Changes are isolated to this research branch.

## Open the preview

From the root of a checkout of this branch, serve the repository over HTTP:

    python3 -m http.server 8000

Then open:

http://localhost:8000/research/historia-thematic-collections-preview.html

Opening the HTML as file:// is not supported because the source registry and Scripture witnesses must be loaded from their existing repository paths.

## Editorial behaviour

- The 19 source-coordinate readings cover 7 Biblical Narratives, 6 Miracles of Our Lord and 6 Parables/Teachings. Both entry lists and the reading renderer share the single reconciled episode registry.
- Text comes only from the existing labelled data/scripture/witness/{edition}/{book}.json source, via src/scripture/witness-loader.js. The page stores no independent Scripture copy, paraphrase or generated connector.
- English default follows the existing app preference: CPDV 2009. Challoner can be selected, as can French Crampon. All three remain uncollated, not final editions.
- Esther 4–8 uses Challoner alone, because Esther's Catholic chapter and additions schemes are not safely interchangeable across sources. This restriction also applies to deep links.
- Long readings (Tobit 4–12, Judith 8–13, Esther 4–8) are paged one source chapter at a time; each chapter is displayed in original witness order with visible verse numbers.
- A missing transcription slot is displayed as a source-gap warning, not silently filled. Crampon Mark 4:41 is missing from the pinned source and will be marked.
- Nearest Historia Salutis chapter is an explicit context link, never a claim that an omitted episode is actually part of the 54-chapter Scripture selection. Judith has no fixed historical chapter placement.
- Atlas links are displayed only as existing cross-reference IDs, not assumed geographic pins or identical canonical episodes.
- The entry page is deliberately not wired into live app navigation; publication, canonical episode-ID reconciliation, and Scripture source collation remain separate gates.
- This version has no artwork, homiletic interpretation, typology overlays or AI retelling: the user reads Scripture in its own words.

## Files and test

- Preview: research/historia-thematic-collections-preview.html
- Shared reference/verse reader contract: src/scripture/historia-thematic-collections.js
- Provisional chapter-context map: src/scripture/historia-thematic-context.js
- Browser adapter: src/scripture/historia-thematic-preview.js
- CSS: src/scripture/historia-thematic-preview.css
- Full linked registry: data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json
- Test: node tests/historia-thematic-collections.mjs

Source coverage was independently inspected against repository witnesses: 19/19 Challoner readings (36 chapter views), 18/18 CPDV readings (31 views), and 18/18 Crampon readings (31 views); Esther is excluded from the latter two by policy. This is a data coverage check only. The Node/DOM/browser interactions have not been executed by this research operation; a runtime smoke test remains required before review acceptance.

## Main manuscript protection

- The 54-chapter research proposal at data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json is unchanged.
- The P3 continuous-reading Scripture and original source witness files are unchanged.
- The pilot matrix does not certify episode identities and must not be used as a manuscript replacement.
