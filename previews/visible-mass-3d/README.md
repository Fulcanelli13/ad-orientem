# The Visible Mass — 3D explorer research prototype P0

## Sanctuary photo hotspot pilot (Phase 1; 17 October)

Open [**Explore the sanctuary — six actual-photo object hotspots**](sanctuary-hotspot-pilot.html) for the separate **authentic Brompton Oratory** research interface. It uses Anthony O'Neil's July 2019 photograph (CC BY-SA 2.0), six provisional image-relative hotspot coordinates, existing glossary G### definitions and 134 indexed research questions across the broader 30-object pilot. Select an object; open and return from questions. Questions do **not** yet have independently approved answers. Link/text availability requires serving the whole repository over HTTPS, not opening the file directly via `file://`. The original CC photo is requested over HTTPS; the viewer is therefore **not an offline bundle**.

**17 October inspection expansion (reconciled current status):** **17 separately sourced inspection subjects** now open from the original six-hotspot sanctuary pilot, through a restrained zone-grouped *Inspect further* section **and contextual related-object links inside each object card**. The 17 are AL03 tabernacle; AL16 altar card; BK01 1962 Missal; SV01 chalice; SV02 paten; LN02 purificator; LN03 pall; **SV03 ciborium; SN05 sanctuary lamp; LN04 burse; LN05 chalice veil; EQ01 wine-cruet example; EQ02 water-cruet example; SV13 Communion paten; AL14 altar stone; LN01 corporal; SN07 credence furnishing.** With six authentic-scene parent hotspots and seventeen separate inspections, **23 of the 30 sanctuary pilot subjects have a visual entrypoint** (6 image hotspots + 17 explicitly separate image/illustration entries). That is **not** 23 authentic Brompton objects or 23 directly clickable physical hotspots, and the other seven remain without an accepted inspection asset. Their verified photo/illustration identities, creator/source/licence, category, historical limitations, and question relations are in [sanctuary-inspection-sources-20261017.v1.json](sanctuary-inspection-sources-20261017.v1.json). Reuse of photographs across multiple object records is intentional; the source manifest is not an image-count claim. Historical illustrations (Dolby 1868) are labeled as illustrations, not actual photographs; Italian museum cruets are a pair whose individual wine/water function is **not** visually established. None of the separate reference examples was photographed at Brompton. The pilot exposes questions without manufacturing Phase 1.5 answers; the canonical glossary remains the owner.

**Browser acceptance (17 October; expanded again):** Real Chromium passed the [desktop and phone-width research journey](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39051295148) at **1280×800** and **390×844** (emulated touch). It tested scene hotspot selection, canonical G### loading, indexed question expansion/return, separately sourced tabernacle and corporal inspections, contextual corporal→burse historical illustration, returning to the original photo, visible object-centred mobile sheet and no uncaught JS errors. The 390px diagnostic confirmed `documentWidth=viewportWidth=390`, the selected AL01 marker was the actual hit-test target (`BUTTON.marker`), and horizontal scrolling stayed inside the photo viewer. Browser images were intercepted with diagnostic placeholders to test layout and interaction, so these screenshot artifacts are **not final photographic-composition acceptance**. Actual Wikimedia download reliability, real handset performance and detailed photography/licensing review remain open. The standalone experimental GLB remains separate.

Two staged research documents accompany it: [30-object / 134-question registry](PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json) and [scene / UX acceptance gates](PHASE1_SANCTUARY_PILOT_SCENE_AND_UX_20261017.md). Regression contract: `node tests/visible-mass-sanctuary-hotspot-contract.mjs` (static; actual mobile visual QA pending). This is a **photographic scene**, not the experimental walkable GLB shown below, and has no dependency on Babylon.js.


**Status:** Experimental. Isolated from the canonical Ad Orientem Mass reader and navigation. Not approved for release.

## Goal

Let the visitor enter a real Roman Catholic church, walk through its nave, click physical objects in their actual locations, and read authoritative Ad Orientem glossary entries. The underlying church scan is an interchangeable visual environment, not the knowledge owner. No hand-built synthetic crucifix, bench, or altar is used.

Entry point: \`previews/visible-mass-3d/index.html\` on a web server (not via \`file://\`).

## What is implemented

- Babylon.js real-time GLB importer (local .glb or direct HTTPS URL).
- Survey (orbit) and Walk (WASD/arrows; touch movement buttons) cameras.
- Author-selected nave entrance placement in model coordinates.
- Author-selected interactive object markers pinned to positions on the actual 3D church mesh, with a visual selection cue.
- Examination panel resolved from \`data/glossary/concepts-001-150.v1.json\` and \`concepts-151-300.v1.json\`; no duplicated explanations.
- JSON export and import of marker coordinates with source identifier.
- Opt-in research model: Giravolt / Burzon-Comenge, *Nativitat de Durro*, CC BY, accessible as a Zenodo GLB (136.8 MB). This is **not an approved church interior** for final Ad Orientem; in particular the high-altar / forward-table criterion remains unverified.
- The app repository contains **no external church geometry or scan-derived textures**.

## How to try it

1. Deploy or locally serve the repository. Open \`/previews/visible-mass-3d/\`.
2. Choose a downloaded \`.glb\` file. Alternatively, click "Load Durro reference" (large file, desktop only for initial testing; requires remote host CORS), or paste another direct HTTPS \`.glb\` URL.
3. In Survey, move the camera until you can see a nave floor point. Click **Set entrance**, then click that point. Click **Walk** to begin navigating.
4. Choose one of the canonical glossary subjects, click **Place hotspot**, then click the corresponding existing object in the rendered church. Repeat for as many objects as actually appear.
5. Click a gold marker to open its glossary definition and explanation. Use **Export markers** to save the hotspot positions and selected entrance. Import the same JSON when returning to the exact matching GLB.

## What is NOT claimed

- The Durro model has not been visually certified, and cannot yet be selected as the published church.
- No accurate collisions, stair navigation, route-finding or physically constrained sanctuary walking: this is a fixed-eye-height free camera intended to establish interaction feasibility. Walk movement can pass through scanned surfaces.
- Hotspot placement is manual: the app cannot infer which fused photogrammetry triangles form a chalice or tabernacle from texture alone.
- No fully rotatable extracted vessel: a fused mesh is not an independently inspectable 3D object. Future object-specific GLBs can support this in a second phase.
- Not mobile performance tested, especially with 137 MB reference file.
- Not an offline app: library loads from public Babylon.js CDN and remote files require CORS.
- No automatic integration with Mass Explorer or LIVE reader, preserving their existing source/card mappings.

## Acquisition rights / no-permission policy

Only promote a church to the production asset manifest after **both** documentary licensing and interior suitability approval.

Model gate: complete, intact **Roman Catholic** interior, dignified traditional high altar, **no forward altar table in front of the tabernacle**, proper explorable scan, no ruins, approved high-quality assets. Licence gate: CC0, CC BY with full attribution and adaptations noted, or another independently verified redistribution/licence route permitting embedded commercial apps. "Viewable" is not equivalent to "redistributable". The Giravolt model is CC BY (credit model creator Burzon-Comenge and Giravolt), but **not** yet visually accepted.

Reference:
- https://sketchfab.com/3d-models/nativitat-de-durro-vall-de-boi-d6a3c0ce0cb943f2b8e09eb4d21e448f
- https://zenodo.org/records/10341445
- https://creativecommons.org/licenses/by/4.0/

## Next technical gates

1. Test the viewer with an actual local GLB in a real browser, record supported desktop and Android devices, loading behaviour, model orientation and texture consistency.
2. Verify camera interior walk, author at least five markers on visibly present objects, save/import same manifest.
3. Add collision proxy meshes, floor height changes, safe navigation limits, touch look and robust mobile memory budgets.
4. Add separate examination GLBs for canonical sacred vessels, if suitable independently licenced models are acquired.
5. Integrate as a lazy-loaded Learn module only after product/rights approval, with no change to the 48-card LIVE reader.

**P0 acceptance:** operational church loading, navigation, a saved/restored marker manifest and source-backed inspection for 5 objects; not appearance-only evaluation.
