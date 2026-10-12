# Mass LIVE — Batch 4 final acceptance campaign (12 October 2026)

**Assessment scope:** the native 1962 Mass reader. This document distinguishes code-level and rendered browser checks from historical-source certification, a complete liturgical celebration rehearsal and actual mobile hardware acceptance.

## Confirmed repository baselines before Batch 4

- Native R17 is the production Mass reader; LEGACY is not a supported production fallback.
- **Sung LIVE has 48 presentation cards** over its 39-card source model. **Low LIVE intentionally remains 39 source cards** (the 48-card decomposition is explicitly Sung-only in `reader-live-product48.js`). Acceptance must guard this distinction, not expand Low implicitly.
- Low, Missa Cantata Simple, Missa Cantata with incense and Solemn use the four-form registry. Sacred ministers must **never** be assigned to Low or Missa Cantata.
- Requiem omission of the blessing over the water is conditioned separately from the `Deus qui humanae` prayer.
- Schola's public clock does not automatically own celebrant actions at the Sanctus/Benedictus; a separately observed priest event is required.
- Faithful posture and priest position have single persistent visual owners in the top ribbon; active transient cues occupy the relevant left/right rail.
- Cue focus must remain source-owned, while phones allow a roughly 39% reading zone and preserve card-by-card vertical scroll.

## Acceptance gates

| Area | Automated evidence | Scope and limitation |
|---|---|---|
| Canonical form/special structure | `tests/mass-form-special-integration.mjs`, `tests/reader-form-state-parity.mjs` | All four form source registrations; DAY, VOTIVE, REQUIEM, NUPTIAL; native prelude and following-action graph projection. **Not** a real 2-hour Mass run |
| Actual rendered phone reader | `tests/mass-live-batch4-phone-matrix.mjs` | Four forms × two fixture families; 320/390px; sample Epistle, Offertory water, Host/Chalice elevation and paten handling; browser JS errors; 39-card Low / 48-card Sung presentation invariants; artifacts persisted |
| LIVE focus / icons / Schola | `tests/reader-phone-acceptance.mjs`, `tests/reader-live-rails-phone.mjs`, `tests/reader-priest-chant-phone.mjs` | Paragraph territory, rail visibility/accessible ownership, Schola/celebrant clock separation in mobile Chromium |
| Priest entrance / form exceptions | `tests/reader-priest-entrance-phone.mjs`, `tests/mass-form-ceremonial-batch2.mjs` | Optional pre-Mass observation, no repeated genuflection, Requiem water action omitted but prayer retained |
| Special liturgical structures | Existing Palm, Ash, Candlemas, Rogations, Requiem Absolution, Corpus Christi, Good Friday, Holy Thursday, Easter Vigil and Nuptial controllers/tests | Per-controller / integration cases have different degrees of phone evidence; not all have a full in-person rite demonstration |
| Physical-phone / devotional experience | **Not automatable here** | Needs actual 320–430px Android screen review, dark/light church conditions, haptics/touch, gesture legibility, French text proofing, elevation salience and bells at real speed |

## Defect discovered by expanding phone coverage

The original test harness was artificially Sung-only and passed a hand-built Mass plan without `objectiveContext`; Low and Solemn require the real `compileMassPlan` output. The harness now uses that production compiler.

The intentional source vs product distinction is locked: **Low LIVE = 39 cards; Sung LIVE = 48 presentation cards**.

The first genuinely missing LIVE cue was then revealed at the Epistle: dynamically resolved Proper paragraphs had no `sourceCueIds` even though their 11 Proper blocks already have canonical source cues. As a result, the display text was disconnected from the native cue-focus tracker. The fix uses the **first authentic non-response source cue already registered on each Proper block**, not newly invented timing or a minister's reply. Thus the Epistle text belongs to `C0075`, not the separate server `C0076`; the Gospel text belongs to `C0086`, not the `C0087` response. This is tested in `tests/reader-text.mjs` in both Low and Sung and for a two-paragraph Epistle. Multiple paragraphs may share one block-level cue: this is not word-by-word timing certification.

## Critical interpretation of the matrix

The ordinary harness includes sample Votive Proper content, **not an authenticated Proper for each date**. In `family=REQUIEM` the overlay and celebration type are explicitly selected, but the proper fixture remains synthetic. Therefore **do not** claim Requiem liturgical-text completeness merely because its state/projections pass.

A browser screenshot is review evidence, not automatically a visual-quality acceptance. Passing `npm run test:phone` proves the scripted conditions, not every icon is aesthetically correct, every gesture is word-perfect, or a lay attendee can follow the rite without guidance.

## Remaining human review / release blocks

1. Review representative **real** device captures for the opening prayers, Gospel, Offertory, elevation of Host and Chalice, Pater Noster, Communion, dismissal and an exceptional Mass (at least Requiem and Holy Week).
2. Check each priest vs faithful icon at user-readable size, including church lighting and one-handed portrait operation; verify that Schola panel does not obstruct vital Latin.
3. Walk through **actual** 1962 celebration calendars and Propers with correct preface, additional collects/commemorations, minister-specific exceptions and bilingual texts. This is adjacent to, not replaced by, the gesture-owner tests.
4. Test at least one Low, one simple Cantata, one incensed Cantata and one Solemn celebration against **observed practice**. Log local custom separately from 1962 prescriptions and avoid inventing timestamps where the priest's private actions are unobserved.
5. Independent celebrant observation (if wanted) is still an explicit input, not camera/microphone recognition. It must not become a mandatory faithful tap.

## Release decision discipline

- **Automated/browser gate PASS** only if all required CI and the new matrix pass, including the deliberate Low=39 / Sung=48 separation.
- **Complete 1962 Mass field-certificate** remains **PENDING** until the items above have been directly verified.
- CI artifacts: `mass-live-batch4-phone-review` (screenshots + structured case manifest).
- The present batch adds tests, fixtures and evidence; it does not assert an unobserved physical-phone release.
