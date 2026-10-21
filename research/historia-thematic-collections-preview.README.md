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


## In-app Scripture integration (guarded research URL)

The three collections are now optionally available **inside the existing canonical Scripture library**, not in an additional production Bible reader. On a checkout of this branch served over HTTP, open:

    http://localhost:8000/index.html?ao_historia_collections=1

Open the app's existing Scripture reader from Home. The **Biblical collections · research** disclosure lists all 19 entries; selecting an entry opens its exact verse coordinates in the same reader and uses its existing text, source-edition picker, gap warnings, and commentary tools. Tobias, Judith, and Esther have bounded previous/next *episode chapter* navigation above the normal reader.

A research script can open a specific entry, when the canonical shell is on Home:

    await window.AO_SCRIPTURE_APP_V1.openThematicEpisode('hist-omitted-159')

This entrypoint is intentionally unavailable without the URL flag, and keeps all production navigation labels untouched. A selected collection episode is **not** assigned a new Atlas canonical event ID: that evidence still requires individual episode-identity adjudication. Manual change of the Bible book, chapter, bookmarks or search drops the supplementary-episode selection. This is not a published replacement for Historia Salutis.

Safety: Esther uses Douay–Rheims/Challoner-only source coordinates, and the research overlay prevents changing it to an unverified edition/verse map. Other editions remain visibly labelled as uncollated source witnesses. Standard in-app source gaps such as Crampon Mark 4:41 are already disclosed by the Scripture reader.

Run these tests from the repository root:

    node tests/historia-thematic-collections.mjs
    node tests/historia-thematic-inapp-bridge.mjs

The implementation and new regression scripts have been checked for syntax and repository source-coordinates here, but a real Node + browser smoke-test has **not** run in this session. That remains the merge/release gate.


## Evidence-gated reciprocal Historia navigation (2026-10-21)

A second, read-only identity crosswalk now links all 19 pilot episodes to the Atlas and to the **existing 37-movement P3 research manuscript**. The 54-chapter covenantal proposal is preserved as a separate chapter owner: an R chapter can map to one movement without claiming that a supplementary episode's biblical words are selected in that movement.

- Six miracles have individually named Atlas MIRACLE records with matching title/passage.
- Three parables have individually named Atlas teaching records with matching passages (the Atlas categorizes these as LIFE_EVENT; this must **not** be interpreted as the story's fictional characters being historical people or places).
- The Ten Virgins and the Talents are subsets of one broader Matthew 25:1–30 Atlas teaching record, so both are **composite inclusions**, not identical individual Atlas events.
- Eight episodes lack matching individual Atlas records; no IDs or geographic sites were manufactured.
- Eighteen episodes have a *nearest covenantal context* in the research manuscript. Judith remains without a fixed chronological destination.

Within the in-app Scripture collection reader (research URL opt-in), open a pilot episode and follow **Read this covenantal movement in Historia Salutis**. It opens the source's original P3 continuous manuscript prototype, scrolls to the validated movement, and displays a prominent disclosure that the supplementary passage is **not included** in that movement. **Return to supplementary Bible reading** links back to index.html?ao_historia_collections=1#hist-omitted-XYZ; the research-only Scripture owner restores the identified episode on page load. Invalid or mismatched movement/episode query pairs do not activate the bridge.

These are research-only links; the published home, Mass and Scripture navigation remain unchanged when the opt-in flag is absent. The source identity crosswalk is data/research/historia-salutis-thematic-identity-covenant-context-20261021.v1.json, and its regression is tests/historia-thematic-reciprocal-navigation.mjs.

**Validation actually performed:** independent matching of all 19 records against the repository Atlas and the 54-chapter/37-movement research owners (6 exact miracle, 3 exact teaching, 2 composite, 8 unlinked, 18 contextual movements, 1 chronology hold); syntax checks passed for the modified JS modules and original manuscript prototype; 11 static reciprocal-link contract checks passed. **Not performed:** full Node project tests and a real headless/mobile browser round-trip. The repository could not be cloned into this execution container (network DNS unavailable). These remain explicit acceptance gates.


### Atlas live-route gate

The identity registry now separately evaluates each documented Atlas event against the existing **151-stop Bible Atlas runtime**. Only four matched events currently have a usable `biblical:event:...` destination: Cana (`cana-e1`), Nain (`nain-e1`), calming of the storm (`galilee-sea-e2`), and the man born blind at Siloam (`siloam-miracle-26`). The in-app reader presents an Atlas navigation action **only** for those four, using the existing Scripture→Find→Atlas reciprocal-return owner; all seven additional documented or composite Atlas relationships remain informative text, never dead navigation buttons. The eight entries without individual Atlas evidence remain unlinked.

A simulated DOM exercise of the actual `mountScriptureLibrary` implementation passed **10 interaction assertions**, including the Prodigal Son deep link, source-coordinate context link, Tobit chapter paging, the absence of a Judith chronology link, Esther's edition lock, and exit on ordinary Bible navigation. This is **not** equivalent to running Playwright in a genuine browser. The Node test sources have been committed, and a real browser end-to-end check is still mandatory before merge or release.

## Main manuscript protection

- The 54-chapter research proposal at data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json is unchanged.
- The P3 continuous-reading Scripture and original source witness files are unchanged.
- The pilot matrix does not certify episode identities and must not be used as a manuscript replacement.
