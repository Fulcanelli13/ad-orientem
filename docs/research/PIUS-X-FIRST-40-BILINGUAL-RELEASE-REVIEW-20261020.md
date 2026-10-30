# St Pius X — first 40 bilingual answer-release review

**20 October 2026. Research/editorial triage only. Neither ChatGPT nor an editor's recommendation constitutes independent doctrinal, source, translation or historical-voice certification.**

## Deliverable and scope

The source-owning [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458) now contains:

- `data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json`: **100 exact existing opening-turn answers** (not all 200 original opening/follow-up turns), linking their source-owned English/French draft, numbered **editorial** 1905 Catechism question locators, original digital witness, ten earlier corrected variants where applicable, first-wave period-style variants and historical risks. Original answer-owner shards remain unchanged. **40** selected for the first release-readiness editorial wave and **60** held in the browseable backlog.
- `previews/visible-mass-3d/pius-x-batch-release-editorial-review.html`: bilingual, accessible source-first batch workbench; responsive, with source links, the preserved draft and correction alternatives, edit-in-place textareas, five reviewer-only assessment fields, narrative remarks, bulk queue/hold decisions, optional filters and a self-contained JSON export/import.
- `tools/formation/build-pius-x-release-review.mjs`: reproducibly embeds the canonical 100-record content in a **single offline HTML**; no third-party runtime and no requirement to run a development server.
- `tests/pius-x-100answer-editorial-release-triage.mjs` and `tests/pius-x-40batch-editorial-browser.mjs`: ownership/approval-state tests and Chromium phone/desktop review, variant-edits persistence, JSON export and import, bulk holds, bilingual switching and the historic/disciplinary caveat.

## First 40: ten items per topic

| Workbench batch | Editorial question IDs (from Museo digital numbering, *not* physically printed in 1905 book) |
|---|---|
| Real Presence and Consecration | Q596, 597, 598, 602, 604, 605, 607, 609, 610, 612 |
| Eucharistic doctrine and worship | Q613, 617, 618, 619, 620, 621, 622, 623, 625, 626 |
| Communion and preparation | Q624, 627, 636, 637, 638, 639, 641, 649, 650, 665 |
| Sacrifice of the Mass | Q651, 652, 654, 655, 656, 657, 658, 659, 660, 663 |

The initial entire 100-question register has these **source-risk routing categories**:

| Lane | Number | Meaning |
|---|---:|---|
| Standard Italian-source and translation review | 57 | Not automatically approved; demands source, EN/FR and historical voice review |
| Precision review | 13 | Technical distinction or revised bilingual candidate demands closer textual/doctrinal check |
| Historical/pastoral hold | 30 | Historic canonical/ritual or personal-conscience propositions must be explicitly delimited |

**40/100 editorial-priority suggestions is not 40 approved replies.** There are zero source-certification, independent theological, EN/FR, period-voice or publication approvals in the generated artifact.

## Source risks and response-level examples

The original Italian remains the controlling witness ([Museo San Pio X, *Parte quarta dei sacramenti*](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/)). A source reviewer should pay close attention to:

- Q607 (transubstantiation) — original definition and continuing species; the combined Q596/607/609/610 support is provisional pending claim-level collation.
- Q619 (whole Christ present even in a particle) — relation to Q641, where the continuing sacramental species and duration of presence are considered.
- Q652 (the general definition of sacrifice) — corrected paraphrase must not replace destruction *in some manner* with the broader and misleading “change or destruction.”
- Q655 and Q660 (the Sacrifice of the Mass and Christ its principal offerer) — scope of the shared Priest-and-Victim claim.
- Q657 (distinct consecrations) — the concomitance and hypostatic-union qualification must not disappear in a shorter stylistic answer.
- Q649–650 and other historical rubrical/disciplinary material — distinguish the original 1905 discipline and advice from later decrees and current universal rules; no personal determination of fitness for Communion or confession.
- Q665 (modesty and devotion in attending Mass) — catechetical instruction; avoid an automatic present-day postural prescription.

The original **1905 printed Catechism uses unnumbered D. / R. questions**. Displayed `PX1905-Q...` values are editorial concordance locators, not citations to printed original question numbers. Whenever possible, attach the original printed-page witness or the Italian question incipit after expert verification.

**Denzinger is optional and is not a release gate** for St Pius X. If an independently verified original magisterial passage genuinely supports a specific claim, it may supplement the original Catechism reference, without delaying this review.

## Editorial workflow

1. Download the `SPX-40-Answer-Bilingual-Editorial-Batch` GitHub Actions artifact and extract `SPX_40_Answer_Editorial_Batch_Review.html`.
2. Open the HTML locally, select one of four groups of ten or the 60-question backlog, inspect the original draft, optional correction and (where available) stylistic experiment.
3. Edit English/French candidates as needed. Choose **For expert review**, **Needs revision** or **Hold**; per-item checkboxes mean editorial work was performed, **not** independently certified.
4. Use **Export decisions** to save `SPX_40_Batch_Editorial_Review.json`. Subsequent edits can be continued by **Import decisions**; imported JSON is validated and cannot itself trigger publication.
5. Bring the review JSON back to the Formation content owner for a source-and-style reconciliation pass. Authoritative release requires separately documented source, doctrinal, EN/FR, historical-voice and dated-discipline approval. Preserve original drafts and all secondary supporting questions while reconciling.
6. Only after those gates does any new answer become a candidate for the already-tested P2 Living Church character integration. Never bypass the existing P2 owner.

This process intentionally concentrates the earliest review time on 40 important original doctrinal questions, without demanding verification of every old Denzinger number or falsely certifying all 810 existing conversation families at once.
