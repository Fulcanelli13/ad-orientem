# Ad Orientem — Original Apologetics Question Recovery

**Editorial archive · 12 October 2026 · DRAFT / NOT MERGED / NOT PUBLISHED**

One recovery workspace inside the existing Ad Orientem GitHub repository. The aim is to find questions from the actual earlier conversations and source files, **not** replace them with simplified or newly invented questions.

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
