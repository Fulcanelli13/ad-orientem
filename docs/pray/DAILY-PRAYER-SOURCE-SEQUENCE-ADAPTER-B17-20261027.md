# B17 — Source-gated Morning / Evening sequence adapter

**27 October 2026 · Implementation draft PR #1786 · No production release**

## What is now implemented

The pure `src/pray/daily-source-sequence-adapter.js` bridges the existing `compileDailyFormulation` complete-text engine with the **same existing** dual-axis guided Prayer reader.

The *current* `src/pray/traditional-pray-runtime.js` now calls `dailyReadingPlan()` instead of directly committing itself to `guidedDailyCards(S.daypart)`. This is a guarded substitution, not a replacement reader.

To display an approved historical sequence, ALL release conditions are mandatory:

1. `DAILY_APPROVED_SEQUENCE_RELEASE_V1.enabled===true` in the static shipped release configuration.
2. The exact `language:daypart:length` profile key is allowlisted in `approvedProfileKeys`.
3. That exact source profile has `releaseStatus:"approved"`.
4. Every prayer body has its own exact-language `releaseStatus:"cleared"`, complete text and HTTPS source URL, checked by `compileDailyFormulation` without research-mode override.
5. The entire selected profile compiles with no duplicate card IDs, invalid stage types or foreign/withdrawn text. **Partial approval cannot create a half-historical routine.**

**The release configuration is currently disabled and the approved manifest has zero prayer bodies and zero profiles.** The deployed-branch behavior, after any PR merge, would still be the existing canonical 11/13 cards unless a separately reviewed release change is made.

## Real reader contract

- **Standard** remains the opening/default choice even if a profile were later enabled: 11 original Morning and 13 original Evening cards, unmodified.
- The Short and Complete controls appear only if at least one complete, source-checked, explicitly approved corresponding profile is available. They follow the prayer card in the document, rather than pushing prayer below the top of a 390px phone.
- A selected source-owned prayer appears in the **same** `guidedCardFrame`, timeline, horizontal card/swipe and vertical paragraph-focus reader. No second navigation engine.
- Compound source prayers are recited once, and the compiled card carries its `coveredSlots`; distinct antiphon/collect/night prayers may appear separately.
- Daypart switching, language fallback, list-to-guided, and return from the nested Nightly Examen use the **currently active profile length**, not a hard-coded 11/13 length. Active indexes are clamped to prevent skipping when a Short routine has fewer cards.
- The full source title, original prayer text and HTTPS edition-page source are rendered; no synthetic EN/FR translations or interpolated abbreviations. User-selectable source variants are guarded by the same profile approval gate.
- If a source is revoked, a saved selection becomes invalid, a profile becomes incomplete, or a language is unsupported, `resolveDailyReaderSequence` returns the **original canonical rows by identity**, not an incomplete hybrid.
- The timer remains an independent optional stopwatch, no auto-advance, timeout, completion scoring, personal records or source publication coupling.

## Tests and boundaries

Node source-engine tests now include:
- Actual baseline counts 11 Morning / 13 Evening.
- Release switch OFF, empty allowlist, missing profile approval, invalid choice or revoked source all force canonical fallback.
- The unmodified canonical arrays are returned with the original object identity.
- A synthetic approved, cleared source profile compiles the expected shorter row count and keeps complete text, provenance and manual navigation.
- A combined prayer covers two stage purposes but appears once.
- A synthetic Night Prayer + antiphon profile produces distinct complementary cards.
- Stage choices and saved variants are language and release-gated.
- Stage migration audit still preserves every existing ID exactly once.

Phone browser tests additionally assert **no new length control, no historical text and no formulation picker** when the shipped static release configuration is disabled. Prior expanded timer/scroll tests remain.

## Explicitly not completed in this PR

- **The historical source default/alternatives have not been approved.** They remain in [research draft PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785), with rights/jurisdiction/editorial review pending.
- No production source manifest is populated, nor have user-specific EN/FR preset selections been authorized.
- The historical full-book single-edition faithfully ordered presets are not represented by an Ad Orientem composite.
- No merge/deployment action has been taken. No Main/Home/Calendar/Mass work.
- CI must pass **on the latest head** before any implementation merge; green checks on earlier SHAs are not sufficient.

**€0 / no paid tooling / no rights-holder contact.**
