# Ultra Master → 65-card reader: priest stations and icon-semantic audit

**Review checkpoint:** 21 October 2026. **Status:** source reconciliation, not a claim that every rite/browser configuration has completed visual acceptance. Reader text, exact approved artwork names, and frozen registry files are unchanged.

## Provenance and precedence

1. **Ultra Master source/research workbook** — `Ad_Orientem_Ultra_Master_Mass_Music_Reconciled_2026-10-19.xlsx`, 41 tabs, 435 fine-grained original textual units, 279 source cues. It is a research and author-comparison inventory; it does **not** supersede the 1962 `Ritus servandus`.
2. **Historical icon Ultra Master** — `Ad_Orientem_Mass_Icon_Ultra_Master_Review_2026-10-19.html`, embedded `sourceData.version="2026-10-19-v1"`: 341 editorial moments; 279 priest events; 23 faithful postures; 57 published LIVE rubrics; 98 French rubrics; 66 word anchors. It explicitly calls its assignments **initial icon matching, not publication/rubric certification**.
3. **Current source-owned runtime** — `reader-priest-positions.v1.json` (49 original station transitions), `reader-priest-voices.v1.json` (126 voice records), `reader-gestures.v1.json` (59 faithful gestures), `reader-priest-actions.v1.json` (77 actions), and the 279 actual Sung source cues in `reader-text-sung.v1.json`.
4. **User's final art authority** — `mass-icon-final-user-lock-20261020.v1.json`. All 182 display names remain exact; rejected artwork may never be resurrected. The `FOOT_CENTER` icon is deliberately NULL regardless of formerly accepted archival candidate images.
5. **Executable implementation** — `reader-final65-icon-keys.js` and `reader-priest-station65.js`, scoped to 65-card ordinary Sung LIVE. Source cue ID, actor and actual celebration form decide the imagery.

The source-owned liturgical evidence wins over any keyword or filename. The historical Ultra Master is useful for spotting omissions and conflicts but never directly triggers an icon or automatic priest movement.

## Historical priest-station comparison

Of 279 original priest events, 277 historical Ultra Master entries have a comparable resolved station in the default reference track. Nine differ:

| Cue | Ultra Master station | Default staged station before this pass | Adjudication |
|---|---|---|---|
| C0041 | `ROUTE_CONTROLLED` | centre | Entrance incensation **conditional**: no route in the non-incense default |
| C0276 | sedilia | centre | Sedilia **conditional** during Gloria, depending on ceremony |
| C0278 | sedilia | centre | Sedilia **conditional** during Credo |
| **C0112** | **Epistle-side Missal** | **centre** | **Correction:** priest's water/cruet preparation at Epistle side is unconditional; the Requiem omitted *sign of the Cross* is conditional, not priest position |
| C0122 | incensation route | centre | Offertory incensation **conditional** |
| C0123 | Epistle side | centre | Incensation return route **conditional** |
| C0124 | Epistle side | centre | Celebrant incensed by minister **conditional**, distinct actors |
| C0249 | async | observer-gated Epistle side | Keep priest's independent Communion-antiphon `MC-END-010` as confirmation gate |
| **C0250** | async / return to centre | observer-gated Epistle side | **Correction:** the separate observed `MC-OBS-PC-TURN` event returns the priest to centre while the Missal remains Epistle-side; never infer from scrolling or Schola |

C0077–C0078 remain unconfirmed because the priest may move while the Schola chants. Lack of an independent observation is **not** permission to select a fixed-position pictogram.

The reconciled book and station continue separately: Collect at Epistle Missal; Offertory antiphon centre; C0112–13 chalice/water preparation Epistle; Secret and Preface centre with Missal Gospel-side; post-ablutions Communion antiphon at Epistle Missal; subsequent priest return centre when independently confirmed.

## Source-owned priest voice: mandatory semantics

Approved original asset **`ao_chant`**, exact saved name **Chant** (native `currentColor` SVG), is now assigned to **25** entries whose source voice unambiguously says `SUNG / CLEAR`, `SUNG / PUBLIC` or `SUNG / CLEAR (MISSA CANTATA)`. That does not mean all 25 icon instances display simultaneously.

| Liturgical situation | Icon | Constraint |
|---|---|---|
| Actual celebrant chants in Missa Cantata / Solemn | **Chant** (`final_ao_chant`) | Only source-specified sung cue and priest actor |
| Low Mass priest speaks audibly | **Priest Audible** | Never use `Chant`; Low form remains on its separately owned renderer |
| Audible but not sung priest speech, including *Orate fratres* | **Priest Audible** | Do not infer chant from form alone |
| Low/secret priest voice | **Priest speaks low voice** | Distinct from complete silence |
| Genuine silent action | **Priest Silent** if it adds useful information | Do not clutter with constant negative speech reminders |
| Choir singing | **Schola sings** | Not evidence that priest is chanting |
| Solemn Epistle or Gospel proclamation | Deacon/subdeacon owns spoken/chant event | Suppress *priest* Chant icon when reading actor is a sacred minister |
| Source C0109 Offertory antiphon | **Priest speaks low voice** | Don't extend the earlier sung greeting across the quiet Offertory |
| Source C0196 briefly audible → low | text-only until finer source cue | No misleading permanently audible or chanted state |
| Gloria/Credo/Sanctus simultaneous text | Priest voice and Schola voice are independent | Schola activity cannot synthesize priest chanting |

The new compiled icon map contains 25 `final_ao_chant` bindings. The same **form-aware, actor-guarded** voice distinction now applies to Sung **Simple and Missal** modes through `reader-icons.js`, not only curated 65-card LIVE. In Low Mass a generic source `CHANTED` token, if it appears, resolves as audible **speech** through the non-Sung branch rather than to that Sung-only original.

## Rubric reduction policy (icon-first, never cue-loss)

The objective is **fewer visible words, not less source-backed meaning**:

- **Show on one surface:** persistent faithful posture on left and persistent priest station on right; never repeat their full descriptions in the centre prayer card.
- **At the exact source word:** temporary gesture/action pictogram replaces a redundant short label *only when the approved visual clearly depicts the actor, object, movement and timing*. Keep the complete rubric available on expansion and in Missal mode.
- **Voice states:** one active priest voice icon (Chant / Audible / low / Silent); Schola icon only for Schola ownership. Don't show repeated written “the priest chants…” next to an unmistakable Chant pictogram.
- **Keep concise text for exceptions:** Christmas/Annunciation *Incarnatus* posture, Requiem variations, incense routes, Gospel minister distinction, proper Last Gospel, local postures, bells/elevations and unavailable or ambiguous artwork.
- **Never iconify by keyword alone:** *offering* chalice is not *elevating* chalice; altar kiss is not Gospel-book kiss; Communion rail distribution is not a stationary priest-at-rail diagram.
- **Do not invent artwork:** Foot Centre remains text-only by explicit user decision; an icon not yet objectively matched stays text-only. The icon inventory remains user owned.

No sweeping deletion of rubrical source text is authorized by this audit. Once source-cue visual parity is green, shorten only the duplicated LIVE short-rubric layer; retain the exact longer rubric and its source in details/Missal reading.

## Gates

`node tests/reader-final65-position-icons.mjs`, `node tests/mass-priest-position-continuity.mjs`, `node tests/mass-final-icon-crosswalk.mjs`, general `npm test`, form-sensitive phone tests, and approved SVG recolour/browser snapshots. Draft PR remains unmerged until the new CI head and visual tests pass.
