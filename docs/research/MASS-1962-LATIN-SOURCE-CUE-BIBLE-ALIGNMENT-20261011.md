# Mass–Bible research: actual 1962 Latin-source cue and Dujardin alignment
**Date:** 11 October 2026. **Status:** research evidence alignment only; no app code, reader text, rubrics, calendar resolution, artwork or Atlas modifications.

## What was directly inspected

We read the two currently canonical repository corpora, not the visual 48-card LIVE layout:
- [Sung reader: 96 source blocks](../../data/presentation/reader-text-sung.v1.json), of which **11 blocks are dynamic Proper slots**; the other blocks include normal, special and local-custom text. Every imported phrase here was checked at a **specific `AO.SM.Cxxxx` cue**.
- [Low reader: 96 source blocks](../../data/presentation/reader-text-low.v1.json). A second independent match confirmed the same short Latin phrase and source `AO.SM.Bxxx` block at the same cue for each research entry. **This does not make the rubrical roles/gestures of Low and Sung interchangeable.**
- [Mass text/model authority](../../src/mass/reader-model.js) and [source-first 48-card projection](../../src/mass/reader-live-product48.js): 48 visible LIVE steps **are not liturgical text identifiers**; the text is identified by stable source block/cue.
- [Actual Proper mapping](../../src/mass/proper-reader-slots.js) and [strict Gospel/Epistle Scripture resolver](../../src/mass/scripture-reading-context.js): an ordinary biblical typology cannot be injected as a false Gospel or Epistle Proper reference.

The research output is [**45 Bible/interpretation links at 41 distinct textual cues**](../../data/geography/research/mass-1962-cue-scripture-crosswalk-20261011.v1.json). Each has its original Latin phrase anchor, source block and cue, reference to the preceding **54 interpretation + 30 Fortescue + 24 primary-control + 22 Alphonsus source extractions**, relation class, and a boolean verifying that the excerpt really appears in **both** reader text corpora after accent/ligature normalization.

**Important:** this validates our application's existing Latin textual ownership only. It does **not** independently certify that our data matches every line of the photographed 1962 `Missale Romanum`, that each proposed Bible reference matches the precise Clementine/Crampon/Douay verse, or that every interpretation is doctrinally publishable. All three are marked **false** on every individual crosswalk row.

### Why we must link at the exact phrase

*Supra quae* is a perfect counterexample to one prayer = one Bible link:

| Real Latin phrase in same `AO.SM.C0186` | Biblical episode | Evidence class |
|---|---|---|
| *munera pueri tui iusti Abel* | Gen 4:4, offering of Abel | Explicit **named biblical figure** in the Canon |
| *sacrificium Patriarchae nostri Abrahae* | Gen 22:1–19, sacrifice of Isaac | Explicit named figure, but Genesis's event is its own episode |
| *obtulit summus sacerdos tuus Melchisedech* | Gen 14:18–20 and Heb 7 | Explicit named figure and subsequent interpretation by Hebrews, the Fathers and the Church |
 
All three are **one** source cue, but demand three separate event/personological contexts. The sacrifices are not one common historical event or map coordinate. The early Ravenna mosaics represent later Christian typology, not what an eyewitness saw.

Other **actual original-text checks** include:
- `AO.SM.C0079` — *Munda cor meum* refers explicitly to Isaiah's lips purified by the glowing coal (Isa 6:6–7). Here the liturgical phrase itself is the primary evidence; no fabricated named commentator is added.
- `AO.SM.C0116` — *In spiritu humilitatis*, clearly identified with Daniel 3 (Catholic additions, edition numbering hold) by Fortescue.
- `AO.SM.C0122` — *Dirigatur ... sicut incensum* cites Ps 140/141 (Vulgate/modern numbering). This is **conditional incense material**, not a prayer everybody says at all forms of Mass.
- `AO.SM.C0125` — *Lavabo* cites Ps 25/26. Dujardin separately contemplates the washing of the feet in John 13; these are **not competing textual citations**.
- `AO.SM.C0145` — the Isaiah 6 acclamation and a separate Revelation 4 heavenly-worship parallel share one *Sanctus* cue but must not collapse into one Bible episode.
- `AO.SM.C0164` — *rationabilem* has an attributed Fortescue comparison to Romans 12:1. This is a **specific idiom**, not a citation of the whole Canon paragraph.
- `AO.SM.C0179` — the Roman chalice formula includes *mysterium fidei*, which is **not literally in the four Last Supper witnesses**. An adaptation must be labelled correctly.
- `AO.SM.C0183` — *de tuis donis ac datis* and 1 Chronicles 29:14: Fortescue says **may be** suggested by the text; never upgrade to a direct quotation.
- `AO.SM.C0187` — the heavenly altar of *Supplices* is related to Revelation by later commentators. The rite is not a documentary GPS description of heaven.
- `AO.SM.C0229` versus `AO.SM.C0243` — the priest's and the faithful's *Domine non sum dignus* repeat an adapted centurion text in **different locations** in the source reader. Both may link to Matthew 8:8 without combining the liturgical roles.
- `AO.SM.C0271` and `AO.SM.C0273` — John 1 at the Last Gospel, but **special Masses can replace or omit it**, so route-specific source resolution precedes display.

## Dujardin's actual 1889 meditations and the 1962 Order

The companion [22-row Dujardin → 1962 position bridge](../../data/geography/research/mass-dujardin-1962-order-bridge-20261011.v1.json) is deliberately **not** a historical-origin concordance:

| Position mapping | Number of Dujardin sections | Meaning |
|---|---:|---|
| Existing fixed source cues | **16** | Dujardin meditation is associated with a real Order-of-Mass moment; the interpreted Bible event is **not** proved to have instituted that ceremony |
| Variable Proper slot | **5** | Collect, Epistle, Gospel, Preface and Postcommunion depend on the actual celebration; meditative sequence cannot override variable Scripture |
| Preparation before Mass | **1** | Dujardin starts before the Order. No fabricated initial cue is attached |
| **Total** | **22** | Text witnesses verified in the 1889 transcription; original 1889 facsimile image review still pending |

Specific doctrinal holds remain for Dujardin's Purgatory/Limbo language, his four-thousand-year pre-Christian chronology, and resurrection interpretations of commingling and Christ's sacramental presence. Exactly **where** a meditation occurs is different from its **source validity** or historical liturgical explanation. The meditation must eventually be optional and attributed to Dujardin, not St Alphonsus.

## The entire Bible comes in through changing Propers — real evidence and limits

The **11 variable source blocks** are `INTROIT`, `COLLECT_SET`, `EPISTLE_OR_LESSON`, `GRADUAL`, `ALLELUIA_TRACT_SEQUENCE`, `GOSPEL`, `OFFERTORY`, `SECRET_SET`, `PREFACE`, `COMMUNION`, `POSTCOMMUNION_SET`. They do not share one permanent Bible passage. As one example, a Communion chant on a specific feast may quote Scripture, but `COMMUNION` is **not** itself a universal John 6 citation.

We inspected the generated-data source registries:
- [base verified Scripture register](../../data/mass/scripture-reading-witness-register.v1.json): **50 Proper paths**, **95 directly referenced Gospel/Epistle slots**, **5 explicitly held/segmented candidates**.
- [feast/special reading supplement](../../data/mass/scripture-feast-reading-supplement.v1.json): **55 further Proper paths**, **100 referenced reading slots**.
- [segmented discontinuous readings](../../data/mass/scripture-segmented-proper.v1.json): **15 source-bound readings** (four Gospel, eleven Epistle/lesson); source order and omitted verses are protected.

Combined, these are **105 unique Proper source paths** and **210 unique path + reading-slot evidence keys**. The segmented items overlap the *same Proper path* but occupy a different Gospel/Epistle slot, not a new day. Uniqueness was verified for all 210 pairs; the current bridge uses **source path + actual Latin incipit and explicit-reference conflict veto**, not a calendar/date guess. **These figures are not a denominator for the whole 1962 calendar.** They say what has been individually validated within the present Scripture bridge; they do not tell us that the rest of the variable Propers, chants or Psalms are source certified.

Potential wider biblical coverage should be researched in order:
1. real **resolved 1962 Proper** for a date and feast (not a generic Sunday approximation);
2. every chant/reading/collect's actual source text and original biblical quotations;
3. exact reference and verse numbering against Vulgate, Crampon and Douay–Rheims;
4. primary patristic/traditional interpretation linked to that source where attested;
5. existing Bible Atlas episode, person or historical place only if its own verification supports it.

The 1962 reader includes additional/special rites for Good Friday, Easter Vigil, processions, Holy Thursday, Ember lessons and others. Those are **separate source owners** and cannot be certified through the ordinary 96-block/11-Proper slots alone. They require their existing rite/source proof before being added to the biblical interpretation network.

## Next gate: verify external missal, editions and text provenance

- Original **1962 printed Missale Romanum/Ordo Missae** facsimile and its mandated variants, line-by-line where Scripture links are to publish.
- Distinguish the Bible's actual primary words from Latin phrases in a later **Roman liturgical adaptation**, e.g. Matthew 8:8 with *anima mea*, or institution narrative with *mysterium fidei*.
- Assign local Bible reader's stable exact passage + edition source identifier; do not replace old working contextual Scripture reading with a bare external hyperlink.
- Attribute individual St Alphonsus, Guéranger, Fortescue, Dujardin and patristic interpretations to their book and section, including disagreements.
- Only after this may `learn.mass` or Formation display the approved links. **No automatic merge or mutation of the native Mass reader.**

### Publication status
**45/45 native-Latin phrase anchors verified in Sung and Low corpora. 0/45 independent facsimile+Bibles-and-commentary triple-certified. 0 deployed.** No assertion of completed Bible coverage. 
