# Mass ceremonial Batch A — Offertory actor/event reconciliation (17 October 2026)

**Status: research crosswalk / NO additional LIVE release.** This is an evidence and ownership **index**, not another action registry, source of liturgical text, a new Mass profile, or a public Formation article. Authoritative records remain `data/mass/ritus-1962-solemn-ministers-batch02.v1.json` (research), `data/presentation/reader-form-state.v1.json` and `src/mass/reader-form-state.js` (released R18 expected minister rubrics), `data/presentation/reader-priest-actions.v1.json` (celebrant), `src/mass/reader-priest-chalice-observation.js` (optional explicitly reported facts), and `src/mass/reader-missal-granularity.js` (published explanatory heading).

## Do not duplicate already implemented work

- #1350: MISSAL chalice preparation, bilingual and selected-form/Requiem conditioned, already merged.
- #1352: expected Solemn minister rubrics in LIVE right rail from **19** existing `SMIN-###` states. Expected rubrics are *not* verified physical observations. No research-only B02 record auto-enters this rail.
- #1355: independently **human-reported**, non-sensor-verified chalice actions `WINE_POURED`, `WATER_PRESENTED`, `WATER_BLESSED`, `WATER_ADDED`; exact form, actor, object and before/during-prayer constraints; Requiem has no blessing. This is audit-state only, not a new public control, action animation or synthetic canonical cue.
- #1359: six Requiem variants to existing R18 minister expectations, including `SMIN-009` incensation and `SMIN-012` paten-handoff exclusions.
- Existing `AO.SM.C0110`, `C0111`, `C0114`, `C0115`, `C0120`–`C0125` priest action/text sources stay in place. `AO.SM.C0112`/`C0113` is the water/wine prayer sequence; a text cue does **not** clock the prior wine pour or concurrent minister movements.
- #1270 P0 Ultra Master has a structurally mapped 279-event research bridge, not a second certified ritual engine. #1293 / #1337 already own the published 32-guide/84-prayer Mass Explorer. Do not port this table into a duplicate Formation or church-object knowledge database.

## Reconciliation matrix — existing 21 Offertory research records and one pending addition

All `MR62.SOL.B02.*` rows below have `runtimeCertified:false` and `latinFacsimileReviewed:false`. The proposed additional row B02.068, corrected French for B02.020 and deacon actor for B02.021 belong to **PR #1360** and are not on released main until merge. `SMIN-009` spans `C0120`–`C0124`; overlap is **broad ritual-stage coverage**, not exact individual minister-event certification.

| IDs | Canonical anchor | Actor/action group | Existing coverage | Disposition / next gate |
| --- | --- | --- | --- | --- |
| B02.014–015 | C0110 NEAR | Subdeacon brings veiled chalice; deacon unveils and passes paten | Priest already offers Host; no released exact minister action at C0110 | Hold minister microtiming; do not relabel priest state |
| B02.016–017 | C0112 BEFORE | Subdeacon purifies chalice; deacon pours wine **before** *Deus qui humanae* | MISSAL describes this; `WINE_POURED` may be explicitly human-reported in Solemn | Hold independent action clock; opening C0112 is not evidence of earlier pouring |
| B02.018 | C0112 EXACT | Subdeacon presents water and says *Benedicite* | `WATER_PRESENTED` report may apply in Solemn/Requiem | Combined physical+speech row stays NOT_REQUIEM pending spoken-formula adjudication; do not accidentally suppress actual Requiem water handling |
| B02.019–020 | C0112 WITHIN | Priest blesses water in ordinary Solemn; omits blessing in Requiem, continues prayer | MISSAL and observation rule already branch correctly; Low water-cross omission corrected separately | B02.020 priest is actor of the **negative blessing rule**, not the water pour. Keep no `WATER_BLESSED` event in Requiem |
| **B02.068** | C0112 WITHIN | **Subdeacon pours a little water** in both ordinary Solemn and Solemn Requiem | `WATER_ADDED` already available as explicit report | Research-only positive physical action; distinct from B02.018 presenting/speaking and priest blessing. Verify printed Latin and event clock before LIVE |
| B02.021 | C0114 WITHIN | **Deacon** supports chalice/celebrant's right arm | Priest already offers chalice | PR #1360 actor correction; no inferred exact movement |
| B02.022 | C0115 AFTER | Deacon covers chalice | Priest text/action covers offering stage | Hold microevent; don't duplicate celebrant action |
| B02.023–025 | C0115 AFTER / VISIBLE | Subdeacon veils/holds paten through Pater; no such holding in Requiem | Later `SMIN-012` paten handoff (C0212) released; Requiem omits that handoff | Before/after Pater and physical holding require an independently owned continuous-state/timing decision. Do not fabricate a C0115-to-Pater timer |
| B02.026 | C0120 NEAR | Deacon brings incense boat | `SMIN-009` gives broad Offertory incensation expectation; priest blesses incense | Broad stage already published; hold exact object handoff |
| B02.027–029 | C0122/C0124 VISIBLE/NEAR | Deacon supports/moves chalice; priest incenses gifts | `SMIN-009` broad; existing priest incensation actions C0120–C0122 | No additional LIVE cards or icons until exact actor event ownership is approved |
| B02.030–033 | C0124 NEAR | Deacon/thurifer incense celebrant and others, with Requiem omissions | `SMIN-009` Requiem variant already suppresses choir/people incensation | Keep research details separate; check against current R18 branch before any change |
| B02.034 | C0125 NEAR | Acolytes supply water, dish and towel for Lavabo | Priest `WASHES / PURIFIES` action at C0125 already published | Optional future minister detail, not a missing priest gesture |

**Count:** 21 rows B02.014–034 inclusive on existing main; + B02.068 proposed by PR #1360 = **22** Offertory source records covered by this index. The wider Solemn research file has 67 rows on main / 68 on PR #1360. Both figures are **research counts**, not counts of live-certified events.

## Explicit acceptance gates for any later publication

1. Original **printed** 1962 Latin facsimile acceptance of VII.9 and XIII.1 (the separate Latin-text crosscheck is useful but not final facsimile certification), resolving the English VII.9 actor translation discrepancy.
2. Speech and physical-action separation for `B02.018`: avoid treating unresolved Requiem *Benedicite* speech as a prohibition on the subdeacon presenting/adding water.
3. One existing or independently warranted canonical event owner for each genuinely distinct action; prove no equivalence to `SMIN-009`, existing priest registry, or #1355 observed reports.
4. Distinct `BEFORE_CUE` and `WITHIN_TEXT_CUE` triggers, with independently supported actor timing or fail-closed hold. No movement detection from scrolling, prayer-clock progression or Schola.
5. Four-form ordinary and Requiem matrix: LOW, MISSA_CANTATA_SIMPLE, MISSA_CANTATA_INCENSE, SOLEMN; positive actor and omission conditions; unknown selection must fail closed. Verify 360/390px and existing LIVE/SIMPLE/MISSAL navigation.
6. Preserve R18 19 released minister states, 48-card LIVE rollback, current public prayer text, faithful postures, icon ownership, liturgical cinematics and Mass Explorer/Visible Mass boundaries.

## Immediate disposition

**Release no additional Offertory microevents in Batch A.** Resolve PR #1360 (research actor correction) through a clean current-main merge and repository CI, with the separate Angelus/Prayer interaction gate owned outside Mass. Then treat B02.018 speech, printed VII.9 witness and actor-event observation timing as narrowly scoped certification holds. The already shipped general incensation, Missal explanatory text and opt-in observation require no replacement.
