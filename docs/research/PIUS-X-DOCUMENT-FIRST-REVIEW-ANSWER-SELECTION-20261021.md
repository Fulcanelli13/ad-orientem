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
