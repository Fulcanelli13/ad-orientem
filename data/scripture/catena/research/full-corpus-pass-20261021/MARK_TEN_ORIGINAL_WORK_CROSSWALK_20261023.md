# Living Catena — ten Mark questions: external work crosswalk (23 October 2026)

**Status:** AI-assisted research, not human editorial certification. Source-of-truth remains the canonical Oxford/Newman Catena and its existing pericope/segment pointers. No original Patristic words or inherited labels have been replaced; no Messenger app change; zero publication approvals.

## Outcome

- Ten selected contextual Mark questions were compared with externally browsable original-work witnesses or clearly labelled excerpts attributed to those works.
- **Nine** have a separately readable witness of the larger original work: Augustine (3), Chrysostom (3), Gregory (2), Bede (1). Three were inspected as Latin in their original language (Gregory twice and Bede once); the other six rely on historical translations, including one French witness for Chrysostom.
- **One** (Theophylact on reclining at the Passover, Mark 14:17–18) has a separately labelled *Commentary on Mark* excerpt, but not an adequately identified Greek edition/column read independently. It remains an external-work locator lead, **not** original-text verification.
- Greek critical-edition collation: **0/10**. Independent human approvals: **0/10**. Production publication: **0/10**.

## Source-specific editorial decisions

| Canonical Mark pointer | Independently browsed work | Editorial boundary |
|---|---|---|
| `catena.mark.6.45:11` | Augustine, *De consensu evangelistarum* II.47 §99 | Passing-by is Augustine's interpretation of eliciting a cry; not a new Gospel event |
| `catena.mark.10.17:19` | Bede, *In Evangelium S. Marci*, on 10:23–27, PL 92, 232D–233B | **Abridgment:** original Latin lists Matthew, **Zacchaeus**, Joseph; canonical excerpt has Matthew and Joseph only. Do not silently rewrite Catena |
| `catena.mark.16.1:19` | Gregory, *Homiliae in Evangelia* II, Hom. XXI §2 | Right/left is a symbolic reading in the homily, not a biblical narrative claim |
| `catena.mark.16.14:3` | Augustine, *De consensu evangelistarum* III.25 §§75–77, 83 | **Correction:** the Catena gives alternative harmonizations, while Augustine's full-work conclusion prefers a final pre-Ascension appearance; do not present alternatives as equally endorsed |
| `catena.mark.8.27:13` | Chrysostom, *Homilies on Matthew* 54 §5 | Commentary is originally on Matthew 16; apply to Mark only via the existing Catena |
| `catena.mark.11.11:1` | Chrysostom, *Homilies on Matthew* 67 §§1–2 | Fig tree as a sign of Christ's power; not a moral accusation against a plant |
| `catena.mark.13.21:2` | Gregory, *Homiliae in Ezechielem* I.9 §8 | Latin homily explicitly cites Gospel parallel; preserve the conditional and perseverance nuance |
| `catena.mark.14.17:2` | Theophylact, *Enarratio in Marcum*, verse 14:17–18 | Only a later English excerpt independently observed; original Greek edition still unresolved; hypothesis remains probable |
| `catena.mark.15.29:4` | Augustine, *De consensu evangelistarum* III.16 §53 | Augustine's plural/singular explanation must not be conflated with the **next** Catena voice's alternative |
| `catena.mark.14.10:1` | Chrysostom, *De proditione Judae*, Hom. 1 §2 (French witness) | The homily's rhetorical statement is not scriptural speech; French witness does not certify Greek original |

The machine-readable source-URL/locus/risk register is `mark-ten-original-work-crosswalk.v1.json` and its non-publication and canonical-pointer contract is `tests/scripture-catena-mark-original-works.mjs`.

## Messenger handoff — reuse, do not replace

Existing draft Messenger PR **#1533** contains a 60-question provisional, source-pointer-based navigation catalogue and a human editorial review workbench. None of these ten Mark pointers was found in the 60 provisional canonical question routes as of commit `35e3c25fb2c7d50f3a40df094b720cb3d93709a5`. The existing Messenger also contains a separate whole-Gospel lexical retriever and source-integrity checks.

**Recommended integration boundary:** import this crosswalk as **research-only** workbench provenance, not an independently generated Father-answer corpus and not automatic production navigation. Verify the ten exact pointers against the canonical Mark chapter-pack loader; show work/witness link and caveats only in the editorial review interface, and require explicit future signoff for any new navigation prompt.

### Reader-level adversarial acceptance cases

Test both the original contextual questions and counterfactual or overly certain alternatives. In particular:

1. Augustine Mark 16:14: asking **which appearance must have occurred on the fortieth day** must not receive a categorical answer when Augustine preserves alternatives.
2. Theophylact Mark 14:17: asking **whether Christ certainly completed one Passover meal before reclining** must not turn the tentative hypothesis into a fact.
3. Bede Mark 10:17: asking **whether Zacchaeus is present in the exact Catena quotation** must answer *no*, even though he appears in the original Latin fuller work.
4. Augustine Mark 15:29: asking **whether Augustine himself asserted that both thieves initially reviled Christ** must distinguish the separate neighboring Catena voice.
5. Gregory Mark 13:21: a question about the fate of a named individual must not infer his election from Gregory's general exegetical point.

These are editorial challenge requirements, **not tests claimed to pass in the product**. Treat no-match as preferable to fabricated Father speech. A future Messenger feature should demonstrate positive source-pointer retrieval, explicit alternative branches, and fail-closed responses for unsupported questions.

## Remaining gates

- Inspect Theophylact at a reliable Greek edition and pin exact locus.
- Independently second-read attribution and context of the ten, especially multi-argument Augustine and Bede abridgment.
- Reconcile workbench provenance and prove source-integrity/abstention behavior on Messenger PR #1533 before any production question expansion.
- Preserve the full 12,692-excerpt canonical Catena and existing mainline Scripture reader unchanged.

## October 23 — AI-assisted editorial question adjudication

The separate `mark-ten-ai-editorial-adjudication.v1.json` now provides **ten AI-only contextual assessments** (eight provisionally direct, two requiring stronger non-standalone contextual safeguards), plus **thirteen adversarial reader-question probes**. Neither grade 3 nor grade 2 constitutes independent human editorial approval. All ten remain blocked.

The two grade-2 cases deserve first attention: Augustine on Mark 16:14, where the *full work* reaches a stronger conclusion than the short Catena extract, and Theophylact on Mark 14:17, where a probable sequence is documented by a later excerpt but no independently inspected Greek edition.

Additional risks retained: Bede's abridgment (Zacchaeus absent from the Oxford/Newman extract), Gregory's symbolic rather than literal right-hand reading, the cross-Gospel origin of Chrysostom's Matthew homilies, and Augustine's plural-for-singular explanation being different from the **next** Catena commentator's alternative.

**Editorial blind-review rule:** supply each reviewer the exact modern question, biblical pericope and verified original Catena extract(s), with the segment citation and inherited author label; hide the AI grade and target ranking until scoring. Compare independent assessments, record supporting literal phrases, and resolve disagreement. No reviewer ticks, source-work rights, attribution, or approval is automatically certified by this dossier.

**Retrieval rule:** an adversarial probe expecting `no_certified_direct_answer` may still lead a user to a correctly cited *related* excerpt, but must not result in a false claim that the named Father directly asserted the challenged proposition. This is distinct from promising that every negative phrase returns zero lexical results.
