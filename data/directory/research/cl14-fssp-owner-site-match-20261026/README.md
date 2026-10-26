# CL14 — FSSP Germany: direct venue/time 1962 evidence and names/address recovery

**26 October 2026 — research-only continuation of CL13 PR #1753.**

CL13 properly held **73 German FSSP programme-related timetable rows** because generic 1962 institutional authorization and historic source labels did not independently establish the specific church, day and time.

**CL14 closes that exact owner-site/clock evidence gap** using the FSSP's directly accessible, primary [German location-and-Mass-time directory](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php), checked 26 October 2026, with [FSSP's explicit 1962-rubrics celebration policy](https://koeln.petrusbruderschaft.de/wer-sind-wir/). The latter states the community *celebrates exclusively according to the traditional Roman rite following the 1962 rubrics*. The [2022 decree](https://petrusbruderschaft.de/pages/themen/dokumente/dekret.php) corroborates permission to use those books but is **not itself** a timetable, owner role or evidence of a particular celebrant.

## Research result

| Metric | CL13 | CL14 |
|---|---:|---:|
| Candidate Mass rows with adjudication | 432 | 432 |
| Source-scoped 1962 book + precise venue/time evidence supported | 162 | **235** |
| Held pending better exact source evidence | 270 | **197** |
| German FSSP source rows with matched owner place, city and time | 0 | **73** |
| Distinct FSSP churches/chapels identified and addressed | — | **38** |
| New public places, valid live schedules, Una Cum approvals | 0 | **0** |

The dataset locks 73 frozen Mass record numbers, local day/time, 38 individually named worship locations, owner-published street addresses and URLs to the specific relevant section of the owner webpage. Every original record must match an exact historic group ID, source ID and time. The adjudicator also checks all 73 correspond **exactly** to the institutional-programme-only holds in CL13. CL13's source table is not modified; CL14 overlays it with more precise direct evidence.

The 38 places include separate entries for identical deduplicated name *labels*: **St. Joseph** at Recklinghausen and **St. Josef** at Oberhausen and Remscheid, and **St. Leonhard** at Schwäbisch Gmünd versus Nußdorf am Inn. Each of the 38 has a **distinct frozen research group ID**. Do not coalesce by saints' names and do not treat street-address transcription as independently confirmed geocoding, property title or public venue approval.

Some times require explicit recurrence exceptions and must never be reduced to plain weekly values. Examples: Kiel St Nikolaus **first Sunday**; Garmisch St Sebastian **first Sunday**; Leverkusen St Anna **second Monday**; Nörvenich St Martinus **last Thursday of specified odd-numbered months**; Nürnberg St Georg **second and fourth Sundays**; Wuppertal St Antonius Monday **except second Monday and feasts**; Ingolstadt St Willibald occasional **11:00 instead of 10:00**; Recklinghausen St Joseph first Fridays/first Saturdays and feast-only hours. The **Sühnekirche** and **Seminarkapelle** at Wigratzbad are distinct physical chapels despite having the same locality. The FSSP source also includes Stuttgart St Albert first-Sunday **12:00 Sung Mass with English sermon**; this historic non-1962-wording row is **outside** the 432 candidate pool and is not invented as a new acceptance.

## Evidence and verification gates

1. **Source collection:** direct first-party FSSP 1962 programme, named locations, addresses and day/time evidence recorded. All 73 direct row matches are research-accepted.
2. **Physical identity:** original research IDs retained, distinct names/addresses extracted. Physical coordinate, map pin, public-place identity, accessibility and jurisdiction still **not approved**.
3. **Current recurrence:** official national directory was accessible on 26 October 2026, but dated calendar-specific weekly operation and exceptions have **not been separately signed off**. Historic `VERIFIED` timetable is not a future date attendance guarantee.
4. **Institutional and celebrant roles:** official directory establishes FSSP programme attribution. Do not infer property ownership, legal venue ownership, priest names, diocesan permission at other locations, or Una Cum.
5. **Publication:** still zero new approved pins, book filters, current timetable releases or Una Cum flags. No runtime app changes.

## Reproduction

Using Python 3 stdlib, after the documented CL2–CL13 research SQLite reconstruction:

```sh
python3 tools/directory/reconcile-cl14-fssp-owner-site-evidence.py \
  --db /tmp/ao-cl14.sqlite \
  --out-dir /tmp/ao-cl14
```

Permanent checked-in evidence: `owner-slots.json` (38 source-named venues, original row IDs, exact clock/day locks and owner exceptions) and the Python reconciliation/validator. It creates `cl14_fssp_owner_site` and `cl14_fssp_direct_slot` as strictly new research tables. Outputs: `cl14_73_owner_matched_mass_slots.csv`, `cl14_38_named_source_places.csv`, `cl14_summary.json`. All files regenerate after temporary Actions artifacts expire, with **zero paid storage**.

**Next gate:** review the remaining 197 liturgical book claims for better owner text only where available; separately fix physical geocoding and the recurrence publication gate. Do not re-screen these 73 rows.
