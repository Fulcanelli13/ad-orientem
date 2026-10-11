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
 
## Third implementation batch — source-aware Schola and opt-in 65-card phone acceptance

**Schola ownership:** `src/mass/reader-schola.js` now resolves each displayed card against its actual canonical `sourceCueIds` and Proper block IDs (`B014` Introit, `B021/B022` interlection chants, `B030` Offertory, `B085` Communion), instead of assuming visible card sequence 1–30. Numeric macro control is preserved only for unconverted callers/tests. The native runtime now sends the whole visible card, including its cue identity. Gloria/Credo priest intonations do **not** activate their Schola track prematurely when presented on their own; the tracks start at `Et in terra pax` / `Patrem omnipotentem`. The Sanctus/Benedictus track preserves its independent current segment through the silent Canon without rewinding on an adjacent card.

**Reader opt-in:** On the PR branch, add **`?aoLiveCards=65`** to the page URL to mount the curated Ordinary Sung LIVE review in the native app preview. Other modes, structural special rites, Masses with explicit preceding/following actions, and non-votive structural overlays keep the existing production presentation (48 Sung / 30 Low as applicable). The user-facing default remains unchanged. Existing Introit post-prelude handoff locates its `B014` block anywhere in the 65-card sequence, no longer presuming it is card 1. Switching to Missal and back preserves the opt-in review for eligible LIVE.

**Acceptance:** `tests/reader-schola-curated.mjs` uses real model data to assert Schola tracks for the 65-card projection, production 48, Low structural absence, Solemn form, and source-exact Gloria/Credo, Proper, Agnus, and silent Canon transitions. `tests/reader-native-preview.mjs` validates that the opt-in native mount selects 65 while Asperges/other structural material refuses 65. `tests/reader-phone-curated65.mjs` uses Playwright/Chromium to verify 320px EN, 390px EN/FR, and 768px EN, including script errors, chapter navigation, Schola, Guide and width overflow; screenshots are uploaded as a run artifact.

**CI result for commit `43c142aa`**: the dedicated `curated65-phone` job passed, uploading `curated65-mass-phone-screenshots` with four screenshots ([Actions run 38143814289](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38143814289)). Core 65-card tests, full 280-cue audit, native preview, and Schola passed within the broad Mass job. Full `npm test` continues to fail on the unrelated Sacred Geography hardcoded count assertion (216 current records vs expected 38); do not report overall R17 green. An independent test job runs even when that existing cross-module blocker fires, and the original production 48-phone browser suite is now included there for regression.

**Release still blocked:** This is not a merged default. The opt-in review is sufficient for layout/Schola field testing, not for certifying actual aural timing in every Mass form. Good Friday/Easter Vigil, Nuptial, processions, and other special structures are excluded from forced 65-card activation. A real service and source-backed form-specific acceptance remain necessary before enabling it universally.

## Fourth implementation batch — complete phone walk and visual corrections

- The `65` figure is the **source-backed curated card model**, including one explicitly marked `LOCAL_CUSTOM_PRE1960_SURVIVAL` second Confiteor. The usual 1962 LIVE swipe sequence shows **64/64** by default; the extra Confiteor and its two associated responses become visible only when `prepared.readerPreferences.secondConfiteor===true`. An explicit local/customary option restores the full **65/65** sequence without rewriting the source corpus. See [the 1960 New Rubrics exposition](https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf) on the omitted pre-Communion Confiteor and absolution. This is not a new mandatory ritual.
- The LIVE progress counter now follows **visible** stages, so omitting optional or special-event stages does not leave a spurious skip. `tests/reader-phone-curated65.mjs` walks the complete visible reader, verifies every navigable stage and the conditional Confiteor, and checks progress in English and French at the supported widths.
- Actual GitHub screenshots were downloaded and visually inspected. The earlier standalone phone fixture failed to attach the real icon bank; it rendered empty-looking icon containers, which did not accurately represent the production application. The fixture now uses the same **frozen production Mass v4.6 icon resolver** as `browser-entry.js`; the phone suite fails if no source-owned icon resolves.
- The first visual review also exposed weak inactive-text contrast. Only within `#ao-r17-native-reader-preview[data-r17-curated-review="true"]`, inactive LIVE prayer text opacity was raised to preserve readability while leaving focused cues more prominent. The production 48-card visual hierarchy is not restyled.
- The Schola dock initially overlapped the prayer scrolling viewport. The curated-only CSS reserves the dock height **and its safe-area offset** inside the actual scroll window; Playwright now asserts that the active dock does not obscure the text viewport. When Schola is praying the *same paragraph* as the reader, the independent duplicate dock is intentionally suppressed by existing one-state/one-surface ownership.
- On commit `421a2f58`, the **curated65-phone independent job passed** after complete source-to-screen verification at 320/390/768px EN and 390px FR, plus an explicit second-Confiteor scenario. The **full repository `npm test` job also passed**, including the 280 cue role tests and 48/65 model tests. The formerly separate shrine-count blocker is therefore no longer present on this head. [CI run 38145634662](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38145634662) records test and mobile screenshot results. The broad `phone-browser` job is a separate final check.
- Human field acceptance during real Mass, including Schola timing and exceptional Solemn or special-day rites, is **still not certified**. Remain draft/off by default. These improvements establish a trustworthy browser review candidate, not a liturgical-release approval.

## Batch 2 — six-registry liturgical transition audit (11 October)

The source-first 65-card review is now gated by a direct comparison against all six LIVE cue registries: **gestures, responses, postures, priest positions, priest voices, and priest actions**. The comparison runs within the existing `tests/reader-mode-switch.mjs` and does **not** change the source text or activate the opt-in reader by default.

- **261 distinct canonical source cues** are present in the projected card paragraphs, with exactly one owner for each and no duplicated cue/card assignments. Every cue rendered by the 39-card source authority is retained by the 65-card presentation.
- **28 registry references do not occur as rendered prayer paragraphs** in this selected Mass fixture. These are now explicitly recognized as non-rendered *source/rubric anchors* rather than manufactured prayer rows. Their provenance and applicability must be reviewed in the source-mapping pipeline; the test does not falsely claim all 279 execution cues are separately displayed.
- `Orate fratres` and the `Suscipiat` response stay on one card. Collect and Postcommunion responses are checked against their **dynamically resolved Proper slots**, not nonexistent static Proper text cue IDs.
- Consecration words and source-authorized elevations remain in the same presentation card, with the elevation *after* the words in source order for both Host and Chalice; no synthetic cross or premature elevation cue.
- The 1962 ordinary still displays **64 navigable cards** by default, with the source-audited optional second Confiteor making 65 only when requested.
- Latest applicable repository test at commit `07c156c7` passed this cross-registry gate. This is **automated source-order certification**, not field certification of musical tempo, celebrant actions, regional customs or actual congregation behavior. Those remain the release gate.


## Batch 2 source-only register — all 28 references classified

This audit distinguishes the **28 registry references** from their **15 unique canonical source cues**. Every referenced unit has null/blank Latin and English in the original sung workbook. **It would be incorrect to interpret those 28 references as 28 lost prayer paragraphs, and equally incorrect to invent a trigger merely because the associated Proper is displayed.**

Machine-readable authority: [reader-source-only-cues.js](../src/mass/reader-source-only-cues.js). It pins 15 IDs, original block, Proper slot, source execution sort and category; a six-registry test validates the 28 references, confirms all 15 are absent from rendered paragraph cue IDs, and refuses an unsourced auto-gesture/icon.

| Source cue | Sort | Original block / context | Registry channels | Classification / remaining activation |
|---|---:|---|---|---|
| C0042 | 42 | B014 Introit | Position, voice | Priest at Epistle missal; non-textual parallel priest state |
| C0043 | 43 | B014 Introit | Voice | Quiet priest recitation independent of Schola |
| C0276 | 69.1 | B016 Gloria | Position, voice | Conditional sedilia state while Schola continues |
| C0277 | 69.9 | B016 Gloria | Position, voice | Conditional return to altar |
| C0075 | 75 | B020 Epistle | Posture, voice, action | Sit / reading; requires form-specific minister attribution |
| C0077 | 77 | B021 Gradual | Position, voice | Asynchronous priest/Schola tracks; no competing public text |
| C0086 | 86 | B026 Gospel | Voice, action | Gospel proclamation; minister varies by Mass form |
| C0278 | 105.1 | B027 Credo | Position, voice | Conditional sedilia state while Schola continues |
| C0279 | 105.9 | B027 Credo | Position, voice | Conditional return to altar |
| C0109 | 109 | B030 Offertory | Posture, voice | Sitting/chant-to-private-prayer transition; parallel clocks |
| C0134 | 134 | B040 Secret | Voice | Quiet Secret prayer; resolved Proper ownership |
| C0144 | 144 | B045 Preface | Voice | Sung Preface; resolved Proper ownership |
| C0249 | 249 | B085 Communion | Position, voice | Quiet priest track alongside Communion antiphon |
| C0250 | 250 | B085 Communion | Voice, action | Turning to people; needs explicit priest-event timing |
| C0256 | 256 | B088 Postcommunion | Voice, action | Turning to people; needs explicit priest-event timing |

**Disposition:** 11 Proper-related source-only cues (20 registry references) and four conditional Gloria/Credo sedilia state cues (eight references). All are accounted for; none can be assigned an automatic prayer-word focus, gesture, voice change or priest position simply by projecting the 65-card text. The review model now carries their immutable sourceOnlyCueRegister for later priest-mode/event alignment, with automatedIconAllowed=false and runtimePolicy=REQUIRE_INDEPENDENT_SOURCE_EVENT_TRIGGER.

**Before enabling these events:** match each to its actual priest-side ceremonial event, retain explicit sung/solemn distinctions (particularly Epistle/Gospel proclaimers), and require the relevant posture/customary conditions for the Gloria/Credo sedilia states. Synchronization between independent Schola and priest clocks must be validated in a real service. These are **15 documented event-alignment tasks**, not 28 unaccounted text defects and not a reason to increase the ordinary LIVE card count.


## Priest-side event reconciliation — 10 / 15 event-identified

The independent priest-event bridge now identifies **10 of 15** original source-only cues against named canonical MC events; **five remain fail-closed**. These numbers denote *registered event bindings*, **not automated ceremony detection**. Real-time execution requires an independent priest observer; scrolling or the Schola's chant never triggers a movement.

Three additions to the previous seven bindings:

| Canonical cue | Exact MC event | Form/trigger | What may project |
|---|---|---|---|
| C0043 | MC-INT-020 | Independently observed priest's Introit recitation | Quiet priest voice and persistent physically sourced position from C0042, never from Schola's MC-INT-010 |
| C0075 | MC-EPI-020 | Only Missa Cantata **and** confirmed priest (rather than lector) **and** independently reported READ or SUNG delivery | Reads Epistle action; voice reflects observed spoken/sung delivery, no guessed position or faithful posture |
| C0249 | MC-END-010 | Independently observed priest's Communion antiphon **after ablutions** | Quiet recitation; **suppress** PRIEST_TRACK_ASYNC, which is a scheduling placeholder and not a location; no activation from Schola's MC-COM-305 |

The 1962 [*Ritus servandus* VI.8](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/) explicitly allows the Epistle to be sung by a minister; otherwise the celebrant may read it or sing it. See also [*Rubricae generales Missalis Romani*, 514](https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html). Accordingly, the generic MC-EPI-020 actor RESOLVED_READER **does not by itself certify a priest action**. The bridge requires separately observed celebrant identity and delivery. This is essential for the Low/Missa Cantata/Solemn distinction.

Five unresolved cases that must **not** be auto-mapped:

| Cue | Reason for retaining explicit pending status |
|---|---|
| C0042 | Physical transfer to the Epistle-side Missal lacks a separately identifiable canonical movement event; the valid position is inherited at the independently observed C0043 recitation, not fired during Schola's Introit |
| C0077 | Gradual is a Schola chant; the priest's asynchronous side activity is not synchronized to the Schola start or end |
| C0109 | Proper Offertory is Schola material; the celebrant's independent change into quiet Offertory prayers has no matching exact public canonical action |
| C0250 | Turning from Communion antiphon toward the congregation for Postcommunion greeting needs an explicit turning event; MC-END-020 only records returning to the centre, while MC-END-030 records a spoken greeting |
| C0256 | Turning after Postcommunion toward the final dismissal needs an explicit priest-turn event; the final Dominus vobiscum is not proof of the exact preceding turn |

Regression gates: repository `tests/reader-priest-event-alignment.mjs` pins **10 event-identified and five pending** cues, denies unresolved lector/celebrant actors and unobserved movement; Chromium `tests/reader-phone-curated65.mjs` exercises the true priest Introit, Epistle and Communion tracks, Schola independence and correct source-only position suppression. No new prayer card or source text was created, and production 48 remains the default. The unresolved five require a new independently certified MC action/movement event or human input, not another textual cue grouping.
