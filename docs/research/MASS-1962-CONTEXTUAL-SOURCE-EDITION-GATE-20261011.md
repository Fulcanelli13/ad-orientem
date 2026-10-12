# 1962 Mass–Scripture textual certification: contextual source pilot

**11 October 2026 · PR #1018 · Research only.** This is the first *printed-Missal-versus-source-file* reconciliation, not a claim of complete 1962 Missal certification. All production flags remain closed.

## Source inspection and evidence

1. **1962-labelled Missale Romanum, printed p. 677**, [single-page PDF image](https://forum.musicasacra.com/forum/uploads/FileUpload/f4/45596d0f68969c8accaa131c17db57.pdf), visually inspected; it contains 7 October, *Beatae Mariae Virginis a Rosario* (II classis), an Introit *Gaudeamus omnes in Domino* and a **separate explicit votive Introit** *Salve, sancta Parens*, labelled **Sedulius**. Each is followed by **Ps. 44,2**, *Eructavit cor meum verbum bonum; dico ego opera mea Regi*. The single-page excerpt is not independently authenticated against the full volume's title/decree and therefore carries a scope restriction.
2. [Divinum Officium Latin `Sancti/10-07`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/10-07.txt), read at `[Introitus]`: its *Gaudeamus* source and **!Ps 44:2** agree with the feast wording. Its file is **not a complete standalone assertion** of every contextual 1962 votive variant; the printed *Salve* rubric is a distinct source witness.
3. [Clementine Vulgate, Psalm 44:2](https://la.wikisource.org/wiki/Vulgata_Clementina/Liber_Psalmorum), independently checked in Latin: *Eructavit cor meum verbum bonum: dico ego opera mea regi*. Both Introit contexts reuse this **one** passage; it is not two biblical locations. Traditional Latin Psalm 44, not automatically modern English Psalm 44.
4. [1962 Missal Rubrics, §§356–358](https://la.wikisource.org/wiki/Pagina:Missale_Romanum_1962.pdf/24) classify and explicitly permit the external solemnity of the Rosary on the first Sunday of October. However, [contemporary discussion of the resulting disputed Introit](https://forum.musicasacra.com/forum/discussion/9694/external-solemnity-of-our-lady-of-the-rosary-ef-introit-question/p1) exposes divergent interpretations about whether that observance requires the printed *votive* substitution. **Keep this application on an editorial hold** until §§356–360, the complete printed Proper, the calendar selection and authoritative ordo practice are reconciled. Neither informal interpretation is itself rubric authority.
5. The [1962-labelled Missal OCR](https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/Missale%20Romanum%201962_OCR.pdf) displays an Advent rubric after the Gradual, *In feriis Adventus, quando per hebdomadam adhibetur Missa de dominica, non dicitur Alleluia, nec versus sequens, sed tantum graduale*; independently quoted in the [CMAA forum's source discussion](https://forum.musicasacra.com/forum/discussion/14393/rubrical-source-for-omission-of-alleluia-verse-on-advent-ferias-where-sunday-mass-is-resumed/p1). The full PDF was not visually inspected here, so this is an **OCR-text-and-corroboration witness**, not an independently page-authenticated image witness.

## A concrete editorial risk now demonstrated

An implementation that keys all Mass Scripture connections solely on `Sancti/10-07` and the `INTROIT` slot will return **wrong text** in at least one printed usage: fixed-date feast *Gaudeamus*, versus votive use *Salve*. The underlying Psalm **44:2 stays constant**. Furthermore, not all Introit *antiphon* words are verbatim Scripture. The first is a liturgical antiphon, and the votive is printed with an author attribution to Sedulius; Scripture's direct citation applies to the **associated Psalm verse**, not the entire opening text.

A second counterexample concerns Advent: the mere presence of `Alleluia` in a Sunday source file does **not** entail its display when that Sunday Mass is used on certain Advent weekdays. Liturgical position and rubric condition are properties of **celebration usage**, not of a raw file.

## Required canonical entity model

`(1962 liturgical calendar identity, condition/occasion, source path, exact Latin section, sub-part [antiphon/psalm/alleluia/tract/sequence], original Bible edition/verse)` is the minimal identity. Do not key Scripture only by feast name or `sourcePath|properSlot`. Distinguish:
- **Direct quotation**: printed liturgical words compared with identified Bible edition words.
- **Liturgical non-verse or authored poetry**: may sit beside a directly cited Psalm verse; do not invent a Bible source for the whole antiphon.
- **Contextual transfer, omission and inheritance**: selected only by actual 1962 calendar and rubric evidence.
- **Theological typology / meditative mapping**: separate existing scholarly owners, never disguised as printed source verses.

The [machine-readable conditional pilot](../../data/geography/research/mass-1962-contextual-primary-witness-pilot-20261011.v1.json) includes four context-specific records (two Introits and their shared Psalm 44:2 under two uses) and two explicit holds (external solemnity and Advent weekday Alleluia). [Regression test](../../tests/mass-1962-contextual-primary-witness-pilot.mjs) rejects collapsing these records or auto-publishing.

## What has, and has not, advanced

- **Advanced:** one independent printed page visually examined, original `Sancti/10-07` compared, one Psalm location verified against Clementine Latin, two important conditioned ritual usages captured.
- **Not claimed:** the source PDF's full-volume authentication, complete 1962-sanctioned observance map, entire feast Proper's exact textual collation, Vulgate/Crampon/Douay verse parity, or approval of any new Mass links in production.
- **Next:** use a stable **whole-volume** 1962 facsimile to reconcile the source catalogue systematically (edition title/decree pages first), then prioritize Commons, Advent alleluia omissions, external solemnities, votive/rubrical variants and special vigils. Only promote *individually certified* textual edges after those checks.

The 1,052-file raw-source extraction remains complete but **its files do not establish the full 1962 celebration denominator**.
