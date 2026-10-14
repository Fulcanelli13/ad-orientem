# Lanslots (1897) — Mystery of the Mass source inventory and first Scripture crosswalk

**Date:** 14 October 2026. **Status:** RESEARCH / SOURCE-INVENTORY / **NOT A COMPLETE TEXT COLLATION OR PUBLICATION APPROVAL**. Related canonical historical evidence register: #342.

## Source identity and access

Rev. D. I. Lanslots, O.S.B., *Illustrated Explanation of the Prayers and Ceremonies of the Mass* (Benziger Brothers, 1897; preface by Archbishop F. Janssens). Original digitization: https://commons.wikimedia.org/wiki/File:Illustrated_explanation_of_the_prayers_and_ceremonies_of_the_Mass_(IA_illustratedexpla00lans).pdf ; underlying original: https://archive.org/details/illustratedexpla00lans . The Commons scan is 404 **PDF** pages, distinct from the **printed** page numbering used below.

**Evidence-grade update (14 October):** The [Internet Archive full-text OCR](https://archive.org/stream/illustratedexpla00lans/illustratedexpla00lans_djvu.txt) is now **web-readable** as an 11,057-line transcription. All **25 original chapter headings** were located in that source, and **69 Scripture-reference records** were inspected and indexed across two batches (18 of 25 chapters plus the introduction); the 16 earlier topical claim records were also rechecked against OCR line ranges. The complete OCR has **not** been downloaded into a searchable local text file, the 404 PDF images have **not** been verified page by page, and the 69 reference records are **not an exhaustive book-wide tally**. Printed start pages below derive from the table of contents but have not been certified against page images. OCR can corrupt numerals, names and references; retain explicit versus editorial verse-attribution flags and the 1962/1897 distinction. No prayer, 1962 rubric, cue, actor or native reader is changed.

## Canonical owner reconciliation

- `data/presentation/guide-registry.v1.json`: 32 historical entries: AO.CARD.001–030 + PRE.ASPERGES + POST.MASS. The validator deliberately requires exactly 32; *do not* append Lanslots extracts as 33+ Guide records or mutate the registry's continuity status.
- `src/mass/reader-live-source.js` currently projects **39 source-first LIVE steps** from 30 base macro cards by replacing five Canon macro cards with 14 separately source-owned Canon segments. Historical **48** is optional parity/archaeological evidence, not the normative current mapping. `src/mass/reader-guide.js` can provide inherited Guide context; it does not certify 39 independent editorial Guides.
- `data/learn/mass-formation-campion.v1.json`: existing eight sequential formation stages; deepen stage claims through reviewed, separately linked sources without duplicating the course.
- `src/scripture/context.js`: single reference parser and shared Scripture owner; respects Catholic book names and Psalm numbering. No second Bible-text store; source/passage lookup must preserve card and reading position.
- `docs/research/MASS-RESEARCH-ARCHIVE-INDEX-20261013.md`: retains Guéranger first/second pass, September evidence, 1962 normative witnesses and the Guéranger-vs-1962 correction register. Lanslots complements, never supersedes, those sources.

## All 25 chapters located in original web OCR (printed pages not visually certified)

Each `AO.CARD` designation here is a **topic-level bridge to existing 30 macro Guides**, not a direct page or phrase locator. The [39-step source-first crosswalk](../../data/research/mass-lanslots-1897-source-first39-map.v1.json) now assigns the **existing** macro IDs and certified Canon block/cue ownership; topic matches still require actual original-page verification.

| Chapter | Printed start | Original chapter title | Provisional existing Guide owner(s) | Editorial extraction target |
|---|---:|---|---|---|
| I | 13 | The Altar | PRE.ASPERGES; AO.CARD.001 | altar theology, saints and martyrdom |
| II | 18 | Altar Decorations | AO.CARD.001 | church furnishing symbolism |
| III | 25 | The Chalice and Its Appurtenances | AO.CARD.010; AO.CARD.016; AO.CARD.026 | objects versus their sacramental use |
| IV | 30 | The Priestly Vestments | AO.CARD.001 | vestment prayers and symbolism |
| V | 40 | The Liturgical Colors | AO.CARD.001 | do not replace 1962 calendar colour authority |
| VI | 51 | The Liturgical Language | AO.CARD.001 | history and spirituality, not current discipline |
| VII | 57 | The Beginning of Mass | AO.CARD.001 | introductory penitence |
| VIII | 69 | Incensation, Introit, and Kyrie | AO.CARD.001; AO.CARD.002 | heavenly worship and penitential address |
| IX | 77 | The Gloria and the Collects | AO.CARD.003; AO.CARD.004 | angelic praise and common prayer |
| X | 86 | Epistle, Gradual, Tract, and Sequence | AO.CARD.005; AO.CARD.006 | do not derive exact variable Proper sequence |
| XI | 93 | The Gospel | AO.CARD.007 | prophetic purification and proclamation |
| XII | 100 | The Credo | AO.CARD.009 | articles of the Creed |
| XIII | 117 | The Offertory | AO.CARD.010 | types, oblation and sacrificial preparation |
| XIV | 133 | Incensing and Washing of Hands | AO.CARD.010; AO.CARD.011 | incense interpretation is not binding action count |
| XV | 145 | The Orate Fratres, the Secrets, and the Preface | AO.CARD.011; AO.CARD.012; AO.CARD.013 | communal offering and celestial praise |
| XVI | 162 | First Prayer of the Canon | AO.CARD.014 | Canon history and its ecclesial intercession |
| XVII | 175 | From the Commemoration of the Living to the Second Prayer | AO.CARD.014 | prayer for the Church living and triumphant |
| XVIII | 199 | From the Second Prayer to the Consecration | AO.CARD.014 | specific Canon petition boundaries |
| XIX | 209 | The Consecration | AO.CARD.015; AO.CARD.016 | sacrament, sacrifice, doctrinal distinction |
| XX | 221 | The First Prayer after the Consecration | AO.CARD.017 | Passion/Resurrection/Ascension; Old Testament sacrifices |
| XXI | 239 | The Second and the Third Prayer after the Consecration | AO.CARD.017 | communion of saints, intercession |
| XXII | 256 | Conclusion of the Canon, the Pater Noster, and the Libera | AO.CARD.018; AO.CARD.019; AO.CARD.020 | doxology, Lord's prayer, deliverance |
| XXIII | 272 | From the Breaking of the Host to the Communion | AO.CARD.020; AO.CARD.021; AO.CARD.022 | symbolism vs sacramental reality |
| XXIV | 287 | The Communion | AO.CARD.023; AO.CARD.024; AO.CARD.025 | Eucharistic participation; centurion saying |
| XXV | 308 | The Thanksgiving and the End | AO.CARD.026; AO.CARD.027; AO.CARD.028; AO.CARD.029; AO.CARD.030; POST.MASS | conditional 1962 endings require own authority |

## Scriptural/theological claim candidates — citation and certainty discipline

**Historical first-pass classifications below are preserved as a dated snapshot.** They have been superseded by the [16-claim original-OCR differential](../../data/research/mass-lanslots-1897-claim-differential.v1.json), where every candidate now carries a checked OCR line range and an explicit differentiation between printed citation, biblical allusion and editorially supplied parallel. For **43 distinct OCR-inspected reference candidates**, use the [batch-one Scripture register](../../data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json). Neither register is an exhaustive full-book extraction or a certified PDF-page collation.

| ID | Book / printed locator | Topic and canonical landing | Scripture passage | Evidence | Review and source-critical instruction |
|---|---|---|---|---|---|
| LAN-001 | VIII, p.70 | Incense / AO.CARD.001; AO.CARD.002 | Revelation 5:8 | OCR_EXCERPT_REVIEWED | Lanslots explicitly interprets golden vessels of perfume as prayers of saints. Differentiate biblical heavenly worship from unsupported historical-origin claims. |
| LAN-002 | VIII, p.70 | Incense / AO.CARD.001 | Matthew 2:11 | OCR_EXCERPT_REVIEWED | Lanslots mentions the Magi's gifts of gold, frankincense and myrrh; historical polemics about their being the 'first' New Testament incensers require nuance. |
| LAN-003 | VIII, p.70 | Incense / AO.CARD.001 | Leviticus (book level; no specific passage verified) | OCR_EXCERPT_REVIEWED | He invokes Levitical sacrificial/incense prescriptions. Exact verses must be collated, not invented. |
| LAN-004 | XIV, p.134 | Offering-incensation / AO.CARD.010 | Revelation 8:3–4 (check precise allusion) | OCR_EXCERPT_REVIEWED | Text refers to an angel holding a censer, and spiritual readings of multiple cross-shaped incensations. Explicit Apocalypse verse and historical rubric provenance need confirmation. |
| LAN-005 | XX, p.221–222 | Canon / AO.CARD.017 | Revelation 5:6 | OCR_EXCERPT_REVIEWED | Lanslots relates John's Lamb standing as slain to the sacrificial memorial, while expressly saying Christ dies no more. Avoid literal 'Christ dies again' language. |
| LAN-006 | XX, p.222 | `Supra quae` / AO.CARD.017 | Genesis 4:4; Genesis 22:1–19; Genesis 14:18 | OCR_EXCERPT_REVIEWED | The Canon passage explicitly invokes Abel, Abraham, and Melchisedech. Exegete each separately; verify which biblical verses Lanslots himself prints rather than converting prayer names into alleged verse citations. |
| LAN-007 | XVI, p.162 | Canon / AO.CARD.014 | Council of Trent, session XXII, chapter 4 (non-biblical source) | OCR_EXCERPT_REVIEWED | Book quotes Trent on the sacred Canon. Identify this as dogmatic historical authority, not Scripture or 1962 rubrical law. |
| LAN-008 | I, p.13ff | Altar of martyrs / PRE.ASPERGES; AO.CARD.001 | Revelation 6:9 | PASSAGE_TARGET_UNVERIFIED | Verify Lanslots's exact relics-versus-altar reasoning and the relevant printed page. |
| LAN-009 | XI, p.93ff | `Munda cor meum` / AO.CARD.007 | Isaiah 6:6–7 | PASSAGE_TARGET_UNVERIFIED | Passage-theology alignment; inspect original text before attributing details to Lanslots. |
| LAN-010 | XV, p.145ff | `Sanctus` / AO.CARD.013 | Isaiah 6:3; Revelation 4:8 | PASSAGE_TARGET_UNVERIFIED | Confirm whether these are explicitly cited in the chapter and separate San​ctus from Benedictus. |
| LAN-011 | XIV, p.133ff | `Lavabo` / AO.CARD.010 | Psalm 25:6–12 (Vulgate) | PASSAGE_TARGET_UNVERIFIED | Psalm numbering/edition is a release gate; no unlabelled Hebrew-numbering conversion. |
| LAN-012 | XV, p.145ff | `Hosanna/Benedictus` / AO.CARD.013 | Matthew 21:9; Mark 11:9–10 | PASSAGE_TARGET_UNVERIFIED | Verse references are biblical source of liturgical words, not proof of how Lanslots interprets them. |
| LAN-013 | XXIII, p.272ff | `Agnus Dei` / AO.CARD.021 | John 1:29 | PASSAGE_TARGET_UNVERIFIED | Distinguish the Johannine title from specific threefold liturgical petition origins. |
| LAN-014 | XXIV, p.287ff | `Domine non sum dignus` / AO.CARD.024 | Matthew 8:8 | PASSAGE_TARGET_UNVERIFIED | Gospel-source association; check exactly how Lanslots applies it to priest/faithful Communion. |
| LAN-015 | XXV, p.308ff | Last Gospel / AO.CARD.030 | John 1:1–14 | PASSAGE_TARGET_UNVERIFIED | Last Gospel not universal for every 1962 ending or optional form; source/form selector is normative. |
| LAN-016 | I, printed p.13 hint | Altar, universal Eucharistic offering | Malachi 1:11 | ORIGINAL_OCR_INSPECTED_NUMERAL_DAMAGED | Explicit authorial Malachi citation is partly corrupted in OCR; the exact numerical text and page image still require visual collation. |

## Theological and source-level editorial guardrails

1. Treat the book as a late-19th-century **devotional-theological commentator**, not the original cause of liturgical practices or a witness to the normative 1962 rite. Biblical typology, spiritual allegory, historical etiology and rubrical prescription are **four distinct categories**.
2. Distinguish typological fulfilment and sacramental reality. Abel, Abraham/Isaac and Melchisedech are figures of Christ's sacrifice, not sacrifices of equivalent intrinsic efficacy. The Mass represents/makes present the one sacrifice of Christ sacramentally; it is not a repeated physical death.
3. Do not promote claims such as the Gospel side “originally” representing the Gentiles, individual crosses' numerological meaning, or an incensing pattern from Lanslots alone as certified origins or universal obligations.
4. Record who acts in specific liturgical forms: the book is **not** the source for deciding 1962 deacon/celebrant roles, priest positions, or faithful postures. Exact actor-specific 1962 witnesses remain in the source registries.
5. Prefer native French writing from original French witnesses (Guéranger, Le Brun) where stronger, rather than mechanically translating an English devotional work; attribute Lanslots as one historically situated supporting witness. Compare against existing author-specific interpretation records before a new card is drafted.
6. Do not add contemporary or postconciliar Missal source links as if they explain 1962 mechanics. No implication that a common linked source is independent proof of each specific claim.
7. Source display: title / author / 1897 / chapter / printed page / exact assertion / original scan link / Scripture book-chapter-verse / interpretation type / 1962 applicability / source status / bilingual reviewed text.


For exact, automatically reconcilable chapter totals and underlying evidence IDs, consult the [25-chapter coverage census](../../data/research/mass-lanslots-1897-chapter-coverage.v1.json). This records **25/25 chapter groups with initial source evidence**, **18** with Scripture-reference samples and **seven** with separate theological/historical texts, including a zero count for original PDF page images reviewed. This is a research coverage gate only.

## Second research pass — comprehensive chapter-level coverage, not an exhaustive verse census

The second [original-OCR Scripture batch](../../data/research/mass-lanslots-1897-ocr-scripture-batch02.v1.json) adds **26** directly inspected biblical reference/allusion records to the earlier 43, bringing the running total to **69** record occurrences. These are source occurrences, not unique verses. The passages now cover **18 of the 25 numbered chapters** plus the Introduction. The added associations include Exodus 26 and altar furnishings; Psalm 109:4, Psalm 103:13–15, 1 Corinthians 10:17 and Hebrews 7:27 in Offertory theology; Leviticus 8:14 and Luke 1:74 at `Hanc igitur`; Psalm 109:4 in `Supra quae`; the breaking of bread at Emmaus; and 1 Corinthians 11:28–29 before Communion.

The remaining **seven** chapters (VI, VII, XII, XVI, XVII, XXI, XXII) receive [source-located historical/theological synopses and independent English/French research drafts](../../data/research/mass-lanslots-1897-seven-context-chapters.v1.json), not invented new biblical citations. These cover liturgical language, Psalm 42 and penitence, the Creed and Incarnation, Canon silence, intercession for the living and saints, intercession for the departed, and the final doxology and Lord's Prayer. Seven draft records are research only: no translation/cue/normative 1962 authority is granted.

**Coverage acceptance:** 18 chapters with original OCR citation samples + 7 chapters with original OCR theological source notes = **25/25 chapter groups represented in research**. This establishes a structural research baseline, **not** a claim that all Scripture citations, explanatory assertions or printed pages in the book have been collected. Historical explanations particularly needing corroboration include Latin from the time of the apostles, older Creed appointment rules, saints' legendary biographies, Canon composition/inspiration, and the discipline governing prayers for the dead. The 1897 author also explicitly cautions against contriving mystical significance for every small practical detail.

## Original OCR extraction — new primary evidence

- **[25 verified chapter headings and OCR boundaries](../../data/research/mass-lanslots-1897-chapter-ocr-boundaries.v1.json):** each chapter's line in the web rendering, its next heading and original printed-start-page indication. An OCR error renders chapter XI as “XL”; the chapter subject and the printed contents establish XI. Original printed-page images remain unchecked.
- **[43 first-batch Scripture reference candidates](../../data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json):** original OCR line-span, chapter, reference as printed versus a normalized editorial verse, theological caveats, and existing Mass topic owner. These cover 17 chapters plus the introduction; no claim of exhaustiveness.
- **[16 original claims upgraded to direct OCR locators](../../data/research/mass-lanslots-1897-claim-differential.v1.json):** many links formerly classed as merely suspected are now proven as authorial statements, but the record retains edition-specific Scripture numbering and unverified page-image status.

Especially valuable evidence: the author **explicitly** relates relics and the heavenly altar to Revelation 6:9 (ch. I), *Munda cor meum* to Isaiah 6 (ch. XI), the *Sanctus* to Isaiah 6:3 and Revelation 4:8 (ch. XV), *Benedictus* to Matthew 21:9 (ch. XV), and the incense to Revelation 5:8 (ch. VIII). For *Benedictus*, Mark 11:9–10 is an **editorial parallel**, not a directly quoted verse by Lanslots in the inspected paragraph. Similarly, the unnamed apocalyptic censer angel in chapter XIV is **not** an explicit authored verse citation to Revelation 8:3–4.

**Important authorial warning:** ch. VII's own exposition counsels against contriving mystical interpretations for every small ceremonial action; practical origins and genuine symbolism must be distinguished. **Doctrinal caution:** a passage in ch. XIX appears to describe liturgical language as “equally inspired” with Scripture; that terminology requires theological qualification, because liturgical composition is not biblical canonical inspiration. The “new consecration” language discussed at commingling is not a second transubstantiation. Late nineteenth-century Last Gospel alternatives do not establish 1962 norms.

## Companion differential screening (16 candidates)

See [machine-readable 16-item differential](../../data/research/mass-lanslots-1897-claim-differential.v1.json). Its cross-reference IDs have been validated against the 422-row historical evidence snapshot, original-French FRG01–30 audit and 41 FRG31–71 entries. At least five candidates are already covered and should only gain another historical witness, not another explanation. The chapter and OCR page hints remain unapproved until visually verified; **none of these rows is ready for publication.**

## Third research pass — exact prayer wording and bilingual mystagogy

The [69-reference source-to-prayer audit](../../data/research/mass-lanslots-1897-69-reference-cue-ownership.v1.json) distinguishes **12** Bible references/allusions with confirmed matching Latin wording or a named biblical figure in the **actual current Sung source text** from **57** other scholarly references that must remain topic-level context and not be assigned an arbitrary dynamic cue. The 12 source matches refer to **existing** prayer cue IDs and blocks; no new liturgical steps were created. This verifies an overlap in language and meaning, **not** an independently verified 1897 printed-page image or a conclusive claim that every biblical analogy is an origin of the ceremony.

Examples of confirmed ownership: Isaiah's purified lips in `Munda cor meum` → `AO.SM.C0079`; Psalm 140's incense prayer → `C0122`; Psalm 25's `Lavabo` → `C0125`; the triple `Sanctus` / Isaiah 6 and Revelation 4 → `C0145`; `Benedictus` / Matthew 21:9 → `C0148`; Psalm 109:4 and Melchisedech in `Supra quae` → `AO.CANON.09` / `C0186`; Matthew 8:8 for the **priest's** `Domine non sum dignus` → `C0229`, distinct from the later faithful's `C0243`. The same Scripture can have different uses, and two Scripture passages can have one prayer owner; this does not justify duplicate guidance.

The [seven complete bilingual mystagogy candidates](../../data/research/mass-lanslots-1897-seven-bilingual-mystagogy-drafts.v1.json) cover the prophet's purified lips, incense/Psalm 140, the heavenly `Sanctus`, the biblical `Benedictus`, the chalice of salvation at priestly Communion, one bread/one Church (formation only), and the martyrs under the heavenly altar (historical theology only). Every English/French candidate points to an original Lanslots chapter + OCR line range, a named Douay-Rheims Bible passage with direct link, its current cue or explicitly contextual placement, and a doctrinal/1962 caution. **All remain research-only and lack an independent native-French theological approval.**

A repository [source-critical focused regression test](../../tests/mass-lanslots-original-cue-audit.mjs) checks all 69 record IDs and ranges, 25 chapter groups, 39 current LIVE owners/14 Canon segments, exact Latin phrases, the centurion's priest-versus-faithful boundary and no premature publication. Its syntax was statically checked, and matching source assertions passed within the connected GitHub research session; **this is not a claim that Node, GitHub Actions, full browser tests or PDF-page image checks ran**.

## Fourth research pass — 10 source-critical and dated historical corrections

[Original-text critical review (10 structured records)](../../data/research/mass-lanslots-1897-doctrinal-historical-critical-review.v1.json) and the [source-linked English/French original-doctrinal memo](MASS-LANSLOTS-1897-ORIGINAL-DOCTRINAL-CORRECTIONS-20261014.md) resolve several important source-to-teaching distinctions: the inspired books of Scripture versus approved liturgical phrases (already distinguished in preconciliar Leo XIII and Pius XII, as well as Vatican II), Guéranger's interpretation of the holy Angel in `Supplices` versus created-angel alternatives, the sacramental *signification* of commingling, Old Testament analogy at `Hanc igitur`, historical Latin and papal-attribution claims, and distinctions in intercession for the dead.

**Exact dated 1962 amendment:** Lanslots's 1897 `Communicantes` does not include St Joseph. The Sacred Congregation of Rites' decree *Novis hisce temporibus* (13 November 1962) added `sed et beati Ioseph eiusdem Virginis Sponsi`, effective **8 December 1962**. The current Canon's `AO.CANON.03` / `AO.SM.C0159` preserves it. This is a genuine historical *textual* difference, not evidence of a malformed 1962 reader. [Lanslots, ch. XVII](https://archive.org/stream/illustratedexpla00lans/illustratedexpla00lans_djvu.txt) · [Sacred Congregation of Rites' decree, ICRSP French witness](https://www.icrsp.org/Pages/mois-saint-joseph.php?groupe=magistere&nom=decret).

A [focused ten-case reconciliation regression](../../tests/mass-lanslots-critical-reconciliation.mjs) checks source locators, present canonical ownership, inherited Guéranger source IDs, the normative Joseph insertion, and the promotion locks. **Research records are still draft**; neither the full Node suite nor 404-page scan-image collation has been certified in this batch.

## Integration disposition

- **Documented now:** 25 original OCR chapter headings; 69 individual Scripture reference/allusion records across 18 chapters plus the introduction; seven additional chapter-level theological/source-context records with bilingual drafts; 16 reclassified first-pass topical claim records. The precise 39-step source-first mapping is preserved. Source authority, explicit quotations, allusions and editorially supplied parallels remain separated.
- **Not completed:** a complete local OCR download and exhaustive reference census, consecutive 404-PDF-page image verification, full claim-by-claim deduplication against all 422 historical evidence entries and Guéranger FRG01–71, exact paragraph-level attachment to every LIVE cue, independent French doctrinal review, and native browser/mobile acceptance.
- **Do not publish this ledger as new user-facing content.** The full text is now readable on the web; the next gate is to materialize that OCR, execute the existing extraction script against the complete text, reconcile with the 69 currently indexed original-OCR references, verify citations against scanned original pages and a named Catholic Bible edition, and review the French content before any product change.
- **Source readback and source-owner assertions were performed in the research batch; no full Node/browser test suite or Mass reader modification.**

## Original source and work-in-repo cross references

- Original scan: https://commons.wikimedia.org/wiki/File:Illustrated_explanation_of_the_prayers_and_ceremonies_of_the_Mass_(IA_illustratedexpla00lans).pdf
- Original book metadata: https://archive.org/details/illustratedexpla00lans
- Existing Guide implementation: `src/mass/reader-guide.js`; recovered registry: `data/presentation/guide-registry.v1.json`
- Current formation owner: `data/learn/mass-formation-campion.v1.json`
- Scripture context: `src/scripture/context.js`
- Existing Mass research record: `docs/research/MASS-RESEARCH-ARCHIVE-INDEX-20261013.md`
