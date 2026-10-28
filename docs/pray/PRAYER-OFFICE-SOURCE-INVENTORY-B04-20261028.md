# Prayer & Divine Office source inventory — B04 (28 October 2026)

**Status:** Research-only, source/witness census. No editorial approve/reject decisions, no user-facing prayer import, no production changes, no Divine Office implementation. Branch `research/prayer-office-master-source-inventory-20261028`.

## Outputs and coverage

| Corpus / unit | Known scope | B04 structure reviewed | Unresolved work |
| --- | ---: | ---: | --- |
| Sensus **dedicated Novenas menu** | 61 pages | **61/61 (100%)** | Primary printed source verification, prayer text collation, language and rights; Sensus website has more posts outside this menu |
| Sensus dedicated novena component descriptors | 141 | 141 structural parts described | **NOT** 141 unique prayers, nor certified full text |
| Sensus Novenas distinct **sequence patterns** | 11 | 11 patterns indexed | Decide canonical identity **later** |
| 1866 Raccolta numbered entries | 189 | 17 source-page entries component-level reviewed | 172 remaining structurally, plus all individual text authentication |
| Raccolta B04 component descriptors | 50 | 50 structural parts described | **NOT** 50 unique prayers |
| Roman Divine Office Hours | 8 | 8 canonical Hours scoped | Actual 1960 source files per language, proper/common rubrics and daily permutation not audited |
| Roman Office source folder classes | 8 | 8 structural groupings | No localised file count verified |
| ICKSP / ICRSP existing selected research | 25 source records / 98 ICRSP Office index entries | Preserved, US index 9 headings additionally cross-checked | Exhaustive international site crawl and text witnesses not completed |

All denominators are **local to the named index**. There is no defensible count of unique prayers across ICKSP, Sensus, Raccolta, Divine Office, or Ad Orientem and no truthful total-collection completion percentage.

## Sensus 61 article structure inventory

- [Consolidated 61-item register](../../data/pray/sensus-novena-form-master.b04.json) (source links, form types, 141 component descriptions, canonical subject probes, textual and rights holds).
- [First 24 source pages](../../data/pray/sensus-novena-form-components.b04.json).
- [Remaining 37 source pages](../../data/pray/sensus-novena-form-components.b04b.json).
- [Original 61-item source index](../../data/pray/sensus-calendar-novena-collection.b03.json).

**Observed structure classes:** standard repeat across nine consecutive days; repeat with several component prayers; nine distinct day petitions; daily extended meditations; nine-hours-in-one-day (Infant of Prague); nine consecutive Tuesdays (St Martha); 25-day repeated St Andrew Christmas prayer (15 repetitions daily); grouped-three Marian Presentation prayers used on days 1/4/7, 2/5/8, 3/6/9; two different St Joseph novena texts on the same source page; unusually intensive repeated Saint Alphonsus novena.

**Historical source and date holds:**
- [St Valentine](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-valentine/): article says Feb 5–14 inclusive, ten days for a claimed nine-day form.
- [St Clare of Assisi](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-clare-of-assisi/): Aug 4–11 inclusive eight days for a claimed nine-day form.
- [St Raymond Nonnatus](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-raymond-nonnatus/): page and index have different August dates.
- [St Catherine of Alexandria](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-catherine-of-alexandria/): Nov 16–25 inclusive ten days.
- [St Lucy](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-lucy/): stray “30Aug” heading and likely unauthenticated modern text.
- [Our Lady of Rosary](https://staging2.sensusfidelium.com/2019/09/28/novena-in-honor-of-our-lady-of-the-rosary-beginning-28-september/): 1910 Raccolta cited, yet present Litany of Loreto contains later added invocations; separate historical original from later editorial additions.
- [St Martin de Porres](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-martin-de-porres/): text references canonisation by John XXIII in 1962; not automatically a pre-1962 imprimatur source.
- [Our Lady of Presentation](https://staging2.sensusfidelium.com/2019/11/11/novena-in-honor-of-the-presentation-of-the-blessed-virgin-mary-beginning-november-12/): only three distinct daily texts cycled through nine days.
- [St Raphael](https://staging2.sensusfidelium.com/2019/10/15/novena-in-honor-of-st-raphael-archangel-beginning-october-15/): composed of prayers, hymns, litany, collects; individually verify origins instead of attributing all text to one historical book.
- [St Nicholas](https://staging2.sensusfidelium.com/calendar/novenas/novena-to-st-nicholas/): wording carries Eastern Christian liturgical formulae; verify original edition and ritual context before an assertion of Roman origin.

Source dates must NOT drive automated calendar scheduling without independent verification. Rights/edition of every text witness remains unassessed.

## 1866 Raccolta composite review

- [17 individually inspected entry structures](../../data/pray/raccolta-1866-component-evidence.b04.json), 50 structural components.
- Full [historical 189-number index](../../data/pray/raccolta-1866-complete-index.b03.json), with #157 missing in mirror index but attested in earlier 1857 index.
- Entry #35 long Precious Blood chaplet: seven mysteries; 33 Our Fathers in total (5 each at six mysteries, 3 at seventh).
- Entry #36 seven separate Precious Blood offerings.
- Entry #37 explicitly cross-refers #35, not an independent full source text.
- Entry #40 **short** Precious Blood chaplet: introductory 33 Our Father claim conflicts with five for each of seven mysteries as printed in the online mirror (=35); **open editorial source error, DO NOT IMPLEMENT**.
- Entry #70 “Office of the Blessed Virgin” is a historical notice referring to an Office, not Office text.
- Entry #71 Fifteen traditional Rosary mystery meditations and standardized core repeated prayers.

Component descriptions do not mean source bodies are licensed or text-verified. No 1866 text is certified to an original print facsimile in B04.

## Traditional Divine Office source map

[Structural source map](../../data/pray/divine-office-1960-source-scope.b04.json) records 8 Hours, 8 source folder classes (Ordinarium, Psalterium, Psalmi, Tempora, Sancti, Commune, Martyrologium, Tabulae) and six dependency groups. Existing French [ICRSP liturgical references](https://icrspfrance.fr/textes-liturgiques.php) include 1960 rubrical documents, occurrence/concurrence tables, and specific Office entries. [Divinum Officium](https://github.com/DivinumOfficium/divinum-officium) and [technical folder guide](https://divinumofficium.hu/www/horas/Help/technical.html) are mapped as research sources, not presumed automatically authorised LA/EN/FR editions. Zero source files have yet been exhaustively counted; actual 1960 proper/common resolution coverage is unknown.

## Required B05 gates

1. Finish **Raccolta** structure for all 189 and isolate numbered historical notices from original unique prayers. Verify 1866 #157 and #40 against printed witnesses.
2. Mine **the remainder of Sensus Fidelium** beyond the dedicated 61 Novenas index (calendars, saints, saints' spiritual works, meditations, special series, extra tags, paginated posts) using machine-readable site enumeration and provenance.
3. Expand **ICKSP/ICRSP** coverage beyond 25 curated source selections and 98 Office-subsection rows; check national/other apostolate websites without duplicating known content.
4. Enumerate **Divine Office** files, rubrics and original witnesses per LA/EN/FR separately and compare to a reproducible 1960 date/hour matrix.
5. Source-text authentication and canonical identity matching to full existing Ad Orientem corpus, keeping historical editions as separate witnesses. Only later conduct editorial selection.

**Rule:** source titles, prayer forms, source witnesses, and canonical identities are distinct units. Never sum source observation counts across strata to claim number of prayers.
