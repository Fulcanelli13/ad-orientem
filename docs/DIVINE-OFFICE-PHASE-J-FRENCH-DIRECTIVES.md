# Divine Office — Phase J: French All Souls upstream directive diagnosis

**State:** research-only source-correction experiment. Source date 2026-11-02, Rubrics 1960 - 1960. Do not publish or promote these Office texts without independent liturgical and translation review.

## Exact source finding

Divinum Officium upstream commit `126a07f91ede04664108abb6fb20ace3f4de14b9`, [French All Souls file](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Francais/Sancti/11-02.txt):

- **15** calls of the form `&special(‘Initial’, ‘Francais’)` (typographic single quotes).
- Corresponding Latin/English files use `&special('Initial', 'Latin')` and `&special('Initial', 'English')` (ASCII apostrophes).
- The French file defines `[Oratio mortuorum1]`, `[Oratio mortuorum2]`, and `[Conclusio]`, but does **not** define Latin-file section names `[Initial]` or `[Oratio mortuorum]`.
- French Common of the Dead `web/www/horas/Francais/Commune/C9.txt` contains reusable prayers, but **it has not been proven** that a particular existing translation can replace the named All Souls missing proper. Do not automatically substitute anniversary-of-death or personal-name prayers.
- All eleven French source-cell missing markers from Phase I are real generated-text defects. The 15 syntactic calls are a strong testable cause candidate, **not proof** that every missing-cell marker arises from quotes.

Authoritative source syntax documentation: [Divinum Officium DataFileSyntax](https://github.com/DivinumOfficium/divinum-officium/wiki/DataFileSyntax). The French file also shares inherited text with the existing upstream French Common, so alternate French text cannot be invented merely to make section counts line up.

## Phase J controlled experiment

1. Generate the baseline **24** All Souls documents from the pristine pinned upstream checkout, with normalizer and complete explicit-placeholder audit; continue withholding **5** French preview pages containing **11** missing source markers.
2. In an **ephemeral CI checkout only**, replace the two Unicode quotation delimiters in **exactly 15** French `&special` lines, leaving every other source byte unchanged. Log SHA-256 before/after and validate that the transformation is reversible. The original upstream Git HEAD remains pinned but the experimental checkout is intentionally **dirty**, visibly labelled as an overlay.
3. Re-run the same 24 documents from that isolated candidate, keeping source text out of production paths and downloadable CI artifacts.
4. Compare all Latin and English normalized sections byte-for-byte against baseline; fail on any unexpected change. Count remaining French missing placeholders and watch for missing/reordered source cells.
5. Record an **audit-only** report with original and candidate missing IDs. Do not equate syntactic repair with independent French translation or printed-breviary certification.
6. If gaps remain in `[Initial]`, `[Oratio mortuorum]` or the Martyrology, establish the exact French 1960 source/reference and rights before another candidate. Do not repurpose a modern 1970 Office.

Code:
- `scripts/office/research-french-directive-overlay.mjs`
- `scripts/office/compare-french-directive-overlay.mjs`
- `tests/divine-office-french-directive-overlay.mjs`
- `.github/workflows/divine-office-phase-b.yml`

**Release gate:** zero independently certified Office hours, zero public route, zero approved French replacement text, zero chant redirect. Keep PR [#1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860) draft. A research syntax experiment is not a usable All Souls Office.
