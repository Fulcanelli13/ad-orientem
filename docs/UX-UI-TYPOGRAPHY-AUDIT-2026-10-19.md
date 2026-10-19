# Ad Orientem — Typography and font consistency audit

**Date:** 19 October 2026. **Status:** source-level first pass, **not yet computed-font visual certification**. This supplements `docs/UX-UI-CONSISTENCY-FLAG-REGISTER-2026-10-19.md`. No typographic text or canonical prayer content has been changed.

## Canonical type intent and authority

- `ao-inline-9b454ca264abe91ceeb8.css` sets `--font-display: 'Cinzel', Georgia, 'Times New Roman', serif` and `--font-liturgical: 'EB Garamond', Georgia, 'Times New Roman', serif`. `index.html` requests both through Google Fonts; its body uses `var(--font-liturgical)`.
- `src/app/design-system.js` defines `--ao-font-display`, `--ao-font-body`, `--ao-font-liturgical` and `--ao-font-ui`, plus sizes `--ao-type-ui-xs:11px`, `--ao-type-ui-sm:12px`, `--ao-type-ui:14px`, `--ao-type-body:16px`, `--ao-type-prayer:clamp(16px,2.4vw,20px)` and `--ao-type-prose:16px`.
- The app's visual contract remains a restrained sacred hierarchy: display for titles, liturgical text for prayer/scripture/transcriptions, system sans for control metadata, with one agreed prose family for catechetical/informational paragraphs. Distinct literary roles are intentional; arbitrary font changes between equivalent roles are not.

## Source evidence and flags

| ID | Scope | Priority | Confirmed evidence | Required next step |
|---|---|---|---|---|
| TYPE-01 | **Prayer card headers, timelines, single-prayer text** | **P1 typography convergence** | `src/pray/devotional-card-deck-styles.js` declares `.aoDevoCardTitle{font:500 clamp(23px,5.6vw,30px)/1.18 Georgia,serif}` and `.aoDevoStopTitle{font:500 12px/1.25 Georgia,serif}`; Prayer Library text `.aoP435930Flip/.aoP435930Text` uses `font:400 clamp(18px,4.5vw,22px)/1.65 Georgia,serif!important`. These ignore the role tokens and force different families/sizes from app-owned headers and prayer text. | Verify computed family at 390px for main heading, card heading, prayer prose and Latin/vernacular surfaces. Use the existing role tokens, protecting source formatting, cue emphasis and line readability. |
| TYPE-02 | **Divine Mercy and other special Prayer methods** | **P1 typography convergence** | `src/pray/devotional-methods-styles.js` has 21 font declarations but **no `--ao-font-*` family token usage**; examples: `.aoMercyPrayer{font:400 clamp(1.35rem,4vw,1.8rem)/1.65 Georgia,serif}`, `.aoMercyBeadPosition>small{font:11px/1.3 system-ui,sans-serif}`. | Map roles to liturgical/metadata tokens, keep bead hit-target sizing and compact ribbon behavior, inspect EN/FR changes and 320px wraps. |
| TYPE-03 | **Scripture full-screen library** | **P1 source consistency, P2 visual verification** | `src/scripture/styles.js`: `.aoScriptureLibrary{...font-family:Georgia,"Garamond",serif}` and `#ao-scripture-overlay` direct literals; the family list prefers Georgia over `"Garamond"` on systems with Georgia, so it does not specifically select loaded **EB Garamond**. Only 3 `--ao-font-ui` uses among 37 font declarations. | Compare actual Bible text, headings, verse labels and metadata with Prayer/Liturgical reader, then apply explicit shared roles without flattening Scripture editorial hierarchy. Test 320/390px. |
| TYPE-04 | **Microscopic metadata in Prayer / some catalogue cards** | **P2 accessibility and consistency** | `src/pray/devotional-card-deck-styles.js` sets `.aoDevoCardNumber{font:600 10px/1.4 system-ui,sans-serif}` and other 10px labels; `src/find/saints-presentation.js` has direct 10px/11px declarations. The shared `--ao-type-ui-xs` token is 11px, and design system explicitly says not to invent new micro-sizes. | Audit computed mobile labels, contrast and wrap; use approved XS/SM scale, with exceptions documented rather than silently enlarged where dense maps need it. |
| TYPE-05 | **General prose family across modules** | **P2 governance decision** | The core CSS sets `--font-liturgical` and `--font-display`; no `--font-body` definition was found in `index.html` or the core `ao-inline-9b454ca264abe91ceeb8.css`. The app token `--ao-font-body:var(--font-body,Georgia,"Times New Roman",serif)` thus falls back to Georgia *unless another stylesheet defines `--font-body`*. Meanwhile the global body explicitly uses EB Garamond. | Confirm computed family across body, Home, Formation, Apostolate and Settings. Decide whether informational prose should deliberately be Georgia or EB Garamond; then define and enforce one canonical `--font-body` instead of inheriting by chance. |
| TYPE-06 | **Offline and font loading** | **P2 verification gap** | `index.html` requests Cinzel/EB Garamond from `fonts.googleapis.com`; it has fallbacks. Source review alone does not prove fonts are packaged/cached for fully offline operation or that they do not swap during load. | Add warm-offline and cold-offline computed-font/fallback checks, ensuring readable first frame and no page reflow that hides ritual controls. Do not claim currently broken without an offline replay. |

## Twelve-module source census (declarations, not rendered pixels)

| Stylesheet | Font declarations | Shared `--ao-font-*` references | Assessment |
|---|---:|---|---|
| `src/app/design-system.js` | 8 | 7 | Canonical; one intentional inheritance rule |
| `src/home/today-v2-styles.js` | 28 | 28 | Mostly follows display/UI font tokens |
| `src/calendar/calendar-runtime.js` | 54 | 52 | Mostly follows tokens; two literal exceptions |
| `src/pray/devotional-card-deck-styles.js` | 28 | 4 | Significant legacy font divergence |
| `src/pray/devotional-methods-styles.js` | 21 | 0 | Significant legacy font divergence |
| `src/learn/formation-ui.js` | 12 | 12 | Shared roles substantially adopted |
| `src/learn/traditional-life.js` | 19 | 7 | Mixes legacy `--font-*` with new tokens |
| `src/find/heritage-style.js` | 77 | 77 | Font roles mostly shared despite independent colours |
| `src/find/saints-presentation.js` | 32 | 32 | Font roles mostly shared; micro-type to review |
| `src/scripture/styles.js` | 37 | 3 | Distinct mostly literal font system |
| `src/settings/presentation.js` | 11 | 11 | Shared roles substantially adopted |
| `src/apostolate/presentation.js` | 17 | 17 | Shared roles substantially adopted |

**Method:** simple source-string extraction of declarations using `font:` and `font-family:`; role-token references are a broader string count, *not* declaration-matched conformance and cannot prove runtime cascade, font download, computed font or contrast. For embedded source strings, this is a prioritization inventory rather than a pixel-level score. Fonts can legitimately differ by **function** (display, liturgical/prose, interface), not by route.

## Acceptance and implementation order

1. **Computed baseline first:** Capture actual `getComputedStyle(element).fontFamily`, `fontSize`, `lineHeight`, `fontWeight`, `letterSpacing`, `document.fonts.check()` for canonical title, prayer, body, metadata and control selectors on real device-width 320/390/desktop snapshots. Include EN/FR, larger system text, reduced motion and low-connectivity samples when possible.
2. **Do not global-replace Georgia.** First establish which uses are actually liturgical texts versus catechetical prose; preserve the Cinzel/EB Garamond hierarchy and any intentional provenance/sermon/source material distinctions.
3. **Converge Prayer typography:** Prioritize TYPE-01 and TYPE-02, separate from active navigation PRs #1478 and #1481. Keep semantic speaker tokens and bilingual flip behavior intact.
4. **Inspect Scripture, then converge:** Honor its page/verse editorial hierarchy, prayer/scripture emphasis and existing full-screen ownership. Adopt shared font tokens if visual tests show unnecessary divergence.
5. **Resolve general body font token and XS:** Define a single body font decision and replace subscale 10px metadata with role tokens as appropriate; add regression assertions rather than a repeated manual audit.
6. **Verify runtime and offline:** check font downloads and fallback behavior with the existing PWA phone tests. No requirement to distribute proprietary or binary font files via ChatGPT artifacts.

**Status:** these are **source-confirmed divergence findings**, not a claim that every screen looks wrong. No visual/functional corrections are marked complete until their mobile computed-style and interaction gates pass.
