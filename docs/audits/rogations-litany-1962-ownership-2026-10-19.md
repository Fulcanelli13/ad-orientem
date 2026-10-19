# Rogations: 1962 Litany source-owner matrix

**19 October 2026 · PR #1441 · Source ownership only, NOT a new translated corpus**

## 1. Source decision: 1962 rubrics supersede an older Liber chant note

The Latin primary source and its governing norm are **Rubricae generales
Missalis Romani 1962, §§ 82–90**, especially § 82:
`Litaniae Sanctorum (quae tamen non duplicantur) cum suis precibus.`
The Gregorian chant and ceremony order are preserved in the
[Institute of Christ the King / Liber Usualis Rogation extract,
printed pp. 835–840](https://icksp.org.uk/newbrighton/wp-content/uploads/sites/2/2020/04/Rogations.pdf).
Its pp. 835–836 establish **Exsurge Domine → kneeling cantors →
all rise at Sancta Maria and the procession starts without interrupting
the Litany**. The **older-style English annotation** on printed p. 835
says **each invocation is doubled unless a procession cannot take place**.
That direction contradicts the universally governing **1962 general
rubric's not-doubled rule**. The public 1962 Roman Missal
[Rubricae text (§§ 82–90)](https://la.wikisource.org/wiki/Missale_Romanum_1962)
and [independent 1962 rubric application](https://1962ordo.today/day/vigil-of-ascension-2-2-2-2-2-2/)
corroborate the latter. The chant witness is used for chant order and
action boundary, **not** as an override of the 1962 non-doubling rubric.

The 18 opening `Kyrie/Christe` cantor-and-response rows are actual
role-owned original reader rows, **not** authorization to repeat all
112 subsequent invocations twice.

The Roman General Rubrics § 83 allow the competent Ordinary to
substitute **public supplications** if a procession cannot occur.
§ 85 also recognizes a vernacular Litany with faithful where locally
customary. Neither an eligible calendar date nor the existence of a
trilingual Proper proves a procession actually took place. **The
Mass Proper is a separate textual owner and ceremony from the Litany.**

## 2. Source-level inventory and identity preservation

The existing reader has **186 original Latin source rows** across
five text-bearing native ceremonial cards, followed by a sixth card
for Mass handoff with no liturgical text. These are **one source corpus**, without copied
words in this audit:

| Native stage | Source leaf count | Content / responsibility |
| --- | ---: | --- |
| ROG-R01 | 4 | Opening `Exsurge Domine` antiphon, Psalm 43 excerpt, Gloria, reprise |
| ROG-R02 | 18 | Kneeling cantors' opening Litany dialogue |
| ROG-R03 | 112 | Processional Litany, begins at `Sancta Maria`; exactly one invocation at each source slot |
| ROG-R04 | 35 | `Pater noster` (1), V/R (2), Psalm 69 (8), suffrages (24) |
| ROG-R05 | 17 | Ten complete concluding orations plus seven final dialogue/response slots |
| ROG-R06 | 0 | Only source handoff to Mass Introit, no duplicated Foot-of-Altar Ordinary |
| **Total** | **186** | **Original Latin source preserved, no novel prayer texts** |

Within the **112** Litany invocations, the order is now mechanically
indexed as:

| Zero-based indices | Count | Group |
| --- | ---: | --- |
| 0–62 | 63 | Blessed Virgin, angels, apostles, martyrs and other saints |
| 63–64 | 2 | `Propitius esto` |
| 65–85 | 21 | `Libera nos` and mysteries of Our Lord |
| 86–103 | 18 | `Te rogamus, audi nos` petitions |
| 104–106 | 3 | `Agnus Dei` |
| 107–111 | 5 | `Christe audi/exaudi`, concluding Kyrie |

Two **identical** Latin invocations `Sancte Jacobe, ora pro nobis`
occur in the ordered apostolic series, at indices **14 and 17**
(native reader IDs **ROG-R03-15** and **ROG-R03-18**).
This is **not** a duplicate to delete: traditional invocations of two
apostles named James occupy distinct positions. The owner registry
therefore keys every invocation to **the source index and native
paragraph ID**, never only its normalized Latin words.

The 112 source lines, Psalm 69 lines, 24 suffrage responses, 10 orations
and final responses must remain **separate source-owned stages**.
The published trilingual Rogation **Mass Proper** covers none of the
additional 150 source ownership holds by itself.

## 3. No duplicate translation pipeline

The new read-only command

`node tools/mass/reconcile-rogation-litany-1962.mjs --write`

generates `artifacts/rogations-litany-112-source-ownership.json`.
Despite the filename (from the original 112-invocation scope), the
document indexes **all 186 canonical Rogation reader rows**, with
owner IDs, section/response families, source positions, already
matched Ordinary and PRAY-owner candidate IDs, and the 1962-versus-
older chant directive conflict. It **does not store, write or promote
new Latin/English/French passages**.

The prior cross-source audit established **21** Latin occurrences
already present in Ordinary cue records, **15** further Latin
occurrences matched to existing PRAY texts, and **150** without an exact
match to either of those two owner families. The latter figure is a
worklist, **not 150 translation gaps**. Repeated response formulas
reused across different saints still need a **litany-specific response
rendering decision**, not another composition.

The 1962 Litany of the Saints cannot be replaced by the existing
Litany of Loreto, a devotional Eucharistic litany, or independently
translated 1883/1862 historical litanies. Those texts are useful
existing-witness candidates, not the same rite or complete original
source text.

The dedicated acceptance gate
`tests/rogations-litany-112-source-owners.mjs` checks all 186 original
Latin source strings against the native reader, stage ownership and
source order. It preserves the two James positions, six Litany invocation groups,
the additional Psalm, suffrages and ten collects, the non-doubling
rule, and the separate Mass handoff.

### Formula-aware ownership triage — no new text (follow-up)

The 112 complete invocations are not 112 independent *response translations*.
Their repeated Latin ending can be indexed without deriving, replacing, or
retranslating the distinctive saint name/petition in the same source row:

| Invocation category | Latin response family | Occurrences |
| --- | --- | ---: |
| Individual saint | `ora pro nobis` | 46 |
| Plural saints | `orate pro nobis` | 16 |
| All saints | `intercedite pro nobis` | 1 |
| Deliverances | `libera nos, Domine` | 21 |
| Supplications | `te rogamus, audi nos` | 18 |

Each row now has **two intentionally separate identities**: its unchanged
`uniqueInvocationSourceOwner` and, when the suffix is recognized, a
`responseFormulaOwnerId`. The second is **only a wording-review
candidate**: the full Latin sentence remains in the original 1962 rite
payload and no English/French fragment is assembled from the template.
In particular the two `Sancte Jacobe` rows may share a response owner
but must never share source positions or ceremonial events.

The registry now assigns all 186 rows to specific **next review queues**
instead of reporting the 150 unlinked items as an undifferentiated
translation backlog: Litany formula plus unique invocation, untemplated
Litany wording, Psalm/Exsurge recension and verse boundaries, ten
concluding collects, and the remaining rite dialogues/suffrages.
Exact Ordinary and PRAY matches remain separate candidate queues.
The generated summary distinguishes these queues **without subtracting
any rows from the 150 that still need full witness collation**.
The new test asserts 186 routed source identities and exactly 150
non-exact-owner candidates. CI checks audit structure and immutability;
it is not a 1962 facsimile or EN/FR editorial sign-off.

## 4. Next gate: remaining archival collation, not translation

1. Collate the complete 1962 printed Litany and appended Psalm,
   suffrages and ten collects against the current Latin source, beyond
   the selected Liber Usualis inspected pages. Record literal
   discrepancies and real omissions by source location, not by a
   guessed prayer category.
2. Align the current French/English witnesses **line by line** to
   `ROG-R03-[1..112]` with version/date, rights and source scope.
   Do not transplant a Loreto prayer into a Saints-litany slot merely
   because `Sancta Maria` appears in both.
3. Match Psalter psalm numbering, 1962 text recension and verse
   boundaries before reusing any existing Scripture translation.
4. After source approval, refer all common formulas to the canonical
   wording owner, while preserving Rogation-specific timing, posture,
   Procession/Supplications choice and Schola action.
5. Only then let the already-owned reader render the approved text
   in two-column Missal and proper LIVE/Simple presentation.

**Current state:** PR #1441 remains draft/unmerged and all new draft
editorial translation material remains provisional. No Litany text or
performance state was changed in this reconciliation pass.
