# Red Missal English baseline — fixed Ordo Missae, first source-owned change

**Status:** Four controlled English changes in PR #1424; remaining fixed-Ordo English review open.
**Witness:** Coalition in Support of Ecclesia Dei, *Latin–English Booklet Missal for Praying the Traditional Mass*, Fourth Edition, Tenth Printing (May 2013), user-provided scanned PDF.

## Authority and existing research

1. The **1962 Missale Romanum** controls the Latin text, forms, rite and rubrics. The English booklet cannot silently override those rules.
2. The **Red Missal** is the preferred editorial witness for the English **fixed Ordo Missae** when the same prayer is printed. It is not an absolute English source in the presence of an evident grammatical error, a legitimate existing translation or a 1962 historical discrepancy.
3. Earlier independent textual/source research remains authoritative in its assigned domain:
   - `data/mass/source-reconciliation-gates.v1.json` (source → adjudication → canonical source → reader)
   - `data/mass/ordinary-parity-register.v1.json` (original Latin text, crosses, Canon boundaries)
   - `data/mass/ritus-1962-alphonsus-fortescue-parallels.v1.json` (ceremonial explanation **not** 1962 English-translation authority)
   - `data/presentation/reader-french-ordinary.v1.json`, pinned Divinum Officium source (French reviewed **independently**)
4. Immutable 96-block LOW and SUNG donors are preserved. All changes use the existing `applyCanonicalTextCorrection` seam **before** localization and card composition.
5. The booklet is a copyrighted compilation of multiple traditional missal translations. The complete user-supplied PDF is not uploaded into this repository or redistributed. Source-specific short edits are recorded; broad reproduction needs a separate rights decision.

## Exact corrections

| Canonical cue | Fixed prayer | Before / decision | Witness |
| --- | --- | --- | --- |
| `C0110` | *Suscipe, sancte Pater* | Regularize to **Thine/Thou** register and **holy Father** capitalization; an editorial partial adaptation, not a wholesale copy | printed p. 23 / PDF p. 24 |
| `C0121` | *Incensum istud* | Replace awkward **“May this incense blessed by You, arise”** with the coherent traditional booklet expression | printed p. 25 / PDF p. 26 |
| `C0122` | Psalm 140 during incensation | Correct missing finite verb in **“Let my prayer, O Lord, like incense…”**; new line `Let my prayer rise before Thee as incense` derives from Red + original Latin **Dirigátur** rather than reproducing the booklet's poetic wording verbatim | printed p. 25 / PDF p. 26 |
| `C0132` | *Orate fratres* — `Suscipiat Dominus` response | Prefer **“May the Lord accept the Sacrifice … for our benefit and for that of all His holy Church”** | printed p. 27 / PDF p. 28 |

**No Latin, French, priest/schola identity, response ownership, Mass-form selector, gesture or rubrical state is changed.** The old English is preserved in `data/mass/canonical-text-corrections.v1.json` and the frozen donors.

## 256-cue collation protocol

The repository now has a complete **256-cue** worklist generator:

`node tests/mass-ordo-red-missal-editorial.mjs`

It writes `artifacts/mass-ordo-red-missal/256-cue-editorial-worklist.json` with stable ID, block/macro, Latin, old English, effective English, French, booklet printed page range, approved replacement and **review status** for every Ordinary cue.

**4/256** entries have reviewed source changes; **252/256** remain `NOT_YET_INDEPENDENTLY_COLLATED`. A mechanically generated worklist is not the same as 256 manually collated and certified booklet passages.

Editorial reviewers must visually verify the *exact printed PDF reading* for each candidate. Existing scanned/OCR text is usable only for navigation and prioritization, not for authoritative quotation or automatic correction. This matters for Latin diacritics, hyphens, crosses and syllabified or ornamented text.

### Distinguish genuine mistakes from reasonable translations

- **Pater noster `C0209`:** Red uses `trespasses`; AO presently uses `debts`, literally `débita` in Latin. Do not change without an explicit editorial policy decision; this is not a grammatical error.
- **Kyrie `C0044–C0052`:** Red uses “have mercy on us”; AO “have mercy”. Full formal decision needed for all nine repeated cues, not a single isolated line.
- **Gloria `C0053 + C0054`:** donor split is deliberately recomposed by `ordinary-reader-composition.js`; do not introduce a false double reading in the reader.
- **Canon `C0194`:** missing donor `et` already corrected in the canonical Latin before display; do not duplicate the correction.
- **Optional Communion Confiteor `C0235–C0241`:** Red prints an older/customary form and notes it is **omitted in the 1962 Missal** (printed p. 45, PDF p. 46). Never make it the universal default merely by copying the booklet.

## Acceptance evidence

The new CI gate runs all existing canonical correction and full-reader tests plus `tests/mass-ordo-red-missal-editorial.mjs`. It verifies:

- exact original English cue, replacement and idempotence;
- original Latin unchanged by all four English edits;
- all **256 Ordinary cues** (LOW and SUNG), and one French counterpart per ID;
- Low/Sung substantive text parity after recognizing donor speaker prefixes;
- corrected English present in **actual LOW/SUNG reader card projection**, old wording absent;
- French reader lines unchanged, no modifications to the frozen donor text;
- the worklist labels unreviewed text honestly.

**Further gate:** native phone acceptance and full independent printed 1962 text collation are not supplied by the booklet nor the present CI and remain separate from this editorial batch.

**Next wave:** finish independent source-level collation of the rest of the 256-cue worklist, prioritize confirmed literal defects and inconsistent translation register, and promote approved changes as exact-cue source-level English records. Avoid full-English replacement just to increase apparent coverage.
