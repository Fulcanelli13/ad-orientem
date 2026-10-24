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



## Expanded historical question census (same PR; not a visitor-answer count)

Full evidence ledger: `data/learn/research/pius-x-source-question-census-20261019.v1.json`.

| Source collection | Count | Evidentiary standing |
| --- | ---: | --- |
| 1905 *Compendio / Catechismo Maggiore* | **993** | Six continuous numbered ranges manually confirmed against museum webpages: preliminary 1–14; Creed 15–252; prayer 253–341; commandments 342–516; sacraments 517–855; virtues/practice 856–993. All **993 Q&A not yet machine extracted**. |
| Separate *Istruzione sopra le feste* | **219** | Publisher Edizioni San Paolo expressly identifies 219 questions; individual range and historical edition still **not parsed/collated**. |
| 1912 short *Catechismo della dottrina cristiana* digital witness | **433** | All **21 section files / 433 full Italian question headings parsed**; every original index QID found; **433 distinct normalized question-text fingerprints** (0 identical full-question groups). Modern transcription contaminated by post-1929 marriage provisions; original 1912 print still unavailable. |
| Salzano manuscript transcription | **577** | Editor-assigned Q labels over Sarto's unnumbered manuscript; duplicate/erroneous labels held, not original manuscript numbering. |
| **Raw numbered question references** | **2,222** | Addition of different corpora before any cross-edition deduplication; **not** independent answerable intentions. |

Plus **64 SPX conversation-topic family seeds** from the research discussion (=2,286 references if mechanically added). Of these, **29 families** have direct counterpart questions in the *short* Catechism, **8** have partial counterparts, **16** related-but-distinct topics, **10** no direct short-index candidate and **1** incorrect *short* edition source link corrected using the longer Catechism. The 10 initially absent from the short index now have alternate source anchors in the external source wave.

**Conditional arithmetic, not a verified headline:** if each short Catechism question were a distinct intent, all 29 direct SPX families collapsed into an existing intent, and each other SPX family added a distinct new intent, the initial short+research worklist would contain `433 + (64 - 29) = 468` conceptual units. Those three assumptions have not been authenticated; do not present **468** as an achieved total or a lower bound.

### Exact-text audit and remaining semantic uncertainty

The pinned Italian digital transcriptions covering all 21 sections were read mechanically to extract the **full question line** for every short QID. The question was normalized (case, accents, whitespace and punctuation) and marked by a 64-bit **noncryptographic** fingerprint; no full question or answer prose is copied. Identical full-question fingerprint groups = **0**. This resolves the previous ambiguity of eight collisions in six-word English study stems: those were truncated-stem false collisions, not identical entire questions.

However, zero identical textual questions **does not** prove zero semantically duplicate questions. *Why pray?* and *Is prayer necessary?* may be close intents even when worded differently. Nor does all 993 of the longer Catechism necessarily provide 993 new unique conversations. The cross-edition 993×433 relationship, 219 feasts and 577 Salzano links must be analyzed using complete source evidence.


### First six cross-edition semantic calibration cases

The evidence file `data/learn/research/pius-x-1905-1912-calibration-crosswalk-20261019.v1.json` records six **individual Italian question-and-answer comparisons** between the 1905 longer Catechism and the later digitally transcribed 1912 shorter question index:

| 1905 QID | 1912 short counterpart | Relationship |
| --- | --- | --- |
| PX1905-Q254, what prayer is | PX1912-Q414 | Same-intent candidate: definition of prayer |
| PX1905-Q262, why prayers are not heard | PX1912-Q422 | Same-intent candidate; **do not falsely report unanswered prayer as absent from the short Catechism** |
| PX1905-Q527, sanctifying versus actual grace | PX1912-Q269–271 | Related, **not** same distinction: short text concerns sacramental grace |
| PX1905-Q669, Rosary during Mass | None in screened 1912 Eucharist section Q316–354 | 1905 expansion with independent practical question |
| PX1905-Q984, evening examination | PX1912-Q359 | Related, different situation: evening habit versus preparation for Confession |
| PX1905-Q855, civil marriage in pre-Concordat Italy | Digital PX1912-Q409–410 | **Historical 1929 edition conflict**, never merge as if both were original Pius X teaching |

These six cases are **calibration**, not representative random sampling; they do not license extrapolating an overlap percentage to all 993 questions. Two are strong same-intent candidates; **zero merges formally approved** in this PR pending print-edition and semantic sign-off.


### Historical editorial cautions

Pius X's 1905 promulgation letter says he adopted a **previously regionally approved catechetical text with slight modifications**; authorship must not be presented as if he personally composed all 993 dialogues (museum `Lezione preliminare`, 14 June 1905). The museum website also includes **1967 updated prayer/formula appendices**, which must not be attributed to Pius X.

Reference witnesses:
- <https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/>
- <https://www.edizionisanpaolo.it/religione_1/teologia-e-filosofia/i-compendi/libro/catechismo-maggiore.aspx> (993 + 219)
- <https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-di-don-giuseppe-sarto-arciprete-di-salzano/>

**Next measurable gate:** extract exact 1905 question identities, audit 219 feast questions, then make evidence-reviewed same-intent joins to the 1912 short question IDs. Only after that can we estimate the number of genuinely distinct *source-backed* visitor questions rather than raw historical references.


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


## First 64-family conversation coverage screen (19 October, verified against source-review registries)

The research-only ledger `data/learn/research/pius-x-64-family-evidence-screen-20261019.v1.json` derives an evidence tier for **each of the 64 pre-existing SPX family seeds** by joining the two full Italian 1912 digital review registries with the 25 checked 1905/Salzano/Vatican anchors. It neither imports prose into the avatar nor modifies question owners.

| Screened source-match tier | Families | Definition |
| --- | ---: | --- |
| `DIRECT_PASSAGE_ANCHOR` | **48** | A reviewer located at least one passage directly addressing the topic in the historical/digital research witnesses |
| `PARTIAL_PASSAGE_ANCHOR` | **11** | At least one partial passage, but no direct match found in these reviewed witnesses |
| `RELATED_OR_UNRESOLVED` | **5** | Related doctrine found, but no direct or partial passage identified in the bounded research |
| Total first research family cohort | **64** | Not a complete universe of potential visitor questions |
| Complete, historically voiced and doctrinally approved visitor answers | **0 approved by this screen** | Research-screen evidence is not dialogue sign-off |

The five remaining source-gap families are:
- **SPX-039** — How does the Holy Ghost help difficult decisions?
- **SPX-040** — Is meekness the same as weakness?
- **SPX-042** — What makes a Christian peacemaker?
- **SPX-046** — What does poverty of spirit mean?
- **SPX-050** — Why did Apostles struggle to believe the Resurrection?

The 11 partially grounded families are SPX-007, 011, 019, 020, 025, 031, 033, 037, 038, 047 and 061.

**Release holds retained:** SPX-028/044 are edition-sensitive for the 1912 civil-marriage interpolation; SPX-057 must use the genuine 1905 actual/sanctifying-grace locus rather than the superficially similar 1912 sacramental-grace locus. None of the 48 directly matched families is deemed fully answered or voiced on the strength of this statistic.

**Corpus scope warning:** the 64 seeds are doctrinal/pastoral examples, not a representative sample of all Pope Pius X conversations. They do not adequately survey his childhood, vocation, parish years, personal life, papal administration, Modernism dispute, Church-state conflicts, historiography, or extended apologetical debates. The **number of different visitor questions that St Pius X can answer remains unknown**.

### Next adjudication queue and stop conditions

The successful 1905 machine crosswalk recovered all **993** Q&A positions, produced **561** questions with at least one lexical 1912 candidate and **432** without lexical candidates. Of the 561, **145** reach a top-candidate lexical similarity of 0.70 or more; **83** reach 0.90 or more. These thresholds prioritize human comparison only; they do not certify sameness. The algorithm discards some short common words, so a 1.0 lexical score can still conceal a different question/answer.

Review the high-score pairs **with the complete Italian question and answer in both editions** and record `SAME_INTENT`, `NARROWER`, `BROADER`, `RELATED_DISTINCT`, `FOLLOW_UP`, or `REJECTED_FALSE_MATCH`. Preserve chronology-sensitive divergences. A same-intent classification is not permission to erase one edition's source witness. Once a substantive stratified sample is adjudicated, prioritize the 432 without lexical candidates and unrepresented pastoral/historical domains, rather than spending all time polishing near-duplicates.

A separate extension must bring Feast and Salzano textual content into those same **semantic** review contracts. The 218/219 feast discrepancy remains held; Salzano has 577 verified positional locators but its numbering is editorial. Neither can be treated as already semantically deduplicated.

The governing progress indicator is **reviewed distinct user intentions with a usable historical evidence chain**, followed separately by complete-answer and voice approvals — never simply the sum of historical QIDs.


### Exact normalized question-text overlap (automated, cross-edition)

The first complete 1905–1912 extraction has now also generated SHA-256 normalized-question fingerprints for both editions and compared them directly. Latest completed acquisition returned:

- **26** identical normalized Italian *question-text* pairs linking 1905 and the pinned 1912 digital transcription (26 distinct longer and 26 distinct shorter QIDs).
- **561** longer questions with looser lexical candidates, containing these 26 exact overlaps; the other lexical suggestions are **not** necessarily identical questions.
- **1** repeated normalized question-text group *within* the 1905 longer Catechism: **PX1905-Q915 and PX1905-Q922**. Their answers may differ.
- **0** same-intent merges accepted and **0** source answers imported into production.

These links are now in the 30-day GitHub Actions research artifact as `exact_question_text_crossedition_links` with two source manifests. A question-text identity does **not** authenticate the digital 1912 edition, establish identical *answers*, resolve semantic scope, or authorize avatar dialogue. The next limited review should compare the 26 exact-wording pairs' answers and source-era context before considering any join.


## Second coverage wave: semantic review and neglected domains

### The 26 cross-edition exact-worded pairs

`data/learn/research/pius-x-26-exact-pairs-reviewed-20261019.v1.json` documents a complete question-and-answer passage comparison for all 26 automatically detected normalized Italian question-text matches. The reviewer found **26 research-level same-intention assessments**, but the answers contain materially different levels of detail, and **only one pair has an identical normalized answer fingerprint**. No merge is approved and both Q&A witnesses remain individually owned.

Three examples of why this is a *semantic* review, not a blind copy:
- **1905 Q35 / digital 1912 Q57, angels:** spiritual/intellectual nature versus guardian/ministerial function.
- **1905 Q537 / digital 1912 Q271, sacramental grace:** both are about `grazia sacramentale`; they are **not** a short-edition answer to the distinct question of *actual grace versus sanctifying grace*.
- **1905 Q628 / digital 1912 Q335, worthy Communion:** both mention the historical fast from midnight; this is edition-bound ecclesiastical discipline and requires contextual qualification for any present-day reply.

A particularly dangerous **same-text, different-theological-intent** collision occurs inside the **1905 Catechism**: Q915 asks about *fortitude as a cardinal virtue*, Q922 asks about *fortitude as a gift of the Holy Ghost*. These are **not** the same question intent even though the normalized Italian question wording is identical.

### Expansion beyond the original 64 themes

`data/learn/research/pius-x-conversation-expansion-48-20261019.v1.json` adds **48 new question ideas**, spread across six intentionally underrepresented domains:

| Research domain | New prompts |
| --- | ---: |
| Giuseppe Sarto's personal life, vocation and ministerial history | 10 |
| Modernism and doctrinal crisis | 10 |
| Church crisis and governance | 8 |
| Apologetics and faith/reason | 8 |
| Sacred liturgy and the sacraments | 6 |
| Pastoral method and Christian life | 6 |
| **Total** | **48** |

Each prompt has a **document-level retrieval anchor**, not an asserted answer passage. Primary anchors include `Pascendi dominici gregis`, `E supremi`, `Acerbo nimis`, `Vehementer nos`, `Il fermo proposito`, `Tra le sollecitudini`, `Haerent animo`, `Sacrorum antistitum`, the 1905 Catechism, and biographical catalogues from the Museo / Fondazione Giuseppe Sarto. Papal writings and secondary biographical testimony are tracked separately.

This makes **112 raw research conversation ideas** (64 old + 48 added). **It is not a count of 112 unique answerable questions**, since topical overlaps remain unreviewed and all 48 new prompts are pending source-passage collation. No first-person historical memory or modern-day papal judgment is certified.

### Next certification sequence

1. For the 48 newly proposed questions, locate and pin exact primary/secondary passages; mark `DIRECT`, `PARTIAL`, `RELATED`, or `NOT_SUPPORTED`, distinguishing *papal first-person testimony* from third-party biography.
2. Adjudicate overlaps of those 48 prompts against existing `SPX-001..064`, the original 433 shorter Catechism QIDs, and the 993 long Catechism QIDs.
3. Continue candidate semantic clustering beyond the 26 exact wording pairs, sampling top 1905↔1912 lexical similarities and recording *different-wording same-intent* and *similar-wording different-intent* cases.
4. Separately add audience-specific follow-up paths, pastoral caution, and historical attribution for those intents that have substantial evidence. Do not publish new dialogue or change the existing conversation runtime until the release gate.

The metrics that matter are **distinct conversational intentions grounded by specific evidence**, followed by answer sufficiency, doctrinal review, and historically responsible voice. Counting documents or question labels is only the research input.


## 48-question historical-passage screen and bounded answerability census

Read-only research registries:
- `data/learn/research/pius-x-expansion-48-passage-review-20261019.v1.json`
- `data/learn/research/pius-x-112-cohort-coverage-baseline-20261019.v1.json`

The 48-question expansion is **now screened against historically located source passages**, rather than left at document-title-only citation. The result is **31 direct papal/catechism passage matches, 8 partial passage matches and 9 cases grounded only in third-person biography**. These are evidence-screen classifications, *not* 31 / 39 certified conversations or 9 authentic autobiographical answers. Every record carries a source URL, narrower locator, evidence scope, authorial-witness type, and explicit non-publication flags.

The nine biographical prompts (SPX-EXP-001–009) are supported by Casa Museo Pio X / Museo San Pio X scholarship about family, school, Tombolo, Salzano, diocesan posts, Mantua and Venice, but **none establishes the Pope's first-person interior memory**. In contrast, SPX-EXP-010 (reluctance at papal election) has Pius X's own self-description in *E supremi* §§1–2. The Museo's family study describes a poor family but **not among Riese's very poorest**; this is more precise than a generic extreme-poverty narrative and should govern later phrasing.

The initial review flags **17 possible overlap/follow-up links** to earlier SPX-001–064 seeds. Only **two** are currently strong research **same-intent candidates**, not authorized merges:
- SPX-EXP-035 ↔ SPX-053: identifying the visible Church of Christ, the four marks.
- SPX-EXP-045 ↔ SPX-014: need for priestly meditation despite busy ministry.

Other flagged pairs cover neighbouring questions on Catholic Action, Gregorian chant, faith and Church crises, First Communion versus adult catechesis, and correcting errors charitably; **related is not identical**.

### Combined, still bounded first-two-cohort baseline

| Evidence classification across the 112 research ideas | Count |
| --- | ---: |
| Direct passage indicated by the reviewed sources | **79** |
| Partial passage indicated | **19** |
| Related source material, without a direct or partial match (from first 64) | **5** |
| Secondary biographical evidence, not autobiographical testimony | **9** |
| **Total raw topic seeds** | **112** |

The evidence buckets are exclusive research dispositions, but **79 is not an approved answer count**. The 64 older seeds and 48 newer prompts are not representative of all possible questions; there is still unreviewed overlapping intent within and between historical catechisms, primary encyclicals, and biography. Therefore the **certified distinct answerable-intent total remains `null`**; **0 visitor replies have been certified by this research work**.

#### Specific limitations and next actionable research

1. Source-based human review and controlled clustering must resolve at least the two strong duplicate candidates before a first audited number of distinct question *intentions* can be published for this bounded subset.
2. *Quam singulari* (1910), a Sacred Congregation decree approved by Pius X, is a better companion to *Acerbo nimis* for SPX-EXP-042's specific First-Communion preparation and age-of-discretion question. Treat it as an approved dicasterial text, **not a papal first-person anecdote**, and reconcile the historical/current disciplinary scope.
3. For biographical questions seeking personal motives, acquire authorial letters, verified personal words, or high-confidence contemporaneous testimony; do not fill the gaps with a fictional interior monologue.
4. For doctrinal development, *Pascendi* provides a negative critique of modernist change in dogma but not a full positive theology of valid development; do not overscore SPX-EXP-014 / 034 as complete.
5. For lay reactions to supposed doctrinal error, *Pascendi* primarily legislates bishops and formation. Do not present it as an unqualified instruction for a lay visitor to denounce identified modern clergy.
6. No runtime publication, three-guide character changes, voice approval or new ownership registry is authorized by this screen.

The next useful deliverable is a **proof-of-answerability sample** with explicit user-question variants, exact source paragraphs, version/period qualifiers, restricted first-person attribution, and an independent acceptance decision. It will give a *real* denominator for that sample and permit a cautious pilot, instead of adding more unverified question ideas.


### First two cross-cohort same-intent adjudications

Research file: `data/learn/research/pius-x-two-cross-family-intent-joins-20261019.v1.json`.

Two especially strong parallels have now been **reviewed as the same user intention, for research-level retrieval grouping only**:
- **SPX-053 ↔ SPX-EXP-035**: Recognising the visible Church founded by Christ via the four marks, with 1905 Q155–162 and the digitally transcribed 1912 Q107–111 retained as separate witnesses.
- **SPX-014 ↔ SPX-EXP-045**: Why busy priestly ministry cannot replace meditation, anchored directly to *Haerent animo* §§15–20.

This is the first confirmed small semantic sample: **four different research prompts represent two user intentions**. It is **not** a claim that all 112 prompts have been deduplicated to 110 intentions; all other within- and cross-corpus overlaps are still unadjudicated. No canonical SPX IDs, source answers, visitor routing, or runtime text were changed.


## Pilot proof of answerability — 12 representative visitor questions

Research file: `data/learn/research/pius-x-proof-of-answerability-12case-20261019.v1.json`.

The first proof-of-answerability **purposive**, *nonrepresentative* twelve-case review goes beyond document-level source links. Each case now has a real visitor question, a narrow historically readable question/section locus, the issuer/witness class, a source-close working answer nucleus, a prohibited-inference statement, a follow-up, and an explicit historical-voice restriction.

| Editorial research disposition | Cases | Meaning |
| --- | ---: | --- |
| `PASS_CONSTRAINED` | **10** | Direct source locus supports a bounded answer nucleus if source, period and attribution constraints are respected |
| `HOLD_FIRST_PERSON_TESTIMONY` | **1** | A childhood-poverty question requests private feelings absent from secondary family biography; only factual third-person history survives the gate |
| `HOLD_INDIVIDUAL_DIAGNOSIS` | **1** | *Haerent animo* can explain neglect of priestly meditation but not diagnose a visitor's dry prayer or conscience |
| Visitor answers historically voiced / independently certified by this work | **0** | None published |

Representative lessons:
1. **E supremi §§1–4 (personal election):** Pius X's own papal writing explicitly reports tears, reluctance and eventual submission; this is an unusually strong basis for a tightly controlled *first-person paraphrase*, not invented conclave anecdotes.
2. **1905 Q669 (Rosary during Mass):** contrary to a potentially misleading shortcut, the text positively allows the Rosary if one tries to follow the sacrificial action. An unconditional prohibition fails the source.
3. **Salzano Q543 (bad thought):** the transcript distinguishes an unbidden thought from pleasurable/deliberate consent. A faithful reply should not pronounce on an individual's guilt.
4. **1905 Q527–533 (kinds of grace):** grace sanctifying versus actual is explicit; 1912 short Q269–271 on sacramental grace is the *wrong* same-intent mapping.
5. **Tra le sollecitudini §§1–5:** chant is preferred for holiness, artistry and universality; the document also endorses suitable polyphony.
6. **Pascendi §39:** 'synthesis of all heresies' is an assessment of a presented system, not a free-standing license to label contemporary people.
7. **Acerbo nimis §24:** adults require simple but carefully prepared catechetical teaching in addition to homilies.
8. **Haerent animo §§15–20:** priestly prayer cannot be substituted by busyness; maintain the *priest-specific* scope.
9. **Quam singulari (1910), rules 1–4:** proper First Communion preparation depends on use of reason and discernment, not a rigid birthday. This text was issued by the Sacred Congregation for the Discipline of the Sacraments *with papal approval*, **not authored as Pius X's first-person papal speech**.
10. **Museo Sarto family history:** the family was poor but not the poorest in Riese; feelings and memories cannot be supplied by the biographer's third-person narrative.

This is **10 supported question-specific research nuclei within this chosen sample**, *not a 10/12 representative answerability rate*, not 10 certified voice-ready conversations, and not an estimate of total distinct intentions across the corpus. No new canonical registry was created, no 1962 Mass engine was modified and nothing was published to the avatar.

**Next gate:** have an independent reviewer assess the ten proposed answer nuclei, their source/edition wording, and the permitted 1900s Catholic narrative voice; then test three adjacent natural-language variants and one follow-up for every passing case. The two blocked cases should use historically honest fallback rather than fabricated personal memories or pastoral diagnosis.


## Conversational robustness pilot: 36 paraphrases and 12 contextual follow-ups

Machine-readable, research-only gold fixture:
`data/learn/research/pius-x-12case-paraphrases-followups-20261019.v1.json`.

The twelve proof-of-answerability cases now have **three alternative English visitor phrasings and one contextual follow-up each (48 utterances)**, with manually reviewed expected seed IDs, evidence loci, source restrictions, sample restrained Catholic prose, and explicit unapproved flags. **Sixteen alternate phrasings specifically test unsafe premises or overreach**: a supposed formal rejection of election, imagined prohibition of the Rosary at Mass, individualized judgment of mortal sin, mandatory half-hour thanksgiving, confusion of actual and sacramental grace, suppression of polyphony, calling living persons heretics, imposing historical schedules as current law, misattributing `Quam singulari` to a first-person Pius X text, invented childhood feelings and personal diagnoses of spiritual dryness.

For natural follow-up contexts, three cases require particular restrictions:
- **After-Communion thanksgiving prayer** may be an editorial devotional composition; it must *not* masquerade as Sarto's verbatim prayer.
- **Adult catechetical lesson order** is not exhaustively provided by `Acerbo nimis`; any proposed detailed curriculum needs its own source.
- **Lay visitor's prayer dryness** may receive gentle general encouragement, but a priest-directed passage from `Haerent animo` cannot establish the individual's fault or spiritual state.

A historical-voice sample accompanies each pilot case. These samples are deliberately **not certified as Pope Pius X's words**, and are not a new answer bank. The test suite checks the expected source and attribution boundaries as well as corpus identity.

**Important operational limit:** draft [#1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443) owns the shared question interpreter; its current tested catalog does not include these new research-only St Pius X conversation families. Therefore **0 of these 48 were executed against the actual shared router**, and there is *no claimed routing accuracy, historical-voice approval, or independent evaluation score*. The fixture is a prospective gold test set for future integration through the existing router, not a competing interpreter.

### Next review gate

Apply the prospective cases to #1443 only once its topic/source-owner bridge can reference the existing SPX research IDs without generating answers. Record observed route `source_navigation`, `clarify` or `no_coverage`, alongside expected choices and unsupported overreach. After that, assess documentary voice separately from doctrinal and pastoral content; require reviewer approval before any case becomes visitor-visible. Resist further inflating source collection or research idea counts before this acceptance gate.


## Executed shared-router integration gate (PR #1443 pinned, 19 October)

The planned actual test is now **completed** (not merely prepared): [Actions run 39264387257](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39264387257). The workflow fetched the exact shared-router head `b4dd46743d641bfaa6076c6bb2fd8641c47077b6`, staged only the existing shared/hybrid router and original topic/concept registries, and ran the **36 paraphrases and 12 contextual follow-ups** from PR #1458 without modifying PR #1443 or creating another interpreter. Reusable machine-readable conclusions are in `data/learn/research/pius-x-pr1443-shared-router-observed-result-20261019.v1.json`; the full per-utterance trace is in the GitHub Actions artifact `pius-x-pr1443-48-router-diagnostic` (30-day retention).

| Observed outcome | Shared lexical router | Symbolic hybrid router |
| --- | ---: | ---: |
| Safe `no_coverage` abstentions | **45** | **48** |
| Unconfirmed source-navigation proposals **without an adequate precise source** | **3** | **0** |
| Clarifications / handoffs | **0** | **0** |
| Generated replies or unapproved character switches | **0** | **0** |
| **Total utterances** | **48** | **48** |

The three source-navigation false positives are exact:
- `SPX-PILOT-02-V3` — alleged Rosary prohibition at Mass routed to generic 1912 Q418 on prayer rather than 1905 Q667–669.
- `SPX-PILOT-03-V2` — “Is a temptation itself already a sin?” routed to a general sin definition 1912 Q135 rather than Salzano Q541–543 on involuntary thought and consent.
- `SPX-PILOT-04-V2` — after-Communion recollection routed to 1912 Q325/Q329 on the Real Presence rather than Salzano Q506–508 on thanksgiving.

All three erroneous inferred choices still **required user confirmation** and produced `answerText:null`. The hybrid's 48 abstentions are safer, but should not be presented as **48 correct answers** or a standalone accuracy percentage: none of the 12 precise SPX research family owners has yet been added as an authorized source-navigation entry in the 172-topic PR #1443 catalog. This is a *targeted assistant-authored regression sample*, not representative live visitor questions.

**Action for the separate router owner:** The findings have been shared directly on [PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443). That pipeline must import only **source-navigation pointers** to verified 1905/Salzano/encyclical/dicastery owners, never historical answer text into the router, and must preserve explicit confirmation and no-coverage treatment. Repeat the pinned 48-test suite when new SPX source owners become navigable. Human doctrinal and voice sign-off stays a separate gate.


## Actual historical-source-bridge integration result — 184-topic catalog

The shared Living Church router owner [PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443) now has a research-only extension from **172 to 184 topics**: ten specific St Pius X historical-source pointer records and two explicit source gaps (unattested childhood feelings and individualized prayer-dryness diagnosis). No answer text or authoritative source corpus was copied into the router.

The source bridge points to historical-document URLs and edition-specific loci; **it does not yet make the actual documents available as in-app pages**. Original documents must ultimately resolve via their provenance links, rather than the generic `learn.catechism` route.

The original **48 untouched editorial probes** were executed against the new catalog in [CI run 39267811444](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39267811444); the per-utterance JSON is in artifact `pius-x-pr1443-184topic-heldout-48-results`. The machine-readable summary is `data/learn/research/pius-x-pr1443-184topic-bridge-measured-outcome-20261019.v1.json`.

| Outcome | Shared lexical router | Hybrid router |
| --- | ---: | ---: |
| **Correct precise source route** | **9** | **1** |
| Safe unresolved `no_coverage` | 27 | 39 |
| Safe held personal-answer cases | 8 | 8 |
| **Wrong specific source proposed** | **4** | **0** |
| Historical / pastoral answer generated | 0 | 0 |

A newly observed cross-topic error is `SPX-PILOT-01-F1`: the Pope's programme after his election (`E supremi`) misroutes to the Modernism topic (`Pascendi`). Three previously known errors also persist: generic prayer instead of the Rosary-at-Mass locus; generic sin instead of Sarto's teaching on temptation versus consent; Real Presence instead of post-Communion thanksgiving. All wrong inferred source navigations still require confirmation.

This **fails source-retrieval acceptance** despite new coverage. The 48 probes are editor-authored, not representative visitors; the catalog was *not* fitted to the 48 evaluation utterances. Do not add those phrases as question variants to inflate the score. The correct subsequent step is source-aware question interpretation with an independent EN/FR holdout set and an explicit `correct source / abstention / wrong source` measurement. Do not infer that 9 successful source links means nine certified St Pius X answers.


## Measured source-aware router regression — 48 previous queries (not independent)

The existing Living Church owner (draft PR #1443) now implements two-facet bilingual original-source matching, a fail-closed external-source navigation contract, and **confirmed-only** historical follow-up continuity. The repeated 48-question suite ran against a pinned repository commit in [Actions run 39270927468](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39270927468). Updated exact measurements for the final guarded source-aware implementation are recorded in `data/learn/research/pius-x-source-aware-router-48-regression-result-20261019.v1.json`.

| Outcome for 48 previously authored queries | Shared router | Hybrid router |
| --- | ---: | ---: |
| Correct original historical document | **25** | **26** |
| No-coverage / safe unresolved | 15 | 14 |
| Correct hold for unsupported personal-answer source | 8 | 8 |
| **Wrong original source** | **0** | **0** |
| Approved generated answers | 0 | 0 |

A previously inspected error that conflated a layman's private prayer at Mass with priestly mental prayer was corrected by tightening the **source category**, not by copying the problematic visitor sentence into the matching variants. The regression harness now requires zero wrong-original-source proposals; it does not assert independent retrieval accuracy.

The **earlier 184-topic pre-gating check** had 9 correct/4 wrong for the shared router and 1 correct/0 wrong for the hybrid; the subsequent test simulates confirmed follow-up context only after a correct first documentary source resolution, so the before/after totals are **engineering acceptance signals, not strict like-for-like population statistics**.

Source URL destination is now returned with document locator and witness class, and a missing or changed pointer fails closed. However this is still a *research-only router*. No interactive visual novel was modified, no user-facing source opener was wired, and no historically voiced replies were approved or published.

Next: evaluate the source-aware gate on a truly fresh, separately reviewed bilingual mixed-intent corpus and subsequently wire the approved consumer UI's document-opening action to the source owner. Remain strict about no invented childhood feelings, no individualized moral diagnosis, and no first-person claims from a papally approved dicastery decree.
