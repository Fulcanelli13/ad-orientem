# Mass reader — speaker, paragraph and prayer-card recovery (11 October 2026)

**CURRENT REVIEW BASELINE:** **65 curated Ordinary Sung LIVE cards**, replacing and retiring the earlier **116-block experimental projection**. The production 48-card reader is unchanged, and the curated review remains opt-in. See [65-card grouping](#curated-65-card-live-projection--current) below. Earlier notes on the 116 exploration are retained as superseded research history, not current implementation.

## Field report / scope
The in-Mass pilot revealed that 48 LIVE cards are insufficient, speaking roles are often unclear (especially separate **Amen** responses), and Gloria/Credo segmentation blurs the celebrant's intonation, sung continuation and individual gesture-bearing phrases.

**Priority:** correct text segmentation and speaking-role ownership. Do not redesign Guided, Missal, rails, cinematics or the interface in this batch.

## Sourced exact-cue corrections staged
- Sung donor `AO.SM.C0020`: unlabelled `Amen.` after `Misereatur tui` -> **S. Amen.** (priest).
- Sung donor `AO.SM.C0025`: unlabelled `Amen.` after `Misereatur vestri` -> **M. Amen.** (minister(s)).
- Sung donor `AO.SM.C0027`: unlabelled `Amen.` after `Indulgentiam` -> **M. Amen.** (minister(s)).
- Proper Collect response `AO.SM.C0074` and Postcommunion response `AO.SM.C0255`: the source response events had no printed text in their Proper blocks. Restore one explicit **℟. Amen.** after the resolved prayers by their canonical cue IDs; do not invent per-commemoration responses until each separate conclusion is sourced.
- Gloria `AO.SM.C0053 + C0054`: the complete **Gloria in excelsis Deo** belongs to the priest's intonation. The Schola should start at `C0055 Et in terra pax`, not `C0054 Deo`.
- Credo `AO.SM.C0089 + C0090`: **Credo in unum Deum** belongs to the priest's intonation. The Schola should start at `C0091 Patrem omnipotentem`, not `C0090 in unum Deum`.
- Remaining source clock values are preserved. In particular, a private priestly `Amen` is **not** automatically a congregational response; a `USER_RESPONSE` cue means the response is available to participating faithful, not that every parish necessarily sings it.

**Witnesses:** the repo's 1962 Low Mass donor preserves the labels for C0020/25/27; compare [Ordinarium missæ (1962)](https://la.wikisource.org/wiki/Ordinarium_miss%C3%A6_%281962%29) and [1962 Ritus description](https://1962ordo.today/1962-rubrics/). For the sung intonations see [Psallite Sapienter, §§43–45, chant guide to the 1962 Missal](https://media.churchmusicassociation.org/books/7848318-Psallite-Sapienter-A-Musicians-Guide-to-the-Extraordinary-Form.pdf) and [Catholic Encyclopedia: Music of the Mass](https://www.newadvent.org/cathen/10001a.htm).

These are presentation corrections at stable cue IDs; raw donor hashes, the 1962 text, the 39-source / 48-product ownership contracts and all ceremonial event timestamps remain unchanged.

## Curated 65-card LIVE projection — current

`src/mass/reader-live-curated-cards.js` replaces the block-by-block 116-card explorer. It partitions the certified **39** source-first steps into **65 navigable cards** using explicit source-block or exact source-cue cut markers, never a generic "one block equals one card" rule.

| Ordinary moment | Cards | Intent |
| --- | ---: | --- |
| Foot of the Altar and Introit | 5 | Opening Psalm; celebrant Confiteor; servers Confiteor; ascent; Introit |
| Kyrie | 1 | All nine invocations remain together; not three swipes |
| Gloria | 3 | Full celebrant intonation; praise/petitions; doxology |
| Collect, Epistle, interlection chant | 3 | One each, retaining responses inside their corresponding prayer |
| Gospel | 2 | Preparation; proclamation |
| Homily | 1 | Pause/state |
| Credo | 4 | Full intonation; Father/Son; Incarnation/Passion; Spirit/Church |
| Offertory | 5 | Antiphon; offerings; humility/invocation; incensation; Lavabo/Trinity |
| Orate fratres + Secret | 2 | **Suscipiat** and priest Amen on the same card as invitation |
| Preface | 1 | Dialogue and prayer together |
| Sanctus + Benedictus | 2 | Distinct musical milestones |
| Canon (14 source cards + 2 subdivisions) | 16 | 14 certified source divisions plus distinct preparation/formula for Host and Chalice |
| Pater noster | 1 | Priest and final response together |
| Libera nos / Pax / Commingling | 3 | Meaningful action boundaries |
| Agnus Dei | 1 | All three invocations together |
| Prayers before priest Communion | 2 | Communion preparation and celebrant Domine non sum dignus |
| Priest Communion | 2 | Host and Precious Blood; no gratuitous extra Quid retribuam card |
| Faithful preparation | 2 | Optional local second Confiteor; Ecce Agnus Dei + response |
| Communion of faithful | 1 | Distribution |
| Ablutions and Communion antiphon | 2 | Distinct priest action and choir text |
| Postcommunion, dismissal | 2 | One for each; exact response retained |
| Placeat + blessing | 2 | Separate final prayer and blessing |
| Last Gospel | 2 | Prologue; Et Verbum caro factum est and conclusion |
| **Total** | **65** | **65 = 39 source moments + 26 justified subdivisions** |

Every underlying reader paragraph ID and original order is preserved exactly once. No synthetic ritual event ownership is introduced; `sourceAuthorityModel` retains it. Source Guide content is inherited and its provenance is explicit, with card-specific headings. The short `R.`/`M.` response remains on its prayer card unless there is a substantial ritual transition. No new Guided or Missal design is attempted.

Opt into the 65-card proposal in tests with `buildReaderModeModels({...,reviewExpandedCards:true})`. The flag is historically named but now returns **65**, not 116. Ordinary source form only: nuptial/special overlays and additional rites fall back to the original source model until separately certified. The actual default remains 48.

## Further required review (not certified by this PR)
1. Audit **every** speaker transition and every short `Amen` through all 96 blocks, 280 sung source units and dynamically supplied Propers. Assign explicit speaker vs minister(s), schola, responders, or unresolved; do not assert the faithful speak when the server answers.
2. Review intra-cue phrase segmentation where one corpus cue currently includes several sung sentences (e.g. `C0055`); do not duplicate canonical cue IDs to obtain a line break or invent event timestamps.
3. Inspect full Missal/Graduale paragraphing for chant verse structure and provide alternate schola/people participation information only where sources or local settings justify it.
4. Replace hardcoded Schola card-number mappings before switching from 48 to curated cards, and update Guide contextual inheritance and all cue navigation anchors.
5. Run 320/390/768px handset acceptance while following a real Sung Mass, verifying exact response labelling and no loss/duplication of text, cue triggers, transients, pause, or card return.
6. Reconcile existing [PR #999](https://github.com/Fulcanelli13/ad-orientem/pull/999) for parallel Missal without replacing its work.

## Tests
`npm run test:mass-speaking-roles` tests named dialogue roles and intonation, independently anchored Schola segments, full real-data card projection and preservation of all original paragraph IDs.

**Release status:** Draft research/implementation; do not merge into today's live Mass pilot until CI + real-device test and source review. The new review projection is deliberately gated and is not already deployed.

## Historical preceding source-wide batch — 11 October (116 review superseded)

- Added `data/mass/ordinary-sung-speaker-audit.v1.json` with **280/280** canonical sung cue records across all **96** blocks, each carrying source clock, text owner, evidence type, potential participation, branch status, and form conditionality. The eight effective role categories are **priest (151), responders (36), ministers (13), priest action (29), Schola (47), Gospel minister (2), dismissal minister (1), and editorial Guide (1)**. No fixed Ordinary cue remains role-unassigned. The count is an editorial coverage denominator, **not** proof that each liturgical participation variant is certified.
- Expanded preparatory speaker-initial reconstruction from the companion Low Mass witness (e.g. priest's and ministers' Confiteor, Misereatur and Indulgentiam) rather than merely the three original Amens.
- Restored the **Credo in unum Deum** celebrant intonation as one source-owned visual paragraph (`C0089+C0090`), analogous to Gloria's `C0053+C0054`. Schola remains independently attached to `C0091`.
- Added seven source-cue-targeted **presentation-only sentence breaks** for long Gloria/Credo lines in Latin, English, and French. All words, translations, cue IDs and gesture ownership are unchanged. Breaks do **not** claim universal choir/people antiphonal divisions.
- Previously enlarged the experimental projection to **116 cards** by dividing Psalm 42, closing preparatory versicles, Kyrie/Christe/Kyrie, Orate fratres/Suscipiat, Sanctus/Benedictus, both Consecrations, Libera nos, and the Last Gospel, as well as the existing Gloria and Credo stages.
- Added restrained bilingual LIVE-only speaker-turn labels where the original line does not already say S./M./V./R.; Missal presentation remains unaltered.
- `tests/reader-speaker-roles.mjs` now checks the full 280-cue registry against runtime speaker assignments; `tests/reader-chant-line-layout.mjs` checks Latin/EN/FR phrase preservation; `tests/reader-mode-switch.mjs` now asserts all 65 curated card paragraphs remain complete/in order and that crucial Host/Chalice/Last Gospel boundaries retain exact cues.

## Interpretation

For Sung Mass, `RESPONDERS` denotes the liturgical response owner but **does not** assert that every lay person sings each answer; minister/schola/congregational practice depends on Mass form and local usage. The Gospel and dismissal ministers are expressly form-conditional. The **second Confiteor** remains optional/local and must not be promoted to normative 1962 practice.

This batch is a robust text and presentation inventory. The historical 116-card exploration has been withdrawn; 65 is the current review number. Even 65 cards are not by themselves final UI acceptance: the existing Schola track-to-card number lookup, Guide inheritance, swipe behavior, cue focus, special-day form insertions, mobile screenshots, and individual concurrent sung/priest sequences still need to be certified before the curated projection can be set as the default.

## CI status (current cycle)

- **PASS** full 280-record speaking-role tests, Latin/EN/FR chant-layout tests, real-data curated 65-card expansion/paragraph conservation, existing 48-card regression, and Schola tests in the Mass job.
- The full R17 workflow remains **red** because the Sacred Geography profile test still assumes **38** previously empty shrine profiles where the current active corpus has more; this is not a reader regression.
- The 65-card projection remains **review-opt-in only** through `reviewExpandedCards:true` and is not deployed as the LIVE reader default.
