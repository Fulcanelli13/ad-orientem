# CL18 — 39-site physical crosscheck and 74-row recurrence normalization

**26 October 2026. Research-only, stacked above CL17 PR #1760.**

CL17 established a first 39-location FSSP owner-address research pilot, with 74 1962-book-witnessed Mass timetable rows. CL18 improves its **physical-address certainty and event recurrence semantics**, without changing the original CL2 research master, public app, or accepted book population (**256 supported / 176 held** among 432 historical source-wording candidates).

## Deliverables

- All **74** source mass expressions parsed into strict deterministic rule kinds: weekly, nth weekday of month, last Thursday of selected months, or unresolved feast-only requiring manual owner calendar. Exactly **73** are syntactically expandable and **one** (Recklinghausen special feasts) is not.
- **12 named physical sites independently crosschecked** against local FSSP, hospital, parish or heritage evidence; **27** of the 39 remain national-directory-only within this CL18 secondary check. A second-source review is not coordinate/entrance certification.
- Site and schedule conflicts exposed, cross-referenced to source URLs, frozen group/row IDs, and **prohibition on automatic release** where details remain ambiguous.
- A deterministic **2026-10-27 through 2026-12-31** projection of possible Mass dates for testing the normalizer. **Every projected date is explicitly UNVERIFIED and release-blocked**, not a statement that an actual Mass will occur that day.
- One site table, one normalized rule table, one event projection table and CSV exception reports; all regenerate without charge from committed GitHub source.

## High-consequence cross-source differences

* **Ried-Hörmannsberg St Peter & Paul:** German FSSP lists Meringer Straße **4**, international FSSP and listed heritage material identify the worship church at **2**. Resolve actual entrance before geocoding.
* **Amberg St Augustinus:** German FSSP, heritage guide and school's address sometimes give Deutsche Schulgasse **2**, but international FSSP and monument inventory assign **4** to the church itself. School complex/address is not automatically a door-level church coordinate.
* **Recklinghausen St Joseph:** German FSSP and local parish agree Grullbadstraße **94**; international directory formerly gave **93**; the kindergarten is at **94b**. The local FSSP apostolate describes a Mass on the **Saturday following the first Friday** (not necessarily the first Saturday of the month) whereas national German schedule says **first Saturday**. Frozen row 3456 remains a conditional date gate.
* **Neumarkt St Jobst:** German FSSP Sun **10:15** conflicts with the host parish's owner schedule of Sun **10:00 and 11:15**. Mon/Fri 18:00 remain source-corroborated, but the Sunday historic recurring clock is held at currentness gate.
* **Türkheim Kapuzinerkirche:** Local FSSP confirms weekday **18:30** but expressly says the weekday evening Mass sometimes transfers to the ordinary parish church. The recurring Mass book/time is not proof that every actual occasion is at Kapuzinerkirche; preserve conditional venue routing.
* **Grafing Dreifaltigkeitskirche:** The local FSSP page confirms Monday **19:00** **except feast days**. Do not blindly populate holiday Mondays.
* **München Kreuzkirche:** Local FSSP confirms Catholic Allerheiligenkirche am Kreuz, Kreuzstraße **10**, all six patterns. The Damenstiftskirche is temporarily closed owing to damage. Never match the homonymous Protestant Kreuzkirche.
* **Wigratzbad:** Sühnekirche 07:55 and Seminarkapelle 10:15 are different chapels; Gnadenkapelle 17:15 is a third separate Mass site **outside this 432-wording cohort**, not to be silently imported.
* **Ingolstadt St Willibald:** Local FSSP supports Sunday 10:00 but any historic feast-day 11:00 override requires dated confirmation.
* **Potsdam:** one Alexianer hospital chapel with distinct worship-site and vehicle-access addresses, as established in CL17.

Principal first-party references:

- [FSSP German national Mass-site source](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php)
- [FSSP Munich local schedule](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/muenchen/gottesdienstordnung.php)
- [FSSP Türkheim local schedule](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/tuerkheim/gottesdienstzeiten.php)
- [FSSP Wigratzbad seminary schedule](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/priesterseminar/gottesdienstordnung.php)
- [FSSP Recklinghausen local schedule](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/recklinghausen/messzeitentermine.php)
- [St Johannes Neumarkt's own St Jobst schedule](https://www.st-johannes-neumarkt.de/filialkirchen/st-jobst)
- [FSSP international venue register](https://www.fssp.org/en/find-us/where-are-we/)

## Date previews are NOT confirmations

The exported `cl18_unverified_future_rule_projections.csv` is generated solely by pure date arithmetic from source rule strings. It does not implement the complete 1962 feast calendar and has **not** checked future bulletins, surprise cancellations, special feast offsets, school holidays, renovations, date/time zones, travel access or church entrances. Every row is tagged `UNCONFIRMED_RULE_PREVIEW`, `current_occurrence_verified=0` and `ready_to_publish=0`. The lone feast-only record is not mechanically expanded. Second-Monday Wuppertal exclusions are explicitly suppressed; other complex monthly/feast/time/alternate-venue issues remain held.

## Reproduction and safeguards

After reconstructing CL2–CL17 SQLite with [CL17's existing documented workflow](../../../../.github/workflows/directory-cl17-release-gates.yml):

```sh
python3 tools/directory/reconcile-cl18-calendar-address.py \
 --db /tmp/ao-cl18.sqlite --out-dir /tmp/ao-cl18
```

Research-only tables: `cl18_recurrence_rules` (74), `cl18_site_verification` (39), `cl18_unverified_projection` (unconfirmed rule-only date projections). Exports: 74 normalized slots, 39 site checks, future projections, manual exception queue and summary. The source registry `local-crosschecks.json` is permanently committed and verifies direct source URLs and original row IDs. CI verifies row coverage and hard database constraints: **0 approved geocodes, doors, public pins, current Mass occurrences, Una Cum claims or current Mass-time releases.**

### Next gate

Obtain independently verified point/entrance for those 39 sites, beginning with 12 already locally crosschecked and treating two disputed door numbers carefully. In parallel, reconcile Sunday St Jobst 10:15, Recklinghausen monthly Saturday and Türkheim alternate church against **actual upcoming owner calendars**. Only after independent physical identity, currentness and conditional liturgical rule signoffs may any listing be considered for public promotion.
