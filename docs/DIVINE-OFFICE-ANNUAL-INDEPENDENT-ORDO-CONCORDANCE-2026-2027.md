# Roman Divine Office — independent full-year calendar concordance, 2026–2027

**Research-only comparison. Public Prayer authorization remains unchanged.**

## Why this audit is separate from text extraction

Ad Orientem's merged [annual source generator PR #2738](https://github.com/Fulcanelli13/ad-orientem/pull/2738)
and [source-anchored private reader PR #2751](https://github.com/Fulcanelli13/ad-orientem/pull/2751)
have generated and parsed the Latin **Roman 1960** Divinum Officium for
**5,840 / 5,840 Hours** (730 dates × 8 canonical Hours). The underlying
generator is **not independent evidence of its own calendar selections**.

The [FSSPX Ordo public API](https://ordo.fsspx.org/en/export/api) exposes
a complete year in one documented JSON export: each date includes its
principal celebration, rank, transferred status, commemorations and
separate evening Vespers precedence. Two HTTP requests suffice for
2026 and 2027. They replace manual weekly copying and reduce primary
Office source research to a finite exception queue.

**Important authority distinction:** the external Ordo describes the
**1962 Roman Missal calendar**. Its date and celebration assignments
are useful independent Roman 1960/1962-calendar witnesses, but do not
independently certify the full **1961 Roman Breviary** texts, special
Compline Psalms, hymns, conclusions, First-Vespers/Second-Vespers
rubrics, locality or edition-sensitive variants. The two calendars
might legitimately differ in their content and categorisation.
Any disagreement is a *review request*, never an automatic
correction or proof that either source is wrong.

## Data and replay procedure

- Main exact-source run:
  [#42615804676](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42615804676)
  on merged `60305d123806f318838d4ed1358168a793ceb179`,
  with private reader artifact
  `office-1960-la-2026-2027-private-reader` (90-day retention).
- Pinned Divinum Officium source revision:
  `126a07f91ede04664108abb6fb20ace3f4de14b9`.
- Independent raw witness:
  `https://ordo.fsspx.org/api/v1/export/json?year=YEAR&lang=la&mode=civil&congregation=`.
  Explicitly request no congregation; omit any local/diocesan source.
  Validate returned metadata; **fail** rather than silently accept
  FSSPX-house propers or a local diocese as universal.
- Workflow: `.github/workflows/office-independent-ordo-concordance.yml`
  (separate from the expensive annual source generation). It downloads
  the previously source-verified 730-day private research reader using
  read-only GitHub Actions permissions and obtains the two independent
  complete-year JSON witnesses. All source requests are public GETs;
  no API key, paid service, contacting owners or website deploy.
- Script: `tools/office-bulk/independent_ordo_concordance.py`.
  Validates 365 unique ISO dates per year and 730 *eight-Hour*
  Divinum source records; hashes both external raw JSON files.
  The complete source-year archive is checked for the exact upstream
  SHA and nonpublication flag on every Hour.

## Independent checks on all 730 dates

1. **Principal rank:** parse the original source XHTML first line's
   Roman `I/II/III/IV classis` when explicitly present. Compare
   against the independent calendar's `rank`. A missing numeral
   is *unknown*, not an inferred rank. Different ranks are retained
   as `INDEPENDENT_RANK_DISAGREEMENT_REVIEW`.
2. **First/Second Vespers:** on each civil date, compare whether
   the Divinum Office's **Matins** principal title differs from the
   **Vespers** title with whether the independent Ordo specifies a
   different celebration for that evening. The independent
   `vespers.id` must match the following day's
   `celebration.id` if a successor exists in the 2026–2027
   dataset; changes/missing witnesses are flagged without guessing.
3. **Vespers–Compline continuity:** a mismatch in the two
   source-generated Office headings is separately flagged. This
   doesn't imply Compline must have the same Psalm plan as Vespers.
4. **Commemorations and transfers:** the independent ordo's dated
   commemorations and transfers are retained as review context;
   Vespers commemorations are explicitly queued when supplied.
   No unverified commemoration is added to the Hours.
5. **Exceptional source forms:** 2026/27 Triduum and All Souls
   source-layout anomalies remain flagged; they are not suppressed
   by apparent calendar agreement.

The report records the exact source Latin title, original XHTML
chapter hashes, external principal and Vespers celebration IDs,
independent raw JSON SHA-256, and a typed disposition for every
date. It produces a **730-date concordance** and a much smaller
`research_queue` containing the dates with source differences,
special forms, rank differences or precedence questions.

Outputs (`concordance.json`, `summary.json`) remain **90-day
GitHub Actions research artifacts only**. They are not copied into
the curated GitHub Pages tree, nor used to enable public routing
or override Divinum Officium's text automatically.

## Explicit open gates

**A date is not fully liturgically certified merely because the
two calendars agree.** The complete printed 1961 Breviary and
1960 rubrics still govern liturgical adjudication, especially
Holy Week and Tenebrae, Easter and Christmas Octaves, the feast
of the Holy Family, Marian conclusions, transferred feast
concurrence, and unusual Office of the Dead arrangements.

A later release must reconcile the finite discrepancies, confirm
source alignment of named psalms/antiphons/collects and approve
rights, language and mobile reading focus. Only then can a
separate source-certified annual dataset feed the production
Prayer reader. **The current public Office is still the original
44 individually certified Latin Compline dates.** All other Hours
remain private.

GitHub Actions + GitHub Pages only; no Vercel, fees or paid
external infrastructure.
