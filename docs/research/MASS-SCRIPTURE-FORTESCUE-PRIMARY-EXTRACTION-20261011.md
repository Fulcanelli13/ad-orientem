# The Mass through Scripture — Fortescue-first extraction and recovery of earlier meditation work
**Research date:** 11 October 2026  
**Branch:** PR #1018 (draft research, not production)  
**Edition actually inspected:** Adrian Fortescue, *The Mass: A Study of the Roman Liturgy*, **Longmans, Green & Co., 1914 NEW EDITION**. This **revised** text has a second-edition preface dated 1913; first edition was 1912. The [user-supplied public OCR](https://archive.org/stream/massstudyofroman00fort/massstudyofroman00fort_djvu.txt) and [related scan PDF](https://dn760108.eu.archive.org/0/items/massstudyofroman00fort/massstudyofroman00fort_bw.pdf) correspond to the 1914 edition: OCR title page explicitly says 1914. Page locators are **printed-page numbers** of this edition, not PDF page indices.

## The actual research target is an existing module, not a new standalone app component

The current source-of-truth is now verified directly on the GitHub `main` branch: **[Understand the Mass (`learn.mass`)](https://github.com/Fulcanelli13/ad-orientem/blob/main/src/learn/mass-formation.js)**, backed by **[eight bilingual formation stages / 24 source claims](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/mass-formation-campion.v1.json)** (`MF01`–`MF08`), plus a merged **[Scripture-context bridge, PR #713](https://github.com/Fulcanelli13/ad-orientem/pull/713)** with source file [`src/mass/scripture-reading-context.js`](https://github.com/Fulcanelli13/ad-orientem/blob/main/src/mass/scripture-reading-context.js). Also see the established Prayer origins registry [`src/pray/scripture-origins.js`](https://github.com/Fulcanelli13/ad-orientem/blob/main/src/pray/scripture-origins.js). An earlier v43.14 prototype claimed 72 Mass steps and 31 formation notes, but that is a **superseded/parallel earlier prototype accounting, not the current verified eight-stage source structure**. A previous Source Compendium ledger remains to be reconciled. Do not replace `learn.mass` or reopen the 1962 reader.

The other earlier component was a Salles-*like* life-of-Christ meditation, but the directly recovered text is **Rev. Léopold J. Dujardin, C.SS.R.**, *Mass Considered in its Relations to the Life of Jesus Christ, to the Ecclesiastical Year, and to the Universal History of Religion*. Its attribution is the footnote on **p.17** of the [Saint Alphonsus collection PDF](https://www.papastronsay.com/publications/library/Saint%20Alphonsus/the_holy_mass.pdf); the essay is **by Dujardin, not St Alphonsus**. At the beginning of Mass he correlates the priest's movements with Creation/Fall and later Passion episodes. It is **an explicitly authored devotional allegory**, never historical proof that the rite's gestures originated to act out those episodes. The exact earlier product/module name may have differed; do not create an independent duplicate.

**Target:** attach source-rated Mass ↔ Bible connections to existing stable prayer/gesture anchors and optional formation commentary. A Guéranger / Dujardin meditative path is an *alternative spiritual lens*, not the objective origin or meaning of the rite and not a default addition to LIVE.

## Newly extracted source-owned connections

[**30-record Fortescue-to-Order-of-Mass primary OCR register**](../../data/geography/research/mass-scripture-fortescue-order-extract-20261011.v1.json): **52 biblical reference occurrences**, 23 sections/phase labels, and explicit comparisons to 54 previously registered interpretation records. These are **not** 30 newly invented articles or 30 new Mass cards. All publication flags are false, and each record has: stable textual Mass anchor, canonical Scripture references + independent source-book links, 1914 printed page, section, OCR line-locator, attribution and a type that distinguishes literal text from early assembly practice and cautious allusion.

The following distinctions illustrate why Fortescue is especially useful:

| 1962 Mass locus | Biblical reference | Fortescue 1914 printed page | Relation and actual point |
|---|---|---:|---|
| Readings and sermon | 1 Tim 4:13; 1 Thess 5:27; Acts 20:7 | 3 | Early Christian assemblies contain readings/exposition; **not** the established 1962 Mass reading system |
| Early public prayers and offerings | 1 Tim 2:1–2; 1 Cor 16:1–2 | 3 | Early assemblies' intercession and alms; **not** the exact Te igitur or late private Offertory formula |
| Apostolic kiss of peace | Rom 16:16; 1 Pet 5:14 | 4 | Scriptural greeting, **not** automatically the 1962 Solemn Mass ritual |
| `Gloria in excelsis` | Luke 2:14 | 239–242 | The angelic opening and **later composed** broader hymn are different |
| `In spiritu humilitatis` | Dan 3:39–40 (Catholic Bible numbering) | 307 | Fortescue **explicitly** identifies the biblical text behind this Offertory prayer |
| Offertory incensing | Ps 140:2–4 (Vulgate) | 309 | Psalm text is used; the fully developed ceremony and prayers have their **own history** |
| `Lavabo` | Ps 25:6–12 (Vulgate) | 310 | Psalm text and practical handwashing can be analysed **separately** |
| `Sanctus` | Isa 6:3 | 321–322 | Direct biblical acclamation, with Vulgate-vs-Greek wording noted |
| `Benedictus` | Matt 21:9; Ps 117:25–26 | 322 | Crowd's Palm Sunday cry and psalmic background should be distinct Scripture episodes |
| `Quam oblationem` — *rationabilem* | Rom 12:1 | 335 | Specific scriptural idiom; **not** the source of the whole Roman Canon prayer |
| Institution narrative | Matt 26; Mark 14; Luke 22; 1 Cor 11 | 1–2, 335–337 | Fortescue compares all four institution witnesses and their variants; liturgy is not verbatim any one text |
| `Unde et memores` | Luke 22:19; 1 Cor 11:24–26 | 346–347 | Last Supper command and anamnesis: relation to the broader passion/resurrection/ascension liturgical prayer |
| `de tuis donis ac datis` | 1 Chr 29:14 | 347 | Fortescue marks this as **possible**, not established, biblical wording |
| `Supra quae` | Gen 4; Gen 22; Gen 14 / Heb 7 | 348–350 | Abel, Abraham, Melchizedek are **explicitly named**; ancient anaphora parallels are discussed |
| `Supplices te rogamus` | Rev 8:3–4 as **later devotional comparison** | 350–354 | Fortescue explains parallels in other liturgies; **do not falsely attribute this Revelation citation as his direct lexical derivation** |
| `Pater noster` | Matt 6; Luke 11 | 361–365 | Direct Lord's Prayer with disputed historical placements handled separately |
| `Domine non sum dignus` | Matt 8:8 | 383 | Fortescue notes a liturgical adaptation replacing `puer` with `anima` |
| `Agnus Dei` | John 1:29 | 387 | Baptist's wording is Scripture; Roman chant at fraction developed later |
| Last Gospel | John 1:1–14 | 394–395 | Direct scriptural reading, **later** addition to end of Roman Mass |

**Especially important corrective example:** at p.306 Fortescue treats mixing water and wine first as a historical practice of preparing drinking wine, with christological/ecclesial symbolism attached afterwards. Thus the proposal 'mixing water = John's blood-and-water scene' must **not** be classified as the factual ritual origin. Guéranger and Cyprian can each be shown as named authors giving different spiritual explanations. [Fortescue p.306–307 OCR](https://archive.org/stream/massstudyofroman00fort/massstudyofroman00fort_djvu.txt); [Cyprian on the mixed chalice](https://www.newadvent.org/fathers/050662.htm).

**Another useful correction:** Fortescue's own preface to the new edition explicitly describes his reconstructed primitive Canon as probable and specific older reconstructions as conjecture. We cannot present a conjectural sequence from Baumstark, Drews or Buchwald as an established early Mass. He quotes Romans 12 for *rationabilis*, identifies the three sacrifices and compares early liturgical variants, without asserting that every cross or movement of the priest must correspond to a Bible scene.

## User-supplied supplementary sources — bibliography and claim audit

### AcademicBiblical Reddit discussion
[Original discussion](https://www.reddit.com/r/AcademicBiblical/comments/xguymj/what_is_the_origin_of_the_mass_in_roman/) identifies **research leads**, not scholarly evidence in itself:
- **Cyrille Vogel**, *Medieval Liturgy: An Introduction to the Sources* — critical sourcebook/manuscript methodology.
- **Eric Palazzo**, *A History of Liturgical Books from the Beginning to the Thirteenth Century* — textual development and documentary controls.
- **Anton Baumstark**, *Comparative Liturgy* — comparison of liturgical families; influential but some evolution laws require later scholarly review.
- **Gregory Dix**, *The Shape of the Liturgy* — major classical thesis, to be contrasted with critical modern scholarship.
- **Paul F. Bradshaw**, *The Search for the Origins of Christian Worship* — essential methodological counterweight against tidy reconstructions.
- **Egeria**, *Diary of a Pilgrimage* — early liturgical evidence for Jerusalem, **not** early Roman Mass directly.
- **Wainwright & Westerfield Tucker**, *Oxford History of Christian Worship*, and **Bradshaw & Maxwell Johnson**, *Origins of Feasts, Fasts, and Seasons* — historical supplementary checks, not directly one-to-one Mass prayer commentary.
No one of those books' complete relevant chapters has been inspected during this batch; they remain future secondary verification sources.

### SSPX UK — Fr Fabrice Loschi, “A Brief History of the Roman Mass”
[Original article](https://fsspx.uk/en/brief-history-roman-mass-41682). This is a readable **modern narrative** and a helpful lead for dating claims; do **not** use it as authority over primary ancient documents or Fortescue. Specifically:
- Article §“Apostolic Mass” claims that Pliny the Younger documents Christians sharing a harmless meal **in which they sang the Sanctus**. But [Pliny, *Epistulae* X.96, original Latin and commentary](https://dcc.dickinson.edu/pliny-letters/10-96) says Christians sang a hymn to Christ before dawn and later shared ordinary, harmless food: **it does not identify their hymn as the Sanctus**. Reject precise `Pliny proves the Sanctus` claim, and do not import it into the database.
- Claims about an exact first-century four-cup Passover ritual and the third/fourth cup as direct explanations of specific Roman Latin phrases require independent historical evidence; later rabbinic Passover descriptions cannot simply be projected word for word into the Last Supper.
- Claims of the apostles celebrating `exactly` the later Roman ceremonial order or that Pope Gelasius single-handedly suppressed the universal prayer are **overstated as currently sourced**; source-check with Fortescue pp.1–8, 70–75 and historical manuscripts.
- Its seven-century Roman papal Mass outline can suggest **questions** to verify via Ordo Romanus I, not automatic historical facts.

### Explicit source hierarchy

1. **1962 Missale Romanum / Ritus servandus** = exact liturgical text and contemporary ritual.
2. **Bible (Vulgate/Douay/Crampon)** = what a particular Scripture passage actually says; original Hebrew/Greek where lexical disagreement matters.
3. **Named Church Fathers and ancient prayer witnesses**, with original section and correct rite/date.
4. **Fortescue and modern critical historians**, for textual development; theories and manuscript-based facts distinguished.
5. **Guéranger, Gihr, Le Brun, Aquinas and other named interpreters** = varied traditional theological and historical commentary, with source-grade differences.
6. **Dujardin-style meditations** = optional devotional allegory, clearly attributed to Dujardin and not passed off as historical proof.
7. **Blog/Reddit summaries and unverified artwork captions** = discovery leads, not publication authority.

## Proposed reuse of existing Mass Formation data

Return all these entries as new **sources/edges** to pre-existing prayer anchors (such as `CANON_SUPRA_QUAE` or `OFFERTORY_IN_SPIRITU_HUMILITATIS`), **not** as another 30 Mass prayer cards or a new standalone Mass explanatory component. Before any integration, locate the current production registry that superseded the old v43.13–v43.14 guidance drafts, reconcile it with the Source Compendium and with R17/native 1962 stable IDs. The existing Douay/Crampon Scripture reader must render full text in-app; no redirect-only substitute.

The new external Bible URLs are merely source-context references and do not certify verse numbering or text matching across Douay–Rheims, Clementine Vulgate or Crampon. The registry deliberately distinguishes a Fortescue-direct citation from editorial biblical context supplied by Guéranger, and marks all 30 entries as **publication blocked**.

**Further close reading still needed:** book-wide footnote bibliography, precise original 1914 body passages at pp.225–226, original source claims in the second half, 1962 Missal collation and assignment of source-prayer IDs. Do not merge or publish until these are done.
