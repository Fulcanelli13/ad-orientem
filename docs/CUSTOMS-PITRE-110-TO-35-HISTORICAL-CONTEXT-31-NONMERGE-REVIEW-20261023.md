# Pitrè's Palermo: action-level historical reconciliation, not another customs intake (23 October 2026)

## Outcome and source boundary

This wave works **only on the 110 already indexed Pitrè Palermo author-text observations**, not on the separate household books, Spanish/Portuguese national cultural-heritage inventories, Irish school folklore leads, or Italian contemporary festival intake handled by the parallel conversation.

The existing source is Giuseppe Pitrè, *La vita in Palermo cento e più anni fa*, vols I–II, in a posthumous Barbèra edition (volume II explicitly marked 1950), readable through [Gutenberg vol. I](https://www.gutenberg.org/cache/epub/37719/pg37719-images.html) and [vol. II](https://dev.gutenberg.org/cache/epub/37720/pg37720-images.html).

**110/110 observations** have been assigned to **35 documentary historical-event/ceremony context clusters**, with **31 hand-reviewed cross-source action-label relationships** and **2 same-author cross-volume potential repetitions**. These are editorial clusters *inside one historian's book series*, NOT 35 newly verified distinct Catholic customs and NOT 31 independently confirmed corroborations. All source IDs, web line locators, and original claim classes are preserved. No action rows or identity merges added; the cumulative shared research workbench was **2,985 non-unique source/detail rows** on integration.

The classification file is `data/customs/master/pitre-110-context-clusters-31-manual-cross-source-contrast.v1.json`. Parent historical contexts only group source details for further research; they do not override any master identity, ritual approval, or eventual Calendar entry.

## A few substantive identity findings

1. **St Bartholomew's Carità brotherhood hospital visit:** Pitrè vol. II HTML lines **183–184** describes a single confraternity charitable outing including baskets of clean shirts and lint, dressing poor patients and charity. Four action-detail records (`PIT-PAL-26-025..028`) therefore belong to **one historic Carità hospital-visit context**. A fifth action (`029`) describes a *related but separate courting custom*, tiny shirts and lint presented by fiancées to their betrothed. The festival context is not evidence that those two actions were one ceremony.
2. **Corpus Christi:** vol. II lines **186–190**; eight source observations (`030..037`) cover **one Palermo processional setting** and its 1782 scheduling change, guards, decorated balconies, street kneeling and blessing, not eight verified distinct customs. The Basque Corpus Christi Octave's later-afternoon procession `FRPCI18-BB-049` is *not* the same historic decree, even though both mentions share feast and time-of-day keywords.
3. **Immaculate Conception:** vol. II lines **201–216**; `044..055` concern Palermo's early-modern **civic Marian vow plus local ceremonies**, while `056..059` concern a more specific **eight-night octave pilgrimage/viaggio**. The historical municipal oath is not Weiser's general Marian novenas, nor baptismal vow renewal. Historical oath language is not a universal devotional suggestion.
4. **Monreale's Dimostranza:** vol. II lines **255–270**; ten details `075..084` all describe a **single *kind* of occasional sacred, silent, figural procession** with many representations/stops. Pitrè names historical performances including 1783; neither annual observance nor 1962 liturgical status has been established.
5. **St Rosalia:** the **July Festino** (thirteen observations `060..072`) and the shrine's **September Forty Hours** (`022,023,102`) must be separated by occasion. The Cosmas-and-Damian shoulder-litter race `073..074` is staged within the broader Festino and should not automatically be merged with Saint Rosalia's reliquary procession. The two volume passages `022` and `102` are potentially the **same author repeating an observation**, not two independent historic sources.
6. **Assumption:** `038..041` and `100..101` describe the same *historical guild procession context* from two Pitrè volumes; `040` and `101` are flagged as probable same-author ceri/cilii overlap. The separate viceroyal prisoner-clemency ceremony `042..043` is a civic charitable act, not another Marian procession stage.
7. **Pauper burial versus St Joseph:** `106..107` concern charity for burial of poor people, with **Joseph of Arimathea's confraternity**. Their shared word “Joseph” cannot link them to `SJOS-001` (domestic tables for **St Joseph the Foster Father**). A separate `FRSAN23-008` record concerns care for executed prisoners, not necessarily the same confraternity or practice.
8. **Forty Hours calendar context:** `022` and `102` concern a Rosalia sanctuary celebration on **September 4**. `CAT-WEISER-A-101` names **Forty Hours before Lent**. Both belong to the wider Eucharistic devotion genre; they are not the same time-specific local custom.
9. **St Anthony Abbot animals:** Palermo historic `018` has a **closer action/feast correspondence** with Salemi `ITREG26-043` than the former token-matcher's candle or Epiphany blessing results. Nevertheless Palermo and Salemi are different towns and periods, and the museum's animal-feed details in `ITREG26-044` must never be transferred into Pitrè's Palermo account without direct source evidence.
10. **False generic matches:** funeral bells versus Easter bells; avoiding a carriage ride versus avoiding television; eight-night Marian pilgrimage versus Holy Souls eight-night domestic devotion; a guild's patron saint observance versus an individual's name day. The 31 reviewed links explicitly mark these as distinct or as broad analogous acts rather than auto-merging.

## Research method and nonpublication status

- Every Pitrè source row is kept **exactly once** in the 110-to-35 cluster crosswalk. Some contexts contain civic, theatrical, penitential and liturgical elements, and the former may be wholly unsuitable for Calendar suggestions. Confraternity, vow, procession, body posture and charity are not interchangeable kinds of acts.
- The **31 external pair reviews** examine source action descriptions, feast, historical period and locality; this is **not** a critical comparison against the underlying original eighteenth-century administrative records. All review rows say `historical_practice_identity_proven:false` and `source_independence_proven:false`. Two source descriptions from the same Pitrè author must not be counted as independent witnesses.
- The two source files are **posthumous editorial texts** containing Pitrè's research, not his earlier separate **1881 *Spettacoli e feste popolari siciliane*** or **1900 *Feste patronali in Sicilia***, and no claim is made to have read the 1881/1900 works in this pass.
- The 35 clusters are **historical context/ceremony aggregates**, not 35 publication-ready customs, and most descriptions concern old Palermo institutions rather than an extant contemporary practice. Dates need independent verification and the local 1962 Roman Ritual/Missal rubrics are separate questions.
- **Zero** source/detail row increase, **zero** newly certified distinct practice identities, **zero** merges or independent-witness certifications, **zero** Calendar/app publications. **408** provisional Handbook groups unchanged, earlier **56** working identities left unchanged.

## Traceable source and tests

`data/customs/master/pitre-110-context-clusters-31-manual-cross-source-contrast.v1.json` contains all cluster definitions, the one-to-one 110-ID mapping, 31 comparison IDs with meaningful individual rationale, and two marked same-author repetitions.

`data/customs/master/comprehensive-customs-working-catalogue.v1.json` has a **source_dataset_paths** reference and **source_review** counters only; original Pitrè descriptions and workbench total preserved.

`tests/customs-full-registry-census.mjs` checks every original observation is assigned exactly once, 35/35 context IDs are unique, 31/31 comparisons refer to real existing source/owner IDs, no equivalences or publications are promoted, and all source-integrity gates continue to pass.

## Next non-overlapping historical evidence tasks

Read primary-era documents cited *inside* Pitrè's notes (e.g. historical 1782 Corpus Christi scheduling decree and 1783 Monreale Dimostranza account) when publicly accessible, **not** by duplicating his 110 summary actions. For household and regional comparative evidence, leave the ongoing English-language literature, Portuguese/Spanish regional work and Irish folklore index to the other chat. Maintain the same original-language citation and source-dependence safeguards.
