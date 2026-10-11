# Biblical sources in the variable chants: complete first-pass census of the 105 existing Proper witnesses

**Date:** 11 October 2026. **Research only.** The entire 1962 Missal, its optional Commons and votive Masses, Holy Week proper variants, independent biblical-text collation and app implementation are **not** claimed complete.

## Exactly what has now been completed

Previously the strict in-app Mass–Scripture bridge had **105 individually witnessed source paths**, in [base](../../data/mass/scripture-reading-witness-register.v1.json) and [feast/extended](../../data/mass/scripture-feast-reading-supplement.v1.json) Gospel/Epistle registries. Those are the **denominator for this pass**, not the complete celebration inventory of the 1962 Missal.

Every one of those 105 source paths has now had a **four-slot** inspection of its [Divinum Officium original Latin source](https://github.com/DivinumOfficium/divinum-officium/tree/master/web/www/missa/Latin): Introit, Gradual source section, Offertory and Communion. These are **source observations**, not app-integrated Bible hyperlinks.

| Exact metric | Result | Interpretation |
|---|---:|---|
| Previously verified reader Proper source paths inspected | **105 / 105** | All paths in the *existing* 105-path evidence registry, not all feasts/days of 1962 |
| Chants examined | **420 / 420** | Four selected source sections × 105 paths; does not include every Alleluia/Tract/Sequence separately |
| Chant positions with one or more directly printed source Bible annotations | **364** | Annotations beginning `!` in source; **not** independently compared with each Bible edition |
| Original Bible citation-note lines collected | **536** | 536 annotations, **not** 536 distinct passages/verses, Bible books or liturgical readings |
| Source positions with no direct citation note | **56** | 42 inherited texts, 13 sections absent, one unannotated position; **not** automatically an error |
| Inherited chant sections `@...` | **42** | A separate direct-parent study traced **34** to a source-identified parent; **eight** remain out of direct scope |
| Sequence/Tract markers inside the source Gradual section | **23** | Separate `GRADUAL` and `ALLELUIA_TRACT_SEQUENCE` display logic still needs 1962 rite validation |
| Source-file retrieval failures | **0** | All 105 known Latin source files were opened; some were intentionally stubs/conditional sections |
| Independent 1962 typical-edition/facsimile + Bible-text certification | **0 / 420** | Not yet attempted at individual passage level for this corpus; **no publication approval** |

The [**single source-index dataset**](../../data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json) contains all 420 normalized records and source URLs. Underlying data remain in three [source-normalization segments](../../data/geography/research/mass-chant-source-index-segment-a-20261011.v1.json), [B](../../data/geography/research/mass-chant-source-index-segment-b-20261011.v1.json), [C](../../data/geography/research/mass-chant-source-index-segment-c-20261011.v1.json), which in turn point to the original 17 extraction batches. This avoids proliferating more theological “questions” for the same actual chant.

## The 105-source corpus is strongly Psalm-centred — and also reaches much more of Scripture

Of the 536 `!` source citation-note lines, **444** begin with a Psalm reference (`Ps`). The Introit and Gradual often contain a chant text plus a separate psalm verse, so counting annotation *lines* overstates unique biblical passages. Repeated psalms across Masses are **one biblical source with many liturgical usages**, not a different episode each time. [Example: Advent I, Psalm 24 repeated in Introit and Offertory](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv1-0.txt).

At the same time, this census identifies significant **non-Psalm** biblical material:

- **Wisdom 18:14–15:** `Dum medium silentium` in the [Sunday in the Christmas octave](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Nat1-0.txt). The original Wisdom passage is interpreted liturgically in reference to the mystery of Christmas; its biblical context is not itself a narrative of Bethlehem.
- **Wisdom 1:7:** `Spiritus Domini` in the [Pentecost Introit](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pasc7-0.txt). This is a direct source-note witness and a powerful example of Old Testament text incorporated into Pentecost worship.
- **Leviticus 21:6:** `Sacerdotes Domini` in the [Corpus Christi Offertory](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent01-4.txt). Relevant to priesthood theology, though not evidence that the post-medieval Corpus Christi Mass dates to Leviticus.
- **Nehemiah 8:10:** Communion chant of [September Ember Wednesday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/093-3.txt), a connection easily missed by a purely Passion-oriented study.
- **Esther 13:9–11 and 14:12–13 (Vulgate additions):** found in [Sunday XXI after Pentecost Introit](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent21-0.txt) and [Sunday XXII after Pentecost Offertory](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent22-0.txt). **Esther chapter numbering differs sharply between Vulgate, modern Hebrew-text and Catholic editions**; do not create a fictitious verse link without proper cross-edition mapping.
- **Exodus 32 and Exodus 24:** appear in selected Pentecost and Lenten Offertories, with source annotations `Exod` and `Exodi`; [Twelfth Sunday after Pentecost](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent12-0.txt), [Eighteenth Sunday](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent18-0.txt).
- **John 19:34:** the pierced side in the [Sacred Heart Communion](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent02-5.txt). Distinguish this direct variable Proper quotation from a named author's symbolic interpretation of Offertory water and wine.

The register recognises all seven less common *book abbreviation* forms initially flagged by a conservative source-note parser—`Acta`, `Exod`, `Exodi`, `Esth` and `Gal`—as real biblical book labels. There are **no claims that these are non-biblical chants** merely because their English names differ. Verse parsing and Latin/French/English edition concordance are still gated.

## Inherited chants now have source-specific parent evidence

The [**42-inheritance trace register**](../../data/geography/research/mass-1962-chant-inheritance-source-traces-20261011.v1.json) follows literal `@ParentPath[:Section]` source directives and looks for that **exact** source section in the 105-row universe. It found:

- **34** source-backed **parent sections with their own Bible citations**, *candidate* sources for the inherited use;
- **7** parent paths outside the four-chant 105-source index (chiefly external `Commune` texts and a distinct variant);
- **1** request for a specialised `GradualeL3` section, which must **not** be replaced by the ordinary `Graduale`.

This raises the number of direct-or-parent-traceable source positions to **398 of 420**, leaving **22** without a direct or single-parent scriptural annotation. **Neither 398 nor 34 is a count of certified 1962 chant assignments:** calendar rubrics, source variants and scripture editions still determine the actual chant. Parent citations are stored separately and **not added** to the 364 direct annotations.

A useful example: [Candlemas `Sancti/02-02`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/02-02.txt) inherits the Introit `@Tempora/Pent08-0`, whose parent Latin [source explicitly annotates Psalm 47](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent08-0.txt). Likewise Sunday IV after Epiphany explicitly reuses parts of Sunday III after Epiphany; that does not create another unrelated Bible episode. On the other hand, `@Commune/C10a` cannot be resolved from this 105-source index without consulting its *actual* Common Mass resource.

## Publication methodology — three entirely different connection classes

1. **Text quoted in a verified Proper**: a Bible passage has words present in the selected dated 1962 Mass chant, with verse and wording established. These source annotations are the starting evidence, not themselves a substitute for final text verification.
2. **Biblical typology/theology**: Christ, Passover, the Temple, old priesthood, the prophets, Apocalypse and the Church explained through explicitly identified Fathers, St Alphonsus, Fortescue and Guéranger. They need an attributed argument and documentary reference; they are **not** automatically text recited in the Mass.
3. **Contemplative sequence through Christ's life**: Dujardin's 22-part meditative order. It is an **optional traditional spiritual method** and must never be presented as historical causation of Roman ceremonies.

**Direction of traversal:** from the exact Mass Proper/Latin text to the Bible passage and its real historical context; conversely, from an actual Bible episode/person to documented Mass usages, plus separate traditional commentary and artwork. The existing `learn.mass` and the Bible Atlas remain the owning product modules, with no duplicated Bible viewer.

## Hazell's 1962 Scripture index remains the indispensable discovery guide

Matthew P. Hazell's [*Scripture Index of Chants and Readings in the 1962 Missale Romanum* (2013)](https://catholiclectionary.blogspot.com/2013/06/scripture-index-for-1962-mr-and-some.html) includes four sections: Old Testament excluding Psalms, Psalms, Gospel readings, remainder of New Testament, plus a Common Mass appendix; the author's [Scribd presentation](https://www.scribd.com/document/152413656/Scriptural-Index-of-Chants-and-Readings-in-the-Missale-Romanum-1962) makes its table of contents and some mappings searchable. **This index is not copied into the app or the GitHub dataset; it remains an outside bibliography and independent source-check target.** The author himself notes the possibility of transcription errors. The immediate correct use is to identify biblical books and liturgical usages *outside the app's current 105 paths*.

## What is left — precise next research queue

1. **Breadth beyond the 105 app witnesses:** survey the 1962 calendar's additional Sundays, feasts of saints, Commons, votive Masses, funeral/Nuptial/ritual Masses and special Holy Week/Ember/Vigil services. This is the next **coverage denominator**; do not call our current 105 complete Missal coverage.
2. **Resolve eight parent holds and 22 positions lacking direct/parent annotation:** follow original Commons and special Gradual/Tract source sections with exact Latin and rite checks.
3. **Finish the missing chant genres:** Alleluia, Tract, Sequences and their order in the actual celebration, including special Sunday-season transitions. `GRADUAL` source sections cannot stand in for all of these.
4. **Independent textual collation:** exact 1962 Latin Missal vs Clementine Vulgate, French Crampon and Douay translations; special attention to Esther, Daniel additions, Psalm numbering and discontinuous lessons.
5. **Only then display certified links** in existing Formation and biblical Atlas modules; do not alter reader Latin, priest/faithful cues, calendars, special processions, LIVE or user-approved art.

**Code regression gates:** [420-slot parent-source test](../../tests/mass-1962-105-source-path-chant-index.mjs) and [42-parent inheritance test](../../tests/mass-1962-chant-inheritance-source-traces.mjs). Each fail-closed record has all publication flags false.
