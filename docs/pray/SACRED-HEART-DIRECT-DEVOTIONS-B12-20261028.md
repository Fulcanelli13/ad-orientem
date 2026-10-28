# B12 — Sacred Heart: direct devotions and correct source identities

28 October 2026. Continues B08–B11. Existing Sacred Heart content already offered four direct tabs. The purpose of B12 is **not** to introduce another prayer selector or treat unrelated devotions as interchangeable.

## Source and identity review

The unchanged four named source-owned reader cards are:
1. **Litany of the Sacred Heart**, traditional complete EN/LA/FR litany with concluding collect, historical *St Andrew Daily Missal* witness and French/Latin La Porte Latine link.
2. **Pius XI Act of Reparation** (*Iesu dulcissime, cuius*), full existing EN/LA/FR canonical text, distinguished from both the Golden Arrow and the consecration.
3. **Golden Arrow**, a separate **Holy Face / Holy Name** reparatory aspiration. Historical 1884 English and 1887 French are independent recensions; **no Latin witness is asserted or invented**. Its Institute reference remains associated with this prayer, not with the Pius XI act.
4. **Consecration of the Human Race** (*Iesu dulcissime, Redemptor humani generis*), Pius-XI-era complete EN/LA/FR corpus with 1927 AAS Latin witness and traditional French witness.

Another **Dedication to Christ the King** (`devotion_consecration_christ_king`) is a distinct canonical private prayer. It must not replace the human-race consecration or be counted as a fifth Sacred Heart source card. It becomes a separately labelled direct related-prayer link outside the sources disclosure.

## UX correction

- A compact two-column, four-choice surface, with names and historically specific scope, replaces the four cramped long tabs. One tap selects one whole devotion. Exactly one is active.
- A short source/context subtitle identifies the active devotion, particularly that Golden Arrow is related Holy Face/Holy Name reparation.
- Keep all four original card IDs, swipe transitions, timeline, paragraph focus, vertical scroll, complete languages, and existing source/edition notes unchanged.
- Do not add a compulsory sequence, source substitution rules, fabricated Latin, saved personal choices, another reader or paid services.
- **Cross-module fix:** a Holy Name -> Golden Arrow shortcut previously set the desired state and then called `open()`, which reset Sacred Heart to the Litany. Pass explicit `prayer:"golden_arrow"` and validate it through the existing `HEART_STAGES` allowlist.
- The dedicated Christ King prayer is now one click below the selected card and returns to the prior Sacred Heart card on Back. It is plainly labelled distinct.
- Preserve the historical sources and separate original corpus IDs. Editorial photos and other Prayer routes are outside this change.

## Release acceptance

- Test exact full EN/LA/FR presence for three main devotions and related dedication, plus EN/FR-only Golden Arrow.
- Verify source ownership and that three similarly worded forms (`Iesu dulcissime`, historical human-race consecration, and Christ King private dedication) never replace each other.
- Real French 390px and 320px phone acceptance: four direct controls, horizontal and vertical navigation unchanged, no 320px overflow, related canonical prayer and return, Holy Name crosslink opens Golden Arrow directly.
- Required main regression, Prayer 23-route, and app-convergence suites must pass before merge; verify Vercel production commit if merged.

Strict €0. No new prayer source text, translations, Mass, Calendar, Sacred Art or Office changes.
