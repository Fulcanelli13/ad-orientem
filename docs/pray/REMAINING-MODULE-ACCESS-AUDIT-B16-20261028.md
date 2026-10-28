# Ad Orientem — Prayer module access audit, B16

28 October 2026. This inventory is based on the current `src/pray/presentation-runtime.js`, `src/pray/traditional-pray-runtime.js`, the route ownership register and source integrity acceptance. It is **not** an invitation to enlarge the prayer corpus.

## Editorial triage

| Module / related modules | Existing capability | Decision |
|---|---|---|
| Morning & Evening Prayer; Grace at Meals; Nightly Examination | Source-owned directly selected formulations, guided daily sequence and independent examen | Retain B08/B13; no new prayers |
| Traditional Communion Prayers | B09 purpose-labelled before/after sources | Retain, prevent a mandatory prayer checklist |
| Adoration & Visit; Benediction; Forty Hours | Source-owned private adoration and distinct public ritual / prolonged exposition | Retain; respect ritual/private boundaries |
| Confession | B13 canonical contrition, historically documented alternative and staged examination | Retain; no confession simulator |
| Seven Penitential Psalms; Litany of the Saints | Historical penitential source order and precise Scripture/service texts | Retain, no automatic appendix expansion |
| Stations of the Cross | B14 original XIV St Alphonsus stations, direct complete/simple view and optional public method | Retain |
| Seven Words; Tenebrae | Source-owned Gospel meditation / 1960 Office distinction | Focused provenance review only where a known gap remains |
| First Fridays; First Saturdays | B15 direct reparatory text, canonical Rosary / fifteen-minute separate meditation, opt-in self-reporting | Retain without inferential fulfilment |
| Sacred Heart; Litany of the Holy Name | Independent prayers with edition-level distinctions | Retain |
| Novenas | Sixteen declared source-backed novenas with calendar context | Only research individual missing or disputed editions |
| Preparation for a Good Death | B11 nine independent prayers, selected by five devotional purposes | Retain |
| Dying Companion | Existing three-stage priest-first bedside help, but stages buried in secondary disclosure | **B16 P0: surface immediate priest / pray / commend direct choices** |
| Sacred Hymns & Canticles | Three source-owned principal texts plus eight historic seasonal recensions, but only hidden catalogue / obsolete teaser | **B16 P1: make the three principal texts immediately accessible, keep seasonal recensions optional** |
| Prayer Library | Searchable individual prayers, not a home-page encyclopedia | Retain, do not add unselected texts |

**Scope:** This is an access audit of existing routes, not a percentage assertion that every bilingual witness is fully collated. Existing editor notices, edition attributions and no-source-substitution requirements remain binding.

## B16 changes

1. **Dying Companion:** Put the real three existing actions directly on the initial screen: *Call a priest now*, *Pray at the bedside*, *Commend the soul*. The initial card and its emergency medical and last-sacraments guidance remain prominent; these buttons select the same canonical three-stage reader, not a new rite. The faithful do not administer Penance, Anointing, Viaticum or the Apostolic Blessing. The documented distinction between prayers for the dying and suffrage after death remains intact. Remove only duplicate direct-stage choices from the optional explanation, preserving previous/next.
2. **Hymns:** Reveal *Te Deum*, *Veni Creator*, and *Ave Maris Stella* as direct source-owned choices. The other eight remain in a collapsed seasonal Office list, with original Latin, separately attested EN/FR, editorial warnings and provenance. Do not imply automatic liturgical Office placement or universal seasonal scheduling. The full 11-stop reader, paragraph focus, horizontal swipe and historical source language switches remain intact.
3. Correct the Pray family teaser to describe **3 principal + 8 additional Office texts**, not just three names.

## Acceptance

Existing 390/320px French owner browser test asserts direct three-hymn selection and seasonal preservation, exact rendered Latin/French source lines, 11-stop swiping, direct bedside actions with the priest-first initial card, no horizontal overflow, three canonical stages, last-sacrament boundary and distinct after-death prayers. Unconditional `test:pray-owner` asserts fixed source counts, policy, route ownership and theme. CI and production deployment must be checked before declaring live. All changes cost €0.
