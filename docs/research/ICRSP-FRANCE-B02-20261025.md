# ICRSP France — Batch 02 quality and coverage audit (25 October 2026)

Tracking: [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665); draft [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666).

## Measured source-discovery status

- Complete principal index crawl: **855 link occurrences and 855 unique normalized article URLs**; 0 exact link duplicates, 0 raw article identifiers missing from anchor extraction.
- Section split: Temporal 193, Sanctoral 450, Commons 61, local propers 63, votive/requiem 17, ritual 3, Office 16, reference/study documents 52.
- First metadata scan window: articles #0–199, **200/200 fetched and inspected**, zero request failures; all 200 have h2 page headings, 196 have h3 “Commentaires”.
- The first window includes **193 Temporal and 7 Sanctoral** article pages; it is not random or representative of all 855. No work-level copyright or canonical edition certification is implied.
- Author name substring detector saw “Guéranger”, “Schuster”, “Parsch” on all 200; because it is a *whole-page mention heuristic*, **not** author/work ownership evidence, it must not be promoted as 600 individually verified commentary units. At least manually sampled Advent Monday has all three commentaries with distinct blocks.
- Four pages lacked h3 “Commentaires”: `a0825_ancien` (Monday third Advent week), `a0826_ancien` (Tuesday third Advent week), `a0831_ancien` (Thursday fourth Advent week), `a0134_ancien` (Quinquagesima Sunday). These are first-review exceptions, not missing source proofs.
- At least seven pages contain “Messe 1” and “Messe 2” h3 headings; five include “Messe 3”. **Mass-identity mapping must not assume one article = one Mass formulary**.

## Editorial exceptions and comparisons

1. 24 inspected h2 headings in the first 200 explicitly signal older editions or pre-1955 status on a conservative matching rule. Index-wide pre-1955 word scans indicate further instances; do not infer edition from site slug.
2. `a0030_nouveau` Holy Saturday source-index display is `Sam. saint · ap. 1955`. An initial human pilot had incorrectly written “after 1951”. Corrected in the pilot dataset; no article content was touched.
3. Abbreviated index labels “Lun.”, “Mar.” and several octave/Ember labels are ambiguous without season or parent-week; **use inspected h2 heading** (e.g. `Lundi de la 1ʳᵉ semaine de l’Avent`) as the initial disambiguation field, then map to canonical liturgical identity.
4. Existing `data/research/mass-fr-gueranger-actor-posture-evidence-batch02.v1.json` already covers historical Guéranger gesture evidence from a separate 1885 Mass commentary. This source mining should not re-author that evidence or treat his earlier rubrics as 1962 norms.
5. Site documents include 1960 precedence and occurrence/concurrence tables, but their source images are not textually certified by this metadata pass. Review any image-encoded tables from original material before interpreting an application-specific rule.

## Non-publication and ownership

These are source URL/heading/HTML fingerprint observations, **not** certified Mass texts, rubric conformance, scriptural parallel pairs, translated quotations, or permissions to reproduce hosted commentaries. The separate Ordo Missae 1962 audit owns any reader changes. No live reader cardinality is assumed.

## Next execution

Four read-only Github Actions matrix jobs launched for windows 200–399, 400–599, 600–799, 800–854. The combined 855-window artifact will require review and a separate manual commit to the canonical research branch; repository CI disallows routine workflow writes. Do not report 855 articles inspected until all four complete, merge succeeds, and failure counters are checked.
