# Biblical Theatre — complete Schuster chapter index and French witness access
**15 October 2026. Research only. No author's text imported, no AI-authored narrative.**

## Significant verified discoveries

1. The historical original-author corpus is Schuster's *Illustrated Bible History*; Knecht's first-English-edition introduction credits his book's **narrative** to Schuster. Knecht is a separate doctrinal/moral commentary reader, not an independent second historical narrator.
2. Direct image inspection of the **complete six-page table of contents** of the TAN Books **2014 reproduction of the thirty-second edition** (1950 imprimatur) verifies **86 numbered Old Testament chapters + 96 New Testament chapters = 182 authored chapter headings**. The source is https://tanbooks.com/content/IllustratedBibleHistory_Preview.pdf , zero-based PDF pages **4–9**. The first printed narrative chapter begins on PDF page **10** and carries enumerated internal story paragraphs. These are verifiable **modern-edition** observations, **not** a collation against the original English 1925 nineteenth edition. The modern edition expressly reserves copyright in its typography and is **not** an import source.
3. The full French *Histoire biblique de l'Ancien et du Nouveau Testament* is **listed as a free 296-page historical ebook**, **Herder 1887**, at https://play.google.com/store/books/details/I_Schuster_Histoire_biblique_de_l_Ancien_et_du_Nou?id=iuUejjayBWEC . Independent historical library record identifies its translator as **Abbé Marie-Barthélemy Couissinier**: https://www.cageweb.be/catalog?f%5Blanguage_facet%5D%5B%5D=fre&f%5Blibrary_facet%5D%5B%5D=GBSG&f%5Bpub_date%5D%5B%5D=1887&per_page=60&q=&search_field=author&sort=score+desc%2C+pub_date_sort+desc%2C+title_sort+asc . This is a **digital access breakthrough**, but the actual 1887 book's PDF/page images and chapters have **not** been opened and collated. A free ebook listing does not, on its own, clear reproduction.
4. A separate **96-page French Schuster abridgement, Herder 1882**, is available as a free ebook listing at https://play.google.com/store/books/details/I_Schuster_Abr%C3%A9g%C3%A9_de_l_histoire_sainte_%C3%A0_l_usage_d?id=9KzaCGDY0ecC . It should remain a separately sourced short reading option; do not generate an AI abridgement and do not assume it is word-for-word derived from the 1887 French edition.
5. The historical **1925 nineteenth English edition** is held at https://archive.org/details/in.ernet.dli.2015.49638 with full scanned-book PDF and OCR download options. The PDF fetch from this working session **timed out**, and no physical printed page-image of the 1925 edition was checked. The OCR remains unproofread. This is **not** one checked/approved source paragraph.

## New structured deliverable

`data/explore/biblical-schuster-182-chapter-toc-evidence.v1.json` contains **all 182 observed chapter numbers, topic labels, starting printed page numbers, PDF-preview page evidence and edition/reproduction-status flags**, preserving source order. Its labels are deliberately compact chapter *topic metadata*, **not** copied continuous historical prose.

| Original author's book section (modern TOC witness) | Chapters | Printed page starts in TOC |
|---|---:|---|
| Old Testament | 86 | 1–210 |
| New Testament: Christ's life and Acts | 96 | 213–385 |
| Appendix | Not numbered as a chapter | 386 |

The source's topics include chapter XXVIII, *Job's Patience* (p.54), XLVII *Ruth's Affection* (p.103), three chapters on Tobias (pp.156, 159, 163), Judith (p.172), Esther (p.194), and the Maccabees (pp.202–206). The source also recounts much more of Our Lord's parables and the apostolic era than the existing selected Atlas stops. **This is topical evidence only**, not proof of complete inspired-Catholic-73-book coverage.

**Critical crosswalk constraint:** The 151 existing Atlas milestones are navigation points, not a mandate to reduce the book's 182 chapters to 151 summaries. An authored chapter can contain several or no selected milestone IDs. The correct reader follows Schuster's **complete original chapter order** and dynamically synchronizes the map/timeline/genealogy wherever evidence supports it. An unmapped source chapter stays available as book text; no invented pin/era/verse equivalent.

## Next source-parser handoff — one canonical ingestion pipeline

Owner: existing source-text parser PR #1229. This Atlas PR contributes only bibliographic, contents and event-reference metadata.

**English**: acquire/read the 1925 nineteenth edition (or independently verified pre-1931 English Schuster witness) as printed page images, compare sample chapter I, II, III, IV, VI, XXVIII, XLVII, LXXIV, LXXXIII, NT I, NT V, NT LXIV, NT LXXXII, NT XCVI against the later TOC without assuming equality. Make original chapter/paragraph and page identifiers, record OCR corrections. For any chapter with alternate authored text, preserve the edition identity rather than normalizing it silently.

**French**: obtain/view the actual 1887 Couissinier ebook or printed scan, record its own numbered chapter boundaries and source paragraphs; make an editorial **chapter-level** comparison rather than assuming one-to-one translation alignment with English 1950 or 1925. Use the 1882 Schuster *Abrégé* as an optional separately authorized short original text after independent witnessing.

**Translation**: faithful AI-assisted translation is **allowed** only after an exact original authored source paragraph is recorded, if a suitable historical human translation is not available. Keep original wording, meaning, source boundary and attribution; never invent bridging paragraphs, freely rewrite, trim or mix books. Translation must be labelled and editorially verified.

**Licensing/release**: no permission requests. Independently review historic original publication and translator rights for app territories. Never import the modern TAN 2014 page artwork/typesetting. Reproduction approvals: **0**. Proofread/approved original source paragraphs in this batch: **0**. Production app changes: **0**.

## Coverage progress (distinct denominators)

- **182/182** complete modern-English-edition source TOC chapter headings indexed (bibliographic navigation only).
- **151/151** existing canonical Atlas milestone keys previously indexed (selected timeline anchors, not the book).
- **28/73** biblical books directly referenced in the original 151 milestones (this is not Schuster's corpus coverage).
- **1887 French digital listing found: yes. Actual page transcription verified: no.**
- **Approved authorial narrative text for Ad Orientem: 0**.

Release and publication status: **HOLD**. This research has been committed to existing Biblical Atlas draft PR #1069 and is being handed to Source Parsing PR #1229; no competing ingestion system.
