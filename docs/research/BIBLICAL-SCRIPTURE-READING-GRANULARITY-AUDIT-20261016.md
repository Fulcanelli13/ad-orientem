# Ad Orientem — Scripture granularity audit: 151 Atlas events to a finer reading-unit programme

> **Editorial policy correction (16 October 2026):** The 264-unit structure is a *candidate pool*, **not** a required syllabus target. Likewise, 73-book completeness and the hypothetical 299 units are retired as selection criteria. Ad Orientem is a story-first, selective Catholic Scripture journey encouraging readers to open full passages. See `data/explore/biblical-story-first-editorial-policy.v1.json`. Preserve 151 Atlas event IDs, the 37 sections and historical evidence; prioritize compelling episodes, coherent context and meaningful OT–NT connections.

**16 October 2026 · Research-only · No deployment, re-keying or approved pericopes**

## Purpose
The historical Biblical Atlas's 151 canonical milestones are correct **as a stable chronology and cross-module join layer**. Their granularity is unsuitable as the sole basis for a faithful, manageable, abridged/selected Scripture-reading programme: some anchors last 1–4 verses while others span 30–66 verses; non-narrative books and teachings are scarcely represented. Keep existing 37 reading sections. **Do not alter the 151 canonical event keys** or replace the reader.

**Single detailed source of truth for this audit:** `data/explore/biblical-scripture-reading-granularity-audit.v1.json` (full 151-event diagnosis, linked 460-reference v7 research provenance, 41 split plans, 53 supplemental literary and narrative reading units, 73-book completeness matrix, 35-book missing-content queue).

The 460 originally published pericope references remain owned by `data/explore/biblical-pericope-comparative-full-master.v7.json`; **do not duplicate or reinterpret source-family votes in this proposal.**

## Measured first-pass diagnosis

| Structural property | Audit |
| --- | ---: |
| Existing Atlas events preserved, original order and keys | **151** |
| Existing reading sections preserved | **37** |
| Published editorial reference evidence retained via v7 master | **460** |
| Current Atlas anchors of >=25 verses, same chapter | **22** |
| Current Atlas anchors of <=4 verses, same chapter | **9** |
| Rows participating in exact same-chapter overlapping Atlas references | **4** (two pairs) |
| Milestones with a proposed granular split | **41** |
| Candidate child units beneath those 41 milestone anchors | **101** |
| Net reading-unit increase if proposed subdivisions approved | **+60** |
| Other proposed reading topics outside existing event scopes | **+53** |
| **Illustrative count if *all* candidates accepted** | **264** |
| Scripture readings editorially approved | **0** |
| App migrations, newly minted geography pins, historical event mutations | **0** |

### Illustration of why one Atlas milestone need not mean one Scripture reading

* **1 Kings 8:1–66, Temple dedication**: arrival of the Ark (1–13), Solomon's blessing (14–21), his dedicatory prayer (22–53), blessing and sacrifices (54–66). The [Catholic Bible chapter](https://bible.usccb.org/bible/1kings/8) explicitly distinguishes these movements.
* **Acts 2:1–41, Pentecost**: outpouring of the Holy Ghost (1–13), St Peter's preaching (14–36), conversion and baptism (37–41); compare [Acts 2](https://bible.usccb.org/bible/acts/2).
* **John 6:24–59, Bread of Life**: seeking bread (24–34), Christ the Bread from heaven (35–50), His flesh as true food (51–59), plus *missing conclusion* 60–71 proposed as a separate reading candidate. Compare [John 6](https://bible.usccb.org/bible/john/6). **This is a proposed navigation split, not permission to weaken the Eucharistic meaning.**
* **Matthew 5:13–48** currently begins after the Beatitudes and combines six distinct teachings; Matthew 5:1–12 should also be separately available.
* **2 Kings 25:1–12 / 25:8–12** and **Luke 2:41–52 / 2:51–52** are overlapping pairs: keep chronological event identities but avoid treating these as two separate mandatory duplicate readings.

Every child range within each proposed same-chapter split is **contiguous, non-overlapping and exhausts its original Atlas anchor**. This was checked against all 41 proposals. The exact candidate references still require Bible-edition, context and historical-genre editorial review.

## 73-book completeness: a more serious gap than event count

The Catholic canon comprises **46 Old Testament and 27 New Testament books** (Catechism §120; [official Vatican reference](https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/article_3/iv_the_canon_of_scripture.html)). The historic Atlas references explicitly name passages from **28 of the 73 books**. The 53 supplemental candidates expand that to **38 books**. **35 Catholic books still have no proposed reading** in this first granularity package.

The unrepresented-book queue includes one Torah book, three historical books, three poetry/prayer books, twelve prophetical books and sixteen apostolic letters. The Psalms, Leviticus, the Minor Prophets, 1–2 Chronicles, and substantial epistolary material need independent literary reading coverage. **These are book-presence counts, not full-book coverage certifications.**

Adding exactly one unit for every remaining book would give an *arithmetic* minimum of 299 candidates, **not** an adequate complete curriculum. Many books require several selected passages; do not invent a target total or claim a programme of 299 covers the Bible.

The Bible editions already chosen for Ad Orientem remain fixed. Differences in Vulgate/Catholic Esther, Daniel and Psalms numbering require a separate source crosswalk. Psalm verse ranges have therefore **not** been guessed in the first supplemental set.

## Required subsequent decisions (in order)

1. **Triage proposed splits:** For the 41 parent milestones, decide whether each 2–6 part division is meaningful as an independent *reading unit*; do not create independent Atlas timeline events automatically. Preserve original event keys and all artwork/map/person joins.
2. **Literary representation:** Review the 53 supplementary readings as proposed new reading topics, then systematically work through the 35 unrepresented books. Associate such readings with a literary/genre navigation path as needed; **never fake a historical date, pin or itinerary for them**.
3. **Source comparison remap:** Compare each proposed unit to the v7 460-source ledger by exact Scripture range and publisher/original-editor identity. Assign `direct`, `partial overlap`, `parallel`, `broader`, `different numbering`, or `no verified match`. **One publisher's long selection touching three child units is still one publisher selection, not three independent editorial endorsements.**
4. **Scripture textual review:** Examine intelligibility, omission effects, quoted dialogue and causal context using the **already approved Ad Orientem Bible editions**. Preserve exact source Scripture, not AI-authored narrative bridges. Distinguish essential/extended/full display tiers only after editorial scrutiny.
5. **Reconcile to UI last:** Plan a stable reading-unit registry with references to parent Atlas milestones. This does **not** revise the original 37 sections, 151 Atlas events, mass module, Scripture translations or sacred-art relationships.

## Hard release boundaries
All candidate IDs have `reading-candidate:` prefix and are **proposals, not production canonical identifiers**. All 151 Atlas keys remain unchanged. All 460 v7 source rows stay traceable and unaltered. No verse selections have been approved. Do not change the live app, native reader, Bible versions, Schuster pipeline, or map, and do not claim 264 candidate units constitute complete 73-book coverage.

**Regression:** `tests/biblical-scripture-reading-granularity-audit.mjs` verifies 151 canonical IDs, 37 existing sections, 460 unmodified source citations, all 41 split partitions, all 154 new candidate IDs and 73-book completeness arithmetic. CI execution status requires separate confirmation.
