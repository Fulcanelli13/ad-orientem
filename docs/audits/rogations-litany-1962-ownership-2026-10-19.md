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


## 9. Psalm LXIX and post-Litany suffrages — historical EN/FR crosswalk

The remaining **eight canonical Psalm 69 reader paragraphs** and
**24 ordered suffrage dialogue rows** in stage `ROG-R04` have been
reconciled against the **already-located 1883 English** Catholic Prayer
Book and the **1862 French** Corneille/Marty-Laveaux text. The
source-only row register is
`data/mass/rogation-psalm69-suffrages-historical-crosswalk.v1.json`;
the corresponding executable invariant is
`tests/rogations-psalm69-suffrages-historical-crosswalk.mjs`.

| Canonical rows | Existing witnesses located | Resolution |
| --- | --- | --- |
| `ROG-R04-PS1…7` | **7/7** English and **7/7** French historical prose parallels | Aligned by verse/meaning; English prose is one run-on paragraph, French is Latin/French verse-aligned. Not 1962 translation approval |
| `ROG-R04-PS8` | Doxology in both editions, **abbreviated** after `Gloria Patri` | Full canonical Latin already matches the PRAY `foundations_glory_be` trilingual Latin exactly after accent/punctuation normalization; inspect this existing EN/FR owner candidate rather than finishing the historical abbreviations by inventing text |
| `ROG-R04-S1…22` | **22/22** historical English and **22/22** historical French role-ordered suffrages | Both transcriptions contain the complete sequence, but English groups ten rows in one paragraph and the following twelve in another; role boundaries belong to the 1962 source, not formatting of the printed historical translation |
| `ROG-R04-S23…24` | **Not in either 1883 or 1862 historical source at this stage** | The `Dominus vobiscum / Et cum spiritu tuo` exchange exists in the native Rogations source and already has Ordinary text-owner candidates `AO.SM.C0034` / `AO.SM.C0035`; do not remove, retranslate or graft event timing |

Historical source loci: [1883 English Litany](https://en.wikisource.org/w/index.php?title=The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints&oldid=12282621)
(`Psalm LXIX` and the following verses/suffrages),
and [1862 French entire chapter](https://fr.wikisource.org/wiki/%C5%92uvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_pénitentiaux)
(`psalmus lxix` French prose/Latin parallels, then Latin V/R, separate
French poetic Psalm LXIX, then French V/R). The French **poetic
paraphrase is excluded** from canonical Litany/Missal wording reuse.

**Four editorial cautions to preserve:**

1. Psalm LXIX is the **Vulgate Psalm 69**, generally numbered **Psalm
   70** in Hebrew-based modern Psalters. Align each of its seven
   substantive source paragraphs to the correct Latin recension, not
   by a naive English Bible title.
2. The 1883 English first sentence begins with the historical wording
   “Incline unto my aid” rather than a mechanically direct rendering
   of `Deus, in adjutorium meum intende`. It is a witness for
   comparison, **not automatically the selected liturgical translation**.
3. Both historical **Gloria/Sicut erat** passages are abbreviated with
   “etc.”, while the canonical donor contains the entire Latin
   doxology. The existing `foundations_glory_be` prayer is a
   **complete trilingual exact-Latin candidate**, subject to the
   original PRAY source-certification hold; do not represent
   historical `etc.` as full parallel text.
4. The 1862 Latin Wikisource line for `Esto nobis… turris
   fortitudinis` reads **`fortifudinis`**, a suspect transcription.
   Retain the canonical `fortitudinis` until original facsimile
   collation. The historical source's omission of the concluding
   `Dominus vobiscum` pair likewise **does not** prove it is absent
   from the 1962 procession.

**Disposition:** All **32** rows are accounted for in source-owner
review; **29** have substantive historical EN/FR wording candidates
(7 Psalm verses + 22 V/R rows), **one** has an abbreviated historical
doxology plus an existing full PRAY owner candidate, and the last
**two** have existing Ordinary cue owners. **Zero EN or FR rows
promoted**, **zero new translations written**, **zero source events,
roles, 112-invocation Litany rows or native source Latin changed**.
The prior whole-rite exact-match ledger is unchanged (**187 Rogation
source rows; 22 Ordinary + 15 PRAY exact matching occurrences; 150
still without an exact owner from those two families**). Do not
subtract 32 from the 150: the 32-row historical evidence is not
equivalent to 32 newly approved owner identities.


## 10. Consolidated 187-row EN/FR source ownership census

The final opening, introductory and concluding rows have now been
reconciled to the same original-source IDs as the Psalm/suffrages and
ten collects. The canonical native reader still has **187 original
Latin rows**, with no new translations or event graph changes.

The complete auditable index is
`data/mass/rogation-187-vernacular-owner-census.v1.json`,
checked against the real native reader, prior 112-invocation owner index,
existing LOW/SUNG Ordinary and PRAY registries by
`tests/rogation-187-vernacular-owner-census.mjs`.

### Actual exact Latin ownership, with NO translation approvals implied

| Native stage | Source rows | Exact Ordinary Latin matches | Additional exact PRAY Latin matches | No exact match to those two corpora |
| --- | ---: | ---: | ---: | ---: |
| ROG-R01 · `Exsurge Domine` opening | 4 | 0 | 1 | 3 |
| ROG-R02 · cantors' Litany dialogue | 18 | 6 | 4 | 8 |
| ROG-R03 · 112 processional invocations | 112 | 4 | 7 | 101 |
| ROG-R04 · post-Litany Pater, Psalm and suffrages | 35 | 6 | 3 | 26 |
| ROG-R05 · ten collects and ending | 18 | 6 | 0 | 12 |
| **Total** | **187** | **22** | **15** | **150** |

This ledger is now reconciled at the level of **every** native
`ROG-Rxx` ID and original Latin JSON path. Within the 150 rows
without exact Ordinary/PRAY matches, source-review work divides into:

| Priority / next work | Count | Meaning |
| --- | ---: | --- |
| EN/FR historical passage or position found | **46** | Specific parallel line, verse, or historically compressed role-pair exists; 1962 edition / scan / rights / wording review outstanding |
| Historical Litany of the Saints family found, but not each invocation individually certified | **101** | Existing 1883 EN and 1862 FR Litanies are only *family witnesses*; numbered saints, additional petitions and exact role wording still require ordered alignment |
| Source-specific chant/Scripture translation witness to locate | **3** | Opening `Exsurge Domine` antiphon twice + `Deus auribus nostris` Psalm 43(44) incipit; **two distinct Latin text groups**. Neither the 1883 nor 1862 historical penitential Litany publishes this Rogation opening |
| **Total without exact corpus owner** | **150** | **Not a count of missing translations** |

The other **37** original rows match canonical Ordinary (22) or
PRAY (15) Latin exactly; approved effective EN/FR wording, textual
edition, ritual speaker and sound remain separate release gates.
These **37 + 46 + 101 + 3** are disjoint *review priorities*,
not 187 approved bilingual prayers. This mapping contains no newly
translated body passages.

### The remaining 32 opening and ending source rows

- **ROG-R01 (4)**: complete `Gloria Patri` has the existing
  `foundations_glory_be` trilingual PRAY candidate. The repeated
  `Exsurge Domine` antiphon occurs at **two distinct source positions**
  but is **one distinct text to research**; the intervening `Deus
  auribus nostris` is a Psalm 43(44) verse *fragment*, not a complete
  lection. Search the **right Psalter recension and exact verse**
  before commissioning any translation. The historical 1883/1862
  penitential-Litany witnesses start at another antiphon and cannot
  supply this processional opening.
- **ROG-R02 (18)**: six existing Ordinary Kyrie/Christe matches;
  four `Christe audi/exaudi nos` pairs have exact PRAY Latin
  candidate lines. The four invocations of the Divine Persons/Trinity
  and four `Miserere nobis` responses are **eight separate ceremonial
  reader rows** although the 1883 EN and 1862 FR historical Litanies
  print each invocation **with its response on one line**. Record
  shared wording by Latin formula, not by inventing separate
  vernacular verses or doubling the 1962 Litany.
- **ROG-R04-PN/V/R (3)**: English 1883 explicitly includes silent
  `Our Father`, `lead us not`, `deliver us`, and the existing
  Ordinary `AO.SM.C0210` matches `Sed libera nos a malo`.
  French 1862 abbreviates the Our Father and does not print the
  following V/R as independent rows at this stage. Its *absence
  from this historical page is not evidence against the 1962 rite*.
  Preserve `ROG-R04-PN` silent voice (already source-corrected).
- **ROG-R05-F1…F7 (7)**: the opening and three further `Amen`
  responses have Ordinary owners, as do `Dóminus vobíscum` /
  `Et cum spíritu tuo` on F2/F3. The historical EN/FR appendix
  has the closing Amen, `Exaudiat nos` and `Et fidelium animae`
  responses, but **neither witness prints the final `Dominus /
  Et cum` pair at the same position**. English 1883 adds an
  `O Lord, hear my prayer` pair after the collects that belongs
  in the 1962 Rogations donor *earlier*, before `Oremus`.
  Do not duplicate or move that V/R to the end.

### Known Litany edition differences requiring special handling

**Do not automatically adopt either 19th-century Litany for the 1962
112-invocation procession.** The 1883 English and 1862 French texts
differ from the original Latin source. Specific investigations are
recorded for:

- `ROG-R03-10`: Saint Joseph present in the 1883 English and
  1961 chant photograph, absent in the 1862 French edition.
- `ROG-R03-74`, `ROG-R03-75`: earthquake and
  plague/famine/war petitions in the donor but **absent from both**
  19th-century historical transcriptions.
- `ROG-R03-81`: French prose omits the Cross/Passion petition
  although its **1862 Latin** side includes it.
- `ROG-R03-96`: return those in error to Church unity / bring
  unbelievers to the Gospel is absent in the 1883/1862 witnesses.
- `ROG-R03-15` and `ROG-R03-18`: two apostles named Saint James
  share the same Latin text but retain distinct source and
  ceremony-order identities.

### Release / translation-gap decision

**Zero new EN/FR translations have been written in this audit.**
The number of **genuinely missing translations is still UNKNOWN**,
not 150 or 101 or three. A finished gap count requires:
(i) correct 1962 Latin and ritual-performance certification;
(ii) edition/print-page and rights collation of 1883/1862 witnesses;
(iii) *ordered* verse/invocation alignment for all 112 Litany rows;
(iv) one targeted Psalter/chant-source lookup for the opening;
(v) selected EN/FR **effective existing canonical owner wording**
and resolved historical variants; and only then
(vi) a row-by-row list of 1962 prayers genuinely without a
qualified existing English/French counterpart.

No new text was copied, no 48-card Mass LIVE/reader graph replaced,
no doubled Litany, and no independent translation of the Rogation
Mass Proper introduced. Draft PR #1441 remains a review environment
until the editorial and acceptance gates pass.

## 11. All 112 Litany invocations aligned by historical line (19 October)

The previous review category **101 Litany rows with only a family-level
historical witness** has now been resolved into **112 original row-ID to
historical line-position records**. This is alignment work, not a
translation pass: no English or French prayer bodies were imported.
The resulting source-only record is
`data/mass/rogation-112-invocations-historical-en-fr-crosswalk.v1.json`;
`tests/rogation-112-invocation-historical-parity.mjs` gates the exact
native source IDs, witness line positions and variant/disposition checks.
It is included in focused Missal CI.

| Historical counterpart for native 112 Litany invocations | All 112 | Subset of 101 without exact Ordinary/PRAY Latin owner |
| --- | ---: | ---: |
| Historical **1883 English + 1862 French** by order/subject | **107** | **96** |
| **1883 English only** | **2** | **2** |
| In **neither** of those historical translations | **3** | **3** |
| **Total** | **112** | **101** |

The English-only entries are **`ROG-R03-10` Saint Joseph** (French
1862 Litany omits him) and **`ROG-R03-81` Cross/Passion** (the
French edition's Latin line has `Per crucem et passionem tuam` at
rendered line 847, but its French prose omits that entire line; the
editorial note itself records an omitted translation). English does
include both. The **three absent from both historical editions** are
`ROG-R03-74` earthquake scourge, `ROG-R03-75` plague/famine/war,
and `ROG-R03-96` Church unity and Gospel enlightenment. These
do **not** become missing new translations merely because they are
absent from two 19th-century witnesses; search complete 1962-rite
bilingual Missal/Ritual witnesses first.

Also verified and retained: `ROG-R03-15` and `ROG-R03-18` remain
distinct Saint James source identities even though they share the
Latin invocation; historical English has Saint James at distinct
rendered lines 161 and 167 and French at 908 and 911. The 1883 English
St Simon/Thaddeus invocations share one physical rendered line,
but source row IDs are **not** merged. The 1862 French transcription
has suspect `Saint Jean, riez pour nous` (at historical St John),
and the benefactors petition also has spelling defects;
none is silently corrected in canonical source text.

**Consolidated ledger update.** The older **37 exact + 46 historically
located outside the Litany + 101 historical Litany family only +
3 source-specific opening** classification is now superseded by:

| Publication-review evidence tier | Original Latin rows |
| --- | ---: |
| Exact Ordinary or PRAY **Latin candidate** | **37** |
| Historical EN/FR segments elsewhere in Rogations (not exact corpus) | **46** |
| Previously unmatched Litany with historical EN/FR both mapped | **96** |
| Previously unmatched Litany with 1883 EN only | **2** |
| Previously unmatched Litany absent from both 19th-century editions | **3** |
| Opening processional antiphon / Psalm fragment source search | **3** |
| **Total (distinct original Latin rows)** | **187** |

**None of the 187 Latin rows has been newly certified as a published
1962 bilingual translation by this audit.** The 150 rows without
exact Ordinary/PRAY ownership remain 150 in the source index; a
historical line alignment must never be subtracted as if it were
a canonical approved EN/FR owner. The 96 Litany rows in the 101-row non-exact subset
were individually aligned to **both** 1883 English and 1862 French
historical passages; the 2 English-only and 3 neither-witness
cases remain explicit. The 46 historically located non-Litany
rows have differing local EN/FR completeness and abbreviations
and must **not** all be counted as complete bilingual parallels.
Do not conflate source presence and approval; see each row's flags.

The remaining bottleneck is now **targeted edition collation and
approval** rather than indefinite translation discovery:
first seek correct 1962-rite English/French originals for the five
Litany exceptions; then collate the 107 shared historical pairs
in complete source order, resolve rights and transcription variants,
and select the effective approved wording per existing owner.
The 1962 general rubric's non-doubling rule and six native
ceremony stages remain unchanged.


## 12. More relevant full-rite witnesses found — source discovery effectively complete, publication not certified

A targeted search for the five nineteenth-century Litany omissions
identified two **later, much closer-to-rite source candidates**.

**Latin–French processional witness:** [Saint-Clément Ottawa,
*Litanies majeures — La procession et la Messe*,
hosted 2020](https://stclement-ottawa.org/wp-content/uploads/2020/04/Litanie-majeure-Procession-et-Messe.pdf),
eight-page bilingual booklet, visually checked at PDF pages 1, 3
and 4, and text-checked across the entire Latin/French Litany.
It explicitly includes the missing Saint Joseph
(`ROG-R03-10`), earthquake (`ROG-R03-74`),
pestilence/famine/war (`ROG-R03-75`), Cross/Passion
(`ROG-R03-81`) and errant/unbelievers petition
(`ROG-R03-96`) **in matching Latin/French columns**.
All **112 original Litany invocation subjects and response formulas**
have French parallel candidates, compared to 107
visible in the older Corneille French prose. The booklet additionally
prints the opening `Exsurge Domine` antiphon and Psalm 43(44) incipit,
the silent `Pater noster`, Psalm 69, 24 suffrages,
`Oremus`, ten orations and their final responses. Its opening
`Gloria Patri` is abbreviated but an entire Gloria appears
later and the existing PRAY trilingual prayer is an exact Latin match.

**English Ritual witness:** [Philip T. Weller,
*The Roman Ritual*, complete edition (1964),
EWTN Part I](https://www.ewtn.com/catholicism/library/roman-ritual-part-i-11882)
and [Part II, procession on Saint Mark and the Rogation
days](https://www.ewtn.com/catholicism/library/roman-ritual-part-2-11883).
Part I, rendered lines 5146–5326, contains the **full Litany,
all 112 subjects including the three absent from 1883 English,
the Pater noster, Psalm 69, suffrages and all ten orations
plus conclusions**. Part II, lines 3748–3761, supplies English
for the **repeated `Exsurge` and the original `Deus auribus`
Psalm fragment**. The Weller edition says it uses the **1952
`Rituale Romanum` editio typica with subsequent adjustments**;
it is not automatically a 1962 Missal imprimatur for every ritual
boundary. It retains older conditional invocation-repetition
instructions that **must not override 1962 General Rubrics §82**.

| Stage | More complete existing EN source | More complete FR source |
| --- | --- | --- |
| ROG-R01 · antiphon, fragment, doxology | Weller 1964, Part II 3748–3761 | Ottawa PDF p. 1; complete Gloria candidate from PRAY |
| ROG-R02 · cantors' opening | Weller Part I 5146–5178 | Ottawa PDF p. 1; role/response comparison against Corneille required |
| ROG-R03 · 112 invocations | Weller Part I 5179–5223 | Ottawa PDF pp. 1–5 |
| ROG-R04 · silent Pater, Psalm, suffrages | Weller Part I 5223–5295 | Ottawa PDF pp. 5–6 |
| ROG-R05 · ten prayers, dialogue, ending | Weller Part I 5298–5326 | Ottawa PDF pp. 6–7 |

**Source-only owner matrix now includes a locator for each of 112
Litany rows** in these later editions, alongside the old EN/FR
historical positions. The 187-row aggregate also records
later-source coverage by stage, including the previously
outstanding **two distinct processional-opening Latin passages**.
This is a *source discovery milestone*: we have located
an English and French candidate for **every Litany invocation**
and the entire rite's text families. It is **not evidence of 187
independently 1962-certified bilingual texts**.

**Critical licensing limit:** Weller's text explicitly carries
**copyright © 1964 Philip T. Weller**. The Ottawa booklet's
French translation has **no software reproduction licence
established** in this audit. Neither may be copied wholesale into
Ad Orientem merely because it is accessible on the web. Only
bibliographic source locators and coverage/variant metadata were
committed; **zero licensed/approved bilingual strings promoted**.
The prior 187/22/15/150 exact Latin ownership count is unchanged.
The genuine translation-*composition* backlog may be much smaller
than previously assumed, but its release-certified value remains
unknown until edition/source collation, permission and editorial choice.
