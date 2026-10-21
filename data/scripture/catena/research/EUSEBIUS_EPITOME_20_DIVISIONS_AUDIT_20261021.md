# Living Catena — Eusebius *Gospel Problems and Solutions*: complete abridged-question inventory
**21 October 2026 | Research-only, no Messenger publication**

## Principal witness and scope

The main surviving *abridged selection* has **16 numbered divisions To Stephanus** (concerned chiefly with the opening genealogy/infancy narratives) and **four To Marinus** (resurrection narratives). It is not the full Eusebian work and is not guaranteed to transmit Eusebius's original wording verbatim.

Primary witness and public catalog:
- [Vatican, Biblioteca Apostolica Vaticana, Pal. gr. 220](https://digi.ub.uni-heidelberg.de/de/bpd/beschreibungen/bav_pal_gr_220.html), dated to the **first half of the tenth century**; *Ad Stephanum* fol. **61r–88r** and *Ad Marinum* fol. **88r–96r**.
- Manuscript catalog supplies the four individual *Marinus* folio ranges: **I 88r–89r; II 89r–92r; III 92r–94r; IV 94r–96r**. Do **not** fabricate similar individual folios for the 16 Stephanus divisions.
- Published modern source-navigation reference: [Roger Pearse's announcement of the 2010 *Gospel Problems and Solutions* edition](https://www.roger-pearse.com/weblog/2015/12/12/eusebius-of-caesarea-gospel-problems-and-solutions-now-online-in-english/). That edition includes a 2008 licensed Greek critical text and translations, whose copyrights survive online free availability.
- Readable example of one Greek/English section: [Catholic Library — Eusebius, To Marinus I](https://catholiclibrary.org/library/view?chunk.id=00000003&docId=%2FFathers-Synchronized-EN%2FEusebius_Caesariensis__Quaestiones_evangelicae_ad_Marinum.en.html); only a short incomplete Greek anchor is indexed.

The previous research already indexed **three additional *supplementa* to Marinus (IV, V, XI)**. These are **not** three more chapters of the four-question epitome. The source family must preserve `epitome`, `catena_fragment`, `supplement`, `ancient_translation`, and `modern_edition` as different textual witnesses.

## Result of this pass

See [eusebius-epitome-20-questions.v1.json](eusebius-epitome-20-questions.v1.json), a structured 20-record **source-navigation register**:

- **16/16** Stephanus abridged divisions and **4/4** Marinus abridged divisions, in source order.
- **33** existing canonical Catena **pericope references**, each verified by actual original biblical verse coverage. These are **not** 33 Eusebius quotations, theological endorsements, or verified same-work excerpts.
- No new author answer text, translation, speech reconstruction or pseudo-historical quote.
- Every displayed-looking English question is labelled **modern editorial formulation** based on the issue heading, *not* ancient verbatim phrasing.
- The only copied Greek phrase is a **short incomplete primary-witness anchor** from Marinus I, not a complete supposed authorial question. The historical voice there is **Marinus addressed by Eusebius**, not Eusebius asking himself.
- Solution texts for 18 divisions have **not** been independently verified in this batch. Marinus I's **two alternative approaches** have been read in context as displayed at Catholic Library, and **Marinus II** has a preliminary source-observed account of multiple visits versus similarly named women; neither is published as Eusebius's final judgement. All require original-Greek/contextual validation.

### To Stephanus — abridged sections and their main issues

| Section | Original issue (editorial paraphrase) | Core Gospel anchor |
| --- | --- | --- |
| I | Why Joseph's, not Mary's, genealogy is related | Matthew 1:16; Luke 3:23 |
| II | Downward vs upward ancestral lists; Abraham vs Adam | Matthew 1:1; Luke 3:38 |
| III | Solomon/Nathan genealogical divergence | Matthew 1:16; Luke 3:23 |
| IV | Africanus's treatment of the genealogy | Matthew 1:16; Luke 3:23 |
| V | Why David precedes Abraham | Matthew 1:1 |
| VI | Why Matthew starts with Abraham, not Adam | Matthew 1:1 |
| VII | Why Tamar appears | Matthew 1:3 |
| VIII | Uriah's wife in the genealogy | Matthew 1:6 |
| IX | Ruth in the genealogy | Matthew 1:5 |
| X | Jehoiakim/Jeconiah naming | Matthew 1:11 |
| XI | Matthew's three genealogical groups | Matthew 1:17 |
| XII | From David to the exile: seventeen kings versus fourteen generations | Matthew 1:17 |
| XIII | From Jeconiah to Joseph: twelve names versus fourteen generations | Matthew 1:17 |
| XIV | Christ being recognized as the carpenter's son | Matthew 13:55 |
| XV | Christ's promised reign on David's throne | Luke 1:32 |
| XVI | Egypt, Jerusalem and Nazareth in the infancy narratives | Matthew 2:13; Luke 2:22,39 |

**Question IV is a high-risk provenance exception.** The transmitted section is specifically styled as genealogy material **from Africanus**. Both ancient Eusebius *Ecclesiastical History* I.7 and medieval excerpts transmit Africanus's reasoning. A reader must not receive an unqualified message containing Africanus's words under Eusebius's first-person name. The source hierarchy should record *authorOfQuotedPassage* and *compilerOrTransmitter* separately.

### To Marinus — four actual abridged divisions

| Section | Historical issue (editorial paraphrase) | Passage anchors |
| --- | --- | --- |
| I | Matthew's and Mark's resurrection timing | Matthew 28:1; Mark 16:9 |
| II | Mary Magdalene's appearance at the tomb on different days | Matthew 28:1; John 20:11 |
| III | Touching Christ's feet vs the prohibition on touching | Matthew 28:9; John 20:17 |
| IV | One/two angels or young men and their positions at the tomb | Matthew 28:2; Mark 16:5; Luke 24:4; John 20:12 |

**Marinus II:** The online source also puts forward multiple conditional reconciliations of the Magdalene account: repeated visits by one woman, a distinction between similarly named women, and a hypothetical textual/scribal naming issue. These are **Eusebius's transmitted conjectures**, not historical facts established by Living Catena. In particular, do not assert that two women called Magdalene actually existed or that the evangelists' received manuscripts are corrupt. Modern Greek-edition scrutiny remains pending.

**Marinus IV:** The existing `eusebius-marinus-supp-05` record concerns related angel-location difficulties in an *independently transmitted supplement*, **not** evidence that its wording or argument is identical with the four-question epitome's IV. The database links the thematic relationship only, with the witness boundary intact.

**Marinus I:** Eusebius's transmitted treatment distinguishes a possible argument for ending Mark at 16:8 (as witnessed in certain copies) from another interpretation that accepts the additional passage and inserts a punctuation distinction between Jesus rising and his appearance to Magdalene. These are **different proposed solutions**, not a single statement of what Catholics must conclude. Preserve both with their conditional framing, source text, and ancient textual criticism.

**Doctrinal caveat:** Christianity's confession of the Resurrection is not in question. The exegetical difficulty concerns evangelists' narrative chronology and manuscript testimony. Living Catena must identify and preserve that distinction rather than make a false doctrinal controversy out of the harmonization.

## Preservation and publication policy

The [canonical Catena reader corpus](../manifest.v1.json) remains the only source supplying existing English Father excerpts. Matching a verse does not establish that the patristic author directly answered a modern question, and matching an author name does not establish textual identity with this *Quaestiones* edition.

For the historical source layer, keep:
1. The **abridged division number** and folio range (only at granularity supported by manuscript catalog).
2. **Historical questioner** (Marinus, Stephanus, narrated hypothetical objector, or unknown); don't default every question to Eusebius.
3. **Quoted source author** (notably Africanus), **transmitting compiler**, and the **modern issue label** separately.
4. **Scripture locations**, including several passages for comparison; never force a one-verse mapping.
5. **Possible solution variants** and **conditionality**; if no verified solution has been mined, mark it *unreviewed*.
6. **Original Greek** only after a source/edition/rights check and a literal span match; modern English translated summaries are not Father's user-facing speech.
7. Explicit no-answer/no-match display until a reviewed source passage is available.

A scholarly discussion suggests that the Stephanus epitome's sections III–IV may separate what was one question in the original work. This is another reason to call **16 the surviving abridged divisions**, not automatically 16 autonomous Eusebian original questions. This issue remains to be settled by comparison of editions.

## Quality gates and tests

The independent [source guard](../../../../tests/scripture-catena-eusebius-epitome.mjs) checks 20 uniquely numbered divisions, exactly 33 Scripture-location Catena crosslinks, source/voice separation, the Marinus I Greek anchor, the Africanus exception, and non-publication policy. It also asserts that the prior independent Marinus supplement and earlier Eusebius pilot are still retained.

The test is integrated into the existing **Living Catena Quaestiones research integrity** workflow. This is a reproducible index-validation pass; neither it nor passing CI certifies all 20 ancient solutions or the reading of every paragraph.

## Next content pass

Deep-extract solution argument structures and historical Greek question headings in the order **Marinus I–IV**, then **Stephanus I–III, IV (Africanus separated), V–XVI**, then relevant separately-attested Greek/Syriac/Arabic/Coptic fragments. Original question text, source-original span, exact work position, multiple hypotheses, historical compiler/quote author, English translation provenance and confidence remain mandatory. No payments or rights-holder outreach form part of the planned workflow.
