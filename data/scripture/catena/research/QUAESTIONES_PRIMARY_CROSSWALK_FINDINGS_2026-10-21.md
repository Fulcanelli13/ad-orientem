# Living Catena — first primary-work Quaestiones crosswalk (21 October 2026)

**Research-only continuation of** `patristic-questions-seed.v1.json` on the external-data pilot branch. **No UI, Father dialogue, or independently approved translation is introduced here.**

## What was inspected

- The pinned Oxford/Newman Catena manifest: **814 pericopes, 12,692 fragments**. Selected canonical chapter-pack snippets were inspected by original position, Father label, and unchanged source string.
- Augustine, *Quaestiones Evangeliorum*, the Latin prologue, Book I questions 1/7, Book II questions 1/3/5/6, as displayed by [Latin Wikisource](https://la.wikisource.org/wiki/Quaestionum_Evangeliorum). The hosting page's date/edition metadata is not treated as independently reliable. The book/section placement is grounded in the displayed Latin divisions, not modern question formulations.
- Eusebius, *Quaestiones ad Stephanum*, the surviving supplementary genealogy discussion (Greek + English display) on [Catholic Library](https://catholiclibrary.org/library/view?chunk.id=00000003&docId=%2FFathers-Synchronized-EN%2FEusebius_Caesariensis__Supplementa_ad_quaestiones_ad_Stephanum.en.html).
- Eusebius, *Quaestiones ad Marinum*, opening Greek question and two explanatory alternatives on [Catholic Library](https://catholiclibrary.org/library/view?chunk.id=00000003&docId=%2FFathers-Synchronized-EN%2FEusebius_Caesariensis__Quaestiones_evangelicae_ad_Marinum.en.html).
- Eusebius, *Ecclesiastical History* I.7 (English historical translation), which **quotes Julius Africanus** about the genealogies: [Wikisource](https://en.wikisource.org/wiki/Nicene_and_Post-Nicene_Fathers:_Series_II/Volume_I/Church_History_of_Eusebius/Book_I/Chapter_7). Africanus's quoted words must not be misrepresented as Eusebius's independent solution.

## Concrete source-to-Catena links

| Original work | Issue in source | Catena link | Classification |
| --- | --- | --- | --- |
| Augustine, *Qu. Ev.* II.1 | Zacharias's prayer (Luke 1:13) | `catena.luke.1.11:11` — Augustine, 12th segment | Quotation of same work, check original excerpt |
| Augustine, *Qu. Ev.* II.3 | Moses's prescribed offering after healing (Luke 5:14) | `catena.luke.5.12:14` — Augustine, 15th segment | Quotation of same work |
| Augustine, *Qu. Ev.* II.5 | Two fathers of Joseph (Matt 1:16; Luke 3:23) | `catena.luke.3.23:11` — Augustine, 12th segment | Quotation of same work |
| Augustine, *Qu. Ev.* II.6 | Seventy-seven generations (Luke 3:23–38) | `catena.luke.3.23:38` — Augustine, 39th segment | Quotation of same work |
| Augustine, *Qu. Ev.* I.7 | Three days and three nights (Matt 12:40) | `catena.matthew.12.38:8` — Augustine, 9th segment | **Related passage from another work** (*De Consensu*) |
| Eusebius, *Ad Stephanum*, q. III | Matthew/Luke Joseph genealogies | `catena.luke.3.23:9` — Eusebius, 10th segment | **Probable parallel**, edition-level alignment not certified |
| Eusebius, *Ad Marinum*, q. I | Easter timing, Matthew 28:1 and Mark 16:9 | No directly matching Eusebius extract in the two inspected Catena pericopes | **Independent source only** |

Canonical `sourceFragmentId` suffixes are zero-based, whereas segment ordinals shown here are one-based. The existing Catena remains the sole source of English excerpt text in the reader.

## Research findings that change our product decisions

**1. Not all Quaestiones sections literally contain a question.** Augustine's Book II questions 1 and 3 discuss difficulties in declarative prose. We may formulate a modern, useful question from them, but it **must not** be styled as a verbatim question Augustine uttered. In Book II.5 and II.6 Augustine explicitly poses an inquiry; these are stronger historical discovery anchors.

**2. Some questions were posed by a historical correspondent, not by the author.** Eusebius introduces *Ad Marinum* I as Marinus's question (Greek: `Ἠρώτας δὲ τὸ πρῶτον`). The author's *solution* is Eusebius's, the question's historical voice is Marinus's.

**3. Catena source labels are valuable but imperfect.** For the Zacharias extract, Catena's English parenthesis reads `de Quæst. Evan. l. i. q. l.` (Book I, question I), although the consulted Latin places the material in **Book II, question 1**. Preserve this as an explicit conflict pending source-edition review; do not patch the canonical Oxford text silently.

**4. Do not flatten debate into certainty.** Augustine II.5 explores more than one explanation, and argues that the levirate option is weaker in that discussion. Eusebius *Ad Marinum* I lays out a hypothetical rejection of Mark's longer ending followed by a reading that reconciles the accounts without discarding it. Neither should be reduced to one sentence claiming a uniquely established historical fact.

**5. Never conflate Eusebius quoting Africanus with Eusebius authoring Africanus's words.** Catena's Matthew 1:16 Eusebius entries are connected to *Historia Ecclesiastica* I.7, the Africanus tradition. Link by `quotationTransmission` when a later schema is added; preserve the distinct voices.

## Contract for the next phase

The [crosswalk JSON](quaestiones-primary-source-crosswalk.v1.json) holds **seven** research-only records: five from Augustine and two from Eusebius. Each record has a modern question clearly marked as editorial, short primary-language anchor, location, Scripture keys, precise Catena link where one exists, relationship class, and blocking editorial concerns. `tests/scripture-catena-quaestiones-crosswalk.mjs` verifies Catena ordinals/anchors and forbids pretending thematic parallels are same-work excerpts.

The crosswalk **does not** contain full source answers, newly translated quotations, or user-facing Father messages. Independent original-edition verification, translation rights (especially Eusebius's modern English), secondary human source/context review, theology review, and integration into Messenger remain pending. Never publish these as independently certified original questions.
