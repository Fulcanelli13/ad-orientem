# Ad Orientem — Comparative Scripture Excerpt Master Matrix (research-first, 16 October 2026)

**Governing user strategy:** Preserve the already-decided Bible editions and existing Bible reader. Before selecting Ad Orientem abridged Scripture verses, harvest **5–10 genuinely distinct published source-selection systems** and map their **literal chapter/verse references only** against the existing **37 Bible reading sections and 151 canonical Biblical Atlas events**. Do not replace the existing taxonomy or build a parallel reader. Full Scripture must remain available after eventual editorial approval; selection and context must never be disguised as original Scripture words.

## Phase 1 — first verifiable source harvest, not a completed 151-event decision matrix

Initial research files exist as private conversation deliverables:
- `AO_Biblical_Excerpt_Master_Matrix_v1.xlsx`: 7 worksheets, SHA256 `2abbfe5954b86ba7a78909ce5815df43bb55f054601975f5bd797bd7002e81ea`
- `AO_Biblical_Excerpt_Master_Data_v1.json`: exact 151 existing canonical keys, 37 grouping keys, 180 original publication selection-reference records, full source URLs, source occasion/page/day locators and retained variants, SHA256 `c6a499bb654a9277a770fcc06dc505b0d471cb1ba6bab7a27c054a75891e8494`
- `AO_Biblical_Excerpt_Master_Coverage_v1.json`: coverage metrics, SHA256 `d2417f876694df568de71e5078217841926736505cff252b7f703631277257dd`
- Two CSV comparison/provenance exports with the same evidence.

The **canonical section/episode IDs come from** `data/explore/biblical-reading-continuity-review.v1.json` (37 `readingChapters`, 151 `events`). **Do not conflate** the Atlas event reference with a finally selected short excerpt.

| First-pass status | Count |
|---|---:|
| Candidate source systems | 9 |
| Qualified primary independent editorial families | 7 |
| Provisional Catholic 1962-Missal index (requires verification) | 1 |
| Unverified third-party story listing (held, excluded from independent vote) | 1 |
| Source × event × variant evidence records | 180 |
| Clearly invalid source-event mappings excluded | 6 |
| Existing canonical events touched by any harvested record | 83 / 151 |
| Existing canonical events with qualifying independent evidence | 78 / 151 |
| Still without qualifying evidence in the current harvest | 73 / 151 |
| Events cited by at least two *different qualified editorial families* | 31 |
| Events cited by at least three *different qualified editorial families* | 11 |
| Publisher-explicit SHORT variants | 12 |

**Sources:**
1. Felix Just SJ Catholic Roman Lectionary Sunday and major feasts Scripture index: https://www.mobile.catholic-resources.org/Lectionary/Index-Sundays.htm
2. 1962 Missal source index / propers, provisional source-line verification: https://www.missalemeum.com/en/widgets/propers/2026-04-04?theme=light
3. Scripture Union Essential 100: https://www.bible.com/reading-plans/25-the-essential-100
4. George Guthrie *Reading God's Story*, distinct `Highlights` column (authorized plan reproduction): https://fbccola.com/wp-content/uploads/2023/12/The-Consumed-Plan-20231215.pdf
5. International Bible Society adapted *Reading the World's Greatest Story* selections: https://static1.squarespace.com/static/55d38751e4b0adc8c3260158/t/568d432069a91a2847f94d3e/1452098336707/Reading%2BGods%2BStory.pdf
6. Jackson Day *Key Bible Stories* original educational scope references: https://www.biblestorytelling.org/adults/bible-stories.html
7. AFLC *Ambassador Institute* biblical lesson readings: https://www.aflcworldmissions.org/wp-content/uploads/archived_files/pdf/englishterm2.pdf
8. RightNow *God's Kids* source scope and sequence: https://resources.rightnow.org/web/Gods-Kids-Scope-and-Sequence.pdf
9. *152 Famous Bible Stories*, third-party-hosted copy **unverified/held**: https://www.coursesidekick.com/religion/28617333

**Crucial distinctions:** Liturgical `SHORT` / `LONG` alternatives are actual published variants (e.g. Genesis 1:1—2:2 vs Genesis 1:1, 26–31a; Genesis 22:1–18 vs Genesis 22:1–2, 9a, 10–13, 15–18). George Guthrie's published `Highlights` column is valuable as an editor-chosen reduced selection, distinct from his full-day references. Many other sources offer **whole chapters, story subjects or lesson references**; these must not be misrepresented as precise abridgements. One editor reprinted at different URLs is one source family, not multiple independent votes. The 1962 and modern lectionary share one Roman liturgical ancestry when scoring independence.

The matrix deliberately retains the publisher's references, punctuation, chapter naming, citation errors and alternative selection boundaries without silently improving them. Six erroneous source–Atlas associations were excluded. One reference `2 Samuel 5:1-` is malformed in an available source witness and held as such. Secondary `152 Famous Bible Stories` and provisional 1962 records do **not** count toward qualified-source recurrence. Textual references such as John 1:1–5 accompanying Genesis Creation must be labelled parallel theological context, not the Genesis event excerpt.

**Source absence does not mean Bible absence:** the 73 remaining events are research gaps in this **initial** harvesting tranche, not allegations that seven full works lack references. Some Protestant/evangelical curricular lists omit Catholic deuterocanonical books; do not let those omissions deprioritize Catholic Wisdom, Tobit, Judith, Sirach, Baruch or Maccabees.

## Follow-on work — strict sequence

1. Continue **bulk harvesting every independent source's complete published Scripture-reference list**, using author-published page/day/occasion and direct URLs, until the matrix covers the existing 151 events and identifies source-specific genuine omissions. Prioritize 73 untouched events and the 5 unrepresented reading sections, particularly Catholic-canon texts and the Prophets/Acts/Revelation.
2. Reconcile exact verse notation and edition-specific Catholic numbering in **separate normalized fields**, never replacing publisher verbatim references. Distinguish reading lengths and genuinely abbreviated vs whole-chapter refs. Analyze *independent* source prevalence only after source corpora are substantially complete.
3. Only then begin editorial selection of one essential reading / extended selection / full passage with fidelity/context checks and transparent gaps. No new Bible editions, no Schuster OCR, no UI changes in this phase.

**This is a research-only matrix. No new Ad Orientem scripture excerpts have been approved, no source Bible words copied, and the production app is unchanged.**


## Phase 2 — weekday and deuterocanonical index harvest (same date, supersedes v1 counts)

Working directly from Felix Just SJ's original **Catholic Lectionary weekday Scripture index** (`https://www.catholic-resources.com/Lectionary/Index-Weekdays.htm`), the matching **deuterocanonical index** (`https://church.catholic-resources.org/Lectionary/Index-Deuterocanonicals.htm`) and the compiler's **Daniel selection index** (`https://church.catholic-resources.org/Bible/Daniel.htm`), another **101 source-to-existing-event exact-reference evidence records** have been appended to the existing 180-row ledger. These 101 citations include distinct original liturgical days and explicit short/long alternatives. No biblical text has been transcribed, abbreviated or rewritten.

| Metric | v1 | **v2 current** |
|---|---:|---:|
| Published-reference evidence records | 180 | **281** |
| Existing Atlas events with >=1 qualified source reference | 78 | **127/151** |
| Atlas events still lacking qualified evidence | 73 | **24** |
| Existing reading groups touched | 32 | **37/37** |
| Candidate source families | 9 | **9, unchanged** |
| Qualified independent editorial families | 7 | **7, unchanged** |
| Events with >=2 qualifying independent source families | 31 | **38** |
| Events with >=3 qualifying independent source families | 11 | **12** |

**Private deliverables:** `AO_Biblical_Excerpt_Master_Matrix_v2.xlsx` SHA-256 `1407d998abc59454c4ba5ad459c57527a8d6e751acceffb34e050918191a8631` (seven sheets: overview, 151-event comparison, exact evidence ledger, 37-section coverage, uncovered events, nine-source register, editorial QA holds); `AO_Biblical_Excerpt_Master_Data_v2.json` SHA-256 `728750ebca300b02226f6f7fd30ab84c3a44c46e04397c5209d6ed3ac7d5ea51`; `AO_Biblical_Excerpt_Master_Weekday_Harvest_v2.csv` SHA-256 `3f2befc6c6f7cf41d7c3e0bec984329497a0cffd0f6aca62c55a3986ce55175d` contains first-hand weekday page selections. These sources are stored outside the public repository; the GitHub file stores metadata and provenance only.

**Meaningful examples of exact printed selections:** `Josh 3:7-10a, 11, 13-17` for Jordan crossing; `1 Kgs 8:1-7, 9-13` and separately `1 Kgs 8:22-23, 27-30` for the Temple; `2 Kgs 22:8-13; 23:1-3` for Josiah; `Nehemiah 8:1-4a, 5-6, 7b-12` for Ezra; `Acts 15:1-6`, `Acts 15:7-21`, and `Acts 15:22-31` on separate Easter weekdays for the Council; and `Daniel 13:1-9, 15-17, 19-30, 33-62 [or 13:41c-62]` (long and short printed options) for Susanna. The original references remain verbatim in the evidence ledger, while AO's existing Atlas anchor remains a *different field*.

**QA exclusions:** The Acts 11:1–18 explanation of Cornelius' conversion is not a citation of the actual Acts 10 conversion episode. Rev 1:1–4; 2:1–5 does not cover Rev 1:9–20. Neither was promoted into the source-event comparison. Esther Greek C vs Vulgate Esther 14 is held for the existing Catholic numbering crosswalk. Judith responsorial canticle verses do not constitute a narrative excerpt of the story; likewise partial parallels across different Gospels do not establish identical verse selection. Some lectionary selections overlap only a subsection of an AO episode; no complete-episode certification is implied.

The **24 research gaps** are: Abraham leaving Ur, David enthroned in Hebron, Tobit 1:10, Ezekiel 1, Judith 13 story, Esther 14, Daniel 3 canticle, Daniel 14 Bel/dragon, opening of Maccabean resistance 1 Macc 2:1–5, Jesus' growth (Luke 2:51–52), walking on water, first Passion prediction, descent from Transfiguration, entrance preparation/entry, foot washing, Gethsemane, scourging, good thief, Saul to Tarsus, Paul in Thessalonica, Paul in Troas, and the shipwreck. A lectionary's lack of a direct reading for one subject does **not** mean other existing sources omit it. Research those against the other six qualified independent families and new first-party curated indexes before declaring any source-internal omission.

**Still forbidden:** verse-popularity ranking, final selection, Scripture paraphrasing, new Bible versions, Schuster OCR or any native Bible app change. Next step is further **comparative primary-source harvesting**, not editorial scoring. Do not turn 171 Roman Lectionary source records into 171 independent opinions; they remain one editorial family.


## Phase 3 — American Bible Society and Passion pericopes (supersedes prior metrics)

Further comparative evidence now derives from **two additional original editorial families**, supplementing more Roman Catholic Mass readings without treating reprints as additional independent votes. The active cohort is **10 sources: 9 independently qualified primary editor families and 1 provisional 1962 Missal witness**. The older `CHRON152` third-party copy is still preserved as an **eleventh archival/unverified source**, but is **outside** the active 10-source comparison and independent evidence counts. Neither full Bible text nor Bible edition choice has changed.

| Metric | v2 | **v3 current** |
|---|---:|---:|
| Source × event × variant evidence records | 281 | **298** |
| Source selection records added in v3 | – | **17** |
| Canonical 151 Atlas events with ≥1 qualified source selection | 127 | **140** |
| Events without qualified source evidence in current harvested sample | 24 | **11** |
| Existing Ad Orientem reading sections with qualified evidence | 37 | **37** |
| Qualified independent editor families | 7 | **9** |
| Events supported by ≥2 distinct qualified families | 38 | **41** |
| Events supported by ≥3 distinct qualified families | 12 | **12** |

**Original publisher evidence:**
- **American Bible Society**, `Selected Readings from the Deuterocanon / Apocrypha`, first-party 45-day list: https://www.americanbible.org/engage/bible-resources/articles/selected-readings-from-the-deuterocanon-apocrypha1/ . Verbatim source choices include `Tobit 1.1-22`, `Judith 13.1-20`, `Esther 14.1-19`, `Susanna 1-64`, `1 Maccabees 2.1-28`, `1 Maccabees 4.36-61`, `Wisdom of Solomon 7.1-22`. These are **whole-story/whole-chapter assignments**, NOT necessarily abridged highlights. Original standalone `Susanna 1-64` notation is kept; its Catholic Daniel 13 crosswalk remains unresolved. The same publisher also lists writings outside the 73-book Catholic canon, but those were not introduced as canonical Ad Orientem books.
- **Roman Catholic Lectionary (already in v1/v2, same one editorial family)**: USCCB published `Matthew 14:22-33` (walking on water), `Matthew 16:21-27` (first Passion prediction), `Luke 19:28-40` (Palm Sunday procession), `John 13:1-15` (washing of feet), `Luke 23:35-43` (Good Thief) and responsorial canticle `Daniel 3:52, 53, 54, 55, 56`. One Palm Sunday passage aligns only partially with the Luke 19:37–44 Atlas event and is a **parallel-Gospel**, not a literal Matthew 21:1–7 citation, for the preparatory event. The Daniel passage is authentic Scripture but **praise poetry** rather than narration of the fiery furnace. Primary evidence URLs are attached separately to each selection record.
- **The Hope Effect**, first-party `40 Days of Lent` plan hosted by YouVersion: https://www.bible.com/reading-plans/85-40-days-of-lent . Days 37, 38 and 41 publish `Mark 14:32-72`, `Luke 22:39-62` and `John 19:1-16`. John 19 directly covers the scourging/crowning chapter. The Mark/Luke Passion narratives contain Gethsemane but extend into later episodes and are **parallel canonical Gospel passages**, not exact excerpts of the Atlas Matthew 26:36–46 text.

**The 11 remaining research gaps, not editorially rejected episodes:** `Genesis 11:31` departure from Ur; `2 Samuel 2:1–4` David at Hebron; `Ezekiel 1:1–28` inaugural vision; `Daniel 14:1–22` Bel; `Daniel 14:23–42` dragon; `Luke 2:51–52` hidden life; `Matthew 17:9–13` descending the Transfiguration mountain; `Acts 9:29–30` Saul's departure to Tarsus; `Acts 17:1–9` Paul at Thessalonica; `Acts 20:7–12` Paul at Troas; `Acts 27:13–44` shipwreck. An available outside full Bible in a year assignment is **not** automatically admitted as a short selected reading just to fill a row.

**Private conversation deliverables:** `AO_Biblical_Excerpt_Master_Matrix_v3.xlsx` (eight worksheets, 151-event matrix, 298-evidence ledger, 37 sections, 11-gaps sheet, explicit new-17-evidence tab), SHA-256 `2a10c3fabb460dc4a393d79832c098aa711e52db3ed5ea89d4e04f7d11bd2254`; `AO_Biblical_Excerpt_Master_Data_v3.json` SHA-256 `81b9372754c2739ae87d65f05771f48f5ff5f5a242a5b9cdf12fd008e5b69342`; `AO_Biblical_Excerpt_Master_Coverage_v3.json` SHA-256 `7e4d60c48aca302485c2e5bbd5f3ad2f49e13026c82c78a4bb924b67490da560`; `AO_Biblical_Excerpt_Master_New_Evidence_v3.csv` SHA-256 `0fc856e30c83dadffb3f5d2c6ef744f09e2ab3fd764a4ef1bb469eacc5ec44fd`. The new 17 reference records and exact publisher URLs are also stored on the **existing GitHub research branch** in `data/explore/biblical-pericope-comparative-new-evidence.v3.json` for cross-pipeline reconciliation; larger workbook/legacy first 281 rows are private conversation deliverables referenced by digest in the source family manifest.

**Next execution:** deliberately deepen overlap among the 9 independent source families; 41/151 events have ≥2 independent choices, only 12 have ≥3. Finish harvesting each source's original full selection index where technically available, then prepare the editorial comparison. **Zero chosen final abridged excerpts, zero Scripture prose reproduced, zero live app changes.**
