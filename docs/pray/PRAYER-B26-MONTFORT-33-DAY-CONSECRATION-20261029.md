# B26 — Montfort, original-source 33-day preparation and consecration

**Date: 29 October 2026** · single owner: existing **Pray → Devotions & Novenas**. No parallel app, paid service, new top-level family or rewriting of the calendar.

## What Montfort actually wrote

St Louis-Marie Grignion de Montfort, *True Devotion to the Blessed Virgin*, §§227–233, prescribes **at least twelve days** to empty oneself of the spirit of the world, then **three weeks**, respectively for knowledge of oneself, of Mary, and of Jesus Christ. Montfort does **not** assign thirty-three day-specific Scripture passages or thirty-three unique day prayers. His original text itself refers to an incomplete/lost earlier section giving more detail for the first twelve days; later 33-day pamphlets and 1958 supplemental schedules have their own authorship.

Source: original historical English Faber translation https://www.ecatholic2000.com/montfort/true/devotion.shtml ; Montfortian scholarly discussion of the missing first part https://www.montfort.org.uk/Course/Lesson%204.php ; compare official translation https://montfort.org.uk/Writings/TD.php **for understanding only, not republication**.

The programme maps:
- Days **1–12**: empty oneself of the spirit of the world (§227). No individually authored Montfort reading is fabricated.
- Days **13–19**: knowledge of self (§228). Litany of the Holy Spirit (with its collect), Ave Maris Stella, Litany of Loreto.
- Days **20–26**: knowledge of Mary (§229). Litany of the Holy Spirit, Ave Maris Stella, at least five decades of the Holy Rosary.
- Days **27–33**: knowledge of Jesus Christ (§230). Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus; Montfort also recommends a prayer traditionally attributed to St Augustine.
- **Day 34**: a distinct chosen consecration day (§§231–232): Confession and Holy Communion with the given intention, then the complete original act (here public-domain English Faber 1863); sign the act personally, and optionally make a humble offering or act of penance. Annual renewal is described in §233.

These labels are a **source-directed programme** and its user navigation, not a newly discovered authoritative book of 33 readings.

## Internal UI implementation
The new source-owned `pray.montfort_consecration` route appears **inside** the already existing `Devotions & Novenas` family beside St Joseph's seven pairs. It uses the same Pray reader shell:

- Four restrained stage buttons (12 days + 3 consecutive weeks), previous/next/current-day controls, source-accurate day 34 act, and a thin progress meter.
- Pick a **consecration target date**. Date arithmetic is UTC date-only (no DST drift); preparation begins 33 calendar days before the target and ends the preceding day. Examples: **8 Dec 2026 → 5 Nov 2026** and **25 Mar 2028 → 21 Feb 2028** (leap year).
- The liturgical **1962 feast transfer** cannot be presumed from a nominal fixed Marian date, so the app clearly labels dates as **personal devotional selections**; it doesn't change Ad Orientem's public liturgical Calendar.
- User-driven completed-day checkboxes and progress are kept **only in localStorage on this device**. No remote sync, no compulsory streak, no personal health/spiritual reports or coercive tracking. Changing target date resets completion marks in this first version. The act is never signed automatically.
- Daily phase explanations EN/FR are expressly **editorial rubrics**, not authored historical prayers. English 1863 Faber consecration act and Latin traditional `Ave Maris Stella` are shown inside reader and labelled by source. There is **no invented French translation** of the act.

## Source completeness — explicit remaining gap
The reader **does not claim** the entire 33-day method can be completed inside the app with only the implemented prayer texts:

- Existing canonical 48 prayer corpus supplies the 1962 Litany of Loreto and the shorter `Come Holy Spirit`. The shorter invocation is **not** the Litany of the Holy Spirit and must never be falsely labelled as such.
- Existing Rosary route covers five decades in the second week.
- Public-domain Latin `Ave maris stella` has seven stanzas.
- The source-qualified **Litany of the Holy Spirit and its collect**, **Litany of the Holy Name of Jesus**, and the complete Montfort-quoted Augustine prayer remain separate admission tasks. They are *named* in the relevant phase rather than silently omitted or substituted. Exact historical print editions must be selected before incorporating them.
- Faber 1863 act is fully presented from an attributable historical digital English witness, but original printed-page facsimile **word-for-word collation has not been performed**. Original French for the act remains an independent editorial task.
- The 1987 Montfort Missionaries copyright text is **not reproduced**. Source §227–233 official English 1987 is referred to only for establishing theological instructions.

Potential source witnesses for later exact litany incorporation: 1897 *Manual of Adoration* pp.235–239 for the Litany of the Holy Ghost and following prayer; 1910 *Raccolta* no.56 pp.50–54 for the Litany of the Most Holy Name; historical Faber original for Augustine's attributed prayer. The published edition number and language are required, not scraped unsourced prayer variations.

## Tests
- `tests/pray-b26-montfort-source-faithful-preparation.mjs` tests exact 12+7+7+7, no fabricated authored daily content, 33-before feast arithmetic, leap years, invalid calendar dates, historical Faber act, Latin hymn, 48 original prayers and 16 novenas unchanged.
- `tests/pray-chaplets-discovery-phone.mjs` checks opening the actual contextual Prayer route, date selection 8 Dec 2026, phase navigation, source-owned Loreto, existing Rosary, full original act on day 34, 320px/390px no clipping, and device-local progress retention.
- All gates must pass before merge; build exact-SHA Vercel READY must be checked before claiming public deployment.

**Next bounded editorial item**: one compact source-backed litany supplement (Holy Spirit + Holy Name) and original 1863 print-facsimile proofreading. No more discovery rounds or separate Marian-compendium programme.
