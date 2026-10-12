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

Current historical-chat evidence: `HISTORICAL_CONVERSATIONS_MASTER_QUESTION_INDEX.md` and `ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json` (264 indexed original-ID question excerpts, 48 evidenced original bank prefixes; eight complete 25-question lists). Full chat-export verification remains outstanding.


## Historical conversation recovery — latest

- `HISTORICAL_CONVERSATIONS_MASTER_QUESTION_INDEX.md`: **380 individually indexed earlier-chat question excerpts**, 48 original bank prefixes, 10 complete 25-question lists. These are *excerpt-recovered*, not independently compared against a full exported ChatGPT transcript.
- `ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json`: the corresponding attributed source snippets with historical message timestamps.
- `HISTORICAL_QUESTION_GAPS.csv`: 589 positions in known-size original banks (374 excerpt-recovered question titles; 4 truncated snippets; 211 missing full question texts). Other original banks have unknown source size; do not extrapolate totals.
- `HISTORICAL_QUESTION_GAPS.md`: readable gaps by original bank.
- `validate-historical.mjs`: structural check; run with `node research/apologetics-question-recovery/validate-historical.mjs`. This checks archival integrity, not theological certification or export-verbatim fidelity.

The older `ORIGINAL_QUESTION_BANK_RECOVERY.md` and `..._BATCH_B.md` are retained as intermediate snapshots; prefer the current historical master and evidence JSON. The historical original-bank corpus does not replace the separate **282-item GitHub source-file catalogue**. No app release/publication or merge is implied.
