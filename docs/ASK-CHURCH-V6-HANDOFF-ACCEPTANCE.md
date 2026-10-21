# Ask the Church — V6 handoff hardening and isolated acceptance

This note documents the follow-up to the V5 objective-led prototype. It does not authorise publication or claim acceptance in the deployed Ad Orientem shell.

## Changes

- `src/learn/ask-church-native-handoff.js` now serialises user-initiated launches: concurrent clicks receive `OPEN_IN_PROGRESS`. Locks are released after success or exception.
- Apostolate handoffs require a successful `open({scenarioId,practice:false})` and must not report an explicit `status().open === false` as success.
- `src/learn/ask-church-guided-preview.js` prevents restarts, language toggles and source reads while a destination is opening. The guide does not steal focus from a successfully opened native owner.
- A disappearing or externally disposed preview no longer updates its DOM when an in-flight request resolves.
- More readable EN/FR names are used for the priority destinations; the narrow-phone header wraps on a second row, not letter by letter.
- Failed launches retain the original objective and branch and provide a retry path, rather than implying the module opened.

## Executed checks

- `node tests/ask-church-objective-engine.mjs`: **PASS** (seven objectives, 26 paths, source gates, EN/FR and simulated handoffs).
- `node tests/ask-church-handoff-lifecycle.mjs`: **PASS** (racing clicks, nonvisible owner, failed navigation, exception recovery, publication gates and confirmed Apostolate scenario).
- `node --check src/learn/ask-church-guided-preview.js` and `node --check src/learn/ask-church-native-handoff.js`: **PASS**.
- Offline Chromium DOM exercise with a synthetic app bridge (no network): **PASS** for mobile and desktop, Confession flow, English/French controls, one simulated Prayer owner handoff, one simulated Mass Explorer handoff, and return to the same question branch. These are **isolated synthetic-host results**, not production-browser verification.

## Known limits and next gates

The test browser environment disallows navigation to both localhost and intercepted external test origins. To verify the real build, serve the existing repo preview or import the module inside a running development Ad Orientem shell. The isolated browser test uses inlined pure UI/router code and mocked native owners; it does not exercise lazy module imports, actual owner presentation, external links, device accessibility APIs or the installed app.

Before publishing any launcher, explicitly test:
1. `AO_APP_SHELL_V1.navigate` completed, native owner loaded, and app screen visible for all seven priority families.
2. A failed owner open leaves the chatbot recoverable and permits a retry.
3. The return chip is visible over the native module without obstructing critical controls (especially Confession and the 1962 Mass reader).
4. Return-to-conversation restores the same chosen objective and branch without requesting private information.
5. The read-only source adapter renders approved passages and real provenance; unpublished Apologetics/Church Crisis remain gated.
6. Keyboard focus, Escape/back action, phone safe areas, screen reader semantics and EN/FR editorial parity pass review.

No public launcher, canonical doctrinal text, Mass card map or Confession step sequence was modified by this increment.
