# P2 Living Traditional Sanctoral — source-date research batch (2026-10-16)

Immutable baseline: `359ed283ebc6dd28797039c9667791c80323c271`; independent `research/1224-modern-sanctoral-dates`. This work is **research data only**, not a Calendar/Mass runtime modification.

## Verified baseline and measured progress

- Canonical individual IDs **293**, group IDs **13**.
- Baseline date registry: **26** date edges; **21** individual identities and **5** collective groups covered.
- After new, source-visited batches: **293** dated individual identities, leaving **0** with no date evidence (net backlog reduction **272**).
- Evidence ledger now **314** edges including **288** newly researched edges.
- **10** people with pre-existing Vatican-decree or recorded papal General Roman evidence; new Dicastery profiles add **zero** claims of universal-calendar authority.
- **13** group IDs with a dated source witness.
- New date-profile coverage: **51** canonisation-year collections inspected, with 0 of the 51 already-indexed source-year collections still to harvest for dates.

## Source discipline

Sources for each new edge use the exact visited `causesanti.va/it/santi-e-beati/...` profile URL and the field `Memoria Liturgica`; the date claim is recorded in Italian. The source's publication/effective date is **not asserted** when absent. We preserve `canonizationNotBefore`, but do **not** treat it as proof of memorial promulgation. Research evidence is assessed as of 2026-10-16, not retrojected automatically to 1962, pre-canonisation years, or earlier modern years.

An additional source explicitly identifies 17 June in the proper calendar of the Franciscan Elizabethan Sisters for **Ludovico da Casoria**, distinct from the profile's 30 March date. The Carmel witness specifies **12 July** for **Louis and Zélie Martin**; the Dicastery profile also gives 29 July and 28 August without documenting a separate universal feast. The papal beatification letter reproduced in the Dicastery's **Francisco and Jacinta Marto** profile establishes a **joint 20 February** feast only in permitted places and according to law, not a universal or traditional 1962 observance.

Never infer traditional Mass eligibility from any date edge. P1 owns formularies, cum sanctissima and juridical permission adjudication. P0 owns the production 1962 resolver, historical calendar projection, precedence and app presentation. This branch changes neither owner.

## Machine-readable handoff

- `living-sanctoral-ultra-master.v1.json`: exhaustive 293-person + 13-group subject matrix.
- `living-sanctoral-date-evidence.v1.json`: original and new source-to-date evidence with URL, source claim, scope, and recognition/effective-date distinctions.
- `living-sanctoral-authorities.v1.json`: source-competence and jurisdiction classes.
- `living-sanctoral-effective-dates.v1.json`: date-effective and Doctor-declaration crosswalk.
- `living-sanctoral-identity-reconciliation.v1.json`: aliases, group policy, evidence contradictions.
- `living-sanctoral-review-queue.v1.json`: undated subjects and 0 untouched (for memorial dates) already-indexed source-year collections.
- `living-sanctoral-compatible-export.v1.json`: non-published compatibility projection; every candidate `eligibleForRuntime=false`.
- `living-sanctoral-new-source-batch.v1.json`: fifty-one-year Dicastery source batch for reproducibility.
- `tests/calendar-living-sanctoral-research-p2.mjs`: structural, identity, scope, effective-date, coverage and no-runtime claims.

P0: ingest only after verifying authority, applicable jurisdiction and source effective date; retain `saint.*` and `canon-group.*` IDs, respect existing 1962 rank and Mass. P1: use subjectId + date edge + source URLs solely as input to separate traditional Mass authorization/formulary research. No merge or deploy.

## Additional high-yield source batch — 2000, 2003, 2009

29 new primary-source date edges from three already-indexed official canonisation-year collections: 28 new individually dated saints and 1 collective martyrs group. Luigi Versiglia and Callisto Caravario share the same official profile and memorial date but remain distinct canonical identities. The Mexico 1927 martyrs remain a collective profile. Józef Sebastian Pelczar has a header memorial date of 28 March and an older text reference to 19 January when beatified; this discrepancy is explicitly retained for historical adjudication, not projected as two universal feasts.

**Updated cumulative metrics:** 115/293 dated individual subjects, 178 undated, 10/13 dated collective groups, 127 total source edges (101 newly acquired), 12 canonisation-year collections with new date evidence, 39 remaining. No new universal-calendar or 1962 Mass permission claims. Source effective dates still unverified where no decree is known.

## Source-verified bulk batch 3: eight further year collections (16 October 2026)

The Dicastery's own profile headers were visited and their `Memoria Liturgica` dates transcribed for **44 existing individual identities** from canonisation-year collections **2001 (9), 2002 (5), 2004 (5), 2005 (5), 2010 (6), 2011 (3), 2012 (6), and 2019 (5)**. These additions map directly to existing AO IDs, including distinct religious/birth/language names such as `saint.mary-of-the-cross-mackillop` → the `maria-della-croce` profile, `saint.carmen-salles-y-barangueras` → `maria-del-monte-carmelo`, and `saint.rafqa-ar-rayes` → `rebecca-rafqa-ar-rayes`.

**Total measured backlog:** 21→159 people with attested date, 272→134 without; 26→171 date evidence records (145 acquired in P2); 10 of 13 collective groups with dates. **20 official year collections touched**, 31 not yet touched for date discovery; a touched collection may still require minority-item follow-up or particular-calendar promulgation verification. No new universal Roman inscription or traditional 1962 Mass permission is implied by a profile date.

**New historical conflict:** the Zygmunt Gorazdowski profile header states `1 gennaio`, while the same document's biography reports a **26 June 2001** memorial assignment at beatification in Lviv. The historical/local authority and effective transition require separate documentation before calendar projection; do not substitute the beatification date for the profile date.

All new entries are `RESEARCH_ONLY`; `eligibleForRuntime:false` remains set. New source URLs and field claims are in the ledger, linked to stable canonical subject IDs. P0 and P1 boundaries unchanged.

## Source-verified bulk batch 4: 1995, 1999, 2006, 2007, 2008

Added **25** direct Dicastery `Memoria Liturgica` records after checking page header, date and canonical identity in the original profile. The 1995 three Martyrs of Košice have the same 7 September profile date but remain **three canonically distinct individuals** and must not be turned into three different feasts by this data; P0 handles grouping rules. No independent liturgical calendar was created.

**Critical exception (NOT IMPORTED):** The Dicastery's `cunegonda-kinga.html` page reports `3 marzo` but its surrounding text attributes the subject a husband described as St Henry emperor, evidently inconsistent with Kinga of Poland. Kinga's memorial date remains unresolved in the research queue. Do not accept this page header date until a second reliable witness clarifies identity.

**Cumulative at commit:** 184/293 individually dated, 109 undated, 196 source edges (170 added during P2), 25/51 year collections with date harvest, 26 still untouched for dates. All dates are research-only and scoped. The 1962 principal feast, Mass permission and production resolver are untouched.

## Batch 5 — Official historical collections 1970, 1975, 1984, 1987, 1988, 1989, 1993

This batch joins **39 newly date-attested canonical individuals** through **40 individual edges** (Giuseppe Moscati's Dicastery field lists both 12 April and 16 November). It adds three official source edges for existing collective subjects (Paraguayan Jesuit martyrs, Korean martyrs, Vietnamese martyrs). The new Paraguayan cohort date is 15 November; Korean and Vietnamese evidence corroborates already-indexed modern USCCB dates. The four Franciscan martyrs canonised in 1970 share one source-dated 14 November association but retain their existing four person IDs; no new public group is invented.

**Conflicts withheld:** The Dicastery 1987 Japan martyrs page has `Memoria Liturgica: 6 febbraio`, while the existing USCCB source has **28 September** for Lorenzo Ruiz and companions. Date 6 February is NOT imported; 28 September is recorded as scoped USCCB evidence for the already named members and group. The Dicastery Forty Martyrs of England and Wales page explicitly says `Senza data (Celebrazioni singole)`; no group date is fabricated from the canonisation date.

**Cumulative:** 223/293 named individuals with source-attested date associations, 70 undated, 239 separate source-to-date edges (213 new in P2), 11/13 dated collective groups, 32/51 canonisation-year collections harvested, 19 still untouched. Source publication dates and particular-calendar authority remain unresolved where not established in the record. No eligibility for a 1962 Mass is inferred.

## Batch 6 — Completed 51-year profile-field sweep

Further primary-source acquisition supplies **33 individual date edges for 32 newly dated individuals** from 18 distinct year collections and a corroborating group source for the 1964 Uganda martyrs. The St Leopold Mandić profile gives `12 maggio, 30 luglio`; retain both source date claims with unknown universal/institute jurisdiction. The St Pierre-Julien Eymard profile says `2 agosto (memoria facoltativa)`, but such wording alone does not grant a historical universal-1962 or modern General Roman promulgation.

**51/51 already-indexed canonisation-year collections have now been inspected for dates.** Fifty contain newly harvested individual or group date evidence. The 2021 equipollent canonisation profile of Margherita di Città di Castello has no `Memoria Liturgica` field and is explicitly indexed as source-inspected/no field; she remains undated pending a Dominican/diocesan calendar witness. The 1997 Dicastery queen Jadwiga page has a biography apparently conflated with the different Hedwig of Silesia and lists `16 ottobre`; that date is **excluded** from Queen Jadwiga pending stronger identity-qualified liturgical authority. Saint John of Dukla's unambiguous date is added from the same source-year collection.

**Cumulative:** 255/293 named individuals with one or more source-attested dates, 38 remaining undated, 273 source edges (247 new), 11/13 dated group profiles, 51/51 indexed source year collections visited (50 providing new usable date evidence). Next priority: the 38-subject residue—especially historical Doctor records, incompletely sourced particular calendars, group lead identities, and the deliberate Queen Jadwiga/Kinga/Margherita holds—not a repeat of calendar-year acquisition.

## Residual identity and date reconciliation — 16 October 2026

The **31** formerly undated historical Doctors have exact corresponding 1962 feast dates and canonical source IDs *already recorded* in `data/calendar/doctors-of-church-roster.review.v1.json`. These are **archival 1962 resolver date witnesses, not independent original Missal juridical certifications**. Doctor declarations after 1962 remain separate effective-dated attributes, never retrojected into historical Mass labels.

Four directly rechecked Dicastery saint profiles provide liturgical memorial associations: **Agostino Zhao Rong 9 July** (and a corroborating China martyrs group evidence edge); **Cristóbal Magallanes 25 May**, **Juan Diego 9 December**, **Pedro de San José Betancur 25 April**. All four reuse existing IDs.

The three previously held identities now have specific but **local-only** date witnesses: Queen Jadwiga **8 June** (her Kraków patronal parish), Kinga **24 July** (a Wrocław Franciscan parish's 2026 liturgical notices), Margaret of Castello **13 April** (Dominican Order report of St Patrick's Columbus feast practice). The conflicting Dicastery profile entries are not treated as valid for Kinga/Jadwiga; Margaret's missing Dicastery field still remains a source gap. None establishes global General Roman Calendar inscription or 1962 Mass permission.

Martyrs of Turón **9 October**: Lasallian Generalate explicitly attests liturgical feast with reference to approved liturgical text. Forty Martyrs of England and Wales **25 October**: historical Wrexham diocesan feast reference only; distinguish modern national calendars in England and Wales and the Dicastery's `Senza data` record. Both are group records, not inflated into new individual saints.

**Total: 293/293 named canonical subjects and 13/13 collective martyr groups have at least one dated witness; 314 separate source-to-date edges (288 added in P2), 51/51 previously indexed official canonisation year collections inspected. These numbers report source date-association presence ONLY**. Jurisdiction, legal effectiveness, modern universal standing and independent 1962 source certification are not complete; all new compatibility rows have `eligibleForRuntime:false`. No runtime, Mass or Calendar source selected automatically.
