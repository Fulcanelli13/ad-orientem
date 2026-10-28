# ICKSP / ICRSP prayer coverage — implementation B02
**28 October 2026 · PR #1800 branch, not merged or deployed**

## Editorial authority
The user accepts all works selected by the Institute as relevant to Ad Orientem. No per-item editorial rejection/approval step remains. Reuse identical existing prayers; distinguish variant historical formulas; maintain 1962 liturgical Office roles.

## Work implemented in the application branch
- **August Queen of Heaven / Auguste Reine des cieux**: source-backed bilingual prayer in `src/pray/icksp-marian-protection.v1.js`.
- English: Don Caspar Gilli, *The Month of Mary*, London, 1890, Project Gutenberg eBook 48887, appendix “Miraculous Prayer”.
- French: Father Louis-Édouard Cestac's historical text via the Servantes de Marie congregation.
- Institute source link retained. The French and 1890 English forms differ in minor ordering; their provenance is distinct. No unsupported Latin or Italian added; historical indulgences are NOT described as current.
- Reader route `pray.marian_protection`, implemented in `src/pray/traditional-pray-runtime.js` using the existing sourced-prayer card and language conventions.
- Visible navigation in `src/pray/presentation-runtime.js` under Pray → Devotions & Novenas.
- Dedicated `tests/icksp-marian-protection.mjs`, integrated into `npm run test:pray-traditional`, plus preservation of the original 23-entry navigation parity baseline and the newly visible optional route.

## French ICRSP Divine Office source expansion
- New register: `data/pray/icrsp-divine-office-index.b02.json`.
- **98 index entries** in the *Office divin* subsection: 12 references to existing B01 items and **86 additional** records.
- Of the additional records, **65 are psalm entries** to be resolved through existing Bible/Office psalm assets rather than copied as new prayers, and 21 are Office, hymn, canticle, poetry or collection items.
- All source selections accepted. Direct article URLs remain to be verified for new index-only entries. The French site's Temporal, Sanctoral, Mass Propers, documents, and other sections are not claimed to be exhausted by this Office subsection.

## Release checks and present limits
- Source-index acceptance: 25/25 B01 and 98/98 Office entries. These are overlapping inventories, not 123 distinct new prayers.
- Independent historical text witness found and wired: 1 complete bilingual prayer reader.
- Draft full-text integrations: 1; new production integrations: 0.
- Static source and route assertions passed in the editing session. **The full Node + Playwright regression suite has not yet been executed**; browser acceptance and deployment remain unverified.
- Remaining Institute prayers/novena variants require independent historical original and EN/FR/LA witness checks before importing full bodies. A modern Institute page is not proof of modern translation reuse rights.
- The St Pius X Morning/Evening core remains untouched. No expenses or owner-permission requests.

## Next implementation order
1. Verify and add the remaining prayers for priests and Infant Jesus forms from original historical witnesses; keep the second ICKSP priest prayer's corrupted line out of the reader.
2. Add the Institute's St Thérèse perpetual novena as a distinct option alongside the existing Twenty-Four Glory Bes novena, using original historical bodies where available.
3. Collate ICRSP seasonal hymns and complete Office structures into existing experiences, with Latin/English/French edition provenance and 1962 calendar conditions.
4. Run Node, Playwright, language parity, mobile, regression and release tests before merging and deploying.

**Do not claim production completion from this draft.**

## B03 follow-on — priest prayer and reader corrections (28 October 2026)

- Corrected **August Queen of Heaven**: the 1890 Gilli appendix distinguishes the main prayer from other separately printed invocations. The EN reader now contains only the original *Miraculous Prayer* and its acclamation, without combining separate prayers. The French Cestac prayer retains the concluding repeated address visible in the Servantes de Marie source. Regression tests guard those boundaries.
- Added a **Prayers for Priests** reader under Pray → Devotions & Novenas. The first ICKSP prayer, *O Jesus, Eternal Priest*, is available in its source English only, with clear French-language explanatory UI. No invented French, Latin or Italian prayer text.
- The Institute's **second priest prayer** remains accepted, linked and explicitly held because its present webpage contains an erroneous inserted fragment. It has not been silently repaired or published.
- A related *O Jesus, Eternal Priest* prayer appeared in *The American Ecclesiastical Review*, vol. 50 (1914), pp. 608–609, but the original primary page has **not been independently collated**. Attribution to St Thérèse is disputed and is not asserted.
- Added both new routes to `src/pray/lazy-module-registry.js` so external/cold launches can load the canonical existing Prayer runtime. Updated Prayer-family route parity to retain the original 23-route baseline plus Tenebrae and the two new entries (26 visible entries).
- Added `tests/icksp-prayers-for-priests.mjs`, extended the Marian test, and attached them both to `npm run test:icksp-prayers` and the existing `test:pray-traditional` suite.
- Source bodies, runtime and navigation modules passed offline **JavaScript parse validation and explicit data/route invariant checks**. Full Node + Playwright suites have **not** been executed; no deployment approval may be inferred.

**Cumulative B03:** 25/25 accepted source selections; 2 full prayer readers implemented on draft branch (one bilingual original and one source-English only), 1 distinct second priest prayer held for corrupted text; 98 Office index records including 86 additional beyond the initial audit; **zero newly published production prayers**.

## B04 — Divine Infant King novena (28 October 2026)

The ICKSP-selected **Novena to the Divine Infant King** has been implemented as an *additional* entry inside the **existing** Ad Orientem Novenas experience, not as a newly invented independent prayer engine and not as a replacement for any of the sixteen frozen canonical novenas.

**Data:** `src/pray/icksp-divine-infant-king-novena.v1.js`. The underlying prayer is attributed in the tradition to Venerable Father Cyril of the Mother of God, OCD. The new reader contains:
- Exact historically transcribed **English** of Fr F. X. Lasance, `Prayer-Book for Religious`, 1904, Book IV, under *Novena to the Infant Jesus → Prayer to the Holy Child* (Wikisource original edition).
- Historical **French** transcription carrying the printed `Vidi. Gandae, 25 Aug. 1885` notice; this is a 2007 transcription of an earlier witness. The original 1885 physical edition has not been independently inspected. The ICRSP contemporary French version is retained as an additional comparative source, not copied into the traditional French text.
- A single nine-day **REPEAT_FORM** prayer with an intentional pause in the original wording. No fabricated nine different prayers, daily meditations, translated Latin or Italian.
- Monthly **17–25** practice corroborated by the Institute's Kansas City apostolate. This is classified as a recurring devotion, *not* a 1962 liturgical feast. It can also be prayed at another time.
- Self-contained pure monthly window function, with tests for 17th (day one), 25th (day nine), after-25 rollover, and December-to-January rollover.

**Integration:** `src/pray/novena-runtime.js` exposes the novena inside a separate *Institute Devotions* section in the Novenas overview. The existing sixteen cards and `NOVENA_CORPUS_V4`, its source-hold and Bible/Calendar registers, and any `NOVENA_TARGET_IDS` manifest are unchanged. The new form reuses the existing source disclosure, bilingual reader, nine-day controls and Simple/Guided mode. The public runtime exposes the additional item as `supplemental` and supports direct `open({novenaId:"divine_infant_king"})`, while retaining the original `corpus` property for the canonical sixteen.

**Tests authored:** `tests/icksp-divine-infant-king-novena.mjs` added to `test:pray-novenas` and `test:icksp-prayers`. The canonical mobile route suite `tests/pray-all-modules-mobile.mjs` now checks that all 16 original `data-n1-select` targets remain and the supplemental Infant King can be opened by touch, render an original historical prayer, navigate to day nine and return to overview.

**Additional first-pass classification:** ICKSP's separate *Prayer to the Infant Jesus* explicitly derives from a **votive Mass**, not the Cyril prayer. It is not treated as a duplicate of this novena and has not been inserted into the 1962 universal Missal without its formulary authority. Three separate ICKSP St Thérèse texts remain accepted: (1) Institute perpetual novena with explicit gift society intentions, (2) missionary intercession with a Raccolta-family antecedent and added Institute intentions, and (3) a prayer attributed by ICKSP to Benedict XV, for which direct papal authorship remains unconfirmed despite a reported 1926 printed novena witness.

**Status:** 3 source-backed prayer / novena reading experiences implemented on draft branch; 25/25 B01 selections accepted; 98 ICRSP Divine Office subsection entries registered with 12 B01 overlaps; **0 newly deployed production items**. JavaScript parsing, source/route invariants and calendar date checks have passed in the editing session. The committed Node and Playwright tests **have not been executed**; PR #1800 must remain draft pending the full checks.

Original references:
- https://institute-christ-king.org/resources/devotions-prayers/616-devotions-prayer-infant-king
- https://en.wikisource.org/wiki/Prayer-book_for_Religious/Book_4
- https://prieresetdevotions.blogspot.com/2007/07/prire-efficace-lenfant-jsus-rvle-par-la.html
- https://icrspfrance.fr/?page=child-jesus-prayers
- https://institute-christ-king.org/kansascity-home

## B05 — St Thérèse: three original Institute selections (28 October 2026)

The Institute's three texts have been preserved as **three distinct source identities**, not merged into Ad Orientem's pre-existing Twenty-Four Glory Bes novena:

1. **Perpetual Novena in Honor of St Thérèse** — source-linked from Pray → Devotions & Novenas → St Thérèse · Institute Devotions. The Institute's original specifies recurring Society member intentions and public Tuesday participation. Those intentions have not been silently deleted or replaced, and its weekly perpetual recitation is **not** misrepresented as nine independent day-specific prayers. Full text remains on the original linked page pending verified reusable source witness.
2. **Prayer for Missionaries** — separate source-linked work with a historical *Raccolta* no. 573 antecedent. A retrospective French compilation cites a brief of **9 July 1928**; this does **not** by itself license later English/French transcriptions. The ICKSP addition naming its own missionaries is preserved at its source.
3. **The Institute's prayer labeled "by Pope Benedict XV"** — actual complete *English-language printed 1925 form* added in `src/pray/icksp-therese-devotions.v1.js`. Collated against Fr Edward F. Garesche, S.J., *A Novena to the Little Flower*, Milwaukee 1925, printed pages **38–39** (PDF pages 40–41; zero-index **39–40**), https://distantreader.org/stacks/pamphlets/pdf/005457174.pdf . The end is followed by the separate instruction **Hail, Holy Queen**, fulfilled by reusing the existing canonical `marian_hail_holy_queen` in English, French or Latin. Its printed notice mentions Cardinal Della Chiesa (later Benedict XV), but it does **not unambiguously prove the Pope composed this prayer**. Attribution remains qualified. No invented French/Latin main prayer and no current indulgence claim.

### App wiring and safeguards
- Added `pray.st_therese_devotions` in `src/pray/traditional-pray-runtime.js`, with the historical 1925 original and source disclosures; the other two works are explicitly link-only.
- Added an existing Devotions family launcher in `src/pray/presentation-runtime.js` and a cold-launch entry in `src/pray/lazy-module-registry.js`.
- The existing canonical `st_therese` Novena detail in `src/pray/novena-runtime.js` links to the three Institute forms. Its old 24 Glory Bes method remains intact.
- The phone Prayer route parity test now expects 27 visible cards: its original 23 stable canonical entries, Tenebrae, and the three separate new ICKSP module entry points. The original 23-source count is not rewritten.
- New `tests/icksp-therese-devotions.mjs` is part of `npm run test:icksp-prayers`; the existing mobile Novenas suite asserts an Institute St Thérèse cross-link.

### Verification status
**Executed:** GitHub fetch/readback, JS syntax parse across changed runtime/data modules, original 1925 PDF page inspection, EN/FR rendering smoke test with the actual reader function and representative dependencies, source identity checks and canonical Salve Regina reuse.

**Not executed:** full Node test runner, Playwright mobile test, end-to-end app release checks, merge, or production deployment. The development container could not access GitHub remotely; no Actions runs were available on this draft head. Thus code is committed but **NOT release-certified**.

**Cumulative:** all 25 B01 source selections accepted, 98 French Divine Office source-index entries (12 previously represented in B01), **four** new draft prayer/novena experiences (August Queen, Eternal Priest, Infant King novena, St Thérèse), plus **two** St Thérèse works source-linked from the app. **Zero production releases** in this research PR.

## B06 — seven ICRSP seasonal hymn selections / eight historical Latin recensions (28 October 2026)

### Integration completed on the PR branch
- `src/pray/icrsp-seasonal-hymns.v1.js` contains **eight complete historical Latin hymn texts**, each with a direct ICRSP French source link, exact historical title, season and Office hour. No newly invented English/French verse translations or unverified modern ICRSP French copies are included.
- All seven ICRSP-selected hymn groups are accepted and represented:
  1. `Vexilla Regis` — Vespers, Passiontide (source specifies **kneeling at O Crux, ave**).
  2. `Audi, benigne Conditor` — Vespers, Lent.
  3. `Ad regias Agni dapes` — Vespers, Eastertide, ordinary revised Roman Breviary hymn.
     `Ad cenam Agni providi` — **a separate pre-1632 recension**. The *Antiphonale* of 1912 allows use only for those entitled by right, custom or indult; it is **not** substituted for the standard 1962 text. One accepted Institute source grouping therefore contains **two** historically different full Latin texts.
  4. `Æterne Rex altissime` — Matins, Ascension.
  5. `Lustra sex` — Lauds, Passiontide.
  6. `O sol salutis intimis` — Lauds, Lent; full historical Latin collated from the ICRSP First Sunday of Lent Office at `a0155_ancien`, not a guessed standalone article.
  7. `Ex more docti mystico` — Matins, Lent.
- `src/pray/traditional-pray-runtime.js` integrates all eight in the **existing Sacred Hymns & Canticles reader** using its original sequential card/timeline, local vertical stanza scroll, sources drawer and direct hymn chooser. No new Prayer Calendar, Office engine or duplicate hymn module was created. The 3 original EN/FR/Latin source-locked hymns are frozen in `SACRED_HYMNS_V381`, and the 8 additional Latin-only hymns live in a separate export with edition metadata.
- The new texts are explicitly labeled Latin-only pending independently reusable historical English/French editions. Users are not shown Latin text under a false English or French caption. ICRSP French is linked as provenance and comparative reading without copying modern French translation.
- Office hours are a documented contextual label, **not** a claim that the same hymn is universally prescribed by the 1962 rubrics for every calendar day, nor a replacement for a full Matins/Lauds/Vespers service.

### Regression coverage
- `tests/icrsp-seasonal-hymns.mjs` guards 7 groups, 8 complete Latin texts, exact Office mapping, distinct Easter recensions, conditional pre-1632 use, existing 3-core identity, no unverified translations, and reader UI/source controls.
- Added to `npm run test:pray-traditional` via `npm run test:icrsp-hymns`.
- Updated `tests/pray-traditional-dual-axis-phone.mjs` to expect **11 hymn timeline stops** (previously 3), preserve the original 3 hymns and their bilingual flip semantics, and touch/inspect all eight new Latin hymns on mobile.
- In-session source parse, metadata/recension integrity and **22 English/French DOM-render smoke cases** (11 choices × 2 interfaces) passed. The Node and Playwright tests are **committed but not yet executed**, therefore **no merge/deployment claim**.

### Sources and edition boundaries
- https://icrspfrance.fr/textes-liturgiques.php?article=a0901_ancien
- https://icrspfrance.fr/textes-liturgiques.php?article=x9ef3247f_lisible
- https://icrspfrance.fr/textes-liturgiques.php?article=a0913_ancien
- https://icrspfrance.fr/textes-liturgiques.php?article=a0920_ancien
- https://icrspfrance.fr/textes-liturgiques.php?article=a0938_ancien
- https://icrspfrance.fr/textes-liturgiques.php?article=x628ec868_lisible
- https://icrspfrance.fr/textes-liturgiques.php?article=a0155_ancien
- https://icrspfrance.fr/textes-liturgiques.php?article=xd82464db_lisible

**Cumulative after B06:** 25/25 Institute selections accepted; 4 drafted new prayer/novena experiences plus 2 separate St Thérèse source-linked works; **7 ICRSP hymn groups, 8 complete Latin historical hymn versions** in the existing 11-item hymn reader; 98 Office index entries (12 overlap the first inventory); **0 published production additions**. The full 1962 Office, remaining prayer/novena variants, and EN/FR hymn witnesses are not yet complete.

## B07 — Caswall 1849 English hymn witnesses and CI conflict repair

**Historic textual collation:** Edward Caswall, *Lyra Catholica* (London, James Burns, 1849), inspected via original scanned pages. These are independent pre-copyright-expiry nineteenth-century translations, not copied from the current ICRSP site:
- *Audi, benigne Conditor* (Lenten Vespers), five English stanzas opening “Thou loving Maker of mankind”, original printed pp. 70–71, PDF zero-index 107–108.
- *Ex more docti mystico* (Lenten Matins), nine English stanzas opening “Now with the slow-revolving year”, printed pp. 72–73, PDF zero-index 109–110.

Source scan: https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf

The two hymns now have independently labelled **Latin / English (1849)** choices in the existing Sacred Hymns reader and direct Caswall source links. French viewers continue to see clearly labelled Latin (not mislabeled as French). No unsupported historical French has been fabricated, and six other English hymn witnesses remain awaiting collation. The original eleven-text reader still has **eight historical Latin seasonal hymns plus three previously source-locked items**.

**Real GitHub Actions results, PR #1800:** Initial 9cdd63d merge-head workflows passed Prayer 23-route parity, Novena Scripture, historical Prayer sources and other checks, but identified stale historical count assertions in Prayer reachability, Pray/Formation crosswalk, organisational map, and existing mobile route audit, plus an outdated “deliberately small” hymn introduction. The three new ICKSP Prayer routes must be added **without rewriting the frozen original 23 Prayer cards/24 historical IA entrances**. Corrections were committed in 50d3791 and cb94a3a, and new mobile/Node gates were triggered. Full suite and merge are pending. A separate Adoration mobile test observed a cinematic boot overlay intercepting pointer events: this is not assumed to be caused by the hymn changes.

**Branch synchronization:** the PR was merged against current main snapshot in two-parent commit 9cdd63d, retaining existing Morning/Evening Prayer customization. The main branch continues to change while this draft is being tested. Recheck divergence/mergeability and current user-facing daily-prayer changes immediately before any merge.

All integration content remains **draft only**. No production release or historical French claim follows from this source audit.

## B09 — Vexilla Regis historical French and conditional Office context (28 October 2026)

Added the complete seven-paragraph French rendering of *Vexilla Regis* from Dom Prosper Guéranger, *L’Année liturgique — La Passion et la Semaine Sainte*, nineteenth edition (1904), where the source places the hymn in **Passiontide evening prayer / Vespers** alongside the original Latin. Its French text is from a historical transcription, not ICRSP’s contemporary French translation. The original physical 1904 pages still require image collation and the metadata explicitly says so.

Source: https://www.domgueranger.net/lannee-liturgique-passion-et-semaine-sainte-historique-mystique-pratique-et-prieres/ . See the first evening-prayer hymn and the subsequent office exposition. ICRSP places *Vexilla Regis* at Passiontide Vespers: https://icrspfrance.fr/textes-liturgiques.php?article=a0901_ancien . It is **not** imported as a universally scheduled hymn for every Lenten day.

The shared Sacred Hymns renderer now supports a **historical French-only** translation alongside Latin (Vexilla) just as it supports historical English-only or all three witnesses (Audi), with the correct edition year in the language selector. Original three source-locked hymns and all eight Latin seasonal records remain unchanged. English *Vexilla Regis*, six other French editions and final complete 1962 Office rubrical coverage remain unverified. CI release tests remain mandatory.

## B10 — Caswall 1849: further three full English hymn editions

From the original *Lyra Catholica* (London: James Burns, 1849) printed pages, three independently collated complete English editions have been added to the existing hymn reader:
- *Vexilla Regis*: seven stanzas, pp. 89–90, PDF pages 127–128 (zero-index 126–127); available with Latin and separately attributed Guéranger 1904 French.
- Revised *Ad regias Agni dapes*: eight stanzas, pp. 94–96, PDF pages 132–134 (zero-index 131–133). The historically distinct pre-1632 *Ad cenam Agni providi* receives **no** borrowed translation.
- *Æterne Rex altissime*: eight stanzas, pp. 101–102, PDF pages 139–140 (zero-index 138–139), Ascension Matins.

Source scan: https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf

Each English edition is credited, separated by stanzas, and guarded in Node/mobile tests. Seasonal hymn witness coverage now stands at **8/8 Latin, 5/8 historical English, 2/8 historic French**. The remaining historic English searches concern *Ad cenam Agni providi* (the restricted pre-1632 recension), *Lustra sex* and *O sol salutis*. These texts are not silently reconstructed.

## B11 — Lustra sex historical 1842 Catholic English witness

Original bilingual printed Catholic booklet *Devotions commemorative of the Most Adorable Passion of Our Lord and Saviour Jesus Christ*, James Burns, **1842**, printed pp. lv–lvi (PDF zero-index pp. 126–127), visually checked. Its Good Friday section prints the Latin *Lustra sex qui iam peregit* stanza, subsequent *Felle potus*, *Crux fidelis*, *Flecte ramos*, *Sola digna*, and concluding doxology with an English parallel. The six corresponding historical English units are added to the existing Sacred Hymns reader, with original refrain/disclosure identified as an editorial reading extraction. The book presents this as a **Good Friday Pange lingua / Reproaches liturgical text**, not as a separate 1842 Lauds assignment. The Latin ICRSP Lauds hymn and its exact six-stanza identity remain untouched.

Primary source: https://upload.wikimedia.org/wikipedia/commons/e/ed/Devotions_commemorative_of_the_most_adorable_Passion_of_Our_Lord_and_Saviour_Jesus_Christ-_translated_from_Catholic_sources_%28IA_DevotionsCommemorativeOf%29.pdf

Counts: **8 Latin seasonal hymns**, **6 historical English witnesses** (one extracted from an independently documented Good Friday hymn), **2 historical French witnesses**. Outstanding English: *Ad cenam Agni providi* (older, conditional recension) and *O sol salutis intimis*. Historic French pending for the other six hymn identities. No overall Office calendar automation is claimed; all additions remain on PR #1800.

## B12 — O sol salutis: Catholic 1870 English Lauds witness

Five historic English prose paragraphs of the Lenten Lauds hymn *O sol salutis intimis*, from Dom Prosper Guéranger, *The Liturgical Year*, Volume V *Lent*, translated by Dom Laurence Shepherd (Dublin: James Duffy, 1870), Chapter IV. Original Latin, placement in Lauds and complete contemporary transcription: https://lyp.network/lyp/497-commentary-on-the-seasons/501-lent/3639-chapter-4-morning-and-night-prayers-for-lent. Original historical scanned edition: https://en.wikisource.org/wiki/Index:The_liturgical_year_(IA_liturgicalyear05gura).pdf. The specific printed page images remain **not visually checked**, a provenance limitation held in the data. No editorial translation generated.

The Sacred Hymns UI now labels historical English **per-witness edition years** instead of unconditionally assuming 1849, allowing 1842, 1849 and 1870 source families to remain distinct. Cumulative: **8 Latin, 7 historical English, 2 historical French**; the historical pre-1632 *Ad cenam Agni providi* remains the only English gap, with recension comparison pending.

## B13 — pre-1632 Easter hymn: historical Neale translation, with explicit ecclesiastical caution

The earlier *Ad cenam Agni providi* now carries the complete **eight-stanza historical English version** traditionally attributed to John Mason Neale (first published 1851, in *The Hymnal Noted*). Text witness: https://www.preces-latinae.org/thesaurus/Hymni/AdCenamAgni.html. The independent hymnology history confirms the early printed readings and warns of later editorial alterations. The 1851 original printed page image **has not been collated**; the data states this clearly.

**IMPORTANT:** Neale was an Anglican translator. His public-domain text is a **historical comparative English aid**, not an authorized Roman Catholic translation. The modern transcription's Latin base and the exact ICRSP pre-1632 recension differ in some individual words. This English body must never be treated as a one-to-one critical edition of that exact Latin or substituted into 1962 universal Office. The accepted *Ad cenam* remains conditional on right, established custom, or indult. The 1849 Caswall English belongs only to revised *Ad regias Agni dapes*, which remains a different hymn.

All eight seasonal hymns now have at least one historically attested English text or rendering, but the English **quality gates differ**: source-image-checked 1842/1849, 1870 Shepherd transcription, and 1851 Neale translation from secondary transmission. French remains 2/8. The reader retains source/disclosure metadata, English and Latin language controls. Primary text comparison and 1962 usage adjudication are still required.

## B14 — Guéranger 1903 historical French O sol salutis

*O sol salutis intimis* now has all three historical language witnesses: **Latin from ICRSP**, **English from Guéranger/Shepherd's 1870 *The Liturgical Year***, and **French from the historical Guéranger 1903 *L'Année liturgique* transcription**, chapter IV, morning-prayer Lauds hymn. The five French paragraphs are documented in immediate Latin/French succession at https://www.domgueranger.net/lannee-liturgique-le-careme-historique-mystique-pratique-prieres/; original 1903 printed pages are not yet visually collated. Modern ICRSP French is **not** reproduced. Added language-source provenance and five-paragraph integrity checks.

Cumulative draft hymn coverage: **8/8 Latin, 8/8 historically attested English versions (with differing provenance and recension caveats), 3/8 historically attested French versions**. Historical source page collation and final 1962 Office usage decisions remain release gates.

## B15 — original historic French Ex more and Lustra, with Gladu 1913 edition registry

**Ex more docti mystico:** complete **nine** historical French prose paragraphs from Dom Prosper Guéranger, *L’Année liturgique*, *Le Carême, Propre du temps*, where the text is explicitly labelled the **Matins hymn in Lent**: https://www.domgueranger.net/lannee-liturgique-le-careme-propre-du-temps/?lang=en . Original nineteenth-century authorial French, preserved rather than retranslated. Printed original page images are not inspected.

**Lustra sex:** complete **six** corresponding historical French blocks from Guéranger's **Good Friday Adoration of the Cross** text, explicitly a *Pange lingua / Crux fidelis* extraction rather than an independently published Lauds rendering: https://www.domgueranger.net/lannee-liturgique-jeudi-vendredi-et-samedi-saint-propre-du-temps/ . Historical refrain lines are compressed into the Crux fidelis verse group for reader convenience; this editorial extraction is identified in data. The separate ICRSP Latin Lauds hymn remains unchanged.

A second important **public-domain Catholic dual-language witness** is P. Louis Gladu, O.M.I., *Les Hymnes du Bréviaire*, corrected second edition (Québec, 1913), which has **imprimatur 8 May 1913**, original Latin alongside French, and includes these hymns under their traditional Office hours. Source: https://www.liberius.net/livres/Les_hymnes_du_Breviaire_000000919.pdf ; index/parsed pages: Ex more **12–13**, Lustra **19–20**, Ad regias **28–29**, Æterne Rex about **65**. Image rendering of the 202-page PDF timed out; these are **parsed secondary references only**, not falsely asserted as image-collated, and Gladu's separate translations are not copied verbatim into the existing Guéranger editions. The 1913 book is a promising consistent Catholic source for resolving the remaining three French identities without using ICRSP's modern text.

**Cumulative seasonal hymn draft:** 8/8 Latin, 8/8 historical English witnesses (with varying degrees of authenticity/edition collation), **5/8 French**. Remaining French: *Ad regias Agni dapes*, the separate pre-1632 *Ad cenam Agni providi*, and *Æterne Rex altissime*. No automatic 1962 Office assignment is implied by the comparison sources.
