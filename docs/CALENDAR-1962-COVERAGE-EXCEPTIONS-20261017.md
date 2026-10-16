# 1962 Calendar — coverage and exception audit (P0 / #719)

**Audit date:** 17 October 2026. **Scope:** General Roman Calendar, 1962 liturgical books, civil years **2026–2028**. **Status:** evidence and CI worklist only. It neither publishes a new liturgical decision nor changes the Calendar, Proper, Mass resolver, or Scripture engines.

## Measured coverage (not an overall completion percentage)

| Distinct evidence population | Count | What the count means |
|---|---:|---|
| Source-reviewed, date-specific omitted third-class feast claims | **12** | Six dates in 2026, three in 2027 and three in 2028. The existing Calendar Day **Sources & scope** explanation requires the actual 1962 resolver and canonical Proper to agree. |
| Protected third-class feasts transcribed from *Cum sanctissima* (2020) | **70** | This is a separate rule governing newly optional Masses. It does not override higher-class Sunday precedence by itself. |
| Protected-feast fixed dates occurring on Sundays during 2026–2028 | **33** | A mechanical **screening** count, not thirty-three liturgically certified omissions. |
| Of those 33 overlaps already represented by dated omission claims | **9** | Dual membership is not inherently a conflict; the 2020 protection has different operative scope. |
| Remaining protected-feast Sunday overlaps needing individual disposition review | **24** | **Do not automatically display as omitted, commemorated, transferred, or a Mass selection.** |
| Reviewed omission records outside the protected-annex list | **3** | Not in the annex does not mean a feast is ineligible or automatically omitted. |
| Existing general-calendar transfer witnesses | **7** | Four have source-matched exact RG clause citations; three are other or unannotated witness states. |
| Particular Dublin chaplaincy witnesses still held for exact venue/jurisdiction/formulary review | **3** | No universal Mass/calendar decision follows from the local announcements. |
| Explicit editorial exception and parity holds | **8** | Tracked separately and blocked from automatic Mass oration changes. |

Do **not** divide twelve by thirty-three to claim overall rubrical coverage; the populations are different. The full denominator of occurring feasts, omitted offices, potential commemorations, and particular-calendar variants **has not yet been established**.

## Source of truth and authority separation

The existing `data/calendar/1962-ordo-corrections.v1.json` remains the single omission and source-adjudication register. `src/calendar/rubrical-claim-citations.js` remains the read-only Calendar explanation adapter. Existing Mass Proper and commemorative prayer owners remain authoritative for prayers, and existing Calendar ↔ Scripture links remain in their respective shared owners. This audit does **not** duplicate any of them.

The normative authority for original precedence and commemoration is the [1960 General Rubrics (AAS 52)](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597). For English editorial checking, [RG 11–18 and 91–114](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html) distinguish first- and second-class Sundays, occurrence and commemoration caps.

The [2020 decree *Cum sanctissima*](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_decreto-cum-sanctissima_en.html), especially nn. 1–2, 6–8 and its annex of 70 protected third-class feasts, governs which newly optional Masses may be celebrated under its provisions. Its [official explanatory note](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_nota-decreto-cumsanctissima_en.html) explicitly explains that first- and second-class celebrations are not displaced by those new options. Hence a date may be in the protected-70 list **and** have a historically valid Sunday omission claim. These are **not contradictory source statuses** and must not be collapsed into an app-wide boolean.

Historical [FSSPX 1962 ordos](https://ordo.fsspx.org/calendar/2028/6), [GCatholic 1962 date witnesses](https://gcatholic.org/calendar/2028/Extraordinary-en), the pinned app resolver, and local venue bulletins are **different kinds of evidence**. An ordo URL alone does not certify the entire Proper or provide local permission for an alternative Mass.

## Exceptions requiring adjudication

| Priority | Case | Current action |
|---|---|---|
| P0 source conflict | **St Lucy, 13 December 2026 / III Sunday of Advent** | A protected third-class saint coincides with a first-class Advent Sunday; secondary commemoration witnesses differ. No published omission/commemoration claim until the original 1962 sources and prayers are reconciled. |
| P1 jurisdiction | **St Pius X, Sunday 3 September 2028** | General third-class rank and possible institute-specific rank/observance must remain separate. No SSPX practice is promoted to a universal calendar rule. |
| Separate Mass form | **Minor Rogations, 6 May 2024 and 3 May 2027** | Preserve the normal Eastertide feria; distinct Rogation procession and violet Mass need explicit selection and source-certified form (**issue #694**). |
| Future witness | **Annunciation, 25 March → 9 April 2029** | The original transfer-oracle witness is not an exact clause-certified Calendar claim in the current 2026–2028 audit scope. Do not extrapolate from 2024 or 2027. |
| Local transfer | **St Philip Neri, Dublin, 2026** | Locally reported first-class transfer from 26 May to 1 June; requires venue, saint, jurisdiction and traditional formulary approval. |
| Local celebration | **St John Henry Newman, Dublin, 9 October 2026** | A high-Mass announcement does not establish an authorized universal 1962 Proper; source and treatment of St John Leonardi require review. |
| Local celebration | **St Luigi Scrosoppi, Dublin, 5 October 2026** | Liturgical versus devotional celebration and exact venue/saint identity still require confirmation. |
| Shared Scripture parity | **Good Friday, Easter Vigil, Ember and commemorated reading contexts** | Existing reciprocal navigation is **not** complete proof of every original reading, wider chapter, edition availability, offline fallback, commentary, and exact return/scroll. Continue #719's independent acceptance work; do not build a second Bible reader. |

All explicit editorial holds are recorded in `data/calendar/1962-rubrical-coverage-exceptions.v1.json`, with an invariant preventing them from changing Mass automatically. The 24 protected-annex Sunday screening rows are generated from the **actual canonical 70-entry list** plus Gregorian weekday calculation; they are **not** hand-promoted into dated claims.

## Procedure and acceptance

Run `npm run test:calendar-coverage` for the **read-only executable audit** or `node tools/calendar/rubrical-coverage-audit.mjs --json` for the full machine-readable rows. The audit reads the existing canonical omission, transfer, protected-annex, particular-calendar and exceptions files; no network call, editor decision, runtime override or day resolver mutation occurs.

An extra case may become a source-linked Calendar explanation only after verifying its original fixed feast identity/class, **actual selected 1962 principal**, matching canonical Proper, occurrence/commemoration under the **exact 1960 clause**, bounded year and jurisdiction, and independent dated witness. Any extra oration must go through the Mass source owner. A protected-annex overlap is **screening-only** until all checks pass. A local witness requires a verified venue/jurisdiction. A source disagreement remains a hold.

The ordinary Calendar CI gate runs the audit and fails if a case duplicates a date, changes Mass, contradicts 1962 principal identity, removes a required particular-calendar hold, incorrectly counts the 70 protected feasts or drifts the reviewed 12/33/9/24 snapshot without a deliberate evidence update. The snapshot records **what has been reviewed**, not a percentage of calendar completion.
