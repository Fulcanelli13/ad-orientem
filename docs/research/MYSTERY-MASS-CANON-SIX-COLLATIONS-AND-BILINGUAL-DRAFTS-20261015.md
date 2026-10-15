# Mystery of the Mass — Canon original-edition transcription pass, six merges and five theological questions

**15 October 2026 — branch-only research; not publication approval**

The prior [32 same-author case ledger](../../data/learn/research/mystery-mass-canon-32-comparison-adjudication-20261015.v1.json) and [39→65–67 handoff](../../data/learn/research/mystery-mass-39-to-curated65-67-source-author-handoff-20261015.v1.json) are kept intact. This targeted continuation did not re-audit all 422 historical evidence records and did not create another source/work identity register.

## Source witness integrity

| Author or corpus | Text consulted | What is **verified** | What is **not** yet verified |
|---|---|---|---|
| Guéranger, *Explication des prières de la sainte messe* | [1885 second-edition online French transcription](https://www.domgueranger.net/explication-des-prieres-de-la-sainte-messe-2/) | French source passages for Memento, Hanc igitur, Quam oblationem, Supra quae, Supplices | Comparison with original paper pages, autograph of the lectures, accuracy of stenographic notes |
| St Alphonsus, *Short Explanation of the Prayers of Mass* | [1887 Grimm-edited English Centenary edition vol. VI](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ/Short_Explanation_of_the_Prayers_of_Mass) and [1887 edition notice](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ) | Accessible English passage and editor's historical source uncertainty | Complete original Italian and French source collation, printed-page line-by-line verification |
| Nicholas Gihr, *The Holy Sacrifice of the Mass* | [1902 English translation/OCR](https://archive.org/stream/holysacrificeofm00gihriala/holysacrificeofm00gihriala_djvu.txt), §61 pp.658–660 | Accessible OCR at internally marked printed pages for Abel, Abraham and Melchisedech | Original German sixth edition, original paper-page image proof and OCR character-by-character certification |
| St Thomas Aquinas, *Summa Theologiae* III q.83 a.4 ad 7–9 | [Parallel Latin and English edition/transcription](https://www.logicmuseum.com/wiki/Authors/Thomas_Aquinas/Summa_Theologiae/Part_III/Q83) | Latin and translated passages distinguish fruitful consecration, devotion of patriarchs and angel interpretations | Critical Latin manuscript/edition collation |

**Bibliographic correction of substance.** St Alphonsus died in 1787; Guéranger was born in 1805. Hence the unnamed **French source that Alphonsus himself cites** cannot be Guéranger, even though their Christological interpretations resemble one another. The **1887 English editor's notice** considers *L'Idée du Sacerdoce et du Sacrifice de Jésus-Christ* associated with de Condren / an Oratorian edition and openly says the source identification is uncertain. This is a **source-provenance research lead**, not an approved canonical author/witness ID. Do not import it as a proven source, nor silently assert independence of two parallel readings.

The Guéranger volume's own foreword calls its material notes collected from conferences and cautions that unfaithful note-taking may account for inaccuracies. Attribute as *Guéranger conference notes (1885 ed.)*, not demonstrably autograph verbatim text.

## Six candidate consolidations — verified in accessible historical text

| Two source IDs (both preserved) | Canon cue | Source-level disposition |
|---|---|---|
| `VER-032 / I062` (Alphonsus) | `AO.SM.C0187` | One account of two interpretations of the holy Angel. Created angel vs Christ remains an **attributed variant**, not an editor's dogmatic ruling |
| `VER-045 / I006` (Guéranger) | `AO.SM.C0156` | Faith and devotion of the attendants: one concise explanation, separate source lineage retained |
| `VER-049 / I016` (Guéranger) | `AO.SM.C0164` | One word-level *rationabilem* explanation; preserve separate cross gestures and later Eucharistic change |
| `VER-057 / I054` (Gihr) | `AO.SM.C0186` | Abel's faith and innocent blood form one subpassage; heavenly fire is **explicit conjecture** |
| `VER-058 / I056` (Gihr) | `AO.SM.C0186` | Abraham's offering typology; **Isaac was not killed** |
| `VER-059 / I058` (Gihr) | `AO.SM.C0186` | Melchisedech priestly typology; do **not** claim Genesis 14 says bread and wine were ritually sacrificed |

These are comparisons of original/translated editions as online transcriptions. **Printed-page image collations completed: zero.** No original claim ID was deleted, merged or registered again.

## Five interpretative dossiers

1. **`AO.CANON.10` — *Supplices te rogamus*.** Guéranger directly identifies the Angel as Christ, Aquinas gives both readings, and the 1887 Alphonsus translation prefers the angel's prayer-presentation interpretation. The prayer is not a physical removal of the Body of Christ or sacramental species.
2. **`AO.CANON.09` — *Supra quae*.** The prayer's comparison with Abel, Abraham and Melchisedech regards the offerers' devotion, not parity with Christ's sacrifice. Each biblical type stays distinct.
3. **`AO.CANON.05` — *Quam oblationem*.** The five words, spiritual/mystical readings and associated crosses are separate layers. Aquinas's *ut nobis* reading is not identical to Guéranger's lexical gloss.
4. **`AO.CANON.04` — *Hanc igitur*.** The extended hands may be contemplated using Old Testament sacrificial parallels, but historical direct derivation is **unproved**; the rubrical action still requires its independent priest-action record.
5. **`AO.CANON.07` — chalice consecration.** The received Roman form relates to several New Testament witnesses and tradition; it is not a verbatim quotation of one biblical verse. The 1962 Missal remains controlling.

## Actual bilingual writing delivered

[Eleven EN/FR cue-level drafts](../../data/learn/research/mystery-mass-canon-six-pair-five-issue-bilingual-drafts-20261015.v1.json): **six concise** explanatory texts and **five deeper** study texts. All eleven have been validated against the exact Latin cue source and their respective `AO.CANON.*` owner; the chalice formula correctly targets curated presentation card `AO.LIVECURATED.AO.CANON.07.2`.

The content is not a new standalone module, and no content was copied directly from the older texts. Each draft inherits the relevant existing entry in [the 14 Canon critical studies](../../data/learn/research/mystery-mass-roman-canon-14-critical-narrative-20261014.v1.json) and their older bilingual manuscripts. App editorial reviewers can adopt the new micro-commentary under those original owners if independently approved.

**New regression gate:** `tests/mystery-mass-canon-source-collation-and-bilingual-drafts.mjs`, added to the existing `.github/workflows/mystery-mass-editorial-inventory.yml`. Its assertions cover the six old ID pairs, five issue IDs, no text-publication permissions, eleven EN/FR bodies, live Latin substring / Canon block matches and the inherited 65-model card IDs. GitHub Actions is the final execution proof, not the act of adding a test file.

## Remaining narrow release work

- Verify actual printed pages and the 1887 English editor's source note against primary scans before claiming original-edition facsimile certification.
- Investigate whether the earlier French model underlying Alphonsus can be identified *independently*; do not register de Condren, Quesnel or any other conjecture as confirmed.
- Check the exact 1962 rubrical gesture event for `Hanc igitur` separately from its prayer cue, and recheck the author's historical inference about Gregory the Great rather than presenting it as fact.
- Resolve Source/Reference edition, witness, rights, and reliable deep links in the existing pipeline.
- Collate and proofread bilingual new text, check overlap with 44 pre-existing bilingual research dossiers and obtain in-app editorial approval. Do not change production `Mass` or publish `learn.mystery_mass` until those independent gates pass.

[Machine-readable six/five source record](../../data/learn/research/mystery-mass-six-pair-five-issue-text-collation-20261015.v1.json) · [Eleven EN/FR micro-explanations](../../data/learn/research/mystery-mass-canon-six-pair-five-issue-bilingual-drafts-20261015.v1.json).
