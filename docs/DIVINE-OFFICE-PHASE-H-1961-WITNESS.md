# Divine Office Phase H — independent 1961 rubrical witness and language risk (28 October 2026)

**State: RESEARCH / DRAFT / ZERO OFFICE ROUTES PUBLISHED.** This phase does not authorize app deployment or independent Office text certification.

## Purpose

The Mass-style LIVE/MISSAL prototype has passed six Chromium device-size acceptance cases. The next blocker is **the content**, especially the fact that an Office's 1960 precedence, completeness, chant rules and commemorations cannot be reconstructed merely from the Mass Calendar's selected feast and ranking.

The repository's fixed historical Phase B pilot **remains 96 documents** (four dates × eight hours × LA/EN/FR) and the Advent First/Second Vespers pilot **remains six documents** (two dates × Vespers × three locales). Phase H adds **24 separate source documents** for **2 November 2026 (All Souls): eight hours × three languages**, plus sixteen local bilingual Mass-style previews. No generator or source-pinning change is made.

## Independently checked rubrical edition

Primary printed source, checked page by page (not inferred from Divinum Officium):

- **Breviarium Romanum, editio iuxta typicam 1961, Codex Rubricarum** [scanned edition](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf).
  - Printed **p. 41, n. 91**, precedence: `Commemoratio omnium Fidelium defunctorum, quæ tamen locum cedit dominicæ occurrenti`. The All Souls exception is material. A generic Class I tie-breaker is insufficient.
  - Printed **p. 61, n. 161(d)**: All Souls has Matins with **three nocturns, nine psalms and nine lessons**, unlike many ordinary Sunday/ferial Matins.
  - Printed **p. 62, n. 166(a–h)**: Sunday First Vespers ordinarily uses the preceding Saturday's psalter unless proper; Compline following is of Saturday. Sunday Second Vespers is governed by its own proper and Compline following is of Sunday.
  - Printed **p. 63, n. 167(a–h)**: a Class I festive Office has a distinct First/Second Vespers pattern, and **Sunday Compline** follows either festive Vespers.
- Secondary independent textual explanation: Patrick Laurence Murphy, *The New Rubrics of the Roman Breviary and Missal* (1960 commentary; republication) [PDF](https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf), printed **pp. 20–21, nn. 103–111**, for concurrence and commemorations.

**Scope limitation:** The independently checked PDF contains the general rubrics, NOT a certified line-by-line critical comparison of every Advent or All Souls proper prayer, lesson and translation. Verifying the rubric *rule* is not verifying an *Office*. Local Calendars (cathedral, parish patron, religious institute), which may alter precedence and commemorations, remain unresolved.

## Automated source-side research

- `scripts/office/audit-printed-rubrics-pilot.mjs`: reads pinned, sanitized Latin source-cell documents for **31 October, 1 November, 2 November**, reports (not assumes) whether First/Second All Saints Vespers and All Souls Vespers are headed correctly; scans All Souls Matins for nocturn labels and lessons; retains the source's SHA revision and original cell identity. Any ambiguous nocturn structure enters the manual queue.
- `scripts/office/audit-translation-risks.mjs`: screens **40 trilingual hour groups** (32 existing + 8 All Souls), detecting exceptionally short translated source cells, long blocks identical to Latin, or exact long EN/FR duplication. These are **risk indicators**, not automatic corrections or proofs that unflagged texts are accurate. Output lists source cell IDs and minimal metrics, not full proprietary/proper text in Git.
- Both scripts use the same pinned Divinum Officium revision as the Office generator. JSON reports exist only in **ephemeral GitHub Actions scratch directories**; no report attachment or permanent cloud storage is created.

## Release gates not yet satisfied

1. Independent rubrical **calendar** collation for the full year, including special Octaves, Sundays, first/second Vespers, All Souls and local feasts.
2. Independent printed Breviary **proper text** collation (Latin psalms, antiphons, lessons, hymns, versicles, orations and exceptional omissions) including All Souls; capture reviewer decision per source ID and per date-hour.
3. EN/FR text integrity and translation fidelity confirmed separately (source-provenance and rights included), not inferred from structural equality or script heuristics.
4. After these, promote only certified source cells to a **Calendar/Pray-connected** version of the Mass-style reader. The existing Mass reader and Tenebrae remain the owners of their current workflows.
5. Native Sunday sung Vespers remains a separate, optional, complete-score gate. No external links or partial chant controls.

**No auto-promotion.** The audit fields `verifiedOfficeDates:0`, `verifiedTranslatedHours:0`, `canPublish:false` are deliberately invariant. All tests use only source-backed research and synthetic contract fixtures.

## Evidence of actual CI run

See [draft PR #1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860), workflow *Divine Office research — text, reader and native chant pilot*, and its Phase H test log. Only count the 24 exceptional-hours capture / 16 previews and their Matins/locale screening as completed if the final runner job passes.
