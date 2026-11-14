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


## Source-scoped All Saints Sunday Vespers commemoration (29 October 2026)

The existing 2026 All Saints Vespers pilot has now moved beyond counting a `Commemoratio` heading. The pinned original composer generated both **31 October (First Vespers)** and **1 November (Second Vespers)**. An exact source-scoped comparator inspects only the text *after* the actual `Commemoratio Dominica XXIII Post Pentecosten I. Novembris` heading, so that a prayer found elsewhere in the feast cannot falsely satisfy the check.

| Latin component | 31 October, First Vespers | 1 November, Second Vespers |
| --- | --- | --- |
| Magnificat antiphon | `Vidi Dominum sedentem` | `At Jesus conversus et videns eam dixit` |
| Versicle | `Vespertina oratio ascendat ad te, Domine` | `Dirigatur, Domine, oratio mea` |
| Response | `Et descendat super nos misericordia tua` | `Sicut incensum in conspectu tuo` |
| Collect | `Absolve, quaesumus, Domine, tuorum delicta populorum` | Same Sunday collect |

**Evidence hierarchy:** Independently inspected illustrated bilingual Breviary compilation from [Church Music Association](https://media.churchmusicassociation.org/books/breviarium5x8.pdf), printed pp. **188** (November I First Vespers), **195–196** (XXIII Sunday collect / Second Vespers), **274** (Sunday versicle), **438** (Saturday Vespers versicle), PDF page indices 187, 194–195, 273, 437; matched the original pinned Divinum Officium composer’s generated source parts. The external [SSPX Ordo for 1 November 2026](https://ordo.fsspx.org/day/2026-11-01?lang=en) separately attests the Sunday commemoration at Second Vespers. Its [31 October Ordo](https://ordo.fsspx.org/day/2026-10-31?lang=en) attests First Vespers of All Saints **but does not explicitly enumerate the Sunday commemoration**, so the first Vespers appointment retains a stricter review flag.

**Observed result:** [exact-head Office CI #40816495731](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40816495731) passed 3/3 jobs. The source-backed `OFFICE_VESPERS_COMMEMORATION_SCREEN` reported **both comparisons matched all four Latin components, in the correct order, inside one source-attested commemoration heading each**; 69/69 JS, 9/9 Python, 10/10 Chromium cases (8 phone, 0px overflow). CI on the subsequent regression-enforcement commit must be checked separately.

**Do not overclaim:** this external PDF is a modern bilingual *compilation*, not an authenticated original printed **1961** Roman Breviary exemplar. Source matching does **not** establish historic source lineage, version parity, exact full antiphon/verse/collect wording, English/French translations, all local rubrics, or all-year concurrence. It does **not** settle the special All Souls Office or its English Prime. The two source comparisons are accepted as **engineering source integrity**, not liturgical publication certification.

The current code now treats a future loss of either quadruplet as a CI failure. It still always reports `independentlyVerifiedOfficeCommemorations=0`, `certifiedVespersTextComponents=0`, `canPublish=false`, `published=0`; no content rewritten and no public Office route.


## 2026-11-01 French Second Vespers — restored Sunday commemoration, all four components (29 October 2026)

This is a **one-Office, research-only, separately labelled candidate**. The pinned Divinum Officium composer’s 1960 concurrence filter erroneously recognized `Dominica` but not the French rank word `dimanche`. The reviewed experiment adds the one word to the 1960-rank recognition regexp **only in scratch**, generates the trilingual Office, then restores the upstream Perl file byte-for-byte. Its six-case exact XHTML comparison changed **only** 1 November French Second Vespers; the other five outputs stayed byte-identical.

**Source-cell identity matters:** Latin source `Vespera9` corresponds, at the same normalized display position, to **French/English native `Vespera10`**. The baseline and candidate both have ten French cells; only the *text of* `Vespera10` is restored. All other nine French source cells are preserved, and the Latin/English normalized Office documents are unchanged. The Latin projection is recorded under `semantic.latinSourceCellId`; do not relabel raw source-cell IDs or fake exact raw-ID equivalence.

**Independent content witnesses (distinct, not blended translations):**

| French commemoration component | Source / corroboration | Provenance decision |
| --- | --- | --- |
| Magnificat antiphon, complete | ICKSP [XXIII Sunday after Pentecost traditional text](https://icrspfrance.fr/textes-liturgiques.php?article=a0245_ancien) | Entire French antiphon matched in the recovered `Vespera10` |
| Vespers versicle `Dirigatur, Domine, oratio mea` | [Latin–French 1960-Breviary Sunday commemoration booklet](https://gregorian-booklets.gitlab.io/vespers/PDF/saints_pierre_paul_II_vepres/traduction/saints_pierre_paul_II_vepres-traduction.pdf), *Collégiale Saint-André, Grenoble*, revision 18 July 2023, printed p. 11 (PDF page index 10) | Recovered French versicle exactly matches this booklet’s rendering |
| Response `Sicut incensum in conspectu tuo` | Same 1960-Breviary booklet, printed p. 11 | Recovered French response exactly matches this booklet’s rendering and follows the versicle |
| Sunday collect, complete | Same ICKSP traditional Sunday text | Entire French collect matched after the response |

The ICKSP [Trinity Sunday traditional article](https://icrspfrance.fr/textes-liturgiques.php?article=a0294_ancien) also prints the *same Latin versicle and response*, with a **different French rendering**. It supports the shared Latin wording, not verbatim French agreement with the Grenoble booklet. The 2023 Grenoble booklet is not an original 1961 printed Breviary and is not itself a rights clearance.

**CI evidence:** [Research workflow #40826633868](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40826633868) passed 3/3 jobs, **80/80 JS**, 9/9 Python, 10/10 Chromium and verified the source-cell/content restoration. The subsequent [wording comparison workflow #40829315898](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40829315898) passed 3/3, **81/81 JS**, 9/9 Python and 10/10 Chromium; real generated `Vespera10` matched **both** Grenoble French versicle/response lines, in order, in addition to the full antiphon/collect. A following strict-regression commit requires this exact witness pair on every CI rerun.

**Decision:** the bounded French four-component **text-source integrity comparison** is complete for *this* Office candidate. Do not call the **original 1961 printed-edition collation**, local calendar and Office appointment, all-year concurrence, rights review, or Divine Office publication complete. The baseline remains at **63 safe main research preview pages and one quarantined 1 Nov French Vespers**; the restored candidate is separate. `original1961PrintedFrenchBreviaryCertified=false`, `sourceRightsForPublicationApproved=false`, `canPublish=false`, `published=0`, no production Office route.
