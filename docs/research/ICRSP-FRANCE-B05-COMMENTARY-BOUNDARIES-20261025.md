# ICRSP France Batch 05 — commentary provenance extraction (25 October 2026)

Owner [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · draft [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## Problem solved

First metadata scan correctly identified 783 article pages with an H3 `Commentaires` section, but its old whole-page author string search marked Guéranger / Schuster / Parsch on **all 855 pages**. This was site-wide string contamination and **never certified 855 × 3 commentator texts**.

Structural inspection of six source pages with [Actions run 40203825779](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40203825779) identified exact source markup:
- All confirmed commentary work panels use `details.pf-cate-cadre`.
- The bibliographic label occurs in `details > summary` and repeated inside the panel body at `p.mx-comm-titre`.
- The top-level `h3 Commentaires` bounds eligible commentary panels. Raw HTML author substrings outside it are explicitly excluded.
- `Présentation`, `Office du jour` are valid *unattributed or editorial content categories*, **not Guéranger/Schuster/Parsch works**.
- A document such as `Calendaria Particularia (1973)` returns zero source-author blocks, despite the old whole-page detector false positive.

## Distributed 15-page pilot — verified, 0 failures

[Actions run 40204187195](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40204187195), artifact `icrsp-commentary-pilot-15`:
- 15 representative pages (Temporal, Sanctoral, Commons, local propers, votive Mass, reference).
- 14 pages with H3 `Commentaires`; 14 with actual section panels.
- 54 distinct commentary panels (not double counted despite duplicated label display).
- 32 exact bibliographic panels attributed by their headings to one of three core families: Dom Guéranger's *Année liturgique*, Blessed Ildefonso Schuster's *Liber Sacramentorum*, Dom Pius Parsch's *Guide dans l'année liturgique*.
- Remaining 22 panels include unattributed `Présentation` / `Office du jour` and additional named works requiring cataloguing.
- St Bernard's source page `a0414_ancien` contains a label for **Benedict XVI catechesis (21 October 2009)**. This can be an external reference for the Saints/Formation owner but is neither a 1962 rubric nor a rights-cleared text.
- The votive Mass of St Peter and St Paul `a0588_ancien` includes a label for **Aurelius Clemens Prudentius, *Peristephanon***. It is a literary/ancient source lead; do not automatically convert it into a verified patristic citation.
- Commons include specifically labelled Parsch commentary panels; commentary is not limited to the Temporal and Sanctoral.

## Attribution and licensing contracts

For every block, store source article URL/ID, section ordinal, panel summary label, repeated body-title label and agreement state, proposed *work family*, character count only, HTML SHA256 and section occurrence. **No article paragraphs, Latin/French texts, images, or modern translations are bundled.**

`EXPLICIT_WEBSITE_WORK_LABEL` is only proof the host labels a block as a work. It is **not** proof of quotation accuracy against original printing, translation rights, canonical historical source locator or 1962 rubrical applicability.

`OTHER_OR_ANONYMOUS` must remain a visible review queue. Do not automatically assign unattributed editorial notes to historic authors; do not discard explicitly named non-core works.

Current rights state: `NOT_CLEARED_LINK_AND_METADATA_ONLY`. Approved destinations can use source links and original bibliographic titles; any text reuse needs independent rights and source-edition adjudication.

## High-volume execution

Read-only [Actions run 40204497782](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40204497782) uses the **verified 855-index metadata** artifact as input and fetches only pages with previously confirmed H3 `Commentaires` headings. Four disjoint page-index windows at 5-second minimum per worker. A failure or mismatch fails the aggregate job.

Publication gate remains closed. The aggregator requires exactly 783 eligible pages, 783 unique positions, source identity matches, zero fetch errors, and all rights/edition fields blocked. Output is a temporary Actions research artifact; **not automatically committed or merged**.

## Existing canonical owners

- `data/calendar/`: date, rank, principal traditional feast, particular proper (never auto-promote 63 local proper records).
- `data/mass/` and the separate 1962 Ordo Missae audit: canonical Mass text and priest cue corrections (no edits here).
- `data/saints/`: saint editorial biography and documentary evidence.
- `data/customs/`: calendar-attached historical customs.
- `data/reference/` & `data/source-text/`: witness records, author/work identity, rights and source provenance.
- `data/scripture/`: verified scriptural echoes/typology kept separate from Historia Salutis narration.

The next editorial release gate is work-family counts followed by exact canonical-ID crosswalk and priority-gap collation, not wholesale commentary import.
