# Ad Orientem Formation — Correction Integration Staging

**14 October 2026 · Branch `research/formation-25-book-coverage-matrix-20261014` · PR #1198 (draft/unmerged)**

## What has been edited in actual working source files

The accumulated independent audit covered **291/291 canonical Q&A owners** (150 Sexual Ethics, 81 Church Crisis, 60 Apologetics). This turn moved correction proposals out of disconnected JSON overlays and **into the existing editable research data structures on the PR branch**. It did **not** merge or publish the 141 formation dossiers. These are still editorial drafts, with paragraph-level and native French acceptance flags left false.

### 27 four-role bilingual Formation research dossiers staged

**Apologetics (6):** APOL-001, APOL-002, APOL-007, APOL-009, APOL-053, APOL-058. Actual source files:
- `data/learn/formation-canonical-synthesis-batch2-2026-10-09.v1.json`
- `data/learn/formation-canonical-sourcefirst-batch4-2026-10-09.v1.json`
- `data/learn/formation-canonical-sourcefirst-batch5-2026-10-09.v1.json`

**Church Crisis (21):** CR-DOC-05, CR-DOC-09, CR-MOR-01, CR-MOR-06, CR-IDM-05, CR-IDM-06, CR-ECC-09, CR-AUT-05, CR-GOV-01, CR-GOV-02, CR-GOV-03, CR-GOV-06, CR-GOV-09, CR-ORG-05, CR-ORG-09, CR-LIT-04, CR-LIT-05, CR-LIT-07, CR-LIT-08, CR-ECC-11, CR-ECC-12. Actual source files:
- `data/learn/formation-canonical-synthesis-batch1-2026-10-09.v1.json`
- `data/learn/formation-canonical-synthesis-batch2-2026-10-09.v1.json`
- `data/learn/formation-canonical-synthesis-batch3-2026-10-09.v1.json`
- `data/learn/formation-crisis-sourcefirst-batch6-2026-10-09.v1.json`
- `data/learn/formation-crisis-sourcefirst-batch7-2026-10-09.v1.json`
- `data/learn/formation-crisis-sourcefirst-batch8-2026-10-09.v1.json`

All 27 keep the canonical ID, four-role structure and EN/FR text. Added original-document source records and claim locators are stored in each file's `source_registry`, with each amended role carrying valid `source_ids`. Validation of **141/141 research dossiers** across the eight edited draft source files found **0 unresolved source IDs, 0 blank roles, 0 uncited sections and no altered four-role structure**.

Where original wording was substantively off-topic or materially erroneous, the relevant roles were replaced; where the existing content was sound, the additional original-source material was appended rather than discarded. All 21 pre-integration Crisis originals are archived verbatim in `data/learn/formation-preintegration-21-church-crisis-originals-20261014.v1.json`.

**APOL-002 is now corrected in the actual original authoring dossier:** all four roles address **faith and reason**, grounded in `Dei Filius`, `Fides et ratio` and Hume. The previous four-role draft on evolution/Adam/polygenism remains completely preserved in `data/learn/formation-apol002-evolution-research-preserved-20261014.v1.json` and may be offered as a linked special case, **not another canonical question**.

### 3 Sexual Ethics items staged in the existing source data

- **CSE031**: appended the marriage/consent clarification to the existing `response` in `src/learn/sexual-ethics-data/debates-001-031.js`, preserving the prior opposition and Catholic case.
- **CSE045**: substituted a stronger documented cross-era Catholic tension about spousal headship/submission into `opposition`, and added the answer explaining Pius XI and John Paul II's distinct formulations in `response`. Applied to `src/learn/sexual-ethics-data/debates-035-064.js`. This is an **intra-Catholic interpretive dispute** rather than a hostile secular argument; its characterization must remain clear.
- **CSE068**: linked the 1975 CDF `Quaecumque sterilizatio` as an additional exact primary source in `src/learn/sexual-ethics-data/questions-051-100.js` and registered `CDFSTER1975` with its original URL in `src/learn/sexual-ethics-data/sources.js`. Existing clinical and doctrinal answer wording retained.

This affects **30 existing canonical IDs total**: six Apologetics, 21 Crisis and three Sexual Ethics. The overlay proposals remain attached as evidence provenance rather than abandoned research.

## What the integration check establishes and does not establish

**Established structurally:** 27 altered EN/FR four-role dossiers remain valid JSON; no source-ID dangling references across the complete 141 research dossier records fetched; existing canonical IDs remain stable; 21 pre-integration Crisis records and the misplaced APOL-002 essay have recovery archives. Additional source records are referenced in the changed roles.

**Not established:** browser or mobile rendering of the Formation module, runtime import/build of the JS Sexual Ethics data, comprehensive check of every URL's eventual accessibility, native French theological signoff, professional clinical/legal review, or merge readiness. Do not promote `original_context_approved` or `french_final_approved` to true merely because a source URI and locator exist. This is a staged branch-level integration, **not an app release**.

## Next concrete release gate

1. Review the **30 changed owners only** for quotation fidelity, relative authority, English/French style and paragraph-level hyperlinks; resolve discrepancies instead of opening another 291-question audit.
2. Check actual app runtime/build wiring and do a mobile reader smoke test for CSE031, CSE045 and CSE068; verify the research dossiers are routed into the relevant learn/Formation UI before publishing them.
3. Reconcile with any concurrent Formation work and the main branch before merge. Do not overwrite verified more recent text from other pipelines. Keep source archive and correction provenance.
4. Explicitly decide whether/when to merge the completed corrections from this draft PR. Until then, report **291 screened / 30 source edits staged / 0 published through PR #1198**.

No mandatory whole-book retrieval is part of this gate; correctly cited bounded passages suffice for their actual claims.
