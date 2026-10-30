# SPX — source / Chanoine / Denzinger three-way reference contract

**20 October 2026. RESEARCH ONLY — NO PUBLIC ANSWER, AVATAR, OR ROUTE CERTIFICATION.**

Source-of-truth: [SPX content PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458). Upstream source owners remain separate: [Chanoine shared router PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443), [Magisterium/Denzinger PR #1452](https://github.com/Fulcanelli13/ad-orientem/pull/1452), [Pius X historical voice PR #1419](https://github.com/Fulcanelli13/ad-orientem/pull/1419), and [P2 in-church characters + source-extractive Canon pilot PR #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402). Never copy their canonical answer bodies into SPX.

## Source coverage now indexed

Four JSON audit shards, each with one record per **produced draft instance**:

- `pius-x-triad-audit-b02-b05-20261020.v1.json`: 200 records
- `pius-x-triad-audit-b06-b09-20261020.v1.json`: 200 records
- `pius-x-triad-audit-b10-b13-20261020.v1.json`: 200 records
- `pius-x-triad-audit-b14-b16-b50-pilot-20261020.v1.json`: 210 records (200 bulk, 10 separate pilot)

**810 draft-family instances indexed:** 800 bulk draft families plus ten separate pilot families, representing **1,630 drafted conversation turns** (800×2 + 10×3). All 810 have an online **family-level original-source URL and locus**, drawn from their existing original research owner or conservatively reconstructed from documented 1905 printed-question section ranges. None of those family links certifies the accuracy of each drafted sentence. The records intentionally contain no copied dialogue answers.

**13** draft instances now have at least one *provisional* named 1911 **old Dz** topic candidate. **797** remain explicitly `UNASSESSED_NO_NUMBER_ASSIGNED`, not `NOT_APPLICABLE`. **0** edition-number/photo-facsimile, contemporary DS/DH-number, or individual SPX↔Denzinger-topic publication certifications. **6** draft instances have a specific *research-only* Chanoine topic candidate (Mass sacrifice or transubstantiation, and a related AQ04/AQ05 source-owned pilot answer). Every **810** record offers an explicit-consent, source-gated transition to the Chanoine; source eligibility of a particular reply is a separate matter.

The 810 instance IDs are distinct strings in these four shards. **Do not infer 810 unique visitor question intents:** semantic and topical overlaps remain unresolved across batches and the ten-family pilot.

## Three mandatory relationships

1. **St Pius X original source:** Always link a precise original-language passage or numbered question. Distinguish **personal papal writing** from a *papally prescribed but not personally composed* 1905/1912 Catechism, and historical biography from personal testimony. A URL to a book is not a verified passage or an authenticated Pope quotation.
2. **Chanoine handoff:** Always permit the visitor to request a colleague switch, preserving question, topic, prior context, language, source references, and visited-guide trail. Ask for explicit consent, deny loops, and never promise a source-backed Chanoine answer merely because a topical route exists. Where the Chanoine has no source-supported answer, state the limitation rather than generate one.
3. **Denzinger / Magisterium:** Every answer receives an editorial applicability decision. Relevant doctrine should link to the **original magisterial text** through the canonical Magisterium passage record and an edition-specific Denzinger reference where evidenced. An unanswered applicability check is `UNASSESSED`; `NOT_APPLICABLE_BIOGRAPHICAL` requires manual review. No guessed numbers, no silent mixing of old Dz with modern DH/DS, and no back-attribution of post-1914 documents to Giuseppe Sarto.

## Critical distinction: family-level reference is not an answer-level citation

Before allowing any SPX character reply into the app, validate **each individual conversational turn and each EN/FR variant** separately:

- Open the exact primary witness; record original-language excerpt boundaries, date, edition and authorship class.
- Confirm that **every factual/theological proposition in that turn** is supported at that locus. A source printed on the family is a candidate lead only.
- Link the original-source locator on *that answer*, not merely on the conversation family. Where a follow-up uses an adjacent numbered question, record the second question ID, not just the opening question ID.
- Collate each applied Denzinger citation against a named edition's photographed page, preserving its original magisterial document. The 1911 Bannwart OCR leads are provisional and cannot be publicly displayed as certified.
- If no Denzinger entry directly covers a personal, pastoral, administrative, or biographical question, record the independently assessed `NOT_APPLICABLE` and, if useful, a contextual doctrinal topic **clearly identified as an optional parallel**.
- Confirm whether the Chanoine's proposed follow-up is (a) published source-backed, (b) precise but research-only, or (c) simply an invitation to ask a fresh question without claiming an answer.
- Independently review theology, fidelity to original source, historic voice, translation EN, translation FR, and release rights.
- Never publish merely because automated record-shape tests pass.

Suggested final per-answer contract: `turnId`, `language`, `originalSourceRefs`, `originalTextSpan`, `claimEvidenceReview`, `magisteriumPassageRefs`, `denzingerApplicability`, `denzingerEditionAndNumbers`, `canonFollowupTopicOrOpenQuestion`, `canonAnswerSourceStatus`, `handoffConsentRequired`, `approvalFlags`.

## Two examples

### SPX-001 — Why is the Mass a sacrifice?

- Source: **1905 Catechismo maggiore Q652–664**. This is a papally prescribed catechetical witness, not verbatim papal speech.
- Magisterium: Trent, Session XXII; candidate old Dz **940**, **948**, **950** through existing MG-P005/MG-P018/MG-P019. 1911 OCR leads, not independently certified modern numbers.
- Chanoine: shared topic `canon.apologetics_apol_031` remains a held source-gap in PR #1443; distinct existing `apostolate:AQ04` extractive Mass-sacrifice pilot in PR #1402 is a separate source-owned opportunity. No unreviewed handoff action wired.

### SPX-055 — Does papal infallibility mean the Pope cannot err?

- Source: **1905 Catechismo maggiore Q197–203**.
- Magisterium: Vatican I *Pastor aeternus*, chap. IV, candidate old Dz **1839** (MG-P006); distinguish ex cathedra definition from broad personal inerrancy.
- Chanoine: consent-based colleague switch remains available, but no topic-specific approved answer inferred from the SPX question.

## What is **not** claimed by this batch

- Not 810 verified distinct user intentions or 1,630 quotation-certified answers.
- Not a finished Denzinger concordance: the available Magisterium OCR list is an **older-number research witness**, and modern numbers are **not** certified.
- Not a full 810-family semantic route to verified Chanoine content.
- Not completed claim-by-claim/turn-by-turn/source-edition collation, EN/FR approval, archival rights approval, a live handoff, or application integration.

**Automated static gate:** `node tests/pius-x-triad-links.mjs`, included in the existing SPX research workflow. It verifies completeness and refusal to misrepresent any unapproved draft as published. Completion of this test is never equivalent to editorial approval.

**Next work:** triage the 797 Denzinger applicability decisions by doctrine group; assemble original-text sentence spans for each of the 1,630 turns, using the existing source-owner extracts; then stage a source-aware Chanoine referral QA matrix in PR #1443's owner instead of duplicating its routes.
