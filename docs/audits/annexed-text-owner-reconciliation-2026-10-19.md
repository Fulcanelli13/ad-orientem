# Mass annex text ownership — reconciliation before any further translations

**19 October 2026 · PR #1441 · audit / not a release certificate**

## Decision

**STOP authoring translations for annexes until existing liturgical owners have been reconciled.**
The previous work conflated "no `english` / `french` property on a particular annex reader row"
with "no translation exists in Ad Orientem". These are not equivalent.
None of the new editorial translations in this draft PR is automatically approved for
canonical adoption. This reconciliation is an **index of sources, not another text corpus**.

The source-to-reader policy already exists at
`data/mass/source-reconciliation-gates.v1.json`. This audit follows it and
does not replace the existing source of truth.

## Existing text owners, with separation of concerns

| Owner | Actual scope | Release / reuse rule |
| --- | --- | --- |
| `data/presentation/reader-text-sung.v1.json` and `reader-text-low.v1.json` | Latin and English fixed Mass Ordinary with stable `AO.SM.C####` cue IDs | Preserve canonical cue identity and the approved canonical-text-corrections overlay. Do **not** create a second translation of identical short prayers |
| `data/presentation/reader-french-ordinary.v1.json` | French translation keyed to **256 Ordinary cues**, pinned to Divinum Officium | Reuse source-owned wording where Latin and speaker/context match; no copy into another authority |
| `docs/research/MASS-RED-MISSAL-ENGLISH-SEVEN-SOURCE-HOLDS-CLOSURE-20261019.md` and existing English correction registry | The independent English editorial collation of the fixed 1962 Ordo | **241/241 genuine Ordinary text cues adjudicated** (209 retained, 32 amended; remaining 15 non-text cues). Do not start another red-Missal collation |
| `data/mass/rogation-proper-trilingual.v1.json` | **Mass Proper** of the Greater/Minor Litanies, EN/FR reviewed, Latin checked against Vatican 1962 printed pp. 347–349 | The proper is already bilingual. It is **not** the separate pre-Mass/extra-Mass Rogation procession or Litany |
| `data/presentation/reader-{asperges,palm,ash,candlemas,rogations,requiem-absolution,corpus-christi,holy-thursday-post}.v1.json` | Annexed-rite original Latin and ceremony-specific stages | The original Latin and 1962/ceremonial event IDs remain with each original owner; do not transplant Mass Ordinary speaker/cue timing |
| `src/mass/reader-eucharistic-hymn-text.js` **(draft PR only)** | Existing single provisional editorial EN/FR hymn reused for Corpus Christi and Holy Thursday | Shared Latin is demonstrably the same hymn; any acceptance must reference one approved stanza owner, not create two translations |
| `src/mass/reader-requiem-text.js` and `reader-holy-thursday-psalm.js` **(draft PR only)** | Provisional editorial translations newly composed on this branch | **HOLD FOR COLLATION** against existing translations, Scripture witnesses and wording policy. Passing a fingerprint or mobile test is not an editorial approval |
| `data/scripture/witness/*` and the canonical Scripture-source modules | Scripture languages and alternate editions | Candidate verse-level reuse only after confirming **book, chapter, Latin recension/psalter and exact segment boundaries**; not interchangeable with Pian Psalter by superficial wording |

## Direct, independently observed duplicate Latin passages

These are **exact normalized Latin** matches, not merely similar themes.
The read-only reconciler prints **every** source location and matching cue.

| Rite sources found with repeated text | Canonical Ordinary cue | Required decision |
| --- | --- | --- |
| Asperges: `Ostende nobis`, `Et salutare tuum`, `Domine exaudi`, `Et clamor`, `Dominus vobiscum`, `Et cum spiritu tuo` | C0030–C0035 | Reuse the already reviewed EN/FR where the same formula is actually pronounced. Do not import the Foot-of-Altar gesture or stage |
| Palm, Ash, Candlemas: `Dominus vobiscum`, `Et cum spiritu tuo`, `Oremus` (as present) | C0034–C0036 | Shared translation candidate; ceremony timing and speaker local to that rite |
| Requiem: repeated `Kyrie/Christe`, `Domine exaudi`, `Et clamor`, `Dominus vobiscum`, `Et cum spiritu tuo`, `Amen` | C0044/C0047, C0032–C0035, C0020 | The new draft has some wording differences from the canonical English/French. Review **once**; the owner is not the newly written Requiem file |
| Rogation procession: repeated Kyrie, `Agnus Dei`, `Domine exaudi`, `Et clamor`, and several responses | C0044/C0047, C0222, C0032–C0033 etc. | Large single Litany should be mapped against the existing Litany/prayer and cue owners before declaring a translation gap |
| Corpus Christi Benediction: `Oremus` | C0036 | An existing Ordinary formula, not a novel translation task |
| Corpus Christi and Holy Thursday: all six `Pange lingua` / `Tantum ergo` stanzas | Shared hymn owner; not ordinary cues | Already **one** provisional translation registry in the draft PR. Collate once, then reference this owner from both rite controllers |
| Palm and Candlemas: `Procedamus in pace` | Shared annex formula, separate processions | Reuse content only; never combine the procession graph or participation/action state |

**Example of why this matters:** the Requiem draft uses a modern English
"And with your spirit" while the reviewed Ordinary corpus supplies
"And with thy spirit" for the identical Latin `Et cum spíritu tuo`.
Likewise, some French formulations differ slightly. These are
**wording-owner collisions**, not evidence that another translation is needed.

The Ordinary English itself has an effective pre-reader correction
layer: before selecting a reusable translation, resolve the **effective
approved text**, not merely the frozen LOW or SUNG donor's original English.

## Scope distinctions the automated comparison must preserve

- **No exact Ordinary match does not mean missing translation.** It means
  only that one source family did not contain the exact normalized Latin.
- **Same Latin does not transfer actions.** E.g. `Gloria tibi` and
  Gospel-cross cues depend on liturgical context, not shared typography.
- **Rogation procession ≠ Rogation Mass Proper.** The printed, published
  three-language Mass Proper cannot be miscounted as a translated
  112-invocation procession litany.
- **Holy Thursday Psalm 21** uses a **Pian Psalter** Latin witness; do
  not claim a Vulgate, Crampon or Douay verse is the same reading without
  chapter/verse and recension comparison. Clerics present/absent controls
  how much is prayed, independently of having the whole source text.
- The user's 2013 Red Missal English witness has already undergone
  an independent source-specific review in another PR. It must not be
  rediscovered or copied in this annex pipeline.
- Provisional text passed the browser tests, but that only certifies
  **rendering and alignment**, not final editorial text provenance.

## Source-preserving machine audit

Run `node tools/mass/reconcile-annexed-text-owners.mjs --write`
to generate `artifacts/annexed-text-owner-reconciliation.json`
from the repository's **existing** 1962 data. It writes no translations.
The report contains eight rite scopes, Latin source paths, matching
Ordinary cue IDs, repeated Latin across different rites, and unmatched
Latin with **no fabricated missing-translation count**.

The CI guard `tests/annexed-text-owner-reconciliation.mjs` checks
Asperges, Palm, Ash, Candlemas, Rogations, Requiem and Corpus Ordinary
text-reuse candidates, the shared Eucharistic hymn, the separate
Rogation Mass Proper, and explicit rejection of false gap estimates.

**First completed source-only count from the running regression:** 319
annex source leaves were examined; 60 matched the normalized Latin of an
existing Ordinary cue (17 distinct Latin formulas); 20 groups of
identical Latin span more than one annex. The other **259 are NOT
declared untranslated**. All counts are from the audit's current
explicit eight-rite scope, not a worldwide source-completeness claim.

To inspect actual English/French wording ownership, the second
read-only command

`node tools/mass/reconcile-annexed-translation-collisions.mjs --write`

generates `artifacts/annexed-draft-translation-collisions.json`.
It compares currently rendered draft annex text rows against frozen
SUNG English and pinned 256-cue French Ordinary. It reports exact
source cue references, identical wording, missing draft vernacular
where the canonical Ordinary already has it, and *editorial wording
collisions*, with **no copied liturgical passages**. The frozen
English comparison is a first collision detector; final selection must
apply the approved **effective English correction layer** and review
speaker/role before a canonical link is approved.

`tests/annexed-draft-translation-collisions.mjs` is also gated in CI,
including the Requiem draft `Et cum spiritu tuo` English inconsistency.
No such flag licenses automatic replacement of any text, gesture or
ceremony stage.

This index remains **derived**. The existing source and cue owners,
not the generated comparison report, remain canonical.

## Priority order after this reconciliation

1. **Exact source-to-cue ownership map** of every current annex row:
   reuse / collision requiring one editorial choice / unique genuine
   annex text / conditional or variant source.
2. **Effective wording collation** against existing Ordinary, existing
   Scripture/prayer library and existing Rogation Proper, not source-file
   `english` flags. Do not translate anything during this step.
3. **Remove duplicate wording owners** only after recorded editorial
   decisions. Point the two ritual presentations to the same text ID
   while leaving each ceremony's events, posture and participation
   separate. Prefer the approved registry, not whichever new copy
   happens to have a complete-looking language column.
4. **Only genuinely absent** text, established after full source search,
   may enter a new translation queue; each entry must identify the
   Latin witness, textual scope, prior search results, translation
   authority, required editorial review and release permission.
5. **Reader acceptance** is a separate gate: exact Mass/annex event
   order, 48-card LIVE invariance, mobile focus, season, page turns,
   gestures, clergy/lay participation, Schola and post-Mass handoffs.

**Release status:** PR #1441 remains draft and unmerged. The latest
source-specific translation additions are not promoted to the
canonical Ultra Master by passing CI.

## Second-pass audit: PRAY prayer owners, historical Litanies and Scripture editions

The follow-up owner search **does not translate anything**. It reads
`src/pray/canonical-data.js`, the actual trilingual PRAY corpus, and
compares normalized **complete Latin source lines** against the 259
annex source leaves that did not match the fixed Ordinary. The script
`tools/mass/reconcile-annexed-secondary-owners.mjs --write` produces
`artifacts/annexed-second-pass-existing-owners.json` and records
stable prayer IDs and source locations, **not another duplicate copy of
Latin or vernacular text**.

The 48 PRAY prayers have potentially reusable Latin, English and French
prayer material, but
`data/pray/prayer-source-certification-inventory.v3.json` explicitly
reports **0 fully source-certified prayer records**. An exact Latin
line match—such as the Rogation litany's `Sancta Maria, ora pro nobis`
against the already-owned Litany of Loreto—therefore establishes a
**candidate**, not approval to substitute Marian litany content for
the 1962 Litany of the Saints.

The standalone `src/pray/litany-source.js` points to **1883 English**
and **1862 French** independent historical editions, neither certified
against the 1962 ritual. **The PRAY reader's intentional `extractLitanyProper`
boundary stops before the appended `Pater noster`/Psalm 69/orations;
the source editions DO NOT stop there.** Both complete web transcriptions
include the appendix through Psalm 69, suffrages and all **ten concluding
collects** (1883 English prose; 1862 French prose, with an independent
poetic Psalm rendering). These are significant existing **vernacular
witness candidates**, not automatic approved 1962 translations.
See `data/mass/rogation-historical-language-witnesses.v1.json`.
Earlier assertions that the underlying sources lacked the appendix
must not be carried into translation-gap estimates.

The Scripture candidate audit names the actual restored witnesses:
Douay–Rheims Challoner (English), Crampon 1923 (French) and CPDV 2009
(English). All are expressly `UNCOLLATED_SOURCE_WITNESS` in
`data/scripture/witness/README.md`, with no matching certified Latin
source in those witness packs. It flags the **Pian Psalter Psalm 21**
on Holy Thursday, **Psalm 69** in Rogations, **Luke 2 Nunc dimittis**
in Candlemas, and other selected psalm incipits for edition/numbering
and segment-boundary comparison—not wholesale Scripture reuse.

**Release rule:** the audit never assigns `MISSING_TRANSLATION`
on failure to match. Its residual count remains a **worklist of
unverified owners**, and its Scripture candidates remain **reference
hypotheses** until original Latin recension, verse mapping, full prayer
extent and published translation permissions have been reconciled.
The source-only `tests/annexed-secondary-existing-owners.mjs` is in
the focused PR gate.

No new translations, new rite actions, gesture cues, or Mass reader
card replacements are authorized by this pass.

## Rogations high-volume source pass — 186/186 stable row owners

A dedicated read-only [Rogations audit](./rogations-litany-1962-ownership-2026-10-19.md)
now resolves **every one of 186 original Latin source rows** to its
existing native reader paragraph ID and owner index, including the 112
processional Litany invocations, 18 kneeling-cantor opening responses,
Psalm 69, 24 suffrage rows, all 10 concluding orations and the final
responses. None of these indexes creates additional text or certifies
that existing English/French is correct.

The source split is 63 saint invocations, 2 `Propitius esto`,
21 deliverances, 18 `Te rogamus`, 3 `Agnus Dei` and 5 concluding
invocations. Two identical `Sancte Jacobe` Latin strings are distinct
source positions for the two apostles, **not a duplicate to delete**.

**Important 1962 witness conflict:** a photographed [Liber Usualis
Rogation extract, pp. 835–836](https://icksp.org.uk/newbrighton/wp-content/uploads/sites/2/2020/04/Rogations.pdf)
prints an older instruction to double invocations, whereas **1962
Rubricae generales §82** explicitly states `quae tamen non duplicantur`.
The **1962 rubric controls**. The chant book is still useful for
Gregorian chant order and the instruction to rise at `Sancta Maria`,
not for adding a doubled processional Litany.

Execute `node tools/mass/reconcile-rogation-litany-1962.mjs --write`
for its derived, source-only owner report. Its regression gate
`tests/rogations-litany-112-source-owners.mjs` checks exact
reader/source Latin alignment, ID/card ownership and the non-doubling
rule, not translation release.

## 19 October — source-certified-ritual correction candidates applied in draft

After the initial **319 annex leaves / 60 Ordinary exact matches** and
**186 Rogations rows / 21 Ordinary matches** audit baseline, examination of
the photographed 1961 Solesmes *Liber Usualis* (printed pp. 839–840)
identified three high-confidence omissions/variants. A separate
1962-rite Psalter compilation corroborates the papal collect. Three
**provisional source-level corrections are now implemented in PR #1441**:

1. Restore the previously absent independent `Oremus.` at
   `postLitany.oremus`, after the last suffrage and before the ten orations.
   The presentation ID `ROG-R05-OR` retains `ROG-END-010` ceremony ownership
   and references the existing Ordinary wording candidate `AO.SM.C0036`;
   no second translation may be made of the formula.
2. Mark the existing `ROG-R04-PN` (and only this row) as `voice: SILENT`
   with a clear guide. The original source incipit is unchanged.
3. Correct the fifth Rogation collect's papal petition from
   `Pontifici N.` to `Pontifici nostro N.`, as in the photographed chant
   and an independent 1962-rite compilation; the full authoritative
   1962 edition's word-by-word collation remains required for release.

**New reproducible totals:** 320 annex leaves; 61 Ordinary Latin matches,
17 further PRAY Latin matches, **242 still not exactly matched**. Within
Rogations: 187 source rows = 22 exact Ordinary + 15 additional PRAY +
150 still requiring fuller collation. The 112 processional Litany
invocations remain unchanged. No EN/FR was composed, and no release claim
follows from this repair. The printed discrepancy registry and updated
reader/source tests are in this same PR.

## Further source discovery: ten Rogations concluding collects already exist in EN/FR historical witnesses

The original English 1883 and French Corneille 1862 **web source pages**
contain translations beyond the deliberately bounded PRAY Litany proper:
Psalm LXIX, suffrages, ten complete concluding collects and final prayers.
The Latin and French 1862 section prints ten original Latin collects first,
then the corresponding ten French prose readings; the 1883 English section
prints ten consecutive English prayers. This is not a newly authored
translation. Edition variants, transcription anomalies, 1962 rite differences
and reuse permissions remain review holds. The historic page content is
**not imported, copied into the reader or counted as an approved translation**.

These witnesses now have a machine-readable provenance/scope registry and
regression gate in PR #1441. The pre-existing eight-annex exact-match count
**320 / 61 Ordinary / 17 PRAY / 242 further owner review** is unchanged:
discovering a historical translation does not prove the source matches the
1962 edition or authorize its reuse. The ten Rogation collects specifically
should not enter any new-translation queue without completing this direct
EN/FR collation.
