# Divine Office Phase I — All Souls missing French sources and exceptional-rubric gate

Date: 28 October 2026. Branch: `research/divine-office-phase-a-20261028`. Draft PR [#1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860). **No publication or paid services.**

## Verified source-level failure: six missing French cells

The pinned upstream Divinum Officium generator produced structurally aligned All Souls documents for 2 November 2026. However, the Phase H translation-risk screen traced six **literal upstream missing-source messages** in the French locale. These are not ordinary translation-length differences and are not liturgical text.

| Date | Hour | Latin source-cell anchor | French source-cell ID | First French source words | Status |
|---|---|---|---|---|---|
| 2026-11-02 | Prime | `Prima4` | `Prima4` | `2 is missing` | BLOCKED |
| 2026-11-02 | Prime (Martyrology) | `Prima5` | `Prima5` | `special is missing` (followed by some text) | BLOCKED |
| 2026-11-02 | Terce | `Tertia4` | `Tertia4` | `special is missing` | BLOCKED |
| 2026-11-02 | Sext | `Sexta4` | `Sexta4` | `special is missing` | BLOCKED |
| 2026-11-02 | None | `Nona4` | `Nona4` | `special is missing` | BLOCKED |
| 2026-11-02 | Compline | `Completorium6` | `Completorium6` | `1 is missing` | BLOCKED |

All are `sourceRevision=126a07f91ede04664108abb6fb20ace3f4de14b9`, `Rubrics 1960 - 1960`. French deficiencies affect **five distinct hours**. No English or Latin source-cell-length flags occurred in these cohort comparisons; this is NOT proof of English or Latin correctness.

**Source IDs remain unchanged**, and the six original source texts stay in the CI research manifests. No French text was fabricated, machine-translated or replaced by an English text. A locale-specific preview quarantine means French Prime, Terce, Sext, None and Compline do not get a reader page; the existing English research-only pages remain, and the French selector cannot link to absent pages. French Matins, Lauds and Vespers can still be structurally previewed, but nothing is liturgically certified. On a clean test run, the expected sample count is 8 English + 3 French = **11** All Souls bilingual preview pages, instead of 16; the 24 original LA/EN/FR source files remain intact.

**Fix needed:** find an independently traceable historical French traditional Roman Breviary for the *exact* All Souls 1960 content, confirm its proper collect, martyrology and rubrics by original reference, establish redistribution rights, and register reviewer approval per source cell. Old printed translations or Roman Liturgical Books must not be imported automatically if they follow different rubrics. A modern 1970 Office (e.g. AELF or modern Breviarium Romanum 1971) is not a textual substitute.

## Rubric checks — independent official text

The [ICRSP France 1960 general rubrics](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien), bilingual Latin/French, establish:

- §180: the Office of the Dead begins and ends according to its **own Breviary exceptions**, not the normal hour formula.
- §181: the usual final Marian antiphon after Compline **does not apply** to the Office of the Dead.
- §185: hymns are omitted from the Office of the Dead; an English or French `Hymn{omit}` **status marker is not a hymn**.
- §190: antiphons are omitted at the little hours and Compline on 2 November.
- §§240 and 243: chapters and short responsories are omitted in the Office of the Dead.
- §248: collects at Prime and Compline are ordinarily fixed, **except for All Souls**. The pinned Latin corpus was checked against 3 November: both source text hashes are distinct, but the *wording* has NOT been critically compared against a printed proper.

[ICRSP 1960 Variationes §58](https://icrspfrance.fr/textes-liturgiques.php?article=a0151_ancien): Office of the Dead Vespers **and proper Compline** moved to 2 November, with a concurrence exception ending the Office after None when a Sunday or Class I feast takes its place. An optional traditional devotion after All Saints Second Vespers is not equivalent to the canonical compulsory Office.

The [1961 Breviarium Romanum printed rubrics](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf) remain the primary Latin witness. The ICRSP web edition is the readable bilingual cross-check; neither independently certifies all proper-text lines.

## Quality gates

1. The normalizer records only exact upstream omitted-status markers as such; real lines cannot be removed by a generic “omit” filter.
2. The research reader rejects `<index> is missing` and `special is missing` at a cell's start with `OFFICE_RESEARCH_READER_UPSTREAM_MISSING_TEXT`.
3. The preview builder with `--quarantine-missing-translations` blocks **only affected date × hour × locale** combinations; it never rewrites a translation.
4. The source risk register prints original source IDs, role, short incipits and lengths. Correctness is not inferred from absent flags.
5. Research pages remain unpublished, external chant links disabled, all 8 canonical hours unchanged, original Mass reader untouched.
6. A new corpus-wide proper-text and EN/FR translation review remains needed even after the six known holes are filled.

## Evidence

- [Full source-identification and §248 evidence: Actions #40740522250](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40740522250) (3/3 CI jobs passed). This run confirmed six French missing-text flags, distinct All Souls Prime/Compline Latin collects, 42/42 source hour groups aligned, and zero published.
- The next content-quarantine + browser-acceptance run is only a signoff when the GitHub Actions **original-composer-smoke** job passes; do not infer pass from code commit.
