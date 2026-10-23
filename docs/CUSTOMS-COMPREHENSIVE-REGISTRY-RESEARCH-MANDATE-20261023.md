# Comprehensive Catholic Customs Registry — source-first research mandate (23 October 2026)

**Scope change:** the goal is the broadest defensible research catalogue of Catholic customs, **not** a shortlist of features for Ad Orientem. No liturgical Calendar/UI/Pray/Mass/Explore integration decisions are part of this phase. Previous regional or publication priorities do not limit the research.

## Corpus baseline (counts must not be conflated)

- **568 individual source observations** from 28/28 chapters of Francis X. Weiser, *Handbook of Christian Feasts and Customs* (1958); this represents a **first-pass chapter index, not an independently certified exhaustive extraction of every passage**.
- Legacy indexing disposition: 85 COVERED + 56 ENRICH + 131 CANDIDATE + 145 REGIONAL + 117 HISTORY_ONLY + 34 EXCLUDE = **568**.
- The existing unmerged research master has **56 working practice identities** (38 existing + 4 older provisional + 14 newly staged), but these do **not** constitute the complete source corpus. They are not 56 Weiser-only results.
- A **16-observation / 14 proposed grouping-key** preview batch from Weiser's separate *Religious Customs in the Family* is now indexed as an additional source. The book is **not fully mined**. These are not yet 14 proven distinct new identities.
- **No new app customs, dates, prayers, rites or UI** created by this branch.

## Governing rules

1. **Catalogue before selection.** Capture all reported Catholic-related practices regardless of nationality, presumed modern relevance, scarcity, or fitness for the product. Include household, personal, parish, pilgrimage, communal, ceremonial, food, music, decorative, agricultural, charitable and life-cycle practices.
2. **Three distinct record layers.** A **source observation** is a particular documented mention; a **custom/practice identity** is a deduplicated identifiable action, observance or ritualized practice; a **variant** is a separately identifiable local, chronological, material or procedural form of that practice. Keep exact links among these.
3. **Do not suppress source history.** The old EXCLUDE and HISTORY_ONLY markers remain visible as `legacy_app_triage` only. Source passages describing legend, superstition, non-Catholic comparison, claims of uncertain origin or obsolete rites are retained as **reported beliefs/context**, not elevated into recommended Catholic practices or misrepresented as factual efficacy.
4. **Do not set a corroboration threshold for inclusion.** One identified primary bibliographic witness is enough to capture a **reported custom**, with `SINGLE_SOURCE` confidence. Independent corroboration can raise confidence and establish regional/period distinctions, but must never silently erase a once-attested entry.
5. **Preserve precise scope.** Record original terms/spellings, action, participants, occasion, region, approximate period, public/private setting, minister vs lay agency, material objects, prayers, optional nature, and documented evolution. `Historical`, `reported ongoing` and `currently verified` are separate claims.
6. **Do not force false merges.** Related feasts, blessings of similar objects, consecrated vs lay customs, and geographically similar observances can have distinct identities. Conversely, different names for the same practice should cross-reference one identity with labelled variants.
7. **Preserve evidence.** Every factual claim needs a source pointer (author, title, edition, printed page or exact section and URL when available). Editorial labels and summaries must be independently worded. No bulk republication of copyrighted books.
8. **App publication metadata is out of scope.** No priority by French origin, universal Roman status, suitability for families, Calendar date, expected audience, imagery or UI dimensions until the independent research catalogue is mature.

## Census and conversion pipeline

| Step | Corpus work | Completion condition |
|---|---|---|
| Source inventory | Index each book, edition and chapter and any accessible full/partial text | Source and chapter/page coverage can be audited |
| Source-observation capture | Record **every relevant claim** including disputed or historical ones | No silently discarded source practice descriptions |
| Identity normalization | Resolve each observation as new custom, already-known custom, distinct variant, non-custom context, or contested claim | Every observation gets a justified relationship, not just a legacy triage |
| Provenance and time/place | Attach witness, period, specific locale and scope of practice | Each description can be traced to its evidence |
| Cross-source reconciliation | Link duplicated mentions without losing national names/variants | Source-level counts and distinct-practice counts remain separate |
| Confidence audit | Mark source-only vs independently attested vs verified continuing tradition | No false claims of universal or current practice |

There is **no artificial target total**: we must derive the distinct-practice count from the corpus.

## Current research data (reuse; do not fork the source of truth)

- `data/customs/master/weiser-observations.v0.json`: detailed 568-item source observations.
- `data/customs/master/working-master.v1.json`: 56 working identities with original scoped bilingual descriptions.
- `data/customs/master/relation-review-80.v1.json`: 41 identity links and 39 regional variants with provisional dispositions.
- `data/customs/master/comprehensive-customs-source-census.v1.json`: **all 568** source mentions retained in an independent census, with research actions regardless of their old app triage.
- `data/customs/master/weiser-family-preview-batch01.v1.json`: **16 new second-book preview observations** in 14 provisional grouping keys; page/section/source links, awaiting cross-source identity reconciliation.

## Additional source corpus to extract without geographic preference

- Francis X. Weiser, *Religious Customs in the Family*: separate family/life-cycle book; 16 observations in the available two-page preview, full book extraction not done.
- Maria Augusta Trapp, *Around the Year with the Trapp Family*: home customs, meals, songs, family celebrations; not mined here.
- Helen McLoughlin, *Family Advent Customs*: documentary and comparative Advent source; not mined here.
- Katherine Burton and Helmut Ripperger, *Feast Day Cookbook*: regional feast foods and celebrations; not mined here.
- Further parish, diocesan, ethnographic, historical Catholic and liturgical source collections: add as evidence-led sources, never infer country-wide prevalence from one local witness.

## Next evidence work, independent of publication priorities

**Pass A — finish Weiser source-to-practice normalization.** Examine original mentions across all 28 chapters, including the 131 CANDIDATE, 145 REGIONAL and 56 ENRICH observations; revisit the 85 COVERED for hidden separate subpractices and the 117 HISTORY_ONLY / 34 EXCLUDE for historical-custom or disputed-context handling. Every one of 568 must receive an explicit practice identity / variant / context relationship, and every name must remain searchable.

**Pass B — mine Weiser's separate family book chapter-by-chapter** and compare against the Handbook. The 16-entry preview is only an opening batch. Verify editions and complete-source accessibility rather than extrapolating from the preview.

**Pass C — incorporate additional historical books and local primary sources**, with identical evidence and dedup rules. Each source receives its own extraction coverage ledger; retain all location-specific variants.

**Pass D — audit completeness.** Report source chapters actually searched, number of source mentions, number of distinct practice identities, number of retained variants, identity dispositions, unresolved links, and corroboration percentages. Never present 568 observations, 56 working identities or 16 preview observations as a count of total Catholic customs.

### Research limitations
Historical Weiser descriptions, particularly legends, ministerial blessings and reports from other rites, do not prove modern practice or authorize ritual instructions. These are metadata/evidence constraints, **not reasons to remove the original observation from the research registry**.

Research branches are unmerged. The existing app canonical data and 1962 Calendar retain separate authority.
