# St Pius X — source-first conversation editorial standard (v1)

**21 October 2026 · source-owner PR #1458 · INTERNAL DRAFT — NOT RELEASE-APPROVED.**

This standard supersedes the *style of writing dialogue* in the earlier “FAQ-like” source-locked batches; it does **not delete, rewrite, or transfer ownership of their canonical source records**. The three long conversation scripts established in chat (*Acerbo nimis*, *E supremi*, *Haerent animo*) remain **editorial working scripts**. The attached JSON contains **12 representative bilingual exchanges and 26 aligned individual speech segments**, not a false certification of the entire long scripts. Read [the source-to-claim map](../../data/learn/research/pius-x-document-first-three-benchmark-source-map-20261021.v1.json).

## Governing principle

**No interpretive conclusions in the historical character's voice.** Every proposition the avatar speaks must be attested in an identifiable text authored by Pius X, with proper context. AI may propose linking sentences, reorganize grammar, translate/abridge, name the document, and adapt whom an injunction is addressed to. Those permitted changes **must not add doctrinal conclusions, personal judgments, diagnoses, claims about a present-day person, or imply that an earlier source made a statement it did not make**.

Pius X consistently uses the **papal plural** when speaking of himself as pope: *We / Our / Us* and *Nous / Notre / Nos*. This is not a mandate to make every sentence begin with “We.” Correct ordinary French agreement and capitalization naturally.

A lay visitor is **not** an encyclical's historical addressee. The Pope may say “In Our encyclical … We urged the bishops …,” never take a passage of `Acerbo nimis` addressed to bishops and deliver its second-person commands as if the visitor were a bishop in 1905. The same applies to clergy in `Haerent animo`.

The named document is **part of the spoken reply** when first introduced or as a natural later reminder; the **exact section and document link** are available beside **every** reply whether or not the Pope repeats its title. Do not flood speech with repeated bibliographic phrases. In production the link should open the precise passage, or the whole original document at the stated section when no verified paragraph deep-link exists.

## Evidence hierarchy

| Witness | May the avatar say “We wrote…”? | Requirements |
| --- | --- | --- |
| Authored encyclical, exhortation, official papal address or authenticated letter | Yes, as a paraphrased recollection | Identify work and locus; preserve chronology, audience, qualifications and authentic conclusions |
| Original Giuseppe Sarto manuscript (e.g. Salzano) | Yes, if authorship established | Say when it was written before he became Pope; Salzano's question numbers are later editorial numbering |
| Catechism promulgated/approved during his pontificate | **Not automatically as personal authorship** | Say “In the catechism We approved/prescribed…” if attested; do not claim every line was written by Pius X |
| A quotation **within** Pius X's document (Paul, Leo XIII, St Charles, St Bernard, Benedict XIV) | “We cited / We recalled **[author]**…” | Source card shows **both** Pius X's document and the earlier authority; never silently appropriate their words |
| Later biography, uncertain anecdote, unsourced oral tradition | No | Use the external narrator or hold until historical attestation |

## Adaptation levels

**A — exact transcription / checked faithful translation.** Flag as quote only if its **specific displayed language** was compared with a verifiable source edition. A translation is not an autograph quotation. Check a French rendering against French/Latin, not merely against newly written English.

**B — admissible dialogue adaptation.** Reorder sentences locally, abbreviate, switch addressee/personal tense, introduce a named encyclical, permit conversational connectors (“Indeed…”, “Consider…”). Each resulting **sentence** must map to attested propositions. A paragraph citing only a broad document is insufficient.

**C — substantive interpretation or invented conclusion: prohibited as historical speech.** If an attractive last sentence is not plainly in the source, delete it from the Pope's answer. If it is needed as a modern historical or disciplinary qualification, it may appear in an **out-of-character editorial card without his sprite**.

The distinction **B versus C is semantic**. Automated checks can detect missing citation IDs, unpaired languages and banned pronouns, but **cannot establish meaning-preserving equivalence**. An editor must check each sentence's propositions against its actual passage and all nearby qualifications.

## Required record fields

The registry holds the source document, date, genre, original audience and language editions; the *present* visitor's context; visitor question EN/FR; ordered speech segments EN/FR; a common claim ID list for both languages; reference section and URLs; earlier authority attributions; adaptation type; and **independent unapproved gates** for source fidelity, historical context, theology, French, English, period voice and publication.

Do not falsely classify “a summary of Pius X's speech” as his verbatim words. Do not republish a 1905 disciplinary obligation as current law. When no source supports a question, show a neutral **editorial** boundary or offer a genuine further question—no fabricated papal answer or private opinion.

## Concrete editorial decisions for the three documents

### *Acerbo nimis* — catechesis

Keep his explicit concession that other causes of religious decline exist (§1), the surprising example of worldly education coexisting with religious ignorance (§2), his own distinction between the homily and catechism (§12), and his own prescribed catechist's progression (§13). The bread/milk comparison is Pius X's presentation; `Etsi minime` is **Benedict XIV's** work cited by him. His prescriptions to bishops and parish priests are historical instructions, not commands addressed to the lay visitor. His conclusion belongs to §27—do not invent an additional homiletic closing.

### *E supremi* — charity and correction

Retain **both halves** of §13: bitterness and needless harshness harm the apostolate **and** St Paul's command to correct is not abolished. The visitor must not hear the generic AI maxim that “doctrine doesn't matter” or “every correction is uncharitable.” Pius X specifically presents Christ's tenderness as the example and extends charity even towards enemies and persecutors, without claiming to know their individual consciences. Respect his qualifier that results **may** be slow, rather than promising conversion.

### *Haerent animo* — holiness of priests

Its original addressee is **clergy**, not every visitor. Never universalize a prescribed priestly prayer schedule to all laypersons. Pius X rejects **both** activity without inward holiness (§§8–9) **and** an alleged perfection that neglects parish responsibilities (§10); the two passages should remain in that order. Accurately attribute the prior papal teaching to **Leo XIII**, the admonition about daily meditation to **St Bernard addressing Eugenius III**, the practical altar/psalm/penitent examples to **St Charles Borromeo**, and spiritual reading counsel to **St Jerome**. Vatican edition used for comparison is Italian plus Latin; EN and FR adaptations do not thereby become official translations.

## Publication gate

- Source review: **PENDING** — sentence-level meaning, evidence context, edition and locus.
- Theological review: **PENDING** — no novel interpretations.
- English / French translation: **PENDING separately** — independent cross-check against Latin/official editions.
- Historical voice / dialogue owner: **PENDING**, coordinated with style PR #1419.
- Visual-stage owner: **PENDING**, respect PR #1402's approved five sprites.
- Production integration/merge: **NOT AUTHORIZED**.

## Next pass

The full chat scripts include additional passages **not yet mapped in this 12-turn seed**. Finish mapping the remaining turns *before* adding more scene volume. Record every claim boundary; identify where a line needs deletion, retranslation or an out-of-character card. Approve a conversation only when all independent checks are resolved. Do not turn the prototype into the authoritative source-of-truth; the repository registry governs wording.
