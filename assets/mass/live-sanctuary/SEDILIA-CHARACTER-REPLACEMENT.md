# Sedilia clergy — character replacement and owner visual-acceptance gate

**Decision, 12 November 2026:** The owner rejected the former white-leg/trouser graft after personally inspecting `sedilia-leg-pose-before-after.png`. The assistant independently rejected five subsequent local SVG draping alternatives (A–E) after examining screenshots from the real original M3/C08 renderer. **Do not reintroduce any of them** or mark sedilia accepted based on geometry-only assertions.

## Diagnosis

The unchanged donor sanctuary uses CSS-3D billboard actors. `vestSide()` builds their alb and outer vestment as separate SVG paths; for `sit`, the short lower-body silhouette is a narrow, straight white appendage. The solid sedilia front and side projection further hide the legs. Moving x and artificially raising height creates clipping/floating, while widening the white path and shifting a shoe produces **trousers disconnected from the chasuble/dalmatic**, not proper seated clerical attire.

The rejected graft has been removed from `ao-sanctuary-embedded.js`. C08/C09/C12/C17/C18/C19 still show donor placeholders for source and gesture testing, and must retain the explicit `DONOR_SEDILIA_REVIEW_HOLD` result. **Do not describe them as approved or production-ready.**

## Required asset solution — not another lower-body path patch

1. Model a **complete seated figure** with an articulated pelvis/thigh/knee/shin/foot rig and one continuous naturally folding alb; include the priest's Roman chasuble, the deacon's dalmatic and the subdeacon's tunicle as different actual garments. No trouser silhouettes or floating feet. Keep facial features visually subdued.
2. Align the seated pelvis and thighs with the sedilia cushion, knees ahead of the lip, shins down to the floor, and soles on the floor, using **one consistent projection** throughout. The three ministers have independent longitudinal seats and must never overlap.
3. Separate skull/neck, biretta, right hand, upper torso, pelvis, robe/cloth and knee anchors. A source-verified gesture animates **remove biretta → place on right knee → bow uncovered head → straighten → replace**. The biretta must contact the knee and be supported by the hand; a translated SVG cap hovering by the figure is not sufficient.
4. Support ordinary head bows and the profound sung `Et incarnatus` bow, plus the Christmas/Annunciation kneeling exception without faking that the deacon is still seated in C18 while performing his separate corporal duty.
5. For zero-cost GitHub Pages delivery, first evaluate an **offline-produced, rigged 3D character rendered into a transparent multi-angle, multi-state WebP atlas**. The existing M3 billboard/camera may then use the atlas without shipping a paid runtime, introducing external CDNs or changing the original donor HTML. The atlas cannot be promoted until its poses remain coherent under the original camera's views, transitions and form colours.
6. Alternative: a local WebGL articulated mesh with perspective synchronized to M3. This requires separate performance and camera proofs; do not inject a second unsynchronized camera or claim it is automatically better.

## Scenes and conditions

| Original scene | Expected visible state | Source boundary |
| --- | --- | --- |
| C08, C09 | sung Gloria; celebrant and actually seated ministers | independently observed sung-word BEGIN/END |
| C12 | seated Mass interlude | no invented reverence event |
| C17 | Credo opening / Iesum Christum | independently observed sung-word event |
| C18 | Incarnatus | P/S seated for ordinary bow; Solemn deacon at altar; proper-dependent exceptional kneel |
| C19 | Credo continuation / simul adoratur | independently observed sung-word event |
| Low or Requiem without Gloria/Credo | no sung sedilia reverence | fail closed |

## Release acceptance — all mandatory

- Real M3 scene screenshot, **not a composited mockup**, for **all six** seated source scenes in Sung and Solemn forms, including C18 deacon duty; 390 px portrait and desktop/landscape views.
- Three figure close-ups show shoulder-to-foot coherent draped vestments, visibly supported thighs/knees/shins, foot-floor contact and correct separation from bench. Independently inspect image: geometry assertions alone are inadequate.
- A motion sequence records each frame of uncovered/covered biretta, right hand/knee support, head bow and restoration; no rigid cartoon rotation or detached cap.
- Christmas and Annunciation exception screenshots show the correct kneeling action.
- Original donor `index.html` remains byte-for-byte immutable; 65 Mass scenes, original C11–C14 choreography, gesture rails and navigation unaffected.
- No CI green result may override owner rejection. **PR #2882 remains draft; do not merge or deploy without visual approval.**

## Local visual experiments discarded

- Enlarged white knee-and-calf SVG with shoe translated ~19 units: resembles white trousers.
- Five curved white/green SVG lap sketches on donor C08, tested in real Chromium scene: remain cardboard/cartoon-like because the torso, cloth and legs are not a single modeled body. None should be shipped.

**Next deliverable:** a single full-body **rendered character art asset** (priest first) at seated, uncover, bow, recover and kneeling states, shown with the actual sedilia before expanding to deacon/subdeacon or other Mass scenes.
