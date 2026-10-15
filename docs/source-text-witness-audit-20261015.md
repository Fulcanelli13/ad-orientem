# Source-text Phase 3 — real witness structure audit (15 October 2026)

This is an evidence and locator audit, **not** approval of a downloaded source body or any translation. The independent source parser belongs to draft PR #1229. Module-specific Scripture, Mass, Formation and Prayer owners retain their content and canonical work IDs.

## Inspected HTML witnesses

| External witness | Observed structural evidence | Safe next action | Unresolved |
|---|---|---|---|
| Holy See [*Mediator Dei*, English](https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html) | English body labels include numbered §23–§25 and ending §210; a **separate numbered footnote apparatus** follows | Index paragraph locator and link to official page; reject footnotes as body in selected extraction | HTML-to-edition identification, translation licence, exact footnote crosswalk |
| Holy See [*Mediator Dei*, Latin](https://www.vatican.va/content/pius-xii/la/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html) | Latin introduction and headings; not established that Latin paragraphs match English §1–210 | Keep separate language witness; link only | Full Latin/English collation and original-section mapping |
| EWTN [Tanquerey excerpt 12632](https://www.ewtn.com/catholicism/library/spiritual-life-12632) and [12636](https://www.ewtn.com/catholicism/library/spiritual-life-12636) | Transcription uses internal source numbers **#407, #409, #643**; continuous work is split across URLs | Map each verified section to its verified hosting page; preserve source paragraph identity independently of host URL | Printed English translation edition, completeness, editorial OCR corrections, reproducibility and redistribution rights |
| [Hume Texts Online, First Enquiry §X](https://davidhume.org/texts/e/10) | **E 10.1**, **E 10.12** etc. appear with separate **SBN** printed-page references; site offers edited-text controls | Record E-section/paragraph independently from SBN printed pagination; maintain opponent-primary provenance | Original copy-text and website editorial apparatus/version rights |
| [CCEL, Francis de Sales, *Introduction to the Devout Life*](https://ccel.org/ccel/desales/devout_life.all.html) | Five PARTs, repeating chapter numbers; e.g. Part II, ch. XVII | Use Part+Chapter+paragraph, not global chapter counter | Named English translation/printing and rights; the edition includes visible editorial adaptation (Philothea replaced by child/daughter) |

These pages were opened and manually inspected for **reference shapes**, not mechanically extracted into the application. The registry is `data/source-text/witness-profiles.v1.json`.

## Catalogue-only leads (not inspected body text)

- Denzinger pre-1963 **31st edition (1960)** versus revised **32nd edition (1963)**, both listed in [Open Library](https://openlibrary.org/books/OL16574303M/Enchiridion_symbolorum). The D/DS/DH numbering families must be kept distinct. Neither edition has an approved local textual witness; Denzinger is also an edited collection, so original council/papal documents must not be conflated with its editorial selections.
- Fortescue, *The Mass: A Study of the Roman Liturgy*, [Wikimedia Commons facsimile catalogue](https://commons.wikimedia.org/wiki/File:The_Mass_-_a_study_of_the_roman_liturgy_(IA_cu31924029398553).pdf). Only document/catalogue metadata inspected; **no page-image/PDF collation** performed. Earlier Mass source research points to a separate Archive.org item; printing and printed-page mapping still require review.

## Technical implementation

`src/source-text/witness-locators.js` validates *source-specific* citation grammar, preserving stable anchors for official English encyclical paragraphs, Tanquerey numbers, Hume First Enquiry section/paragraph, and de Sales Part+Chapter. It **refuses** unresolved Latin paragraph mapping and catalogue-only Denzinger/Fortescue locators. Hume SBN page is not treated as an E paragraph. `validateExternalLocatorBinding` permits only registered HTTPS host pages; Tanquerey examples are mapped to the corresponding **specific installment**, with unknown sections held pending inspection. Non-body/footnote records are explicitly refused.

`editionQualifiedCitation` composes unique *work + edition + witness + stable source anchor* keys, preventing two editions from sharing the same citation identity. The legacy standalone demo IDs are unchanged. `extractReviewedWitnessDocument` bridges selected anchors into the already rights-gated `edition-adapters.js` and carries a separately displayed authorial source locator and verified host page into per-passage chunk bodies. The work must match the registered source work and the witness ID must match the selected profile. **The lightweight manifest also carries reviewed source locator, edition-qualified citation and source page**, allowing §23-style metadata searching without downloading full passage bodies; loaded chunks are checked against those index fields to detect mismatches. Older pilot packages without these optional fields remain byte-identical. The editorial `REPRODUCTION_CLEARED` or project-authored-demo rights gate is enforced by the existing extractor.

Native CI includes `tests/source-text-witness-locators.mjs`. All sample *body passages* in that test are **project-authored synthetic control sentences**, not third-party quotes. It checks grammar, incorrect Tanquerey installment links, footnote rejection, work/witness mismatch, rights hold, stable edition-disambiguated citations and one-chunk reading. It never scrapes public web sources and is not proof that real HTML can be imported without a carefully prepared extract.

## Ownership and acceptance boundary

Use official websites as **external reading destinations now**, when appropriate and relevant. Actual local passage text requires, in order: specific printing/transcription version and language recorded → right to redistribute established for app audience → exact authorial paragraph/page verified against print → safe, reviewed local extraction → sample human collation → client/mobile layout, caching, and provenance acceptance.

No source text has been imported in Phase 3; no modification to Mass, 65-card reader, Formation, Prayer, Scripture, Calendar, Explore or homepage. Do not merge PR #1229 or claim production size savings from this stage.
