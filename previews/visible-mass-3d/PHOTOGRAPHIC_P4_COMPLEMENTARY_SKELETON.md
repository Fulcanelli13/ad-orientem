# The Visible Mass — P4 complementary 360° skeleton (17 October 2026)

Status: **draft visitor prototype / research only**. Main source branch:
`feature/visible-mass-3d-explorer-p0` (draft PR #1309). The full offline
user prototype is provided as a conversation artifact
`The_Visible_Mass_P4_360_Fixed_Living_Glossary_Skeleton.html`;
its large licensed image payload is not checked into git.

## Repairs

The P3/WebGL panorama texture upload used
`gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)` while the shader already
interpreted equirectangular V as **top-origin**. The resulting double
inversion displayed the building upside-down on WebGL devices. P4
sets `UNPACK_FLIP_Y_WEBGL=0`. The independently implemented CPU renderer
already followed the correct convention.

Real panorama screenshots via Chromium **CPU fallback** confirm Brompton
Oratory and Newman University Church are upright. Browser GL context could
not be provisioned in this test environment, so final GPU/phone acceptance
is pending, not falsely claimed complete.

## Parallel research ownership and handoff

Another chat has already delivered these files on **this same draft branch**:

- `PHASE1_OBJECT_QUESTION_RECONCILIATION_20261017.md`:
  **170 subjects / 13 zones**, 63 exact glossary links, 86 related
  links and 21 source gaps; 680 provisional question associations
  (not 680 approved answers).
- `PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json`:
  **30 sanctuary objects, 134 deduplicated question prompts**, only six
  photographically confirmed as usable hotspot candidates.
- `sanctuary-hotspot-pilot.html`: six point positions tied *only* to
  `BROMPTON_ALTAR_2019_B`, the authentic 2019 Geograph photograph.

P4 **does not create new question IDs or doctrinal answers**. It uses the
research group’s exact six object IDs and source photo coordinates:

`AL01 G404`, `AL06 G079 related`, `AL07 G079 related`,
`AL19 G418`, `SN02 G186`, `SN04 G181 related`.

The read-only code `photographic-scene-bridge.mjs` validates the
source-owner/question registry, source image identity and glossary match;
`tests/visible-mass-photo-bridge.mjs` passes in GitHub Actions. The
`G079` and `G181` *related* terms are not silently misrepresented as
definitions of candle count, crucifix construction or steps.

The source-matched Geograph image is downloaded and rights-tracked by
`tools/acquire-visible-mass-hotspot-photo.py` and
`.github/workflows/visible-mass-exact-hotspot-photo.yml`, without
payment/permission request. Its source/attribution is visible in the P4
HTML.

## Experience skeleton

- **London 360°** — photographic fixed-vantage exploration; a documented
  environment where 1962 Mass is celebrated, not a photograph of a Mass.
- **High altar** — close photograph of the actual Brompton high altar.
- **Inspect altar objects** — another **explicit same-venue viewpoint**
  containing six well-targeted object inspection markers; more than six
  cannot be claimed from the available exact photo.
- **Side chapels** — optional location changes, never a forced passage
  during approach to altar.
- **Witness the Mass** — actual TLM ceremonies recorded at separately
  identified sites; existing `AO.CARD.*` and `MF01–MF08` references
  retained from P2/P3, not duplicated prose.
- **Newman Dublin 360°** — beautiful historical Catholic church architecture
  at a distinct venue, **not described as celebrating the 1962 Missal**.
- **Long-term 13-zone inventory** — research navigation candidates only;
  not represented as 170 image-visible clickable hotspots.

Phase 1.5 is still source/question research; Phase 2 action/rubric content
must read from the canonical Mass Explorer, Guide, Ultra Master and 1962
Mass owners only after their existing publication gates.

No production `src/mass` or `src/learn/mass-explorer.js` changed.
No new glossary `G###` records added. No draft research or speculative
rubrics published.

## Checks and next gate

- GitHub Action `visible-mass-p4-bridge.yml`: passed six exact image
  photo anchors, 170-zone crosswalk parity and distinctions D/R.
- Chromium desktop 1280×840 and mobile 390×844: visitor navigation,
  London altar, six-marker inspection, direct/related glossary cards,
  return path, Newman panorama: passed in optimized-content tests.
- Actual panorama images in software renderer screenshot upright.
- Real device: **GPU orientation**, smooth pan/zoom, 6 mobile tap targets,
  photo licences, phone performance and user aesthetics need approval.
- The offline file is ~22 MB; production must adopt tiled image loading
  rather than embedding all high-resolution assets in one web page.


## P4.1 offline continuation (17 October 2026)

The previous P4 offline visitor file was recovered from the user’s file library and updated **without starting a new object inventory**. The resulting single-file experimental handoff is `The_Visible_Mass_P4_1_Sanctuary_Questions_and_Fallback.html` (about 23.5 MB), delivered directly in the original ChatGPT conversation; this image-embedded build is **not checked into Git**, and no public deployment/merge is implied.

- The six exact-photo subjects remain **AL01, AL06, AL07, AL19, SN02 and SN04**, with unchanged G### direct-versus-related attribution and unchanged photographic coordinates.
- The corresponding cards now expose three existing, ID-stable, **unanswered** research questions each (18 read-only prompt extracts), selected verbatim from the parallel `PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json` registry. Full glossary description remains available on demand. No newly authored question ID, answer, liturgical claim or Mass reader content was added.
- WebGL still sets `UNPACK_FLIP_Y_WEBGL = 0` for the original top-origin equirectangular shader. A texture-dimension/upload-error check precedes declaring GL ready; an otherwise valid-but-failed WebGL canvas can be **replaced** to acquire a 2D rendering context, and lost WebGL context attempts software recovery from the already decoded panorama image.
- Mobile panorama interaction now includes genuine two-pointer pinch-to-zoom, scene chips stay in one horizontally scrollable row, and marker hit targets are at least 44 CSS pixels.
- Local headless Chromium smoke checks on 1280×820 and 390×844 passed upright **CPU fallback** panoramas, six markers, glossary card open/close, the three display questions, and zero uncaught page errors. Separate targeted tests passed simulated two-pointer zoom and forced WebGL-context-to-2D-canvas recovery.

**Still unverified:** a real WebGL/GPU device, hardware panorama orientation, image/attribution publication approval, actual phone target precision, native-mobile performance, and canonical answer links after Phase 1.5. The sandboxed Chromium session did not provide a WebGL context even with SwiftShader flags. The offline file is a test artifact; it does not supersede source-owner registries or authorize merging draft PR #1309.
