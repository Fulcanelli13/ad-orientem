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

## Sunday-overlap rubrical dispositions — added 17 October 2026

The previous **24 screening candidates** now each have a bounded, independently inspectable *preliminary general-calendar rubrical assessment* in
[`data/calendar/1962-sunday-overlap-dispositions-2026-2028.review.v1.json`](../data/calendar/1962-sunday-overlap-dispositions-2026-2028.review.v1.json).
All 24 are classified under the 1960 Sunday-precedence and commemoration clauses; **0 new Calendar omission claims, 0 Mass changes and 0 automatically created commemorations** follow.
This is **24/24 preliminary rule-level disposition**, **not 24/24 completed Proper/source certification**.
The previously published and separately crosschecked 12 omissions remain the only source-reviewed omission records.

The original [AAS pp. 598–599, 615–616](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=615)
provides RG 15–16, 93, 95, 109 and 111(a–b). RG 109 defines ordinary versus privileged commemorations; RG 111(a–b) blocks a third-class saint's ordinary commemoration on first- and second-class Sundays (absent a separately established particular rank, permission or privileged case).
RG 95 allows accidental transference only for first-class feasts.
The `Cum sanctissima` annex is not the source of Sunday precedence or the calendar Proper.
The printed general-calendar witness [GCatholic 2026](https://gcatholic.org/calendar/2026/Extraordinary-en),
[2027](https://gcatholic.org/calendar/2027/Extraordinary-en), [2028](https://gcatholic.org/calendar/2028/Extraordinary-en)
and the individually linked FSSPX monthly ordos corroborate dated principal identities,
but cannot establish a universal special institute rank or certify all source/oration parity.

| Date | Fixed III-class feast in protected annex | Preliminary general-calendar Sunday principal | Scope/source exception |
|---|---|---|---|
| 2026-01-25 | Conversion of St Paul | III Sunday after Epiphany (class 2) | None identified |
| 2026-02-01 | St Ignatius, Bishop and Martyr | Septuagesima Sunday (class 2) | None identified |
| 2026-06-14 | St Basil the Great | III Sunday after Pentecost (class 2) | None identified |
| 2026-06-21 | St Aloysius Gonzaga | IV Sunday after Pentecost (class 2) | None identified |
| 2026-07-19 | St Vincent de Paul | VIII Sunday after Pentecost (class 2) | None identified |
| 2026-08-02 | St Alphonsus Liguori | X Sunday after Pentecost (class 2) | None identified |
| 2026-09-27 | Ss Cosmas and Damian | XVIII Sunday after Pentecost (class 2) | None identified |
| 2026-12-13 | St Lucy | III Sunday of Advent (class 1) | SECONDARY_ORDO_CONFLICT |
| 2027-01-17 | St Anthony, Abbot | II Sunday after Epiphany (class 2) | None identified |
| 2027-01-24 | St Timothy | Septuagesima Sunday (class 2) | None identified |
| 2027-01-31 | St John Bosco | Sexagesima Sunday (class 2) | None identified |
| 2027-03-21 | St Benedict | Palm Sunday (class 1) | PARTICULAR_RELIGIOUS_CALENDAR |
| 2027-04-11 | St Leo the Great | II Sunday after Easter (class 2) | None identified |
| 2027-05-02 | St Athanasius | V Sunday after Easter (class 2) | None identified |
| 2027-05-09 | St Gregory Nazianzen | Sunday after the Ascension (class 2) | None identified |
| 2027-08-29 | Beheading of St John the Baptist | XV Sunday after Pentecost (class 2) | None identified |
| 2027-09-12 | Most Holy Name of Mary | XVII Sunday after Pentecost (class 2) | None identified |
| 2027-10-03 | St Thérèse of the Child Jesus | XX Sunday after Pentecost (class 2) | PARTICULAR_PATRONAGE_RANK |
| 2027-11-14 | St Josaphat | VI Sunday after Epiphany (transferred) (class 2) | None identified |
| 2028-02-06 | St Titus | V Sunday after Epiphany (class 2) | None identified |
| 2028-03-12 | St Gregory the Great | II Sunday of Lent (class 1) | None identified |
| 2028-04-30 | St Catherine of Siena | II Sunday after Easter (class 2) | None identified |
| 2028-09-03 | St Pius X | XIII Sunday after Pentecost (class 2) | SSPX_PARTICULAR_FIRST_CLASS |
| 2028-10-15 | St Teresa of Ávila | XIX Sunday after Pentecost (class 2) | None identified |

Four separately tracked exception situations must **not** be flattened:
1. **13 December 2026, St Lucy** — Advent III remains principal. A secondary 1962ordo page [explicitly claims a Lucy commemoration](https://1962ordo.com/2026/12/13), while [FSSPX's dated 2026 ordo](https://ordo.fsspx.org/day/2026-12-13?lang=en) shows the Advent Mass. The first-class ordinary-commemoration exclusion is clear, but leave the pre-existing conflict hold until the actual Missal orations and resolver are checked.
2. **21 March 2027, St Benedict** — Palm Sunday is first class in the general calendar. Benedictine particular rank/observance and any transfer require their **own** authenticated religious calendar; they do not follow from the general III-class record.
3. **3 October 2027, St Thérèse** — [SSPX October 2027 ordo](https://ordo.fsspx.org/calendar/2027/10) lists the saint alongside Sunday, and [its September 2026 calendar](https://ordo.fsspx.org/calendar/2026/9) explicitly calls her a **second-class secondary patroness of France**. This particular-calendar rank can explain a commemoration that is *not* generally available for the universal III-class feast. Confirm jurisdiction before importing.
4. **3 September 2028, St Pius X** — [SSPX September 2028](https://ordo.fsspx.org/calendar/2028/9) has **first-class St Pius X** with XIII Sunday after Pentecost as additional observance, in contrast to the 1962 general-calendar third-class feast. Keep the existing `PIUS_X_SSPX_2028` particular-scope hold.

**Remaining acceptance:** match all 24 against the canonical DayResolver principal ID, actual 1962 Proper identity and orations, canonical commemoration owner, and dated independent witness (not merely year/month access). Where a particular rank applies, retain separate jurisdiction and venue witnesses. The registry is read-only research input and deliberately **not** a runtime calendar rule or publication source. The executable Calendar audit enforces exact 24-date coverage, class/rubric compatibility, four exceptional holds and no automatic Mass mutation.

## Production resolver/Proper parity acceptance (17 October 2026)

[Chromium production audit run 39008864503](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39008864503)
tested all 24 date-specific, read-only preliminarily reviewed Sunday cases directly through `AO_RUNTIME_V8.resolver.resolveDay`. Result: **24/24 days ready, 24/24 canonical Sunday identity/class and Proper paths matched, 0 third-class displaced saint commemorations, 0 missing oration groups, 0 mismatched Collect/Secret/Postcommunion counts**. The observed principal IDs and canonical Proper source paths are now stored as date-specific `productionSnapshot` fields, with equal **1 / 1 / 1** primary Collect, Secret and Postcommunion arrays in each case.

A separate path-scoped browser workflow runs **strictly** and fails if any previously observed ID, Proper source, commemoration source ID or oration count drifts. The existing non-browser `test:calendar-coverage` gate also checks the snapshots and publication restrictions. This is a **production source-owner parity gate**, not collated certification of the original printed 1962 texts, use of other particular calendars, or authorization of additional Mass formularies. The four contextual exception holds remain in force. Any discrepancy is an audit finding until adjudicated; no fallback replaces original source prayers.

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
