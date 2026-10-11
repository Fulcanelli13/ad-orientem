# Ad Orientem — UI coherence contract · 2026-10-11

**Status:** Integration candidate, not a visual-acceptance certificate.
**Owner:** Shared app shell/design system. Mass, Prayer, Calendar, Formation and Explore retain ownership of their source content and domain state.

## Permanent navigation language

| Meaning | Canonical role | Icon | Behaviour |
|---|---|---|---|
| Return | `back` | `ao-ui-back` | Previous actual screen or module parent; do not silently imply Today |
| Dismiss | `close` | `ao-ui-close` | Close the current sheet, retaining the screen underneath |
| Today | `home` | `ao-nav-home` | Explicit journey to Today; never an ambiguous replacement for Back |
| Sequential backward | `previous` | `ao-ui-previous` | Previous passage, card, step or day **within the same owner** |
| Sequential forward | `next` | `ao-ui-next` | Next passage, card, step or day **within the same owner** |
| Settings | `settings` | `ao-ui-settings` | Utility overlay, not one of the five primary destinations |

Icons, action names and English/French accessible labels are owned by `src/app/interface-grammar.js`. Modules keep their existing click handlers and data-action selectors. The shared grammar does **not** override source-aware routing.

The five primary global destinations remain Today, Mass, Pray, Formation and Explore. Calendar belongs to the Today/time context and Settings to utility navigation. A distinct module's Home control always means Today, not “somewhere up”.

## Three screen families

1. **Prayer/reader:** Mass, Angelus, Rosary, Stations, Benediction, Novenas, Confession and Prayer Library share readable typography, clear role cues, section title and previous/next semantics. Sequential position is never a spiritual score or proof that prayer occurred.
2. **Browse/study:** Formation, apologetics, Scripture, prayer catalogues and settings share searchable hierarchies, disclosure design, back/close semantics and compact topic navigation. Bible passages and commentary remain readable in place.
3. **Spatial/time exploration:** Calendar, liturgical year and Explore use appropriate wheel/map/timeline displays; they retain the shared typography, Back/Close roles and accessible touch controls but are not forced into a prayer reader.

## Visual rules

- Background and surface neutrals are universal. Selected Proper/celebration owns Mass liturgical accent. Calendar owns day projection. Semantic Explore map category colours must never be mistaken for liturgical colours.
- Sacred text uses the liturgical serif; headings use the display serif; UI and counters use neutral sans. The app type-scale tokens are authoritative. Avoid feature-specific micro-sizes and extra branded kickers.
- Normal top-header command glyphs are 22px within **44 × 44px** touch targets. Use canonical asset-bank masks, not text arrows, emoji or inline lookalikes. Small text and icons should remain legible on a 320px phone.
- The top Mass ribbon is the persistent posture/position source. Side rails show transient cues. Do not duplicate one posture in both ribbon and permanent left rail.
- The current liturgical text is more important than banners, titles, filters, buttons, Schola or progress indicators. Inactive navigation chrome must not obscure reading or steal swipe gestures.
- Motion is optional and respects reduced-motion preferences. Vertical touch is native scroll; horizontal gestures affect a reader only in its owning explicit gesture area. Map pan/zoom must remain independent.

## Required integrated journeys

- Today → Mass → Back/exit or resume, preserving LIVE session consent.
- Today → Calendar → Proper → Mass → return to the originating day.
- Pray → Novena → proper day → previous/next → back to that Novena, not Today.
- Pray → source-linked Scripture/context/commentary → return at the same prayer context.
- Formation → passage/reference → return to the selected topic.
- Explore → map pin → preview → details → return to the **same map centre, zoom, filters and selected category**.
- Explore vertical scroll and map drag must not trigger accidental category changes.
- Settings opened while Mass LIVE must behave as an overlay, without silently abandoning the live session.

## Implementation notes — continuity pass

The integration branch now includes scoped in-memory state preservation for two
previously destructive app-shell journeys:

- **Explore:** shell-driven module exit captures the MapLibre camera before
  destroying the canvas. Returning without an explicit new destination restores
  centre, zoom, lens, filters, search, selected pin, preview and scroll; a new
  lens/search/deep link intentionally supersedes the old selection. Nothing is
  persisted to device storage. The responsive phone test checks
  Explore → Today → Explore at 320, 390, 430 and 768px.
- **Formation:** the app shell passes a `preserveContext` request to the
  Formation owner when changing domains. Its selected subject family, search
  and hub scroll return on re-entry; an explicit owner close still clears them.
  Specialist course/question child owners remain responsible for their own
  reading position. A 320px journey test exercises Formation → Today → Formation.
- **Visual QA:** Coming Up must show three real canonical assets, allowing both
  embedded SVG and masked artwork. The Calendar day may show its saint-detail
  action only when the observed principal cycle is sanctorale.
- **Mass:** its canonical top-ribbon Home/Settings masks now agree with the rest
  of the app. Native Schola drag/hide state ownership is deliberately
  unchanged pending actual responsive visual approval.

**These are localized continuity fixes, not a general cross-module browser
history implementation.** Context-aware Back from every child reader and
Schola viewport ergonomics remain open acceptance work.

## Scoped follow-through — user priorities

- **Mass LIVE is frozen.** No change to its 48-card content mapping, faithful posture/gesture cue ownership, celebration selection, Schola ticker controls, or animated elevations.
- **Mass MISSAL is intentionally a different reading experience:** paired Latin left and source-backed vernacular right in each aligned row, including originally replace-on-tap translations. No fabricated parallel translation, no event-driven scroll cue switching, persistent posture ribbon, Schola overlay or cue progress clutter. Rubrics are quiet full-width book annotations. Passage anchors are preserved across mode switches; mobile typography matches the liturgical serif rather than platform-dependent sans/italic spans. The native source model continues to own the 30 Missal sections. Dedicated real 320/390/768px phone checks cover both languages.
- **Mass settings and section menus:** larger, coherent control typography and titles; native options remain owned by Mass.
- **Non-Mass contextual Back:** `src/app/shell-controller.js` now retains a small, bounded in-memory destination trail; `back()` returns to the last successful app surface without echoing it back into history. Prayer's own inner stack, Formation families, Calendar day/week, and Explore sheets still have priority. Home remains an explicit destination. No app location or private query is persisted.
- **Explore and Formation continuity:** host and Home cleanup both preserve their source-owned in-memory return context. Calendar, Explore, Prayer and Formation root Back use the shell trail; Settings Close remains a dismissal, not a Back.
- **Parallel pipeline reconciliation:** current `main` place media, photo review and other source data are included; only the scoped Explore header, return-state and phone-contract edits were reapplied to their newest versions.

**Remaining review, not a claim of certification:** actual 320/390/768px phone appearance, translated Missal columns with long text, body-font appearance in rendered device screenshots, and domain-specific settings/overlay dismissal. CI must pass on the final merged-base commit before marking these done.

## Acceptance gates

Test at 320px, 390px and tablet/desktop widths, in French and English, with different liturgical colours. Verify geometry, source text, tap targets, preserved return state, actual on-screen icons and Back/Close distinction; source tests alone are insufficient.

**Known remaining gaps:** full cross-module return-position fidelity still needs journey-level certification; Schola overlay, map/filter visual crowding and text hierarchy still need screenshot sign-off. A passing code suite is not equivalent to an approved UI.
