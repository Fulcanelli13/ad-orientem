# LIVE Sanctuary — consolidated 65-scene acceptance register

**Scope:** draft PR #2882, original owner-supplied M3 sanctuary (65 scenes, unmodified scene artwork). This document is a **visual acceptance inventory**, not a certification of ceremonial correctness. The live canonical 65-card prayer reader and the Schola run independently; the visual source bridge only stages or animates events permitted by source ownership. No approval or deployment is implied by a passing workflow.

## Deliverable and release boundary

The GitHub Actions workflow `LIVE Sanctuary source and choreography acceptance` builds `sanctuary-65-scene-five-form-review`: an **offline `index.html` gallery** with all original scenes captured in Low, Simple Sung, Incense Sung, Solemn and Solemn Requiem, plus `scene-matrix.csv` (actors/positions), `scene-matrix.json` (source keys/holds) and an intact copy of the owner's interactive original prototype. Each form is captured at 520 × 370. There are **325 form-scene register entries** and **315 screenshots**: eight Requiem-omitted scenes and two Low/simple Sung incensation omissions remain in the register but are not depicted as celebrated stages. The normal reader navigates from C23 directly to C25 in both no-incense forms. Still screenshots do not prove that the original animations play to completion. The existing native 65-card and original real-time tests separately inspect source cues, 390px portrait, sideways/desktop layouts, priest walking, Offertory, asperges and source-exit cancellation.

**Owner review required** even if all CI checks pass. Native source text, 1962 rite branches, substantive minister gestures and scene-specific posture cannot be approved by screenshot or CSS-only tests.

## Priority holds: fix together, not individual rounds

**P0 / ceremonial or experience blockers:**
- C08 — server sitting at sedilia is a placeholder (no sitting server sprite).
- C11 — Solemn Epistolarium: static book held by correct subdeacon; verify physical travel, genuflection, Requiem omission of hand blessing.
- C13 — Gospel-side Missal: correct Solemn actor arrival only; priest/source C0081 is not the departure-clock; no invented server walking route.
- C14 — deacon, subdeacon, acolyte and thurifer positions remain approximate against O’Connell; Requiem candle/incense omissions must survive.
- C24 — ordinary incensation may run at exact C0121 and continue through C0124; suppress the historically wrong ordinary minister/people incense routine in Requiem.
- C36/C38 — elevation incense by proper actor, no inferred Schola bell/timing; exact cadence and stance still need ceremonial review.
- C56/C57 — faithful third `Domine non sum dignus` precedes altar-to-rail procession, but no independently certified departure instant exists. C57 stays at rail; Solemn deacon paten is static; explicit observed `MC-COM-320` alone can request illustrative return.
- C58/C59 — Ablutions and Missal return to Epistle side: separate positions and source boundaries; validate minister prop and timing.
- C63 — Solemn Requiem has no final blessing; do not show an ordinary blessing as a Requiem stage.

**P1 / important scope clarifications:** C01 Requiem prayers at foot; C03 optional second Confiteor; C64 final rite ministers; C65 source-linked *Et Verbum caro* genuflection.

**All other cards** are only *mapped and captured*, not automatically approved. Source-linked static stages must remain coherent in all five form variants. Any observed art mismatch enters this register in a single review batch.

## Consolidated correction pass — source and visual acceptance

| Priority | Scope | Applied in staging adapter | Status |
| --- | --- | --- | --- |
| P0 | C08/C09/C12/C17–C19 sedilia | Existing celebrant/deacon/subdeacon `sit` sprites moved over original bench, not standing in front; existing Sung server stands clear of priest; heights are non-accumulating | **Implemented; re-capture and owner visual approval still required** |
| P0 | C24 Low and simple Sung incensation omission | Native C24 is **hidden** by existing `visibleCardAllowed` because its `AO.SM.B036` block is `1962_FORM_NO_INCENSE`. Actual LIVE goes **C23 → C25** without rendering a C24 scene. All state-only sanctuary projections remain suppressed; no camera jump, smoke or invented motion | **Existing navigation confirmed; new browser regression required** |
| P0 | C11 Solemn Epistolarium | Source-card static subdeacon book, no invented journey | Hold movement pending departure/route evidence |
| P0 | C13 Missal transfer | C0081 completed arrival static only | Hold route and exact handoff |
| P0 | C14 Solemn/Requiem Gospel | Ordinary book reassigned to subdeacon; Requiem omits thurifer and candles, retains two acolytes; positions approximate | Pending ceremonial visual review |
| P0 | C56/C57 Communion | Source-gated priest return; unobserved approach remains disabled | Pending route/observer ownership |
| P0 | C36/C38 elevation, C58/C59 Ablutions/back-transfer, C63 Requiem blessing | Existing source cues and rite holds retained | No new approval implied |

Do **not** remove P0 holds merely because the stage is technically corrected. The owner must see the real five-form gallery and confirm that original seated figures genuinely read as seated, no minister obstructs the celebrant, and Low C24 stays at the altar.

## Every scene

| Scene | Original caption | Source macro | Low station | Sung station | Solemn Requiem | Editorial state |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | At the Foot of the Altar · Opening and Psalm 42 | AO.SM.M01 | FOOT | FOOT | — | P1 |
| C02 | Confiteor of the Celebrant | AO.SM.M01 | FOOT | FOOT | — | Review |
| C03 | Confiteor of the Servers | AO.SM.M01 | FOOT | FOOT | — | P1 |
| C04 | Versicles and Ascent of the Altar | AO.SM.M01 | CENTER | CENTER | — | Review |
| C05 | Introit | AO.SM.M01 | EPISTLE | EPISTLE | — | Review |
| C06 | Kyrie | AO.SM.M02 | CENTER | CENTER | — | Review |
| C07 | Gloria · The Celebrant's Intonation | AO.SM.M03 | CENTER | CENTER | Omitted | Review |
| C08 | Gloria · Praise and Supplication | AO.SM.M03 | CENTER | SEDILIA | Omitted | P0 |
| C09 | Gloria · Doxology | AO.SM.M03 | CENTER | SEDILIA | Omitted | Review |
| C10 | Collect | AO.SM.M04 | EPISTLE | EPISTLE | — | Review |
| C11 | Epistle / Lesson | AO.SM.M05 | EPISTLE | EPISTLE | — | P0 |
| C12 | Gradual · Alleluia / Tract / Sequence | AO.SM.M06 | EPISTLE | SEDILIA | — | Review |
| C13 | Preparation for the Gospel | AO.SM.M07 | CENTER | CENTER | — | P0 |
| C14 | Proclamation of the Holy Gospel | AO.SM.M07 | GOSPEL | GOSPEL | — | P0 |
| C15 | Sermon / Homily | AO.SM.M08 | PULPIT | PULPIT | — | Review |
| C16 | Credo · The Celebrant's Intonation | AO.SM.M09 | CENTER | CENTER | Omitted | Review |
| C17 | Credo · The Father and the Son | AO.SM.M09 | CENTER | SEDILIA | Omitted | Review |
| C18 | Credo · Incarnation, Passion and Resurrection | AO.SM.M09 | CENTER | SEDILIA | Omitted | Review |
| C19 | Credo · The Holy Spirit, Church and Life Eternal | AO.SM.M09 | CENTER | SEDILIA | Omitted | Review |
| C20 | Offertory · Invitation and Antiphon | AO.SM.M10 | CENTER | CENTER | — | Review |
| C21 | Offertory · Offering of the Bread | AO.SM.M10 | CENTER | CENTER | — | Review |
| C22 | Offertory · Preparing and Offering the Chalice | AO.SM.M10 | EPISTLE | EPISTLE | — | Review |
| C23 | Offertory · Humility and Invocation | AO.SM.M10 | CENTER | CENTER | — | Review |
| C24 | Offertory · Incensation | AO.SM.M10 | — | CENTER | — | P0 |
| C25 | Offertory · Lavabo and Offering to the Trinity | AO.SM.M10 | EPISTLE | EPISTLE | — | Review |
| C26 | Orate, fratres · Prayer and Response | AO.SM.M11 | CENTER | CENTER | — | Review |
| C27 | Secret Prayer and Conclusion | AO.SM.M11 | CENTER | CENTER | — | Review |
| C28 | Preface | AO.SM.M12 | CENTER | CENTER | — | Review |
| C29 | Sanctus | AO.SM.M13 | CENTER | CENTER | — | Review |
| C30 | Te igitur | AO.SM.M14 | CENTER | CENTER | — | Review |
| C31 | Memento, Domine — Living | AO.SM.M14 | CENTER | CENTER | — | Review |
| C32 | Communicantes | AO.SM.M14 | CENTER | CENTER | — | Review |
| C33 | Hanc igitur | AO.SM.M14 | CENTER | CENTER | — | Review |
| C34 | Quam oblationem | AO.SM.M14 | CENTER | CENTER | — | Review |
| C35 | Consecration of the Host · Preparation | AO.SM.M15 | CENTER | CENTER | — | Review |
| C36 | Words of Consecration and Elevation · Host | AO.SM.M15 | CENTER | CENTER | — | P0 |
| C37 | Consecration of the Chalice · Preparation | AO.SM.M16 | CENTER | CENTER | — | Review |
| C38 | Words of Consecration and Elevation · Chalice | AO.SM.M16 | CENTER | CENTER | — | P0 |
| C39 | Unde et memores | AO.SM.M17 | CENTER | CENTER | — | Review |
| C40 | Supra quae | AO.SM.M17 | CENTER | CENTER | — | Review |
| C41 | Supplices te rogamus | AO.SM.M17 | CENTER | CENTER | — | Review |
| C42 | Memento etiam, Domine — Dead | AO.SM.M17 | CENTER | CENTER | — | Review |
| C43 | Nobis quoque peccatoribus | AO.SM.M17 | CENTER | CENTER | — | Review |
| C44 | Per quem haec omnia | AO.SM.M18 | CENTER | CENTER | — | Review |
| C45 | Per ipsum · Minor Elevation | AO.SM.M18 | CENTER | CENTER | — | Review |
| C46 | Pater noster | AO.SM.M19 | CENTER | CENTER | — | Review |
| C47 | Libera nos · Prayer and Conclusion | AO.SM.M20 | CENTER | CENTER | — | Review |
| C48 | Pax Domini | AO.SM.M20 | CENTER | CENTER | — | Review |
| C49 | Commingling of the Sacred Species | AO.SM.M20 | CENTER | CENTER | — | Review |
| C50 | Agnus Dei | AO.SM.M21 | CENTER | CENTER | — | Review |
| C51 | Prayers before the Priest's Communion | AO.SM.M22 | CENTER | CENTER | — | Review |
| C52 | Domine, non sum dignus · Celebrant | AO.SM.M23 | CENTER | CENTER | — | Review |
| C53 | The Priest receives the Sacred Host | AO.SM.M23 | CENTER | CENTER | — | Review |
| C54 | The Priest receives the Precious Blood | AO.SM.M23 | CENTER | CENTER | — | Review |
| C55 | Second Confiteor · Optional Local Custom | AO.SM.M24 | CENTER | CENTER | — | Review |
| C56 | Ecce Agnus Dei · Preparation of the Faithful | AO.SM.M24 | CENTER | CENTER | — | P0 |
| C57 | Communion of the Faithful | AO.SM.M25 | RAIL | RAIL | — | P0 |
| C58 | Ablutions | AO.SM.M26 | CENTER | CENTER | — | P0 |
| C59 | Communion Antiphon | AO.SM.M26 | EPISTLE | EPISTLE | — | P0 |
| C60 | Postcommunion | AO.SM.M27 | EPISTLE | EPISTLE | — | Review |
| C61 | Dismissal | AO.SM.M28 | CENTER | CENTER | — | Review |
| C62 | Placeat tibi · Closing Prayer | AO.SM.M29 | CENTER | CENTER | — | Review |
| C63 | Final Blessing | AO.SM.M29 | CENTER | CENTER | Omitted | P0 |
| C64 | Last Gospel · Prologue of St John | AO.SM.M30 | GOSPEL | GOSPEL | — | P1 |
| C65 | Last Gospel · The Word Made Flesh | AO.SM.M30 | GOSPEL | GOSPEL | — | P1 |

## Review and acceptance gates

1. **Appearance:** Every included scene shows the same original church, camera style and actor sprites; no reconstructed church or replacement icon bank. Mobile portrait, landscape and desktop preview preserve native Mass text and rail controls.
2. **Actors:** Priest/server, deacon/subdeacon, thurifer/acolytes, book, chalice, paten and relevant positions make sense for the form, Requiem branches and each scene. No kneeling server beside seated celebrant without a justified posture.
3. **Action ownership:** Only exact independently owned/observed priest or minister boundaries can initiate the original cinematic keyframes. Ordinary scrolling, choir/Schola audio, local parish preference, or entering a prayer card is not a substitute for the actual ceremonial event. Uncertain scenes hold a static stage.
4. **Original animation:** Preserve the owner-supplied movements (Asperges, Missal transfer, Offertory incensation, elevations, Communion, Gospel, seated ministers) until individually source-qualified; visually check enter, progress, interruption and replay in real time.
5. **Requiem and special rites:** Gloria, Credo, Final Blessing omitted in Requiem; Requiem Gospel and Offertory omission handling; Asperges/Vidi aquam separate from canonical 65 Mass scenes. Rubric exceptions must be reviewed before public release.
6. **Release:** Original owner `index.html` SHA256 must remain `7089f9ade7af6a57a457e10b8db0cb45129429bebe8a62d920ea7d958c2a7c62`. Source and native tests, visual gallery generator, R17 convergence and Required Main must pass on the same head. Actual gallery inspected and approved; no Vercel, no automatic public merge.

**Release condition:** Merge and GitHub Pages only after explicit owner approval of the consolidated visual review. The source clock can remain conservative/static where the 1962 event has not been independently observed; optional advanced choreography is deferred instead of faked.
