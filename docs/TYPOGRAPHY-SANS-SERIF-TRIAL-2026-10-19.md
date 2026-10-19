# Sans-serif-first typography comparison — 19 October 2026

**Status:** controlled A/B test only; **not a production typography change**. No preference is saved. Unless the preview query is present, the app loads and styles exactly as before.

The editorial question is whether removing Cinzel/Georgia/EB Garamond in favor of one contemporary but restrained sans-serif family improves visual harmony across Ad Orientem, especially between the sacred Mass reader, home frontispiece, individual prayers and Scripture.

## Open a real app comparison

On any deployment containing this change, append one of these query parameters to the actual app URL:

- `?aoTypographyTrial=inter`
- `?aoTypographyTrial=source-sans-3`

With a pre-existing query, append using `&aoTypographyTrial=...`. An opt-in bottom dock switches **Original · Inter · Source Sans 3** without leaving the current screen. It can be hidden. The chosen trial **does not persist**, does not change Mass/Prayer settings and does not write to canonical datasets.

A production URL **without** the exact query remains on the original typography. This is especially important on the Mass LIVE reader; do not confuse the preview family with a liturgical-text correction.

## CI screenshots: the same actual page, three families

The existing Visual acceptance workflow now writes these real browser screenshots at **390 × 844**:

| Screen | Original | Inter | Source Sans 3 |
|---|---|---|---|
| Today | `type-today-original.png` | `type-today-inter.png` | `type-today-source-sans-3.png` |
| Mass LIVE | `type-mass-live-original.png` | `type-mass-live-inter.png` | `type-mass-live-source-sans-3.png` |
| Prayer Library (Act of Contrition) | `type-prayer-original.png` | `type-prayer-inter.png` | `type-prayer-source-sans-3.png` |
| Scripture overlay | `type-scripture-original.png` | `type-scripture-inter.png` | `type-scripture-source-sans-3.png` |

Each `type-{screen}.json` reports computed `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and webfont loading status. If Google Fonts fails to load, **the screenshot is only a fallback**, and must not be judged as Inter or Source Sans 3.

These captures are from the actual DOM and layouts, not mockup re-creations. They are not proof that every screen in the app is coherent; the other routes will be sampled after selecting a family.

## Acceptance criteria

1. The same screen must keep its layout, content, columns, rails, icon ownership, language and focus state across font variants. Typeface is the independent variable.
2. Check text legibility: at least one full Latin prayer, English/French translations, compact cue labels and an extended Scripture paragraph.
3. Compare overflow, line wrapping, clipping and apparent density at **320px and 390px**, then wide desktop before adopting a family.
4. Keep the existing liturgical accent palette and visual restraint; do **not** compensate for new fonts by adding decorative colours or oversized controls.
5. Original remains the production default until the user explicitly approves a family and source-owned role mappings are implemented/tested in separate PRs.
6. Do not claim a font loaded based on screenshot appearance alone; read the recorded `fontStatus` and retry when blocked.
7. Do not globally override icon glyph fonts, SVGs or ceremonial cue images. Keep meaningful italics, source punctuation, speaker ownership and the two-column Missal layout.

The comparison is intentionally not a complete redesign or a Mass text migration.
