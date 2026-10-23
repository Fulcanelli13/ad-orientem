# Living Catena: Mark first-ten retrieval and editorial acceptance diagnostic

**23 October 2026 · research-only · Messenger PR #1533 · research source PR #1547**

## Reproducible measurement

Test: `node tests/scripture-catena-mark-adjudication.mjs`, in the **Living Catena editorial source acceptance** workflow's `source-contracts` job on commit `144312694c1a94ded0c410d22b750ea56b2cafa4`. This is an **AI-selected ten-case source challenge**, not a held-out sample graded by two independent humans.

- Exact, **research-only** question-to-canonical-source pointer: **10/10**.
- Existing *native pericope-local lexical* source search: **3/10** selected exemplars in the first four returned excerpts; **2/10** at position one.
- Thirteen adversarial questions: **13/13** abstained in exact pilot lookup; native local lexical returned **0/13** snippets. The test only counts snippets, not unseen browser/UI behavior, and does not certify real-world answer relevance.
- The 10 research questions are **not** part of the 60 provisional curated public Messenger question routes. No question/answer or original passage was generated, copied into a second Father corpus, or publication-approved.

## Seven exact-exemplar misses in top four

| Selected original excerpt | Topic |
|---|---|
| `catena.mark.6.45:11` | Augustine: passing-by at sea and invocation for help |
| `catena.mark.10.17:19` | Bede: wealth, detachment, conversion and Christ/camel typology |
| `catena.mark.8.27:13` | Chrysostom: Peter's confession and not-yet-understood Passion |
| `catena.mark.13.21:2` | Gregory: “if possible” and perseverance of the elect |
| `catena.mark.14.17:2` | Theophylact: probable Passover/reclining sequence |
| `catena.mark.15.29:4` | Augustine: plural-for-singular harmonization (next author **Theophylact** offers a separate possibility) |
| `catena.mark.14.10:1` | Chrysostom: rhetorical question about identifying Judas |

Three exact original-source exemplars **were** retrieved in the top four:
`catena.mark.16.1:19` (Gregory and angel's right-side symbolism),
`catena.mark.16.14:3` (Augustine's Resurrection harmonizations),
`catena.mark.11.11:1` (Chrysostom on the barren fig tree).

These results measure **reference retrieval**, not quality of other returned extracts: other sources may be useful. A blind human reviewer must grade all displayed extracts rather than merely mark a reference miss.

## Meaning-critical source correction

The Catena excerpt `catena.mark.16.14:3` includes an early-evening and a forty-day harmonization. In Augustine's fuller *De consensu evangelistarum* III.25 **§§77 and 83**, he favors a final pre-Ascension meal appearance. Neither the short Catena excerpt alone nor the source's historical proposal warrants declaring one reconstruction to be demonstrated Gospel chronology. The editorial workbench displays the qualification without rewriting Augustine.

Bede's fuller Latin `In Marcum` at Mark 10:23–27 includes Zacchaeus, absent in the frozen Catena extract; no insertion is permitted. For Mark 15:29, the **following** distinct fragment is printed under Theophylact rather than Augustine. Theophylact on Mark 14:17 proposes a probable sequence; no independently checked Greek critical text is certified.

## Next gate — accuracy over volume

1. Have two independent editors blind-grade each real returned Messenger excerpt as direct, useful context, weak or unsupported/misleading; do not assume the expected pointer is necessarily the only valid result.
2. For a question surviving source, speaker, edition/rights and historical-context checks, enable a **reviewed source-pointer navigation route** with complete canonical text. Do not try to approximate unverified patristic answers by generating prose.
3. Keep unsupported/overconfident variants abstaining or labelled as related source navigation. Explicitly test original-work differences (Augustine's preferred conclusion, Bede's abridgment, and the distinct Theophylact alternative).
4. Retest native lexical recall against the unchanged diagnostic cases, and separately require a new held-out human-reviewed acceptance set before release. The existing proposal of 85% useful/direct first-four and 0 misleading messages remains **a target, not an attained score**.

**Publication remains blocked, both PRs draft, all ten sources have zero independent human approvals.**
