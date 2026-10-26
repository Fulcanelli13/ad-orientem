# Ad Orientem Customs — cohort 2, three review-only Calendar subjects

**Date:** 26 October 2026  
**Status:** RESEARCH / QA PREVIEW ONLY — unpublished, no human editorial approval, no canonical IDs.

## Branch ownership and dependency

This is a **stacked draft** based on [PR #1642](https://github.com/Fulcanelli13/ad-orientem/pull/1642), which holds the **two independent** Epiphany and Candlemas candidates and remains unmerged. The **single historical research source of truth** is the five-article corpus in [PR #1610](https://github.com/Fulcanelli13/ad-orientem/pull/1610), specifically `data/customs/master/customs-calendar-five-final-copy-release-candidates.v1.json` at frozen source commit `bcd82d9b42e16ad2c235ca1958de457e605a8813`. Do not continue running a second source-mining pipeline here.

Only the three remaining unit IDs are projected into `src/calendar/customs-cohort2-review.js`: `CU-REVIEW-002`, `CU-REVIEW-003`, `CU-REVIEW-005`.

## Calendar rules ready for internal testing

| Research unit | Explicit visitor/local scope | Date context from existing 1962 engine | Release boundary |
| --- | --- | --- | --- |
| Easter light home | `AT_LOCAL_CUSTOMS` | Existing `v384Dates(year).holySaturday` | Optional home practice, only where parish permits safe transfer; not a new rite or food blessing |
| Seville Cathedral Seises | `SEVILLE_CATHEDRAL_ONLY` | Existing `v384Dates(year).corpus` **and** 8 Dec Immaculate Conception | **One** historical custom, two feast connections. No national availability, no synthetic service time |
| Polish Corpus herb wreaths | `PL_LOCAL_CUSTOMS` | Existing `v384Dates(year).corpus` for contextual discovery **only** | Actual wreath blessing may occur on a locally observed later day; **never** synthesize a Roman 1962 octave/event schedule |

**Security and editorial gate.** Default `calendarCohort2ReviewForDate(date)` returns **no results**. An explicit internal `preview: true` and exact named scope are both required. The review module is **not imported** by the production Calendar or Home, and it assigns **no** canonical `custom_id`. It does not query geolocation, store an app preference, or infer a local parish event.

The bilingual article fields are copied **only** as a testable release projection from the frozen research master. Their provenance stays in PR #1610. All three retain `RESEARCH-` identifiers, false approvals and nonpublishing statuses. Existing Calendar UI, old published records, and My Customs remain unchanged.

## Provenance to retain

- Easter light: [Archdiocese of Vienna, *Osterlicht*](https://www.erzdioezese-wien.at/pages/inst/21452566/service/kirchenjahr/osterfestkreis/osterlicht), historical Weiser 1958 p. 217. The archdiocesan source describes the custom in many Austrian regions, not all parishes.
- Seises: [Seville Cathedral, *La danza de los Seises*](https://www.catedraldesevilla.es/la-danza-de-los-seises-un-tesoro-vivo-en-la-catedral-de-sevilla/), [2026 Carnival notice](https://www.catedraldesevilla.es/comienza-el-triduo-de-carnaval-como-preparacion-para-la-cuaresma/), Weiser 1958 p. 265. Date-specific notices do not establish a perpetual time.
- Wreaths: [Polish Ministry of Culture](https://www.gov.pl/web/kultura/uroczystosc-bozego-ciala--tradycje-i-obyczaje) and [Łuczaj 2012 (PMID 22575705)](https://pubmed.ncbi.nlm.nih.gov/22575705/). Ministry says wreaths may be blessed on the **final day** of local customary celebrations; vernacular *oktawa* does not restore the abolished universal 1962 liturgical octave.

## Actual promotion gates (not yet done)

1. Complete source-by-source editorial checking and human acceptance of all EN/FR fields, regional scope, ecclesiastical/ritual status and date associations. This **cannot** be inferred from a green test.
2. Assign three genuinely new canonical IDs only after reconciling SOT-07, PR #1610 and release #1642; reserve historic IDs (e.g. `DOM-014`).
3. Determine **how the user chooses or discovers local context** inside the existing Calendar without treating country/language as proof of a practice. No standalone Customs Atlas, no second Calendar.
4. After authorization, wire only accepted records into the existing `calendarCustomArticle` catalogue and appropriate regional/contextual recommendation surfaces. Keep Seises as one record with two date associations; do not automatically create a Polish octave.
5. Add the real browser Calendar and Home screenshots, independent release gate and exact-head CI. Finally review the stacked PR after #1642 merges. No image reuse is implicitly approved.

## Technical acceptance

`node tests/customs-cohort2-review.mjs` tests 2026, 2027 and 2030 for twelve date/scope cases, two languages, invalid dates and eight following Corpus days. It ensures three sourced bilingual dossiers are present for QA, **zero production Calendar leaks**, zero automatic locality or Mass service assumptions and zero editorial signatures.
