# Did You Know? — Bilingual Drafting Master (EN / FR)

> **CURRENT CLAUDE REVIEW POLICY:** EDITORIAL COPY REVIEW ONLY; no external source checking. See the section "Claude review task — EDITORIAL ONLY" below. Historical source-verification notes in this file record research workflow, not a task for Claude.

**Editorial direction, 10 November 2026:** DRAFT FIRST, REVIEW SECOND. Do not treat the old Customs-400 target as a maximum, and do not force every research candidate through full source certification before collecting more material. A large, sourced candidate bank is the goal. Claude performs a later independent editorial/source check. No candidate is automatically authorized for the Home feed.

## Files

- `ao-dyk-bilingual-draft-master-20261110.csv` — **1,328 bilingual candidate records**, UTF-8 with Excel BOM, 23 reviewable columns. Open in Excel and save as XLSX if preferred. This **is an Excel-ready CSV, not an XLSX workbook**.
- `ao-dyk-published-reference-h225-20261110.csv` — **225 already published Home facts** (201 historical/Ritus releases + 24 Glossary fallback cards). Never count these as newly drafted facts or re-publish a semantic repetition.
- Repository source records (canonical): `data/glossary/concepts-001-150.v1.json`, `concepts-151-300.v1.json`, `concepts-301-450.v1.json`, `data/glossary/source-registry.v1.json`; `data/research/did-you-know/dyk-customs-400-provisional-new-selection-20261110.v4.json`; historical Customs manuscript; original bilingual 190→310 growth drafts.
- The 400 provisional Customs records remain an input, not a publication cap.

## Data counts and meaning

| Track | Rows | Provenance | Review meaning |
|---|---:|---|---|
| GLOSSARY | 865 | 450 source-locked bilingual Glossary concepts, split at source-explanation sentence boundaries | **Extracted raw claims**, not yet editorially rewritten for Did You Know?; prioritize converting definition-like sentences into actual contextual discoveries |
| CUSTOMS | 355 | Current Customs-400 research selection, original editorial waves | Source-linked provisional EN/FR drafts |
| CUSTOMS_NEW_SOURCE_WAVE | 45 | Later research waves after Customs-400 first manuscript | Source-linked provisional EN/FR drafts, still subject to source proof |
| CUSTOMS_HELD_HISTORY | 45 | Original Customs manuscript records not in current 400 selection | Superseded, overlapping, or held; **not 45 additional unique approved discoveries** |
| CUSTOMS_EXTRA_REVIEW | 6 | Earlier growth draft, not in current Customs or manuscript | Unscreened; possible new historical-customs discoveries |
| MASS_RUBRIC_EXTRA | 12 | Earlier growth draft, not in current Customs or manuscript | Adjacent liturgical-fact lane, not to be confused with folk customs |
| **Total** | **1,328** | | **Draft / review rows, not 1,328 certified unique publication facts** |

## Editorial policy

1. Keep discovery copy **EN + FR** aligned in meaning. Use natural French terminology, not mechanical literal translation.
2. Prioritize concrete, interesting, situational information: **who did what, where, and when**. Avoid standalone dictionary definitions or vague "Catholics sometimes..." statements. A title/scope alone is not sufficient context for a reader.
3. Separate **CUSTOMS**, **GLOSSARY** and **MASS_RUBRIC**. Local folk customs are not universal Roman rubrics. Historical practice is not proof of current practice. A story/legend must be presented as such.
4. Do not mention **Weiser, Pitrè, source authors or museum cataloguers** in reader-facing facts merely as an attribution formula. Keep their exact book/page/anchor/URL in metadata.
5. Preserve source IDs, source URLs, old reader copy, and historical/page locators. When correcting a claim, propose revised bilingual text and a reason. Never silently rewrite or delete the source history.
6. **Many-to-many** associations are welcome: one source may support several distinct actions; one fact can cite several sources. Avoid generic content repetition (same ritual, same action, same festival) just to increase counts.
7. Published-reference CSV is a **hard cross-bank comparison set**. Duplicate questions should compare semantic substance, not just ID or text similarity. Excluded historical records should remain identifiable.
8. Keep drafting beyond 400 for Customs and beyond 450 concepts for Glossary whenever sources yield distinct factual observations. Put ambiguous or poorly supported claims in the review queue rather than blocking collection.
9. The 865 Glossary excerpts are **not authored as finished fact cards**; first-sentence rows often closely resemble definitions. Do not mistake the row count for editorially usable observations.
10. Do not merge research PR or publish to GitHub Pages solely because an Excel status was filled. **No Vercel deployments.**

## Claude review task — EDITORIAL ONLY (owner revision, 10 November 2026)

**Binding revision:** Claude is not asked to verify source material. Do not open the URLs, audit books or page locators, check historical primary references, or report source-certification outcomes. Such factual sourcing is a **separate research responsibility** and is not part of the editorial pass. The earlier source-audit instructions in historical notes of this README are superseded for Claude.

**Review artifact:** [Ad Orientem bilingual editorial-review workbook — 1,745 drafts](https://docs.google.com/spreadsheets/d/1i4RxqYuE8clRbB3_qFATxzOenEuCSsYhvpCXzsDm6CY/edit). It contains:

- **Claude Instructions**: full editorial brief and ideal example.
- **Editorial Review**: every candidate's Fact ID, original EN/FR, topic and scope, with separate green columns for Claude's verdict, issue tags, explanation, proposed EN, proposed FR, merge-target ID and interest/clarity scores.
- **Original Registry**: all 23 original CSV columns preserved unchanged for provenance; no edits.
- **Published Comparator**: 225 existing Home facts for **meaning/duplicate comparison only**, not source checking.
- **Review Progress**: counts by verdict, track and incomplete review fields.

### What Claude should judge

1. **Standalone sense:** the reader should understand who did what, where and when if necessary, without a glossary page or a previous card. Historical or regional scope must be stated in the reader-facing sentence, not only metadata.
2. **Ideal format:** a concrete, interesting Did You Know discovery, normally one or two compact sentences (roughly 25–60 English words); avoid uninformative definitions, repetition and trivia without a meaningful point.
3. **Bilingual equivalence:** natural English and idiomatic French express the same people, practices, dates, limitations and degree of certainty; correct grammar and Catholic terminology.
4. **Measured claim framing:** distinguish reported legend, popular belief, stage-play, folk performance, local custom, historical Roman use, and universal doctrine or rubrics. Flag implausible or uncertain claims as **QUESTION_OWNER**; do **not** try to check them against sources or invent new facts.
5. **Redundancy:** compare the workbook and published-reference texts for obvious repeated meanings. Consolidate microdetails about the same event by choosing **MERGE** and recording the retained Fact ID. Do not delete any row.

### Allowed editorial verdicts

- `KEEP`: suitable as written for copy quality.
- `REWRITE`: requires clearer wording, scope, interest or EN/FR alignment. Supply **both** fully revised EN and FR.
- `MERGE`: meaning overlaps another card; enter a merge-target Fact ID and an explanation; propose combined copy where helpful.
- `REJECT`: not an interesting or understandable Did You Know discovery and cannot be repaired simply by copyediting; explain briefly.
- `QUESTION_OWNER`: cannot resolve an ambiguity or apparent plausibility issue without facts outside the provided text; ask a precise question, with no invented details.
- `SKIP_HELD`: historical candidate already held/superseded; keep in the archive but skip the editorial rewrite.

**Data handling:** Fill only the green reviewer columns in **Editorial Review**. Do not overwrite source facts or source IDs; do not fill the source-check column in the archive or any **Owner approval** field. A `KEEP` verdict is **not** release approval or factual certification. Return the **complete workbook**, not an issues-only list, and include the review-progress summary. PR #2776 remains draft. No merge or deployment.

### Editorial example

EN: *In medieval England, some parishes erected a temporary wooden Easter sepulchre each Holy Week, then dismantled it after Easter.*

FR: *Dans l'Angleterre médiévale, certaines paroisses montaient chaque Semaine sainte un Saint-Sépulcre en bois provisoire, puis le démontaient après Pâques.*

This sample is geographically and historically scoped, self-contained and concrete. Do not use source-author names in the reader-facing fact.

## Proposed subsequent additions

Continue source-based drafting from verified Catholic custom books, local parish/customs calendars, museum records and the glossary expansion. Append new rows with stable IDs and a source pointer; never overwrite the baseline. Run cheap duplicate screening in batches, and let Claude perform the expensive factual and stylistic review after a large candidate pool exists.

## Wave 14 — source-grounded discovery expansion (10 November 2026)

- Previous unified draft master: **1328** candidate rows.
- Added this wave: **71** bilingual, source-linked rows (**38 Customs**; **33 Glossary/liturgical objects**), all in draft and kept separate from the published bank.
- Current unified draft master: **1399** candidate rows. The 225-row published comparison bank is unchanged.
- 0 proposed rows held during conservative lexical duplicate screening; see review flags and related IDs for weak overlaps in retained candidates. Lexical screening is not independent semantic certification.
- New sources: 21 web reference articles/pages, principally historical Catholic Encyclopedia entries plus Vatican News; direct URL and section/locator are recorded on every appended row. Original documents may need independent audit for narrow liturgical claims and historical scope.
- New stable IDs: `DYK-CW14-...` and `DYK-GX14-...`; new tracks: `CUSTOMS_NEW_SOURCE_WAVE` and `GLOSSARY_NEW_SOURCE_WAVE`. These should be treated as Customs and Glossary respectively for analysis, not as new publication categories.
- Entries include historically scoped Roman/medieval liturgical practice as well as regional customs; **do not infer these are current 1962 rubrics or universal practice.** Every entry remains **DRAFT_NOT_REVIEWED** pending Claude editorial/source QA and owner signoff. Nothing has been released, merged or deployed.

### Wave 14 duplicate-screening follow-up
Five more sourced Customs candidate rows (`DYK-CW14-039` through `DYK-CW14-043`) were appended from the already checked Candlemas and Processions sources. Current master **1,404 draft rows**; Wave 14 total **76 additions** (**43 Customs; 33 Glossary**). Three earlier Wave 14 rows were explicitly flagged as possible substantive overlaps rather than silently discarded: `DYK-CW14-018` (published Ember ordinations), `DYK-GX14-011` (published amice-cross gesture), and `DYK-GX14-020` (earlier Glossary ciborium/canopy distinction). These remain draft/history rows and should not be counted as three distinct new facts without review. No publication signoff is implied.

## Wave 15 — geographically diversified bilingual discovery drafts (10 November 2026)

- New candidates staged: **90** bilingual rows (**57 Customs**, **33 historical Glossary/liturgical-objects**), from **26** distinct page URLs. Master: **1494 draft rows**, formerly 1404. Published comparator remains **225**.
- **0** proposed items held for normalized-exact or high lexical similarity; **5** retained draft rows flagged for a possible weaker lexical overlap and requiring semantic review. All source IDs, URLs, historical/geographic scopes and review prompts are in the master.
- Customs source pool: UNESCO Intangible Cultural Heritage descriptions of geographically localized Catholic observances (Croatia, Belgium, Colombia, Switzerland, Guatemala, Poland, Panama, Venezuela, Luxembourg, Malta, Peru, Mexico, Belarus, Brazil, El Salvador, Italy and Bolivia). These describe community practices, NOT universal liturgical rubrics or definitive current opening times/annual schedules.
- Glossary source pool: original early-twentieth-century Catholic Encyclopedia articles on sacred vestments, tabernacles, Eucharistic vessels and church metalwork. Historical descriptions should not be interpreted as binding 1962 rubrics or proofs of historical origin where a claim is interpretative.
- Source review precision: source-link and topic mapping established; full sentence-by-sentence source certification and native EN/FR approval **remain pending**. Avoid splitting several observations of the same procession into multiple published cards without editorial consolidation.
- IDs follow `DYK-CW15-###` and `DYK-GX15-###`. Lane names reuse `CUSTOMS_NEW_SOURCE_WAVE` and `GLOSSARY_NEW_SOURCE_WAVE`. No new publication signoffs, merges, or deployments.

Wave 15 metadata follow-up: All 90 appended rows now have human-drafted French topic headings as well as bilingual fact copy. Two topic headings were corrected without changing the underlying historical claims. Structural uniqueness and source flags remain subject to final QA.

## Wave 16 — Africa, Indian Ocean and Asia expansion (10 November 2026)

- Baseline **1,494** candidate rows; added **91** English/French source-linked drafts (**64 Customs; 27 Glossary/history**), for **1585 total rows**. The 225 published reference facts remain separate.
- Proposed 91; excluded 0 exact or high lexical-overlap candidates; 0 retained rows need semantic overlap review. Lexical distinction is not independent factual certification.
- Custom geography: Mauritius, Seychelles, Angola, Uganda, Rwanda, India (Goa, Kerala, Mumbai), Sri Lanka, Indonesia (Larantuka), Philippines, Macao. Sources are local diocesan material, tourism/civic pages, Vatican News and Catholics & Cultures. Glossary sources are early Catholic Encyclopedia articles on fonts, baptisteries, Paschal candles, Exsultet manuscripts and older candle rubrics.
- Specific-event reporting (2014, 2024, 2026) remains **explicitly year-bounded**; never convert to timeless or current liturgical requirements. In particular, Uganda's **2026** national Namugongo pilgrimage was cancelled/decentralized; the usual gathering is described as historical/customary, not as having taken place in 2026.
- Holy Thursday Pesaha appam is **domestic commemoration, not sacramental Eucharist**. Kibeho is framed as **reported and Church-recognized private revelation**, not an article of faith. Folkloric actions and processions are **not universal Roman rubrics**.
- Complete 23-column contract retained; English/French topic headings and full bilingual drafts, source IDs/URLs, scope and source locators present. Drafts are not line-by-line certified and remain **DRAFT_NOT_REVIEWED** with final signoff blank.
- IDs: `DYK-CW16-###` and `DYK-GX16-###`. No merge, publication or deployment.

## Wave 17 — source-traceable customs and historic Glossary discoveries (10 November 2026)

- **Baseline:** 1,585 draft rows. **Appended:** 79 bilingual drafts (49 `CUSTOMS_NEW_SOURCE_WAVE`, 30 `GLOSSARY_NEW_SOURCE_WAVE`). **Current master:** **1,664** research rows, distinct from the separate **225** already published facts.
- 16 source pages recorded: 11 UNESCO intangible-cultural-heritage notices and 5 Catholic Encyclopedia historical articles. New stable IDs: `DYK-CW17-001..049` and `DYK-GX17-001..030`.
- Coverage includes Bolivia (La Paz, Tarija, San Ignacio de Moxos, Potosí), Venezuela (Saint John and Saint Peter festivities), Peru (Christmas dance), Poland (Kraków Nativity scenes), Spain (Berga Corpus Christi theatrical customs and Elche Assumption drama), and Guatemala (Rabinal Achí on Saint Paul's feast). The latter is primarily **pre-Christian Maya theatre associated with a Catholic feast date**, not Catholic liturgical content.
- Glossary topics: medieval rood crosses, chancel screens and lofts, church thuribles, processional crosses and standards, altar baldachins and altar canopies. The Catholic Encyclopedia (early 1900s) is a **historical reference**, not authority for any current liturgical law.
- UNESCO summaries are institutionally indexed, but **HTML full-page browser access sometimes challenges automated retrieval**. The records were drafted against available source descriptions, not full original nomination dossiers. The original claim-to-source check remains a Claude/editorial task. Source record/path identifies source title. The source locator is a claim topic, not a verified printed page number.
- **Quality boundary:** ID and English/French text uniqueness and 23-column structure were tested before the commit. Lexical checks did not identify exact/high-overlap repetitions; this does NOT certify semantic uniqueness or factual correctness. Different observations concerning the same feast may need consolidation rather than separate publication.
- Geographical, historical, non-universal, legendary and folk-theatre contexts remain recorded. `DRAFT_NOT_REVIEWED` and blank final signoff are mandatory. No Home release, merge, GitHub Pages deploy or Vercel use.

## Wave 18 — Angelus, historical devotions and sacramental objects (10 November 2026)

- Prior master **1,664** bilingual candidate rows. Added **81** rows (**56 Customs/devotional-history**, **25 Glossary/sacred-object history**) to yield **1,745** provisional research rows. The published **225-fact** comparator is a distinct, unchanged bank.
- All 81 appended records have full EN/FR reader copy and EN/FR topic labels, source identifiers, HTTPS reference URLs, article-section locators, historical/geographic scope, review priority and blank approval fields. IDs are `DYK-CW18-001..056` and `DYK-GX18-001..025`.
- Source pool consists of 11 directly inspected Catholic Encyclopedia articles: *Angelus*, *Angelus Bell*, *Holy Water*, *Way of the Cross*, *Confraternity of the Holy Rosary*, *Feast of the Holy Rosary*, *Benediction of the Blessed Sacrament*, *Bells*, *Agnus Dei* (wax tokens), *Salt*, and *Holy Water Fonts*. This is a **historical secondary source**; source-page reading is NOT a replacement for original-document checking where dates, contested origins or actual rubrical wording matter.
- Historically scoped examples include Cropredy (1512 Angelus hours), Syon (nine strokes), Lérida (1308 bells), medieval Roman holy-water blessing, local pre-Terce blessing times, variable Stations of the Cross, Cologne's Rosary confraternity, and old Eucharistic Benediction customs. These observations are **not 1962 universal ritual instructions**.
- **Glossary terminology caution:** Wax `Agnus Dei` discs are distinct from the Mass `Agnus Dei` prayer. A domestic sacramental is not a sacrament. `Angelus` is not an obligatory schedule for everyone; outdated indulgence rules should stay historically framed. `Bell baptism` is an informal expression for a blessing, not sacramental Baptism.
- No claims of miraculous medical results are made. Historically attested blessing formulas, supernatural interpretations and contested origin hypotheses must remain precisely scoped.
- Lexical exact-match and conservative overlap checks screened the existing master plus the published comparator. **4** candidate rows are retained with weaker overlap flags for Claude; zero were excluded by high-overlap threshold. Multiple details within one event or same source may still be semantically redundant and can be consolidated during review.
- No release signoff, merge or deployment. Preserve PR as draft.
