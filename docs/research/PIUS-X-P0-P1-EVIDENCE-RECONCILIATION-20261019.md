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


## Initial topical screening (P1, not semantic deduplication)

The companion file `data/learn/research/pius-x-p1-short-catechism-topical-review-20261019.v1.json` screens all 64 SPX topic-family titles against the existing shorter Catechism's **six-word English question stems**, and records **possible same-topic QIDs**, not proven same intents.

- **54/64** family seeds have at least one plausible topical QID from this bounded screening.
- **10/64** have no obvious match from these incomplete stems; this does not prove their subject is absent from the original 1912 Catechism or the papal corpus.
- **0** same-intent merges or answer approvals have been made.
- The next necessary operation is reading each complete Italian question and answer, then classifying `SAME_INTENT`, `BROADER`, `NARROWER`, or `FOLLOW_UP` with a reviewed explanation.

This screening does **not** reduce the denominator from 497 to 443: overlapping *topics* can still contain genuinely distinct pastoral questions, and 433 numbered Catechism questions are not guaranteed to be 433 distinct user intents.


## Full digital-source review: all 64 SPX research families

The two reviewed extracts, `pius-x-p1-first24-italian-text-review-20261019.v1.json` and `pius-x-p1-next40-italian-text-review-20261019.v1.json`, document a **64/64 manual comparison** of the initial topic crosswalk against the complete Italian question and answer text of the digital source (pinned transcription commit `65d10046...`). This is **not** collation against an authentic 1912 printed facsimile, nor independent doctrinal or visitor dialogue certification.

| Classification | Number | Meaning |
| --- | ---: | --- |
| `DIRECT_CATECHISM_QUESTION` | 29 | Relevant complete Q&A directly addresses the substantive question |
| `PARTIAL_ANSWER_TO_BROADER_QUESTION` | 8 | Q&A supports part, but additional historical/pastoral evidence needed |
| `RELATED_DOCTRINE_NOT_SAME_QUESTION` | 16 | Useful background but not the same user intention |
| `NO_DIRECT_MATCH_IN_REVIEWED_CANDIDATES` | 10 | No direct candidate in the bounded stem-based list; not a global absence claim |
| `MISMATCHED_DOCTRINAL_DISTINCTION` | 1 | SPX-057 incorrectly mapped *actual* grace to Q269–271 on *sacramental* grace |

**Do not subtract 29 from 497 to announce an exact distinct-intent total.** A short Catechism question that directly addresses an SPX topic may still cover only one route through a larger pastorally distinct conversation family. Full semantic joins require adjudication; they have not been merged.

### Critical edition-integrity hold: historical anachronism in an alleged 1912 witness

Pinned Italian digital file `sacramento-matrimonio.md` contains Q409 and Q410 asserting that Catholic marriage has civil legal effects in Italy through state recognition/registration. The 11 February **1929 Lateran Concordat**, Article 34, established that recognition, and the prior Italian law did **not** confer these effects on a purely canonical marriage. The wording therefore cannot be unchanged original Pius X-era 1912 text. Q411 contains related time-sensitive disciplinary language and is also held.

- Digital witness: https://github.com/gustavo-depaula/ember/blob/65d10046c19b610a4307ef273a751ceeb3c4f153/content/books/pius-x-catechism/it/sacramento-matrimonio.md
- Vatican 1929 agreement, Article 34: https://www.vatican.va/roman_curia/secretariat_state/archivio/documents/rc_seg-st_19290211_patti-lateranensi_it.html
- Italian legal history: https://www.treccani.it/enciclopedia/patti-lateranensi_%28Diritto-on-line%29/
- Review hold: `data/learn/research/pius-x-1912-catechism-edition-discrepancy-hold-20261019.v1.json`

The scope is **witness contamination / posthumous modification, not proof that all 433 digital question texts are false**. Retain numerical identity and useful study locators; block claims of exact 1912 wording until edition-specific print comparison. SPX-028 and SPX-044 must avoid anachronistic civil marriage descriptions.

### Another corrected attribution: SPX-057

The original P1 topical crosswalk suggested PX1912-Q269–271 for *actual grace versus sanctifying grace*. The Italian questions actually distinguish *sanctifying* from *sacramental* grace. This is recorded as a **mismatched doctrinal distinction**, not a partial direct answer. Consult a correctly located original source before promoting SPX-057.


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
