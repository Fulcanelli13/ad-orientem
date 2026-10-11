# Mass Campion priest-action icons — v2 review acceptance

**Status:** five native SVG candidates committed for visual and rubrical review only. **Zero** new icon production bindings, **zero** new approvals. The 42 original icon choices and two previously approved finger-discipline illustrations remain unchanged.

## Visual identity

All five proposed icons now use **filled silhouettes with transparent cut-out details**, the established Mass icon visual direction. The previous thin or unadorned sketches have been superseded for review; original 1962 Mass v1.80 masters remain unchanged. This is a closer **silhouette-family adaptation**, not a pixel-exact vector tracing of the priest figure from a specific original master. Final aesthetic acceptance remains the user's decision.

| Candidate | Source matrix cue(s) | Review artwork |
|---|---|---|
| Memento hands joined | GM.P.C0155.01, GM.P.C0193.01 | assets/review/mass-campion-priest_memento_hands-candidate-v2.svg |
| Hands over oblations | GM.P.C0161.01 | assets/review/mass-campion-priest_hands_over_oblations-candidate-v2.svg |
| Eyes raised | GM.P.C0169.01 | assets/review/mass-campion-priest_raises_eyes-candidate-v2.svg |
| Minor elevation | GM.P.C0204.01 | assets/review/mass-campion-priest_minor_elevation-candidate-v2.svg |
| Eyes and hands raised | GM.P.C0117.01, GM.P.C0263.01 | assets/review/mass-campion-priest_raises_eyes_hands-candidate-v2.svg |

## Native SVG conformance

- Native **256×256** `viewBox`, one combined <path> per icon.
- Every path uses root `fill=currentColor`; there are **no embedded raster data, SVG masks, filters, external references, scripts, or hardcoded palette colours**.
- Luminance-dependent black-mask cut-outs in v1 were replaced by true transparent even-odd vector subpaths. Repeated inline SVGs do not share `mask` IDs.
- All five passed local XML parsing, raster rendering with CairoSVG, alpha-mask invariance in five colours (green, red, violet, white, gold), and visibility checks at 24/32/44 px.
- GitHub branch source assets each passed remote structural checks. `node tests/mass-campion-priest-svg-v2.mjs` is a committed regression test; **not yet recorded as run in GitHub CI**.
- Interactive local Chromium acceptance is **not certified**: the sandbox browser refused both `file://` and localhost navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), so browser click/render equivalence has not been claimed.

## Review and production policy

[Open five-icon native SVG v2 reviewer](../reviews/mass-campion-five-priest-svg-v2-review-20261011.html) or download the standalone HTML offline reviewer from the ChatGPT response.

Approval must verify exact hand geometry, gaze, minor-elevation height, posture at the relevant 1962 cue, and visual consistency beside the user-approved finger pair. Keep the Campion matrix's `PENDING_EXACT_MASTER` statuses unchanged until explicit acceptance. The faithful left rail must not inherit priest action imagery.

The ten outstanding faithful-source rows remain in the grouped 17-cue triage; no additional posture has been mandated.
