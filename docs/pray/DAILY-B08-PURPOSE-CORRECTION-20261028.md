# B08 — Morning/Evening Prayer: original historical text + distinct optional purposes

28 October 2026. **Authoritative correction** to B07, following user review of the confusing substitutions.

## Primary requirement

**The St Pius X combined Morning Adoration / Thanksgiving / Offering is one whole prayer. It must never be replaced by an Offering-only, Adoration-only or Thanksgiving-only prayer.** The same applies to the combined Evening opening. Don't edit their original text or printed 1905/1913 sequences to manufacture separate historical prayers.

The B06 one-tap control is retained **only for truly equivalent same-act texts**, such as a source-attested complete Act of Contrition. Other prayers may be included as optional, purpose-specific whole prayers (e.g. **Morning Offering**, **Morning Thanksgiving**, **Evening Thanksgiving**, **Evening Adoration**), but are not incorrectly represented as replacing the combined original.

## Reader interaction

1. Enter Morning or Evening guided reading; the selected St Pius X edition's complete original opening is first and remains unchanged.
2. Within that opening card, immediately **after the original prayer and its source**, show compact optional purpose selectors if the existing source language has any verified whole prayers in that purpose.
3. For each applicable purpose, show an always-visible single-tap horizontal selection: **None** (default) or a named historical source. Tapping a source renders **its complete prayer in a separately titled reading area**, retaining the original opening above. Tapping a different historical source switches that one additional prayer only. Tapping None removes the extra reading.
4. Each purpose is independent, so Morning Thanksgiving and Morning Offering may both be chosen without replacing or composing the printed St Pius X text. These are explicitly **additional** devotions; the original published sequence does not claim them as printed stages.
5. No additional reader card or artificial liturgical stage is created. Existing sky DOM, vertical reader container, manual stage index, total stage count, horizontal navigation, stopwatch and timer all remain unchanged during a one-tap purpose switch.
6. The user's choice persists via validated source IDs only. English, French and Latin source-language boundaries remain strict; no generated translation. The separate direct prayer catalogue and manually saved optional extras remain functional but are not required to choose a purpose's alternative.

## Source classification

From the fixed bank of 45 historical records, 12 B07 candidates were reviewed again:

- **11 narrower prayers** now belong in optional purpose groups, not the main form picker: Morning EN: two adoration/thanksgiving + five Morning Offerings; Morning FR: one thanksgiving/offering; Evening EN: one adoration/thanksgiving; Evening FR: one adoration, one thanksgiving.
- **1 same-act prayer** remains a formulation alternative for the Evening Act of Contrition: the French 1905 *Exercices de la vie chrétienne* prayer.
- The 9 already-classified pure variants remain eligible for their own exact stage (Faith, Hope, Charity, Contrition), respecting language.
- No new text, sources, fabricated segment, Office reconstruction, composite or 1962 Mass data is created.

The canonical classification is `src/pray/daily-stage-alternative-review.js`. All source wording remains in `src/pray/daily-personal-prayer-source.js`.

## Compatibility and trust

Some existing B07 users may have saved a narrower prayer as their `variants[daypart]["daily-prayer"]`. Normalizing that setting silently **migrates its historical source ID to `purposeSelections[daypart][purpose]`**, leaving the St Pius X original restored and offering the saved prayer in its proper distinct-purpose section. A saved pure same-act variant remains unchanged. Never overwrite or delete user-saved `extras`.

Explicit choices take precedence over migration if user preferences already have a validated B08 value. Language-ineligible choices stay stored for when that language is selected again, but are never shown as a cross-language fallback.

## Release acceptance

- Source integrity: exact printed St Pius X 1905/1913 opening text/source and card order, optional prayer original full text/source, all 11 distinctions and one true same-act form.
- All languages × both editions × Full/Brief: default No extra reading, valid options only, one-tap selection and None, no stage count or sky denominator change, validated ID persistence.
- Migration from every historical B07 narrower choice; check original restored and source not lost, repeat normalization idempotent.
- 390px real-phone capture of French optional Morning Offering with St Pius X opening still visible; assert sky element identity, reader-scroll owner, timer readout and stage identity. Original text must remain byte-faithful within runtime representation.
- Run required main non-browser gate, traditional daily dual-axis phone acceptance, contemplative daily reader, guided cards and app-convergence checks before merge and live alias verification.

**Design non-goals:** no redesign of the atmospheric gradient or adding a separate "purpose routine" mode; no new prayer text, Office import, unrelated Sacred Art/Mass changes, subscriptions or storage costs. This is a focused correction, not a claim the full Prayer UX is complete.
