# Red Missal preferred-English collation — Wave 2

**Status:** 15 additional cue-level editorial decisions for a total of 19 approved out of 256 fixed Ordo Missae cues. The **237 remaining fixed cues are not independently collated or certified**. Wave 1 is merged at PR #1424; Wave 2 is the present PR.

## Witnesses and priority

- Coalition in Support of Ecclesia Dei, *Latin–English Booklet Missal for Praying the Traditional Mass*, May 2013, Fourth Edition/Tenth Printing, **user-provided scanned copy**. Page references below use **PDF page = printed page + 1**.
- Controlling Latin authority remains the **1962 Missale Romanum**, with Ad Orientem's existing source reconciliation, canonical text correction layer, rubrical rules and approved variants unchanged. English has **editorial** priority from the booklet, not normative precedence over Latin.
- Other traditional witnesses and existing research remain comparison controls where the Red rendering is less literal. No automatic wholesale import of text from the scan.

## This wave's changes

| Fixed prayer | Cue IDs | Printed/PDF page | Editorial decision |
| --- | --- | --- | --- |
| Kyrie/Christe eleison | C0044–C0052 (9 separate cues) | p. 15 / PDF 16 | Replace English **“have mercy”** with **“have mercy on us”** throughout the nine responses. The booklet expressly includes **on us**. The Latin `Kýrie, eléison` and `Christe, eléison` is unchanged. |
| Canon *Unde et memores*, offering clause | C0183 | p. 37 / PDF 38 | Replace the calque **“gifts and grants”** with a more idiomatic rendering of `de tuis donis ac datis`: **“out of the gifts Thou hast bestowed upon us.”** Do not alter Latin consecration text or gesture crosses in the adjoining cues. |
| Introduction to the Lord's Prayer | C0208 | p. 39 / PDF 40 | More prayerful **Thy saving precepts / Thy divine instruction / we make bold to say**. Preserve **formed**, which closely follows the Latin `formáti`, rather than copying the booklet's **following** verbatim. |
| *Libera nos* | C0214 | p. 41 / PDF 42 | Prefer booklet English **bounteous help of Thy mercy** and **safe from all disquiet** to the clumsier original. The Latin `ab omni perturbatióne secúri` remains unchanged. |
| *Hæc commixtio* | C0221 | p. 41 / PDF 42 | Replace the unidiomatic final predicate **“be ... unto life everlasting”** with **“be ... a source of eternal life.”** Retain **consecration**, the closer rendering of the Latin `consecrátio`, despite the booklet's **hallowing**. |
| First peace prayer before priest's Communion | C0225 | p. 41 / PDF 42 | Prefer **look not upon my sins ... upon the faith of Thy Church; deign to give her peace and unity**, preserving the same sense. The Requiem omission rule remains intact; this prayer is not made universal in all variants. |
| *Quid retribuam* | C0233 | p. 43 / PDF 44 | Replace **“Praising I will call upon the Lord”** with **“I will call upon the Lord and give praise”** to restore natural English syntax without changing `Laudans invocábo Dóminum`. |

All decisions are exact cue-owned English substitutions in `src/mass/canonical-text-corrections.js`, with original English, revision ID and page provenance in `data/mass/canonical-text-corrections.v1.json`.

## Deliberately retained variants

- **Pater noster**: English *debts / debtors* in Ad Orientem versus *trespasses* in Red. Current wording is directly supportable from Latin `débita`; neither is a grammar mistake.
- **Hæc commixtio**: **consecration** retained (Latin `consecratio`); booklet **hallowing** not adopted solely for stylistic consistency.
- **Gloria**: split source cues already composed coherently; no duplicate source rewrite.
- **Communion Confiteor**: older/customary branch remains optional as the booklet itself notes its omission in the 1962 Missal.
- **Roman Canon**: existing exact `lucis et pacis`, `Antístite nostro N.` and printed cross corrections are preserved.

## Acceptance

The existing `tests/mass-ordo-red-missal-editorial.mjs` covers **all 256 cues** and tracks review status separately. This wave upgrades the reader parity gate to check **every amended cue in its correct actual section/card**, both LOW/SUNG and EN/FR:

- All 19 approved English replacements appear where owned; the old defective fragments do not appear.
- All French prayers and source Latin stay unchanged.
- Canonical actor prefixes, Latin display and cue identity survive Low/Sung rendering.
- All existing source-donor hashes, source-to-card boundaries, optional Requiem branch and normal proper gating remain under their existing tests.
- A JSON worklist preserves 19 reviewed decisions and explicitly marks 237 as **NOT_YET_INDEPENDENTLY_COLLATED**.

**This is substantive progress in selected passages, not certification of the whole booklet.** Complete philological proofreading and source/rights verification remain separate acceptance gates.
