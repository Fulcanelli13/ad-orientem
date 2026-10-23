# Living Catena — Schaff full-work mining, first research batch

**2026-10-23 · research-only · no Messenger/publication changes**

## Sources verified

Historical `Nicene and Post-Nicene Fathers, First Series` volumes:

- **Vol. VI, Augustine** — *The Harmony of the Gospels*, sections of Books III and IV. Published in the late nineteenth century; public-domain source-edition scan: https://archive.org/details/aselectlibrary06unknuoft . Textual location index: https://www.ccel.org/ccel/schaff/npnf106.toc.html .
- **Vol. X, John Chrysostom** — *Homilies on Matthew*, Homilies **XLIV** and **XLVII**. Historical source-edition scan: https://archive.org/details/selectlibraryofn10auguuoft . Direct homily transcriptions https://www.ccel.org/ccel/schaff/npnf110.iii.XLIV.html and https://www.ccel.org/ccel/schaff/npnf110.iii.XLVII.html .

These scans preserve the period's source edition as an independent reference for textual verification. **No permission requests.** Prefer nineteenth-century printed texts; modern website apparatus is not automatically part of the Father's text.

## Concrete results

**Fourteen source-body anchors** in `schaff-first-full-work-question-seeds.v1.json`:

| ID | Work locus | Topic and scope |
| --- | --- | --- |
| SCH-AUG-001 | Harmony IV.II §3 | Mark/Luke: demon departs violently but does not leave lasting injury |
| SCH-AUG-002 | Harmony III.VII §§29–31 | Matthew names Jeremiah for the thirty silver pieces; Augustine considers then rejects omitting the name |
| SCH-AUG-003 | Harmony III.X §37 | Jesus carries the cross, then Simon of Cyrene takes over; distinguish translator footnote |
| SCH-AUG-004 | Harmony III.XIII §§40–47 | Third/sixth hour of the Passion; a proposed harmonization, not independent historical chronology |
| SCH-AUG-005 | Harmony III.XVI §53 | Both robbers versus one penitent thief; **already linked to Catena Mark 15:29** |
| SCH-AUG-006 | Harmony III.XXIV §63 | One or two angels, outside/inside the Resurrection tomb; retain Augustine's alternatives |
| SCH-AUG-007 | Harmony III.XXIV §64 | Whether the women were silent or promptly reported the Resurrection |
| SCH-AUG-008 | Harmony III.XXIV §66 | Three days and nights through part-for-whole time reckoning |
| SCH-AUG-009 | Harmony III.XXV §70 | Paul and Gospel accounts of the post-Resurrection appearances |
| SCH-AUG-010 | Harmony III.XXV §§75–77,83 | Last appearance versus Ascension; **already linked to Catena Mark 16:14** |
| SCH-CHR-001 | Chrysostom Matthew Homily XLIV §5 | Why sow on unreceptive soil? **Already linked to Catena Matthew 13:1** |
| SCH-CHR-002 | Chrysostom Matthew Homily XLVII §1 | Why the disciples felt able to ask Christ about the tares |
| SCH-CHR-003 | Chrysostom Matthew Homily XLVII §1 | Why ask about tares rather than simpler seed/leaven parables |
| SCH-CHR-004 | Chrysostom Matthew Homily XLVII §2 | Why continue teaching the disciples in parables in private |

Each entry records a **short exact historical English search anchor**, author and edition, source URL, precise work section, relevant Scripture references, a modern navigation question, and a context warning. The question-origin field explicitly distinguishes **author's own explicit question**, **objection posed by Chrysostom**, and **modern research question about an attested argument**.

**Overlap:** 3/14 have a pinned, already existing canonical Catena source pointer, reconciled against prior Mark/Matthew work. **11/14 are unresolved for overlap** — we have not declared them unique additions just because the matched Catena pointer has not yet been found.

**No full patristic passages have been copied to a new user-facing corpus in this pass.** The prose question labels are modern and must never be attributed as quotations from Augustine or Chrysostom.

## Research decisions arising from the first pass

1. **Avoid flattening competing explanations.** Augustine's tomb angel discussion and Resurrection-appearance discussion give multiple possible reconciliations; preserve those differences at the level of the source paragraph.
2. **Do not confuse historical authors with later editors.** NPNF translator footnotes sometimes propose an alternative solution or caution about the author's Greek/Latin text. Label the source layer before extracting.
3. **Keep actual source questions separate from modern prompts.** Chrysostom's rhetorical objections and Augustine's explicit questions are valuable native question signals. An editorial summary is not a Father utterance.
4. **No automatic manuscript claims.** Original Greek/Latin collation was not performed in this batch. The English body sections were inspected, but source transcription still needs original printed-edition text verification for scalable import.
5. **Build a full-work extraction pipeline, not another Catena.** Next work: obtain the full scanned public-domain volumes in a reproducible way, section the *whole* works into source-owned paragraphs, extract literal question spans and replies with section boundaries, and compare against the frozen 12,692 Catena excerpts. Attach only *genuinely absent* additional material as new research source records.

## Status

Research rows: **14**; linked known Catena parallels: **3**; overlap still unresolved: **11**; full historical texts ingested: **0**; source-critical collation: **0**; independent human approvals: **0**; publication approvals: **0**.

The next gate is **more text acquisition and source-grounded extraction**, not human editorial review. Existing LIVE/Scripture readers and Messenger routes must not be altered by these records.
