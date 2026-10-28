# Morning/Evening Prayer — B06: one-tap same-stage formulations

28 October 2026. Corrects user field review of the previous B03–B05 interaction model. No new prayer catalogue, mode or source material.

## Approved interaction

- The **current stage** remains the unit of the Morning/Evening rule. When the source corpus contains verified alternative *complete* prayers assigned to the same daypart and slot, visible labelled buttons appear **inside that prayer card, immediately under its heading**: St Pius X (original) and each corresponding source witness (e.g. Lasance, Moran, Pocket Prayer Book, Exercices).
- **One tap** switches the entire displayed prayer **in place**. It persists the selected source ID in the existing local preference key. The reader keeps its exact active stage, the atmospheric scene DOM, daypart and phase, other settings and the running/paused stopwatch/timer. The same source selection is restored on revisit. No invented translation or fallback between English, French and Latin.
- Verified alternatives are available in **Full and Personal Brief** whenever that stage belongs to the active sequence. If the user later adds the stage to their Brief, its previously saved formulation becomes active.
- Full printed St Pius X edition is always available as a one-tap option. The historical source label, source URL and editorial-Latin warnings change with the actual prayer text.
- **No extra prayer stage** is silently added when swapping a formulation, and no source excerpts are assembled into synthetic prayers.
- The existing session clock is explicitly described as **Stopwatch / timer**: free-running elapsed time, optional five/ten/fifteen/twenty-minute targets. It never advances the prayer automatically.
- Retain the existing ambient sky/atmospheric treatment and its manual step-based progression. The source switch does **not** rerender the complete sheet or reset the sky. No changes to Sacred Art or to the underlying atmospheric progression palette.

## Implementation notes

- `daily-personal-rule.js`: return attested same-slot variants independent of length, filtered by selected daypart and source language.
- `daily-personal-prayer-view.js`: visible compact horizontal source buttons, with full title as tooltip and exact provenance below prayer; no nested formulation disclosure.
- `traditional-pray-runtime.js`: replace only current canonical article rather than the whole reader; preserve reader/sunrise/stopwatch, save ID, reset only new prayer's text scroll to its first line.
- `devotional-sequence-adapter.js`: reindex focusable prayer paragraphs after the article text changes so vertical reading focus remains coherent.
- `traditional-pray-styles.js`: restrained source chips within the current card, horizontal row overflow only when necessary.

## Gates

- Unit source text, language, 1905/1913, Full/Brief parity; no stage additions.
- Real phone: click alternative and St Pius X revert; assert identical stage index, sky DOM identity, scene phase, stopwatch readout and scroll container identity; full existing Morning/Evening phone journey.
- Required nonbrowser, guided cards, Prayer route parity, observed Back, app convergence, text focus, other Prayer regressions.

No paid services, new historical edition, changes to ICKSP draft #1800 or Sacred Art.
