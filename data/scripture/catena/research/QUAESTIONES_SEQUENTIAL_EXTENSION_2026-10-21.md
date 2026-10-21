# Living Catena — consecutive Augustine and Eusebius research extension

**21 October 2026. Source-research only; do not publish directly into Messenger.**

## Volume and concrete deliverables

The new `augustine-quaestiones-sequential-index.v1.json` covers **30 consecutive numbered sections**, preserving source order rather than selecting only passages already found in the Catena:

- Augustine, `Quaestiones Evangeliorum` **Book I §§1–13** (Matthew; 13 rows).
- Augustine, **Book II §§7–23** (Luke; 17 rows).
- **30 original Catena excerpt linkages** checked by inherited Augustine label, original ordinal, literal exact-text anchor, and Gospel location. These are link *occurrences*, not 30 different historical questions answered in the exact same language.
- The pre-existing initial crosswalk covers Augustine Book I.7 separately, plus Book II.1, II.3, II.5, and II.6. No duplicate user-visible Father text is created.

A separate `eusebius-marinus-supplement-problem-index.v1.json` adds **three** source-located Greek issues:

- Supplement IV: why John mentions two disciples at the tomb while Luke records Peter alone (John 20:3; Luke 24:12).
- Supplement V: why the evangelists describe different numbers/locations of angels (Matthew 28:2; Mark 16:5; Luke 24:4; John 20:12).
- Supplement XI: sea-of-Galilee versus mountain appearance after the Resurrection (Matthew 28:16; John 21:1, 14).

These are **separate primary source candidates**; no corresponding Eusebius Catena segment is invented. The online Greek supplement has inherited editorial/transmission issues and its displayed modern English is not reproduced in Ad Orientem.

## More direct Catena citations discovered

The existing Oxford/Newman packs explicitly cite Augustine's `Quæstiones Evangeliorum` at numerous passages, including Matthew 11:27 (I.1), Matthew 12:1 (I.2), Matthew 13:31 (I.11), Matthew 13:33 (I.12), Luke 5:33 (II.18), Luke 10:29 (II.19), Luke 11:17 (II.17), and Luke 11:5 (II.21).

This is a crosswalk into **the existing** 12,692-segment corpus, not a new rendering text or answer database. Some numbered sections are primarily allegorical explanations; a modern natural-language prompt summarizing a question of interest is **not** the historical author's literal question.

## Source conflicts retained, never silently patched

- Augustine Book II.1: the Zacharias Catena source note calls the source Book I.1; the consulted Latin witness puts it Book II.1 (as already noted in the first primary-source crosswalk).
- Augustine Book II.20: the Catena Martha/Mary source label says `de Qu. Evang. l. ii. q. 30`, while the Latin Book II.20 discusses Martha and Mary. This match is labelled **same-work probable with numbered-section conflict**, not promoted as a certified exact section match.

Neither error entitles the system to rewrite the historical Catena excerpt or its printed annotation. Edition-level and potential transcription differences require independent review.

## Classification rule

`author_explicitly_raises_exegetical_problem` only where the source wording actively raises the issue; for example Book II.7 contains `quaeritur ... quare sic interrogaverit` (why Christ said to save a soul when curing the hand). All other cases in this sequential sample are conservatively labelled `author_discusses_problem_not_a_verbatim_interrogative`. The interrogative words in a quoted Gospel verse belong to Christ or another biblical speaker, not to Augustine merely because he discusses them.

In the Eusebius index, hypothetical inquiries in the transmitted text are distinguished from the explicit question posed by **Marinus** in the first Marinus treatise. Also preserve the distinction between Eusebius and Julius Africanus when Eusebius is transmitting Africanus's explanation.

## Validation and next editorial gate

Standalone checks:
- `node tests/scripture-catena-augustine-sequential.mjs`
- `node tests/scripture-catena-eusebius-supplement.mjs`
- `node tests/scripture-catena-quaestiones-crosswalk.mjs`

Connector-based content verification this session confirmed **30/30** canonical Catena snippet links and all three Eusebius issues' Scripture keys. The Node files are committed for repeatability but **not claimed to have run under CI**.

Pending: independent scrutiny of the original Latin and Greek textual witnesses; source edition/translator rights checks; editorial distinction of literal authored questions versus third-party objections; expert theological contextual review; alignment of works and citations without conflating them; preservation of alternate original arguments. Keep the work in research branches until these checks precede publication.

Use no paid databases, no emails to rights holders, and no wholesale import of modern copyrighted English translations.
