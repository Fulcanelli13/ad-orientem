# ICRSP France — source-discovery pilot B01 (25 October 2026)

Owner: [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665). **Research evidence only, not production.**

Source: https://icrspfrance.fr/textes-liturgiques.php

## Evidence completed

- 27 distinct article pages opened and URL/title checked across Temporal, Sanctoral, Ritual and reference documents. Manifest: `data/source-text/icrsp-france-discovery-pilot.v1.json`.
- The **First Sunday of Advent** (`a0088_ancien`) contains distinct Guéranger (*L’Année liturgique*), Blessed Cardinal Schuster (*Liber Sacramentorum*) and Pius Parsch (*Guide dans l’année liturgique*) commentary alongside Latin/French Mass propers. Its commentary discusses Santa Maria Maggiore as station, Romans 13:11–14 and Luke 21:25–33. These are source-anchored *candidate* relations to Calendar, Mass Explorer, Sacred Places and Scripture; they are **not yet imported**.
- **Christmas** (`a0096_ancien`) includes the three Christmas Masses and commentary sections attributed to all three authors. Treat as three distinct proper witnesses under one liturgical date.
- **O Sapientia** (`a0833_ancien`) includes Guéranger on the Great O Antiphons and local historical variants. Attach any approved research to the existing Calendar, not a new Office module.
- **Candlemas / Purification** (`a0146_ancien`) has historical explanations, procession material and typological references (burning bush; branch of Jesse). These are leads for Calendar customs and the separate Biblical Parallels compendium, *not* assertions of universal 1962 rubric.
- **Pentecost Vigil after 1955** (`a0165_nouveau`) is a separate witness from the other vigil pages; it gives Latin/French proper texts and describes the loss of the preceding six prophecies and baptismal blessing. Edition conformity must be judged against 1962 authorities, not the site's labels.

## Key anomaly — edition fail-closed

`a0010_nouveau` has the page heading “Dimanche des Rameaux avant 1955”. Therefore `_ancien` and `_nouveau` are site-internal identifiers, **not** edition classifiers. Entries labelled pre-1955 are historical source records. Entries labelled post-1955 still require independent collation with the 1962 books.

## Existing canonical destinations (no new runtime)

| Source domain | Existing data owner / audit starting point |
| --- | --- |
| Temporal/Sanctoral and feast rules | `data/calendar/`, 1962 transfer and commemorations registers |
| Bilingual Mass propers and rites | `data/mass/`, `data/calendar/traditional-mass-formulary-review.v1.json` |
| Authentic commentary and quotation provenance | `data/source-text/`, `data/reference/`, existing Mass Explorer/formation evidence |
| Saints and local propers | `data/saints/`, Calendar particular-propers review |
| Customs and blessings | `data/customs/`, contextual Calendar customs owner |
| Scripture cross-links | `data/scripture/`, canonical parallels owner |

**Separate owner:** the existing Ordo Missae 1962 line-by-line correction pipeline owns Mass-reader/cue fixes. This programme sends source evidence to that owner; no reader changes here.

## Next execution gates

1. Crawl the **entire index** and report (a) link occurrences, (b) unique normalized article URLs, (c) duplicates, (d) unknown/invalid links. Earlier 953-link category estimate has not been independently deduplicated or completion-certified in this batch.
2. Sequentially inspect article metadata in cohorts of 100–200, within robots/site policy and sensible rate limits. Preserve URL, HTML fingerprint, article heading, section headings, named authors, liturgical labels; record errors separately. Do not store/re-publish full commentary or third-party translation under the current rights status.
3. Reconcile indexed authors/works and article topics with existing canonical records. Track `EXISTS`, `NEW_EVIDENCE`, `CONFLICT`, `HISTORICAL_VARIANT`, `NEEDS_EDITION_VERIFICATION`.
4. Issue source-backed change candidates to domain owners; no automatic promotion or reader/UI changes.
5. Track unique URLs discovered / metadata inspected / edition adjudicated / canonical matches / integrated separately; never equate index links with completed integrations.

## Rights and quality locks

- `NOT_CLEARED_INDEX_AND_LINK_ONLY` by default. Guéranger's underlying original and the web-hosted modern French transmission/translation have separate rights questions; Schuster and Parsch translations similarly require checking.
- Modern historical commentary can be useful *without being normative 1962 rubric*.
- Do not fabricate author quotations, attribute historic commentary to the Fathers without checking its embedded citations, or import a synthetic paraphrase as published commentary.
- Preserve the existing 48-card reader and current Calendar visual design.
