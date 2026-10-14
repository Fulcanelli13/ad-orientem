# Mass icons · source-corrected 24-item harmonization backlog

**Status:** research/visual-review only. **No production assets, source cue owners, 48-card reader, or live icon mapping changed.**

## Governing decision

The 14 October user review's **rating below 3 means automatic discard of that original**. The image may be replaced with *new* art later but never salvaged merely by retinting or cropping. Ratings 3–5 survive only as candidates, with all negative flags preserved. No decision is inferred for missing ratings.

| Metric | Count |
|---|---:|
| Review records | 90 |
| Rated | 71 |
| Rated 0–2, excluded | 12 |
| Rated 3–5 | 59 |
| Unrated, awaiting judgment | 19 |
| Surviving records requiring repairs | 24 |
| Semantic corrections | 8 |
| Family corrections | 13 |
| Diagnostic inspections | 2 |
| Technical crop repair | 1 |

## Phase A · Eight source-rubric / semantic corrections

| Review ID | Source | Correct physical action / placement | Proposed route |
|---|---|---|---|
| `A04` | VIII.4 | The priest already holds the Host between thumb and index of both hands, briefly raises his eyes to heaven, then lowers them. | TEXT_WITH_APPROVED_GENERIC_PRIEST |
| `A05` | IX.2 | Priest raises and joins hands near face while eyes are directed to the Sacrament on altar for remembrance of the dead. | TEXT_THEN_SINGLE_FAMILY_VARIANT |
| `B05` | VII.6 | At Epistle side the priest washes his fingertips while the minister pours water at Offertory Lavabo. | REUSE_WITH_CUE_AND_STAGE_GUARD |
| `B06` | VII.5 | After crossing with the chalice, priest sets it on centre of corporal behind Host. | RUBRIC_WITH_CENTRE_ICON |
| `B07` | VII.5 / VIII.7–8 | Offertory pall covering and post-Chalice-elevation pall covering are separate; at Solemn Mass an assigned deacon assists. | STAGE_AND_ACTOR_GATED_RUBRIC |
| `B09` | VIII.5–6 | After major elevation priest replaces Host with RIGHT hand on corporal before genuflection. | RUBRIC_NOT_FAKE_ELEVATION |
| `S_priest_epistle` | ALTAR_EPISTLE_MISSAL | Epistle station is on congregation RIGHT when facing altar. | RECIPROCAL_ART_SWAP_PREVIEW |
| `S_priest_gospel` | ALTAR_GOSPEL_MISSAL | Gospel station is on congregation LEFT when facing altar. | RECIPROCAL_ART_SWAP_PREVIEW |

**Important:** The Epistle/Gospel picture swap is a proposed **existing-asset reassignment** based on the user's review, not a change to source station IDs. The Epistle side is congregation-right; Gospel congregation-left. Verify the depicted Missal position in the existing assets before any production binding.

Also block unsafe generic mappings at integration:
- `RAISES EYES` must not display a raised-arms gesture at C0169.
- `WASHES / PURIFIES` must distinguish Offertory C0125 from post-Communion C0247/C0248.
- `TURNS TO MISSAL` must resolve from the independent priest-position lane; never hardcode Epistle.
- Previously rated 0–2 `priest_return_altar_rich` and `priest_genuflect` may not be promoted into the repaired family.

## Phase B · Thirteen family repairs, two inspections, one crop repair

| Review ID | Track | Selected source anchors | Treatment |
|---|---|---|---|
| `A03` | FAMILY | `priest_centre_rich`, `priest_sedilia_rich` | Reconstruct using exact approved altar template; arms forward close over oblations, palms downward, no object held. |
| `A06` | FAMILY | `priest_centre_rich`, `priest_elevation` | Produce correct minor elevation with right hand Host just above chalice, left hand grips chalice; modest height only. |
| `B01` | FAMILY | `priest_centre_rich`, `priest_incense_altar_rich` | Source-verify blessing over thurible; reuse existing master plus caption if action cannot read at 64px; match common altar. |
| `B02` | FAMILY | `cross`, `priest_centre_rich` | Reuse clear cross with exact VII.3 paten-gesture wording unless source-specific hand scene improves comprehension. |
| `B03` | FAMILY | `priest_centre_rich` | Use selected centre image plus concise paten placement rubric; no generated microaction. |
| `B04` | FAMILY | `priest_centre_rich`, `priest_incense_people_rich` | Keep actor/minister handoff text and a generic approved priest icon; commission new pose only if needed at mobile size. |
| `B16` | FAMILY | `priest_kiss_altar_rich`, `priest_centre_rich` | Preserve waist angle while standardizing priest/altar; distinguish foot-of-altar Confiteor hands joined from Canon hands on altar; no kiss. |
| `D06` | FAMILY | `priest_incense_altar_rich`, `priest_sedilia_rich` | Create conditional kneeling thurifer incensing elevation only if text/incense cue is insufficient; maintain actual minister distinctions. |
| `S_priest_procession` | FAMILY | `priest_ascending_rich`, `priest_centre_rich` | Match figure, garment and stroke treatment; retain only for source-indicated procession, not generic motion. |
| `S_priest_incense_altar` | FAMILY | `priest_centre_rich`, `priest_sedilia_rich` | Rebuild altar geometry using selected centre/host-elevation altar, keeping incensation action only if depicted accurately. |
| `S_other_canon` | FAMILY | `response`, `bells`, `priest_centre_rich` | Simplify into consistent monochrome utility symbol; avoid inventing a specific priest gesture for generic section. |
| `S_other_lavabo` | FAMILY | `lavabo`, `priest_centre_rich` | One shared Offertory Lavabo master fixed once; preserve separate Communion ablutions icon and cue IDs. |
| `I_priest_blessing` | FAMILY | `priest_centre_rich`, `cross` | Keep investigation status; rebuild with priest facing congregation giving final blessing if proven useful; never confuse incense blessing. |
| `S_priest_elevate_chalice` | DIAGNOSE | `priest_elevation`, `priest_centre_rich` | Compare chalice grip, height, vestments, altar and legibility to 4/5 Host elevation; record exact defect before adjusting. |
| `S_sound_schola` | DIAGNOSE | `bells`, `priest_audible`, `response` | Check recognition at 48/64px and sound-symbol family consistency; retain if legible, otherwise redraw with same stroke family. |
| `B13` | CROP | `priest_communion_rich` | Recrop actual single priest scene with transparent margins; verify Host reaches mouth, not elevation, before considering promotion. |

**Shared fix groups:** common altar template for Canon/priest figures; one shared B05/Lavabo master; source-locked Canon hand positions; separate thurifer actor/artwork. Reuse an accurate illustration instead of drawing a complete new priest for every movement.

## Phase C · Artwork QA

For every accepted illustration: (1) 1962 rubric, precise cue, correct actor and Mass form; (2) one accepted priest/altar/vestment family; (3) no accidental hand or vessel substitutions; (4) true transparency and dynamic liturgical tint at 48, 64, 96 and 128px; (5) actual path-based SVG when vector certification is claimed. SVG filenames containing a raster `<image>` do **not** satisfy the vector gate.

**Review gate:** no change to live donor assets or automatic approval. Once the 24 have been corrected or resolved by reuse/text, calculate the truly absent subjects. Then generate only the remaining necessary art in small batches.

## Sources

- [1962 Ritus servandus, original Missale Romanum](https://www.documentacatholicaomnia.eu/01p/1962-06-23%2C_SS_Ioannes_XXIII%2C_Missale_Romanum%2C_LT.pdf)
- [1962 Ritus servandus English reading aid](https://1962ordo.today/1962-rubrics/)
- [Altar side orientation reference](https://www.austinlatinmass.org/wp-content/uploads/2021/08/IntroLatinMass-080621F.pdf)
- User 90-record review SHA-256: `edbde2bf608646cd258351274b6e545d42d88952b393c40c66492800684bc4a0`.

Machine-readable files: `data/presentation/mass-icon-harmonization-source-resolutions-20261014.v1.json` and `data/presentation/mass-icon-harmonization-16-workorders-20261014.v1.json`.


---

## Update: minimal-family anti-drift lock (14 October)

**The richly engraved recent image-generation outputs are NOT the approved style.** Use only the [minimal family standard](../data/presentation/mass-icon-minimal-family-standard-20261014.v1.json) and [human-readable design rules](mass-icon-minimal-family-standard-20261014.md). The **5/5 sedilia** is the primary confirmed priest reference; the 4/5 references await review, and a 3/5 asset cannot be used as approved style authority.

**Scores:** 0–2 original discarded permanently; 3 = research required; 4 = user review; 5 = confirmed and selected; unrated = pending. Historical “keep” decisions remain provenance and do not promote a newly scored 3 into automatic final approval.

Minimal means featureless or near-featureless priest head, one clean Roman chasuble contour, almost no inner folds, basic altar outline and only necessary hands/vessels. **No lace, textured hair, rich embroidery, carved altar panels, engraving/hatching, smoke clouds, or portrait modelling.** At 48–64px use only a readable gesture or a short source-owned text cue; do not shrink a full embellished altar scene. Final assets must be UI-tintable with true alpha, with real path SVG only when actually vector.

### Eight source/semantic corrections under the minimal rule

| ID | Method | Minimum acceptable presentation |
|---|---|---|
| `A04` | reuse and text | One minimalist priest centre silhouette only; add precise eyes-up rubric. Do not depict raised hands. |
| `A05` | research then minimal gesture | If picture needed, minimalist priest with two joined hands near face and gaze toward the Sacrament, not a Canon scene. |
| `B05` | shared minimal lavabo | If visual needed, separate hands/water over ewer, not an entire embroidered priest scene; same master reused for S_other_lavabo. |
| `B06` | station reuse plus text | Existing simple priest centre icon and short placement rubric; no special vessel drawing. |
| `B07` | station reuse plus text | Existing general station/Canon cue and explicitly source-owned pall action label, appropriate actor and form. |
| `B09` | station reuse plus text | Retain major elevation only at elevation moment. After it, minimal priest cue plus text 'Replaces Host' and then 'Genuflects'. |
| `S_priest_epistle` | conditional existing swap | Use opposite existing pictorial master provisionally; validate priest and Missal appear on congregation's right before approval. |
| `S_priest_gospel` | conditional existing swap | Use opposite existing pictorial master provisionally; validate priest and Missal appear on congregation's left before approval. |

### Sixteen other repairs under the minimal rule

| ID | First repair method | Gesture/detail to preserve |
|---|---|---|
| `A03` | new sparse pose only after existing-art check | Bare hands close together, palms down directly over the offerings; sleeves 1 broad shape each. |
| `A06` | new sparse pose only after existing-art check | Right hand holds Host just over chalice; left holds chalice at node; both low, no overhead elevation. |
| `B01` | reuse a clear icon or use short rubric | One priest silhouette with restrained blessing hand over thurible, only if visually distinguishable. |
| `B02` | no new image; existing symbol + rubric | Preserve existing cross mark and state that paten is used. |
| `B03` | no new image; existing symbol + rubric | Use accepted centre pose and exact textual paten placement; no distinct art. |
| `B04` | reuse a clear icon or use short rubric | Priest receiving thurible; only add tiny simple server/chain handoff when readable. |
| `B16` | retain approved pose geometry, redraw as sparse silhouette | Preserve the 4/5 deep torso inclination geometry, simplify priest into one clean garment shape and featureless head. |
| `D06` | one source-specific minister only if rail-scale gesture requires it | Distinct simple kneeling thurifer silhouette only if needed; thurible one clear tear-drop/chain. |
| `S_priest_procession` | simplify retained actor, no extra scenery | One priest recognizable by the same minimal chasuble outline with walking direction, plus optional cross bearer if indispensable. |
| `S_priest_incense_altar` | reuse approved altar footprint; strip ornamental architecture | Reconstruct same simplified altar outline as centre composition; one priest and one clear thurible motion. |
| `S_other_canon` | use one flat monochrome symbol | One sober monochrome Canon symbol or no pictogram if section title suffices. |
| `S_other_lavabo` | single minimal Lavabo asset for B05 + existing Lavabo | A single minimalist hand-and-water/ewer cue shared with B05; priest fingertip washing at Offertory. |
| `I_priest_blessing` | do not reuse any rejected original; design fresh icon only if still necessary | Simple priest face-to-congregation silhouette with one blessing hand and minimal vestment cues, if usable; old 2/5 facing-people source NEVER reused. |
| `S_priest_elevate_chalice` | identify defect before drawing | Compare selected Host elevation framing, verify chalice above priest and correct grip, keep same figure scale. |
| `S_sound_schola` | identify defect before drawing | Test simple chorus/singing symbol against approved audible/response utility family at 48/64px. |
| `B13` | recrop only; no added detail or implied gesture approval | Keep better single-pose crop only if Host actually contacts priest's mouth; may use text if action illegible. |

**Result:** all 24 work orders now carry a specific minimal-family method. The 36-subject generation register is paused until style repair and gap re-audit; previous ornamental masks are kept only as alpha/tint feasibility or hand-pose evidence. **No new artwork has been approved or linked into the live reader.**
