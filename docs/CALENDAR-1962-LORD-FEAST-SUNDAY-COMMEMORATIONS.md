# 1962 Calendar: Lord's feast on a second-class Sunday (source-owner correction)

**Dated evidence:** 9 October 2026. **Scope:** Universal 1962 Roman Calendar; shared pinned DayResolver/Proper, not a Calendar display override. **Issue:** [#741](https://github.com/Fulcanelli13/ad-orientem/issues/741).

## Normative rule and original source

- [*Rubricae generales Breviarii et Missalis Romani* (1960), official AAS 52](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597), nn. **16(a), 17(d)**: a first-/second-class feast of Our Lord occurring on a second-class Sunday takes the place of that Sunday, with its rights and privileges; there is **no commemoration of that Sunday**. Christ the King is expressly assigned to the final Sunday of October; other named exceptions include the Holy Name, Holy Family and Most Holy Trinity.
- [English reference translation of nn. 16–17](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html). This is a reference to, not a replacement for, the Latin AAS.
- [Independent date reconstruction, 2024](https://gcatholic.org/calendar/2024/Extraordinary-en) and [2027](https://gcatholic.org/calendar/2027/Extraordinary-en): both record Christ the King without a commemoration of the displaced Sunday. [Missale Online 2024](https://missale.online/festkalender/en/2024/druck) and [2027](https://missale.online/festkalender/en/2027/druck) likewise list no commemoration for this feast.
- The pinned donor `mmolenda/missalemeum@f43359b7`, `backend/api/constants/common.py`, enumerates a `FEASTS_OF_JESUS_CLASS_1_AND_2` tuple without `SANCTI_10_DU`. It supplies the source-identification inputs but cannot override the 1960 rubrical rule. The shared completion pass also used `source.jesusFeasts?.some?.(...)` on a JavaScript `Set`, whose `.some()` method does not exist; optional chaining silently made the Lord's-feast check false and incorrectly appended Sunday Mass orations.

## Observed defect and correction

| Gregorian date | Principal identity | Previously added, improperly | Expected |
| --- | --- | --- | --- |
| 2024-10-27 | `sancti:10-DU:1:w` | `tempora:Pent23-0:2:g` Sunday commemoration | No Sunday commemoration |
| 2027-10-31 | `sancti:10-DU:1:w` | `tempora:Epi4-0:2:g` Sunday commemoration | No Sunday commemoration |
| 2026-10-25 | `sancti:10-DU:1:w` | Same potential recurring source defect | No Sunday commemoration |

**Implementation:** add the pinned canonical `SANCTI_10_DU` to the existing Lord's-feast identity set **at the shared source loader**. This corrects both the precedence branch in `calendarEngine` and the later privileged-commemoration completion path. No civil-date exception, string/translation matching, extra Calendar engine or UI-only masking.

**Mass prayers acceptance:** require `day.commemorations = []`, no `calendarCommemorations` for a displaced Sunday, and no supplemental Collect, Secret or Postcommunion for Christ the King. A title change alone would not repair the Mass.

**Regression controls:** Holy Family, Holy Name, Trinity, and Transfiguration falling on Sundays must not receive Sunday commemorations. Conversely, do **not** suppress legitimate privileged Sunday commemorations beneath a different I-class observance, e.g. All Saints 2026-11-01 or Assumption 2027-08-15. Preserve Advent III-class ferial commemorations and the reciprocal Petrine commemoration.

## Separate source-title finding

The raw donor labels `tempora:Pasc6-6:1:r` as *Saturday after the Ascension* in 2024 and 2027. The **hydrated production DayResolver** already gives this first-class observance the proper name *Vigil of Pentecost*, consistent with 1960 General Rubrics **n. 30(b)**. The full-year audit must compare the hydrated headline actually displayed by the app and retain the unaltered raw donor title in `sourceTitle`; it must not report a display failure based solely on the donor's older raw caption.

These are limited corrections. They do not certify 731 Mass Propers, the pending 2024/2027 title-alias review, particular calendars, or the explicit violet Rogation Mass (#714, #718).
