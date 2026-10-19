# St Pius X — P0/P1 source-to-question evidence reconciliation (19 October 2026)

**Owner:** [#1457](https://github.com/Fulcanelli13/ad-orientem/issues/1457)  
**State:** research-only, not content-certified, not app-integrated  
**Scope:** Pius X pastoral/theological/doctrinal content, not the other two characters' answers.

## Existing source owners preserved

- The 1912 **shorter** 433-question Catechism has canonical `PX1912-Q001`–`PX1912-Q433` records in `data/learn/ltfaith-pius-x-it-witness-index.v1.json` and its EN study-question companion; the two language indexes represent the **same 433 questions**. English stems are truncated witness keys, not complete canonical question text. The original printed Italian 1912 facsimile is **not** collated; neither registry certifies doctrinal answers.
- The handwritten **Salzano** Catechism contains 577 editorially numbered questions from an earlier period. Its numbering is **not** a crosswalk to 1912 `PX1912-Q###`. Manuscript witness: https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-di-don-giuseppe-sarto-arciprete-di-salzano/.
- The **1905 longer** `Catechismo maggiore` is a different edition and different numbering system; never map its question number to the 1912 short Catechism without reading both text loci.
- The Vatican papal texts, private correspondence, sermon editions and later historical reproductions also require **separate authorship and witness types**. A secondary quotation of an original letter is not the same as a collated autograph.
- [Original Catechism bridge #1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406), [shared question interpreter #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443), [documentary voice #1419](https://github.com/Fulcanelli13/ad-orientem/pull/1419), [Magisterium #1452](https://github.com/Fulcanelli13/ad-orientem/pull/1452), and [character folio #1404](https://github.com/Fulcanelli13/ad-orientem/pull/1404) retain their owners. At the time of this review these were *open*, not merged into production main.

## Machine-checkable P0 evidence file

`data/learn/research/pius-x-p0-p1-intent-evidence-bridge-20261019.v1.json`

Contents:
- 433 reference pointers to the existing numbered 1912 question indexes; **no duplicate question/answer prose**.
- 64 provisional `SPX-001`–`SPX-064` topic/intention families transcribed from the October 19 research discussion, with *reported* source anchors. These are NOT source-collated or voice-certified.
- 8 groups of identical **truncated** English stems involving distinct numbered questions; these are *holds*, not confirmed semantic duplicates.
- Explicit rejection of publication, answer approval or an asserted distinct-intent count.

### Candidate accounting

| Measure | Count | Meaning |
| --- | ---: | --- |
| Existing 1912 source QIDs | 433 | Exact numbered identities; study locators only |
| Historical SPX family seeds | 64 | Chat research topics, reported anchors uncollated |
| Raw unreconciled candidate references | **497** | 433 + 64, *before* any semantic join |
| Verified distinct new question intents | **unknown** | Cannot be inferred from truncated stems |
| Historical/voice-certified visitor answers | **0 in this new bridge** | No answers published or authored |

Do **not** report 497 as the number of unique answerable questions. Nor should 433 existing source locators be presented as freshly mined material.

## P1 reviewed-intent workflow

1. **Resolve exact 1912 source text first.** The English index stores short stems; use the canonical text owner and Italian section file before comparing question semantics. Never merge Qs solely on matching first six words.
2. **Map each SPX family against relevant existing 1912 questions and draft router topics.** Mark relationship as `SAME_INTENT`, `BROADER`, `NARROWER`, `FOLLOW_UP`, or `NOT_MATCHED`; require human adjudication for similarity.
3. **Collate each extra source passage** (Salzano/1905/papal texts) with a precise text locator, original wording, author/editor distinction and permission/edition status. SPX source anchors in this bridge are *reported*, not reverified quotations.
4. **Test answer sufficiency** independently from navigability: evidence must sustain the actual visitor question and a relevant follow-up without an invented theological premise.
5. **Pass historical/period voice separately** through PR #1419; official pronouncements, seminarian letters, and approved third-party decrees must not be flattened into first-person papal speech.
6. **Feed the existing shared router** once source-mapping is reviewed; do not publish an alternative Q&A engine or copy the 433-question answer corpus.

## High-value unverified passage groups to collate next

1. Salzano Q369–416: redemption, objections, grace, analogies.
2. Salzano Q476–508: spiritual Communion, Viaticum, Eucharistic thanksgiving.
3. Salzano Q523–577: conscience, consent, contrition, purpose of amendment.
4. `E supremi` §§12–13: patience towards the religiously estranged.
5. `Ad diem illum` §§7–14: intercession subordinated to Christ.
6. `Haerent animo` §§14–28: meditation, spiritual reading, conscience.
7. `Acerbo nimis` §§12–26: adult catechesis and practical instruction.
8. `Pascendi` §§6–15 and 26–33: faith, history, dogma, and critical distinctions.

This is a *source-check queue*, not a claim that every passage has been freshly examined by this PR.

## Release gate

No new public dialogue, production source owner, app runtime, character assets, theology approval, or source text copy is introduced. Independent source, doctrinal, historical and translation reviews remain open.
