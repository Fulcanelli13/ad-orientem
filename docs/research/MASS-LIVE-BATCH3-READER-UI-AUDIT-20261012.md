# Mass LIVE — Batch 3 UI/UX ownership and presentation audit

**Scope:** current source-first 48-card LIVE reader. This is a code-backed audit, not a claim of acceptance on an actual Android device. It is restricted to `src/mass/reader-dom.js`, `reader-native-preview.js`, `reader-cue-focus.js`, `reader-icons.js` and existing form/gesture source registries.

| Surface | Actual implementation | Finding and action |
|---|---|---|
| Navigation and card identity | Top ribbon centre `section-jump` displays the current card title, opens section navigation; `prayer-title` inside the scrolling content is hidden intentionally. LIVE runs a 48-card presentation over its source model. | **Retain one title owner** rather than invent a second large title in the prayer content. Existing phone checks cover swipe, touch arrows and jump. |
| Paragraph focus and light/mute | `pickActiveCue` uses source cue IDs, a ~39% focus line, first/last hard boundaries and an opening-ramp for the first cues. LIVE stylesheet uses active opacity 1 and surrounding paragraphs visibly dimmed. | **Already implemented.** Do not replace precise source focus with linear percentage progression. End-of-card cases and short Ordinary paragraphs remain important phone regressions. |
| Faithful/left rail | Top ribbon owns persistent faithful posture. Left rail holds transient gesture, posture-change, response and LISTEN attention events. | **Defect fixed:** inactive ghost tiles must not take up space; left rail itself hides when none of its transient channels is active. No extra tiny icons attached to prayer titles. |
| Priest/right rail | Top ribbon owns priest location; right rail owns priest voice, action, bells and shared-Schola notice. Silent/public voice source is independent of gesture and priest movement source. | **Defect fixed:** remove empty rail; active pictograms expose exact current action in accessibility and long-press/hover labels, without adding visually redundant prose. |
| Icon bank | Exact priest/faithful action keys resolved through approved bank; donor SVG/PNG alpha transport can use currentColor masks, with an older fallback transport before loading. | **Preserved:** no new icon silhouettes or guessed replacements, no change in gesture source key ownership. **Pending:** visual device review of individual 1962 moment icons and icon size. |
| Schola | Own dock, translation and adjustable speed. Public Schola phrases and independent priest gestures use different event ownership; ticker stops when segment is complete. | **Already implemented:** no action added from Schola alone. **Pending:** real audible timing and devotional usability review (not automatic audio detection). |
| Cinematics and states | Canonical action, bells and elevation cinema are source-driven; navigation clears transient state; pronunciation and translated text remain separate. | **Existing architecture preserved.** **Pending:** visual review of visual salience and exact gesture timing, especially elevation and Communion, on physical phones. |
| Liturgical exceptions | Low/Sung/Solemn ownership differs; Requiem water-cross exception fixed by #1077. | **Preserved:** no changes to Mass texts, conditional customs, ministers or cues in this UI-only batch. |

## Batch 3 changes
- The rail container is **hidden** when all of its eligible transient channels are inactive. A persistent top-ribbon posture is not counted as a second left-rail card.
- Every inactive transient rail tile has `display:none`, `aria-hidden=true` and no stale hover/screen-reader label.
- Every active tile has a descriptive `role=img`/`aria-label` and `title`, derived from its current projected cue. The icon remains text-free visually, as requested.
- The same code reacts to scrolling/focus, card navigation and mode switching. No new actor clock or unobserved gesture is introduced.

## Acceptance
- `tests/reader-live-rails-phone.mjs` checks **320/360/390 px**, multiple canonical cards, no blank rails, correct role and labels, no stale inactive state, persistent posture deduplication, title and 48-card invariants.
- Existing `test:reader-dom`, `test:reader-rail-ownership`, `test:reader-cue-focus`, `test:reader-priest-chant-phone` and `test:phone` must continue to pass.
- Headless Chromium is not actual Android/physical touchscreen certification.

**Do not expand** this small visual patch into a new ceremonial-research pipeline. Reserve physical-device icon/salience decisions for the final acceptance campaign.
