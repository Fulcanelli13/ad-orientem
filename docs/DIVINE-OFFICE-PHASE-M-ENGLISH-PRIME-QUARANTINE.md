# Divine Office Phase M — quarantine the mismatched English All Souls Prime

29 October 2026 · [Draft PR #1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860)

## Completed and verified

[CI #40786227525](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40786227525) passed **3/3 jobs**, including 10/10 Chromium device-size acceptance cases (eight phone widths) and 0px page overflow. Existing source revision `126a07f91ede04664108abb6fb20ace3f4de14b9` remains pinned; no source cells altered, no Office published, no chant resource linked.

This pass **does not create an unverified English translation**. `src/office/source-content-gate.js` reports a narrowly sourced, reviewable mismatch when Latin `Prima5` at 2 November 2026 asks for *all the faithful departed* while the corresponding English `Prima5` substitutes the *brethren of our congregation, kinsfolk and benefactors*. The exact circumstances, date/hour/language, source IDs and pinned source revision are checked. The original `validateResearchOfficePair` now refuses this pair with `OFFICE_RESEARCH_READER_CONTENT_SCOPE_MISMATCH`, preserving the earlier validation precedence for invalid source contexts.

The Mass-style preview builder separately implements `--quarantine-content-scope`. A blocked locale does not receive an HTML preview, and all local hour/date/language links reflect the actual generated files. The French Prime research candidate is still readable; its settings show **EN review** as an unavailable locale rather than a broken link. Both original and corrected-source cohorts retain all eight canonical hours in their normalized source records, independent of preview eligibility.

| Pilot | Original possible EN/FR previews | Generated after integrity gates | Withheld |
|---|---:|---:|---|
| Four-date baseline | 64 | 64 | 0 |
| Advent First/Second Vespers | 4 | 4 | 0 |
| Pristine All Souls, 2 Nov | 16 | **10** | 5 FR placeholders + **1 EN Prime mismatch** |
| Syntax-repaired French All Souls candidate | 16 | **15** | **1 EN Prime mismatch** |

The 10 Chromium cases pass without horizontal page overflow, including corrected French Prime at 320px and French Compline at 390px. The `src/office/mass-style-research-reader.js` language selector does not link to blocked English Prime. This pass expands translation safety beyond checking that text is present; it does not replace human review or certify other English hours.

## Remaining bounded tasks

1. **Correct English Prime using a precise, historically established translation** of the *adapted* `Deus, veniae largitor` for all the faithful departed, reconciled with the printed Roman 1960 Office. Do not copy the different congregation-specific collect or invent an unattributed translation; retain original source, context and redistribution notice.
2. **Split the Prime Martyrology from the following versicle and prayer** at source-attested boundaries, without deleting any text. In choir, the Martyrology may be read; outside choir, omitting the Martyrology must **not** omit the subsequent prayer. Segment source cells carefully in LA/EN/FR without zipping lines or breaking Mass-style card navigation.
3. Verify the anticipated **3 November Martyrology** against the relevant Roman Martyrology plus the 1960 variationes, including special 2 November rubrics and correct lunar day, before enabling a public reading.
4. Complete independent printed text and translation review of the other Office hours; keep the annual Calendar/Pray Office route closed until verified. No external sung-score links or paid hosting.

**Release state:** `verifiedOfficeDates=0`, `verifiedTranslationCells=0`, `published=0`. No merger or production deployment.
