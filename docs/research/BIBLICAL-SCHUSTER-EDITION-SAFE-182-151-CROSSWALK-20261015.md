# Schuster historical Catholic Bible History — edition-safe 182-chapter to 151-event join

**15 Oct 2026 • Review only, no author prose imported, no AI-written narrative.**

## Corrected source ownership

Schuster is the underlying historical *Bible History* narrator explicitly named in the first English preface of Knecht's *Practical Commentary*. Knecht's narrative/commentary textual layers and historical editions remain separate source identities. The **later Schuster 32nd-edition table of contents** is independent of the 1910 Knecht contents and the 1925 nineteenth-edition Schuster original scan. Do not equate two sources just because they use the same Roman chapter number.

**Concrete discovered collision:** the current Knecht locator `KNECHT-NT-48` is attached to the Atlas event “Healing of the man born blind at Siloam” (John 9). The inspected **Schuster 32nd-edition printed contents** place “Christ Gives Sight to the Man Born Blind” in **NT XLVII (47), p.294** and **“The Lord's Prayer” in NT XLVIII (48), p.297**. Similarly:
- John 11 raising Lazarus: previous Knecht selector NT LIV (54) vs Schuster NT LVI (56), p.305.
- Bethany anointing: previous Knecht selector NT LV (55) vs Schuster NT LVIII (58), p.310.
- Agony in Gethsemane: previous Knecht selector NT LXIX (69) vs Schuster NT LXVII (67), p.326.
- Arrest: previous Knecht selector NT LXX (70) vs Schuster NT LXVIII (68), p.328.
- Pentecost: previous Knecht selector NT LXXXIV (84) vs Schuster NT LXXXII (82), p.354.
- Apostolic missionary journeys: original Knecht selectors carry yet another numerical pattern; no automatic substitution.

**This does not by itself prove the historical Knecht selectors' numbers were wrong for Knecht.** It proves they cannot be reused as verified Schuster 32nd-edition locators. No original 1925 Schuster page boundaries, 1887 French headings or direct biblical-verse-to-paragraph identities are inferred from these headings.

## Actual delivered data

`data/explore/biblical-schuster-182-to-atlas-151-source-concordance.v1.json` is an editorial concordance comprising all 151 existing canonical `eventKey` references and all 182 chapters of the later Schuster edition.

| Observation | Count |
|---|---:|
| Canonical Atlas milestones | 151 |
| Tentative Schuster later-edition title-topic matches | 106 |
| Milestones without a defensible modern-edition TOC assignment | 45 |
| Distinct Schuster chapters with ≥1 candidate Atlas event | 92 |
| Schuster original chapters preserved as **standalone book chapters** without a selected Atlas stop | 90 |
| Cases where a candidate Schuster numeral differs from the older Knecht selector numeral | 35 |
| Approved original source-text passages | **0** |

For every one of 151 stops, the new file retains its canonical Scripture reference, Atlas event key, previous Knecht section ID (if any), proposed **modern-edition** Schuster chapter topic selector(s), and a permanent source-evidence qualifier. For every one of 182 chapters it retains the author's reading order, its topic and the reverse link list of candidate Atlas milestones. If no milestone belongs to a book chapter, the reader must **still offer the chapter**—never silently drop it or make up a new geographic pin.

The modern numbered contents were inspected directly in the original publisher PDF preview:
- https://tanbooks.com/content/IllustratedBibleHistory_Preview.pdf , PDF page **8 (zero-based index 8)**: NT XLVII–LXVIII;
- PDF page **9 (zero-based index 9)**: NT LXIX–XCVI.
The modern TAN reprint is **not an eligible reproduction source**: its 2014 typesetting is publisher-controlled, and 1950 imprimatur/32nd-edition wording cannot be presumed identical to the separately scanned 1925 nineteenth edition.

## Hard safety gate for Source Parsing PR #1229

1. The 1925 print item https://archive.org/details/in.ernet.dli.2015.49638 identifies the historical book but PDF and OCR full downloads **timed out** during this session. We cannot claim even one independently proofread page.
2. The 1887 French Couissinier translation is catalogued at https://www.cageweb.be/catalog.html?f%5Blanguage_facet%5D%5B%5D=fre&f%5Bpub_date%5D%5B%5D=1887&q=schuster , with free 296-page ebook listing at https://play.google.com/store/books/details/I_Schuster_Histoire_biblique_de_l_Ancien_et_du_Nou?id=iuUejjayBWEC . The book's **actual pages are not yet available to this workspace for direct comparison**.
3. The historic Schuster 1925 English chapter images, French Couissinier 1887 chapter images and authorial paragraph text must be examined independently. Then map original-language paragraph ranges to the approved Atlas IDs. Use stable source chapter/paragraph IDs, not cross-edition numerical equivalence, to access text.
4. Preserve the original author chapter sequence and exact words. If the French and English translations differ, mark them as distinct witnesses rather than forcibly aligning the text. If necessary and editorially reviewed, faithfully AI-translate the actual source text with transparent attribution, but **never write an original AI Bible history or synthetic transitions**.
5. Original commentary by Knecht belongs in a separately attributed Read Further layer, not interleaved as Schuster's voice.
6. Uncertain source chapters remain source-only and Scripture remains the fallback, not fabricated narration.

**PR boundaries:** keep this entirely in Atlas research draft PR #1069; the existing source parser PR #1229 owns ingestion, rights, printed-page collation and certification. No permissions requested, no live-app modification.

## Verification

`tests/biblical-schuster-182-to-151-source-concordance.mjs` asserts 151 stable event keys, 182 intact book chapters, 106/45 tentative/unassigned classes, 92 linked and 90 standalone author chapters, source page metadata parity and explicit historic print-uncertainty. It spot-locks the born-blind, Lazarus, Gethsemane and Pentecost exceptions. Commit does not establish that Node CI has been executed; an independent in-memory cross-file validation also checks these invariants.
