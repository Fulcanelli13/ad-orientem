# Catholic Customs — unified research master (21 October 2026)

> **Working inventory, not a final comprehensive register or an app publication.** This repository branch is data-only. Freeze UI, artwork and module architecture decisions until the master identity and calendar gates are complete.

## Current consolidated research inventory — v1

**56 distinct working identity records** are now maintained in `working-master.v1.json`: **38 canonical identities already on main**, **4 older regional/heritage P2 records accepted for research use**, and **14 additional source-backed research identity records, accepted with restricted scope but not published**. Every one of the 56 has bilingual name, description, historical context, spiritual meaning, optional practice, pastoral qualification, source provenance and a qualified calendar context. This is the *research inventory*, not 56 live published customs.

| Proposed research identity | English name | Related date / feast (not an event booking) |
|---|---|---|
| `CUST-ADVT-HERBERGSUCHE` | Herbergsuche — local Advent lodging-search devotion | Advent; individual parish house-visit itinerary, not a universal fixed nine-day programme |
| `CUST-XMAS-POLISH-HAY` | Christmas Eve hay beneath the tablecloth | 12-24 |
| `CUST-XMAS-KASHUBIAN-ANIMAL-CARE` | Christmas Eve care for livestock and birds | 12-24 |
| `CUST-XMAS-QUEBEC-GUIGNOLEE` | La guignolée — French Canadian Christmas alms collection | Christmas-season charity drive; actual annual dates locally announced |
| `CUST-XMAS-POLISH-KOLEDNICI` | Polish kolędnicy — Christmas visiting carollers | Christmas cycle; dates and troupe forms differ across regions |
| `CUST-XMAS-HUNGARIAN-BETLEHEMEZES` | Hungarian betlehemezés Nativity visiting plays | Christmas season, local dates |
| `CUST-BARBARA-BRANCHES` | St Barbara branches — Barbarazweige | 12-04 |
| `CUST-XMAS-PROVENCAL-PAIN-CALENDAL` | Provençal Christmas pain calendal and the poor person's portion | 12-24 |
| `CUST-EPIPHANY-SPANISH-MAGI-GIFTS` | Three Kings gifts left in children's shoes | 01-05/01-06 |
| `CUST-EASTER-MALTESE-IRXOXT` | L-Irxoxt — Maltese running procession with the Risen Christ | Easter Sunday, only parishes with actual announced procession |
| `CUST-PENTECOST-POLISH-GREENERY` | Pentecost greenery decorating Polish homes | Pentecost, movable feast resolved by Calendar |
| `CUST-ASSUMPTION-TIVOLI-INCHINATA` | Tivoli's Inchinata procession | 08-14/08-15 |
| `CUST-ASSUMPTION-SASSARI-CANDELIERI` | Faradda di li Candareri — Sassari's Marian offering procession | 08-14 |
| `CUST-MARIAN-BAVARIAN-FRAUENDREISSIGER` | Frauendreißiger — thirty days of Marian devotion | 08-15/09-14 |

**Ritual and source ownership:** `ritual-and-source-ownership-23.v1.json` now routes all **23** remaining blessing/source observations. Its historical Roman Ritual index references distinguish the existence of a rite *genre* from any claim that a given local date or formula was used. The Polish Corpus Christi herbal-wreath custom has independent ethnographic evidence, but no unverified formula is approved for display.

**Evidence and release:** among 42 possibly distinct Weiser observations, 25 have bounded independent witnesses, 17 retain exact or partial source holds, and 14 of the 25 have been staged as separate working identities. Eleven sourced observations remain nested variants, cultural context, or blessing-sensitive matters. None of these additions is live. The 39 regional variants and 41 links have now been assigned explicit review dispositions; source acceptance and eventual public inclusion remain gated.

---
## Reconciled original French-world and geographic research

The original **63-row SOT-07 French-world register** has been preserved in `sot07-original-63-crosswalk.v1.json`: 16 are already among the 38 existing canonical identities, 40 remain with the originally assigned other-module/editorial owner, three are evidence holds, and four were explicitly excluded. These are not extra 63 customs.

The separate SOT-07G geographic source workbook contributes **53 custom families, 21 local complexes, 135 geographic attestations, 162 geographic-area identifiers, and 117 original source IDs**. `geographic-family-crosswalk-53.v1.json` preserves all identifiers and assigns each family a relationship or owner: eight are exact existing custom concepts; 15 additional families are related to known master records but must not be silently merged; 30 have other-module, historical, local-ritual or new-identity-review dispositions.

**Major release blocker:** the 117 original source identifiers still require verified URLs/passages, and the 162 research geographic areas lack certified canonical Place identities. The 135 attestations are **not** 135 verified map pins or public events. All 21 complexes, including the Père Laval / Mauritius pilgrimage complex, remain linked to Explore as research entities rather than automatically minted Customs entries.

One historical owner mismatch was corrected here: a Rosary procession is a prayer/procession or local event, not automatically an instance of `DEV-001` (the May devotion); likewise a Corpus Christi procession is not simply the floral-carpet custom `CORP-001`.

## Final editorial identity review — 18 regional additions accepted for research

**14 of 14** newly staged source-backed identities are editorially classified within the research master (7 local Catholic devotional/charitable practices, 5 regional Christian folk practices, 2 cultural feast customs). **4 of 4** older P2 customs have likewise been classified (St Patrick's ribbon cross, Irish Christmas candles, St John bonfires, Easter egg decoration). These decisions do not change the 38 existing canonical identities or publish any new custom.

The Austrian Herbergsuche title was corrected to the parish-attested image-of-Mary household relay, and the Hungarian betlehemezés source was strengthened by the Hungarian Catholic Lexicon. A broken Smithsonian Easter-egg link was replaced with a verified museum object record.

## Relationship review — all 80 previously ambiguous observations

`relation-review-80.v1.json` now records an explicit **nonpublishing** decision for each of **41 proposed links to older identities** and **39 related/regional variants**. **Three false merges were corrected**: John/Joan Christmas candle lighting ≠ patronal name day; Easter grandparent visits ≠ Emmaus prayer walk; All Saints prayer bells ≠ funeral death bell. Related-practice links retain source limitations and never create new canonical IDs.

**This completes the first-pass identity/relationship routing** for the current mined Weiser inventory. It does *not* certify every item for presentation to users: regional source sufficiency, editorial identity acceptance, exact period-specific priestly rituals, and the final selection of visible content remain separate release gates.

## Source-of-truth hierarchy

- **38 existing canonical records** are owned by `data/customs/customs-atlas-seed.v1.json` on `main`. Their identity and publication states are retained unchanged (35 published, 3 context-only).
- **4 older P2 custom identities** have been historically classified for the research master, not added to the public app.
- **568 Weiser book observations, 28 chapters** are preserved one-for-one in `weiser-observations.v0.json`; observations are not synonymous with distinct customs.
- **54 bilingual Weiser editorial drafts** and their prior owner decisions are reconciled in `editorial-owner-reconciliation.v0.json`. Of their 15 formerly “new canonical” groups, 11 match current canonical identities; four remain provisional.
- **14 possible duplicate-practice groups** and **28 related-family groups** remain reversible review aids. We do not merge regional, household, liturgical and ministerial acts simply because they are related.

## What is complete and what is not

| Measure | Count | Meaning |
|---|---:|---|
| Canonical identities | 38 | Present on main; not necessarily complete descriptions for every future module use |
| Older regional/heritage research identities | 4 | Research-classified, not app publication-approved |
| Earlier v0 baseline | **42** | Historical baseline, 38 + 4 |
| Current v1 working identities | **56** | 38 existing canonical + 18 research-classified, no new app publication |
| Weiser observations inventoried | **568** | All 28 chapters indexed |
| Explicit observation-to-master links | **50** | Identity association for editorial review only |
| Unlinked observations | **518** | **Not** 518 missing customs |
| Existing/other-owner parity to reconcile | **81** | Mostly liturgy/Calendar/Pray/Saints, avoid duplication |
| Identity/variant observations awaiting review | **286** | 145 regional, 92 candidate, 49 enrichment |
| Already assigned to other owner/regional context/ritual hold in the 54-draft pass | **26** | Subset of 286, not new customs |
| Originally without 54-draft owner decision | **260** | All now assigned preliminary dispositions; editorial/source gates remain open |
| Historical reference only | **117** | Research/archive, not current practice claims |
| Excluded observations | **34** | Never auto-publish |
| Independent-source P1 holds | **84** | 38 no exact match + 46 partial/indirect; overlaps the book counts |

## Earlier v0 canonical / provisional identity baseline (42 records)

| ID | Name (English) | Temporal association (source context only) | State |
|---|---|---|---|
| `DOM-002` | Domestic holy-water font / bénitier de chevet | Undated / local occasion | Canonical |
| `DOM-006` | Family consecration to the Sacred Heart | Sacred Heart season / family use | Canonical |
| `DOM-007` | Intronement of a Sacred Heart image in the home | Undated / local occasion | Canonical |
| `LIFE-002` | Relevailles / blessing after childbirth | Undated / local occasion | Canonical |
| `DEV-001` | May as the month of Mary | May | Canonical |
| `DEV-006` | Pilgrimage to a shrine or holy place | Undated / local occasion | Canonical |
| `DEV-007` | Regional pardons and shrine anniversaries | Undated / local occasion | Context-only |
| `DEV-009` | Ex-votos | Undated / local occasion | Canonical |
| `DEV-010` | Votive candle at a shrine | Undated / local occasion | Canonical |
| `DEAD-001` | Prayerful cemetery visit | 02/11; November; anniversaries | Canonical |
| `DEAD-003` | Prayer for the dead on 2 November | 02/11 | Canonical |
| `BELL-004` | Glas / death bell | Undated / local occasion | Context-only |
| `FOOD-001` | Pain bénit | Undated / local occasion | Context-only |
| `DOM-003` | Using holy water at home | Undated / local occasion | Canonical |
| `DOM-011` | Keeping blessed Candlemas candles at home | 02/02 — Candlemas (date owned by Calendar) | Canonical |
| `DOM-013` | Keeping blessed Palm Sunday branches at home | Palm Sunday (calculated by Calendar) | Canonical |
| `BLSS-001` | St Blaise — blessing of throats | 03/02, St Blaise commemoration in 1962 Roman calendar; Calendar owns calculation and precedence | Canonical |
| `NDAY-001` | Baptismal patron's name day | Undated / local occasion | Canonical |
| `PATR-001` | French fête patronale / village patronal celebration | Undated / local occasion | Canonical |
| `MARI-001` | French Assumption Marian processions | 15/08 — Assumption; regional context, never automatic ritual | Canonical |
| `SJOS-001` | St Joseph's table and gifts to the poor | 19/03 — St Joseph feast; optional local family and parish practice | Canonical |
| `SANT-001` | St Anthony's Bread / Pain des pauvres | 13/06 — St Anthony of Padua; charity can be practised on any day | Canonical |
| `SCHR-001` | St Christopher — vehicles and travellers' blessing | 25/07 — St Christopher commemoration; parish event date may differ | Canonical |
| `SNIC-001` | St Nicholas's visit and small gifts to children | 06/12 — St Nicholas; regional household custom | Canonical |
| `BLSS-002` | Assumption — blessing of herbs, flowers and fruits | 15 August, Assumption; date and Mass rank owned by Calendar | Canonical |
| `BLSS-003` | St John the Evangelist — blessing of wine | 27 December, feast of St John the Apostle and Evangelist in 1962 Roman calendar | Canonical |
| `BLSS-004` | Holy Saturday — blessing of Easter foods | Holy Saturday (calculated from 1962 Easter by Calendar), with domestic use on Easter Sunday | Canonical |
| `ADVT-001` | The family Advent wreath | First Sunday of Advent; date owned by Calendar, no feast added | Canonical |
| `ADVT-002` | The Advent manger of good deeds | Advent household preparation; Calendar owns liturgical dates | Canonical |
| `ADVT-003` | Las Posadas: welcoming the Holy Family | 16–24 December in communities that actually celebrate Posadas | Canonical |
| `XMAS-001` | Sharing opłatek on Christmas Eve | 24 December as customary domestic vigil, distinct from Mass | Canonical |
| `HTHU-001` | Visiting churches on Holy Thursday | Holy Thursday, calculated from Easter by Calendar; locally open repositories only | Canonical |
| `ROGA-001` | A family Rogation prayer walk | Major Rogation 25 April and the three Minor Rogation days before Ascension; Calendar owns calculation | Canonical |
| `EPIP-001` | Epiphany star singers | 6 January, as a regional practice; visits must be locally announced | Canonical |
| `EPIP-002` | The Epiphany cake and the poor person's portion | 6 January in the 1962 calendar; household celebration date may differ | Canonical |
| `CORP-001` | Flower carpets for Corpus Christi | Corpus Christi where a real procession is celebrated locally | Canonical |
| `EAST-001` | An Easter Monday Emmaus walk | Easter Monday calculated by Calendar; regional voluntary practice | Canonical |
| `MARI-002` | A little garden dedicated to Our Lady | May or another suitable gardening season; linked to DEV-001 | Canonical |
| `CANDIDATE-STPATRICK-RIBBON` | St Patrick's ribbon cross | 17 March | Provisional P2 |
| `CANDIDATE-IRISH-CHRISTMAS-CANDLE` | The Irish Christmas candle | 24–25 December; local duration varies | Provisional P2 |
| `CANDIDATE-STJOHN-BONFIRE` | St John Baptist's community bonfire | Nativity of St John Baptist, 24 June; eve commonly 23 June | Provisional P2 |
| `CANDIDATE-EASTER-EGG-CRAFT` | Decorating Easter eggs: pisanki and pysanky | Easter season; no independently established universal Holy Saturday decorating time | Provisional P2 |

## Chapters needing identity/variant adjudication

| Weiser chapter | Observations | Unlinked candidate/regional/enrichment reviews |
|---:|---:|---:|
| 1 | 8 | 4 |
| 2 | 10 | 4 |
| 3 | 9 | 6 |
| 4 | 7 | 3 |
| 5 | 11 | 6 |
| 6 | 16 | 12 |
| 7 | 13 | 8 |
| 8 | 29 | 16 |
| 9 | 14 | 10 |
| 10 | 20 | 11 |
| 11 | 11 | 7 |
| 12 | 19 | 10 |
| 13 | 20 | 9 |
| 14 | 29 | 16 |
| 15 | 39 | 18 |
| 16 | 33 | 19 |
| 17 | 25 | 12 |
| 18 | 17 | 5 |
| 19 | 23 | 11 |
| 20 | 14 | 7 |
| 21 | 21 | 11 |
| 22 | 12 | 8 |
| 23 | 23 | 6 |
| 24 | 25 | 13 |
| 25 | 27 | 9 |
| 26 | 31 | 16 |
| 27 | 35 | 18 |
| 28 | 27 | 11 |

## The 260-observation first-pass review

**All 260 previously lacking a 54-card editorial owner decision now have an explicit provisional disposition.** This does not certify the practices as distinct customs or validate their historical claims.

| Editorial first-pass disposition | Observations |
|---|---:|
| Potential distinct custom — independent source and duplicate-identity gate | 42 |
| Link to an existing canonical/provisional identity for review | 41 |
| Other module's responsibility (Calendar, Mass, Saints, Pray, Shrines, Learn) | 56 |
| Regional variant or related practice, not yet merged | 39 |
| Historical, cultural or folklore reference only | 59 |
| Source or ministerial-ritual hold | 23 |
| **Total** | **260** |

The 42 possible distinct practices are a **research shortlist**, not 42 new canonical customs. **25** have bounded independent sources, **17** remain source-gated, and **14** have been staged as research identities. The separate **23** ritual/source observations have owner dispositions but no cleared ritual publication. Nothing new is live.

See `first-pass-260-reconciliation.v1.json` and the three chapter-grouped `identity-triage` files. Every row keeps its original Weiser locator, geography, existing priority and evidence status.

## Canonical 38 — bilingual editorial field parity now complete

**All 38 canonical identities** (35 published and 3 context-only on existing main) now have **English and French**: title, description, historical context, spiritual meaning, bounded suggested practice and pastoral qualification. The 27 shorter canonical articles received explicit meaning/practice fields; the 11 older detailed guides received bilingual historical paragraphs with **26 independent source-witness citations** preserved from the previous P0/P1 evidence closure.

These are working original editorial drafts, **not a new approval to publish**. Ministerial blessings and actual liturgical ceremonies continue to require a priest and correct Roman Ritual authority. The three CONTEXT_ONLY customs retain their limited historical status; no artificial devotional instructions are issued for them.

| Core editorial coverage | Completed |
|---|---:|
| Canonical descriptions, EN/FR | 38/38 |
| Historical paragraphs, EN/FR | 38/38 |
| Spiritual meaning, EN/FR | 38/38 |
| Practical guidance, EN/FR | 38/38 |
| Publication approvals issued by this master | **0** |

The four older P2 identities have received source-bounded research dispositions, and all 42 further possible source-observation candidates have explicit source outcomes. Do **not** add 42 to the canonical count.

## Candidate source triage — all 42 observations (25 bounded / 17 explicit holds)

The **42 observations formerly shortlisted as potentially distinct customs** now each have a documented source-gate decision in `candidate-source-decision-board.v1.json`. They are **not 42 canonical customs**, and the source decision does not itself settle identity or publication.

| Review population | Count |
|---|---:|
| Potential distinct source observations | 42 |
| With bounded independent-source evidence and EN/FR editorial drafts | **25** |
| Exact or partial evidence holds with explicit reopening conditions | **17** (12 exact-match gaps, 5 partial claims) |
| Source witness references across all four batches | 42 |
| Newly published or canonical records | **0** |

Nine additional histories, meanings, practice descriptions and cautions (English/French) are in `independent-sources-batch02.v1.json`. The six previously corroborated customs also now have complete bilingual drafts, and `independent-sources-batch01.v1.json` has corrected URLs and narrowed source claims.

Editorial distinctions now explicit:

- Austrian Marian-image relay and dramatic Herbergsuche are related local Advent practices, **not** automatically merged or equated with Mexican Las Posadas.
- Polish kolędnicy and a travelling szopka puppet theatre can overlap, but the UNESCO **Kraków architectural szopka craft is a separate subject**.
- Ukrainian didukh is witnessed within Ukrainian Catholic/ethnographic contexts, not universally prescribed in the Latin rite; ancestral-spirit interpretations are treated as folklore, not doctrine.
- German Advent picture calendars and Acadian Mi-Carême mask visits are cross-confessional or cultural histories, not 1962 Roman liturgical practices.
- The Provençal pain calendal, Spanish Magi gifts, Tivoli Inchinata, Sassari Faradda and Bavarian Frauendreißiger have independently bounded geography and date contexts.
- Local Marian procession, household custom and priestly blessing remain distinct actions; source-based dates never trigger events automatically.

**The source triage is complete, not the master release:** `unverified-candidate-exact-claim-holds.v1.json` protects 17 uncorroborated or partial claims, each with a specific reason and reopening condition. `witnessed-identity-recommendations.v1.json` records 25 independently witnessed observations, including **14 proposed distinct identities**, three regional variants, four cultural-context records, a gift-bell component, a broader crèche-history item, an Eastern Catholic context and a rite-sensitive household wreath. The 14 proposals have been accepted as separate *research identities* within the 56-entry master, split into seven explicitly Catholic local/devotional, five regional Christian folk, and two predominantly cultural feast customs; none has been approved for app publication.

**Next gate:** verify remaining source/passage evidence and publication selection for visible regional records, reconcile geographic Place entities and original source URLs, and test the master against other historical Catholic customary sources. No ritual publishing is permitted by these research decisions. The 23 source/ritual observations have owner dispositions, not formula authorization.

## Source-closure waves 3 and 4

Eight additional bilingual dossiers were researched for the Christkind bell, Polish Christmas table hay, Kashubian animal feeding, the Provençal post-midnight réveillon, Hungarian betlehemezés, Polish Pentecost greenery, Polish Corpus Christi wreaths and St Martin village feast customs. Two further bounded historical profiles describe Tyrolean scenic Nativity cribs and Polish Holy Week domestic preparations. All are original EN/FR copy, local or historical, and unpublished.

Geographic and ritual restrictions are explicit: Christmas animal lore does not establish magical outcomes; the Christmas gift bell is one component of the broader gift family; Corpus Christi wreaths are not flower carpets; household wreath use does not prove a particular 1962 Roman Ritual formula; St Martin social celebrations do not prove a universal harvest Mass.

## Normalized calendar associations — all 42 identities

`normalized-temporal-context.v0.json` now assigns **30 date-, feast-, month- or season-associated** customs and **12 local, household, personal or historical/undated** occasions. The 30 include the four provisional customs; the older 38-record projection was 26 seasonal/year and 12 Catholic Life.

Every row explicitly distinguishes a source-related date from a liturgical obligation, calendar precedence, or announced local event. Easter, Advent and Corpus Christi continue to use the Calendar's own day resolution. Name days require the actual personally selected patron; patronal feasts and pilgrimages require local information. No automatic processions, ministerial blessings, alerts, feast ranks, or transferred-date claims were added.

Special cases: Rogations have composite Major and Minor contexts, Las Posadas is regionally described as 16–24 December, Irish Christmas candles as the Christmas Eve/Christmas night span, and St John Baptist bonfires as a local eve custom around 23 June. Dates of related devotional activities remain qualified and may differ by place.

## First independent source closure — six geographically bounded customs

The first independent-source wave checked six of the 42 candidate observations. **These are attested local historical or continuing practices, not publication decisions.** The file `independent-sources-batch01.v1.json` preserves exact evidence, limits, locality and date semantics.

| Weiser locator | Custom | Corroboration type |
|---|---|---|
| `WEI58-05-010` | Austrian Advent Herbergsuche | Großpetersdorf Catholic parish household witness |
| `WEI58-07-007` | Québec guignolée Christmas charity | Provincial heritage register and St Vincent de Paul |
| `WEI58-07-008` | Polish kolędnicy home visits | Polish government educational portal |
| `WEI58-08-019` | St Barbara's December branches | Archdiocese of Vienna |
| `WEI58-16-020` | Maltese Easter L-Irxoxt procession and statue run | Malta public administration and contemporary local reporting |
| `WEI58-24-007` | Sassari's Assumption-eve Candelieri procession | Sardinian regional heritage authority and official festival site |

Six records have **nine named source witnesses**. They are still gated against duplicate custom identity, strict 1962 liturgical ownership, localized date qualification and final bilingual publication copy. No automatic feast or ministerial action was added.

Eight candidate family-overlap reviews, comprising 19 possible distinct observations, are documented separately in `possible-distinct-candidate-overlap.v1.json`; these are not eight canonical customs or an automatic collapse of identities.

## Editorial decisions that remain open

1. **Select the user-facing subset from the 56 research identities**, without presenting regional Christian folklore as universal Roman practice. The 18 newer identities have research-scope editorial dispositions; 17 additional candidate observations retain exact claim holds, 23 ritual/source observations retain owner routes, and all 80 relationship cases have nonpublishing dispositions.
2. **Separate dates rigorously:** fixed historical custom day, movable feast relationship, observed 1962 feast precedence, family occasion, and actual local programme are different fields; the Calendar resolver owns observed feast dates.
3. **Preserve geography and historical scope:** never turn an Irish household witness, German festival custom, French local blessing, Polish food custom or folklore into universal Roman practice.
4. **Prioritise unresolved source claims that materially change identity decisions**. The older 84 P1 source evidence gaps overlap the 568 historical observations and should not be counted as additional missing customs.
5. **Editorially approve the now-field-complete 38 bilingual canonical profiles** and their independent source citations, then run a complete release audit. The 27 historical folios and the other editorial additions remain drafts until this approval.
6. Only **after data closure** review information architecture: Through the Year, Catholic Life, searchable historical archive, Calendar/Pray/Saints links. UI and art on PR #1530 remain on hold.

## Rules

- One practice identity, many geographically bounded witnesses. Identity, variant and overlapping practice are separate relations.
- No new canonical IDs or publication just because a source observation is marked CANDIDATE or REGIONAL.
- No inferred automatic processions, blessings, household obligations, health or supernatural guarantees.
- No raw Weiser passages reproduced as modern published copy; use independent citations and original editorial prose.
- Preserve the current Mass, Calendar, LIVE reader and all prior research branches as separate authorities.

## Machine-readable files

- `editorial-identity-acceptance-14.v1.json` and `editorial-identity-acceptance-p2-four.v1.json` — 18 historically bounded research identity acceptances; no app release.
- `sot07-original-63-crosswalk.v1.json` — complete source-to-owner crosswalk of the original 63 French-world register rows.
- `geographic-family-crosswalk-53.v1.json` — 53 original families, 21 complexes, 135 attestations and retained 117 source IDs.

- `working-master.v1.json` — 56 EN/FR working identities, with source and calendar flags.
- `proposed-identity-additions.v1.json` — 14 separate source-backed research IDs, nonpublished.
- `ritual-and-source-ownership-23.v1.json` — 23 routed blessing/source holds, no formula release.
- `relation-review-80.v1.json` — 41 existing links and 39 regional variants, including three corrected owner mismatches.
- `master-readiness-audit.v1.json` — inventory coverage and final release gate checklist.

- `identities.v0.json` — 42 English/French working identities with calendar fields, sources and provenance.
- `weiser-observations.v0.json` — 568 immutable source locators, original triage and review status.
- `editorial-owner-reconciliation.v0.json` — 54 decisions, 15→11+4 mapping, 14 duplicate groups, 28 related-family groups.
- `coverage-and-review-queue.v0.json` — 28-chapter coverage, 286-item review queue, blocked and other-owner populations.
- `tests/customs-master-integrity.mjs` — provenance, counts, status and source gates.
