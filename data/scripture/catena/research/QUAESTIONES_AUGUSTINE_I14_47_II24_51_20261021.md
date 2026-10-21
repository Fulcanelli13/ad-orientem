# Living Catena — Augustine *Quaestiones Evangeliorum*, continuation register
**Research date: 21 October 2026. No runtime answer changes.**

## Completion of the planned source-order pass

Read the [Latin text of Augustine's *Quaestiones Evangeliorum*](https://la.wikisource.org/wiki/Quaestionum_Evangeliorum) by numbered section, rather than assuming that a Catena snippet or question mark establishes an original Augustinian question. The primary source text explicitly identifies its two books as Matthew (I) and Luke (II), with many sections explaining matters in declarative language.

**New register:** [augustine-quaestiones-continuation.v1.json](augustine-quaestiones-continuation.v1.json)

- **Book I §§14–47:** 34 complete consecutive numbered section locators.
- **Book II §§24–51:** 28 complete consecutive numbered section locators.
- **Total: 62 section records** with a short original Latin locator, appropriate biblical anchor(s), and a modern navigation question **clearly labelled as editorial**, not a Father quotation.
- **62 source links** to *unchanged canonical Catena segments*, of which **55** have matching inherited work/topic references and **seven** are quarantined as inherited section-number conflicts.
- **17 of the 62 sections do not have a selected canonical Catena segment.** That is *not* proof that the Father's explanation is missing or ineligible; it means no invented Catena quotation is substituted. Source navigation remains possible through the independent Latin work.

These figures are **different measures** (sections versus excerpt links). Do not call this “62 Augustine answers”.

**Additional source-coverage exception:** Augustine Book I.20 discusses the signs of the sky in Matthew 16:2–3. The primary Scripture locator is preserved as Matthew 16:2–3, but the existing Catena Gospel index has no pericope covering Matthew 16:1–4. Consequently, I.20 has **no fabricated Catena excerpt**: it remains linked to the Latin original with a typed `primary_latin_scripture_location_unindexed_in_existing_catena_pericopes` status. This is a missing **Catena pericope**, not a claim that the biblical verses do not exist.

**Explicit authorial questions extracted:** [augustine-original-question-spans.v1.json](augustine-original-question-spans.v1.json) adds **17 actual Latin authorial interrogative/indirect problem spans across 12 sections**, preserving subordinate alternatives and distinguishing incomplete verbatim prefixes. It also includes five specific *exclusions*: a question spoken by a Jewish crowd, a question spoken by the disciples, Christ's question about stewardship, Christ's question to Saul, and a hypothetical objector whom Augustine describes while discussing the pounds. None may be put into Augustine's mouth.

## Seven quarantined Catena citation-number mismatches

These are **original English Catena inherited labels**, not evidence that the underlying Augustinian argument is fabricated. The Latin locus and subject comparison suggests which subsection corresponds, but alignment must be independently edition-checked:

| Latin section | Catena excerpt | Catena printed reference | Finding |
|---|---|---|---|
| I.28 — two blind men near Jericho | Matthew 20:29–34, Augustine segment 21 | *Quæst. Ev.* II.28 | Book number conflicts with Latin Book I.28; unlike Latin II.28, which treats body growth |
| II.32 — sheep and missing drachma | Luke 15:8–10, Augustine segment 3 | *Quæst. Ev.* II.33 | The nine drachmas are in Latin II.32, not only the prodigal-son section II.33 |
| II.37 — forceful entry into the kingdom | Luke 16:14–18, Augustine segment 11 | *Quæst. Ev.* II.87 | Apparent erroneous `87`, while Latin II.37 treats this saying |
| II.38 — five brothers of the rich man | Luke 16:27–31, Augustine segment 18 | *Quæst. Ev.* II.39 | Latin II.38 has the five brothers; Latin II.39 concerns faith and service |
| II.44 — two in bed, two in field | Luke 17:34–37, Augustine segment 3 | *Quæst. Ev.* II.41 | Latin II.44 treats people taken/left; Latin II.41 addresses the housetop |
| II.46 — nobleman and pounds | Luke 19:11–27, Augustine segment 5 | *Quæst. Ev.* II.40 | Latin II.46 treats the pounds; Latin II.40 concerns ten lepers |
| II.47 — rich man, camel and needle | Luke 18:24–30, Augustine segment 5 | *Quæst. Ev.* II.42 | Latin II.47 treats the camel; Latin II.42 concerns the field |

The earlier primary/30-section records additionally flagged **Zacharias** (II.1 reported as I.1) and **Martha/Mary** (II.20 reported as II.30). Maintain those earlier conflicts; this continuation contains seven additional unique conflicts.

**Important exclusion:** the Catena's `Quæst. in Matt.` (e.g. Matthew 13, Augustine, q.14–17) is not assumed to be identical to *Quaestiones Evangeliorum* I.14–17. Likewise *Eighty-three Questions* is a distinct work. These are not imported as automatic links merely because their names or numbers resemble the source index.

## Material particularly useful for a conversational question library

- I.40 offers multiple explanations of Christ's words about Judas, and the alternative inquiries themselves belong to Augustine, not an artificial question composer.
- II.33, on the prodigal son, contains several actual authorial questions in a **single long numbered section**. The genuine answer therefore requires context beyond a one-bubble extract.
- II.38 raises an unresolved issue about when the righteous are received after death. An author noting an open question is not a definitive doctrinal pronouncement.
- II.40 frames questions about the ten lepers, including why they were sent to priests.
- II.41–45 pose questions about watchfulness, Lot's wife, being taken or left, and the unjust judge.
- II.51 distinguishes figurative action from falsehood in Emmaus. Trimming the treatment to the initial question would obscure Augustine's reasoning.

**Policy:** Original author's Latin may inform discovery; no unsupervised modern AI paraphrase is displayed as Augustine's answer. If the full answer is not in the canonical Catena, link the independent original source until a translation is verified. Preserve original attributions, quotations, book/subsection, exceptions, and surrounding qualifications.

## Mechanical checks

- `tests/scripture-catena-augustine-continuation.mjs`: checks exact section coverage, original Catena author/ordinal/text identity, verse-key integrity, seven quarantines, 55 nonconflicted topic matches, non-publication.
- `tests/scripture-catena-augustine-original-spans.mjs`: checks 17 authorial Latin spans against the 62-record parent register and excludes five false-voice cases.
- Both tests are added to the existing **Living Catena Quaestiones research integrity** GitHub workflow.

Note: tests verify repo parity and source classification **within the curated research records**, not the truth of a critical edition, full Latin transcription, rights for modern translations, or independent human theological judgement. Scholarly source verification and contextual second review remain publication gates.

## Next source mining

Complete systematic Eusebius *ad Stephanum / ad Marinum* problems and then harvest further original Augustinian interrogatives within the **longer** sections, without relabelling biblical speakers and hypothetical objectors. Only then connect candidate natural-language suggestions into the draft Messenger interface via a separate, source-verified approval gate.
