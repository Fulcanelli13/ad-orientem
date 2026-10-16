# Low Mass — 35 historical Guides: complete source-critical short-copy audit
**16 October 2026 — source and runtime QA, NOT editorial publication approval.**

## Source of truth / output

- Historical, immutable short Guide donor: `data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json`. All 35 original IDs and their original short text remain unchanged.
- Full per-Guide source audit, original vs proposed text: `data/learn/research/mass-low-35-guide-full-source-audit-20261016.v1.json`.
- Current normative 1962 Low Mass source cue/section system: `data/presentation/reader-text-low.v1.json` (30 macros, 96 blocks).
- Original historical long copy is still only in the frozen 36-sheet Ultra Master and is not part of this certification.
- Primary rubrical check: *Ritus servandus in celebratione Missae* (1962 edition), via the English witness at https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/ . Authority is the 1962 Latin Missal; this English transcription alone does not certify the exact wording of any liturgical source or permission for publication.

## Fully reconciled research audit

| Decision | Units | Status |
| --- | ---: | --- |
| Historical short Guides checked against Low corpus anchors | 35 / 35 | **Complete (cue audit)** |
| Source-corrected short-copy proposals | 18 | **Correction candidates, NOT approved** |
| Historical short copy retained unchanged (further author/rubric checks possible) | 17 | **Not approved** |
| Actual Low source-cue anchors | 33 | **ID mapped, not word-level navigation certified** |
| Distinct observational/ceremonial cases with no Latin text cue | 2 | **Explicit selection only** |
| Guides requiring an explicit *presence/applicability* decision | 9 | **Fail-closed in research resolver** |
| Source-audited material approved for production | 0 | **Withheld** |

Original 35 stages are numbered `LOW.001` through `LOW.035`. No additional Mass cards, universal faithful-posture claims, schola track, Latin prayer or production rubric is introduced.

## The seven highest-impact corrections

| Guide | Historic fault | Documentary correction | Source |
| --- | --- | --- | --- |
| `LOW.023` | At cue `AO.SM.C0173`, wrongly states the elevation is occurring “exactly now.” | Cue is the *words of Consecration*. Priest genuflects, elevates the Sacred Host, replaces It and genuflects afterward. The elevation action is later (`C0174`). | Ritus VIII.5–6, PDF p. 15 |
| `LOW.024` | At `C0179`, wrongly says the Chalice elevation is occurring. | The words of Consecration precede *Hæc quotiescumque*, genuflection and elevation (`C0181`). | Ritus VIII.7, PDF p. 15 |
| `LOW.025` | Missing the short conspicuous priestly action at `Nobis quoque`. | Slightly raised voice and **one priestly breast strike**, then secret recitation. Does **not** establish a faithful posture cue. | Ritus IX.3, PDF p. 17 |
| `LOW.026` | At `C0201`, falsely announces the Canon is already complete. | The priest is beginning the final doxology *Per ipsum*; the Lord's Prayer comes afterward. | Ritus IX.3–X.1, PDF p. 17 |
| `LOW.028` | Described as a merely local Communion warning. | A conditional **server's** warning bell is explicitly given where faithful will communicate, without a fixed spoken Latin cue. | Ritus X.6, PDF p. 20 |
| `LOW.033` | Assumes the `Ite missa est` anchor describes every Mass's dismissal. | The actual dismissal depends on the liturgical form: `Ite`, `Benedicamus`, or `Requiescant` as appointed. The actual `C0259` reading is *Ite*. | Ritus XI.1/XIII.1, pp. 21/24 |
| `LOW.034` | Suggests kneeling as if a universal prescription of the priest's rubric. | At the blessing, distinguish **priest's prescribed action** from local custom of faithful. Blessing is omitted after `Benedicamus` or `Requiescant`. | Ritus XII.4, PDF p. 23 |

The other eleven short-copy correction candidates and seventeen retained sources are all individually enumerated in the machine-readable audit, with precise source cue, 1962 rubric locator, reason and proposed text. The existing historical short text is never discarded.

## Resolver semantics corrected

The original research resolver treated *all* non-default condition metadata as if it meant a prayer could be omitted; it therefore hid several **mandatory** Canon/Consecration stages.

In `src/mass/reader-low-guide.js` only the following nine legacy stage IDs now require **positive applicability**: `LOW.003` (Psalm 42), `LOW.008` (Gloria), `LOW.014` (Credo), `LOW.028` (Communion warning), `LOW.029`–`LOW.030` (faithful Communion), `LOW.033` (exact dismissal variant), `LOW.034` (blessing) and `LOW.035` (Last Gospel). `LOW.020`, `LOW.022`, `LOW.023` and `LOW.024` describe required Mass ceremonies or timing cautions and must not be gated solely on the presence of a specific bell/clock state. Conditional **calendar and form selection** still belongs to the existing resolved-Mass system.

## Release conflict and integration ownership

At this check the **main branch** has a newer `src/mass/reader-dom.js` than PR #1193. The two files are not byte-identical; do not overwrite main with this older research branch's version or automatically merge an entire DOM file. The Mass reader owner must port the minimal research-preview seam onto the latest current reader **only if it is still needed**, and must avoid duplicate ownership with any other Mass pipeline.

The research mode is deliberately off by default; current `main` does not load or publish these Guides. No proof of actual phone deployment has been established here.

## Required release gates

1. Review the **18 corrected short statements in one editorial batch**, ideally alongside the 17 retained originals. A correction sourced in the Ritus is not an automatic personal preference or editorial approval.
2. Review the full original long Guides against authors and 1962 rubrics; replace ungrounded statements, never attribute assistant wording to an original author.
3. Determine actual source macro/word-level handoff for 33 candidate anchors and 2 observational stages. The seven high-impact errors above must not remain in public copy.
4. Have Mass reader owner bind only accepted copy through `LOW_1962` form and explicit nine-stage applicability decisions. Preserve the existing Sung 32-Guide registry.
5. Regression-test Low, Sung, Requiem and special-continuation form logic; validate **canonical** GitHub Pages URL on a phone.
6. Only after these gates, request publication in main. An Actions green check does not grant theological or editorial approval.

The new test `tests/mass-low-35-source-audit.mjs` checks all 35 source identities, 18 nontrivial proposals, 17 untouched originals, 33 source cues, two nontext stages, nine presence gates and preservation of the 32 already-released Guides.
