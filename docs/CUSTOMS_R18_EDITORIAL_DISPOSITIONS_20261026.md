# Customs: eighteen source-scoped editorial recommendations

**26 October 2026 · Commit-based research adjudication; no human approval recorded · no Calendar changes.**

## What is now decided, and what is not

The 18 source-scoped claim cases have each received a specific **research recommendation** against the existing 56-record Customs master, the 30 action review units and the five already owned release subjects. A recommendation is **not** an acceptance of a new canonical custom, a complete historical-source certification, permission to perform a priest's rite, a signed-off EN/FR article or publication authorization. Only the existing liturgical Calendar may eventually show these suggestions.

**Disposition totals:**

- **17 provisional distinct working actions retained**, each with a more precise presentation scope; not 17 newly approved or independently certified customs.
- **1 companion instead of a new identity:** the Provençal post-midnight *réveillon* remains a separate meal action but should be described alongside the existing Provençal Christmas *Gros Souper* / *pain calendal* working identity. Do not conflate the two meals.
- Of the 17 retained: 5 optional regional household practices; 1 parish-dependent household visit; 1 historical household context; 1 charity tradition; 2 regional performances; 1 cross-confessional art tradition; 1 regional family meal; 1 dated local gathering; 3 named local processions; 1 shrine devotional period.
- **0** new IDs assigned, **0** accountable human approvals and **0** Calendar runtime publications.

The machine-readable decision board is [`customs-r18-preliminary-editorial-dispositions-20261026.v1.json`](../data/customs/master/customs-r18-preliminary-editorial-dispositions-20261026.v1.json). Every row is linked by its exact existing `review_key`; source claims remain bounded by [the original corroboration audit](CUSTOMS_FIRST18_SOURCE_SCOPE_AUDIT_20261026.md).

## Complete editorial disposition board

| # | Action | Recommended presentation after approval | Final specific gate |
|---:|---|---|---|
| 1 | St Patrick's ribbon cross | Historical only | Document historic rather than current use |
| 2 | The Irish Christmas candle | Regional household | Keep school locality and informant address distinct from tradition origin |
| 3 | St John Baptist's community bonfire | Dated local gathering | Require current dated local parish confirmation |
| 4 | Decorating Easter eggs: pisanki and pysanky | Cross-confessional heritage | Separate regional craftsmanship and Catholic liturgical claims |
| 5 | Herbergsuche — Advent Marian-image visits between households | Parish-linked household | Limit to documented relay and parish availability |
| 6 | Christmas Eve hay beneath the tablecloth | Regional household | Check bilingual caution against straw divination |
| 7 | La guignolée — French Canadian Christmas alms collection | Charity heritage | Do not assume parish sponsorship or annual dates |
| 8 | Polish kolędnicy — Christmas visiting carollers | Regional performance | Keep subtype variants under existing working identity |
| 9 | Hungarian betlehemezés Nativity visiting plays | Regional performance | Retain source-specific actor and puppet distinctions |
| 10 | St Barbara branches — Barbarazweige | Regional household | Avoid predictive/divinatory and uncertain hagiographic claims |
| 11 | Provençal Christmas pain calendal and the poor person's portion | Regional meal | Attach distinct later réveillon as companion section |
| 12 | Three Kings gifts left in children's shoes | Regional household | Do not invent parade schedule or biblical claim |
| 13 | L-Irxoxt — Maltese running procession with the Risen Christ | Local procession | Require local parish scope and current date |
| 14 | Pentecost greenery decorating Polish homes | Regional household | Strengthen regional witness and archive photo caption |
| 15 | Tivoli's Inchinata procession | Local procession | Fresh diocesan date and provenance for future events |
| 16 | Faradda di li Candareri — Sassari's Marian offering procession | Local procession | Verify city-only programme and wooden-object role |
| 17 | Frauendreißiger — thirty days of Marian devotion | Local shrine devotion | Never copy modern shrine propers into 1962 |
| 18 | Provençal Christmas réveillon after midnight | Companion to existing owner | Write missing EN/FR introductions and approve companion ownership |

## Source discrepancies reconciled

**St Patrick's crosses — source precision resolved, not an approval.** The National Museum of Ireland directly dates Dineley's observation to **1681**. Galway City Museum identifies it broadly as being in the **1680s**. Both can be true. Keep cautious 1680s EN/FR article wording, attach an attributed 1681 source annotation if useful, and make no claim about when the tradition began or its unbroken modern usage.

**Irish Christmas candle — school and informant address separately verified.** The alternate Dúchas record identifies **Graine school, County Kilkenny**, and informant **Mr M. Delahunty**, with an address in **Graigaheesha, County Tipperary**. The former is the collecting-school locality; the latter is the informant's recorded address. Neither alone establishes the custom's first geographical origin. The previously linked Adare record remains a separate witness.

**St John bonfire — no recurring event permission.** An Oloron parish celebration was explicitly announced for **20 June 2026**, while St John Baptist's liturgical feast is on **24 June**. The latter may contextualize the tradition. It does not create a repeatable 24 June event in a locality, nor change the 1962 rite or authorize a fire blessing.

## Individual acceptance gates still required

For every row, the existing research/master owner must confirm: (i) that the practice deserves an independent identity rather than being a variant or festival component, (ii) attested source claims and reliance between references, (iii) geography and historical versus present-day scope, (iv) the liturgical/lay versus ministerial boundary, (v) the final English and French copy including practical cautions, (vi) the existing Calendar date/season association without fabricated event schedules, and (vii) explicit release authorization and browser/date-integrity checks.

For the eighteenth observation, EN/FR introductory descriptions are still missing and its final companion relationship must be explicitly accepted. A source-scoped recommendation does not cure these missing fields.

**What should happen next:** route the 18 dispositions to one consolidated decision/signoff board, not another small discovery batch. The five earlier release subjects remain separately owned by [#1610](https://github.com/Fulcanelli13/ad-orientem/pull/1610), [#1642](https://github.com/Fulcanelli13/ad-orientem/pull/1642), and [#1720](https://github.com/Fulcanelli13/ad-orientem/pull/1720). After human disposition and copy approvals, create one strictly bounded Calendar integration PR rather than growing a parallel Customs Atlas.

**Automated checks:** `tests/customs-r18-preliminary-editorial-dispositions.mjs` runs under `.github/workflows/customs-multibook-bulk150.yml`, enforces 17+1 crosswalk, stable IDs, provenance note repairs, date/rite/event guards, and all unapproved statuses.
