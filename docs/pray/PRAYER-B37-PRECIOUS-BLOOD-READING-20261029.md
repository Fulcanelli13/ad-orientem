# Prayer B37 — source-first Precious Blood phone reader
29 October 2026

## Audited state
The existing Precious Blood chaplet is not the unresolved short version. It is the full Raccolta-based **seven-mystery, 33-Our-Father** reader with seven Glory Bes and seven responses. The 1910 historical English meditation and closing prayer, original Latin response where a certified French text is unavailable, and original "etc." qualification remain explicit. The contradictory 35-vs-33 short transcription remains held.

The source prayer already uses a responsive 19px minimum serif; do not shrink the text. At narrow phone widths, however, the existing action footer follows the full source prayer and the top rail, headings and margins delay the first actual prayer into the lower viewport. The previous/continue buttons are not thumb-reachable while reading.

## B37 correction
- Reuse the existing `.aoPreciousBloodActions` only (no replacement buttons). Apply sticky bottom with an opaque background, 48px+ flexible touch targets, keyboard-focus outline and safe-area inset.
- Compact only ≤420px paddings, rail spacing and decorative margins. Preserve the whole 7-mystery jump rail, correct individual prayer count, original text/locale, meditation toggle, and source notes.
- Keep the historical source disclaimer and non-current indulgence limitation; source variants are not fabricated or harmonized.
- Do not change Litany of the Saints: its 1883 private English/1862 private French and uncollated public Latin/French rites have distinct certification gates. Litany needs a separate reader-specific visual audit.
- No new assets, dependencies, subscriptions or paid services.

## Acceptance
The existing `test:pray-owner` already runs B18 historical source integrity. Extend its static contract to ensure the original 33 Pater / 7 Gloria / 7 responses, no short-form promotion, and unchanged 19px prayer CSS remain intact.

Extend `tests/pray-chaplets-discovery-phone.mjs` at both 320px and 390px to check that the entire first historical opening source line is visible above the action dock (at least 90% of its measured line box, and 26px minimum at phone widths), that the original Previous/Continue remains pointer-reachable even after scrolling, that each target is at least 48px high, that text stays 19px+ and there is no horizontal overflow. Continue checking step 2, bead changes, seventh mystery, Latin prayer, original source and other family cards.

A dedicated GitHub Actions workflow reuses that phone test and uploads temporary three-day screenshots. Inspect images before final UI approval. Required Main and this targeted phone workflow must be green before merging; verify Vercel READY on the exact merge commit.

## Remaining
Separate pass: Litany of the Saints private-source reader typography and guided section navigation; do not assert a full public 1962 edition without source collation.
