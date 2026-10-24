# Historical Catholic customs — three-author online excerpt wave (23 Oct 2026)

## Actual research scope

A research-only high-volume source-action screen has been added to PR #1572. This wave reads **29 identifiable CatholicCulture activity pages reproducing portions of three historical authors**, not 29 complete books and not full facsimiles of the originals.

| Attributed historical author | Book / textual witness | Online excerpt pages | Source-action observations |
|---|---|---:|---:|
| Maria Augusta von Trapp | *Around the Year with the Trapp Family* (1955); one Holy Thursday passage is attributed to Trapp in later *Your Home, a Church in Miniature* anthology | 11 | 54 |
| Florence Berger | *Cooking for Christ* (1949; online excerpts cite a later reprint) | 4 | 21 |
| Mary Reed Newland | *The Year and Our Children* (1956) | 14 | 57 |
| **Total** | **Three historical authors, excerpt evidence only** | **29** | **132** |

Each observation has a stable new research ID, a short independently worded action, a precise online activity URL, named source page, liturgical occasion, and nonpromotion status. Some sources retain tentative website line-range hints; these are not original printed pages and cannot establish textual completeness.

## Counts that must not be conflated

- **1,025** Weiser book observations and overlapping granular details
- **70** McLoughlin online observations
- **198** Stokes 1955 compiled-source action observations
- **132** newly screened historical-author online excerpt actions
- **1,425** aggregate research source/detail rows, **not 1,425 distinct customs**
- **408** previously staged provisional Handbook groups, unchanged
- **0** new historically/identity-verified distinct Catholic customs
- **0** app publications or Calendar changes

The 132 action labels can overlap each other, the 408 group labels, the 56 existing master identities, the McLoughlin and Stokes extracts, and Weiser. They are not promoted to new groups at this gate. They include historical reports, family experiments, devotional teaching activities, material variants and suggestions. A reader must resolve these before inferring long-standing community observance.

## Source independence and liturgical authority

- **Different web URLs do not equal different independent historical authors.** Stokes cites or reuses Trapp and other earlier accounts; McLoughlin explicitly acknowledges Weiser and Berger; Newland borrows some recipes from Berger. Repeated claims must carry a derivative-source link when demonstrable.
- The quoted Holy Thursday practice appears on a CatholicCulture page whose final citation is to *Your Home, a Church in Miniature*, a later compilation. It must not be represented as personally checked against Trapp's 1955 printing.
- Domestic sprinkling, blessing, procession and home ceremonial prescriptions are **not yet verified as corresponding to authorised 1962 Roman Ritual texts**. Historical descriptions should not silently become liturgical rubrics.
- Historical/folk-origin statements, national labels, current applicability and precise editions need separate checks. No original printed page numbers have been invented.
- Only short rephrased labels are retained; no long copyrighted reproductions of hymns, chapter text, full prayers or recipes.

## Repository artifacts and validation

- `data/customs/master/trapp-berger-newland-catholicculture-excerpts-wave01.v1.json` — 29 source-page index objects, 132 unique action records.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — all 132 references added as **external research observations**, aggregate source-row count updated to 1,425; provisional-group, canonical-identity and app publication counts unchanged.
- `tests/customs-full-registry-census.mjs` — enforced 29/132/source-link nonloss, ID uniqueness, attribution distribution, zero automatic promotion and preservation of the prior 408 groups.

## Next serious release gates

1. Match the 132 excerpt observations against each other and McLoughlin/Stokes/Weiser at the **action** level, preserving source-dependency relationships and small exception queues, without assuming equivalence.
2. Read **complete original editions where accessible** and verify bibliography, folios and within-page coverage; these 29 excerpt pages are not a substitute.
3. Widen the source net to independent Catholic historical witnesses and regional sources beyond the U.S. family-life canon, especially Italian, French, Irish, Central/Eastern European and Latin American primary reports.
4. Revisit the **222 Weiser Handbook printed pages** that have no newly located detailed source observations, using actual page-completeness gates. Do not count a source locator as a completed page.
5. Keep the entire branch research-only; the existing Calendar, Mass reader, rites, prayers and published customs are out of scope.
