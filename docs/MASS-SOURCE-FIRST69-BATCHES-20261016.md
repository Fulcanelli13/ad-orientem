# Source witness consolidation — 69 research claims / 37 loci / 5 works

16 October 2026. Source-of-truth inputs: the 16 October 41-tab Ultra Master Matrix and merged `data/learn/research/mass-moment-author-evidence-review-20261016.v1.json` (139 author claim records), with existing Formation/Mass study and reference owner contracts.

## What was consolidated

The 69 Matrix entries labelled `PASSAGE VERIFIED` are *research candidates*, not necessarily edition-checked quotations. Grouping the **exact existing source locator string within each author** produces 37 distinct candidate passage batches.

| Historical owner | Claim associations | Locus batches | Known witness stage |
|---|---:|---:|---|
| St Alphonsus de Liguori | 36 | 15 | No single original language/edition and pagination pinned |
| Dom Prosper Guéranger | 11 | 10 | Posthumous conference-note compilation: online derivative transcript located; verify original French edition/editor |
| Fr Nikolaus (Nicholas) Gihr | 12 | 8 | 1902 B. Herder scanned witness located, printed pp. 627–717 claimed; no checked page images/text |
| St Thomas Aquinas | 6 | 2 | Corpus Thomisticum critical Latin text reference for `Summa Theologiae` III q.83 a.5 ad 3–4; no paired original/certified translation |
| Roman Catechism | 4 | 2 | English-transcription witness lead; original Latin edition and translation not collation-certified |
| **Total** | **69** | **37** | **0 publication-cleared paragraphs** |

The sources are explicitly **candidate witness leads**. Links to externally hosted works do not certify particular pages, variant readings, authorship of later editorial interpolations or reproduction rights. The 37-locus count is a grouping of research locators, not 37 independent certified excerpts.

## Reuse and protection

- Existing Formation `learn.mass` owns the single Guide moment presentation.
- Existing 139-claim evidence registry owns claim IDs and editorial review, including individual decisions.
- The 37-locus review **reuses the same editorial local-storage map and JSON export**. A batch decision applies to all its linked research claim IDs; individual claim decisions remain editable. No second saved review register or conflicting approval state.
- Source reading and publishing must eventually use `src/reference/passage-packs.js`, `src/reference/passage-reader.js`, `src/learn/source-reference-panel.js` and the canonical source/edition identity checks. No alternative ebook library, source parser, full text or quote UI is created.
- The 32-moment Study / LIVE Missal / Mystery of the Mass / Bible Atlas / Calendar / Art continue as independent canonical owners.

## Editorial operations

Open the historical GitHub Pages app using `?massEvidenceReview=1`, then Formation → Understand the Mass → 32 Mass moments, expand **Batch-check the 69 strongest research claims**, choose an author and inspect their grouped original research locators. A bulk triage selection of `PRIORITIZE_COLLATION`, `QUESTION_SCOPE`, or `DO_NOT_USE` applies to the linked claims and is exportable as JSON using the existing source-review export button. No interface choice can approve source text for publication.

Priority verification order is based on batch *readiness* and literary exactness, not author prestige:
1. Aquinas: 2 exact scholastic article loci, Latin critical text witness located. Collate exact words and interpretation context and check translation rights.
2. Gihr: 8 printed-page loci with an identified 1902 scan. Match actual printed pages; compare pagination and edition before copying the English.
3. Roman Catechism: 2 topical loci. Locate a precise authorized Latin edition and identify licensed/historical translation.
4. Guéranger: 10 note-sections. Establish original posthumous French publication/editor and whether commentary attribution is direct or mediated.
5. Alphonsus: 15 prose loci. Pin original title/language and edition, then translate/adopt the original rather than use an unidentified contemporary English paraphrase.

None of these steps requires individually reviewing all 69 claims before checking the 37 shared locators. A single source-image/edition check can resolve a group of candidates, but it cannot automatically validate all their theological inferences.

## Publication gate

All six must be independently true for a **specific passage**:
- primary printed page or separately qualified critical text visually checked;
- exact author wording, edition, source locale and section confirmed;
- claim interpretation/typology carefully attributed;
- English/French translation and reproduction rights cleared;
- explicit editor/owner publication approval recorded;
- existing source-pack passage identity, hash, locus, publication status and reader contract validated.

**Current counts: 0 of 37 loci visually certified, 0 of 69 claims publication approved, 0 local source passages reproduced.** Broad `PASSAGE VERIFIED` research grades are retained as they appeared in the Matrix but not promoted into a new certification state.

## Scope and tests

New standalone source-locus batches research JSON, pure audit/presentation adapter, optional grouped source-triage view, static unit and phone interaction acceptance, all under the existing source-review opt-in. No Mass reader or source text mutation. Only merge with dedicated tests and core CI green, leaving the next actual source transcription/release for independently reviewed source-pack work.
