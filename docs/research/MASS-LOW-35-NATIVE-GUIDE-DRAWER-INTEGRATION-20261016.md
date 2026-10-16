# Low Mass · Existing native Guide drawer integration — research gate (16 October 2026)

**Implemented on draft Mystery PR #1193, research-only; no production activation.**

## Exact product ownership

- Existing canonical 1962 reader: `src/mass/reader-dom.js` and `data/presentation/reader-text-low.v1.json`; real ResolvedMass `form === "LOW"`.
- Recovered historic Low copy: `data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json` (35 exact old Guide IDs, short source text only; 33 tentative cue anchors, 2 observational stages).
- Dedicated source resolver: `src/mass/reader-low-guide.js` (exact `LOW_1962` research form, source schema and not-approved status).
- Existing released Guide registry remains **unchanged**: `data/presentation/guide-registry.v1.json` has 32 entries, matched on 128 field fingerprints against the historical source.
- Full historical long guides remain in the Ultra Master workbook; they have **not** been source-certified or published.

## Actual native-drawer wiring

`createReaderDomAdapter` now takes an **optional, deliberately disabled-by-default** `lowGuideResearchPreview` parameter.

```js
// Only from an explicitly enabled research harness, never normal production:
const adapter=createReaderDomAdapter({
  root,
  lowGuideResearchPreview:{
    index:validatedLowGuideSource,
    lowCorpus:currentLowMassCorpus,
    allowResearchPreview:true,
    applicableConditionalGuideIds:[], // exact selected-Mass decisions, not calendar guess
  }
});
adapter.mount(preparedLowMass);  // preparedLowMass.session.resolvedMass.form must be "LOW"
adapter.renderMoment({
  id:"LOW_RESEARCH_REVIEW",sectionTitle:"Opening",cardTitle:"In nomine Patris",
  activeSourceCueId:"AO.SM.C0001", // actual Low text source cue
  paragraphs:[/* same canonical text paragraphs already in reader */],
});
```

This uses the **existing** `[data-role="guide-button"]` and the **existing** `renderGuideSheet`, not an alternate reader component. It marks the sheet `Low Mass · Unapproved research`, labels the text non-certified, suppresses irrelevant contextual extras, and does not invent a long explanation or priest/faithful posture.

The exact Low corpus source cue is used to look up the appropriate legacy-stage source; no selected stage is mistaken for a normative word-level gesture. An inherited Guide remains active only inside the **same actual Low macro**. Without the Low corpus, only an exact source anchor can be matched. This avoids leaking a Fraction Guide into the subsequent Communion/Canon prayer merely because the cue numbers are sequential.

## Fail-closed rules

1. No `lowGuideResearchPreview` option = unchanged public Guide drawer; historical text is never loaded by default.
2. Only real resolved Mass form `LOW`, and only the research index's exact `LOW_1962` identity, can activate the bridge.
3. Any conditional source stage (including Gloria, Credo, optional Communion, omitted blessing/Last Gospel, extra bells) requires its original **LOW.xxx** ID explicitly in `applicableConditionalGuideIds`; missing applicability = no Guide.
4. `LOW.001` (arrival) and `LOW.028` (local Communion warning) have **no automatic canonical cue**. They can only be shown after explicit observational selection and explicit applicability.
5. No Schola track is inferred in Low Mass. No new Mass card, Canon owner, mandatory posture, gesture or source text is introduced.
6. The unapproved source remains `registryAvailable:false`, `releaseApproved:false`, `researchPreview:true`; the actual Guide renderer identifies it as research and never treats it as one of the 32 certified Guides.
7. No migration to live content, main, or GitHub Pages is authorized by this PR.

## Test coverage

`tests/mass-low-35-native-guide-preview.mjs`, run within the existing Mystery editorial inventory gate, exercises:

- All **33** source-cue-anchored low stages and **two** manual observational states;
- actual `reader-text-low.v1.json` macro-boundary checks, same-macro inheritance, and cross-macro rejection;
- conditional Gloria/Credo/Communion fail-closed tests, wrong form and no-preview default;
- native `createReaderDomAdapter.renderMoment` accepts the research short copy as `researchPreview` without marking it published;
- original 32-guide continuity certification still enforced.

## Next **production** gates

1. Certify Low guide stage-to-source-cue start/handoff timing against the actual 1962 reader; the 33 anchors remain source candidates, not exact gesture transitions.
2. Review real full historical long-copy source links and correct ungrammatical/AI-like material using the named original witnesses.
3. Obtain explicit editorial acceptance of at least one substantial Low Mass batch.
4. Have the **Mass reader owner**, not a parallel Mystery-only pipeline, enable approved Low copy in canonical `guideForCurrent` behavior and test on mobile. No auto-release of the 35 index.
5. Verify `https://fulcanelli13.github.io/ad-orientem/` after an authorized merge/deployment. **Neither a CI pass nor this PR means the app changed.**
