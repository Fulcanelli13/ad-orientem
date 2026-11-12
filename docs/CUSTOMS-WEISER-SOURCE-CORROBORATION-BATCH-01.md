# Weiser — independent corroboration and production disposition, Batch 01

Date: 20 October 2026. Source: Francis X. Weiser SJ, *Handbook of Christian Feasts and Customs* (1958). This report is **research/editorial**: no content has been published to Ad Orientem through this branch.

## Accounted-for queue, not a new census

The 568-observation / 28-chapter full research inventory is unchanged, as are the preliminary 85 COVERED, 56 ENRICH, 131 CANDIDATE, 145 REGIONAL, 117 HISTORY_ONLY and 34 EXCLUDE counts. The separate 30-item selected queue now has **12 bounded observations corroborated by external Catholic/institutional/ethnographic sources**, **4 existing canonical owner links established from main**, **1 owner established solely in the unmerged blessings PR #1512**, **2 explicitly excluded instruction types**, and **11 requiring further evidence or editorial resolution**. The buckets are mutually exclusive for scheduling; one corroborated observation may enrich an existing owner.

The machine-readable proof register is `data/customs/research/weiser-source-corroboration-batch-01.v1.json`. Every new source entry has a URL, issuer, exact claim supported, geography and a remaining gate. The original Weiser inventory and 63-row SOT-07 are not rewritten.

## First production set — one existing app owner for each experience

| Weiser ID | Experience | Owner and tentative editorial decision | Source limitation |
| --- | --- | --- | --- |
| WEI58-23-008 | Baptismal patron's nameday | Saints → optional household-calendar reminder, not a second liturgical feast | Requires explicit user association of baptismal patron with an appropriate feast |
| WEI58-23-006 | Fête patronale | Customs Atlas/Calendar context, local patron metadata only | Chantelle is a documented French example, not a universal date |
| WEI58-24-005 | Assumption Marian procession | Calendar regional tradition card / Special Days may link to existing *explicitly selected* procession | A 15 August date alone must never switch the Mass reader to procession mode |
| WEI58-24-014 | Assumption maritime blessing | Customs Atlas regional evidence; no mass-reader change | Actual Yport 2025 event, not a universally available blessing |
| WEI58-26-019 | Wypominki for departed | Enrich DEAD-003, with Polish regional note | Local names are private; no public name ingestion or presumption of universal Mass formulary |
| WEI58-26-022 | Soul breads/alms | All Souls charitable historical context only | Surveyed Polish cases are supported; French distribution remains unproved; no contemporary availability claim |
| WEI58-27-019 | St Joseph table and poor | Saints / Customs Atlas optional charitable practice | March 19; Sicilian origin and Catholic diaspora examples; not equivalent to priestly food blessing |
| WEI58-27-023 | St Anthony's Bread | Saints / Customs Atlas charitable practice | Toulon 1890 is documented by Franciscan shrine; miracles/guaranteed favours excluded |
| WEI58-27-026 | Invoke St Anthony for lost objects | Link existing Saints/Pray owner, no duplicate prayer or novena | Franciscan devotion is witnessed; historical psalter anecdote remains uncertain |
| WEI58-27-012 | St Patrick ribbon crosses | Saints / historical household custom in Irish context | National Museum records historic variants and decline; not a current universal practice |
| WEI58-28-011 | St Christopher vehicle blessings | Saints / optional Customs Atlas context | 2026 French parish events confirmed; ministerial blessing only where actually provided |
| WEI58-28-020 | St Nicholas visit to children | Saints / family custom in northeastern French context | Diocese of Metz and Strasbourg support regional traditions; folklore is not saint biography |

The 12 rows are **corroborated facts**, not independent legal permission to publish exact ceremonial or blessing texts; the separate 1962 Roman Ritual owner is still authoritative on rites. A modern parish notice does not establish a 1962 rubrical instruction.

## Do not duplicate

- `WEI58-25-008` → existing `DOM-011` Candlemas home candle. Existing Calendar/reader owns Candlemas ceremonial rubrics.
- `WEI58-26-010` → existing `DEAD-001` cemetery prayer. Enrich instead of second memorial card.
- `WEI58-26-013` → `DOM-011` and `DEAD-003` contextual cross-link only. Do not create new prayer content from the simple candle-use observation.
- `WEI58-27-003` → existing `BLSS-001` St Blaise throat blessing.
- `WEI58-24-008` → `BLSS-002` currently exists **only** in open PR #1512. Do not copy or publish it twice. PR #1512 also separately owns `BLSS-003` and `BLSS-004`.

The **two existing nonpublication exclusions** `WEI58-26-029` (Breton graveside milk folklore) and `WEI58-23-021` (pseudo-relic / amulet claims) remain rejected as instructions. All seven original protected HOLD/REJECT records stay untouched.

## Unresolved claims — don't create false locks

| IDs | Real outstanding question |
| --- | --- |
| WEI58-24-013 | French livestock blessing has a contemporary 2024 Massif Central diocesan witness, but that is **not proof of the specific Alpine/Assumption variant** Weiser describes |
| WEI58-25-012 | Candlemas crib-removal household tradition needs a reliable independent family-practice source |
| WEI58-25-024, WEI58-25-025 | The 8 September pilgrimage at Notre-Dame-des-Raisins near Brouilly is independently documented, but **does not prove a priestly grape blessing or Weiser's festive family meal** |
| WEI58-26-014 | Breton night bells and farm visits need a localized historical or diocesan witness, not just the generic `BELL-004` death bell |
| WEI58-26-020 | Household 'eight Soul Nights' should not be represented as an actual liturgical octave |
| WEI58-27-018 | Evidence for St Joseph tables **does not establish the specific fritelli bread/pastry subcustom** |
| WEI58-27-031 | Breton fishermen's sea bonfires: independent source and safety/context screening required; no instructions to light fires on vessels |
| WEI58-28-004, WEI58-28-006 | Online Catholic Culture excerpts repeat Francis Weiser; **not an independent Hungarian source** for specific priestly grain or bread blessings |
| WEI58-28-025 | Scandinavian St Lucy crown customs are regionally/confessionally mixed; do not mislabel Protestant/local folklore as universal Catholic practice |

Potential partial/source-context leads (not proof of their full Weiser claim):
- Diocese of Saint-Étienne, 25 August 2024 shepherds' Mass and blessing of herds: https://www.diocese-saintetienne.fr/paroisses/saint-roch-des-montagnes-messe-des-bergers-et-benediction-des-troupeaux
- Rhône Tourisme: 8 September Notre-Dame-des-Raisins pilgrimage, https://www.rhonetourisme.com/je-prepare/activites-et-visites/visites-decouvertes/151524_chapelle-notre-dame-des-raisins/
- National Hungarian Archives document harvest customs on Peter and Paul, not a confirmed Roman Ritual blessing: https://nemzetiarchivum.hu/stories/PeterPal-napja-az-aratas-kezdete-kepvalogatas

## Release architecture and QA

1. Keep Calendar as the unique feast-date owner; do not add a separate 'Customs calendar' grid. Customs Atlas owns custom identity/source/geography, Saints owns person detail, Pray owns actual prayer texts, Mass/Special Days owns authenticated rites only.
2. Each eligible practice may become a brief bilingual EN/FR **optional, context-aware** date card or a Saints link after canonical ID/attestation/source registry integration. No duplicate calendar card, map pin or globally scheduled custom based only on a historical country citation.
3. Keep proposed historical texts original; do not copy Weiser's copyrighted prose, nor invented 1962 liturgical formulae.
4. Before publication: verify all source IDs/attestation foreign keys, no changes to 1962 Mass/LIVE cards, seven negative locks, SOT-07 parent, holiday precedence or competing Easter/Holy Saturday focus. Compare directly with open PR #1512 before rebasing.
5. This branch is still **DRAFT research**. Publication count = 0. No automatic merge or live app release.

### Count checks

`12 corroborated + 4 main-canonical owned + 1 open-PR owned + 2 excluded-as-instruction + 11 unresolved = 30`. The source registry currently has one record per corroborated observation, and the original 568 observations remain first-pass discovery, not 568 app entries.
