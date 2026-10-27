# Morning & Evening source-to-prayer concordance — Batch B01 (27 October 2026)

Research-only. No change to the live Prayer reader, no claim of editorial approval, and no claim of full printed-page collation.

## Scope and counts

- **4 historical books, 8 time-of-day chapter views**, 86 **source occurrences** across 26 editorial time-of-day/stage buckets. An occurrence is **not** a distinct prayer family; this avoids double-counting Lasance near-duplicates.
- Current production: **11 Morning / 13 Evening cards**, `src/pray/traditional-pray-data.js`; reusable prayer bodies in `src/pray/canonical-data.js`.
- Review depth: **web chapter inspection**, not direct page-by-page facsimile certification. All records are **candidates**, not approved import instructions. Machine-readable entries: `data/pray/daily-prayer-source-concordance.b01.json`.
- `Blessed Be God` Morning Wikisource chapter currently truncates after its Morning Offering; **do not call the full Morning section extracted**. 20 October survey crosswalk (`Ad_Orientem_Blessed_Be_God_Survey_2026-10-20.xlsx`) already marks morning pp. 1–2 and evening pp. 12–18 P0 for collation, but states that its 70-unit review is *not* individual-prayer census.

## Direct historical witnesses

- **BBG1925** — Blessed Be God (Callan & McHugh, 1925; printed scan may contain later inserts). [Morning](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Morning_Prayers) · [Evening](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Evening_Prayers). Caveat: Morning Wikisource chapter stops after Morning Offering; book-level October 20 survey covers pp. 1-2 but full-text collation is incomplete.
- **BAL1888** — A Manual of Prayers for the Use of the Catholic Laity (Third Plenary Council of Baltimore, 1888 / 1889 witness). [Morning](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers) · [Evening](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Evening_Prayers). Caveat: Only private lay 'Another Form' is indexed; Office of Prime/Compline is a different sequence and may be made an explicitly separate option, not blended into the private routine.
- **LAS1911** — With God (F. X. Lasance, Benziger Brothers, 1911). [Morning](https://en.wikisource.org/wiki/With_God/Morning_Prayers) · [Evening](https://en.wikisource.org/wiki/With_God/Evening_Prayers). Caveat: Significant overlap with YMG1910; edition-precise near-duplicate collation required.
- **YMG1910** — The Young Man's Guide (F. X. Lasance, 1910 witness; precise print edition to be locked). [Morning](https://en.wikisource.org/wiki/The_young_man%27s_guide/Prayers_and_Devotions) · [Evening](https://en.wikisource.org/wiki/The_young_man%27s_guide/Prayers_and_Devotions). Caveat: Morning and evening within one Prayers and Devotions chapter; many LAS1911 near-parallels; preserve witness even if merged at UI.

## Production gap mapping

| Devotional purpose | Present in current sequence? | Relevant historical candidates | Required decision |
|---|---|---|---|
| Morning presence/adoration | No independent sourced card | Baltimore Trinity adoration; Blessed Be God preparation; Lasance aspiration | Introduce selectable prayer stage |
| Morning thanksgiving | No independent card | Baltimore combined Thanksgiving; Blessed Be God acts; Lasance thanksgiving | Separate source-distinct alternatives |
| Morning offering | **Canonical ID exists but absent from morning sequence** | Baltimore whole-being offering; Blessed Be God Apostleship form; Lasance Sacred Heart offering + Apostleship form | Preserve both offering families, compare exact words |
| Morning virtues | Yes, but from Compendium 2005 witness | Baltimore, Lasance With God, Young Man's Guide | Historical-text variants; do not overwrite source IDs |
| Morning supplication/resolution | Missing as own text | Baltimore resolution + grace; Lasance supplication/consecration | Add optional independent stage(s) |
| Morning Marian/guardian/patron | Guardian yes | Baltimore BVM/Joseph/patron; Lasance Marian consecration | Optional supplements |
| Evening presence/thanksgiving | Missing independent prayers | Blessed Be God; Baltimore; Lasance | Add selectable prayers |
| Evening examen | **Editorial five cards**, no exact prayer opening | Blessed Be God examination; Baltimore prayer for light; Lasance examination rubric | Keep guided examination but offer historical source text separately |
| Evening contrition | Yes, but provenance from 2005 Compendium | Blessed Be God, Baltimore, Lasance | Collate exact wording; distinct text versions |
| Evening intercession | Missing (except De Profundis) | Baltimore living/dead prayers; Blessed Be God living/collect; Lasance benefactors | Separate intercession and departed stages |
| Evening protection/commendation | Missing | Blessed Be God Visita/Salva nos/St Alphonsus/In manus; Baltimore bedtime blessing | Offer traditional bedtime options |
| French & Latin | Not verified for these book-specific editions | historical French manuals/Latin Compline to be separately sourced | No synthetic translations or false attribution |

## Early textual differentiation (NOT complete collation)

- **Lasance 1910 vs 1911 Act of Faith:** Young Man's Guide opens `My God, I believe in Thee, because Thou art Truth itself` and describes revelation as made to the Church; With God begins `O my God, I believe in Thee, because Thou art Truth itself` and uses `I firmly believe`. Source-specific wording differs; **not yet settled whether to offer two tabs**.
- **Lasance 1910 vs 1911 Act of Hope:** Young Man's Guide prints `all-powerful` while With God prints `omnipotent` in otherwise closely related versions. **Do not create an extra visible tab for only this lexical difference until the entire prayer is compared.**
- **Lasance morning consecration:** `I wish and I resolve to consecrate` in Young Man's Guide vs `I wish to consecrate` in With God. Meaningful variant to verify.
- **Morning offering:** Baltimore's `I offer to Thee... my whole being...` within thanksgiving differs substantially from the Apostleship offering `O Jesus, through the Immaculate Heart of Mary...`; these belong to the same functional stage but are not the same prayer.
- **The evening prayers in Blessed Be God** provide a prayer of thanksgiving, detailed examination, prayer for the living, De Profundis, bedtime petitions, St Alphonsus, and `Into Thy hands`. None should be silently replaced with one modern summary.
- **A distinct liturgical Office is not a private lay routine**: Baltimore prints Prime and Compline besides its private `Another Form`; treat the Office as separately labelled, not as an alternative wording of lay adoration.

## Planned canonical architecture

`source edition -> prayer text witness -> normalized prayer family -> selectable variant -> daily stage -> user preference`. Preserve current canonical prayer IDs; create versioned *witness records* for alternative exact texts. A repeated identical historical text creates **one selectable form with multiple citations**. Stages should allow optional omission and preserve the original historical sequence as a separate preset. Timer is a future independent session concern and must not advance prayer stages or cut a prayer short.

## Next gates

1. Lock printed facsimiles for the 8 chapter views; fix page boundaries, confirm each incipit and prayer ending.
2. Collate all 86 **source occurrences** against current canonical bodies, detect exact/near overlaps, and count genuinely distinct formulas.
3. Recover French manuals as edition-specific witnesses; do not treat the September bibliography as verified full transcriptions.
4. Return verified grouped editorial selections for Morning and Evening; no premature production import.
5. After approval: existing Prayer runtime, Short/Complete routines, saved formulations, optional stopwatch/meditation timer, silent mode; no new competing prayer engine.

**Editorial safety:** historical indulgence grants are historical metadata only. Prayers containing liturgical actor wording, older disciplinary claims, or source-embedded social language need separate review before user-facing defaults.
