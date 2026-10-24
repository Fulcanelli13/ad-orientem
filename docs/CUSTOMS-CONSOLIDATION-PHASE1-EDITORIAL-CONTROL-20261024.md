# Customs Consolidation — Phase 1 Editorial Control (24 October 2026)

## Deliverable and interpretation

The **existing Customs register** now has an auditable identity/priority derivative at `data/customs/master/customs-consolidation-phase1-408-decisions-priority50.v1.json`. An Excel export with all original master and source groups plus identity, coverage and priority sheets was prepared as **`Ad_Orientem_Customs_Registry_Consolidation_Phase1_2026-10-24.xlsx`**, SHA-256 `779038792096570926cfe1530e0929f4f6947719033d1bcb201181a36f62c46e`. The Excel download is an editorial snapshot; GitHub remains the canonical source of record. The XLSX itself is not attached to this GitHub branch.

**No source or publication state was advanced merely by producing the workbook.** Master has 56 identities (35 `PUBLISHED` metadata, 3 `CONTEXT_ONLY`, 18 `NOT_APPROVED`), and there are 408 provisional working groups (47 prior owner candidate relationships, 150 first-screened, 211 second-screened). Those 464 IDs are not 464 distinct practices. The observational corpus count of 3,703 (including 718 Pitrè observations) is not additive to either identity count.

## New identity register

The 408-group phase-1 file retains:
- Original provisional IDs, labels, source observation IDs, page pointers and original geographical wording.
- Whether each came from the earlier 47 owner candidates or the 150/211 later source-label screens.
- Prior candidate owners and reversible action-level relationship hypotheses, with explicit **NOT_APPROVED** values for every new identity and merge.
- Whether one of **30** original 1958 Weiser facsimile priority passages was actually checked (and its printed folio), rather than falsely implying original-source verification for the other 378.
- Proposed Calendar release-subject crosswalk, including dual-feast Seville Seises, Polish wreath blessing/home use, distinct lay doorway chalking and priestly house blessing, and German/Austrian Advent image variants.

The workbook adds a human-editable `Identity Decisions` tab and `Identity Clusters` tab (12 researched family hypotheses); a cluster is neither a union of verified unique IDs nor authorization to publish.

## Country × liturgical season coverage

The Excel sheets `Country Season Links`, `Coverage Detail`, `Coverage Matrix` and `Published Matrix` reconcile **584 source-area associations** covering **33 named countries and two unspecified/worldwide context labels**. Each association is assigned **one convenience editorial season bucket** for coverage review. The 12 buckets are Advent; Christmas/Epiphany; Pre-Lent/Lent; Holy Week; Easter/Eastertide; Rogations/Ascension; Pentecost; Corpus Christi; Marian (May/Aug/Sep); Autumn/Holy Souls; Saints/other feasts; and personal/undated occasions.

These numbers are **source-area/season associations, not the number of distinct historically verified customs, not attendance, and not currently available parish services**. A country with no `PUBLISHED` *country-tagged* record does not lack Catholic tradition or universal devotions. A generic European source label or label-only country inference is not a verified local attestation. The 1962 Calendar, not the workbook's heuristic season mapping, retains feast dates and observance precedence. These matrices are regenerated snapshots, not a second Calendar.

## Queue of 50: correctly gated

Exactly 50 review subjects:
- **5** English/French articles already complete as editorial candidates in PR #1610 and previewed in PR #1620; they are NOT approved or released.
- **18** source-linked but `NOT_APPROVED` existing master identities. Most have multi-source regional evidence; verify country/rite/editorial claims before promotion.
- **27** working Weiser groups selected for geographic/seasonal breadth and action-level adjudication; these are **not publication-ready**, even when a first original folio was visually inspected.

Queue position is editorial priority, not an approval. Score fields explain source-evidence quality, geographical relevance and ritual/folklore risk. We should prefer the strongest 5 + 18 for the next actual approval effort and put the 27 through identity/source gates first.

## First human adjudication priorities

1. Complete exact ritual authority review for Epiphany priestly blessing, separating it from family chalk marking and ensuring no lay imitation of priest-only formulas.
2. Verify the Seville Cathedral *Seises* is **one local identity with two separate feast hooks**, and do not synthesize event times for other parishes.
3. Verify Polish Corpus herb-wreath blessings as regional parish practice and do **not** manufacture a universal 1962 liturgical octave.
4. Approve or reject English/French final text and specific localized Calendar associations for the five complete articles.
5. Evaluate the source-rich unpublished master candidates: Advent `Herbergsuche`, St Barbara branches, Polish Christmas household practices, Quebec's charitable `guignolée`, Maltese Easter procession, and Italian Marian local processions. Keep historical/folkloric material separate from recommended devotion.
6. Resolve 12 high-value owner family hypotheses and maintain confirmed vs suggested relations distinctly.

## Next release gate

Work with the **existing** `src/calendar/customs-read-model.js` and Calendar UI on current main. Never add another Calendar or Customs Atlas. No source-label triage, title-based geography, review score or research draft authorizes `PUBLISHED`, an additional `custom_id`, an official Roman blessing, or an assumed live parish service. Final publication needs source and geographical verification, 1962 ritual boundaries, owner/variant adjudication and EN/FR editorial signoff. The already published 35 are preserved.

See:
- [Customs research and identity PR #1610](https://github.com/Fulcanelli13/ad-orientem/pull/1610)
- [Existing Calendar preview PR #1620](https://github.com/Fulcanelli13/ad-orientem/pull/1620)
