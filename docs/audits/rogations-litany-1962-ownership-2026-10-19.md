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

The existing reader has **187 original Latin source rows** across
five text-bearing native ceremonial cards, followed by a sixth card
for Mass handoff with no liturgical text. These are **one source corpus**, without copied
words in this audit:

| Native stage | Source leaf count | Content / responsibility |
| --- | ---: | --- |
| ROG-R01 | 4 | Opening `Exsurge Domine` antiphon, Psalm 43 excerpt, Gloria, reprise |
| ROG-R02 | 18 | Kneeling cantors' opening Litany dialogue |
| ROG-R03 | 112 | Processional Litany, begins at `Sancta Maria`; exactly one invocation at each source slot |
| ROG-R04 | 35 | `Pater noster` (1), V/R (2), Psalm 69 (8), suffrages (24) |
| ROG-R05 | 18 | One source-owned `Oremus`, ten concluding orations and seven final dialogue/response slots |
| ROG-R06 | 0 | Only source handoff to Mass Introit, no duplicated Foot-of-Altar Ordinary |
| **Total** | **187** | **Original Latin source preserved, no novel prayer texts** |

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
document indexes **all 187 canonical Rogation reader rows**, with
owner IDs, section/response families, source positions, already
matched Ordinary and PRAY-owner candidate IDs, and the 1962-versus-
older chant directive conflict. It **does not store, write or promote
new Latin/English/French passages**.

The updated cross-source audit identifies **22** Latin occurrences
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
`tests/rogations-litany-112-source-owners.mjs` checks all 187 original
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

The registry now assigns all 187 rows to specific **next review queues**
instead of reporting the 150 unlinked items as an undifferentiated
translation backlog: Litany formula plus unique invocation, untemplated
Litany wording, Psalm/Exsurge recension and verse boundaries, ten
concluding collects, and the remaining rite dialogues/suffrages.
Exact Ordinary and PRAY matches remain separate candidate queues.
The generated summary distinguishes these queues **without subtracting
any rows from the 150 that still need full witness collation**.
The new test asserts 187 routed source identities and exactly 150
non-exact-owner candidates. CI checks audit structure and immutability;
it is not a 1962 facsimile or EN/FR editorial sign-off.

## 4. Primary photographed chant-witness page check — three targeted source holds

The full six-page [Solesmes 1961 *Liber Usualis* extract,
printed pp. 835–840](https://icksp.org.uk/newbrighton/wp-content/uploads/sites/2/2020/04/Rogations.pdf)
has now been **visually inspected** against the current Rogations donor
and its native reader projection. The evidence and print-page source
ranges are machine-recorded in
`data/mass/rogation-1961-print-witness-holds.v1.json`.
The six pages account for where the existing 187 donor text rows appear
(4 opening, 18 introductory Litany, 112 invocations, 35 Psalm/suffrages,
17 concluding rows). This is **targeted source collation**, not a
word-by-word certified 1962 facsimile for all 187 rows.

**Three defects documented against the original 186-row donor and corrected on this draft (subject to final 1962 editorial verification):**

| ID | Source row and photographed page | Discrepancy | Next editorial decision |
| --- | --- | --- | --- |
| 01 | ROG-R04-S24 → ROG-R05-O1; 1961 p. 840 | The original donor omitted **`Orémus.`** before the ten collects. It is now restored as `ROG-R05-OR`, owned by `ROG-END-010` and referencing existing Ordinary text owner `AO.SM.C0036`. | Implemented on draft; certify against complete 1962 witness before promotion. |
| 02 | ROG-R04-PN; 1961 p. 839 | Print directs **`Pater noster, in silence.`**; the original row had no silent-voice metadata; the reader now sets `voice: SILENT` and explains this in the stage guide. | Implemented for `ROG-R04-PN` only; verify edition-specific performance before release. |
| 03 | ROG-R05-O5; 1961 p. 840 | Photographed fifth collect reads `Pontifici nostro N.`; donor formerly read `Pontifici N.` and now reads `Pontifici nostro N.`. An independent [Latin Litany witness](https://la.wikisource.org/wiki/Litaniae_Sanctorum) also says `nostro`, but [a historical public Rogations account](https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=1355) omits it. | Corrected against the photographed chant witness and independent 1962-rite compilation; full 1962 printed edition certification still held. |

**One segmentation observation, not a textual omission:** the
photographed p. 839 numbers `Gloria Patri` and `Sicut erat`
as separate psalm lines, whereas the canonical donor includes both
in a single `postLitany.psalm69.7` source row. Both halves are present.
Treat this as a page/readability boundary question, not as missing Latin.

The focused **new test**
`tests/rogations-printed-witness-holds.mjs`
pins the exact printed-page / native-source scope, requires all three
holds to remain traceable, checks all 187 original source rows
are still in their native six stages, and forbids claiming completed
1962 edition or English/French source certification. The focused test is
included in `missal-posture-pages-qa.yml`.

**Policy:** The 1961 chant photo is direct and valuable textual
evidence, but **1962 `Rubricae generales` §82 controls non-doubling**.
The read-only holds do not yet change runtime, ceremony events,
source Latin, translated text, or the 48-card LIVE architecture. Exactly
**three source/voice decisions remain open**; no new translation is
justified by them.

## 5. Next gate: 1962 adjudication and edition-bound bilingual collation



1. **Verify the three implemented draft corrections** (independent `Orémus`, silent `Pater noster`, `Pontifici nostro N.`) against the full 1962 procession edition before release; then collate the complete 1962 printed Litany and appended Psalm,
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

## 6. Implementation after the printed witness (draft only)

One additional Latin source-owned cue has been restored without creating
another Mass event: `postLitany.oremus` → `ROG-R05-OR` before the first
collect, voice `AUDIBLE`, speaker `CELEBRANT`, reusing Ordinary wording
candidate `AO.SM.C0036`. `ROG-R04-PN` has a silence cue, and the fifth
collect now reads `Pontifici nostro N.` as in the photographed 1961 print
and independently in the `Psalterium Romanum iuxta ritum 1962`
([compiled witness](https://ccregis.org/psalter_lt.pdf)).

The resulting **eight-annex source census is 320 leaves: 61 exact
Ordinary matches, 17 additional PRAY matches, 242 requiring further
source review**. Within Rogations there are **187 original source rows:
22 Ordinary matches, 15 additional PRAY matches and 150 unmatched to only
those two owner families**. The former 319/60 and 186/21 numbers in
historical audit passages refer to the pre-repair donor. The 112 Litany
invocations, two distinct St James slots, 1962 non-doubling rule, six
ceremony events and Introit handoff remain unchanged. The newly restored
`Oremus` must not be translated again: its effective approved wording is
resolved through the existing Ordinary cue authority.

CI tests for text-source ownership, rite-page projection and printed
witness holds were updated. **Source certification of the full 1962
edition, vernacular collation and physical visual acceptance remain open**.

## 7. Existing English and French witnesses also contain the appended prayers

An evidence-based continuation of the prior PRAY corpus discovery has
recovered two **pre-existing whole-sequence vernacular witnesses**; we have
**not** translated the remaining Rogation rows:

- [1883 English *The Catholic Prayer Book and Manual of Meditations*](
  https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints),
  bounded around the oldid 12282621 transcription. After the Litany,
  its page continues with **silent Our Father, Psalm LXIX, suffrages,
  `LET US PRAY`, all ten concluding English collects and final prayers**.
- [1862 French Corneille, *Œuvres*, tome IX](
  https://fr.wikisource.org/wiki/Œuvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_pénitentiaux),
  pinned oldid 14794744. Its page continues **beyond `Notre Père`**
  into Psalm 69 (Latin/French prose and also a French poetic
  paraphrase), Latin/French suffrages, **ten Latin collects followed
  by ten French prose collects** and closing responses.

**Crucial boundary correction:** The current
`src/pray/litany-source.js#extractLitanyProper` deliberately stops
before `Our Father` or `Notre Père`, because the PRAY *litany proper*
is a deliberately narrower reading route. **The source publications
themselves do not stop there.** Prior audit wording suggesting that
the historical sources lacked the appended Psalm/ten collects was
incorrect. The available material is now recorded by **scope and
source edition** in
`data/mass/rogation-historical-language-witnesses.v1.json`
without copying unapproved translated passages.

This is **not complete, approved 1962 bilingual parity**. The 1883
English Litany lacks invocations/petitions in the 1961 photographed
chant list (including the earthquake and pestilence/famine/war
deliverances); the 1862 French historical Litany omits St Joseph
and has suspect transcription readings. The English prose Psalm
bundles verse boundaries, while the French page contains both a
source-adjacent prose rendering and Corneille's poetic Psalm. The
books differ from each other and from the 1962 edition; they also
require print verification and rights review. **Do not auto-select
the most complete-looking translation** and do not interpolate missing
prayers.

All ten *Rogations* concluding collects now have an **identified
pre-existing EN witness and FR prose witness by sequence**, pending
exact Latin-incpit/edition/wording collation. The counts remain
**187 Latin source leaves, 22 exact Ordinary matches, 15 further
PRAY matches and 150 other candidates**: historical-witness discovery
is not an approved exact owner match. The next step is **verse- and
collect-level alignment of these located sources** and selection
under canonical wording/rights policy, *not* translating all 150.


## 8. Ten-collect paragraph-level historical alignment (19 October)

The existing 1883 English source and the 1862 French/Latin source have
now been reconciled **collect by collect** to the canonical `ROG-R05-O1`
through `ROG-R05-O10` IDs, without reauthoring or copying the prayers.
The machine index is
`data/mass/rogation-ten-collects-historical-parallel.v1.json`;
`tests/rogations-ten-collects-historical-parallel.mjs` locks every
source locator, ordinal position, Latin incipit and unapproved status.

**Observed print/witness sequence:**
- 1883 English *Catholic Prayer Book*, [Litany of the Saints](https://en.wikisource.org/w/index.php?title=The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints&oldid=12282621),
  ten consecutive distinct English paragraphs after `LET US PRAY`.
  The Wikisource transcription is verified as a web witness, **not**
  independently reconciled against the original 1883 printed scan.
- 1862 Corneille / Marty-Laveaux, **printed p. 294**
  ([djvu image/page 308](https://fr.wikisource.org/wiki/Page:Corneille,_Pierre_-_%C5%92uvres,_Marty-Laveaux,_1862,_tome_9.djvu/308)),
  ten separate Latin collects; **printed p. 295**
  ([djvu image/page 309](https://fr.wikisource.org/wiki/Page:Corneille,_Pierre_-_%C5%92uvres,_Marty-Laveaux,_1862,_tome_9.djvu/309)),
  ten French prose counterparts, in the same order.

| Source ID | Canonical Latin incipit | Core topic | Focus of source collation |
| --- | --- | --- | --- |
| ROG-R05-O1 | `Deus, cui proprium est` | Mercy and absolution | Parallel subject/order established |
| ROG-R05-O2 | `Exaudi, quaesumus, Domine` | Confession, forgiveness, peace | Parallel subject/order established |
| ROG-R05-O3 | `Ineffabilem nobis, Domine` | Deliverance from sins and punishments | French Latin transcription `pro bis` suspicious |
| ROG-R05-O4 | `Deus, qui culpa offenderis` | Penance and averting punishment | French Latin transcription `rneremnr` suspicious |
| ROG-R05-O5 | `Omnipotens sempiterne Deus, miserere` | Pope and his salvation | 1883 English `N., our Sovereign Pontiff` vs donor `Pontifici nostro N.`; 1862 Latin transcription `Oranipotens` suspicious |
| ROG-R05-O6 | `Deus, a quo sancta desideria` | Peace unavailable from this world | Parallel subject/order established |
| ROG-R05-O7 | `Ure igne Sancti Spiritus` | Chaste body, pure heart | Parallel subject/order established |
| ROG-R05-O8 | `Fidelium, Deus, omnium conditor` | Departed faithful | Latin `famulorum famularumque` vs English generalized `servants` |
| ROG-R05-O9 | `Actiones nostras, quaesumus` | Divine precedence and aid | Historical `prevent` / `prévenir` require contextual reading |
| ROG-R05-O10 | `Omnipotens sempiterne Deus, qui vivorum` | Living/dead and intercession | 1883 English abbreviated `etc.` ending; 1862 Latin `miseris` vs donor `misereris` |

These are **ten position-and-subject historical pairing results**,
**not ten word-for-word-approved 1962 translations**. In particular,
collect 10 has a shorter published English close than the canonical
Latin, and the corresponding French prose uses an extended
concluding formula. Do not silently fill an abbreviated witness
from another language, adopt suspect printed words, import the entire
19th-century Litany, or claim facsimile approval.

**Updated outcome:** 10/10 historical English segments and 10/10
historical French segments identified by canonical source ID; **0/10
approved English, 0/10 approved French, 0/10 1962-Latin certified
against an independent edition**. Existing 320-row annex census and
150 Rogations non-exact-owner worklist **do not change**, because
a historical witness is not yet an approved canonical translation
owner. The next gate is original print/1962 collation and editorial
decision by exact source row, starting with O5/O8/O9/O10.

