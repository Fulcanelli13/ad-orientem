# Mass LIVE — Batch 4 acceptance / release-candidate register (12 Oct 2026)

## Correct production baseline

The app has moved beyond the older 48-card-only LIVE reference. The **current production-default acceptance** is the curated 65-card source-first presentation: **64 ordinarily visible**; **65 visible only when the optional Second Confiteor is explicitly enabled**. The older **48-card presentation is an explicit rollback** (`aoLiveCards=48`), not a substitute for the default.

Source evidence: `tests/reader-phone-production-card-default.mjs`, `tests/reader-phone-curated65.mjs`, `src/mass/reader-native-preview.js`; the release register still mentions older 39-source/48 historical variants. Do not conflate raw source cards, curated presentation cards, and visible-card progress.

## Accepted by CI only when current head passes

| Gate | Evidence / strict acceptance | Scope |
|---|---|---|
| 64/65 default and optional Confiteor | `reader-phone-production-card-default.mjs`, curated65 full-card rehearsal | Current production reader on emulated mobile |
| Explicit 48 rollback | `reader-phone-production-card-default.mjs` | Compatibility, *not* production-default signoff |
| 320/390px phone and 768px wider viewport; EN/FR | `reader-phone-curated65.mjs` | Layout/paragraph focus in Chromium |
| LOW | `b005-low-objective.mjs`, `reader-form-state-parity.mjs`, `mass-form-ceremonial-batch2.mjs` | 275 cues; response, paten, Requiem blessing exception; no Schola |
| MISSA CANTATA simple/incense | `mass-form-special-integration.mjs`, `reader-cue-state.mjs`, `reader-schola.mjs` | Exact source-owned gesture/Schola events; no invented deacon |
| SOLEMN | `b006-solemn-objective.mjs`, `reader-form-state-parity.mjs`, `solemn-pax-authority.mjs` | 19 sacred-minister deltas; separate Pax, Paten and actor roles |
| Consecration, chalice elevation and bells | `reader-phone-acceptance.mjs`, `reader-transients.mjs`, `reader-rubric-events.mjs` | Correct word/action source-cue boundary; transient clears |
| Optional priest observations | `reader-priest-chant-phone.mjs`, `reader-priest-entrance-phone.mjs` | Schola cannot imitate celebrant; no forced user gestures |
| LIVE rail ownership and accessible icons | `reader-live-rails-phone.mjs` | No ghost rail tiles, active cue labels, one ribbon owner |
| Pre-Mass and exceptional structures | `app-shell-final-e2e.mjs`, `app-shell-nuptial-e2e.mjs`, `app-shell-easter-vigil-e2e.mjs` | Asperges, Palm, Ash, Candlemas, Rogations, Good Friday, Requiem, Corpus Christi, Holy Thursday, processions, Nuptial, Vigil |
| Cross-cutting release contract | `mass-batch4-release-acceptance.mjs` | Confirms above automated suites and production/rollback distinction remain wired into CI |

**Important limitation:** successful code/Chromium tests prove only the stated automated properties; they do not prove that a person following an actual Low, Missa Cantata or Solemn Mass can track the priest at every moment.

## Physical Android acceptance — OPEN, not automated/certified

Conduct at least one real Android session in portrait mode for each major form (Low, Missa Cantata, Solemn), plus a Requiem or other exceptional service; record device/browser or app build, screen dimensions, date, form, source-plan identifier, observations and screenshots/video. Check:

1. Vertical one-paragraph-at-a-time lit/mute focus, horizontal card swipe, no accidental card change on vertical scroll, and accurate next/previous navigation.
2. Persistent upper-ribbon left faithful posture, right priest position; transient rails vanish, voice/action icons are large and recognizable; all buttons remain touchable.
3. Corpus Christi/special actions do not appear without explicit selection; Requiem omissions and end-of-Mass branching are correct.
4. Bells and elevation cinematics have sufficient duration and prominence without blocking the consecration words or causing delayed/duplicated cues.
5. French and Latin text, V./R. and M./S. typography, prayer translations, Schola box resize/hide, mode switching and rubrics work on device.
6. Observe any priest/Schola desynchronization at Sanctus/Benedictus and any uncertainty in priest-motion timing; **no fabricated automatic event detection**.

Acceptance evidence must be directly observable. Never mark physical-phone or attended-Mass gate PASS without actual test recordings and results.

## Release recommendation

**Automated release candidate**: eligible once current-head CI is green and any failures resolved.

**Field UX certification**: blocked until physical-device and at-Mass observations are documented.

Do not expand historical research inventories or make further card splits as a prerequisite to this acceptance. Current 65-curated and 48-rollback consistency is the immediate regression priority.
