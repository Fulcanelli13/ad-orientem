# Ad Orientem — Original Apologetics Question Recovery

**Editorial archive · 12 October 2026 · DRAFT / NOT MERGED / NOT PUBLISHED**

One recovery workspace inside the existing Ad Orientem GitHub repository. The aim is to find questions from the actual earlier conversations and source files, **not** replace them with simplified or newly invented questions.

## 18 October — Canon conversation content reconciliation (research only)

**Review entrypoint:** [Canon 452 full reconciliation](CANON_452_RECONCILIATION_REPORT_20261018.md). The recovered historic question IDs are now source-preserved as candidate conversation entries for **Monsieur le Chanoine**. The character is a presentation role; original APOL, Church Crisis, Catechism, Mass and other content owners remain authoritative.

- **452/452** question IDs and original excerpt wording preserved in [P1 topic concordance](CANON_HISTORICAL_452_TOPIC_CONCORDANCE_P1_20261018.v1.json); **425** have editorial *topic-only* owner candidates and **27** have no suitable current topic target. **0/452** historical source questions independently verified against full original chats, and **0** exact answers certified from this concordance.
- [25 Protestant questions reviewed against original bilingual source-draft prose](CANON_PROTESTANT25_SOURCE_ANSWER_AUDIT_P2_20261018.v1.json): **18** directly addressed in an unpublished draft, **5** partially addressed, **2** without adequate dedicated draft answers. These are not publication approvals.
- [198 denominational question opponent-scope screen](CANON_DENOMINATIONAL_OPPONENT_SCOPE_SCREEN_P3_20261018.v1.json): keyword-in-position evidence only, **not** primary-source or denominational correctness verification.
- [Exact title-overlap register](CANON_HISTORICAL_CURRENT_TITLE_OVERLAP_20261018.v1.json) shows only **one** normalized exact match between 452 historical titles and 282 current GitHub titles; the original two question identities sharing one text are preserved.
- [Two-namespace source pointer index](CANON_TWO_NAMESPACE_SOURCE_POINTERS_20261018.v1.json) registers **452 historic + 282 current = 734 nonadditive source handles** without duplicating answers, changing owners, or publishing additional Canon routes.
- [Eight-question Canon dialogue pilot](CANON_EIGHT_QUESTION_DIALOGUE_REVIEW_20261018.md) — original historical sample in **English and French**; answer, serious editorial objection, response, two follow-up directions and source pointers for each. **Six substantive draft-answer candidates; two specialist evidence blocks remain. All eight are unpublished and unapproved.** [Structured candidate records](CANON_EIGHT_QUESTION_CONVERSATION_PILOT_20261018.v1.json). Node contract: `node research/apologetics-question-recovery/validate-canon-eight-dialogue.mjs` (committed, not executed in connector pass).
- Node contract: `node research/apologetics-question-recovery/validate-canon-reconciliation.mjs`. **Committed but not executed/certified in this connector pass.**

**All existing publication gates remain closed.** Do not count 425 provisional topic links as answered questions, 282 current records as unique additional historic questions, or source excerpts as raw-transcript verified quotations. This branch adds no public Canon reader or dialogue scripts.

### 18 October — complete first denominational Q&A bank: Lutheranism

The [Lutheran 25-question source-first report](CANON_LUTHERAN_25_SOURCE_FIRST_REPORT_20261018.md) documents **LUT-001–LUT-025** as distinct EN/FR Canon research-dialogue records with two original-question follow-ups per entry, 57 source pointer uses, and an original-witness manifest of 28 reference entries. [Questions 001–013](CANON_LUTHERAN_DIALOGUES_LUT001_013_20261018.v1.json), [questions 014–025](CANON_LUTHERAN_DIALOGUES_LUT014_025_20261018.v1.json), [source manifest](CANON_LUTHERAN_PRIMARY_SOURCE_MANIFEST_20261018.v1.json) and [validation script](validate-canon-lutheran-dialogues.mjs) are committed. A connector-run structural consistency audit passed for all 25, while the Node script has not been executed in CI.

These are **25 candidate source-anchored bilingual Q&A drafts, not 25 published or source-certified answers**. The two questions LUT-001 and LUT-025 still have **no suitable existing canonical topical owner**; this bank does not usurp that ownership. All 25 require close original-text claims review, final French, Catholic doctrinal and publication approvals. No app runtime is modified.

## Source classes — do not add or conflate

| Source class | Records | Provenance / what it proves |
|---|---:|---|
| Earlier-conversation indexed question-text candidates | **452** | Original bank IDs and dated search-excerpt wording. **Zero raw-chat transcripts directly verified.** |
| Current GitHub question/dossier/debate records | **282** | Exact text from current version-controlled files; not necessarily the earlier historical wording. |
| Historical A/C/TLM original ID placeholders | **576** | Known missing-original positions; **not question text**. |
| Historical bank prefixes | **50** | Categories attested in prior conversational summaries; **not 50 fully recovered banks**. |
| Complete indexed lists at their stated sizes | **13** | All item IDs/phrases found in excerpts; **not raw-transcript byte certification**. |

Among **614 known original ID slots** across source-sized historical interlocutor banks: **424** currently have indexed question wording, **4** have incomplete question snippets, and **186** lack complete original wording. The 452 title candidates include 28 from bank families whose total size has not been determined. Do not add these 614 slots to the separate A/C/TLM placeholders as though the topics were necessarily unique.

## Start here

- `HISTORICAL_CONVERSATIONS_MASTER_QUESTION_INDEX.md` — readable 452-question historical-excerpt master with original IDs, banks, and dated response witnesses.
- `ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json` — structured historical excerpt records and source-certification flags.
- `HISTORICAL_QUESTION_GAPS.csv` / `.md` — unresolved exact IDs by known-size interlocutor bank; never fabricate missing wording.
- `HISTORICAL_SOURCE_CHECK_QUEUE.md` — high-priority original-message retrieval queue, currently 186 missing titles and 4 truncated question snippets.
- `ORIGINAL_CONVERSATION_PROVENANCE_AUDIT.md` / `.json` — **none of the 452 excerpts has a full raw-chat transcript certification**. Search excerpts are not independently verified verbatim originals.

## Alternative historical evidence — never merge silently

- `HISTORICAL_A_SERIES_ALTERNATE_BANDS.md` / `.json` — an earlier 14-section A001–270 topical schema conflicting with GitHub's later A001–075 batch segmentation. No per-item question sentences follow from a topical map.
- `HISTORICAL_CRISIS_Q_SERIES_WITNESSES.md` / `.json` — a Q-numbered earlier Crisis sequence through Q250, not reconciled to C001–233.
- `HISTORICAL_HER_SUBJECTS_ONLY.md` / `.json` — 25 numbered heresy/error subject leads, **not full question sentences**.
- `HISTORICAL_PAP_SUBJECTS_ONLY.md` / `.json` — 20 numbered papal-crisis subject leads, **not full question sentences**.
- `HISTORICAL_AQ_LIVE_WORDING_VARIANTS.md` / `.json` — eight prior-chat AQ01–08 wording candidates compared with exact current live app titles.
- `HISTORICAL_AQ_WORDING_VARIANTS.md` / `.json` — eight AQ09–16 earlier wording candidates compared with later proposed-only GitHub titles.
- `HISTORICAL_ID_COLLISIONS.md` — MOR-001–014 reused in two dated prior assistant replies for different subject matter.
- `HISTORICAL_LIT_UNNUMBERED_QUOTES.md` — 13 liturgical-reform question sentences with individual IDs not independently established; excluded from the 452 indexed count.
- `HISTORICAL_LIT_065_077_CANDIDATE_IDS.md` / `.json` — candidate sequence matching those 13 sentences to LIT065–077 ranges in dated summaries, **not confirmed individual original ID-text pairs**.

## Current GitHub record census — kept separately

- `ALL_QUESTIONS.md`, `questions.json`, `questions.csv` — **282** exact current source-file question/dossier/objection records from 12 source files.
- `BY_INTERLOCUTOR.md` — editorial nine-audience tags for the 282 GitHub records; not recovered original audience assignments.
- `APOSTOLATE_QUESTION_RECOVERY.md` — eight live AQ titles and ten proposed-but-not-live titles, with separate statuses.
- `HISTORICAL_UNRECOVERED_POSITIONS.csv` — **576** unresolved legacy A/C/TLM positions; not recovered question sentences.
- `RESEARCH_LEDGER_102_RECONCILIATION.md` — all 102 source-file research ledger titles already occur exactly in the 282 records; don't duplicate them.
- `CONVERSATION_SOURCE_LEADS.md`, `ORIGINAL_QUESTION_BANK_RECOVERY.md`, `ORIGINAL_QUESTION_BANK_RECOVERY_BATCH_B.md`, `RECOVERY_BATCH_20261012_116.md` — research leads and snapshots; the main historical master supersedes snapshot counts.

## Validation and release gates

- `validate.mjs` and `validate-historical.mjs` are source-controlled Node validation scripts. Local/CI execution is **not certified here**; structural readback consistency was independently checked via connectors.
- Original conversation text is certified only after comparison to the complete original raw message or a user-provided conversation export, including its original message/time reference.
- User-facing doctrinal content needs separate original-source citations, theological scrutiny, French parity and publication review.
- Preserve earlier-source variants and clashes rather than choosing a convenient normalized title. No production app change, PR merge or release follows automatically.

See [draft PR #1101](https://github.com/Fulcanelli13/ad-orientem/pull/1101), [historical work issue #342](https://github.com/Fulcanelli13/ad-orientem/issues/342), and [main-branch original forensic audit](https://github.com/Fulcanelli13/ad-orientem/blob/main/docs/FORMATION-FORENSIC-RECOVERY-2026-10-08.md).
