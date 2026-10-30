# Living Catena — Matthew batch 03, source-first question and answer audit
**21 October 2026 | Research-only, AI-assisted; not a historical quote corpus or publication approval**

## Corpus work accomplished
- **All 300 original excerpts** belonging to Matthew's third 300-entry review queue were read from the pinned canonical Gospel pack and source-screened. Each record includes the inherited author, original Catena source pointer, Scripture citation, flagged question-mark windows and candidate contextual risks, with **no invented Father answer**.
- Unlike the first two batches, **only 21 excerpts have a literal question mark**. The other **279 are declarative/explanatory** pieces that can still contain relevant answers. The rule is **modern reader question → authentic source excerpt**, never manufacture an ancient Father question.
- **80 distinct source-linked excerpts** received AI-assisted semantic and historical-voice review: **68** offer an argument pertinent to the carefully worded editorial question within their original segment; **five** contain alternative readings that must not be collapsed; **four** explicitly need neighboring context; **two** have uncertain historic attribution, and **one** changes owner inside the excerpt. This is assessment against the existing Catena, **not verification against all original Greek/Latin works, professional theological clearance or human approval**.
- **14 contrast/complement families** are linked as review leads. This includes genuinely distinct ancient explanations, not a synthetic consensus. Every linked source is one of the 80 reviewed excerpts.
- The extra check `tests/scripture-catena-matthew-batch-three.mjs` compares all 300 pointers with actual source texts and ordinals, 80 reviewed candidates, 14 groups, and exact two-author substring boundary.

## Why this changes the Messenger design

The earlier queue primarily prioritized literal interrogatives. This batch shows that **the majority of usable Father teaching is declarative**. Reader questions should be a navigation/search layer, not necessarily dialogue that the author historically asked. When the original excerpt itself contains a biblical character's question, quoted heretic, reported opponent, sermon rhetorical speech, or separate ancient source, keep those voices distinct.

Examples:

- **Matt 27:45, the cry of abandonment:** Origen's two passages provide separate possibilities, while Hilary is guarding orthodox understanding of Christ's divinity and humanity. The script must not combine three distinct arguments into one apparent ancient answer.
- **Matt 28:1:** Augustine offers a compact narrative reconciliation of Matthew's 'evening' with Mark's dawn. Keep the full time-of-night reasoning and identify it as his Gospel harmonization, not independently attested chronology.
- **Matt 28:11:** Chrysostom and Remigius give two different arguments against the stolen-body allegation. These are complementary writings, not reconstructed eyewitness testimony.
- **Matt 1:16–17:** Jerome appeals to natural/legal lineages and Eusebius/Africanus traditions, Augustine discusses adoption, Ambrose proposes two Jeconiahs, and Augustine offers a different numerological reckoning. The genealogical explanations are not all the same answer.
- **Matt 2:10:** the gift symbolism attributed in this Catena to Augustine is Christological, while Gregory's application (wisdom, prayer and bodily mortification) concerns how Christians offer gifts today. The Augustine label says `non occ.`; authorship review is required.
- **Matt 4:1–11:** Gregory analyzes suggestion/delight/consent, parallels Adam's temptation and shows Christ's scriptural responses. These can be navigated through separate modern user questions without inventing Gregorian dialogue.
- **Matt 5–7:** Augustine and Ambrose offer substantial practical teaching about spiritual growth, anger, reconciliation, truth-telling, right intention, prayer and temptation even where no direct question mark appears.
- **Matt 6:11:** Cyprian reads daily bread Eucharistically, while Augustine gives a sense referring to daily divine precepts. These should be displayed as distinct patristic expositions, not forced into identical literal interpretations.
- **Matt 13:51–52:** Gregory gives alternative expositions of the householder's old and new treasury. Preserve the `Otherwise` transition.

## New mixed-owner anomaly — Matt 27:45

`catena.matthew.27.45:1` inherits Father label **Origen** but contains an explicit heading **PSEUDO-DIONYSIUS. (ad Polycarp. Ep. 7.)** at JS character offset **726** of an original **1,239-character** fragment.

- `[0,726)` is Origen-labelled discussion of how people raised an eclipse objection.
- `[726,1239)` is an independently introduced Pseudo-Dionysius excerpt reporting an observation.
- Full original text and inherited editorial label remain unchanged.
- The second part must not be displayed in an Origen speech bubble. Nor should the pseudo-Dionysian passage be relabelled as authentic first-century Dionysius the Areopagite testimony or established astronomy.

See `matthew-batch-03-mixed-owner-anomaly.v1.json`. This joins a similar previously detected Lanfranc/Pseudo-Dionysius split in Matthew 26:26, showing the importance of **intra-excerpt source ownership** in the canonical provider.

## Files and verification
- `matthew-batch-03-300-source-screen.v1.json`: every one of 300 source-linked excerpts, with question and dependence signals.
- `matthew-batch-03-contextual-reader-questions.v1.json`: 80 proposed modern reader questions and their exact pre-existing Catena answer pointers, with evidence limitations.
- `matthew-batch-03-14-comparison-leads.v1.json`: 14 source-preserving contrast or complement groups.
- `matthew-batch-03-mixed-owner-anomaly.v1.json`: precise two-author attribution split.
- `tests/scripture-catena-matthew-batch-three.mjs` and the read-only `.github/workflows/living-catena-corpus-pass.yml`.

**Cumulative Matthew screening:** 900 source excerpts through batches one, two and three. Previously, batch 1 had **26** AI-assisted argument reviews; batch 2 had **86 distinct** after reconciling parallel research. Batch 3 adds **80** different excerpts, giving **192 distinct higher-level AI-assisted spot reviews**, not 192 human approved Messenger conversations. The broader corpus still totals **12,692 source excerpts**, untouched.

## External benchmark and next work
Via Patrum's Ask, Topics, Timeline and Gospel Verse features are a prior-art research reference, not a content-import license. No Via Patrum modern translation or theme claims were copied as patristic speech.

Proceed to **Matthew batch 04** and then the other Gospels, but revise prioritization: inspect declarative passages as well as literal-question ones, with escalating spot-review coverage and automatic source integrity. Where the existing Catena genuinely fails to answer an important question or omits required context, review an original Father work **selectively**. No blanket Augustine/Eusebius duplication.
