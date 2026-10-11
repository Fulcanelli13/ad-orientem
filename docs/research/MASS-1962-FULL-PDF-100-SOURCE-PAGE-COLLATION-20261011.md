# Mass–Scripture: full-volume Missal collation and first broad visual spotcheck
**11 October 2026 · PR #1018 · RESEARCH ONLY · all production and edition-certification gates closed**

## Major throughput change

The Church Music Association of America [complete 1962-labelled Missale Romanum](https://media.musicasacra.com/pdf/missale62.pdf) was fetched in GitHub Actions, SHA-256 `648fdb8fe830ed65a08aa4a95de6f94424c533ddf2398c8fc26b18735fd3518a`, and its existing PDF text layer extracted across **1,088 PDF pages**. We did **not** manufacture new OCR over raster pages or import whole copyrighted scans into the Git repository. Its frontmatter text shows `Missale Romanum`, `Decretum`, and `Rubricarum instructum`, but the automated prologue date-1962 string check was negative. Full physical title/decree authentication is **still required**; for the late-1962 correction (St Joseph in Canon), compare the later [Propria complete reprint](https://propria.org/additional/) independently. Do not declare the two digitizations identical editions.

The dedicated [whole-volume discovery action](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38163928914) passed, and [machine-readable printed page candidates](../../data/geography/research/mass-1962-full-pdf-ocr-100-source-candidates-20261011.v1.json) are now available for all **100 high-priority source paths**.

| Comparable metric | Result | Correct interpretation |
|---|---:|---|
| Source paths searched | **100/100** | Entire HIGH triage cohort, not all 1962 celebrations |
| Source paths with at least one OCR phrase hit | **86** | Page *candidates* only |
| Source paths without a phrase hit | **14** | Not proof of absence in printed Missal |
| Latin section anchors examined | **529** | Includes inherited/generic notes |
| Section anchors with an OCR page candidate | **210** | 126 unique page hits, 84 with multiple possible pages |
| Insufficiently distinctive/short Latin anchors | **214** | Mostly generic/empty headings, including Alleluia |
| No exact 9/7/5/4-word OCR phrase match | **105** | OCR, variants or genuine mismatch must be distinguished |
| Stronger two-section, same-three-page clusters | **44 of 100 paths** | At least two distinct source-section candidates in three pages and one unique-page anchor |
| Ranked page-window candidates | **47** | Some source paths have more than one cluster |
| Confirmed 1962 edition/text certification | **0** | Research review rather than release approval |

[Conservative multi-section grouping register](../../data/geography/research/mass-1962-printed-page-cluster-review-queue-20261011.v1.json) and [green CI regression](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38164525237). A hit, even two adjacent hits, **does not prove** selection of a particular feast: Commons, saints and transferred observances reuse texts throughout the Missal.

## Visual printed-page audit: ten pages, seven additional high-priority sources

[Ten page previews](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38164177176) were rendered and individually examined; source images remain transient workflow artifacts, not production artwork. For each observed printed Proper page, **PDF page = printed Arabic page + 81**. The sample spans Lent, December, January, July, August, September and October; the offset is checked at ten distinct pages but must **not** be blindly applied to Roman-numbered front matter, appendices or Propria's separately typeset reprint.

[Machine-readable ten-page visual review](../../data/geography/research/mass-1962-cmaa-visual-10-page-source-spotchecks-20261011.v1.json):

| Source | CMAA PDF page / printed page | Observed comparison and editorial caution |
|---|---:|---|
| `Tempora/Quad4-3t` | 191 / 110 | Wednesday after IV Sunday of Lent; gradual `Beata gens`, Tract `Domine, non secundum`. The **-t source variant** and extended lesson sequencing are not yet rubrically certified. |
| `Sancti/12-08` | 519 / 438 | Immaculate Conception, with *Benedicta es tu*, Psalm 86 Tract and Ave Maria Offertory; no automatic 1962 source file/occasion approval. |
| `Sancti/01-31` | 543 / 462 | Gradual *Spera in Domino*, Tract, Offertory and Communion match a **carry-over from the previous feast**, but this page also starts **1 February**. Verify celebration start on preceding page. |
| `Sancti/07-20` | 674 / 593 | St Jerome Emiliani, III class: Introit Lamentations 2 and Psalm 112; Gradual Proverbs 5 and Psalm 111. Remaining Propers not visually reviewed here. |
| `Sancti/08-08` | 700 / 619 | Saints Cyriacus, Largus and Smaragdus explicitly labelled **Commemoratio**, despite the printed Introit/Gradual/Offertory/Communion. **Do not promote as an independently selected principal Mass.** |
| `Sancti/09-18` | 742 / 661 | St Joseph of Cupertino, III class; checked Introit Eccli 1 and Gradual Psalm 20. |
| `Sancti/10-09` | 763 / 682 | Continuation of 9 October: Gradual `Inflammatum est cor meum`, Tract `Contristatus sum`; feast title is on preceding page. |

In these seven sources, **19 visually compared visible fragments** are directly traceable to raw Divinum Officium wording and printed source headings/notes. This means *partial printed corroboration of those fragments*, not 19 fully harmonized Clementine/Crampon/Douay Scripture editions. The dedicated ten-page visual regression passed, including an explicit **Commemoratio** stop.

The three previously detailed printed sample cases remain independent: **Precious Blood (July 1), Irenaeus (July 3, `07-03r` → `06-28`), Zaccaria (July 5)**. In total **ten distinct high-priority paths have received some manual printed-page comparison**, while **zero** has received full formularies + text-version + calendar-use certification.

## Why this matters to the eventual Bible map

- **Quote location is not occurrence:** The same Psalm verse or chant incipit can appear on several printed pages. Page proximity and heading must be inspected before claiming a dated Proper.
- **Commemoration is not principal feast:** The 8 August example makes this an actual, observed issue rather than a hypothetical calendar warning.
- **Seasonally altered chant order:** Some sources print Gradual + Alleluia, Tract after Septuagesima, and two Eastertide Alleluia verses. The app must select only the documented use appropriate to the celebration.
- **Latin source date aliases are not 1962 identities:** St Irenaeus's date-specific source case remains a leading counterexample.
- **The source PDF is a research witness, not a doctrinal authority on its own:** Authenticate exact edition/reprint, read rubrics and contextual page headings, and then verify Bible edition wording separately.

## Next work in priority order

1. Complete visual heading+Latin comparison for the **37 other multi-section candidate paths** before tackling one-line ambiguous hits.
2. Triage the **56 remaining HIGH paths without strong page clusters**, starting with inherited Commons, alias paths and context-specific special chant sections. Avoid treating OCR silence as calendar exclusion.
3. Establish exact 1962 feast/commemoration/votive/transfer conditions, including the complete Missing Commons evidence; then collate each confirmed Bible verse against **Clementine Vulgate**, **Crampon**, and **Douay-Rheims**, with traditional Psalm numbering and Esther/Daniel special mapping.
4. Only then allow actual Scripture links into the existing `learn.mass`, reader bridge and Bible Atlas; author-attributed typology and devotional meditation stay separate from quoted liturgical wording.

All research flags remain closed, no LIVE/Mass reader/Calendar/Atlas mutation, and PR #1018 stays draft.
