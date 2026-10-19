# Ad Orientem — A2 Harmonized Serif Typography
## Approved design direction and detailed typographic specification
**Date:** 2026-10-19  
**Status:** A2 direction approved by the product owner; sizes and hierarchy established here for subsequent visual/regression acceptance. **Specification only. No changes to production CSS, font files, tokens, defaults, Mass content, or runtime.**

### 1. Approval and scope
A2 is the **serif-only harmonization** direction, not the earlier Inter/Source Sans 3 experiment. The prior sans-serif experiment (PR #1488) is superseded and closed unmerged. Do not interpret the temporarily opened font-trial PR as a typography requirement.

Only two typeface families express text roles:

1. **EB Garamond** — all ordinary copy and everyday interface typography: prayers, Scripture, Latin and vernacular, editorial prose, catechism, ordinary page headings, subtitles, day/feast labels, dates, navigation, ribbons, buttons, segmented controls, badges, metadata, source citations and settings. Use real typographic weights (400/500/600) and spacing to differentiate roles.
2. **Cinzel** — **only** the Ad Orientem wordmark/brand identity and the **major Mass-section display headings**. Not all H1s, not individual Prayer cards, not ordinary calendar headings, not every module's page title, not tabs/buttons/cues/metadata. Typical brand and section weights 500–600.

Avoid Georgia as an intentionally selected alternative between screens, and avoid new sans/system UI font rules. Georgia/Times are **last-resort fallback fonts**, not an aesthetic third typeface. Fonts used to draw icons, symbols, numbers inside a vector asset, or a liturgical symbol do not count as UI copy and must be preserved.

The **sacred aesthetic** continues to depend on deliberate hierarchy, spacious composition, liturgical colour, restraint, artwork and precise ceremonial action cues — not ornamental font changes on each card.

### 2. Font stacks — design authority, not implementation instructions

- `A2_TEXT = 'EB Garamond', Georgia, 'Times New Roman', serif`
- `A2_DISPLAY = 'Cinzel', Georgia, 'Times New Roman', serif`
- `A2_UI = A2_TEXT` (no system sans UI fallback ahead of EB Garamond)
- `A2_LATIN = A2_TEXT`
- `A2_VERNACULAR = A2_TEXT`

The existing `index.html` already requests Cinzel (500–700) and EB Garamond (400–600, including italic), and core `ao-inline-9b454ca264abe91ceeb8.css` has `--font-display` / `--font-liturgical` variables. The existing `src/app/design-system.js` **does not yet implement A2**: `--ao-font-ui` is system sans and it assigns a display family to numerous ordinary headings. Its styles are deliberately untouched by this documentation change.

### 3. Exact type scale — CSS px at 100% text scale

Use three checkpoints, with **320px phones**, **390px standard phones**, and **≥768px wider layouts**. Interpolate smoothly if required, avoiding breakpoints that cause perceptible jumps. "Size" is CSS px (not font-file points). Line-height is a unitless multiplier. Letter spacing is in `em`.

| Role / suggested token | Typeface | 320px | 390px | ≥768px | Weight | Line-height | Letter spacing |
|---|---|---:|---:|---:|---:|---:|---:|
| Brand wordmark `type-brand` | Cinzel | 18 | 20 | 22 | 600 | 1.16 | +0.075 |
| **Major Mass section title** `type-mass-display` | Cinzel | 24 | 27 | 32 | 500 | 1.20 | +0.020 |
| Standard page H1 `type-page-title` | EB Garamond | 27 | 30 | 34 | 500 | 1.14 | 0 |
| Section heading H2 `type-section-title` | EB Garamond | 23 | 25 | 28 | 600 | 1.22 | 0 |
| Card / sub-section H3 `type-card-title` | EB Garamond | 20 | 22 | 24 | 600 | 1.26 | 0 |
| **Mass LIVE current/focus Latin** `type-mass-focus` | EB Garamond | 22 | 24 | 26 | 500 | 1.53 | 0 |
| Mass LIVE surrounding words `type-mass-context` | EB Garamond | 18 | 19 | 21 | 400 | 1.55 | 0 |
| Guided Prayer recitation text `type-prayer` | EB Garamond | 20 | 22 | 24 | 400 | 1.59 | 0 |
| Missal dual-column reading text `type-missal` | EB Garamond | 18 | 19 | 21 | 400 | 1.58 | 0 |
| Scripture verse / paragraph `type-scripture` | EB Garamond | 19 | 20 | 22 | 400 | 1.67 | 0 |
| Long explanatory/catechetical prose `type-prose` | EB Garamond | 17 | 18 | 19 | 400 | 1.57 | 0 |
| Brief instructions / descriptions `type-secondary` | EB Garamond | 16 | 17 | 18 | 400 | 1.45 | 0 |
| Congregational / priest / schola cue `type-cue` | EB Garamond | 15 | 16 | 17 | 600 | 1.32 | +0.005 |
| Primary action buttons `type-button` | EB Garamond | 16 | 16 | 17 | 600 | 1.22 | +0.010 |
| Tabs, ribbon navigation `type-navigation` | EB Garamond | 14 | 15 | 16 | 600 | 1.22 | +0.020 |
| Metadata / eyebrow / liturgical day labels `type-meta` | EB Garamond | 13 | 14 | 14 | 600 | 1.32 | +0.025 |
| Sources, citations, help and notes `type-source` | EB Garamond | 13 | 14 | 14 | 400 | 1.45 | 0 |
| Verse numbers / card counters `type-counter` | EB Garamond | 13 | 14 | 14 | 500 | 1.30 | +0.015 |

**Minimum:** Ordinary *visible* metadata or source text must not fall below **13px at 100% scale**. Existing 10–12px textual labels should be identified for later migration. Do not use 13px as a target for longer body reading.

**Do not alter the underlying reader's source-owned text, emphasis boundaries, paragraph hand-offs, ceremonial postures or rules** when modifying future font declarations. Icons/ceremonial imagery have independent dimensions and are excluded from this font scale.

### 4. Hierarchy rules and representative screens

1. **Identity is rare:** Cinzel appears in the app wordmark, brand moments, and major Mass section headings (e.g. *The Canon of the Mass*). **No repeated Cinzel card labels**. A page has one clear dominant H1.
2. **Today / Home:** the brand may use Cinzel 20px; the feast/day H1 uses EB Garamond 30px; secondary headings 25px; Gospel snippets 20px; metadata 14px; five-slot ribbon 15px. Avoid making the calendar/week headers compete with the feast.
3. **Mass LIVE:** Cinzel 27px **only on major section headings**; current recited text EB Garamond 24px; adjacent context 19px; actor/voice labels EB Garamond 16px; compact rails and time-critical cues remain visually distinct through positioning/iconography and liturgical emphasis, not a second font. Preserve existing 48-card LIVE concept and actual production mapping; this type spec does not re-author card counts or Mass rubrics.
4. **Missal Reading:** EB Garamond 19px in both columns at standard mobile width, increasing to 21px on wider screens. Latin and vernacular get **equal typographic authority** unless canonical rubrics intentionally emphasize a sacred formula. The layout must remain responsive; do not force unreadably narrow side-by-side text at 320px.
5. **Prayer Library / Rosary / Stations / Novenas:** one EB Garamond 30px page title; step/card headings EB Garamond 22–25px; prayer text 22px; speaker cues 16px; metadata 14px. Avoid a second inner header for a one-card prayer. Flip translation replaces language in the existing region, not a new stacked copy.
6. **Scripture:** book H1 EB Garamond 30px; section/chapter H2 25px; verses 20px at 390px with 1.67 line-height; verse numerals at 14px. Explanatory passages 18px. Scripture is text-led, not visually overrun by page furniture.
7. **Formation / Saints / Explore:** EB Garamond 30px H1, 25px H2, 18px prose, 14px source/metadata and 16px controls. The fact sheet and source footnotes must remain easily readable.
8. **Calendar:** liturgical occasion/title 25px, month section heading 25px, day cell numerals 18–20px where grid size permits, date labels 14px, navigation 15px. Dense grids retain 44px accessible hit targets even though font is compact.
9. **Settings / Apostolate / standalone tools:** EB Garamond for **every** visible text role, including navigational labels; 30px page title, 18px explanation, 16px controls, 14px metadata.

### 5. Interaction, language and accessibility constraints

- **No typography as gamification:** progress/status indicators remain subdued; liturgical importance comes from actual source content and cues, not indiscriminate boldness.
- **Latin accents and symbols:** confirm macrons, stress accents, æ/œ, ℣./℟., punctuation, small caps and italic witness quotations with real font glyph coverage. Avoid forcing uppercase on passages that are not headings.
- **No script-independent blank states:** EB Garamond fallback when offline must be legible and never hide text/cues.
- **French expansion:** titles, ribbons, labels and source drawers must wrap or reflow; no clipping at 320px. Compare French and English with representative long labels.
- **Accessibility:** support 200% text zoom and existing text scale preferences without clipped rubrics or hidden action buttons. At least 44×44 CSS px interactive tap areas, independent of label size.
- **Reading comfort:** preserve scroll focus ownership, translations in place, semantically accurate versicle/response rendering, and generous long-text line height. Paragraph width target about 50–65 characters on wide screens (subject to dual-column Missal).
- **Source metadata:** exact provenance remains readable (≥13px), not reduced to microtype to keep decoration compact.
- **No unapproved fallback switches:** UI text must not intentionally swap to system sans within sections; if fonts are unavailable, Georgia/Times fallback is a technical consequence, not the target presentation.

### 6. Relationship to current design variables (future mapping only)

This is a **prospective** migration table, **not code to run now**:

| Existing variable or selector | Planned A2 ownership |
|---|---|
| `--font-display`, `--ao-font-display` | Cinzel **only when invoked for brand or major Mass heading** |
| `--font-liturgical`, `--ao-font-liturgical` | EB Garamond |
| `--font-body`, `--ao-font-body` | EB Garamond |
| `--ao-font-ui` | EB Garamond — future replacement of system sans |
| Current blanket H1–H4 display-family selectors in `src/app/design-system.js` | Later narrow to actual Cinzel-exclusive roles; ordinary headings EB Garamond |
| `--ao-type-ui-xs`, `--ao-type-ui-sm` | Later harmonize visible labels to ≥13px (maintain density through padding/spacing) |
| Explicit `Georgia,serif` and `system-ui,sans-serif` in Prayer/Scripture/card CSS | Later map to semantic A2 roles, **not blind global search-and-replace** |

Existing CSS/JS, loaded font links and runtime CSS variables remain completely unchanged by this document.

### 7. Release gates and approval boundary

A2 **direction** is approved; actual production adoption remains a separate implementation milestone. Before applying even one A2 font change:

- Produce authentic app captures on Today, LIVE, Missal, Prayer, Scripture, Calendar, Formation and Settings at 320px, 390px and desktop; compare the new role hierarchy with the current baseline.
- Check real font load, family, size, weight, line-height, text overflow, contrast and glyph coverage for Latin, English and French. Verify accessibility zoom and offline fallback.
- Ensure user-approved cinematic cues, bells, actor rails, selected Mass Propers, Prayer source attribution and Scripture exact text are unmodified.
- Stage updates in small semantic style PRs with phone/desktop screenshot gates and regression tests; no automatic app-wide font replacement.
- **Do not mark A2 implemented, ship a new default font, or alter existing font files on the strength of this document alone.**

### 8. Decision register

- **Approved:** A2 harmonized serif concept, EB Garamond for ordinary content + UI, restricted Cinzel for brand and major Mass headings; unified sizes and clear role hierarchy as specified above.
- **Superseded:** sans-serif-first Inter / Source Sans 3 comparison proposal and unmerged PR #1488.
- **Preserved:** existing production fonts/CSS, colours, canonical content, translations, all reader owners and Mass ritual logic.
- **Next implementation stage:** visually verify this scale in real app previews and apply only in a separately reviewed change.
