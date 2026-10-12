# Apologetics question recovery repository (working archive)

**IMPORTANT:** Recovery workspace *within the existing Ad Orientem source repository*, not a new standalone GitHub repository. It is intentionally placed on a review branch until source-integrity checks and user acceptance.

- `ALL_QUESTIONS.md` — readable master document listing all 282 extracted source records/dossier titles and documented objections.
- `questions.json` — 282 normalized source-file question records with provenance, original-owner references and editorial interlocutor facets.
- `APOSTOLATE_QUESTION_RECOVERY.md` — 8 existing live AQ titles and 10 proposed-only AQ titles, with provenance and explicit nonhistorical status.
- `questions.csv` — flat export usable for review/import.
- `manifest.json` — counts, checks and unresolved historical range census.
- `BY_INTERLOCUTOR.md` — 9 audience/category views into the same source records; editorial categorisation, not original recovered audience membership.
- `HISTORICAL_UNRECOVERED_POSITIONS.csv` — 576 A/C/TLM historical ID slots with clear missing/verbatim-evidence status, **not 576 recovered questions**.
- `CONVERSATION_SOURCE_LEADS.md` — dated previous-chat retrieval pointers whose complete verbatim question lists remain unavailable; excluded from record counts.

Derived only from current version-controlled source files, not from the inaccessible text of earlier conversations. The legacy 318 / 233 projected lists are **NOT** falsely filled in with surrogate questions. Every record includes a canonical source-file link. Intra-bank duplication and overlap are not silently deleted.

Current count: 282 source records, 12 banks. Publication/theology/French independent certification is outstanding.

Forensic original-question gap report: https://github.com/Fulcanelli13/ad-orientem/blob/main/docs/FORMATION-FORENSIC-RECOVERY-2026-10-08.md
## Validate

Run `node research/apologetics-question-recovery/validate.mjs` at the repository root. The validator checks 282 records and protects the distinction between 576 unresolved historical positions and genuine recovered questions. It does not certify theological contents or links.
