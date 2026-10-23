# Living Catena — bulk Chrysostom source research, 1,938 cases

**23 October 2026 · fully executed on pinned 1888 print OCR · pre-human-review · no Messenger changes**

## Actual completed bulk work

The earlier two-per-homily selection had retained 180 source-exact research snippets, but discarded the other machine-detected structural cases. The acquisition/segmentation pipeline now permanently retains **all 1,938 distinct Chrysostom source question–ensuing-prose candidates** in the **research artifact**, while preserving the previous 180 and all four independent bibliographic examples. The original OCR and original canonical Catena were not modified.

New components:

- `scripts/scripture-catena-chrysostom-original-question-replies.mjs` now produces `dist/schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json`: 1,938 original OCR source records with homily/unit, question line and preceding OCR, ensuing original printed text, SHA-256, source-layer warnings and existing candidate Catena links. **Not 1,938 approved questions or certified responses.**
- `scripts/scripture-catena-chrysostom-bulk-context.mjs` generates `dist/schaff-chrysostom-bulk-research/all-1938-structural-question-screening.v1.json` and `all-180-extended-source-contexts.v1.json`. Every structural case receives source-risk signals and a normalized contiguous-five-word evidence comparison against the already frozen **4,825 Matthew Catena excerpts**. All 180 selected questions receive original-language-free, unmodified historical **English** OCR windows extending up to 55 preceding and 110 following original OCR lines, without crossing a homily boundary. **Neither window nor adjacent prose is certified as a complete answer.**
- `tests/scripture-catena-chrysostom-bulk-context.mjs` verifies the identity/line/source SHA of **every one of 1,938** structural records, all original Catena lexical phrase evidence, every one of the 180 longer original source windows, and non-publication invariants. The full suite ran in GitHub Actions without failed steps.

### Verified outputs

| Actual result | Count |
| --- | ---: |
| Historical Chrysostom Matthew homilies | **90/90** |
| Original OCR question-mark windows screened | **3,650** |
| Structural question/ensuing-prose candidate records **retained** | **1,938** |
| Structural source prosaic snippets with printed quotation delimiters | **879** |
| With an additional question mark in ensuing prose | **849** |
| Possible reported interlocutors | **55** |
| Cases with at least one visible source risk | **1,840** |
| Cases **without** visible risk under current rules (still unverified) | **98** |
| With at least one qualifying five-word Matthew Catena lexical lead | **320** |
| Of those, a match under the inherited Chrysostom label | **167** |
| Match only under *other* inherited Father labels | **153** |
| No qualifying lexical lead (not proof of novelty) | **1,618** |
| Extended original historical OCR context records, two per homily | **180** |
| Sum of original OCR line occurrences across the 180 context windows | **28,936** |
| **Unique** original OCR source lines covered after removing window overlap | **25,965** |
| Verified authorial question/answer pairs, proven new material, publication approvals | **0 / 0 / 0** |

Counts for quotation delimiters, further question marks, reported interlocutors and general risks **overlap**. They must not be added. The lexical counts partition only cases with a qualifying literal match. Lexical match is **not** the same original patristic teaching: scriptural quotations recur, source labels can differ, and the 1888 NPNF English translation differs from Oxford/Newman.

Source pinned: `NPNF1-10` original text SHA-256 `4be619e9e01c9c6d5538fff17ac951e18775186814aa255a5540e2955c0ca6f2`. Every generated record points to that original print OCR and its source-owned homily. No OCR spelling has been repaired without separate provenance. The repository stores scripts, schemas and tests; large acquired public-domain source volumes remain in the reproducible Actions research artifact rather than inflating the production package.

## Gates and next research strategy

**Research complete for this pass:** 90/90 homilies structurally represented, 1,938/1,938 identified structural cases durably exported, all 1,938 source/sha checks passed, all 180 original longer windows integrity-checked, 4,825 canonical Matthew excerpts indexed for evidentiary comparison.

**Still genuinely missing:**

1. **Actual speaker boundaries.** A biblical question, objection from an imagined interlocutor, printed note or wrong-column OCR can appear in a structural candidate. **98 not flagged does not mean 98 authorially confirmed.**
2. **Original paragraph and answer extent.** Extracted ensuing prose and bounded OCR windows do not establish that the entire Father-owned response has been recovered. More detailed source layout/paragraph reconstruction is required.
3. **Semantic original-work versus Catena reconciliation.** 320 cases carry literal five-word overlap evidence; neither a match nor nonmatch determines whether the *argument* was already excerpted by Aquinas.
4. **Broader corpus:** the original scanned Augustine volume has mixed two-column OCR that needs column-aware restoration. Further Schaff volumes beyond Augustine VI and Chrysostom X remain unacquired.
5. **Reader retrieval:** no routes or UI behavior are changed. The registry is still pre-human-review source research and cannot be treated as already publishable Father speech.

**Next high-yield processing:** first process all **1,938** at source-ownership/printed paragraph level with automated, auditable segmentation, retaining full context in bounded batches; use a small *exception queue only for problematic OCR/attribution*. Parallelize remaining Schaff volumes when reproducible acquisition is established. No more repetitive isolated 10–24 case pilots.

## Reproduction

```sh
node scripts/scripture-catena-schaff-ocr-ingest.mjs --volume all
node scripts/scripture-catena-schaff-section-ingest.mjs
node scripts/scripture-catena-chrysostom-original-question-replies.mjs
node scripts/scripture-catena-chrysostom-bulk-context.mjs
node tests/scripture-catena-chrysostom-bulk-context.mjs
```

**CI evidence:** [whole-corpus source audit run 39960086227](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39960086227), which produced and validated the 1,938-record/180-context source files, with no human approvals and no Messenger promotion.

Source of truth: draft research [PR #1547](https://github.com/Fulcanelli13/ad-orientem/pull/1547).
