# P2 Living Traditional Sanctoral — source-date research batch (2026-10-16)

Immutable baseline: `359ed283ebc6dd28797039c9667791c80323c271`; independent `research/1224-modern-sanctoral-dates`. This work is **research data only**, not a Calendar/Mass runtime modification.

## Verified baseline and measured progress

- Canonical individual IDs **293**, group IDs **13**.
- Baseline date registry: **26** date edges; **21** individual identities and **5** collective groups covered.
- After new, source-visited batches: **87** dated individual identities, leaving **206** undated (net backlog reduction **66**).
- Evidence ledger now **98** edges including **72** newly researched edges.
- **10** people with pre-existing Vatican-decree or recorded papal General Roman evidence; new Dicastery profiles add **zero** claims of universal-calendar authority.
- **9** group IDs with a dated source witness.
- New date-profile coverage: **9** canonisation-year collections, with 42 of the 51 already-indexed source-year collections still to harvest for dates.

## Source discipline

Sources for each new edge use the exact visited `causesanti.va/it/santi-e-beati/...` profile URL and the field `Memoria Liturgica`; the date claim is recorded in Italian. The source's publication/effective date is **not asserted** when absent. We preserve `canonizationNotBefore`, but do **not** treat it as proof of memorial promulgation. Research evidence is assessed as of 2026-10-16, not retrojected automatically to 1962, pre-canonisation years, or earlier modern years.

An additional source explicitly identifies 17 June in the proper calendar of the Franciscan Elizabethan Sisters for **Ludovico da Casoria**, distinct from the profile's 30 March date. The Carmel witness specifies **12 July** for **Louis and Zélie Martin**; the Dicastery profile also gives 29 July and 28 August without documenting a separate universal feast. The papal beatification letter reproduced in the Dicastery's **Francisco and Jacinta Marto** profile establishes a **joint 20 February** feast only in permitted places and according to law, not a universal or traditional 1962 observance.

Never infer traditional Mass eligibility from any date edge. P1 owns formularies, cum sanctissima and juridical permission adjudication. P0 owns the production 1962 resolver, historical calendar projection, precedence and app presentation. This branch changes neither owner.

## Machine-readable handoff

- `living-sanctoral-ultra-master.v1.json`: exhaustive 293-person + 13-group subject matrix.
- `living-sanctoral-date-evidence.v1.json`: original and new source-to-date evidence with URL, source claim, scope, and recognition/effective-date distinctions.
- `living-sanctoral-authorities.v1.json`: source-competence and jurisdiction classes.
- `living-sanctoral-effective-dates.v1.json`: date-effective and Doctor-declaration crosswalk.
- `living-sanctoral-identity-reconciliation.v1.json`: aliases, group policy, evidence contradictions.
- `living-sanctoral-review-queue.v1.json`: undated subjects and 42 unmined (for memorial dates) already-indexed source-year collections.
- `living-sanctoral-compatible-export.v1.json`: non-published compatibility projection; every candidate `eligibleForRuntime=false`.
- `living-sanctoral-new-source-batch.v1.json`: nine-year Dicastery source batch for reproducibility.
- `tests/calendar-living-sanctoral-research-p2.mjs`: structural, identity, scope, effective-date, coverage and no-runtime claims.

P0: ingest only after verifying authority, applicable jurisdiction and source effective date; retain `saint.*` and `canon-group.*` IDs, respect existing 1962 rank and Mass. P1: use subjectId + date edge + source URLs solely as input to separate traditional Mass authorization/formulary research. No merge or deploy.
