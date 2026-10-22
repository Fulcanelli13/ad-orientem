# Historia Salutis — one working priority-16 review

**22 October 2026 · parallel-pipeline reconciliation · no editorial approval, no main-manuscript changes**

The project already had two independently prepared exact-Scripture source-selection packets for the **same sixteen** restoration candidates. They cannot both be presented as the single approved economical main narrative. This record establishes **one current research preview**, preserves the second as an integrity comparison, and isolates the four decisions requiring explicit editorial judgment.

## Ownership

- **Working research preview (the only active review UI):** [Priority-16 viewer](./historia-priority16-review.html), backed by [156-verse, 45-range proposal](../data/research/historia-salutis-thematic-priority16-economical-select-20261022.v1.json).
- **Context-preserving comparison only:** [196-verse, 34-range alternate selections](../data/research/historia-salutis-priority16-economical-selections-20261022.v1.json) and its [detailed explanatory packet](./historia-priority16-scripture-editorial-packet-20261022.md). The existing review viewer does **not** load these alternatives.
- **Adjudication matrix:** [Machine-readable, source-verified reconciliation](../data/research/historia-salutis-priority16-parallel-reconciliation-20261022.v1.json).
- **Approval boundary:** neither selection has been accepted into the 54-chapter Historia Salutis manuscript. Both continue to use the original Catholic witness files for every word of Scripture; neither should be copied into a new standalone text store.

### Reconciliation status

| Outcome | Entries |
|---|---:|
| Identical exact passages chosen independently | **7** |
| Shorter original preview provisionally preferred, pending editorial acceptance | **5** |
| Four textual-integrity disagreements requiring explicit review | **4** |
| **Total** | **16** |

The **156-verse preview** is approximately **63% shorter** than the 418-verse complete source group. The context-preserving comparison retains **196 verses** (53% shorter). A purely *illustrative* mix taking the longer variant for the four integrity holds would retain **182 verses in 39 ranges**, but **no third proposal has been installed or accepted**. Reducing the number of verses is never sufficient evidence that a reading is better.

## The four decisions that matter

| Episode | Working preview | Context-preserving alternative | Why editorial approval is needed |
|---|---|---|---|
| **035 · The twelve spies** | 19 verses | 29 verses | The preview omits Moses' intercession in Numbers 14:13–20. Decide whether the complete causal sequence—rebellion, intercession, divine response and forty-year judgment—needs to appear in the main covenantal arc. |
| **044 · Joshua's covenant renewal** | 14 verses | 18 verses | The preview omits Joshua 24:26–27 (written covenant and memorial witness) and portions of the people's profession. This is a covenantal hinge, so its conclusion has special weight. Keep the two Joshua addresses separate and place renewal before the Judges transition. |
| **174 · Washing of the feet** | 12 verses | 17 verses | The preview skips John 13:9–11, part of Peter's dialogue and Christ's warning that not all are clean. Determine whether the complete Johannine sacramental and pastoral context should remain. Do not blend the text into Luke 22 as a synthetic Gospel. |
| **184 · Emmaus** | 16 verses | 23 verses | The preview omits the Cleophas exchange, the empty-tomb report and part of the disciples' return. These create the context for Christ's response and recognition. Full Luke 24:13–35 is the safer coherent narrative if Emmaus joins the backbone. |

## Why five shorter alternatives may be preferable

- **Manna (027):** nine verses keep the complaint, gift, identification and forty-year duration. The regulations and jar memorial remain accessible in Exodus 16.
- **Fiery furnace (084):** thirteen verses avoid verse 3:23's embedded Crampon editorial note while retaining confession, deliverance and the king's reaction. The prayer and canticle within Catholic Daniel 3 remain **canonical** and available in the complete text, not deleted.
- **Public reading of the Law (096):** the preview retains hearing, interpretation and worship, with the holy-day instructions in the complete chapter.
- **Maccabean martyrs (099):** the preview retains the resurrection witness and mother, but must be labelled as a representative selected excerpt, not the entire seven-brother account.
- **Patmos (207):** the preview retains the visionary introduction with a visible omission of two descriptive verses, not a dated new earthly event.

Seven entries are identical (003, 039, 113, 122, 181, 188, 189). Both working drafts pass source-coordinate tests. The existing viewer displays real uncollated witnesses, explicit omission markers and a prominent **not accepted** status.

## Decision protocol

1. Open the working preview and inspect each of the four holds using the original Greek-inclusive Catholic chapters where relevant.
2. Choose **preview range / context-preserving range / different range / keep entirely supplementary** separately for each episode. Record the chosen exact verse spans, rationale and omission disclosure.
3. Validate source text across Challoner, Crampon and CPDV; collate printed editions where needed. Do not treat three matching transcriptions as a printed-edition certification.
4. Recheck the 54-chapter narrative's covenantal coherence and Gospel-source boundaries without silently synthesizing separate witness accounts.
5. Only after explicit acceptance, create a **single** versioned final selection owner; retire or archive the comparison as an alternative, preserve provenance, and rerun parity tests. No default reader integration should precede that decision.

CI: `tests/historia-priority16-parallel-reconciliation.mjs` verifies the independent records, exact 7/5/4 split and that the existing preview remains the sole research UI owner. The existing `tests/historia-thematic-phone-e2e.mjs` additionally exercises the preview in mobile Chromium.
