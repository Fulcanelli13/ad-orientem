# Novena — original printed-page verification dispositions

**29 October 2026 · Source-backed editorial proof.** This record closes the gap between *PDF text similarity* and *actual visual comparison*, without mistaking one for the other. The subject is **72 English proper day-prayer bodies** in eight programmes; their preparatory prayers, meditations, common prayers and historical/French editions are separate objects of proof.

## What has now been examined

The complete printed prayer bodies were read against the photographed pages in the previously acquired [four-book PDF campaign](./NOVENA-62-ORIGINAL-PRINT-VISUAL-CAMPAIGN-20261029.md). During this pass we checked every word in each of **26 entire proper prayer bodies**; capitalization, punctuation and line-break normalization are noted instead of falsely claimed to be facsimile-identical.

| Printed book | Proper day prayers with the whole printed word sequence visually checked | Exact printed page labels | Caution |
|---|---:|---|---|
| Callan/McHugh, *Blessed Be God* | **18/18** | Christmas days 1–2 p **292**, 3–6 p **293**, 7–9 p **294**; Pentecost days 1–3 p **296**, 4–7 p **297**, 8–9 p **298** | **The accessible physical copy contains post-1933 material.** Do not certify it as a 1925 first edition merely because of its original copyright date. |
| Moran, *The Catholic Prayer Book* (1883) | **0/18** | Individual PDF windows preserved for all 18, but no blanket word-sequence acceptance | Earlier text-layer matches alone do not constitute full visual inspection. |
| Hammer, *Mary, Help of Christians* (1909) | **6/27** | Annunciation day 8 pp **111–112**; Seven Sorrows day 6 pp **126–127**, day 7 p **128**; Assumption day 1 pp **134–135**, day 5 p **143**, day 8 pp **148–149** | Decorative initials and words divided between pages account for the former low PDF-text-layer scores. **No unsupported source-text rewrites.** |
| Redemptorist *Manual of the Purgatorian Society* | **2/9** | Holy Souls day 3 p **203**, day 7 p **207** | These two proper prayer bodies match the photographed text after capitalization/punctuation normalization. The scanned copy has **1894 copyright and a 1907 imprimatur**; this does not certify an 1894 first printing. |
| **Total** | **26/72** | **18 distinct photographed source pages directly used in these full-body checks** | **0 original first-edition certificates, 0 complete-book/whole-devotion certificates.** |

The [per-prayer evidence register](../../data/pray/original-print-72-body-visual-proof-20261029.v1.json) records the exact original-book SHA-256, day identifier, printed page label, actual PDF zero-based page indices, source render filenames, positive/held disposition, and explicit negative certifications for **all 72 day bodies**. It is tested by [the new source integrity gate](../../tests/pray-72-original-print-visual-proof.mjs).

### Scope and safeguards

- **26 fully checked word sequences** means: the *whole proper English prayer text*, start to finish, was compared directly with its printed source photograph. It does **not** claim letter-perfect diplomatic reproduction of printer capitalization, punctuation or line wraps.
- All nine Christmas and all nine Pentecost bodies are confirmed in the **accessible later printed copy**, not proven to originate verbatim in Callan's first 1925 impression.
- **Six Hammer prayer bodies** were similarly checked against the 1909 source page photographs, with no verified missing or variant prayer words.
- **Holy Souls days 3 and 7** were checked as complete printed proper prayer bodies. The already corrected **seven other Holy Souls** days are correctly retained as **wording corrected from page images but not promoted to completed all-word visual proof**, so that correcting one historical phrase is not misrepresented as a complete page collation.
- The five previously reviewed **Hammer OCR-only exception pages** remain in a non-certified reviewed state. Their layout/initials explain the automated discrepancy, but a prior OCR-exception screening was not the same as a complete print-body sign-off.
- The corrected **Holy Souls day-four** printed page extent is PDF zero-based indices **203–204**; an early automatic two-page window ended too soon.
- The wrong **Christmas page 268** citation was corrected earlier to **page 292**. This phase pins precise individual day-to-print-page labels.
- Printed historic indulgence language is evidence of *historical practice*, not current grants or present-day conditions. No modern indulgence was certified or surfaced.

## Remaining verification population — 46

| Cohort | Unverified proper prayer bodies | How to finish |
|---|---:|---|
| Moran 1883 | **18** | Check the complete 9 Immaculate Conception and 9 St Joseph prayers from the already-rendered printed pages; resolve any substantive wording disagreements |
| Hammer 1909 | **21** | Compare the other daily prayers, including the five earlier decorative-initial OCR exceptions; meditation and practice sections are independently preserved and must not be conflated with proper prayer text |
| Redemptorist 1894/1907 | **7** | Full line proof of the seven already source-corrected proper prayer bodies; preserve the correction overlay and donor source |
| Callan accessible later edition | **0** | Word-sequence proof complete for this *copy*, but an authenticated 1925 first-impression check remains a separate historical edition task |
| **Total** | **46** | **One consolidated proof campaign** rather than repeating book discovery or counting token overlap as visual inspection |

The existing [62-prayer side-by-side visual bundle](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40881455788/artifacts/12900457415) and [ten-exception source-page bundle](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40872727022) contain the relevant page photographs. Their GitHub Actions retention is temporary; the complete source URLs and PDF SHA-256 fingerprints, on-demand original-PDF render scripts and per-prayer printed page coordinates are permanently in Git. No paid storage and no bulk unauthorized source rehosting are necessary.

**Production impact:** metadata/provenance ledger and source tests only. No prayer words, French translations, liturgical cards, devotion navigation, completion progress or user preferences change in this release. Source-specific wording corrected in prior PRs remains untouched.
