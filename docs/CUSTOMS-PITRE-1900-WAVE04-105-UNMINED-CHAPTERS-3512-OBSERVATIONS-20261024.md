# Pitrè 1900 — Wave04: 105 new original-source observations in 11 previously unrepresented chapters

**Date:** 24 October 2026. Draft PR #1572 on `research/customs-full-registry-census-20261023`. Research only; no Ad Orientem Calendar or runtime publication.

## What was actually mined

The complete user-provided original 1900 Giuseppe Pitrè, *Feste patronali in Sicilia* (Carlo Clausen, volume XXI of *Biblioteca delle tradizioni popolari siciliane*), was reopened at chapter level, using the **original 1900 printed table of contents (PDF pp. 619–628)** and directly readable original text. Edition identity: University of Michigan / Internet Archive `afm3499.0021.001.umich.edu`, compressed original PDF SHA-256 `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`.

A **105-row new original-edition source intake** is now separately staged and indexed in the unified research workbench:

`data/customs/master/pitre-1900-unmined-chapters-xi-xiii-xviii-xx-xxii-xxv-wave04.v1.json`

| Original numbered book chapter | Location and feast | New source/detail observations |
| --- | --- | ---: |
| XI | St Vitalis, Castronovo | 7 |
| XIII | Assumption, Novara and Tusa | 11 |
| XIV | St Nicholas, Gioiosa Marea and Palazzo Adriano | 12 |
| XV | St Mark and St Nicholas, San Marco d'Alunzio | 9 |
| XVI | Annunciation, Fiumedinisi | 9 |
| XVII | St Onuphrius, Casalvecchio | 11 |
| XVIII | St Cono, Naso | 11 |
| XX | Three Holy Martyrs / St Alfio, Trecastagni | 10 |
| XXI | Madonna della Lavina, Cerami | 8 |
| XXII | St Febronia, Palagonia | 7 |
| XXV | St Sylvester, Troina | 10 |
| **Total** | **11 new book chapters represented** | **105** |

All 105 IDs `PIT1900-UNMINED-001` through `PIT1900-UNMINED-105` are new, collision-free and source-specific. They retain the author's original Italian text anchor, a contemporaneous English *research synopsis*, the original printed-page reference, **one-based PDF scan page**, chapter group, archival scan checksum, and flags withholding independent author corroboration, liturgical authority, modern continuity, unique customary identity and app publication.

All **105/105 normalized Italian anchors were matched against the assigned original PDF page's embedded text layer** before intake; representative original page images were rendered as four 6-page chapter spotcheck sheets. This pass has **not** certified a full image-level review for each of the 105 individually: the separate 105-record image-check queue remains open.

**Edition and page distinction:** the chapter XI folios have scan offset 62 (PDF 202–205 for the source folios around printed pp.140–143); chapters XIII–XXV in this batch have offset 58, which was checked against numbered source headings. These conversions must **not** be assumed valid for the entire book, which contains illustrated plates.

## Source-critical examples

- **Gioiosa Marea / St Nicholas:** Pitrè distinguishes the reported December 6 feast and second Easter-octave procession, including a blessing of land and sea whose precedence was contested between farmers and mariners. A blessing *described* in a historical report **does not supply a verified 1962 Roman Ritual formula**.
- **San Marco d'Alunzio:** the paired St Mark/St Nicholas observance, alternating processional street quarters and a cited Congregation of Rites decision all appear in the 1900 text. The underlying original decree **was not independently read**; no modern Calendar change follows from the date.
- **Fiumedinisi:** the Annunciation moving pageant included children on a raised platform; its dramatic sacred dialogue and local cotton-blessing tradition require explicit distinction from approved liturgy, physical safety, and independent ecclesiastical authorization.
- **Casalvecchio / St Onuphrius:** the original report documents a silver statue, historical procession and a popular camel masquerade, alongside knee/tongue-on-floor penances. None of the latter is endorsed as Catholic guidance.
- **Naso / St Cono:** printed folk claims about carrying cave sand to ward off illness, statue-facial omens and supposed cures are classified as *folk beliefs*, not proven medical or sacramental effects.
- **Cerami:** the Madonna della Lavina procession involved laurel, an icon adorned by gifts and barefoot image bearers. Pitrè mentions an exceptional papal authorization concerning seasonal food; the original pontifical instrument has **not** been authenticated.
- **Troina / St Sylvester:** separate the older 2 May feast from the shifted first Sunday of June in the 1900 account, and the folkloric tomb/relic origin narrative from original-document verification and contemporary practice.

These rows are **source observations/components**, often multiple observations within one historic festival, **not 105 certified independent Catholic customs**. Same-author reuse, borrowed legendary narrative, local civic spectacle, historical date shifts, and alleged supernatural efficacy remain correctly held.

## Cumulative research counters

- Unified cross-source **source/detail observations: 3,407 → 3,512**, exactly **+105**.
- Pitrè 1900 original-edition evidence: **422 previous + 105 new = 527** observations.
- Previously indexed **422/422** original-PDF individual image-level page checks remain intact. New Wave04 rows have 105/105 PDF-text-anchored page references; **105 individual page-image checks remain pending**. Therefore no claim that all **527/527** are fully image-verified.
- Provisional cross-source custom groups **408 unchanged**.
- New unique customs / Roman Ritual approvals / independent prior authors / modern liturgical-Calendar date approvals / live app publication: **0 / 0 / 0 / 0 / 0**.

## Exhaustive original chapter-index census

Original printed table of contents contains **60 numbered chapters**. Earlier 1900 extraction batches had *some evidence* in **20** of them. Wave04 added **11 new represented chapters**; there are now **31/60** chapters with at least one indexed source observation, but **none is certified exhaustively mined**. **29** numbered chapter groups remain without any indexed 1900 observations.

Machine-readable index and source coverage:
`data/customs/master/pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json`

Remaining wholly unrepresented chapter IDs:
`II, IV, V, VI, XXIII, XXIV, XXVIII, XXIX, XXX, XXXV, XXXVII, XXXVIII, XXXIX, XL, XLI, XLII, XLIII, XLIV, XLV, XLVII, XLVIII, XLIX, L, LIV, LV, LVI, LVII, LVIII, LIX`.

**Next extraction batch:** 100–200 new source observations across a substantial set of those 29 untouched sections, prioritizing original pages already accessible for Catania XXIII–XXIV, Syracuse XXVIII–XXX and XXXV, and Girgenti XXXVII–XLV. Prioritize actual original text and municipal variation; do not repeat earlier pairs or create duplicate master identities. Subsequently complete broader coverage of Palermo II/IV–VI and Trapani XLVII–L, and Caltanissetta LIV–LIX. Maintain a narrow exception queue for unreadable or conflicting original Italian evidence and separate later official rite checks for explicit ritual authorization claims.

## GitHub tests and evidence status

The new `tests/customs-pitre-1900-wave04-unmined-105-integrity.mjs` CI regression asserts 105 complete source IDs, labels, original page references, provenance, zero canonical merges, unchanged 408 groups, 3,512 workbench source rows, 527 indexed Pitrè rows, 31/60 represented source chapters, and the **105 pending image checks**. GitHub CI cannot independently render the user-attached original PDF, so its checks validate committed evidence mapping and non-loss counts, **not** a fresh visual inspection of scanned facsimile pixels.

The historical first-422 completion register remains accurate for its dated intake only; its 0-outstanding figure must not be misapplied to the expanded 527-record source set.

No paid sources or storage, no Calendar replacement, no new Customs Atlas, and no live Ad Orientem customs content created.
