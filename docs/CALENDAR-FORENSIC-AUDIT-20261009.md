# Calendar forensic audit — independent release register (9 October 2026)

**Product owner:** Calendar. **Reviewed baseline:** `main` at `1c416e68cd9a38609215aa33a6de979052bc1b26`, reconciled with `d79dae3fdc6981e61083e65f77f84ace9310a43e` after monthly iCalendar export #706 merged. **Correction PR:** #710. **Acceptance:** NOT ACCEPTED pending release gates and unresolved liturgical/UI issues. Do not interpret this review as liturgical certification.

## 1. Complete inspected production inventory

| Production surface | Actual exposed controls and content | Owner and limits |
|---|---|---|
| Calendar shell | Back/Home, contextual Glossary (?), three main view tabs, focused dialog close | `src/calendar/calendar-runtime.js`, lazy-loaded by `browser-entry.js`. No separate week route. |
| **Day** | Prev/next day; date, feast, rank, Mass colour, rite profile and EN/FR text availability; open Mass/Good-Friday liturgy; sources disclosure (PR #710); sanctoral Life & sources link; season overview, percent progress and next major day; devotional programmes, first Fridays/Saturdays, novenas, discipline detail, pilgrimage links; today, seven-day strip, prev/next week, commemorations | Observed feast/Proper from shared runtime day resolver. Devotions from `intelligence.js` and `devotional-registry.js`. |
| **Month · Calendar** | Prev/next month, Today, five month filters, 42-cell Sunday-first day picker and colour/rank marks, status/progress, exact-date input + Go, monthly resolved `.ics` export | `calendar-runtime.js`; 42 cached records do not equal theological verification. Export added by #706 and retained by #710. |
| **Month · Major** | Resolved Sundays and class I/II index, select day | Index is filtered from actual resolved cache, not independent hand-authored feast names. |
| **Month · Temporale** | Resolved temporal-cycle index and select day | Cycle inference currently depends partly on translated feast-name regex. |
| **Month · Sanctorale** | Resolved sanctoral index, select day and saint detail | Subject to same cycle inference caveat; source/biography route belongs to Formation/Saints. |
| **Month · Practices** | First Fridays, First Saturdays, devotion/novena/date links | Practice dates are an *independent devotional registry*, not the day's Mass and Proper; avoids claiming sacramental precedence. |
| **Liturgical year** | Nine segments, circular percentage indicator, season progress, expand/collapse season cards, open first day, browse initial month, next season/major, major-days index | `liturgical-year.js` + `year-journey.js`. The nine-period model is an editorial abstraction, **not** a rubric-complete 1960 seasonal taxonomy. |
| **Unavailable/loading** | Week loader, month partial/loading status, unavailable Day with browse/today; first-use lazy import; failure-cache operations | Day/Month Retry and next-major unavailable/Retry added by #710. Offline/slow-network/multi-language live journeys still need dedicated tests. |

**Not implemented as distinct production screens:** a standalone weekly page, a full-year daily grid, local diocesan ordo chooser, every possible votive-mass chooser from Calendar, a standalone Calendar Scripture reader. Research text or experimental data is not evidence that these exist.

**Navigation contracts to verify:** all `data-cal-*` actions; back and focus return; Mass reader receives selected date and exact Proper; saint details return to the same date; Prayer and Find deep links; language and date locale switching; `.ics` contains no invented times. Each interaction requires Playwright DOM evidence or remains **UNVERIFIED**.

## 2. Primary rubric and provenance hierarchy

1. **Normative:** *Rubricae Breviarii et Missalis Romani*, *Acta Apostolicae Sedis* 52 (1960), pp. 597 onward: https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597. In particular nn. 48–58 (general vs particular calendars), 63–70 (octaves), 71–77 (seasons), 80–90 (litanies), 91–99 (precedence/transfers), 106–114 (commemorations), 116–130 (colours).
2. **Translation/reference, not an official substitute for original:** https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html.
3. **Witnesses of a reconstructed date-specific ordo:** https://gcatholic.org/calendar/2027/Extraordinary-en and https://missale.online/festkalender/en/2027/druck. These are independently useful but do not supersede (1).
4. **Provider:** the canonical Mass DayResolver and its real Proper source paths. A `ready` value means fetched/displayable, **not** independently rubrically certified.
5. **Editorial:** `liturgical-year.js` seasonal illustration and `traditional-year-v384.js` devotional dates. Both must defer to the resolved principal day for liturgical identity.

The official rubric n. 72 defines the Christmas season through **13 January** (its Epiphany portion 6–13 Jan); n. 77 defines `per annum` beginning **14 January**; nn. 119(a), 127(a) distinguish associated ordinary seasonal white and green. The current nine-segment year overview instead extends one green-labelled “Epiphany” segment from 6 January until Septuagesima. This is a confirmed *year presentation* misstatement, **not proof that the DayResolver has a wrong Jan 6 or Jan 13 Mass**. Fix season segmentation without overriding the Mass colour. Likewise n. 76 separates Easter time and Ascensiontide within Paschaltide.

## 3. Severity register (confirmed source findings, pending browser characterization)

| ID | Severity | Finding | Owner | PR #710 status |
|---|---|---|---|---|
| CAL-01 | P1 | 42 fetched entries were labelled “liturgical month verified,” falsely implying independent rubric certification. | Calendar | Corrected label; CI gate |
| CAL-02 | P1 | “Epiphany” year segment falsely continues green through pre-Septuagesima instead of ending Jan 13; Jan 14 is `per annum`. | Calendar year model | OPEN |
| CAL-03 | P1 | Failed next-major lookup could leave permanent “checking” message with no recovery. | Calendar | Corrected state + Retry; CI gate |
| CAL-04 | P1 | Failed day/month cached results had no visible recovery action despite retry API. | Calendar | Corrected Day/Month Retry; CI gate |
| CAL-05 | P1 | Explicit II-class Rogation Mass following litanies/procession still not demonstrated; date-only ordinary Mass is distinct. | Shared Mass option/proper resolver | OPEN/UNVERIFIED; #704 expressly excluded it |
| CAL-06 | P2 | Day showed text-availability badges but no direct normative rubrical source or limitation of general/local ordo. | Calendar + shared source system | Compact disclosure corrected; specific Proper provenance still partial |
| CAL-07 | P2 | Calendar repaint discarded user's half-entered date and focus. | Calendar | Corrected; phone gate |
| CAL-08 | P2 | Good Friday action was labelled “Open this Mass” although this is not a Mass. | Calendar | Corrected |
| CAL-09 | P2 | Temporale/Sanctorale selection uses translatable feast-title regex before stable source identity: fragile under bilingual aliases. | Calendar | OPEN |
| CAL-10 | P2 | Nine editorial seasons omit explicit Ascensiontide; progress percentages and seasonal colour risk being mistaken for juridical ordo. | Calendar year | OPEN |
| CAL-11 | P2 | Scripture references and commentary must hand off to shared contextual reader; Calendar has no comprehensive passage/edition capsule contract. | Scripture/shared navigation | OPEN/UNVERIFIED |
| CAL-12 | P2 | Stale 2024/2027 audit register still describes Rogation default defects superseded by merged #704; old evidence lacks supersession metadata. | Docs/Calendar | OPEN |
| CAL-13 | P2 | Offline, cache invalidation, partial month, persistent focus and route return not demonstrated across English/French and device classes. | Calendar + shared test harness | PARTIAL; full stress evidence UNVERIFIED |
| CAL-14 | P3 | Ordinary days redundantly carried “1962 Mass” profile in a Calendar universally labelled 1962. | Calendar | Corrected |
| CAL-15 | P3 | Oversized progress percentage/ring and “Day n of N” turn the liturgical year into an analytics dashboard rather than primarily showing observances. | Calendar design | OPEN; simplify, preserve clear seasonal strip |
| CAL-16 | P3 | Repeated “practices”, “for this date”, and “next celebration” explanation/cards impose reading cost, especially on phone. | Calendar design | OPEN; collapse to contextual micro-actions |

**Confirmed register:** 16 defects: **P0 0, P1 5, P2 8, P3 3**. PR #710 touches **7** defects (CAL-01, 03, 04, 06, 07, 08, 14); counts are not synonymous with release passes. No P0 observed in the specific source review; lack of a P0 is not equivalent to absence of hidden critical bugs.

## 4. Ten-axis criticism & provisional score

| Scored discipline | Maximum | Initial | After PR #710 code (PROVISIONAL) |
|---|---:|---:|---:|
| Controls and functionality | 20 | 11 | 13 |
| 1962 content and liturgical accuracy | 25 | 14 | 14 |
| Sources / provenance | 15 | 5 | 7 |
| UX / routing | 12 | 6 | 7 |
| Visual design / icons | 10 | 5 | 5 |
| Clarity / clutter | 8 | 4 | 5 |
| English/French and Latin | 5 | 3 | 3 |
| Loading / offline performance | 5 | 3 | 3 |
| **Total** | **100** | **51** | **57** |

These are **expert risk/quality assessments of inspected code**, not blind user-study results. The final score is **NOT CERTIFIED** until actual browser checks, original-rubric adjudication of outstanding cases and merge/regression pass. Icon-bank ownership looks intentional (`assetIcon`, canonical registry), but visual/icon dimensions, screen-reader behavior, low-end device rendering and on-screen beauty **remain UNVERIFIED**. Unit-only tests do not warrant UI credit.

## 5. Required multi-year matrix

| Case | Required ordo/UX assertion | Verification |
|---|---|---|
| 2024-03-25 / 2024-04-08 | Holy Monday occupies March 25; Annunciation transferred April 8 | Prior transfer oracle; re-run actual day resolution |
| 2024-05-06 / 2027-05-03 | Ordinary Eastertide feria vs *explicitly chosen* violet Rogation Mass | Date-only fix merged #704; explicit mode OPEN |
| 2024-12-08 | Immaculate Conception on Advent Sunday, Sunday commemoration | Prior shared resolver correction; test full prayers |
| 2025-11-02 / 11-03 | All Souls on Sunday transferred to Monday | Candidate transfer oracle |
| 2026-05-23 | Vigil of Pentecost, proper phase colours and French name | Existing 2026 source audit |
| 2026-11-01 / 11-30 / 12-08 | All Saints/Advent Sunday and Advent ferial commemorations | Prior 2026 oracle test; re-run |
| 2027-03-25 / 04-05 | Holy Thursday March 25; transferred Annunciation April 5 | Existing independent witnesses / required regression |
| 2027-08-15 | Assumption prevails; Sunday commemoration retained | Existing oracle test |
| 2028-02-29 | Leap-day, month grid and selected date; .ics spans 29 days | Existing export test; full phone scenario needed |
| 2028-03-19 / 03-20 | Lenten Sunday prevails; St Joseph transferred to 20th | Existing transfer oracle |
| 2029-03-25 / 04-09 | Annunciation collides Holy Week and transfers | Existing witness |
| 2035-03-19 / 03-25 / early April | Joseph and Annunciation independent first-class transfers | Existing year-model tests; resolver review needed |
| Every Dec 31→Jan 1; Advent boundary | Civil year rollovers, Sunday labels, selected year, cached Proper | UNVERIFIED multi-locale stress |
| Every mobile/desktop EN/FR | Close, focus return, back, Today, input, date nav, long French title, every action | PARTIAL CI; not blanket pass |

Use **primary rubrics plus two independent dated source comparisons**, and inspect actual Mass text on each selected Proper. If sources disagree, adjudicate rubric first and report dispute; do not silently bless engine output.

## 6. Concrete staged correction plan

- **Batch A — recovery and provenance (PR #710):** truthful loading, real retry controls, Good Friday terminology, less redundant metadata, normative disclosure, typed-date focus, phone/regression tests. Retain integrated .ics export #706.
- **Batch B — season ontology:** split Epiphany portion from time after Jan 13 and expose Ascensiontide without rewriting canonical DayResolver; align `year-journey.js`, labels, test fixtures and full year. Decide whether to show more narrow periods or hierarchy to avoid a busier wheel.
- **Batch C — liturgical option selection:** complete conditional Rogation Mass in shared canonical Proper/Mass selection, preserve precedence/commemorations and following-action; audit local calendars and votives without a Calendar-owned alternate ordo.
- **Batch D — UX reduction and ownership:** stable metadata-based Temporale/Sanctorale classification, compact Year view, avoid repeated practice cards and percentage gimmicks, source drawer/Scripture deep links delegated to shared owners.
- **Batch E — acceptance:** CI, rendered screenshots at 320/390/768/desktop, real touch, font scaling, accessibility (keyboard/focus/screen-reader), French/English, offline/retry, all navigation and orphan buttons; 2024/2026/2027/2028 full original-rubric matrix, especially transfers/commemorations.

**Gate:** Until all are resolved with evidence: **NOT ACCEPTED**. Neither a green CI build nor completion of this written audit is approval.