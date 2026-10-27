# 1962 Mass — Easter Preface source-recovery review (26 October 2026)

## Ownership and rationale
Dependent on draft PR #1747; this is the source-owned Eastertide cohort, not another Calendar or Mass reader implementation. Draft Calendar Ordo PR #1739 remains separate. The existing canonical 1962 resolver and R17 reader remain the only day/source and display authorities.

The 1962 Missal, *Præfatio paschalis*, distinguishes three **mutually exclusive** clauses:

| Principal Mass | Latin reading | Calendar identity |
|---|---|---|
| Easter Vigil Mass | `sed in hac potissimum nocte` | `tempora:Quad6-6r:1:vw` |
| Easter Sunday through Saturday in albis inclusive | `sed in hac potissimum die` | `tempora:Pasc0-[0-6]:1:w` |
| Thereafter, before the Ascension vigil | `sed in hoc potissimum` | Explicitly source-owned `tempora:Pasc1-0`, `Pasc2-0`, `Pasc3-0r`, `Pasc4-0`, `Pasc5-0`, `Pasc5-3` (2026) and identically resolved Temporale source-path matches |

References: [1962 Missal Prefaces](https://liturgiapapal.org/index.php/recursos-lit%C3%BArgicos/misal/missale-1962/1716-prefacios.html), [ICRSP Latin–French Easter Preface transcription](https://icrspfrance.fr/textes-liturgiques.php?article=xe8e36173_lisible). The Vatican 1962 typical-edition Latin is also cited, independently checked and retained in `data/mass/rogation-easter-preface.v1.json`; that file's *Minor Rogations* publication scope is **not** treated as a general Mass permission.

## Source-form preservation
The existing `Ordo/Prefationes` named `[Pasch]` section includes all three alternatives at once. The production host strips `~` continuation marks from Latin and English source lines; master upstream retains them. Both authentic layouts have been pinned, with exact trilingual source rows and provenance, in:
- `tests/fixtures/mass-easter-preface-pasch-source.v1.json`
- `tests/fixtures/mass-easter-preface-pasch-host-flat.v1.json`

`src/mass/1962-easter-preface-form.js` requires the full exact set of three options in the correct order, an authentic heading and body text, and returns exactly one selected formula in each source language. It removes alternative rubrical notes from the displayed text; any missing language, altered source structure or unrecognized markers **fail closed**. No translation is invented or paraphrased.

`reader-proper-runtime-recovery.js` matches **both** the canonical principal Mass ID and exactly the corresponding `Tempora/...` path. It may repair `Communis` or an unresolved three-way `Paschalis` text, never a properly selected single seasonal Preface. Generic ferias, unrelated feasts, Ascension and local/votive formularies are excluded.

`1962-preface-decision.js` independently withholds the Common fallback, a composite `Paschalis`, or an individually correct category but wrong seasonal clause when supplied the authenticated principal Mass ID.

## Regression and acceptance
The source unit test verifies three variants × three languages × two source layouts, exact source-string parity, intentional source damage, section ownership, rejected alternate Masses and proper identity. The full browser matrix resolves 14 actual 2026 source days (Vigil 1; Easter octave 7; later Temporale 6), verifies all three language passages, observes immutability of the original source, and checks that the native Preface slot rejects the raw text but accepts the selected text **when passed the canonical principal identity**.

The pre-existing 30-date Lent/Pentecost regression is retained. The work does not update liturgical colours, postures, Schola interludes, feast resolution or Calendar UI. This is not a claim that every Eastertide sanctoral/votive Mass, generic feria or local institute Ordo has been independently certified.

**Release:** draft until the production parser and 14-date/30-date browser matrix, Mass convergence and required gates pass. Merge dependent PR #1747 in correct order; do not merge the stacked head alone into an unrelated base.
