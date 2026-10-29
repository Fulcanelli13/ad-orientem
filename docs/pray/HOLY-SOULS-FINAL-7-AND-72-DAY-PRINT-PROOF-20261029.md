# Holy Souls — final seven proper-prayer source-word proofs

**29 October 2026 · Ad Orientem Prayer · final 72-day historical English body collation**

## Conclusion

The seven remaining previously corrected **Holy Souls in Purgatory** daily proper English prayers were inspected **start to finish** against photographic scans of the actual Redemptorist *Manual of the Purgatorian Society* (copyright 1894; scanned copy carries a 1907 imprimatur). The earlier seven targeted English V4 print corrections already match the book pages **without new changes**. The N3 donor text, all English prayer words, editorial French translations, reader navigation and progress persistence were not modified in this review.

**72/72 different English proper daily prayer word sequences** from eight source-book novena programmes have now been checked against the accessible historical printed-source page images. This counts the proper daily body alone, *not* a full devotion or authenticated first printed edition.

Original source image set: SHA-256 `3739d066b2ac6de5b31c73242552ad3726a05aa02fe5f6babf8e04155952c113` for [Redemptorist Manual original PDF](https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf). Prints are located by their **printed page labels**, with the exact corresponding zero-based PDF page indices retained below.

## Seven full-body word-sequence decisions

| Day | Printed original page(s) | PDF indices zero-based | Editorial result | Original page image proof |
|---|---|---|---|---|
| **1** | 199–200 | 198–199 | Complete text checked, including the original “how great would be my suffering” and “I wish to die”; no further changes | [Original-source run 40872727022](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40872727022) |
| **2** | 202–203 | 201–202 | Entire text confirmed, including “who have spent on earth so many years” | Same 10-exception original page capture |
| **4** | 204–205 | 203–204 | Entire text confirmed, **including actual continuation on p.205**, previously omitted from automated [202,203] research window | Same run, additional p.205 rendering |
| **5** | 205 | 204 | “O infinite Good,” the complete previously omitted “I wish rather to die…” sentence, and the entire surrounding prayer checked | [Original four-book run 40881455788](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40881455788) |
| **6** | 206–207 | 205–206 | Entire text confirmed, including “O supreme Good” and concluding maternal intercession | Original 10-exception capture |
| **8** | 208 | 207 | Complete prayer on a single printed page, including **“I wish rather to die than ever again offend Thee”** rather than modern “will”; checked beginning and end | Original four-book run |
| **9** | 209–210 | 208–209 | Entire text checked through p.210, ending **“in danger of eternal damnation”** before the distinct De Profundis begins | Original 10-exception capture |

*Holy Souls days 3 and 7* had previously passed the same complete original-picture word-sequence check (both entirely on printed pp.203 and 207 respectively). The Holy Souls cohort is now **9/9**.

Each original-source image name, exact actual PDF index, copy-specific SHA-256, per-day status, source-run identity and the older correction provenance are saved in the updated [72-body review source of truth](../../data/pray/original-print-72-body-visual-proof-20261029.v1.json). Images come from the archived, ephemeral 3-day GitHub Actions captures, which are reproducible from the preserved PDF fingerprint, free original PDF URL and source page renderer; no large PDF binaries are committed to GitHub.

## The exact scope of completion

| Historical source cohort | Proper day-prayer bodies visually checked | Remaining |
|---|---:|---:|
| Callan/McHugh `Blessed Be God` (accessible later printed copy, **not proven 1925 first printing**) | 18/18 | 0 |
| Moran, 1883 *The Catholic Prayer Book* | 18/18 | 0 |
| Hammer, 1909 *Mary, Help of Christians* | 27/27 | 0 |
| Redemptorist *Manual of the Purgatorian Society*, scanned copy with 1907 imprimatur | **9/9** | **0** |
| **All eight nine-day programmes** | **72/72** | **0** |

This does **not** certify:
- the complete text or correct order of the **entire devotional forms**, such as common Our Fathers, Hail Marys, repeating verse, *Prayer to Our Suffering Saviour*, litanies, optional meditations or practices and date rules;
- the physical copy as an authenticated **earliest printing**, especially Callan, whose copy includes post-1933 content despite the original 1925 copyright;
- a **historical original French printed witness** — the reader's French continues to be explicitly editorial;
- the applicability and full conditions of **contemporary indulgence grants** — historical printed indulgence directions have not been promoted as current law;
- the rest of the Ad Orientem **Prayer library**, which includes repeated-prayer novenas, other specialised novenas and many non-novena devotions.

These are different workstreams and the ledger deliberately retains **zero** first-edition, complete programme, historic French and modern indulgence certificates. “72/72” refers **only** to the English proper daily body word sequence as viewed in the available scanned book copies, with typographical normalization for punctuation, capitalisation and printer line-break hyphenation.

### Recommended next task — programme completeness gate

Stop re-reviewing the 72 already-checked day bodies. Audit the **16 existing bilingual core novenas plus three additional specialist novena forms**, treating every component as a first-class item: preparatory prayer, proper daily body, common responses and repetition counts, closing prayer, accompanying meditation, practice, source attribution, start-date/schedule and French language behaviour. Establish a component denominator from the runtime data before reporting any completion percentage. Correct real missing elements at that stage, keeping the N3 source donor frozen.

**Release scope of this PR:** final seven photograph-backed editorial proof dispositions + regression assertions + this report. **No live prayer text or reader behaviour changes.**
