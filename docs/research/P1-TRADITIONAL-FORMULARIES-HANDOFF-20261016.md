# P1 — Traditional Mass formulary research handoff (2026-10-16)

## Isolation and reconciliation
- Research branch: `research/1224-traditional-formularies`
- Immutable starting commit: `359ed283ebc6dd28797039c9667791c80323c271` (merged calendar PR #1226)
- P0 and P2 owners, `main`, Mass-reader and principal Proper files unchanged by P1.
- Existing source contracts retained: `data/calendar/traditional-mass-formulary-review.v1.json`, `traditional-1962-common-formularies.review.v1.json`, `traditional-calendar-adjudication-matrix.v1.json`, `src/calendar/traditional-formulary-review.js`, `src/calendar/traditional-day-adjudication.js`.
- Do not replace those files wholesale. Join by canonically resolved person IDs, existing Common IDs and source URLs. P2 remains date-evidence owner.

## New research-only assets
1. `data/calendar/p1-rubrical-permission-matrix.v1.json` — 35 research rules and explicit form-specific commemoration limits, reference exact RG/RGMR/Cum sanctissima paragraphs.
2. `data/calendar/p1-1962-formulary-master.v1.json` — 38 distinct 1962-claimed Common entries from Missale Online index, all 11 possible component slots. Three IDs reused from existing owners; 35 new index IDs deliberately provisional.
3. `data/calendar/p1-three-oration-commemoration-matrix.v1.json` — source-located Leonardi and Dionysius/Rusticus/Eleutherius Collect, Secret, Postcommunion; four form-specific combinations, all held.
4. `data/calendar/p1-saint-formulary-crosswalk.v1.json` — 293 deduplicated canonical person IDs (includes 258 already in canonical post-1960 census and 38 Doctors roster, with overlap) plus 13 collective groups. Candidate Common joins never become selected or permitted Masses.
5. `data/calendar/p1-reference-cases.v1.json` — Newman, Padre Pio, Thérèse of Lisieux, Teresa of Ávila.
6. `data/calendar/p1-exception-backlog.v1.json` — 20 outstanding certification and jurisdiction blockers.
7. `tests/calendar-p1-traditional-formulary-research.mjs` — preservation and fail-closed invariant tests.
8. `.github/workflows/calendar-p1-traditional-formularies.yml` — branch PR CI.

## Evidence and legal interpretation
Primary Holy See: [Cum sanctissima](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_decreto-cum-sanctissima_en.html), particularly §§1–8 and 70-feast annex. Original Latin witnesses should be collated to 1960 Code and 1962 Missal scan; secondary transcription: [1960 General Rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html) §§91–115; [Rubrics of Missal](https://maternalheart.org/library/1962rubrics.pdf) RGMR §§302,311,356–361,433–446.
Common-form index: [Missale Online](https://missale.online/proprium/en/commune), independently indexed at [SSPX UK](https://fsspx.uk/en/proper-prayers-traditional-latin-mass-31673). Existing three Common records are re-used, not duplicated.
[Leonardi 9 October 1962 page](https://missale.online/kalender/en/2026-10-09) separately exposes both the Leonardi Proper and the historical Dionysius/Rusticus/Eleutherius commemoration. The source displays three orations for each; the project does **not** yet have independent original-1962 printed collation.
[St Kevin's official October 2026 newsletter](https://static1.squarespace.com/static/5fc7d9f84168c7185c8793de/t/6abd27217199117f41002de4/1790781217379/2026%2BOctober%2BNews.pdf) p.1 announces an 08:00 Mass, 19:00 High Mass and relic blessing for Newman. The precise historical celebrant's Mass formulary and commemoration praxis are **UNKNOWN**.
[2026 Ember Wednesday SSPX Ordo](https://ordo.fsspx.org/day/2026-09-23?lang=en&mode=liturgical): September 23 is II class, barring ordinary optional saint-festive substitution in that audited case.
Later Doctor title primary witnesses: [Teresa 1970](https://www.vatican.va/content/paul-vi/en/apost_letters/documents/hf_p-vi_apl_19700927_multiformis-sapientia.html) and [Thérèse 1997](https://www.vatican.va/content/john-paul-ii/en/apost_letters/1997/documents/hf_jp-ii_apl_19101997_divini-amoris.html).

## Exact coverage, not acceptance claims
- 35/35 source-cited *rule research entries*, but legal interpretation of the 2020 §4 / RG 111(a) nonconventual Sung conflict remains **held**.
- 38/38 index entries mapped to all component slots; **0/38 print-1962 complete text collations**. The 35 provisional IDs are not ready for runtime.
- 2/2 targeted pre-existing October 9 oration trios located in secondary traditional text; **0/2 printed-edition certified**.
- 293 unique canonical people + 13 groups: identity-index coverage, **0/293 certified individual source-to-formulary authorization**. This is not a date-research result.
- 4 reference cases, 20 unresolved approval blockers.
- No Latin prayer text invented or imported, no modern Proper borrowed, no reader or Calendar principal altered.

## P0 integration contract
Do not load `p1-*.json` into production until source approvals and applicable authority have been documented. Preserve `day.main`, `selectedFormularyId`, principal 1962 Mass, `LIVE`, `MISSAL`, `SIMPLE`, and existing 1962 orations.
Only join `p1-saint-formulary-crosswalk.v1.json:persons[].saintId` to existing Calendar canonical saint identities; no replacement tables. Connect 3 already-owner Common IDs directly; 35 research index IDs require reconciled `formularyId` before import.
`sourceComponents.*.latinText === null`, `approvedForRuntime === false`, or `sourceSpecificProperStatus === UNVERIFIED` blocks release. A located secondary text without primary print collation cannot certify prayer wording or grammatical `N.` use.
Resolve total commemoration order and conclusions for each actual form; in particular, `SUNG_NONCONVENTUAL` under Cum sanctissima §4 / RG 111(a) must remain indeterminate, not allowed by default.
P2 remains independent. Its verified date evidence does not authorize Mass or commemoration; P1 applies legal facts without choosing a celebrant's actual Mass.

## Test
`node tests/calendar-p1-traditional-formulary-research.mjs`; also historic `node tests/calendar-traditional-formulary-sources.mjs` and `node tests/calendar-traditional-adjudication.mjs`. Confirm the Actions run status; do not claim acceptance until it completes.

**Overall readiness: research handoff only. Liturgical-text certification and legal exceptions are blockers to production integration.**

## P1 certification extension — primary Latin and direct Common source links (2026-10-16)

**Original legislation now independently collated.** The Vatican-hosted [AAS vol.52, 1960](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf) was visually inspected at PDF pages 614, 615 and 670 (printed pp.615, 616 and 671). The scan confirms RG 106–115, including RG108 ordinary commemorations only at Lauds, conventual and Low Mass; RG109 privilege taxonomy; RG111(a) literally `praeter unam privilegiatam` (at most one privileged commemoration for I-class and nonconventual sung Mass); RG111(d) two maximum for class III/IV; and RGMR434(a) expressly restricts nonconventual sung Mass to one privileged prayer. RGMR435–438 provide the count cap and separate oration conclusion rules.

**Source quality defect corrected.** The formerly cited [isidore.co English online transcription](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html) omits the real RG108 and labels RG109 as RG108. It is now demoted as a corrupt secondary witness in `p1-rubrical-permission-matrix.v1.json`; the authority is original Vatican AAS, not the HTML.

**Common catalogue now has exact per-page URLs.** The [38 individual Common pages](https://missale.online/proprium/en/commune) were all opened individually, and `p1-1962-formulary-master.v1.json:forms[].directIndexSourceUrl` now has 38 exact, unique links with the matching seasonal/alternative source suffixes. That is 38/38 secondary index links recovered, **not** original printed Latin collation (remains 0/38); no artwork, Latin text or Proper auto-import.

**Three-oration source witnesses doubled.** The October 9 Leonardi and Dionysius/Rusticus/Eleutherius Collect/Secret/Postcommunion each have matched short Latin incipits in [Missale Online](https://missale.online/kalender/en/2026-10-09) and [Missale Meum](https://www.missalemeum.com/en/calendar/2026-10-09). The 6 individual prayers now retain both exact source URLs, incipits and the correct source-displayed conclusion types. **0/2 trios have original printed-1962 page collation**, so no in-app prayers are introduced.

**Independent online Ordo disagreement held, not adopted.** The [SSPX Ordo](https://ordo.fsspx.org/day/2026-10-09?celebration=403&lang=en&mode=liturgical) labels its October 9 page St John Leonardi but displays `Sapiéntiam Sanctórum`, a generic multiple-martyr Collect with `N. et N.` and Luke 6:17–23. The other two independently hosted historical Leonardi witnesses give `In sermónibus Dómini`, the Leonardi-specific Collect and Luke 10:1–9. This specific Ordo text view cannot certify Leonardi prayers until its source selection is explained. Do not infer anything about the actual St Kevin's Mass from these web pages.

The normative audit is in `data/calendar/p1-primary-latin-and-oct9-source-audit.v1.json`, including exact printed AAS page numbers, secondary-witness discrepancy, and formal-interpretation hold for *Cum sanctissima* §4 vs RG108/111(a)/RGMR434(a). Original 1962 [CMAA 1962 facsimile](https://musicasacra.com/2007/10/missale-romanum-1962/) has been identified as the next physical-edition collation target. It is a large PDF, and **no printed-page collation has yet been completed**; do not misrepresent source discovery as certification.

**CI:** The dedicated research test has been strengthened for the original Latin source and all 38 exact page URLs. The required broad regression check should be inspected independently before the PR is considered integration-ready; passing structural tests is not authority to merge/deploy or publish Latin texts.
