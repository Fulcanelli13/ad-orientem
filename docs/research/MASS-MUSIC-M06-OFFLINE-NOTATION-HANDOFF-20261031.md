# Mass Music M06 — source-to-offline-notation handoff
Date: 2026-10-31
Upstream: M05 #2157 → M04 #2156 → M03 #2154 → M02 #2153 → M01 #2152

## Contract: ONE Mass and Schola, ONE existing Exsurge viewer

The draft Kyriale/score reader PR #2111 already contains a **responsive local Exsurge SVG renderer** at `src/mass/reader-chant-engraver.js`, an existing notation dialog at `src/mass/reader-kyriale-notation-viewer.js`, and a pinned MIT bundle. This increment does not vendor another copy, does not introduce a second music playlist, and does not change any approved H7/R17 layout or priest/Schola timing.

M05 has acquired seven CC0 historical GABCs: two Preface tones (all three celebrant/response pairs each), festive oration greeting/response, Pater noster conclusion/response, normal/Paschal aspersion, and the double-Alleluia Easter-style dismissal. Those are **research files only**.

M06 now provides:
- Pure `src/mass/reader-music-notation-handoff.js`, which selects the matching M05 research score **identity** from M03–M04's actual source-certified common tone and M02's source-exact dialogue pairs. It preserves the original priest/responders roles and cue identities. No melody is inferred from a date, feast colour, parish name, or the presence of a card.
- The existing `reader-schola-event-timeline.js` now carries a read-only `notationHandoff` on each source-confirmed sung dialogue, in parallel with the existing `musicMaterial` publication gate.
- The existing native special-rite itinerary projects a read-only `notationHandoff` for `ASPERGES` only, and only from the **native rite's actual `formulaState`**. `reader-native-preview.js` supplies that state directly from `ready.aspergesController.project().formulaState`. Neither the Mass's Introit nor the Schola's current card chooses this variant.
- `buildOfflineNotationResearchPayload` prepares the exact object consumed by the existing Exsurge dialog's `open(score,{trigger})`: `{scoreId,title,printedWitness,sourceUrl,gabc}` plus research metadata, only from an explicitly selected editorial-review context and a positive M05 canonical Latin parity screen.
- `openOfflineResearchScoreInExistingViewer` delegates to the existing viewer object supplied by the **separate research interface**, never creates another renderer or controls Mass navigation. This new code is not called from the public R17 reader.
- `approvedMassNotationForLive` deliberately returns null; caller-supplied approval flags cannot bypass a trusted editorial registry which **does not yet exist**.

## Actual source-selection matrix

| Source moment | Sourced candidate | Before publication |
| --- | --- | --- |
| Preface dialogue, certified solemn | GregoBase 4449 | Printed 1961 note parity; all three matching response tunes; user approval |
| Preface dialogue, certified ferial incl Requiem | GregoBase 4450 | Same complete musical parity |
| Collect/Postcommunion greeting, certified solemn | GregoBase 4487 | **Greeting and Et cum only**, not variable Collect/Secret/Postcommunion text |
| Collect/Postcommunion greeting, certified ferial | **No acquired score** | Acquire exact ferial oration tone |
| Pater noster conclusion | GregoBase 7282 | **Conclusion + Sed libera only**, complete chant and tone selection still missing |
| Ordinary Asperges | GregoBase 497 | Antiphon + Psalm + Gloria; native recurrence of antiphon must be respected |
| Passiontide Asperges | GregoBase 497, **held** | Native rite omits `Gloria Patri`. Full score cannot display that omitted section as required singing; segment-accurate rendering still needed |
| Paschal Vidi aquam | GregoBase 958 | Native rite **from Easter to Pentecost inclusive**; preserve Gloria and repeated antiphon |
| Ordinary Ite missa est | **No acquired score** | The M05 `Ite Ia` is not valid for ordinary Masses |
| Easter double Alleluia dismissal | GregoBase 2988, **held** | Verify the selected 1962 octave/rite and selected printed response, not just the date |
| Benedicamus Domino/Deo gratias | **No acquired score** | Acquire exact applicable dialogue |
| Requiescant in pace/Amen | **No acquired score** | Acquire Requiem dismissal tune |
| Complete Orations, Gospel, Preface proper, or full Pater noster | **Partial or missing** | Original edition, variable texts, matching responses, rights and approval |

For the **Asperges**, see [ICKSP France's 1962 Ordo Missae](https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien), including Passiontide omission and Eastertime variation. The source does not justify importing later changes into 1962.

## Regression gates

- `tests/reader-mass-m06-notation-handoff.mjs` (in `test:reader-schola`): solemn/ferial and missing certified tone; exact three Preface exchanges; greeting-only and Pater-only; Requiem and Benedicamus holds; ordinary Paschal and Passiontide rite; mismatched events, wrong score IDs, forged approval data, absence of automatic audio and blocking ordinary Ite with Paschal GABC; actual `viewer.open(score)` contract with a supplied reviewer-only mock viewer.
- `tests/reader-schola-special-rite-itinerary.mjs`: all 10 existing rite families unchanged; extra ordinary, Paschal and Passiontide native Asperges score readiness checks, with actual native controller formula state.
- `tests/reader-schola-source-itinerary.mjs`: M06 imported and actual R17 dialogue events expose held notation metadata; quiet sections have no new musical media.

## Release and approval

**This is a working model-to-renderer adapter, not a released offline score viewer**. The existing offline Exsurge pilot is in unmerged draft #2111, and its local JS bundle is not added by M06. We intentionally do not import seven GABCs into the LIVE user runtime, or add `Read score` buttons to the approved reader before score publication.

The next proper work is **M07**: consolidate the exact edition-verified musical candidate collection in large batches; source complete ferial/oration/Pater/Gospel/dismissal pairs and sequence/tract/proper scores; and prepare a single editor-review batch. Once approved, connect the trusted score manifest to the existing #2111 viewer, then run 320/390px offline phone and standard Mass tests before release.

Do not merge this stacked draft into `main` before the predecessors are reconciled, exact-head CI is green and the release owner explicitly approves. Publication of new musical scores still requires the user's approval.
