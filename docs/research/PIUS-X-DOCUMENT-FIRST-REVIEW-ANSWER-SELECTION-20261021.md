# St Pius X — source-first answer selection bridge (review only)

**21 October 2026 · PR #1458 content owner / PR #1443 navigation owner · NOT PUBLISHED**

## Delivered and actually tested

The existing PR #1443 deterministic bilingual shared/hybrid question interpreter recognizes a source topic. The new **read-only** PR #1458 review adapter then checks exact source pointer, document URL, section locator, segment identity and claim IDs, before offering a pre-existing adapted papal response in English or French. No new papal doctrine, sentences, runtime router, or canonical content owner was added.

- Research data: [three-topic/six-plan source-to-claims registry](../../data/learn/research/pius-x-document-first-router-to-claims-20261021.v1.json)
- Implementation: [read-only review selector](../../tools/formation/pius-x-document-first-answer-selector.mjs)
- Acceptance: [routing, bilingual and refusal contract](../../tests/pius-x-document-first-answer-selection.mjs)
- Existing source builder: [12 + 22 = 34](../../tools/formation/build-pius-x-three-document-full-benchmark.mjs)
- Existing router owner: [PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443)
- Source owner: [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458)

### Current coverage

| PR #1443 original-document pointer | Matched source | Main excerpt claims | Optional, independently bounded scope |
| --- | --- | --- | --- |
| SPX-PILOT-13 | *Acerbo nimis* §§12–14 | A15, A16 (sermon/catechism foundation) | A05, A06 (Benedict XIV distinction / bread and milk) |
| SPX-PILOT-14 | *E supremi* §13 | E03, E13 (charity extending to opponents) | E03 (bitter zeal and reproach) |
| SPX-PILOT-09 | *Haerent animo* §§15–20 | H17, H18, H20 (priestly daily meditation) | H19, H18 (routine weakening fervour) |

**Execution:** GitHub Actions [run 39643737041](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39643737041) passed the new job and original 34-turn corpus build: **36 source-bound candidates, zero wrong source/claim matches, 12 negative refusals, 18 English/French paired selections, zero publishing approvals**. Counts include two routing engines and repeat cases; they are **not** 36 independent historical answers or an independent user holdout.

The test uses six distinct standalone question intents, each in EN and FR, plus three elliptical dependent follow-ups, each in EN and FR. Every candidate carries the actual original segment IDs and a source URL/locator; English and French use identical source IDs. Negative prompts about individual sin, contemporary discipline, Mass attendance prayer and unrelated matters remain unserved.

### Acceptance boundaries

1. **No new free-form answer generation.** The interface chooses existing segment text only; further work cannot silently fill gaps in papal voice.
2. **Actual confirmation required** before even an editorial candidate is returned, including for an exact authored catalog question. Previously proposed but unconfirmed topics cannot authorize elliptical follow-ups.
3. **No claim of verbatim quotation or source certification.** The Pius X papal plural and historical phrasing are adapted editorially; authority citations and original audience are retained; the 34-exchange content's source, theology, English, French, period-voice and publication approvals remain **false**.
4. **No native integration.** The production avatar, the P2 five approved St Pius X sprites, its visual-novel scene, the Mass reader and the canonical 433-question Catechism have not been changed.
5. **Pinned separate owner:** CI pulls exact PR #1443 router commit `d25651b7b77ea5331bfc8485717cb00bb0047811`. A future router change requires deliberate reconciliation, not automatic repinning.
6. **No fabricated modern judgment.** If the shared router cannot identify a single historic source, if the pointer differs, if passage coverage or claim identities mismatch, or if personal/current-discipline safety gates refuse the question, this adapter gives no papal response.

### What this does not yet prove

This is a bounded feasibility demonstration of **3 source topics and 6 curated selections**, not a general conversational model covering all 34 exchanges, 82 authored dialogue chapters or 810 research families. The probes were authored and inspected during development; passage accuracy and French style need independent historical, theological and linguistic review. It does not measure natural conversation with real visitors.

**Next admissible step:** widen claim-level indexing across the remaining already-audited historical topics, then evaluate genuinely independent visitor questions with explicit no-match, clarification, source fidelity and persona QA. Import into the stage only after owner and publishing approvals; never upgrade an unapproved adaptation to original papal speech.


## Expansion: 11 additional passage topics (21 October 2026)

Following the initial three-topic acceptance, the existing PR #1443 routing owner now indexes 197 total research topics with **23 original-document passage locators** (11 new locators, no replacement of the original 12). The separate PR #1458 read-only selector now has **16 source-topic entries and 23 bounded response selection plans**, including two pre-existing documentary source pointers SPX-PILOT-01 and SPX-PILOT-08.

### New original passage clusters

| Source | Selected topics and text locations |
| --- | --- |
| *Acerbo nimis* | Religious ignorance §§1–2; pastors' teaching duty §§7–9; catechist preparation §§25–26; baptismal faith §16 |
| *E supremi* | Religious education for restoration §12; lay apostolate and concrete works §14 |
| *Haerent animo* | Active ministry versus personal holiness §§8–10; spiritual reading §§22–23; examination of conscience §§25–27; exercises and mutual support §§34–36; concluding prayer §37 |

The original `SPX-PILOT-01` supports the *E supremi* §4 pontifical-programme selection, and `SPX-PILOT-08` supports *Acerbo nimis* §24 adult instruction. This reuses the verified source-navigation owner instead of creating new duplicate topics.

The separate frozen editorial question files, committed before this extension's first evaluation, are:
- `data/learn/research/pius-x-next11-frozen-english-french-question-probes-20261021.v1.json` (44 catalog formulations and eight negative contrasts)
- `data/learn/research/pius-x-next11-pre-evaluation-paraphrase-pairs-20261021.v1.json` (22 off-catalog formulations)

### Executed results

**Existing PR #1443 router:** [successful full suite, run 39646042533](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39646042533). For EACH shared/hybrid engine, 39/44 catalog formulations and 7/22 off-catalog variants mapped to the exact original paragraph; the remaining cases abstained without **any wrong original-source assignments**. Eight negative EN/FR cases per engine were refused. Prior Pius X source-concept and liturgical/personal-verdict regression controls also passed.

**PR #1458 answer selection:** [successful source-to-claims job, run 39646468849](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39646468849). For EACH shared/hybrid engine, the new 11 topics yielded **39 editorial source-bound candidates from 44 catalog questions** and **7 from 22 frozen off-catalog paraphrases**; no wrong-source/claim candidates, no unsafe negatives, **18 English/French aligned pairs**, zero published replies. The original 36-case bounded-answer integration also passed.

These figures are not additive estimates of independent accuracy. The test wording was editor-authored; the 22 rephrasings are a pre-evaluation editorial set, not independent users. Current generalization is **insufficient for an autonomous conversational release**.

### Remaining work, prioritized

First, improve **precision-preserving natural-language recognition**, not authoring more papal dialogue: expand the source-owned two-facet concept vocabulary from real attested passage wording, include French inflections, and keep explicit clarification or abstention for overlapping passages. Reassess against genuinely new questions rather than reusing an inspected probe as a new holdout.

Second, complete independent source, EN/FR, theological, addressee and period-voice approval before moving the already-curated reply segments into the fixed-sprite visual-novel runtime. Never present adapted phrases as verbatim quotations, and do not apply early-1900s clerical legislation as present universal discipline.

## Concept-aware retrieval improvement — 21 October 2026

The **existing** PR #1443 source-concept interpretation was expanded from **7 to 18 source-owned EN/FR concept families** without adding a classifier or generating any Pius X dialogue. The same two-source-facet gate and original paragraph identity requirements apply. The clergy-only retreat exclusion now applies in both the historical literal matcher and the concept matcher. Present-day catechism canon-law questions and moral culpability assertions about Rosary at Mass are explicitly held rather than interpreted as historical discipline.

**Before:** 7/22 editor-authored off-catalog reformulations correctly reached their original source in each router. **After:** 17/22; 5 safe abstentions and zero wrong-document assignments. The original 39/44 catalog matches and eight negative controls per router continue to hold. This is a previously inspected regression, not independent accuracy.

A **separate prospective editor-authored fixture**, frozen in PR #1458 commit `cffd128a5b37a784ddfc461e59fb306304b0a2d3` before implementation, contained 22 bilingual source questions and 12 negative contrasts. Its **initial** run reached 16/22 correct original paragraphs (9 EN / 7 FR) without positive wrong-document assignments, but **3/12 negative cases were incorrectly given source links**. The failure cases were (a) a French question asking current canon law on parish catechism (wrongly sent to the 1905 pastoral teaching topic), and (b) two EN/FR questions about whether a lay Rosary at Mass was sinful (wrongly redirected to historical Rosary permission). These were fixed by existing contemporary-discipline and liturgical-scope owner gates. The **post-correction** regression reached 16/22 original source matches and **12/12 safe negative holds**, with zero wrong-document matches. Do **not** rebrand this rerun as an untouched first evaluation.

The source-only router's CI [run 39654785449](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39654785449) passed; the cross-branch original-source answer selector [run 39655139644](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39655139644) passed the original 36-case integration plus the 11-topic extension. Each variant selected **39 source/claim-bounded catalog candidates** and **17 source/claim-bounded off-catalog candidates**, with five safe off-catalog refusals, zero claim/source mismatches, eight negative holds and zero release approvals. The implementation remains review-only and never composes an invented papal reply.

**Residual limitation:** Six of the 22 prospective editorial prompts were unresolved, with French weaker than English. The broader earlier doctrinal concept regression now records 26/28 positive source navigations instead of 27/28 before expansion; the extra case safely abstains, with no wrong owner. This tradeoff should be preserved in reporting rather than hidden or resolved through unsafe keyword broadening.

Next, independent historical/EN/FR/theological approval and a genuinely new real-user question sample are required before any conversational release. More scripted answer-writing is not the next bottleneck.
