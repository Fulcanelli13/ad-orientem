# Living Catena — mining questions actually present in the Fathers' commentary

**First research batch — 21 October 2026. Research only, not a new answer corpus.**

## Provenance and results

The *40 distinct pericopes* in the existing four-Gospel pilot were searched
for interrogative punctuation inside the attributed English extracts in the
pinned Oxford/Newman **Catena Aurea** corpus. The mechanical discovery pass
found **173 question-mark occurrences**. Many are Jesus's, Peter's, Judas's
or other quoted biblical questions, or objections voiced for an imaginary
speaker, not original questions the commentator is explaining.

The first selective reading retained **27 attributed commentary questions**
across **14 distinct Gospel pericopes**:
**Matthew 8, Mark 1, Luke 3, John 15**. All 27 were checked directly
against the canonical excerpt for **the original verbatim question, the
unchanged historical Father attribution, the exact source-segment ordinal,
and a following original evidence phrase in that same fragment**.

Seven additional question strings are preserved as **explicit exclusion
examples**, with rationale, so they cannot be mistaken for a source-backed
Father-authored Q&A. Some questions quoted in the Catena may have been
rephrased or abbreviated by the historical compiler or translator. The fact
that an *English Catena excerpt* attributes a question to an author does
**not** independently prove its wording or authorship in a critical edition.

Original candidate register:
[patristic-questions-seed.v1.json](patristic-questions-seed.v1.json).

Standalone validation:
\`node tests/scripture-catena-original-questions.mjs\`.
The register was manually/connector-checked against the canonical chunks;
the standalone test is committed for repeatability, **not claimed to have
already passed CI on this research branch**.

## Sample questions attested in the source

| Passage | Historical attribution within Catena | Question appearing in the attributed excerpt | Evidence in original same segment |
| --- | --- | --- | --- |
| John 1:1 | Basil | “Wherefore then Word?” | “Because born impassibly” |
| John 1:1 | Chrysostom | “But why omitting the Father, does he proceed at once to speak of the Son?” | “Because the Father was known to all” |
| Matthew 9:9–13 | Chrysostom | “But why did He not call him at the same time with Peter and John and the others?” | “Because he was then still in a hardened state” |
| Matthew 11:28–30 | Rabanus | “But how is Christ’s yoke pleasant…” | A narrow beginning becomes broad through love |
| Mark 8:27–33 | Chrysostom | Question concerning Peter's rapid fall after revelation | Subsequent distinction between knowledge of Christ and His Passion |
| Luke 12:32 | Basil | Question about the grounds for selling possessions | “To this we must answer” and an explanation that created goods are not intrinsically evil |
| John 10:11 | Augustine | “If He is the Door, how doth He enter by Himself?” | “Just as He knows the Father by Himself” |
| John 14:22–26 | Augustine | Question whether the Holy Spirit is excluded when the Father and Son dwell in the soul | Commentary applies John 14:16 and the common dwelling of the Trinity |
| John 15:12–17 | Gregory | Why Christ gives a special command to love | “Love and love only is the fulfilment” |

This table is a navigation summary; the register preserves **exact
original English question strings** and separate exact evidence anchors.
It does not reproduce, alter or paraphrase a complete Father answer in
a chat message. In a future UI, only the original source pack may provide
the Father's displayed words.

## Seven non-eligible examples caught

- Mark 8:27: “Whom do men say that I am?” — **Christ's biblical question**.
- Mark 16:1: “Who shall roll us away the stone…” — **women's biblical question**.
- Matthew 18:21: “Lord, how oft shall my brother sin…” — **Peter's biblical question**.
- John 14:22: Judas's question about the manifestation of Christ — **biblical dialogue**.
- Luke 6:32: “How shall I get my living?” — **imagined interlocutor**, not presented as Basil's own explanatory question.
- Luke 10:38: the question whether Martha was blamed — explanation is not complete in the **same** Catena fragment; requires contiguous-source inspection rather than claiming a self-contained Q&A.
- John 10:11: whether Apostles fleeing persecution were hirelings — question is raised in an excerpt without its answer in the **same** fragment; requires reading the following text in the complete underlying work.

This exclusion discipline is essential: **question-mark mining alone
produces false patristic voices**.

## Relation to existing external question resources

Baltimore Catechism question forms, Nave/Torrey subject headings, and
HistoricalChristianFaith original homilies remain complementary but
**separately sourced** research inputs. A catechism prompt cannot be put
into Basil's or Augustine's mouth. A question occurring within an attributed
Catena extract is usually stronger evidence of the commentary's intention
than a modern question generated from coincidentally matching vocabulary.
Both still require full-context relevance review before publication.

## Next priorities

1. Mine the **remaining source passages**, including the 26 pilot pericopes
   where no eligible self-question was retained in this first selective
   pass. **Zero retained is not equivalent to no commentary or no questions**.
2. Extend research to the surrounding complete original sermons when
   accessible and rights-safe, because Aquinas's Catena often cuts the
   question from its reply across multiple attributed fragments.
3. Perform a separate scholarly/canonical author-edition and doctrinal
   review. Preserve inherited historical pseudo-attributions honestly.
4. Build a traceable crosswalk between **three independent origins**:
   Father-attributed original question, historical Catholic catechism
   question, and biblical topic/verse heading. Keep lineage, licensing
   and answer-evidence approval distinct.
5. Only after those gates, use the questions as suggestions in the
   Living Catena Messenger. A question tap should open its complete
   **original verified commentary**, never an invented Father reply.

The future question registry should therefore have at least these
independent fields: exact source question + original author/edition +
original fragment + answer evidence + textual/contextual review grade +
question-type classification + publication status. Not all 814 pericopes
need a rhetorical question to remain navigable.
