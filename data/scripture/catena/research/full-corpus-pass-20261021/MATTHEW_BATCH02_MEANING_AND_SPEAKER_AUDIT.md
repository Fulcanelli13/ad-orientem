# Matthew batch 2 — 300 original excerpts, 47 contextual interpretations, seven group leads
**Date:** 21 October 2026
**Scope:** Existing Oxford/Newman *Catena Aurea*, **not** Via Patrum translations.
**Status:** AI-assisted internal research. No independent scholar approval or Messenger publication.

## Actual processing

The second Matthew priority queue contains **300 source excerpts** spread across **109 pericopes**, covering **420 literal question marks**. The machine/structural voice screening found:
- **209** uncertain interrogatives without reliable voice cues.
- **32** opening exegetical-query signals.
- **55** embedded quotation signals.
- **2** opening Gospel/reported biblical dialogue signals.
- **1** Gospel-commentary signal and **1** embedded objection signal.

These are **flags, not verified attribution**. In particular, a passage marked uncertain may still contain an authentic Father question or a scriptural quotation.

A closer, original-phrase/context examination has now produced **47 question–answer navigation records** (42 with a fairly direct same-excerpt explanation, five containing longer multi-stage arguments requiring structural preservation). Of the 47, five responses are especially short and four feature explicit interpretative alternatives. Each retains only an original Catena excerpt pointer, historical voice/qualification, and a **modern editorial reader question**. No Father text or new answer is generated.

Across both completed Matthew triage batches, **600** distinct excerpt pointers have been screened, **73** have had additional AI-assisted semantic spot review (26 + 47), and **11** comparison leads are recorded (4 + 7). **This is not 600 critically verified question–answer pairs.**

## Important source distinctions found

**Matthew 11:28–30 — yoke and burden:** Gregory emphasizes freedom from turbulent desire; Rabanus distinguishes narrow initial entry and sweetness developed by charity; Jerome compares the burdens of Old Law and Gospel. All are *source-specific* explanations, not one approved interchangeable answer.

**Matthew 12:9–14 — healing on Sabbath:** Augustine's excerpt explicitly reconciles Matthew, Mark and Luke by supposing opponents asked first and Christ questioned them afterward. The Scripture question is spoken by Christ or the opponents as appropriate; it is not an Augustine direct historical utterance.

**Matthew 12:46 — Christ's brethren:** Jerome first quotes **Helvidius's objection** and then explains biblical kinds of brotherhood. Reproducing the objection in a Jerome speech bubble without indication of its speaker would misrepresent his view.

**Matthew 13:10–17 — parables and blindness:** Augustine's long excerpt explores and adjusts several readings across Matthew, Mark and John. He explicitly notes a limitation on who profited by such obscurity. **A short extracted question and a confident one-sentence answer would destroy his argument.**

**Matthew 13:24 — wheat and tares:** Augustine initially entertains interpreting the bundles as separate heretical groupings, then rejects an overly immediate identification because erring people can return to communion, and places their binding at the final judgment. This is a concrete example of why we require argument order, alternative/retraction preservation, and conditional wording.

**Matthew 14:15–21 — loaves:** Chrysostom gives several arguments—not creating bread ex nihilo, the created world's goodness, poor persons giving what they have, why Christ blesses, thanksgiving, and His relation to the Father. One query cannot stand in for a paragraph containing several distinct reasons.

**Matthew 15:1–20 — traditions and uncleanness:** Chrysostom distinguishes human tradition from God's commands; Jerome explains practical support for parents and answers the hypothetical objection about food sacrificed to idols; Augustine distinguishes ritual symbols from natural impurity. These are related, not the same argument.

**Matthew 16:5–12 — leaven:** Jerome and Chrysostom discuss the disciples' forgotten bread, the warning against corrupt doctrine and the timing of Jesus' rebuke. The apparent topic group comprises several independent questions rather than a single universal answer.

**Matthew 16:13–20 — confession of Peter:** The famous "Whom do men say..." is **Christ's Gospel question**. Jerome, Chrysostom and Hilary offer different exegetical explanations; none should be rendered as though he originally spoke that line.

## Seven comparison leads

`matthew-batch-02-seven-comparison-leads.v1.json` crosslinks 21 **source pointers**, identifying distinct emphases and dangers of inventing consensus in: the easy yoke; wheat/tares; Peter on the waves; elders' traditions; the plant God has not planted; leaven and bread; Christ's question at Caesarea Philippi. These are editorial leads, not approved synthetic "Fathers agree" statements.

## Files and review gate

- `matthew-batch-02-300-voice-triage.v1.json`: 300 canonical original source pointers and exact punctuation windows. 109 relevant pericopes.
- `matthew-batch-02-47-meaning-checks.v1.json`: 47 additional AI-assisted meaning checks, original Father/voice boundaries and modern question prompts as navigation metadata.
- `matthew-batch-02-seven-comparison-leads.v1.json`: seven carefully distinguished cross-Father candidate topics.
- `tests/scripture-catena-matthew-batch-two.mjs`: verifies original excerpt's precise length, inherited label, verse source, all question mark offsets, no duplicate review rank, every curated check's pointer, multi-argument flags, seven groups and 21 reviewed comparison pointers.

**Next:** Continue remaining Matthew batch queues and progressively promote *meaning-checked* records only after source-work verification and editorial approval. The existing Messenger UI remains untouched. Via Patrum remains a source-discovery benchmark, not a second English translation pool.
