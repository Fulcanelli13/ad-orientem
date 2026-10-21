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
- A missing transcription slot is displayed as a source-gap warning, not silently filled. Mark 4:41 is missing from all three pinned uncollated source witnesses and must be visibly marked in all three.
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

Source coverage was independently inspected against repository witnesses: 19/19 Challoner readings (36 chapter views), 18/18 CPDV readings (31 views), and 18/18 Crampon readings (31 views); Esther is excluded from the latter two by policy. This is a data coverage check only. The Node source-contract suite was executed successfully in GitHub Actions on 21 October 2026; a real Chromium phone acceptance run has exposed and helped correct mobile width and transcription-gap issues. Confirm the latest complete workflow result before approval.


## In-app Scripture integration (guarded research URL)

The three collections are now optionally available **inside the existing canonical Scripture library**, not in an additional production Bible reader. On a checkout of this branch served over HTTP, open:

    http://localhost:8000/index.html?ao_historia_collections=1

Open the app's existing Scripture reader from Home. The **Biblical collections · research** disclosure lists all 19 entries; selecting an entry opens its exact verse coordinates in the same reader and uses its existing text, source-edition picker, gap warnings, and commentary tools. Tobias, Judith, and Esther have bounded previous/next *episode chapter* navigation above the normal reader.

A research script can open a specific entry, when the canonical shell is on Home:

    await window.AO_SCRIPTURE_APP_V1.openThematicEpisode('hist-omitted-159')

This entrypoint is intentionally unavailable without the URL flag, and keeps all production navigation labels untouched. A selected collection episode is **not** assigned a new Atlas canonical event ID: that evidence still requires individual episode-identity adjudication. Manual change of the Bible book, chapter, bookmarks or search drops the supplementary-episode selection. This is not a published replacement for Historia Salutis.

Safety: Esther uses Douay–Rheims/Challoner-only source coordinates, and the research overlay prevents changing it to an unverified edition/verse map. Other editions remain visibly labelled as uncollated source witnesses. The in-app Scripture gap registry now explicitly discloses Mark 4:41 in Challoner, CPDV and Crampon; no missing verse text has been fabricated.

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

**Validation:** independent matching of all 19 records against repository Atlas/P3 owners (6 exact miracle, 3 exact teaching, 2 composite, 8 unlinked, 18 contextual movements, 1 chronology hold); syntax and reciprocal-link contracts passed; Node source-contract CI passed. Actual headless Chromium on GitHub Actions exposed mobile width and incomplete Mark 4:41 source records, for which regressions are now committed. Full app-wide `npm test` and the final successful browser round-trip remain separate acceptance gates.


### Atlas live-route gate

The identity registry now separately evaluates each documented Atlas event against the existing **151-stop Bible Atlas runtime**. Only four matched events currently have a usable `biblical:event:...` destination: Cana (`cana-e1`), Nain (`nain-e1`), calming of the storm (`galilee-sea-e2`), and the man born blind at Siloam (`siloam-miracle-26`). The in-app reader presents an Atlas navigation action **only** for those four, using the existing Scripture→Find→Atlas reciprocal-return owner; all seven additional documented or composite Atlas relationships remain informative text, never dead navigation buttons. The eight entries without individual Atlas evidence remain unlinked.

A simulated DOM exercise of the actual `mountScriptureLibrary` implementation passed **10 interaction assertions**, including the Prodigal Son deep link, source-coordinate context link, Tobit chapter paging, the absence of a Judith chronology link, Esther's edition lock, and exit on ordinary Bible navigation. This is **not** equivalent to running Playwright in a genuine browser. The Node test sources have been committed, and a real browser end-to-end check is still mandatory before merge or release.

## Expansion beyond 19 pilots — source-index preflight

The full omission inventory is now accountably processed without changing the 54-chapter P3 proposal or adding a second Scripture-text store. Of 217 source inventory entries, 19 remain the active research pilots; 191 additional entries have single-book Catholic Scripture coordinates accepted by the existing reference parser; 7 remain **manual segmentation holds**. A duplicated Revelation 13 span represents two proposed entries but only one underlying chapter; the records cannot silently become two independent Scripture copies.

The next editorial candidate batch contains **41 readings**: 21 further Miracles of Our Lord, 17 Parables and Teachings, and 3 biblical canticles. The shared adapter `src/scripture/historia-thematic-expansion.js` produces source-coordinate reading plans, checks exact Catholic book and chapter limits and requires the first 19 pilots remain intact. All these new entries are **research staged, not live**. They have no promoted Atlas event identities, no invented chronological chapters, and no copied Bible text. The other 150 single-book entries remain staged for later collection-by-collection review.

The seven manual holds are Hagar/Ishmael (two Genesis passages), David sparing Saul (two references), Jeremiah's imprisonment (noncontiguous chapters), Greek Esther additions (edition-specific versification), hidden life at Nazareth (discontinuous verses), the last-things discourse (Matthew and Mark), and the trials of Job (noncontiguous chapters). No malformed segments are silently widened or assigned a different canonical Bible verse.

Registry: `data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json`. Tests: `tests/historia-thematic-expansion-preflight.mjs` and `tests/historia-thematic-expansion-adapter.mjs`. The 41-entry adapter has passed a direct in-process evaluation against the branch's registry, but Node/Playwright workflow confirmation is still outstanding.

## Second-batch opt-in research reader (60 total)

The actual GitHub Actions Node and Chromium acceptance gates passed for the 19-episode original research interface on 21 October 2026. The separately reviewed second batch is now available **only with a second explicit research flag**:

    http://localhost:8000/index.html?ao_historia_collections=1&ao_historia_batch2=1

This assembles **four research collections / 60 Scripture readings**: Great Biblical Narratives (7), Miracles of Our Lord (27), Parables and Teachings (23), Biblical Prayers and Canticles (3). The first 19 remain unchanged under the original `?ao_historia_collections=1` flag. All 41 additional passages still have `RESEARCH_STAGED_NOT_LIVE` source status and are clearly labelled as unapproved; none are assigned an inferred Atlas identity, location or covenantal chapter.

A separate source-availability pass checked all 41 additional readings across **12 original book/edition witness files**, **129 chapter views** and **1,608 available verse records** with no empty requested chapters or explicit internal source gaps. Source-verse wording continues to live exclusively in the original Scripture files. The CI contract for this is `tests/historia-thematic-batch2-witness.mjs`, with the extended-research URL journey in `tests/historia-thematic-phone-e2e.mjs`. Confirm the **latest successful** workflow before treating this new opt-in flag as accepted; the earlier successful browser run predates second-batch activation.

## Next editorial pass — 67 research readings (21 October 2026)

**Green verification:** GitHub Actions Chromium + Node research acceptance run [39666450547](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39666450547) passed. The test covers the 19-, 60-, and segmented 67-reading research modes, including the four revised source windows. This is research acceptance, **not** biblical-text collation or publication approval.

To inspect the seven formerly held composite references as distinct, labelled original Scripture spans, use the **third explicit opt-in**:

    http://localhost:8000/index.html?ao_historia_collections=1&ao_historia_batch2=1&ao_historia_segmented=1

This produces **67 source-coordinate research readings in six collections** (11 Great Narratives, 27 Miracles, 24 Parables/Teachings, 3 Canticles, 1 Prophets, 1 Life of Christ). All seven have explicit source plans: Hagar/Ishmael; David sparing Saul twice; Jeremiah's distinct persecutions; Esther's prayer; the nonconsecutive Nazareth verses; the Matthew/Mark discourse as two Gospel testimonies; and the Job wisdom-narrative frame. Their *13 section locators* cover *15 actual Bible chapter views*. Source words are loaded through the same established Catholic witness loader, never stored here. The database records why intervening chapters are excluded. Job is not called a parable and is not forced into chronological history.

**Edition-specific Esther:** the Greek addition convention yields Queen Esther's prayer at **Esther 14:1–19 in Douay/Challoner and Crampon**. The CPDV witness's Esther 14 contains other material. Until source-collated crosswalk approval, the research reader uses **Challoner only** for this prayer. Never infer that chapter number equality across the three editions implies identical content.

**41-entry editorial source audit:** `data/research/historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json` retains all the original omission-inventory references but proposes four precise research-reader corrections:

- Mark 9:14–28 stops before the following Galilean journey at verse 29;
- Matthew 13:24–30 and Christ's Matthew 13:36–43 explanation are separate passages;
- Mark 11:12–14 and 11:20–21 are separated by the Temple cleansing;
- The debates and denunciations use Matthew 21:23–27, 22:15–46 and 23:1–39, not an indiscriminate Matthew 21–23 that repeats the Palm entry and wedding feast.

Three further entries have *literary or scope cautions*, without introducing interpretive prose into the biblical readings: the rich man and Lazarus; the future Last Judgment; and the broader content of John 15. These boundaries are **editorial research proposals** and not an accepted substitution for the original sources.

Source-only implementations: `src/scripture/historia-thematic-composite.js` and `src/scripture/historia-thematic-boundaries.js`. Regressions: `tests/historia-thematic-composite.mjs`, `tests/historia-thematic-editorial-boundaries.mjs`, and the expanded phone browser journey in `tests/historia-thematic-phone-e2e.mjs`. None of these changes alters the existing 54-chapter P3 manuscript, 37 original source movements or Scripture witness text files.

## Main manuscript protection

- The 54-chapter research proposal at data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json is unchanged.
- The P3 continuous-reading Scripture and original source witness files are unchanged.
- The pilot matrix does not certify episode identities and must not be used as a manuscript replacement.
