# St Pius X — first 40 Italian-source claim audit and bilingual revision shortlist

**20 October 2026 · Research PR #1458 · No character answer published or independently certified.**

## Completed source comparison

All **40 priority opening answers** from the existing 100-family Sacraments cohort have been compared at proposition level against the Italian digital transcription of the 1905 *Catechismo Maggiore*, [Parte quarta dei sacramenti](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/). This is **one authoritative-content candidate witness**, not photographic collation of each original printed leaf and not independent theological review.

Full machine-readable record: `data/learn/research/pius-x-first40-claim-italian-witness-review-20261020.v1.json`. Each record has the original EN/FR source-owner answer, exact Italian-digital question locator and current source-page line range, brief distinct semantic anchors, any correction candidate, historical caution and explicit false human approval flags. There is no Denzinger verification dependency.

| Outcome | Opening answers |
|---|---:|
| No material meaning discrepancy identified in this preliminary digital Italian comparison | 28 |
| Tighter EN/FR wording proposed | **12** |
| Of those, existing proposed corrections retained unchanged | 5 |
| Newly written bilingual source-tightening alternatives | 7 |
| Of the twelve, particularly material source-wording errors already noted | **2** (Q652, Q657) |
| Historical/pastoral/interpretative cautions annotated | 5 |
| Independently approved for voice, theology, EN/FR and publication | **0** |

The editorial number `PX1905-Qnnn` is **not printed in the Vatican 1905 D./R. edition**. When preparing eventual citations, use the Italian question incipit/chapter, ideally original printed page; digital line numbers are **working-location hints**, not permanent book locators.

### Exact changes flagged in the first 40

| Editorial QID | Reason for proposing a wording change |
|---|---|
| Q607 | Define conversion and surviving species accurately, citing Q596, Q607, Q609 and Q610. Existing correction retained. |
| Q613 | Prefer the source’s living-and-immortal / inseparable Body, Blood, Soul and Divinity explanation over adding the unsourced word *risen* in the short summary. New EN/FR option. |
| Q619 | Add Q641 to support the duration *while species remain*. Existing correction retained. |
| Q626 | Preserve the source’s specific mention of concupiscence and conformity to Christ’s will alongside charity and future glory. New EN/FR option. |
| Q636 | Remove the draft’s additional *ordinary food* contrast from the answer itself; Q636 asks for knowledge and firm belief in the doctrine taught. New EN/FR option. |
| Q637 | Restore the source's reference to modesty both of deportment and dress, besides preparation and thanksgiving. New EN/FR option. |
| Q638 | Use the source’s precise act of *contrition*, rather than generic *sorrow*, in the seven-part preparation list. New EN/FR option. |
| Q650 | Limit the **character text** to what the 1905 Catechism says of the advice of a learned, pious confessor. Move commentary about this historically framed discipline out of character and into an editorial note. New EN/FR option and separate historical note. |
| Q665 | Follow the two specifically named source dispositions—outward modesty and devotion of the heart—without importing a third category. New EN/FR option. |
| Q652 | Correct a substantive deviation: the 1905 text requires the offering of a sensible thing and its destruction *in some manner*, not “change or destruction.” Existing correction retained. |
| Q655 | The source distinguishes the substantially identical sacrifice and different manner; Q660 is needed for Christ the first/principal offerer. Existing correction retained. |
| Q657 | Preserve the effect of **separate consecratory words** and the **whole living Christ under either species through concomitance and hypostatic union**. Existing correction retained. |

The remaining **28 preliminary source-meaning matches are not approved answers**; they still require a final original-print sentence collation, EN/FR language check, doctrinal signoff and review against the documented St Pius X period voice. Some wording is interpretative, which is acceptable when transparently presented as reconstruction and checked against the original witness.

### Context cautions kept separate

- **Q627** itself faithfully conditions the benefits of Communion on proper dispositions. Its existing next-turn discussion touches the historically dated **midnight Eucharistic fast** at Q628; do not silently turn it into a universal present instruction.
- **Q641** must maintain a distinction between grace and sacramental Real Presence, the latter lasting while Eucharistic species remain.
- **Q649–650** accurately reflect the passage’s 1905 presentation of frequent Communion, but context on later discipline, and any personal advice, belongs to an identifiable editorial/pastoral surface—not to invented papal words.
- **Q665** lists two dispositions for fruitful Mass attendance. Avoid deriving from this answer a universal **1962** posture prescription; the different historic postural example appears at Q666.

## Review artifact upgraded

`previews/visible-mass-3d/pius-x-batch-release-editorial-review.html` now shows the **Italian-source evidence check** beside every first-wave answer. Seven newly proposed bilingual alternatives are selectable as **Italian-source proposal**, while five already existed as source corrections. The original EN/FR text remains visible and never auto-overwritten.

`tools/formation/build-pius-x-release-review.mjs` embeds the original 100-opening-turn registry **and** the 40-entry source audit into one offline HTML. It refuses to build if the source/audit indicates publication or human expert approval. Reviewer notes and changes are exportable and importable JSON, but an editor’s checkboxes and marks do **not** authorize app publication.

`tests/pius-x-first40-italian-claim-review.mjs` compares all 40 records to canonical source-owner original text, five previous corrections and the seven new alternatives, ensuring zero Denzinger requirement, zero human certifications and zero publication. The mobile/desktop browser test now also opens a newly proposed Italian-source variant.

## Next work with minimal review overhead

1. Let the editor review **four grouped pages of ten** using the same exported JSON, not individual chat prompts for every question.
2. Treat **Q652 and Q657** as mandatory source-fidelity repairs, and **Q650** as a strict separation of 1905-period explanation from contemporary pastoral direction.
3. Promote only the source/EN/FR/voice-approved response variants through the Formation content owner; avoid opening another parallel repository or duplicating the canonical draft content.
4. Keep the current Living Church integration **review-only** until the source owner gives explicit approval flags. Denzinger is optional and out of the critical path.

**Evidence status:** Preliminary digital original-language proposition comparison is complete for the 40 openings. Final print-collation and human/doctrinal approval are **not** complete.
