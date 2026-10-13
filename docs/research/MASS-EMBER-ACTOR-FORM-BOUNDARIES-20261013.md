# Mass 1962 — Ember formula timing and actual-form actor ownership
13 October 2026 · Implementation QA record · PR #1153

## Observed defects in the source-first reader
- `src/mass/reader-ember-lessons.js`: all inserted `LESSON` cards previously carried a plain `SIT` posture. Reading type and source order do not by themselves establish the posture of every member of the congregation. Inserted reader cards now retain an observational faithful posture; selected community profiles and actual observed movement remain separate. Literal `Flectamus genua` and `Levate` in source prayer text produce **separate** ordered, precisely located formula cues with an explicit non-universal-faithful-authority warning.
- `src/mass/reader-text.js`: `buildReaderSectionCard` previously passed `formFamily(corpus.form)`, i.e. `SUNG`, rather than the selected `resolvedMass.form` to the dialogue actor resolver. Generic `GOSPEL_PROCLAIMER` and `DISMISSAL_MINISTER` roles in the donor's valid historical audit therefore stayed generic when the user actually selected Low Mass, Missa Cantata, or Solemn Mass. Only **selected actual forms** can now resolve these public actors.
- Correct public Gospel and dismissal roles: Solemn Mass **deacon**; Low Mass and both Missa Cantata modes **priest**. Proper Epistle text in Solemn Mass **subdeacon**; other forms remain **minister to be observed** rather than alleging a uniform public reader arrangement. Responses remain `RESPONDERS`, without assigning each response to the celebrant.
- Distinct silent celebrant, public Gospel minister, server and Schola clocks remain separate; no source event is silently inferred from scroll state.

## Source/evidence boundary
- This change is a **display-only actor/profile fix** based on existing sourced research and the 1962 Roman ceremonial allocation. It does not change the 1962 Latin donor, calendar, Proper resolver, prayers, public text contents, LIVE card projection, Missal bilingual policy, or canonical priest-gesture registry.
- `tests/reader-speaker-roles.mjs` audits the **generic source** (280 Sung audit records), while `tests/reader-model.mjs` and `tests/reader-live-liturgical-acceptance.mjs` verify **actual-form display**. This is a deliberate difference, not an audit inconsistency.
- `tests/reader-ember-lessons.mjs` checks source order and word-level formula cues without silently imposing the priest's/period manual's rubric on lay postures.
- Scope limitation: whether faithful kneel on a particular Ember day or at a particular Mass remains contingent on the selected local/period community profile. Do not label these generic formula cues as an enacted posture without a real source clock.
- Scope limitation: Requiem, optional 2nd Confiteor, noncanonical priest movement and 1962 original-text correction C0194 remain governed by their own source/acceptance gates.

## Release condition
Do not merge unless required-main-gate and R17 Mass convergence report success, including curated65 mobile and broader phone suites. Any failure must be investigated against the original audit and source projection, not suppressed.
