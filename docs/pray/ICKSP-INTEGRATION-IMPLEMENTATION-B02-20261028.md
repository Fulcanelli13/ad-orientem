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
