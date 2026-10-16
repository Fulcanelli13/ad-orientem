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
