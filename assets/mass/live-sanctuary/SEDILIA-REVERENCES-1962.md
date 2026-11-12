# Seated sacred ministers — biretta and reverence ledger (1962)

**Status: STAGING / REVIEW.** This is not a choir clock or a claim of 65-scene ceremonial completion. Source register: `src/mass/reader-sedilia-reverence.js`; preserved M3 renderer adapter: `ao-sanctuary-embedded.js`.

## Binding sources

- General Rubrics of the 1960 Roman Missal, §§518(b), 523, sourced from https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
- J. B. O'Connell, *The Celebration of Mass*, 1962, Sung Mass, Gloria §§15–17 and Solemn Mass, Credo §2 (1962 text available at https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/d-The%20Celebration%20of%20Mass-%20O%27Connel%201962_OCR.pdf )

## Exact sung-word events registered, no guessed timestamps

| Unique ID | Existing source scene | Words sung by choir | Headwear / inclination |
|---|---|---|---|
| SED-GLORIA-ADORAMUS | C08 / AO.CARD.003 | Adoramus te | Uncover, biretta on right knee, bow; rise, replace |
| SED-GLORIA-GRATIAS | C08 / AO.CARD.003 | Gratias agimus tibi | Same |
| SED-GLORIA-IESU-FIRST | C08 / AO.CARD.003 | Iesu Christe (first) | Same |
| SED-GLORIA-SUSCIPE | C08 / AO.CARD.003 | Suscipe deprecationem nostram | Same |
| SED-GLORIA-IESU-SECOND | C09 / AO.CARD.003 | Iesu Christe (second) | Same |
| SED-CREDO-IESUM | C17 / AO.CARD.009 | Iesum Christum | Same |
| SED-CREDO-INCARNATUS | C18 / AO.CARD.009 | Et incarnatus est ... et homo factus est | Bow uncovered head profoundly **if seated**, except as below |
| SED-CREDO-SIMUL | C19 / AO.CARD.009 | simul adoratur | Uncover, bow, replace |

Each registered occurrence is an **independent event**, each with `BEGIN` and `END` boundary, not one blanket Gloria/Credo animation. The prototype's static seated actors are covered initially; the existing biretta artwork moves toward the right knee, and the head inclines only at a witnessed BEGIN. On END the head straightens and the biretta returns. The original actor sprites, camera, keyframes, 65 scene identities and icon bank are not rewritten. Prototype motion speed is illustrative, not a certification of how long the choir sings.

**Actor form rules:** Missa Cantata (simple/incense): P only, while the existing server remains standing. Solemn: the celebrant and whichever sacred ministers are actually seated in the source-owned scene. **In C18, the deacon is at the altar with the burse/corporal, not seated**; the sung *Incarnatus* seated-head bow therefore concerns P and S in that staged picture. The deacon's distinct altar duty needs its own correct choreography rather than a fictional sitting-bow. Low Mass: no sedilia choir-chant sequence. Solemn Requiem: no Gloria/Credo; reject all these events.

**Special exception:** At the sung Incarnatus on the three Christmas Masses and the Mass of the Annunciation, even if initially seated the ministers **kneel**, rather than merely performing the usual seated head-bow. Proper-based selection, including transferred Annunciation, must use the native `resolveIncarnatusSungAction` and must not infer from calendar date alone. The ordinary seated-bow animation **fails closed** for this condition; accurate standing/kneeling choreography remains a P0 acceptance hold.

**Source ownership:** `AO.SM.C0276–C0279` are seated/rise state sentinels, not exact sung-word clocks. The priest earlier recites the Gloria and Credo, while the choir separately sings them. Scrolling native prayer paragraphs or merely entering C08/C18 cannot trigger any uncovering. The native reader accepts only explicit witnessed BEGIN/END (no new public control). A future verified live choir phrase cursor may be a separate authority, but simple elapsed audio time or a guessed Schola progress percentage is not.

## Further exhaustive audit REQUIRED — not incorrectly reported as complete

1. At sedilia during Kyrie, sequence, Epistle/readings and, where applicable, homily: evaluate Holy Name of Jesus, Blessed Virgin, saint of Mass, specific sung and spoken formulas, any prescribed uncovering/touching the biretta, and individual actors. These are **conditional proper- and source-text-dependent events**, not merely eight fixed Ordinary events.
2. Every seated arrival/departure: receiving/putting on biretta, removal prior to rising, handover to M.C./deacon, correct seating and side positioning. No automatic timing from Cnn card entry.
3. Across **all 65 scenes and special rites**, record each priest/sacred-minister head inclination, profound bow, genuflection, knee bend, biretta off/on and any exception as distinct source-bound actions (not all actions involve headwear). Existing Live icon cues and gestural rail remain authoritative; the sedilia visual is a consumer, not a competing rubric owner.
4. O'Connell placement audit and user review: donor C08–C09/C12/C17–C19 seated figures are **rejected placeholders**. Headwear event routing survives, but figure anatomy must be replaced as a complete rig. C18 is explicitly different because the deacon performs the burse/corporal duty. Verify source-focused C13 C0081 ordinary/Requiem stills, and C11–C14 as one consolidated correction batch.

Release requires exact-source actor/pose assertions, enter/exit/reset browser tests including modal transitions and Christmas/Annunciation rejection, latest-head technical gates **and owner visual acceptance**. Draft and unmerged; GitHub Actions + GitHub Pages only; never deploy to Vercel.

## 12 November follow-up — completed corrections on draft branch

- Do not force all P/D/S to sit: only seated native actors receive biretta transitions; C18 deacon stays at his altar duty.
- The donor's side-view seated sprite remains **visually rejected**, despite its `sit` pose and scene/source compatibility. See the binding correction below.
- C13 Requiem Gospel preparation suppresses thurifer and acolyte candle props already **before** C14; preserves the two unlit acolytes and resets to normal on ordinary Mass selection.
- Browser acceptance now requests focused screenshots: C08 biretta off/on, C18 Incarnatus with distinct deacon duty, C13 regular/Requiem exact C0081.
- All corrections are review-only until latest-head CI and human visual approval.

## 12 November owner rejection — active binding decision

The first geometry correction merely exposed rectangular, white trouser-like legs. The owner rejected the image. Five subsequently rendered draped-SVG experiments were inspected and also rejected because the upper body, hips, thighs, knees, alb and chasuble/dalmatic never became one coherent seated figure.

**Action:** the artificial bent-leg path and translated shoe were removed from the branch, and its regression assertions replaced with tests prohibiting their return. The static donor source remains a visual placeholder under `DONOR_SEDILIA_REVIEW_HOLD`; there is **no accepted seated-clergy artwork** yet. A source event's BEGIN/END may still be tested without certifying the figure geometry.

The previous claims in this research log that the side-view donor SVG or a bent-knee patch "corrected" seated anatomy are **superseded** by the rejection above. The recipient's explicit visual approval is required, not merely successful DOM/SVG geometry assertions.

**Replacement contract:** [SEDILIA-CHARACTER-REPLACEMENT.md](SEDILIA-CHARACTER-REPLACEMENT.md), specifying complete rigged figures, proper cloth draping, natural seating and biretta handling, image-based review at all six seated scenes, and a zero-cost offline 3D-to-WebP asset strategy. Do not ship more lower-leg path patches or merge the draft PR.
