# Morning / Evening historical prayer texts — B07 print-image certification and correction

**27 October 2026 · draft research PR #1785 · no production changes**

## Material correction — Moran's *Night Prayer* exists

The earlier B04 source-register entry wrongly stated no separate Evening Prayer chapter had been located in Patrick F. Moran's *The Catholic Prayer Book and Manual of Meditations* (Dublin, 1883).

The actual table of contents prints **Night Prayer, p. 12**. The chapter is directly accessible at:
- [Moran 1883 Night Prayer, whole chapter](https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/Night_Prayer)
- [Printed p. 12, digitized scan page 30](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/30)
- [Book index / contents](https://en.wikisource.org/wiki/Index:The_Catholic_prayer_book.djvu)

The Night chapter contains morning/evening common prayers, a penitential introduction and general confession, examination guidance, thanksgiving, protection against danger during sleep, extended contrition, prayers for the faithful departed, **Salva nos** and **Visita quaesumus**.

**Nine descriptive source components** have been added to `data/pray/daily-prayer-additional-manuals.b04.json`, with the original record identities preserved. One component is a subparagraph of another and not a second independent complete prayer. B05 crossmanual family mapping has been extended to all nine. This corrects the book/daypart counts, not merely the summary text.

## Revised inventory denominator

| Source class | Old | Corrected |
|---|---:|---:|
| English books | 7 | **7** |
| English daypart chapter views | 13 | **14** |
| B01 entries | 93 | 93 |
| B04 additional-manual source components | 53 | **62** |
| All English source occurrences | 146 | **155** |
| Initial French/Latin source occurrences | 21 | **21** |
| Total occurrences across English/French catalogues | 167 | **176** |
| Verified independent complete prayer bodies from print images | 0 | **9** |
| Source-print page images supporting 9 bodies | 0 | **3** |

**176 is not unique prayer count.** English source records include examination instructions, a reader-defined slot and one overlapping prayer subparagraph. Six of the French texts and three of the English texts are now visually checked full bodies against three original pages; the rest remain at earlier verification status.

## First nine source-image-certified complete prayer texts

Machine-readable full text: `data/pray/daily-prayer-scan-checked-forms.b07.json`.

**French, 1905 printed edition** containing a *Prières quotidiennes* section, NOT prayer authorship attributable to the Council of Trent:
- [Image p. 38, printed 2*](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38): **Acte de foi**, **Acte d'espérance**, **Acte de charité**, **Morning Thanksgiving and Offering** (combined source prayer), **Morning Resolution** — five complete paragraphs verified against the readable scan image.
- [Image p. 39, printed 3*](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/39): **Prayer for necessary graces**, complete and verified.
- Page images show broken printed lines; the registered texts rejoin line endings and retain period wording. The original Wikisource page 38 and 39 textual transcriptions are marked *uncorrected* and must not themselves be published as authoritative OCR.

**English, Patrick F. Moran 1883:**
- [Image p. 20, printed 2](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20): **Thanksgiving**, **Prayer for Necessary Grace**, **Good Intention**, three complete prayer paragraphs in original printed format.
- Moran's Good Intention contains historical language about earning indulgences. Preserve it only as historical wording; **do not present any printed indemnity or indulgence offer as a current benefit**, or rewrite the prayer and claim historical identity.

Full chapter collation for Moran's recovered Night Prayer is **not yet** print-facsimile-certified beyond inspected p. 12. The existing research remains at source-text candidate status for its separate night prayers.

## How the nine texts fit the user's approved daily-prayer interface

| Daily stage | Certified historical example | Status |
|---|---|---|
| Morning Faith | 1905 French original Acte de foi | Complete image-checked text; editorial choice open |
| Morning Hope | 1905 French original Acte d'espérance | Complete image-checked text; editorial choice open |
| Morning Charity | 1905 French original Acte de charité | Complete image-checked text; editorial choice open |
| Morning Thanksgiving / Offering | 1905 French original composite | Full text checked; **one prayer serving two purposes** |
| Morning Resolution | 1905 French original | Complete image-checked text; optional/preset decision open |
| Morning Supplication | 1905 French original, printed 3* | Complete image-checked text; optional/preset decision open |
| Morning Thanksgiving | Moran 1883 | Full checked; compare other English forms |
| Morning Supplication | Moran 1883 | Full checked; compare with French/other English forms |
| Morning Good Intention | Moran 1883 | Full checked; historical indulgence advisory hold |

No complete English/French cross-language pairs are certified: each text remains in its **original witness language**; translation settings must not silently substitute another prayer.

## QA / remaining release gates

- **9/9** entries contain complete prayer-body text, source page links, headings, and exact source IDs. Original page images were visually examined.
- Original historical text is distinguished from normalized typography, line-wrap repair, and nontextual editorial labels.
- **0** of these nine records are published in the live reader. Edition/image verification alone is not proof of rights over a modern surrounding transcription or permission to copy later embedded authorial work.
- Next: examine complete historical alternative forms and stop at **real distinct prayer versions**, finalize source identity for each French edition, select user-facing Short/Complete presets, then extend existing Morning/Evening cards with choices and independent optional timer.
- Preserve €0 policy and no contacting publishers/owners.

PR remains draft. **No production files changed**.
