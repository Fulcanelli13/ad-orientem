# Ad Orientem Mass reader — active ownership and legacy-retirement register

**Status:** ACTIVE reader implementation contract, 22 October 2026.
**Runtime source of truth:** `src/mass/browser-entry.js` → `mountR17Preview` → `src/mass/reader-native-preview.js` → `prepareNativeReaderPreview` → `src/mass/reader-live-curated-cards.js`.
This register supersedes any *active product* assertion that the ordinary LIVE reader is 46 or 48 cards. It does not rewrite the 1962 Mass source texts, the reader's 39 Sung source sections or the separate 30-section Missal/Simple source models.

## Production reader ownership

| Concern | Active authority | Operational rule |
| --- | --- | --- |
| Ordinary Sung LIVE | `projectCuratedOrdinaryLiveCards` in `reader-live-curated-cards.js` | **65 source-backed presentation cards**; ordinarily 64 visible when the optional second Confiteor is omitted. Per-day independently sourced pre-Gospel sequences can add cards; a certified pre-Mass Introit entry can omit Foot-of-Altar cards. Do **not** assert a universal literal 65 DOM-card count for every day/rite. |
| Public entrypoint | `mountR17Preview` in `browser-entry.js` | Always call the **single** native reader. No `aoLiveCards=48`, `aoLiveCards=65`, persisted old mode or arbitrary query can select a competing reader. |
| Native mount | `mountNativeReaderPreview` | Always request curated-family presentation where source/model/rite eligibility allows. Failed eligibility is **not** grounds to fabricate cards or borrow rubrics from another form. |
| Source ownership | `reader-model.js`, canonical Sung/Low corpora, `reader-cue-state.js` and `reader-form-state.js` | Retain immutable source paragraphs and `AO.SM.C####` cue ownership. The 39-source Sung model and 30-section Missal model are **not** competing LIVE card products. |
| Special rites and transitions | Native special-structure handlers; `reader-mode-switch.js` | Separate certified Good Friday, Easter Vigil, Requiem, Solemn, Corpus Christi, Palm, Ash, Candlemas and Rogation conditions must not be forced into an ordinary 65-card count. |
| Layout and ceremony | `reader-dom.js`, `reader-objective-context.js`, `reader-rubric-presentation.js` | Keep precise inline rubrics, objective context, translated Mass text, posture/priest rails, verified icon owners, and conditional events. No private prayer prompts or obsolete Guide panel. |

## Verified removal: public 48-card rollback

The October 2026 source contained a `?aoLiveCards=48` public rollback and a `?aoLiveCards=65` native opt-in alongside a browser-default curated path. Both query-based selectors are now retired. Regression checks in `tests/browser-entry.mjs` and `tests/mass-phase12-curated65-contract.mjs` must reject their return.

## Dependency-protected files — not yet deletable

| File or evidence | Classification | Reason |
| --- | --- | --- |
| `src/mass/reader-live-product48.js` | **SUPPORTING HISTORICAL COMPATIBILITY — no public selection** | Still imported by `reader-native-preview.js` and `reader-mode-switch.js` for noncurated fallback and by historical tests. Removing it now would require form-by-form migration and regression verification. It is **not** the normal reader. |
| `tests/reader-live-product48.mjs`, historical sections of `tests/reader-native-preview.mjs` / `tests/reader-mode-switch.mjs` | **HISTORICAL / SUPPORTING** | Assert internal compatibility only. They must not be cited as certification of the ordinary production UI; retire with the fallback module after parity. |
| `data/presentation/reader-release-gate.v1.json` 48-card historical markers | **HISTORICAL RECORD** | Historical research/release evidence, not a product selector; preserve provenance until the release ledger is explicitly versioned. |
| `src/mass/reader-guide.js`, `src/mass/reader-preview.js`, `src/mass/reader-shadow.js` and older donation/demo assets | **REQUIRES DEPENDENCY TRACE** | Names alone are insufficient to infer safety of deletion. Preserve until all runtime, accessibility, print and regression importers have been checked. |
| Historical 46 references to `46px` navigation geometry / `mass-v46` artwork | **NOT CARD COUNTS** | Do not rename navigation pixel dimensions or approved asset-generation IDs to solve a card-count issue. |

## Before retiring internal 48 compatibility

1. Build an evidence table for each noncurated native Mass type currently falling through `projectSourceFirst48Presentation`: source model, rendered cards, voice/icon/gesture state, exceptional rite conditions and entry/exit.
2. Replace the fallback with a **form-certified** reader projection, or fail closed when genuinely unsupported. Never silently substitute an unverified 39-card navigation experience.
3. Remove the `reader-live-product48.js` import from both native preparation and mode switching; update direct `prepareNativeReaderPreview`/mode-switch tests and preview crosswalks to new certified expectations.
4. Delete the retired projector and its dedicated compatibility tests **in the same tested PR**. Keep historical decision notes in archival documentation only.
5. Run `npm test`, `npm run test:phone`, required reader release gates, and real phone acceptance for ordinary Sung, Low, Solemn, Requiem and selected special days before merging.

**Deletion rule:** zero active imports + proven replacement for every reachable route + test parity. A filename containing `48`, `v46` or `legacy` is not itself a deletion criterion.
