# St Pius X — interactive source-preserving EN/FR dialogue choices + complete preliminary 100-family Italian screening

**20 October 2026. RESEARCH BRANCH ONLY; no production avatar answers or Denzinger publication certifications.**

## Delivered in the existing #1458 content-owner branch

**Bilingual semantic navigation:** `data/learn/research/pius-x-20path-bilingual-choice-navigation-20261020.v1.json`

- **20 chapters** subdivided into **50 deliberate EN/FR topical tracks**.
- **100 exact Q567–Q666 original source-question nodes**, retaining existing question wording in English and French and pointers to the **unmodified** original draft answer-owner files.
- **33 explicit cross-chapter research choices** (e.g. Consecration → what remains of bread and wine; Christ under species → tabernacle adoration; Mass and Calvary → four ends of Mass).
- No automatically appended *next numbered* question. Options have a `IF_NOT_PREVIOUSLY_VISITED_AND_VISITOR_CHOSES_TO_EXPLORE` condition; the client must remove previously visited questions, not repeat answers, and present visitor-controlled choices.
- Every chapter retains old Dz/Magisterium candidate references under `HIDE_UNTIL_CLAIM_AND_EDITION_VERIFIED`; no invented Denzinger number or modern DH number.
- Chanoine remains an opt-in, visitor-consented source-owned colleague switch; a possible Canon topic does **not** mean an approved Canon reply exists. Context (original question, language, selected topic, source IDs, prior guides) must be carried forward.

This is a **navigation dataset**, not approved rewritten or historically attributed Pius X speech.

## Source-to-turn research wave: 100 of 100 preliminarily inspected

Three complementary **digital Italian** Q&A research files cover **100/100 distinct 1905 Catechism questions** and **200/200 existing 2-turn bilingual draft records** from Batch 9 + Batch 10:

| Source research file | New families | Draft turns initially screened | Source-support array expansions proposed | Historical/claim-scope flagged families |
|---|---:|---:|---:|---:|
| `pius-x-31family-62turn-italian-review-20261020.v1.json` | 31 | 62 | 5 | 19 |
| `pius-x-23more-46turn-italian-review-20261020.v1.json` | 23 | 46 | 1 | 12 |
| `pius-x-46final-92turn-italian-review-20261020.v1.json` | 46 | 92 | 3 | 15 |
| **TOTAL** | **100** | **200** | **9 research corrections** | **46 flagged family records** |

The numbers represent **preliminary linked-original-language source and proposition screening** against the [Museo San Pio X original Italian digital witness](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/), not independent printed-1905 critical collation, theological certification, Denzinger original-facsimile certification, historical voice approval, translation approval or rights clearance. In particular `0` original claim-level publication-certified turns, `0` new approved Chanoine character replies, and `0` public releases.

**Important: The original 200 draft replies remain unchanged.** New data proposes source-ID extensions, caveats and publication gates in separate review registers; does not silently rewrite answers.

### Specific evidence defects flagged

1. Q607 first answer defines transubstantiation, includes appearances/substance; relies not only on Q607 but also Q596 and Q609–610.
2. Q633 opening explains historic midnight fast; midnight timing appears in **Q628**, while Q633 itself defines a natural fast. The source review adds Q628 to Q633.
3. Q632 follow-up also discusses midnight fasting; similarly needs both Q628 and Q633.
4. Q619 opening adds a condition about continuing Eucharistic species; **Q641** explains the duration of sacramental presence.
5. Q654 follow-up and Q655 opening describe Christ as principal offering Priest/Victim; **Q660** explicitly names Christ as principal offerer, so Q655 alone is insufficient.
6. **Q652 requires actual wording repair**: the Catechism refers to an offering of a visible thing and its destruction *in some manner*; the draft paraphrase adds “change **or** destruction” and cannot be certified by citation expansion alone.
7. Q657 requires the distinction between sacramental force of the words and the whole Christ present by concomitance; no false impression that a consecrated host contains only Christ's Body.
8. First Communion, godparent marriage impediments, old Confirmation gestures, the pre-20 December 1905 frequent Communion advice and the midnight-fast text are **historical discussions, not today's canonical instructions**.
9. Personal sin or fitness for Communion cannot be judged by an avatar; send individualized sacramental cases to a real priest/confessor, rather than assuming the fictional Chanoine persona is an actual confessor.

## Example: source-owned naturalistic dialogue path

At `SPX-ARC-EUCHARIST_CONSECRATION`, an EN/FR visitor may ask why the host changes, then choose among **Q605** “When does the Eucharistic conversion take place?”, **Q607** “What does the Church call the change?”, and **Q601–Q604** about bread/wine before and after consecration. The menu does not automatically force Q608 after Q607. Visitors may instead choose a genuinely relevant thematic continuation such as **Q609** on remaining appearances.

When a real answer is allowed, the dialogue must show **which original numbered answer supports it**, and a clearly marked source panel. An optional Denzinger reference can appear only if individually matched to the claim and named edition; an optional Chanoine handoff only after consent and source-answer eligibility check.

At `SPX-ARC-MASS_CALVARY_RELATION`, visitors may begin with Q655 about the identity of the Sacrifice, or Q657 about sacramental representation, and choose the related but distinct subjects Q656/Q658; no predetermined tour of all four questions.

## Editorial release and CI

`tests/pius-x-bilingual-dialogue-choices.mjs` now validates:
- all 100 unique source-question nodes and the 50 topical tracks across 20 chapters;
- all bilingual choice labels match the existing draft-owner question stems (no invented dialogic answers);
- all 33 cross-chapter targets exist in original source registry;
- no automatic next-question display, no denied source safety, no direct unapproved Chanoine handoff;
- all 100 source questions are represented once across the three Italian Q&A review batches, covering exactly 200 turns with original source-owner answer bytes preserved;
- source-reference additions, historically sensitive flags and **zero independent approval**.

The test runs under the existing `pius-x-conversation-evidence-bridge.yml` workflow.

**Next:** get critical 1905 photographic print and Denzinger named-edition page images collated, then repair the nine support problems and source phrasing *in canonical answer drafts only after theological review*. Deduplicate across adjacent question subtopics and the earlier 700+ SPX records in a separate semantic ownership review, never by destroying QIDs. Follow with EN/FR / period voice / Chanoine source-owner approvals and a production-UI test.
