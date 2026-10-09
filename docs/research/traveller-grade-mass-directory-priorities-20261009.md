# Find: travel-grade country priorities

**Decision date:** 9 October 2026  
**Languages:** English and French. Preserve local names and original-source URLs in Spanish, Italian, Portuguese and Indian languages; translate UI and explanatory summaries, not source facts.

## Product decision

Deprioritise worldwide venue totals and speculative country coverage. Maintain currently sourced records elsewhere, but put all new directory acquisition/verification effort into the eight primary markets until each has a separately reconciled official provider inventory. Do not automatically classify a market as complete because another directory reports a number of entries.

**Primary:** United States (US), United Kingdom (GB), France (FR), Spain (ES), Portugal (PT), Italy (IT), Mauritius (MU), India (IN).

**Secondary, English/French audience:** Ireland, Canada (including Québec), Belgium, Switzerland (French-speaking cantons), Réunion, Guadeloupe, Martinique, Australia, New Zealand.

The national market register, hub cities, original-source links and acceptance requirements are in `data/directory/research/traveller-priority-markets-20261009.v1.json`. The reproducible baseline is `npm run directory:audit:priority-markets`. It lists source records and Mass assertions, **not** verified unique physical church totals.

## Two parallel acquisition workstreams

**A. Complete the smaller but important traveller markets:** 
- **Mauritius:** Validate named church and precise time against the original ICKSP Mauritius apostolate, not a universal liturgical-calendar PDF; contact priest for uncertain monthly services.
- **Portugal:** Reconcile October 2026 FSSP Fátima timetable and official SSPX Portugal chapels (Lisbon, Porto, Fátima) without conflating different chapels or monthly-only service.
- **India:** Reconcile SSPX official 12-place country index against the smaller canonical Mass corpus; exclude school-only, friendly and non-Mass place types; separately research diocesan Masses in Goa, Mumbai, Chennai, Bengaluru and Kerala.
- **Spain:** Complete official SSPX Spain–Portugal district, FSSP/ICKSP and diocesan lists; Barcelona/Madrid and pilgrim/tourist hubs before marginal regions.

**B. Make large-country travel searches dependable:**
- **US:** City/state priority and regional parish verification; duplicate review before increasing public venue count.
- **UK:** Complete Latin Mass Society/Una Voce source crosswalk with current original parish evidence; retain Scottish and Northern Irish churches, and never confuse Ordinariate or newer Latin Mass with Roman 1962.
- **France:** Finish FSSP, ICKSP, SSPX and diocesan inventories with French original sites and coherent apostolate-vs-physical venue ownership; prioritise major city and pilgrimage routes.
- **Italy:** Prioritise Rome, Vatican-area churches, Assisi, Florence, Milan, Venice, Naples and major pilgrimage places; distinguish 1962 Roman, Dominican or other old rites and modern Latin.

## Traveller-ready acceptance gates

A user selecting any future Sunday (or weekday) should see physical name and address; clearly labelled 1962 Mass or other rite; institution; source URL; Sunday/weekday/date scope; last site review; schedule freshness/status; parish contact when available; accurate directions only with street-level evidence. A first-Sunday Mass is not a weekly Sunday Mass. A temporary or discontinued location is not an active venue. We should never invent a current Sunday Mass from an old PDF or a chapel's general existence.

Verification labels must distinguish:
1. **Current parish/institute timetable checked**, with dated source evidence.
2. **Officially listed Mass location; exact times to confirm**.
3. **Association-listed lead; original verification pending** — do not represent as a guaranteed Mass.
4. **Historical, discontinued, or unlocated** — excluded from active nearby-Mass results, retained in audit.

Target zero known duplicate public physical sites, 100% original source links, zero unlabelled stale schedules. Country *exhaustiveness* can only be asserted after explicit per-provider national inventory reconciliation, including exceptions and newly established chapels; a source-row count alone never certifies it.

## Mauritius quality correction in this PR

Four local ICKSP Mass venues remain linked to the actual apostolate timetable: Collège St-Joseph (Sunday), Maison Père-Laval (Monday, Friday, Saturday), Marie Reine de la Paix (monthly Saturday, date **not confirmed in 2026**), and Hôpital Jeetoo (last Sunday, confirm). The purported Tuesday/Wednesday/Thursday 08:30 Mass at Église Sainte-Thérèse was not substantiated by the local page as occurring **at that church** and is held from active Find. The page includes apparent old future monthly Saturday dates. Its undated publication status must remain visible despite the page being reviewed today. Details in `data/directory/research/mauritius-icksp-venue-evidence-audit-20261009.v1.json`.

**Next acquisition gates:** original FSSP Portugal 2026 monthly schedule + physical venue identity; official India SSPX country-site Mass-kind crosswalk; original Spain SSPX district and current monthly dates; US/France collision review. Re-run coverage audit after each batch rather than chasing an arbitrary 2,500 worldwide number.
