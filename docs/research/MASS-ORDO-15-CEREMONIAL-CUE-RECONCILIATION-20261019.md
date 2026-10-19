# 1962 Ordo Missae — Fifteen ceremonial cues reconciled

**19 October 2026.** This follows merged Red Missal English review #1436. The 241 textual cues have English editorial decisions; the other **15 are bracketed ceremonial directions**, not liturgical words to proofread. This review reconciles those 15 against existing 1962 Ritus and Ad Orientem's original R17 gesture, priest action, position, Missal-inline, and historical research files. It avoids duplicating the ongoing 42/62 Canon-rubric research.

**Primary 1962 witness:** [*Ritus servandus*, chapters VII, VIII–IX, XII–XIII](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/). For funerals **XIII.1–2** independently specifies (1) no blessing at the end of Mass; (2) no initial altar incensation at the Introit for Solemn Requiem; (3) at the Offertory, the altar and offerings may be incensed, but only the celebrant receives incense, not clergy or people. Other passages of the rite govern ordinary liturgical ceremonies. Distinguish Low, unincensed Missa Cantata, incensed Missa Cantata and Solemn Mass.

## Three actual runtime defects corrected

1. **C0041 initial altar incense** (and the associated spoken blessing C0040). Previously any `INCENSE_ENABLED` profile displayed the initial blessing/action and could activate the priest's entrance incensation route even when the celebration was a Requiem. This is contrary to XIII.2. Now the entire B013 block is omitted on selected Requiems, and the exact C0040/C0041 action/route projections fail closed. Both B013 and the later incensing block B036 are also suppressed for selected **LOW** and **MISSA_CANTATA_SIMPLE** forms that do not use incense. Incensed ordinary Mass still retains both.
2. **C0124 Offertory incense of people.** The source's bracketed direction says the celebrant, clergy and people are incensed, but Requiem XIII.2 says *incensatur solus celebrans et non incensantur alii*. In selected incensed Requiem presentations, preserve the Offertory-incense source cue and replace its displayed *rubric only* with “Only the celebrant is incensed” and the equivalent French. Normal incensed Mass retains its original text. This is a form-selected source presentation variant, not a mutation of the Latin Proper or a new ceremony.
3. **C0263 final blessing** (and C0264–C0266). The base reader still displayed the final blessing at Requiem despite the 1962 omission in XIII.1. Now B092 and these exact state/action/gesture cues are omitted only for the selected Requiem. **Placeat** C0261, its altar kiss C0262 and the Last Gospel beginning C0267/C0269 remain, so the Mass proceeds directly as prescribed.

The source code maintains original cue identities/clock and 1962 form selection. The omitted block metadata records the source-owned reason, not a blank or invented prayer. No other text, Latin consecration, French ordinary translation, elevation or card count is changed.

## Existing published sources retained, not duplicated

| Cue | Action | Ownership / disposition |
| --- | --- | --- |
| C0081 | Move from centre to Gospel Missal | Already has a two-stage C0081 departure / C0082 arrival route. No new icon or state. |
| C0111 | Cross with paten; place Host; set paten aside | Three existing published micro-actions in R17 Missal rubrics. |
| C0115 | Cross with chalice; place and cover | Existing rubrics; **Solemn Mass** deacon covering is not automatically attributed to the priest. |
| C0117 | Raise eyes/hands then join hands | Two published 1962 gesture events. |
| C0129 | Altar kiss before Orate fratres | Source-owned priest gesture and action already present. |
| C0155 | Silent Memento of living | Existing published Canon rubric; **not an audible prayer**. |
| C0174 | Host genuflection/elevation/replacement | Existing source-backed staged actions; bells belong to server and vary locally. |
| C0181 | Chalice genuflection/elevation/replacement | Existing source-backed staged actions; Solemn deacon may own chalice covering. Never infer extra gesture from consecration words. |
| C0193 | Silent Memento of dead | Existing published Canon rubric; never turn silent contemplation into public voice. |
| C0262 | Altar kiss following Placeat | Retain even in Requiem; only the **following blessing** is suppressed. |

The corresponding original IDs and source-registry evidence are recorded in `data/research/mass-ordo-15-ceremonial-source-ownership-20261019.v1.json`.

## Two remaining action-timing limitations (not fake completions)

**C0201 and C0205 — *Per ipsum*.** The original bracketed directions include uncovering/taking/replacing/covering the chalice/Host and genuflecting. The current significant-action registry certifies the **genuflection** at both boundaries, but does **not** publish every physical microstep as an independently timed actor event. The R17 1962 review and separate Solemn-minister research may supply those details later. This review **does not automatically invent actions, gestures, animation or priest/ministers' roles**, nor mislabel the historical source text as a real-time observation.

## Tests and status

`tests/mass-ordo-15-ceremonial-qa.mjs` checks all **15 exact bracketed source IDs** in Low and Sung donors, their published rubric/action/position/gesture source references, 3 form-corrected sites, 10 already owned source cues, and 2 intentionally non-automated Per ipsum holds.

`tests/reader-model.mjs` checks real projected cards in ordinary LOW, unincensed Sung, incensed Sung, Solemn and incensed Requiem: neither incensation passage appears without incense; Requiem omits entrance incensation and final blessing but retains Offertory incensation, Placeat/altar kiss and Last Gospel. `tests/reader-cue-state.mjs` verifies priest action/icon/position lanes fail closed on the exact omitted Requiem cues and normal permitted incensation remains. Run full R17 phone source/device suites before merge.

**Scope:** 15/15 source identities reconciled, **3 conditional form presentation defects corrected**, **10 already covered** by existing approved data, and **2 still deliberately awaiting event-level evidence**. This is **not** a claim that all physical Mass actions have been observed or live-timed. Donor and Latin text remain frozen.
