# Biblical citations in variable 1962 Mass chants — research batch 1

**Date:** 11 October 2026. **Owner:** draft PR #1018, research-only. **No changes to Mass, Scripture, Atlas, LIVE, Proper resolver or 1962 text.**

## New bibliographic shortcut: an index for the entire 1962 Missal

**Matthew P. Hazell, [*Scripture Index of Chants and Readings in the 1962 Missale Romanum* (2013)](https://catholiclectionary.blogspot.com/2013/06/scripture-index-for-1962-mr-and-some.html)** is exactly the kind of scholarship required before searching all the biblical episodes manually. The author describes it as roughly 50 pages of canonical-order indices and warns some errors may remain. His [Scribd copy](https://www.scribd.com/document/152413656/Scriptural-Index-of-Chants-and-Readings-in-the-Missale-Romanum-1962) explicitly lists **Old Testament, Psalms, Gospels, rest of New Testament, and Commons**. His companion [table of 1962 chants and readings](https://catholiclectionary.blogspot.com/2013/05/scripture-in-1962-missale-romanum-ef.html) covers the Missal in liturgical-year order, using the Baronius Press 1962 Missal. The author hosts a link to the PDF on Google Drive, but the external fetch returned an authorisation error; the full original index PDF has **not** been independently parsed or imported. **Do not treat it as yet cross-collated, and do not redistribute its pages/data wholesale without verifying the stated licence.**

This means we should **not invent biblical parallels to fill a book-by-book dashboard**. For every book, the Hazell index can indicate which actual Mass Proper contains it, with witnesses then verified from the current 1962 source text. Separately, the Mass Ordinary's fixed wording has the already certified internal `AO.SM.Cxxxx` cue/phrase IDs; Dujardin meditations remain a third, author-attributed type.

## Evidence collection, not completion claim

- **23** selected source-path celebrations, all already among the **105** exact Gospel/Epistle Proper paths witnessed in the active app; the larger 1962 year has **not** been exhaustively surveyed.
- **92** variable chant positions considered: Introit, Gradual / Tract / Alleluia-containing chant field, Offertory and Communion.
- **81** positions with at least one literal Bible-reference annotation in the Latin Divinum Officium source; **117** distinct citation-note occurrences (some notes contain more than one cited verse or Psalm).
- **11** positions have no direct inline citation (inherited Commons, source stub, or missing section); **18** explicit review holds including 7 Gradual section(s) carrying separate sequence/Tract markers.
- **0** positions are certified against both an independent facsimile of the exact 1962 Proper *and* the relevant Bible edition. **0** have been approved for publication. These figures are a research sample, not statistical coverage of all Masses.

### Source-specific overview

A cited `!Ps`, `!Is`, `!Sap` or similar line below is an annotation in the original Divinum Officium **Latin source file**, **not** independent collation against the Clementine Vulgate, French Crampon or a photographed 1962 typical edition.

| Source path / celebration | Introit | Gradual / season-dependent tract or Alleluia | Offertory | Communion |
|---|---|---|---|---|
| [`Tempora/Adv1-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv1-0.txt) | Ps 24:1-3; Ps 24:4 | Ps 24:3; 24:4; Ps 84:8. | Ps 24:1-3. | Ps 84:13. |
| [`Tempora/Adv3-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv3-0.txt) | Phil 4:4-6; Ps 84:2 | Ps 79:2; 79:3; 79:2 | Ps 84:2 | Is 35:4. |
| [`Tempora/Nat1-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Nat1-0.txt) | Sap 18:14-15.; Ps 92:1 | Ps 44:3; 44:2; Ps 92:1. | Ps 92:1-2 | Matt 2:20 |
| [`Tempora/Quadp1-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quadp1-0.txt) | Ps 17:5; 17:6; 17:7; Ps 17:2-3 | Ps 9:10-11; 9:19-20; Ps 129:1-4 | Ps 91:2 | Ps 30:17-18 |
| [`Tempora/Quad1-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-0.txt) | Ps 90:15; 90:16; Ps 90:1 | Ps 90:11-12; Ps 90:1-7; 90:11-16 | Ps 90:4-5 | Ps 90:4-5 |
| [`Tempora/Quad4-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad4-0.txt) | Is 66:10 et 11; Ps 121:1. | Ps 121:1, 7; Ps 124:1-2 | Ps 134:3, 6 | Ps 121:3-4 |
| [`Tempora/Quad5-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad5-0.txt) | Ps 42:1-2.; Ps 42:3 | Ps 142:9, 10; Ps 17:48-49; Ps 128:1-4 | Ps 9:1, 118:17, 107 | 1 Cor 11:24, 25 |
| [`Tempora/Quad6-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad6-0.txt) | Ps 21:20 et 22.; Ps 21:2 | Ps 72:24 et 1-3 | Ps 68:21-22. | Matt 26:42. |
| [`Tempora/Pasc0-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc0-0.txt) | Ps 138:18; 138:5-6.; Ps 138:1-2. | Ps. 117:24; 117:1; 1 Cor 5:7 | Ps. 75:9-10. | 1 Cor 5:7-8 |
| [`Tempora/Pasc5-4`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc5-4.txt) | Acta 1:11; Ps 46:2 | Ps 46:6; Ps 67:18-19 | Ps 46:6 | Ps 67:33-34 |
| [`Tempora/Pasc7-0`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-0.txt) | Sap 1:7.; Ps 67:2 | Ps 103:30 | Ps 67:29-30 | Act 2:2; 2:4 |
| [`Tempora/Pent01-4`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent01-4.txt) | Ps 80:17; Ps 80:2 | Ps 144:15-16; Joannes 6:56-57 | Levit 21:6 | 1 Cor 11:26-27 |
| [`Tempora/Pent02-5`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent02-5.txt) | Ps 32:11; 32:19; Ps 32:1 | Ps 24:8-9; Mt 11:29 | Ps 68:21 | Joannes 19:34 |
| [`Sancti/01-06`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/01-06.txt) | Malach 3:1; 1 Par 29:12; Ps 71:1 | Isa 60:6; 60:1; Matt 2:2. | Ps 71:10-11 | Matt 2:2 |
| [`Sancti/02-02`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/02-02.txt) | *inherited source hold* | Ps 47:10-11; 47:9 | *inherited source hold* | Luc 2:26 |
| [`Tempora/Quad6-4`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad6-4.txt) | *absent in this file* | *absent in this file* | *absent in this file* | *absent in this file* |
| [`Sancti/03-25`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/03-25.txt) | *inherited source hold* | *absent in this file* | *inherited source hold* | *inherited source hold* |
| [`Tempora/Adv3-3`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv3-3.txt) | Is 45:8; Ps 18:2. | Ps 144:18; 144:21 | Is 35:4. | *inherited source hold* |
| [`Tempora/093-3`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/093-3.txt) | Ps 80:2; 80:3; 80:4; 80:5; Ps 80:6 | Ps 32:12 ; 32:6 | Ps 118:47; 118:48 | Neh 8:10 |
| [`Tempora/Quad1-3`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-3.txt) | Ps 24:6; 24:3; 24:22; Ps 24:1-2 | Ps 24:17; 24:18; 24:1-4 | Ps 118:47; 118:48 | Ps 5:2-4 |
| [`Tempora/Pasc7-5`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-5.txt) | Ps 70:8 70:23; Ps 70:1-2 | Ps 12:1 | Ps 145:2 | Joannes 14:18 |
| [`Tempora/Quad2-3`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad2-3.txt) | Ps 37:22-23.; Ps 37:2 | Ps 27:9; 27:1; Ps 102:10; Ps 78:8-9 | Ps 24:1-3 | Ps 10:8 |
| [`Tempora/Quad3-5`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad3-5.txt) | Ps 85:17.; Ps 85:1 | Ps 27:7, 1; Ps 102:10; Ps 78:8-9 | Ps 5:3-4 | Joann 4:13, 14 |

### Thematic findings that matter for our eventual Bible network

1. **Advent I:** Ps 24 provides the Introit and Offertory while Ps 84 provides the Communion and a Gradual/Alleluia verse. This is multiple **liturgical reuses** of biblical words, not three separate Bible events. [Latin Mass source](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv1-0.txt).
2. **Sunday after Christmas octave:** the Introit `Dum medium silentium` is annotated Wisdom 18:14–15, a less obvious canonical Old Testament source. The Communion invokes Matthew 2:20. Do not label Wisdom 18 as a literal narrative about the Nativity in its ancient context; the **liturgical reuse** is a Christian Christological application. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Nat1-0.txt).
3. **First Sunday of Lent:** Ps 90 (Vulgate) underlies several chants, including extended Tract material. A 1962 Bible journey could show these as the same Psalm alongside Christ's temptation (today's real Gospel) instead of creating unrelated cinema for every antiphon. The Tract remains structurally distinct from the opening Gradual citation. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-0.txt).
4. **Laetare:** the Introit quotes Isaiah 66:10–11; the Gradual cites Ps 121, and the Offertory Ps 134. A biblical-horizon path would explain Zion/Jerusalem as a real biblical theological theme; it must not equate an artistic depiction of present Jerusalem with the liturgical concept without commentary. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad4-0.txt).
5. **Passion Sunday:** the Communion explicitly contains the Last Supper institution formula (1 Cor 11:24–25). This is a strong actual chant-scriptural link **even outside the Canon**. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad5-0.txt).
6. **Easter:** the Introit employs Ps 138:18; the Communion is annotated 1 Corinthians 5:7–8 (Christ our Passover), and the Gradual includes the Easter Psalm and Pauline alleluia citation. The biblical source note alone cannot settle how Christ's resurrection is typologically expressed: attribute such commentary to named authors. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc0-0.txt).
7. **Pentecost:** the Introit `Spiritus Domini` comes from Wisdom 1:7; the Communion cites Acts 2:2,4, directly the Pentecost event. The Gospel/Epistle are a different read-and-prove path using our strict witness registry. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-0.txt).
8. **Corpus Christi:** Introit Ps 80:17, Gradual Ps 144 and John 6, Offertory Leviticus 21:6 and Communion 1 Corinthians 11:26–27 show both Old Testament priestly language and New Testament Eucharistic doctrine *actually used as chant words*. This is particularly suitable for high-quality source-backed art/Atlas crosslinks, without inventing a universal Corpus procession. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent01-4.txt).
9. **Sacred Heart:** Introit Ps 32, Offertory Ps 68 and Communion John 19:34 (pierced side) demonstrate how a Gospel episode can attach to a variable chant as well as to a later author's water-and-wine symbolism; two **different evidence relations**. [Text](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent02-5.txt).
10. **September Ember Wednesday:** Communion refers to Nehemiah 8:10; Advent Ember Wednesday to Isaiah 45:8; Pentecost Ember Friday to John 14:18. These are important because the liturgical year accesses less-visited books and links the same Bible episodes in different seasons. Ember multiple lessons must remain in **source order**, not assumed one-to-one from numbered verses. [September source](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/093-3.txt), [Advent Ember](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv3-3.txt), [Pentecost Ember](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-5.txt).

### Three kinds of incompleteness — do not paper over them

**A. Inheritance:** Candlemas Introit in `Sancti/02-02` says `@Tempora/Pent08-0`, not a direct Psalm note. I independently opened that parent source and found the **Psalm 47:10–11 / 47:2** annotations. The inherited reference is kept attached to the original Candlemas record, but the chain is still **not certified against the 1962 printed feast**. Candlemas Offertory and most Annunciation chants cite `@Commune/...` texts whose actual destination has **not** been resolved from the paths we tried. No invented citation is filled.

**B. Holy Thursday:** `Tempora/Quad6-4` is a small source stub directing the reader to one of the Chrism Mass or Mass in Cena Domini. It contains **no** fixed Introit/Gradual/Offertory/Communion sections for this extraction. Never infer Thursday's Proper from an absent text, nor import ordinary Thursday material into a distinct Holy Thursday rite. This is a separate source-location problem.

**C. Gradual and Tract:** `Graduale` may contain a `!Tractus` transition plus a second Psalm citation. Our `GRADUAL` research observation encompasses that source section; it does not prove the app's optional `ALLELUIA_TRACT_SEQUENCE` block is a standalone second chant. The 1962 form, season, sequence and text ownership must be resolved separately. Do not turn every source `!` line into its own Mass card or counterfeit Proper.

## What follows

1. **Use Hazell's 2013 index as the Bible-book-by-book finding aid**, not merely another general Catholic history reference. Locate author-permitted original PDF, cross-check a tractable set of entries and log discrepant or uncertain verse numbering.
2. **Resolve source inheritance systematically** by following `@Commune` and special Holy Week source-specific overlays within the exact 1962 data owner, not by reusing a visually similar feast or reading.
3. **Extend source extraction to remaining verified paths** and then the real wider calendar only after existing Proper coverage is enumerated. Include Bible contexts from Introits, Graduals, Tracts, Alleluias, Sequences, Offertories and Communions, plus actually resolved Epistles/Gospels/Ember lessons. These have different liturgical roles.
4. **Separate symbolic interpretation** (St Alphonsus, Guéranger, Fortescue, Dujardin, Fathers) from the mechanical fact that words of Scripture are quoted. Avoid forcing a literal Bible link for non-scriptural chants and variable prayers.
5. **Attach links to existing `learn.mass` and proper/Scripture infrastructures only after external 1962 source and Bible text collation.** Never perturb R17 or 48/other visible card structure.

## Files and invariants

Research source snapshots: [batch 1](../../data/geography/research/mass-variable-chant-bible-batch01-20261011.v1.json) · [batch 2](../../data/geography/research/mass-variable-chant-bible-batch02-20261011.v1.json) · [batch 3](../../data/geography/research/mass-variable-chant-bible-batch03-20261011.v1.json).

All chant row source URLs point to the actual Latin file inspected; quoted incipits remain short identification text, not a replacement Bible text corpus. Internal source matching happens by exact Proper path and verified Latin incipit in the existing reading resolver. This batch **does not** claim the same mechanism has already been extended to these four chant slots. Publication flags are false. No new Mass reader, route, devotional module, Bible Atlas scenes or artwork.

## Extended lessons: separate Ember and Passion source ownership

The companion [six-source extended lesson index](../../data/geography/research/mass-ember-passion-lesson-order-batch01-20261011.v1.json) records **55 reading/intervening-chant source sections**, including **46 with explicit biblical annotation** and **28 section-level uncertainties or alternate/rubrical source markers**. These are not 55 independent required Mass lessons. Original source order is retained. The cases are the September, Advent, Lent and Pentecost Ember Saturdays, Palm Sunday and Holy Wednesday.

- [September Ember Saturday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/093-6.txt): Leviticus 23, Micah 7, Zechariah 8, Daniel 3 and Hebrews 9 in distinct source sections, with intermediate chants and collects.
- [Advent Ember Saturday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv3-6.txt): Isaiah 19, 35, 40 and 45 followed by a Thessalonians lesson; the fifth numbered section has no direct Bible note and cannot produce an invented passage.
- [Lenten Ember Saturday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-6.txt): Deuteronomy 26 and 11, 2 Maccabees 1, Sirach/Ecclesiasticus 36, and a final Thessalonians reading.
- [Pentecost Ember Saturday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-6.txt): Joel 2, Leviticus 23 and 26, Deuteronomy 26, Daniel 3, and Romans 5. The intercalated `GradualeL...` sections are not additional Epistles.

**Critical new conflict:** the [Divinum Officium Palm Sunday source](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad6-0.txt) contains `Matt 26:1-75; 27:1-66` in an alternative/full Passion source section, whereas the [current app's segmented Mass witness](../../data/mass/scripture-segmented-proper.v1.json) has **Matthew 26:36–75; 27:1–60**. The same source contains `!Hic genuflectitur`, a rubric, not a Bible citation. Do not automatically merge the ranges, infer a production defect, or replace the Gospel/Passion reading until the specific 1962 Missal and distinct preceding rites have been examined. Holy Wednesday also contains source variants and multiple lessons that cannot be mechanically concatenated.

An event such as Calvary can appear in Dujardin's meditation even where the actual Mass reading is narrower. This must be labelled **authorial meditation**, not a biblical passage proclaimed in that Mass. All section-level approvals remain false.
