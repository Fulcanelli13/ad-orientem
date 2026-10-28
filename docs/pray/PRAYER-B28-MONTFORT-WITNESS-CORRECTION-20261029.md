# Pray B28 — Montfort historical-litany provenance and reading quality correction

**29 October 2026.** This is a finite corrective maintenance pass on the already-live Montfort programme (B26–B27), **not** a new devotional acquisition batch.

## Editorial finding and correction

The B27 Litany of the Holy Ghost source label incorrectly presented the 1897 *Manual of Adoration of the Most Blessed Sacrament* as the source of the exact prayer wording. The available printed manual **index** establishes only that a Litany of the Holy Ghost appears beginning on **printed page 235**, not that its text agrees line for line with the **online supplementary consecration litany** actually entered into B27.

B28 fixes the owner-of-record to the actual digital text witness:
- Original 1863 Faber translation together with a **later preparation appendix**: https://www.ecatholic2000.com/montfort/true/devotion.shtml , section **Litany of the Holy Ghost**. This website explicitly combines historical Faber source material with a later 1958 33-day appendix; **do not attribute the appendix's wording to Montfort or Faber**.
- Separate **1897 index/reference lead**, not a verified identical recension: https://www.sing-prayer.org/manual-of-adoration-of-the-most-blessed-sacrament-1897 (litany listed at p.235). Full source photographic comparison not completed; URL no longer used as primary wording attribution.
- Existing Holy Name digital witness independently supported by **Bonaventure Hammer, 1909**: https://en.wikisource.org/wiki/Mary,_help_of_Christians/The_four_Approved_Litanies and https://www.gutenberg.org/files/33596/33596-h/33596-h.htm .
- The prayer attributed to Augustine remains fully preserved as Montfort transmits it in §67, with Faber's public-domain English and the transmitted Latin, **not** a historically authenticated autograph.

The corrected provenance is present in **all three places**: the persisted B27 text/source master, the runtime-owned prayer projection and the B26 admission ledger. The historical B27 release document is amended with an explicit **B28 correction** so it cannot continue to mislead downstream research.

Neither the exact 1897 original photograph nor an original historical French litany is claimed as verified. No modern 1987 Montfort Missionaries copyright text is copied.

## In-app UI: grouping without changing devotional text
The Montfort owner remains the same **Pray → Devotions & Novenas** interface; its 33-day sequence, day 34 consecration, personal progress and sacred calendar are untouched.

- The **Litany of the Holy Ghost** is still **49 exact source rows** but now visually divided into *Opening → Invocations → Petitions → Lamb of God, versicle and collect* (four editorial titles).
- The **Litany of the Most Holy Name** is still **76 exact source rows** divided into *Opening → Invocations of Jesus → Appeals for mercy → Deliverance petitions → Lamb of God and closing responses → Concluding prayers* (six editorial titles).
- The chapter titles are **editorial navigation aids**, never recited as original prayer text. Each prayer still uses the original line-and-response display. No ritual sequence, actor/speaker, prayer body, canonical 48 prayer, or original 16 Novenas is changed.
- The original-language/witness warning and actual source link are now visible **before** all of the long invocations so users do not have to reach the foot of a multi-page litany to see the relevant edition limitation.
- No new app route, new external dependency, mobile service, paid storage, translation or stage count.

## Acceptance
- Required tests `tests/pray-b28-montfort-witness-and-litany-reader.mjs` assert the source master and runtime remain text-identical; the Holy Ghost 1897 printed-text identity flag is **false**; 1909 Holy Name and §67 source ownership are unchanged; all 49/76/6 prayer rows remain, and the original 48/16 are immutable.
- Existing real Chromium 320px/390px Prayer-first test confirms long-litanies expand, four and six editorial chapter headings are present, source witness notice precedes original body, actual digital source link is correct, and mobile doesn't clip.
- Do not merge until latest required-main regression and affected phone workflows report success, then verify exact merge commit on the existing zero-cost Vercel production environment.

## Closure boundary
This correction **does not** certify the 1897 printing and does not start another research programme. The unverified independent print recension remains an optional bibliographic quality improvement, not grounds to claim source text is missing or to reassign the existing 33-day programme.
