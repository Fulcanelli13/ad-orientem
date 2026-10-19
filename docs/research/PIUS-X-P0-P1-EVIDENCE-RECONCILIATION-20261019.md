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



## Targeted earlier-source and Vatican cross-check (P1 source wave)

File: `data/learn/research/pius-x-p1-original-source-support-wave1-20261019.v1.json`.

**25 source anchors** have been individually located against the museum's full Salzano transcription, museum's longer Catechism and official Vatican web texts: **20 direct question/topic support** and **5 partial support**. This is `PASSAGE_FOUND_TOPIC_MATCHED`, *not* `HISTORICALLY_CERTIFIED_ANSWER`, `COLLATED_AUTOGRAPH` or a unique-intent count.

All 10 SPX families initially flagged `NO_DIRECT_MATCH_IN_REVIEWED_CANDIDATES` in the 1912 shorter index now have an external source anchor:
- **8 direct**: SPX-003 (1905 longer Q669, Rosary at Mass), SPX-004 (1903 sacred-music motu proprio), SPX-010 (Salzano Peter/Judas Q198–200), SPX-012 (*Acerbo nimis*, adult catechesis), SPX-023 (Salzano spiritual Communion Q476–481; also 1905 longer Q668), SPX-024 (Salzano Viaticum Q493–497), SPX-030 (*Iucunda sane*, prayer together with action), SPX-045 (*Ad diem illum* §21, Mary at Calvary).
- **2 partial**: SPX-011 (the encyclical teaches religious instruction and patient charity, but does not diagnose an individual visitor's loss of belief); SPX-038 (1905 longer Q925 provides reverent fear of offending God, but does not complete a whole pastoral exchange about divine love).

**Important SPX-057 correction:** The 1912 short Q269–271 concern sanctifying and *sacramental* grace. The 1905 **longer** Catechism Q527–533 explicitly distinguishes sanctifying/actual grace and supports the original SPX-057 question. Link to correct original source, **do not rename 1912 Q271**.

Additional strong manuscript arguments:
- Salzano Q543 distinguishes thoughts arising unbidden from willing consent (SPX-008).
- Salzano Q506–508 prescribes silent thanksgiving and prayer after Communion (SPX-006).
- Salzano Q570–577 defines effective resolution by concrete means; a verdict on the sincerity of a specific penitential act is **not** in this source (SPX-007).
- Salzano Q549 recommends an evening conscience examination (SPX-036).
- Salzano Q300–301 explicitly joins love of God and neighbour to observing the commandments (SPX-043).
- *Haerent animo* §§16–24 teaches priestly meditation and spiritual reading; **do not** universalise the Pope's judgment of negligent clergy as a verdict on a layperson's spiritual dryness (SPX-033).

### Salzano editorial locator integrity

A separate hold `data/learn/research/pius-x-salzano-editorial-numbering-hold-20261019.v1.json` records that:
- The museum itself says Sarto **did not number his manuscript questions**; sequential numerals were editorially supplied.
- The posted transcript repeats 321 where 322 is expected, and prints 406 in the Confirmation series where 446 is expected.
- The museum page interweaves manuscript catechetical answers, Sarto's handwritten marginal instructions and later editorial commentary.

Therefore, do not parse the Salzano transcript into the app by raw printed number alone; retain surrounding sequence and manuscript context until facsimile verification. The count of **577 is an editorial question sequence**, not 577 independently author-numbered items.

### Sufficient research does not equal published dialogue

The new source wave makes the first family cohort stronger, but no visitor answer is represented as independent theological certification or certified first-person Sarto wording. It should feed the existing dialogue/retrieval owners **only after review**. The genuine total unique-answerable-intent count remains **unknown**: existing 433 question locators, 64 topic-family seeds, 29 digital direct matches and these additional sources have *not yet been semantically joined into a final set*.


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
