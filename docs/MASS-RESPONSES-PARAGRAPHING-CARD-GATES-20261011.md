# Mass reader — speaker, paragraph and prayer-card recovery (11 October 2026)

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

## Expanded cards: review only, not production
`src/mass/reader-live-expanded-cards.js` creates a non-destructive candidate presentation from the existing 39-card source-first ordinary model:
1. Group each visible card at the existing canonical **block boundary** (`AO.SM.B001–B096`), keeping absent/optional state metadata with adjacent material.
2. Subdivide the long single-block Gloria into **5** liturgical thought groups and Credo into **6** groups, preserving `AO.SM.C....` cue identity and sequential paragraph order.
3. Preserve source ownership on `sourceAuthorityModel`; split review cards have no synthetic `eventIds` and do not claim canonical event control.
4. Do not touch the 48-card default. Activate review projection only by passing `reviewExpandedCards:true` to `buildReaderModeModels`; no user-facing switch has been introduced.

The proposed boundaries are **candidates**. They require editorial confirmation against complete phrase lengths, text line wrapping, gesture anchors, concurrent priest and Schola activity, Low/Solemn variants, rubrics, navigation, focus tracking and phone geometry before activation. In particular, the priest and Schola can occupy different liturgical moments concurrently. Schola's independent clock must remain independent of card scrolling.

## Further required review (not certified by this PR)
1. Audit **every** speaker transition and every short `Amen` through all 96 blocks, 280 sung source units and dynamically supplied Propers. Assign explicit speaker vs minister(s), schola, responders, or unresolved; do not assert the faithful speak when the server answers.
2. Review intra-cue phrase segmentation where one corpus cue currently includes several sung sentences (e.g. `C0055`); do not duplicate canonical cue IDs to obtain a line break or invent event timestamps.
3. Inspect full Missal/Graduale paragraphing for chant verse structure and provide alternate schola/people participation information only where sources or local settings justify it.
4. Replace hardcoded Schola card-number mappings before switching from 48 to expanded cards, and update Guide contextual inheritance and all cue navigation anchors.
5. Run 320/390/768px handset acceptance while following a real Sung Mass, verifying exact response labelling and no loss/duplication of text, cue triggers, transients, pause, or card return.
6. Reconcile existing [PR #999](https://github.com/Fulcanelli13/ad-orientem/pull/999) for parallel Missal without replacing its work.

## Tests
`npm run test:mass-speaking-roles` tests named dialogue roles and intonation, independently anchored Schola segments, full real-data card projection and preservation of all original paragraph IDs.

**Release status:** Draft research/implementation; do not merge into today's live Mass pilot until CI + real-device test and source review. The new review projection is deliberately gated and is not already deployed.

## Second source-wide batch — 11 October

- Added `data/mass/ordinary-sung-speaker-audit.v1.json` with **280/280** canonical sung cue records across all **96** blocks, each carrying source clock, text owner, evidence type, potential participation, branch status, and form conditionality. The eight effective role categories are **priest (151), responders (36), ministers (13), priest action (29), Schola (47), Gospel minister (2), dismissal minister (1), and editorial Guide (1)**. No fixed Ordinary cue remains role-unassigned. The count is an editorial coverage denominator, **not** proof that each liturgical participation variant is certified.
- Expanded preparatory speaker-initial reconstruction from the companion Low Mass witness (e.g. priest's and ministers' Confiteor, Misereatur and Indulgentiam) rather than merely the three original Amens.
- Restored the **Credo in unum Deum** celebrant intonation as one source-owned visual paragraph (`C0089+C0090`), analogous to Gloria's `C0053+C0054`. Schola remains independently attached to `C0091`.
- Added seven source-cue-targeted **presentation-only sentence breaks** for long Gloria/Credo lines in Latin, English, and French. All words, translations, cue IDs and gesture ownership are unchanged. Breaks do **not** claim universal choir/people antiphonal divisions.
- Enlarged the review projection to **116 cards** by dividing Psalm 42, closing preparatory versicles, Kyrie/Christe/Kyrie, Orate fratres/Suscipiat, Sanctus/Benedictus, both Consecrations, Libera nos, and the Last Gospel, as well as the existing Gloria and Credo stages.
- Added restrained bilingual LIVE-only speaker-turn labels where the original line does not already say S./M./V./R.; Missal presentation remains unaltered.
- `tests/reader-speaker-roles.mjs` now checks the full 280-cue registry against runtime speaker assignments; `tests/reader-chant-line-layout.mjs` checks Latin/EN/FR phrase preservation; `tests/reader-mode-switch.mjs` asserts all 116 card paragraphs remain complete/in order and that crucial Host/Chalice/Last Gospel boundaries retain exact cues.

## Interpretation

For Sung Mass, `RESPONDERS` denotes the liturgical response owner but **does not** assert that every lay person sings each answer; minister/schola/congregational practice depends on Mass form and local usage. The Gospel and dismissal ministers are expressly form-conditional. The **second Confiteor** remains optional/local and must not be promoted to normative 1962 practice.

This batch is a robust text and presentation inventory. A count of 116 cards is not by itself the final UI acceptance: the existing Schola track-to-card number lookup, Guide inheritance, swipe behavior, cue focus, special-day form insertions, mobile screenshots, and individual concurrent sung/priest sequences still need to be certified before the expanded projection can be set as the default.

## CI status (current cycle)

- **PASS** full 280-record speaking-role tests, Latin/EN/FR chant-layout tests, real-data 116-card expansion/paragraph conservation, existing 48-card regression, and Schola tests in the Mass job.
- The full R17 workflow remains **red** because the Sacred Geography profile test still assumes **38** previously empty shrine profiles where the current active corpus has more; this is not a reader regression.
- The fine-card projection remains **review-opt-in only** through `reviewExpandedCards:true` and is not deployed as the LIVE reader default.
