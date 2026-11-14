# Ad Orientem daily prayers — B11 short English texts and preset proposals

**27 October 2026 · Research only · [PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785) is draft and unmerged.** No changes to production prayer cards, language bodies, preferences, timer, Mass Reader or home page.

## Print-image verification completed in B11

**Fourteen additional source-specific full prayer bodies** checked against **eight** actual historical printed-page images (not merely OCR or initial incipits), and stored in `data/pray/daily-prayer-short-form-print-witnesses.b11.json`. Total with B07=9, B08=5, B09=13 and B10=1 is **42 complete historical source-body witnesses (27 EN / 15 FR)**. This is not 42 unique prayer families or cleared publications. All fourteen link back to B01 source-occurrence IDs and preserve the printed-page citations.

| Historical book, printed pages | Fully checked forms | Key distinction |
|---|---|---|
| Lasance, *With God*, 1911, pp137–138 ([scan 147](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147), [scan 148](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148)) | Morning Adoration & Thanksgiving; Faith; Hope (across page turn); Love; Supplication; Contrition; Consecration (7) | Morning Adoration and Thanksgiving is **one** source prayer; Morning Act of Contrition is not the same as the evening form |
| Lasance, *With God*, 1911, pp141–142 ([scan 151](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/151), [scan 152](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/152)) | Evening Adoration/Thanksgiving/Petition for light; Evening Contrition; Evening Love (3) | Evening adoration already has thanks and examination-light: do not recite as three separate prayers |
| Callan/McHugh, *Blessed Be God*, 1925, pp12–13 ([scan 58](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/58), [scan 59](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/59)) | Act of the Presence of God; Act of Thanksgiving (2) | Thanksgiving includes bracketed printed `Here pause and meditate on God's mercies`, classified as a silent **cue**, not spoken text |
| Baltimore *Manual of Prayers*, 1888 copyright / 1889 edition, printed p81 ([scan 93](https://en.wikisource.org/wiki/Page:Manualofprayersf00cath.djvu/93)) | Another Form Evening Adoration (1) | This single text already contains acts of Faith, Hope and Charity, not three extra separately titled texts |
| Baltimore *Manual*, printed p54 ([scan 66](https://en.wikisource.org/wiki/Page:Manualofprayersf00cath.djvu/66)) | Morning Act of Contrition (1) | Matches the historic short family reproduced by Blessed Be God; book branding alone does not create a second tab |

All printed page images cited above were directly opened and read in this research pass. Lasance and Baltimore scan pages may have unproofread transcriptions on Wikisource, so page image controls wording.

## Concrete Short and Complete routine proposals

Machine-readable plan: `data/pray/daily-prayer-short-complete-preset-proposals.b11.json`.

These are **eight Ad Orientem composed devotional presets**, NOT copies represented as the complete sequences of any of the historical books. They are not approved user defaults and are not production files.

| Language | Time of day | Short | Complete | Hold |
|---|---|---|---|---|
| EN | Morning | Sign of Cross; Lasance Adoration/Thanks; Blessed Be God Offering; Our Father and Guardian Angel optional | Add historically witnessed Faith/Hope/Charity, a petition for grace, optional common prayers | Core EN theological acts now scan checked; canonical common wording/rights still need review |
| EN | Evening | Sign of Cross; Lasance Adoration/Thanks/light; guided examination; Lasance short Contrition; Visita collect | Separate BBG Presence and Thanksgiving; examination; Contrition; optional Act of Love, departed collect, St Alphonsus, Salva nos, Visita | Separate English prayer for light in long form needs source-body verification |
| FR | Morning | Sign of Cross; 1905 complete combined Thanksgiving & Offering | Add original French acts of Faith, Hope, Charity, Supplication and Resolution | Shared Sign-of-Cross historical text parity/rights |
| FR | Evening | Sign of Cross; 1905 Thanksgiving, prayer for light, guided examination, Contrition and bedtime protection | Add 1905 Adoration, resolution, living/dead intercession, Visita and prayer of all Saints | Period phrasing/editorial-suitability and rights checks |

**Short means fewer entire prayers**. It never abbreviates source prayer paragraphs or forces prayer to fit a clock.

### Duplicate and composite guards

- **One prayer, multiple devotional purposes**: B11 Lasance morning adoration+thanks and evening adoration+thanks+light each render ONCE. Do not split and repeat solely to satisfy stage headings.
- **Morning vs Evening Contrition**: source explicitly gives different endings. Same incipit is insufficient for collapse.
- **Biblical/theological common prayers**: retain shared canonical prayer identities; attach period-verified historical source witnesses rather than silently replace their existing text.
- **Night protection**: an antiphon (`Salva nos`), collect (`Visita, quaesumus`) and an attributed saint's Night Prayer are complementary optional choices, not alternative translations of one text.
- **An examen is not a timed morality test**: present guided reflection with no data collection or numerical score.
- **The source's bracketed pause** remains an unobtrusive optional silence cue, not an auto-advancing countdown.

### Timer requirements (approved design, not implemented)

An independent session layer: hidden elapsed stopwatch, optional gentle target, optional silent meditation; user can hide/reset/pause; completion never auto-advances cards or truncates the chosen prayer. Session analytics and intimate examen notes off by default. User-visible progress is stage progress, not 'prayers per minute'.

## Outstanding gates

1. Verify English **long-form** separate prayer for examination-light and full Short/Complete book/preset source equivalence, source specificity and translation parity. The English morning Faith/Hope/Charity candidate set now has scan-checked *Lasance* forms; those were previously held.
2. Verify historical sources and copyright/jurisdiction for current canonical Sign of Cross, Our Father/Hail Mary/Guardian prayer if attributed to 1962-era books.
3. Present exact per-category editorial choices to user; default candidates are **not approved**.
4. Production PR later: extend existing Morning/Evening reader; no new competing PRAY engine or Mass Reader change.
5. Zero cost, no publisher contact, no bogus modern indulgences or synthetic French translation.

QA targets: 14 unique B11 IDs, 8 actual source page-image URLs, source back-references to B01 (14/14), 8 draft presets with 4 EN/4 FR, no missing historical form IDs, 42 cumulative historical source bodies.
