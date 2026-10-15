# Formation content integration — sourced corrections and visible retained cases

**14 October 2026 · Focused integration from research PR #1198 · Base: `main` · Unpublished certification states preserved**

## Direct outcome

This branch modifies the **actual eight canonical research content packs loaded by `src/learn/formation-recovery-review.js`**. It does not merely deposit another independent research ledger.

- **141 canonical Apologetics and Church Crisis dossiers remain uniquely owned**, with their original 60/81 splits and four standard bilingual sections each. No IDs added or dropped.
- **27 existing APOL/CR owner records changed**, involving **55 bilingual section revisions or source-linked addenda**. The original English and French draft text was retained wherever not directly revised.
- All changed paragraphs have original HTTPS source IDs registered **in the same pack** used by the app. This is important because several historical source IDs in different packs denote different witnesses.
- The canonical research **`publication_allowed=false`** and all per-owner `original_claim_by_claim_source_context_certified`, `native_french_copyapproval`, and `independent_theological_canonical_approval` flags **remain false**. There is no automatic reclassification as finished doctrine.
- Two displaced cases, Adam/evolution under APOL-002 and Vatican–China governance under CR-GOV-01, are stored once in `data/learn/formation-retained-evolution-china-case-records-20261014.v1.json` and now display as separate expandable **historical case studies** in the editorial reader, **after the corrected canonical answer**.

## Core substantive changes

| Owner(s) | Integrated correction |
|---|---|
| **APOL-002** | Correct answer to **faith and reason**, with `Dei Filius`, `Fides et ratio` and David Hume; original evolution/Adam research retained and visible as a related case |
| **APOL-001 / 007 / 009** | Hume's original philosophical objection; Josephus as bounded non-Christian witness; Bart Ehrman's actual historical argument on Resurrection and method |
| **APOL-053 / 058** | Social Kingship and temporal authority explicitly grounded in Pius XI and Leo XIII; Paul III's 1537 original anti-enslavement text and Vatican 2023 historical acknowledgement **added without removing the Canadian TRC's original testimony** |
| **CR-DOC-05 / 09 / AUT-05** | Doctrinal public Kingship, debate over non-definitive teaching and the practical steps of Catholic fidelity separated into their proper owners |
| **CR-ECC-09 / 11 / 12** | Actual first-party sedeprivationist and conclavist arguments distinguished; doctrinal synodality separated from the **ordinary papal Magisterium** status of 2024 final Synod document and its **not-strictly-normative** application |
| **CR-GOV-01–03 / 06 / 09** | Responsible institutional actors rather than a displaced China example; U.S.-scoped CARA evidence; original Roman liturgical-abuse diagnosis; accurate positive/limited 2024 MONEYVAL compliance framing |
| **CR-LIT-04–08** | Cover letter vs authorship of Ottaviani–Bacci critique, actual sacrificial-prayer changes, lectionary cycle architecture, and cautious Protestant-observer evidence |

## Published Sexual Ethics changes

The public Sexual Ethics module is a separate data architecture:

1. **CSE045:** its eight-stage expanded debate was off-topic (chiefly marriage and childlessness despite a question on spousal headship/submission). Replaced with a bilingual argument directly contrasting `Casti connubii` §§26–29 and `Mulieris dignitatem` §24. Original canonical short answer and source IDs remain intact; domination or coercion is never legitimated.
2. **CSE068:** added the original 1975 CDF `Quaecumque sterilizatio` responses as a direct linked source for direct sterilisation, retaining the existing distinction from genuinely therapeutic care.
3. **CSE031:** the consent/ceremony distinction was already substantially present in its canonical short answer and expanded `catholicCase`. No redundant rewrite; the researched overlay remains only as integration provenance.

## Validation and remaining gate

**Repo-content validations performed:** eight JSON packs parse; **141** unique canonical owners; **564** source-linked EN/FR sections; **55** updated sections; every source link resolves to a registered HTTPS URL in its own pack; no blank documented-opponent attribution; source-count metadata reconciled. Four affected JavaScript files pass isolated V8 syntax compilation (`formation-recovery-review.js`, `debates-035-064.js`, `questions-051-100.js`, `sources.js`). The existing first-pack regression is changed narrowly to require retention of all 32 original source IDs while allowing new sourced IDs.

New automated Node regression file `tests/formation-integrated-owner-corrections.mjs`; runnable with `npm run test:formation-integrated-corrections`. **This command and the full browser suite have not been executed in a Node runtime during this connector-only pass.** Do not claim they passed; run CI checks before promotion.

Still outstanding for actual publication of APOL/CR material: claim-level theological/editorial approval, native French proofing, and any issues flagged by CI/browser preview. In particular, CR-MOR-06's full first-person proponent attribution for the stronger fundamental-option thesis remains a **separately labelled evidence gap**, not a reason to misattribute that thesis to Josef Fuchs. The user-approved rule continues to apply: accurately attributed passages suffice for bounded claims; entire-book access is not a universal gate.

**No Catechism records, Mass reader, Sacred Art, Sacred Geography, map directory, or other modules modified.** The PR may be merged to update the app's editorial review reader after CI checks, without making the 141 draft APOL/CR dossiers public lessons.
