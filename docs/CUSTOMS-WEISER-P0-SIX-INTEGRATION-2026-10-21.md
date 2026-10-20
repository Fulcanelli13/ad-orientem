# Weiser P0 six — staged Customs Atlas integration

**21 October 2026 — DRAFT branch atop coordinated PR #1519. Not merged into `main`.**

## Goal and exact release delta

Add six genuinely distinct traditional customs selected from the complete Weiser 54-draft owner reconciliation, **without** creating a second Calendar, prayer book, Mass ceremony or duplicate Explore identities.

| Registry | Previous coordinated baseline | With P0 six |
|---|---:|---:|
| Canonical customs | 27 | **33** |
| Attestations | 86 | **92** |
| Sources | 96 | **102** |
| SOT-07 extensions | 11 | **17** |
| Protected negative knowledge | 7 | **7** |

| ID | Practice | Source | Calendar handling |
|---|---|---|---|
| `ADVT-001` | Family Advent wreath | USCCB, `USCCB-ADVENT-WREATH-HOME` | Shared **one** first-Advent-Sunday household notice with manger straw |
| `ADVT-002` | Preparing the manger with straw | Jennifer Gregory Miller, 2014, `CATHCULTURE-ADVENT-MANGER-STRAW-2014` | Same first Sunday notice; not a gamified act-count |
| `ADVT-003` | Las Posadas | USCCB, `USCCB-POSADAS-DEC16` | 16 December context; no assumed local procession or route |
| `XMAS-001` | Sharing Polish opłatek | Vermont Catholic parish, `SJV-VERMONT-OPLATKI` | 24 December context; explicitly **not Communion** |
| `HTHU-001` | Holy Thursday visits to altars of repose | Chicago Catholic, 18 March 2026, `CHICAGO-CATHOLIC-HOLY-THURSDAY-2026` | **Enrich** the existing Holy Thursday notice, no second card, no invented seven-stop itinerary |
| `ROGA-001` | Private family Rogation prayer walk | Mary Reed Newland 1956, `NEWLAND-ROGATION-FAMILY-1956` | **Enrich** the existing Rogation card, distinct from priest's procession |

Full original EN/FR long descriptions, spiritual meanings, optional lay actions, source IDs and Weiser page locators are at `data/customs/customs-p0-guidance-en-fr.v1.json`. The shorter text in `src/calendar/traditional-year-v384.js` is what the existing Calendar UI currently consumes. No additional UI component is invented; longer Explore detail copy needs a later reader-adapter before it can appear verbatim.

## Ownership and release boundaries

The canonical definitions are in `data/customs/customs-atlas-seed.v1.json`. Each gains **one** country-scope attestation and one independent source registry record; they all use `NOT_MAPPED` with `place_id: null`. Country-level sources do not prove the custom is celebrated in every parish of that country.

Existing 1962 feast selection, Mass reader, event/action ownership, Holy Saturday card, saints profiles, prayer texts, SOT-07 original 63 rows, protected seven exclusions, and the prior ten admissions from #1519 remain unchanged. No sacramental formula or literal text from Weiser is added.

The two important liturgical distinctions:
- Modern bishops' family Advent prayers attest a living Catholic custom; they do not turn the Advent wreath or manger straw into 1962 Mass rubrics.
- Traditional family Rogation prayer differs from a real liturgical procession and the priest's blessing of fields. Neither action is inferred merely from the calendar date.

## Acceptance criteria

Run `npm run test:customs-atlas`, including the new `tests/customs-weiser-p0-six.mjs`, and the required main gate / Explore / Calendar acceptance workflows. Tests assert 33/92/102/17 exact register counts, independent witness foreign keys, single non-map attestations, complete EN/FR entries, three new Calendar notices, one existing Holy Thursday and Rogation card, and no new rite flags or additional Holy Saturday card.

**Sequencing:** The new P0 PR targets `customs/weiser-coordinated-integration-20261021`, not `main`. Resolve the coordinated PR #1519 first, then rebase/retarget this PR without replaying the 10 original additions or bypassing CI. No PR is to be merged without the release decision.

## Next after this batch

The five medium-priority Weiser candidates (Epiphany star singers, French galette, Corpus Christi route decoration, Easter Monday Emmaus walk and Marian gardens) remain unmerged. A future UI pass should allow the bilingual detail body for the six P0 customs to be read in the Calendar/Customs Atlas using the existing detail layout, rather than displaying isolated one-line practice descriptions.
