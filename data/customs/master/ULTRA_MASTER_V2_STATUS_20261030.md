# Ad Orientem Customs Ultra-Master v2 — verified coverage and integration gate

**Research snapshot:** 30 October 2026. **Publication changes:** zero.

## Main finding

The existing ultra-master has **465 registry rows**: **57 master identities** (36 published, 3 context-only and 18 not approved) plus **408 provisional action or variant groups**. Its source-evidence index contains **3,703 observations**, **not** 3,703 distinct customs.

A pointer-by-pointer audit resolved **3,703 / 3,703 original JSON pointers**, with zero observed source-ID mismatches. Each of the 408 provisional groups has original observation evidence; there are **409 explicit group→observation edges** involving **408 distinct evidence observations**. That leaves **3,295 observations** without a **direct** link into the 465-record registry. Those 3,295 observations remain evidence, not newly discovered unique Catholic customs, and can include repeated action descriptions, festivals, original rite material, folklore, historical context and excerpts of the same author.

The published catalogue remains **36**; the research register does not license new Calendar publications.

## Existing research is not being discarded

The authoritative corpus remains at:
- [3,703 observation index](./customs-ultra-master-observation-index-3703-20261030.v1.json)
- [v2 complete reference crosswalk](./customs-ultra-master-v2-3703-reference-crosswalk.v1.json)
- [v2 465-record identity register](./customs-ultra-master-v2-identity-register-465.v1.json)
- [v2 indulgence audit](./customs-ultra-master-v2-indulgence-work-audit.v1.json)
- [408 research disposition ledger](./customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json)

No original source observation was deleted or converted automatically to a canonical custom. The 57 master identities' original source-attestation IDs belong to their own namespace and must not be falsely matched by name to the 3,703 observation IDs.

## Source-family coverage (actual index, not a new customs count)

| Evidence source bucket | Indexed rows | Direct group links | Evidence-only rows |
|---|---:|---:|---:|
| weiser_handbook_1958_original | 568 | 348 | 220 |
| weiser_handbook_granular_details | 340 | 60 | 280 |
| external_source_observations_pitre_original_1900_new_ocr | 293 | 0 | 293 |
| external_source_observations_mueller_kelly | 204 | 0 | 204 |
| external_source_observations_stokes | 198 | 0 | 198 |
| external_source_observations_chaney | 170 | 0 | 170 |
| external_source_observations_spain_elche_berga_caravaca | 145 | 0 | 145 |
| external_source_observations_portugal_pci | 140 | 0 | 140 |
| external_source_observations_three_family_books | 133 | 0 | 133 |
| external_source_observations_catholicculture_excerpts | 132 | 0 | 132 |
| external_source_observations_pitre_original_1900_wave05 | 132 | 0 | 132 |
| external_source_observations_pitre_original_1900_ocr | 129 | 0 | 129 |
| external_source_observations_wff_hynes | 125 | 0 | 125 |
| external_source_observations_italy_local_feasts_wave02 | 114 | 0 | 114 |
| weiser_family_1956_full_scan | 111 | 0 | 111 |
| external_source_observations_italy_four_unesco | 110 | 0 | 110 |
| external_source_observations_pitre_palermo_1950 | 110 | 0 | 110 |
| external_source_observations_pitre_original_1900_wave04 | 105 | 0 | 105 |
| external_source_observations_italy_sicily_holy_week | 96 | 0 | 96 |
| external_source_observations_france_sanch | 86 | 0 | 86 |
| external_source_observations_france_pci_brittany | 71 | 0 | 71 |
| external_source_observations_mcloughlin | 70 | 0 | 70 |
| external_source_observations_france_pci_besta | 56 | 0 | 56 |
| external_source_observations_pitre_original_1900_wave09 | 51 | 0 | 51 |
| external_source_observations_pitre_original_1900_wave08 | 8 | 0 | 8 |
| weiser_handbook_1958_page_addenda | 6 | 0 | 6 |

Totals: **3,703** observations, **408** with at least one direct group link, **3,295** evidence-only for the first identity-relation pass. The 718 Pitrè 1900 observations are distributed over several waves; an additional 110-record Palermo retrospective bucket must not be double-counted or mislabelled as newly certified independent practices.

The direct 3,703-row index has **1315** printed-page entries, **636** scan-page locators and **992** explicit URL fields. Source metadata in the original linked records may contain other folio and online-line references; missing *index fields* are not necessarily missing source evidence. An indexed page number does not prove an independent page-image inspection.

## Indulgence investigation is a distinct register

The currently indexed modern normative work seeds are **7** with **8 conditional cross-references** to canonical Customs. They are not a complete exhaustive Enchiridion catalogue and do not grant an indulgence to the custom as a whole. A customary act qualifies only if it is itself the precise indulgenced *work* with its applicable conditions.

Historical primary-grant cases requiring retrieval:
1. **St Joseph first-Wednesday devotion** — Weiser 1958 p. 28, reported 1921 association.
2. **Breton pardons** — named local chapels, valid work, and confession/Communion conditions in a regional heritage source.
3. **Caravaca Vera Cruz** — original papal jubilee grant, eligible pilgrimage works and specific years.
4. **Frauendreißiger** — reported 1780 Pius VI privilege at a Bavarian shrine; original grant not yet retrieved.

Five original source-observation labels explicitly mention indulgences; their original pointers and status are preserved in the v2 grant audit. **Zero historical original-grant instruments and zero newly asserted public indulgences are verified.** A historical concession may not be presented as a present-day right without analysis of the post-1967 reforms.

Normative official references:
- 1999 *Enchiridion Indulgentiarum* (fourth edition) — https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html
- Paul VI, *Indulgentiarum doctrina* (1967) — https://www.vatican.va/content/paul-vi/en/apost_constitutions/documents/hf_p-vi_apc_01011967_indulgentiarum-doctrina.html

## Bulk processing order

1. **3295 evidence-only relation cases**: systematic bulk screening of 150–300 records per source bucket; propose existing owner / variant / different-module / historical context / unresolved, never infer unique identity from a lexical resemblance.
2. **Original witness verification**: precise folio or web-line checks for high-value and conflicting claims, preserving cross-book dependency and author-attributed folklore.
3. **Historical indulgences**: retrieve original decree and specific conditions for the four named cases; screen the full source content for additional claims, not only title/label keywords.
4. **Editorial identity approval**: reconcile all 465 rows, document regional/global reach without converting regional heritage into universal obligation.
5. **Calendar and publication**: feed only approved material into the existing Calendar/Learn/My Customs architecture; PR #2058 remains downstream and parked.

The existing 408-group expert ledger remains intact. This v2 pass advances **referential integrity and genuine gap reporting**, not human editorial source certification, independent verification of all source images, or the number of public articles.

**No separate Customs Atlas. No paid infrastructure. No fabricated indulgences or local events.**


## 30 October — bulk evidence screen wave 01

The first 200 of 3,295 evidence-only records were examined against their original source-record fields: 111 Weiser *Religious Customs in the Family* and 89 Weiser 1958 *Handbook*. Every original pointer resolved. This is **source-native first-pass semantics**, not an original-page image read or final Catholic identity adjudication.

Preliminary source-type routing:

| Route | Count |
|---|---:|
| Potential household/community practice | 115 |
| Rite, prayer or sacramental ownership review | 39 |
| Reported folklore / historical context | 23 |
| Author's proposal, not automatically a historical custom | 22 |
| Indulgence-specific source review | 1 |

**200 / 3,295 first-pass source classifications complete; 3,095 remain in the 17-wave source queue.** Zero new canonical identities, zero primary-grant validations, zero new published Customs. [Wave 01 audited 200-record file](./customs-ultra-master-v2-wave01-200-source-scope-screen.v1.json).
