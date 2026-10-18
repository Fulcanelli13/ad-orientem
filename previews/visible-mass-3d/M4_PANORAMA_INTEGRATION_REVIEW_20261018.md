# The Visible Mass — M4 authentic photographic continuity (initial integration)
18 October 2026 · draft PR #1309 · REVIEW ONLY; NOT APPROVED FOR RELEASE

## Canonical interface and exact original scenes
This milestone integrates the P3/P6 **documented original 360-degree sources** into the SAME `sanctuary-hotspot-pilot.html` that already contains Explore / Discover / Understand, the four optional guided trails, six inspected Brompton high-altar hotspots, original glossary G### and VMQ owners, the M3 French research overlay and research-only Mass Explorer handoffs. It is not another standalone photograph prototype.

The scene selector offers:
- **Brompton high altar still** (Anthony O'Neil, CC BY-SA 2.0) with all six original, provisional object hotspots; no change to original image coordinates.
- **Brompton Oratory, London, original 360°** (David Iliff, CC BY-SA 3.0); photographic architectural environment, not a photograph of Mass in progress.
- **Newman University Church, Dublin, original 360°** (David Iliff, CC BY-SA 3.0); independent church and historically interesting Catholic architecture, NOT a documented celebration of the 1962 Mass. Its geometry, coordinates and object list are never transferred from Brompton.

Both panoramic views use MediaWiki Commons' source imageinfo API for a bounded-size source photograph, verify 2:1 equirectangular dimensions, and project perspective into a canvas at one real camera position. The camera pitch explicitly samples **north-up, top-row zenith / bottom-row nadir** to prevent the previously reported upside-down 360° error. Only photographic pixel sampling occurs; there is no 3D geometry, fictional walk, image generation or cross-photo coordinate registration. Software pixel projection is a provisional mobile-friendly fallback, not final optimized photographic delivery. Drag, keyboard, zoom, and on-screen controls are present.

The controller retains pose separately for each original panorama; entering the six-object photo to read an object and closing the detail returns to the prior panoramic scene. A direct guide-photo focus deliberately re-enters the exact Brompton high-altar still before using its six tested hotspot coordinates. Original VMQ ownership and visited/skipped suggestion semantics are unchanged. Different scene source, creator, licence and photographic context appear in the existing photo-credit line.

## Verification / limits
- `tests/visible-mass-m4-panorama.mjs`: source identities, attribution, exact file metadata endpoint, pitch/upright scanline mathematics and isolation of still-photo hotspot plane.
- `tests/visible-mass-m4-photo-browser.mjs`: both desktop and mobile viewport, with **synthetic 2:1 test image** substituted strictly for deterministic browser interaction; tests 360 state entry, photographic scene attribution, source isolation, up-camera control, viewpoint retention, return to original still and unchanged guide read counts. Synthetic test images are never bundled in the actual visitor UI.
- Existing `tests/visible-mass-sanctuary-photo-browser.mjs` remains a required separate browser gate: authentic six-object still, trails and French study overlay. The mobile selected-object sheet was adjusted to prevent the new scene selector from occluding the original hotspot.
- CI execution status must be read from GitHub Actions; code committed is **not equivalent** to all gates passing.
- **Not accepted**: real-device inspection of the actual Brompton/Newman equirectangular pixels and north/up orientation; orientation within the church toward the altar; original external Commons API/CORS reliability on actual phones; GPU/memory/battery costs; user-visible screenshot approval; definitive copyright/share-alike attribution review; actual Windows and Android mobile touch precision; English/French publication approvals; unresolved M3 doctrinal/rubrical review, four unanswered VMQ questions, independent R17/Formation integration gates.

## Remaining M4 plan
1. Complete existing source tests and browser checks; use failure logs to correct real regressions without weakening original QA.
2. Validate **real licensed photographs on Windows/Edge and Android**, checking upright orientation, touch gestures, altar-facing default viewpoint, text legibility, scene transitions and exact attribution.
3. Review performance, offline caching/retained photo rights and whether Commons-delivered raster should be replaced by the existing verified offline P3/P6 artifact assets for robust release.
4. Separately implement any additional Newman detail views only from individually approved photographs and their own origin/rights manifest. Do not reuse Brompton hotspots; do not imply Newman TLM celebration.
5. Re-run M3 editorial, French copy and all required Formation/R17 gates. Keep PR #1309 draft and unmerged until those approvals.

No change to LIVE/Simple/Missal Mass readers or the original certified Mass/Formation/Glossary owners.


## M4.1 — Actual licensed-photograph orientation and rendering acceptance (18 October 2026)

**Verified research browser gate:** [GitHub Actions real-photo review #39079617512](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39079617512) ran successfully against commit `975014f8c8912f325d5025d3e9a7666769cfec50`. [Review artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39079617512/artifacts/12118696940) contains desktop/phone panoramic captures plus JSON measurements. This is a source/raster test, **not** visual sign-off on a physical device.

The first authentic-image test detected a real regression: the WebGL shader worked with a small synthetic image, but the photographed 4096×2048 research files rendered **black** with WebGL in headless Chromium. This occurred despite successful file decode and texture upload, so prior synthetic tests were insufficient. The controller now enforces a **maximum 2048px source texture**, consistent with its Commons API request (`iiurlwidth=2048`). The updated real-image gate checks that genuine source pixels project upright, comparing each output against both correct source UV coordinates and deliberately inverted coordinates. WebGL and software fallback still share the same north-up convention.

Verified cases with WebGL renderer:
| Original 360° source | Desktop correct-pixel average error | Desktop deliberately-inverted error | Phone emulation correct / inverted |
| --- | ---: | ---: | ---: |
| Brompton Oratory · David Iliff | 25 | 122 | 33 / 108 |
| Newman University Church · David Iliff | 15 | 167 | 13 / 176 |

Scores are mean sampled RGB Euclidean distances from original pixels: **lower is closer**, not percentages or a human visual score. All four cases distinguish the genuine upright view from an upside-down projection. Both panorama sources passed 2:1 geometry and CC BY-SA 3.0 source metadata verification. Screenshots record the genuine photographs, not generated images. The browser test also checks strict venue separation, each photo’s creator/source, actual Creative Commons licence URL, and perspective-adaptation disclosure.

The main viewer now uses a GPU path when available with a software fallback; the source image and photographs still preserve their original attribution and rights. The adaptation notice explicitly describes the projected view. Existing six original Brompton high-altar markers are not copied onto either panorama; the 4 guide trails and VMQ/M3 ownership remain intact. The normal desktop/phone sanctuary regression workflow passed alongside the authentic-image workflow.

**Still blocked:** user visual approval on physical Windows/Edge and Android devices; calibrated touch comfort and motion/performance on actual phones; photographic pixel quality and source orientation approval from the user; external Wikimedia API/CORS behavior under real network conditions (automated real-image tests route original files through same-byte controlled responses); distribution/cache strategy; any legal publication review of CC BY-SA adaptations; M3 doctrine and translation approvals and four held VMQ questions; independent R17 acceptance. This is NOT a release approval, and PR #1309 remains draft.

## M4.2 — Wikimedia image delivery, memory and interaction (18 October 2026)

**External delivery tested, no mocked API or photographs:** [GitHub Actions #39080663332](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39080663332) succeeded for both Brompton and Newman in browser Chromium. The Wikimedia Commons `imageinfo` API returned HTTPS thumbnail URLs on `thumb.wikimedia.org`, not just the original `upload.wikimedia.org` domain. The reviewer had rejected the former as an unverified host, even though it was a legitimate Commons response. M4 now accepts only **those two named Wikimedia hosts**, under the **`/wikipedia/commons/`** path, with HTTPS; it does not open the host allowlist to arbitrary domains. The live test fetched both external source images with browser cross-origin loading and rendered actual panoramas using WebGL. This is not a physical-device connectivity guarantee.

Commons can return a filename containing `3840px-` while reporting `thumbwidth=2048`. The app enforces the decoded source image at **2048px maximum**, rather than trusting the filename or downloading an unbounded original on API thumbnail failure. This also prevents the 4096px GPU black-texture issue found earlier. Other defensive behavior: cancellation of stale metadata requests when scenes change; timeouts for metadata and image loading; retention of only downscaled decoded source images in the per-scene cache; canvas clearing during scene changes to prevent misattributed stale photographic content; viewport resize redraw; and a visible same-scene retry control for missing original imagery. If a Commons thumbnail is absent, the visitor retains the original source link and six-object sanctuary photo instead of receiving a fabricated replacement.

The dedicated browser check `tests/visible-mass-m4-photo-browser.mjs` now exercises pointer/touch dragging, view resizing, independent scene camera memory, unchanged guide-read counts, a missing-photo response and same-scene retry. `tests/visible-mass-m4-live-network.mjs` exercises both genuinely external sources without intercepts; `tests/visible-mass-m4-real-photo-browser.mjs` independently checks both image matrices and vertical pixel orientation from licensed photographs. New tests do **not** certify sustained mobile GPU frame rate, CPU heat/battery use, or network resilience on physical Android hardware. M3 content remains review-only; four questions remain unanswered; no source, question or reader ownership was changed. PR #1309 must stay draft.

## M4.3 — Original-photo visitor screen review and local-device handoff (18 October 2026)

The prior original-image browser QA was **not** sufficient for mobile page layout: it only captured cropped canvas source views. The new [real-photo workflow #39082238480](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39082238480) passed and archives **four full-page photographs within the actual integrated visitor** (Brompton and Newman, both desktop and mobile emulation) alongside the original orientation/pixel checks and live Wikimedia Commons/CORS browser verification. [Photo and interface review captures](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39082238480/artifacts/12119387442).

Visual review produced three M4 changes, not merely a new checklist: (1) a compact single-column mobile header with two equal-sized selectors and no duplicated top source-credit link; (2) scene-specific introductions and source links, including the explicit Roman Catholic but *non-1962-evidence* distinction for the Newman photograph; (3) source-owned Brompton six-object and inspection accordions hidden while either original 360° scene is selected, preserving exact original still/photo coordinates and preventing an apparent object transfer to Dublin. The research limitations remain inside an accessible closed disclosure rather than a large repeated footer. The panorama has a seventh, one-tap **face the sanctuary** camera-reset control (↺), including a genuine-source camera pose check.

Phone emulation at 390×844 measured a **126.7px title/filter header** and original panorama start at ~**319px** document Y. The main M4 browser QA, legacy six-hotspot desktop/phone tests and real-image photographic projection are green for this set. This is a layout/browser acceptance result only; no human device approval is implied.

To test on real Windows/Edge and an Android Chrome device on trusted local Wi-Fi, use the read-only allowlisted `tools/serve-visible-mass-review.mjs` script and [M4 physical-device review checklist](M4_PHYSICAL_DEVICE_REVIEW_20261018.md). The server has automated tests for HTML, MJS, glossary data, blocking hidden/repository-root files and read-only HTTP methods. **Do not confuse** the standalone old P0 geometry HTML with this integrated M4 photographic visitor: the former does not contain M4. No unauthorised external demo site has been deployed.

**Outstanding:** actual Windows/Android approval; long-session memory/battery/thermal observations; legal adaptation/publication sign-off; the 6 M3 editorial source-review holds and 4 held VMQ answers. Independent R17/Non-Mass convergence failures remain separate and are not patched through this 360° visitor. Keep PR #1309 draft/unmerged.
