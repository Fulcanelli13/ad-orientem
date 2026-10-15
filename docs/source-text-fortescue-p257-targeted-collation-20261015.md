# Fortescue printed p.257 — targeted collation of the 1913 scan (2026-10-15)

**Scope:** original article *Canon of the Mass* (first published 1908), **1913 Knights of Columbus special-edition** printed witness `ED-CE1913-V3-KOC-SPECIAL`. Target print p.257 / DjVu 305 and top of print p.258 / DjVu 306. This research document does **not** certify the entire historical page.

Primary images: https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/305 and https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/306. The page-based Wikisource text expressly says **not proofread**. The [New Advent transcription](https://www.newadvent.org/cathen/03255c.htm) derives from the 1908 work and is a separate transcription; it must not overwrite the 1913 printed witness.

## Concrete findings

1. **First Epistle of Clement reference:** on printed p.257, the section about priestly ranks is referenced **(xl)**, i.e. chapter 40. New Advent has **(xi)**, i.e. chapter 11. The independent text of **1 Clement 40** at https://ccel.org/ccel/clement_rome/first_epistle_to_the_corinthians/anf01.ii.ii.xl.html contains the high-priest / priests / Levites sentence and corroborates **XL**. This is a substantive source-address defect in a widely accessed secondary transcription. The current p257 draft already correctly uses `(xl)` and must continue to do so. Do not global-replace XI→XL in other works.
2. **English edition wording:** the examined 1913 witness includes **“before this service”** in the early Eucharistic narrative; New Advent has **“before the service”**. Keep the 1913 wording in the 1913 edition, without inferring which text the original 1908 printing contains.
3. **OCR error versus original:** the raw Wikisource layer shows **“fifth eentury”**, **“frill be Been”**, **“at any ■ it side Palestine”**, **“Pope Victot”**, and incorrect reproduction of the Probst and patrologia references. These are *OCR* errors, not scholarly emendations to Fortescue. Proposed repairs remain preliminary until independent image proofreading.
4. **Pseudo-Ambrose quotation:** New Advent renders *coporis* for a reading corresponding to *corporis* in the preliminary 1913 print check; this is a likely transcription typo. But *hunc* versus *hanc panem*, *coelum* versus *cælum*, ligature use, source references, italics and punctuation have not been certified character by character. Preserve the full Latin quote as **held**, not clean-room publishable text; philological grammar alone must not manufacture the 1913 letterforms.
5. **Justin, First Apology locator:** scanned OCR appears corrupt, while New Advent displays `(lxv-lxvi)` and the provisional 1913 draft `(lxv–lxvii)`. Exact numerals and punctuation remain **unresolved** pending close reading of the printed image; do not silently choose the modern hosted version.
6. **Physical page continuity:** the bottom right of printed p.257 ends in a sentence after *“He also says that at”*; printed p.258 starts by continuing that sentence. The page turn is not a paragraph break; no invented punctuation, citations or text may be inserted into the join. The source chapter continues well beyond p.258.

## Technical record and review model

`data/source-text/fortescue-1913-p257-variant-collation.v1.json` contains **14 targeted comparisons** with inspected block IDs, source or secondary readings, exact decisions, independent source corroboration where available, and unresolved flags. The statuses deliberately distinguish *print/source-locator corroborated* from *preliminary scan visual reading* and *unresolved original typography*.

`tests/source-text-provisional-page.mjs` now verifies that every collation point refers to an existing historical working block, that the Clement reference is `(xl)`, that the contrary New Advent reference is recorded, and that unresolved Latin readings and editorial hold states remain explicitly unresolved. These checks **do not** prove that every word on printed p.257 has been independently transcribed or that the long Latin quote is exact.

The provisional full-page working transcription remains quarantined in `data/source-text/fortescue-1913-p257-provisional-transcription.v1.json`; only the **four previously selected limited excerpts** are eligible to pass the test-only whitelist. No new source text is moved into the live reader or the Mass commentary/reference pipeline.

## Pending formal acceptance

Perform high-resolution, line-by-line and typographically faithful proofreading of original printed p.257, with particular attention to both columns and the Latin quotation, then proof and join printed p.258. Record exact corrections and an independent human editorial decision. *Until then:* **zero full printed pages certified, zero new full paragraphs cleared, zero production import.**
