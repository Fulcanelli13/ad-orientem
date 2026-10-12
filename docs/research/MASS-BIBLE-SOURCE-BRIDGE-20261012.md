# Mass–Bible timeline: source-first study bridge — 12 October 2026

## Production owner and scope

The Mass UI and Scripture Context already use the canonical Mass/R17 owner. **This batch does not add another Mass player**. It extends the existing `learn.mass` formation owner (eight stages, 24 claims) with two lazy study choices: (1) `The Bible in the Mass`, 26 bilingual source-linked Mass moments, and (2) `1962 Epistles and Gospels`, a filtered, original-source witness lookup over the already-merged registry.

The production `SOURCE_FIRST_LIVE_PRODUCT_48` remains exactly 48 presentation cards; the 1962 Proper selector, Low/Sung/Solemn ritual state, source-indexed Scripture overlay, calendar and icon/gesture cues are not edited. The Mass–Bible layer is **pre-publication editorial study**, and none of its IDs assert a recovered 48-card historical identity.

## Explicitly distinct editorial strata

| Stratum | Current batch | Authority and limits |
| --- | --- | --- |
| Direct biblical wording in the Missal | 5 examples | Actual prayer-phrase anchors, *not* a blanket 1962 word-by-word collation. Psalm numbers use Vulgate and modern numbering explicitly. |
| Biblical wording adapted by the Roman rite | 5 | The Gospel source does not equal the entire liturgical formula. `Sanctus`, `Agnus Dei`, `Domine non sum dignus` explicitly qualified. |
| Biblical persons explicitly named in the Canon | 3 | Abel (Genesis 4), Abraham (Genesis 22), Melchisedech (Genesis 14) are literally named in `Supra quae`; they are **not** read aloud as Genesis lessons at that point. |
| Distinct variable readings and exceptions | 3 | A Propers example is never assumed to be today's Mass; Last Gospel may vary or be omitted in some rites. |
| Narrative, doctrinal, penitential and typological interpretation | 10 | Not presented as word-for-word Missal quotations. Melchisedech/Hebrews 7 is a theological typology; Gospel parallels to `Confiteor` and `Libera nos` remain comparisons. |
| Christ-life meditation and iconography | 0 approved | Fortescue, Dujardin and other meditative/allegorical crosswalks remain outside user-facing corpus pending exact passage/source provenance. |

The **26 examples are not an exhaustive concordance** of the 1962 Mass. Each example must carry a hyperlink to the 1962 Missal witness and to the precise biblical chapter context, with bilingual explanation and any qualifier. The Missal URL serves as edition-level provenance, not as an independently collated printed page identifier.

## Examples where conflation would be a substantive error

- **Psalm 42/43 and Psalm 25/26**: distinct Vulgate vs modern Psalm numbering; an English-language citation alone cannot validate the Latin text.
- **`Domine, non sum dignus`**: Matthew 8:8 refers to the centurion and the healing of his servant (`puer meus`); the communicant's liturgical petition uses `anima mea`. It is an adaptation.
- **`Mysterium fidei`** in the 1962 chalice formula is not simply transcribed from Luke 22:20. Source-narrative links are not evidence of a word-identical Gospel verse.
- **Abraham**: Isaac is not killed in Genesis 22, even though the Canon speaks of Abraham's sacrifice.
- **`Supra quae`**: the three named Old Testament exemplars are named inside the Canon. Hebrews 7 interpretation of Melchisedech is distinct from that explicit wording.
- **Last Gospel**: avoid auto-inserting John 1 into Masses where the liturgical structure changes or omits it, including special-day conditions.
- **The Last Supper**: Paul's narrative and Luke's are contextual witnesses; do not overwrite the 1962 consecration formula with either biblical version.

## 1962 Proper reading inventory — existing GitHub main sources, independently checked as a registry structure

| Original canonical data owner | Shape inspected | Non-certification |
| --- | --- | --- |
| `data/mass/scripture-reading-witness-register.v1.json` | 50 distinct Proper source paths | External Proper Latin incipit guard, some reading holds |
| `data/mass/scripture-feast-reading-supplement.v1.json` | 55 additional distinct source paths | Major feasts and Lent/Holy Week/Ember source and branch exceptions |
| **Combined** | **105 nonduplicated source paths, 195 ordinary Epistle/Gospel slots** | Only source+Latin identity, **not** independent blanket printed-1962 certification |
| `data/mass/scripture-segmented-proper.v1.json` | **15 ordered/segmented special reading records** | Preserve discontinuous and historical/original-source exceptions; no verse-range smoothing |

The new `learn.mass` selector inspects these *existing* three files at runtime, after verifying both source status and cited Latin incipits. It does not alter the source registry, infer a selected date's Proper, publish full copyrighted Bible text, or promise full missal coverage.

The larger Proper work including chant/antiphon Scripture references and original 1962 printed-page certification is **not completed by this batch**. It must be reconciled with the separate original edition page packets before any full-year claim. A known older research status counted 100 priority printed page packets with none fully independently certified; this is **not re-certified** here.

## Research holds and future interfaces

1. **Original-word collation**: check the exact 1962 Mass prayers against the original Missal, and distinguish Hebrew/Greek/LXX, Vulgate, Douay–Rheims and Crampon chapter/verse decisions, especially Psalms and Esther.
2. **Fortescue typology**: recover the 54 research candidates and 30 original-book historical observations as source-level individual dossiers, verifying original text and authorship; keep historical liturgical explanation distinct from normative 1962 rites.
3. **Dujardin meditation**: recover the 22 linked Christ-life contemplation moments with page references. They were authored by **Fr Léopold J. Dujardin** within the older collection associated with St Alphonsus, **not by Alphonsus himself**. They must not become automatic rubrics, scripture quotations or a fake illustrated timeline.
4. **Proper Scripture mapping**: later extend beyond two standard reading slots to approved Introits, Graduals, Alleluias, Tracts, Offertories and Communions *only with the actual original Latin/1962 textual boundary*. Segmented/Ember lessons must preserve original order.
5. **Biblical Atlas**: [draft #1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069) holds the 151-event chronology and linked source-typed dossiers; when that owner merges, a second separately reviewed crosswalk can connect compatible Gospel/Mass episodes without creating a second Atlas or presumed exact biblical date.
6. **R17 LIVE**: eventual optional "Biblical context" layer must project onto **actual source-owned card events**, not index=48 guessed historical cards. Unverified typology/meditation cannot appear as live rubric or priest/faithful gesture cues.

## Automated acceptance

`tests/mass-bible-source-layers.mjs` asserts all 26 bilingual classified rows, their direct missal/Bible URLs, required corrections, original 105/195 +15 witness structure, and data vetoes if status or Latin witness fails. Independent tests run for original eight-stage formation, 48-card LIVE and existing Scripture source selection.

`tests/mass-bible-study-phone.mjs` opens the actual Learn Mass reader, browses evidence filters and 105 witnessed source paths, verifies original stage return, tests absence of document overflow at 320/390/768px, and uploads source-labelled screenshots for editorial review.

**Merge gate:** This branch remains draft until original source, rights, doctrine, and mobile visual review; a green CI is not endorsement of every candidate as printed-1962 verified.

## Source-editor check — 12 October 2026, batch 2 (Bible context, not printed-Missal collation)

This pass manually opened **20 distinct biblical-context destinations** covering all **26** linked Mass moments. Three broken `jhn001.htm` destinations were replaced with the actual [John 1](https://www.newadvent.org/bible/joh001.htm) page. All contexts now have a reachable biblical chapter or, for Psalm 115, an explicit Latin Clementine text. Checking that a chapter resolves is **not** proof that a 1962 Missal word-for-word quotation matches the printed edition.

Four corrections affect the truthfulness of the claims:

1. **Gloria — MB05**: `Gloria in excelsis Deo` is the Roman liturgical phrase; the [Vulgate Luke 2:14](https://www.newadvent.org/bible/luk002.htm) says `Gloria in altissimis Deo`. Move MB05 from **direct words** to **adapted wording**, in both English and French. It is not an exact printed Vulgate quote.
2. **Melchisedech — MB19**: [Genesis 14:18–20](https://www.newadvent.org/bible/gen014.htm) says he brought forth bread and wine, and calls him priest; it does **not** explicitly report their sacrificial oblation. The *Supra quae* develops the typological sacrificial understanding, without turning that understanding into Genesis' literal wording.
3. **Priest's Communion Psalm — MB25**: [Clementine Psalm 115](https://vulgate.org/ot/psalms_115.htm) gives `Quid retribuam` / `Calicem salutaris` as **115:3–4**; modern combined Psalm 116 numbers them **116:12–13**. The previous New Advent `psa115.htm` URL redirected to a page containing only the earlier Latin portion, not these verses. The direct Clementine-context URL has replaced it. Some merged Latin verse-index conventions label these 115:12–13; do not mix conventions without specifying the witness.
4. **John source pages — MB08, MB23, MB26**: all now use `joh001.htm`, not the broken `jhn001.htm`.

### Complete 26-link source ledger

Every record retains an original-Missal **edition-level** URL (not a newly invented page number), a biblical-context URL and English/French classification. The categories below are *editorial relationships*, not a word-level verified 1962/Latin collation.

| Record | Mass point | Classified relationship | Source chapter |
| --- | --- | --- | --- |
| MB01 | /P/r/a/y/e/r/s/ /a/t/ /t/h/e/ /f/o/o/t/ /o/f/ /t/h/e/ /a/l/t/a/r/ | DIRECT_SCRIPTURAL_WORDING | [/P/s/a/l/m/ /4/2/:/4/ /(/V/u/l/g/a/t/e/;/ /4/3/:/4/ /i/n/ /m/o/s/t/ /m/o/d/e/r/n/ /n/u/m/b/e/r/i/n/g/)/](https://www.newadvent.org/bible/psa042.htm) |
| MB02 | /P/s/a/l/m/ /J/u/d/i/c/a/ /m/e/ | DIRECT_SCRIPTURAL_WORDING | [/P/s/a/l/m/ /4/2/:/1/–/5/ /(/V/u/l/g/a/t/e/;/ /4/3/:/1/–/5/ /m/o/d/e/r/n/)/](https://www.newadvent.org/bible/psa042.htm) |
| MB03 | /C/o/n/f/i/t/e/o/r/ | SCRIPTURAL_PARALLEL_NOT_QUOTATION | [/L/u/k/e/ /1/8/:/1/3/](https://www.newadvent.org/bible/luk018.htm) |
| MB04 | /K/y/r/i/e/ | SCRIPTURAL_PARALLEL_NOT_QUOTATION | [/M/a/t/t/h/e/w/ /2/0/:/3/0/–/3/1/](https://www.newadvent.org/bible/mat020.htm) |
| MB05 | /G/l/o/r/i/a/ | SCRIPTURAL_WORDING_ADAPTED | [/L/u/k/e/ /2/:/1/4/](https://www.newadvent.org/bible/luk002.htm) |
| MB06 | /E/p/i/s/t/l/e/ /o/r/ /L/e/s/s/o/n/ | VARIABLE_PROPER_READING | [/1/ /C/o/r/i/n/t/h/i/a/n/s/ /1/2/:/2/–/1/1/ /(/e/x/a/m/p/l/e/:/ /P/e/n/t/e/c/o/s/t/ /X/ /o/n/l/y/)/](https://www.newadvent.org/bible/1co012.htm) |
| MB07 | /G/o/s/p/e/l/ | VARIABLE_PROPER_READING | [/L/u/k/e/ /1/8/:/9/–/1/4/ /(/e/x/a/m/p/l/e/:/ /P/e/n/t/e/c/o/s/t/ /X/ /o/n/l/y/)/](https://www.newadvent.org/bible/luk018.htm) |
| MB08 | /C/r/e/d/o/,/ /I/n/c/a/r/n/a/t/i/o/n/ | DOCTRINAL_SCRIPTURE_CONNECTION | [/J/o/h/n/ /1/:/1/4/](https://www.newadvent.org/bible/joh001.htm) |
| MB09 | /L/a/v/a/b/o/ | DIRECT_SCRIPTURAL_WORDING | [/P/s/a/l/m/ /2/5/:/6/–/1/2/ /(/V/u/l/g/a/t/e/;/ /2/6/:/6/–/1/2/ /m/o/d/e/r/n/)/](https://www.newadvent.org/bible/psa025.htm) |
| MB10 | /O/r/a/t/e/ /f/r/a/t/r/e/s/ | DOCTRINAL_SCRIPTURE_CONNECTION | [/R/o/m/a/n/s/ /1/2/:/1/](https://www.newadvent.org/bible/rom012.htm) |
| MB11 | /S/a/n/c/t/u/s/ | SCRIPTURAL_WORDING_ADAPTED | [/I/s/a/i/a/h/ /6/:/3/](https://www.newadvent.org/bible/isa006.htm) |
| MB12 | /B/e/n/e/d/i/c/t/u/s/ /a/n/d/ /H/o/s/a/n/n/a/ | SCRIPTURAL_WORDING_ADAPTED | [/M/a/t/t/h/e/w/ /2/1/:/9/](https://www.newadvent.org/bible/mat021.htm) |
| MB13 | /T/e/ /i/g/i/t/u/r/ /i/n/t/e/r/c/e/s/s/i/o/n/s/ | SCRIPTURAL_PARALLEL_NOT_QUOTATION | [/1/ /T/i/m/o/t/h/y/ /2/:/1/–/2/](https://www.newadvent.org/bible/1ti002.htm) |
| MB14 | /C/o/n/s/e/c/r/a/t/i/o/n/ /o/f/ /t/h/e/ /H/o/s/t/ | NARRATIVE_SCRIPTURE_CONNECTION | [/1/ /C/o/r/i/n/t/h/i/a/n/s/ /1/1/:/2/3/–/2/6/](https://www.newadvent.org/bible/1co011.htm) |
| MB15 | /C/o/n/s/e/c/r/a/t/i/o/n/ /o/f/ /t/h/e/ /C/h/a/l/i/c/e/ | NARRATIVE_SCRIPTURE_CONNECTION | [/L/u/k/e/ /2/2/:/2/0/](https://www.newadvent.org/bible/luk022.htm) |
| MB16 | /U/n/d/e/ /e/t/ /m/e/m/o/r/e/s/ | DOCTRINAL_SCRIPTURE_CONNECTION | [/1/ /C/o/r/i/n/t/h/i/a/n/s/ /1/1/:/2/6/](https://www.newadvent.org/bible/1co011.htm) |
| MB17 | /S/u/p/r/a/ /q/u/a/e/ /—/ /A/b/e/l/ | EXPLICIT_BIBLICAL_FIGURE | [/G/e/n/e/s/i/s/ /4/:/4/](https://www.newadvent.org/bible/gen004.htm) |
| MB18 | /S/u/p/r/a/ /q/u/a/e/ /—/ /A/b/r/a/h/a/m/ | EXPLICIT_BIBLICAL_FIGURE | [/G/e/n/e/s/i/s/ /2/2/:/1/–/1/9/](https://www.newadvent.org/bible/gen022.htm) |
| MB19 | /S/u/p/r/a/ /q/u/a/e/ /—/ /M/e/l/c/h/i/s/e/d/e/c/h/ | EXPLICIT_BIBLICAL_FIGURE | [/G/e/n/e/s/i/s/ /1/4/:/1/8/–/2/0/](https://www.newadvent.org/bible/gen014.htm) |
| MB20 | /M/e/l/c/h/i/s/e/d/e/c/h/ /a/n/d/ /p/r/i/e/s/t/h/o/o/d/ | INTERPRETIVE_BIBLICAL_TYPOLOGY | [/H/e/b/r/e/w/s/ /7/:/1/–/1/7/](https://www.newadvent.org/bible/heb007.htm) |
| MB21 | /P/a/t/e/r/ /n/o/s/t/e/r/ | DIRECT_SCRIPTURAL_WORDING | [/M/a/t/t/h/e/w/ /6/:/9/–/1/3/](https://www.newadvent.org/bible/mat006.htm) |
| MB22 | /L/i/b/e/r/a/ /n/o/s/ | SCRIPTURAL_PARALLEL_NOT_QUOTATION | [/M/a/t/t/h/e/w/ /6/:/1/3/](https://www.newadvent.org/bible/mat006.htm) |
| MB23 | /A/g/n/u/s/ /D/e/i/ | SCRIPTURAL_WORDING_ADAPTED | [/J/o/h/n/ /1/:/2/9/](https://www.newadvent.org/bible/joh001.htm) |
| MB24 | /D/o/m/i/n/e/ /n/o/n/ /s/u/m/ /d/i/g/n/u/s/ | SCRIPTURAL_WORDING_ADAPTED | [/M/a/t/t/h/e/w/ /8/:/8/](https://www.newadvent.org/bible/mat008.htm) |
| MB25 | /P/r/i/e/s/t/'/s/ /C/o/m/m/u/n/i/o/n/ /p/r/a/y/e/r/ | DIRECT_SCRIPTURAL_WORDING | [/P/s/a/l/m/ /1/1/5/:/3/–/4/ /(/C/l/e/m/e/n/t/i/n/e/ /V/u/l/g/a/t/e/;/ /P/s/a/l/m/ /1/1/6/:/1/2/–/1/3/ /i/n/ /m/o/d/e/r/n/ /n/u/m/b/e/r/i/n/g/)/](https://vulgate.org/ot/psalms_115.htm) |
| MB26 | /L/a/s/t/ /G/o/s/p/e/l/ /(/w/h/e/n/ /p/r/e/s/c/r/i/b/e/d/)/ | VARIABLE_RITE_SCRIPTURE_READING | [/J/o/h/n/ /1/:/1/–/1/4/](https://www.newadvent.org/bible/joh001.htm) |

**Separate work that cannot be certified by these chapter links:** original 1962 printed Mass passage/page collation; the full 105-source-path Proper and 195 lessons/Gospels against actual adopted missal edition; 15 discontinuous-reading boundaries; 420 chant positions and 398 earlier candidate Scripture labels; 54 Fortescue typological leads; 22 Dujardin devotional passages and attribution locators. Zero external original-page packets may be labelled certified merely because the runtime has Latin source guards. All four existing `reviewHolds` remain non-public and fail closed.

## Full Mass research source queue — 12 October 2026 (105 × 4)

The complete [105-path certification queue](../../data/learn/mass-bible-source-certification-queue.v1.json) joins the existing production Proper identities **105/105** to the original donor's **420/420** chant positions in four fixed slots: Introit, Gradual, Offertory and Communion. This file holds only provenance and audit statuses, not a second chant or biblical-text catalogue. Source identity and Latin-text/biblical-verse certification are distinct tasks.

- **364** positions carry upstream Scripture annotations; **56** have no direct annotations. **42** are inherited/unresolved and **13** source sections are absent in the upstream witness. An absent source section is *not* an assertion that a 1962 Proper has no chant.
- [100 prioritized evidence packets](https://github.com/Fulcanelli13/ad-orientem/blob/e8c3947154531be18f011834fdc9f2ae625b6e38/data/geography/research/mass-1962-high-priority-100-evidence-packets-20261011.v1.json) carry **0 fully independently certified original-edition cases**; [44 candidate printed-page clusters](https://github.com/Fulcanelli13/ad-orientem/blob/e8c3947154531be18f011834fdc9f2ae625b6e38/data/geography/research/mass-1962-44-cluster-printed-page-context-20261012.v1.json) still require feast-heading and Latin phrase discrimination, with 66 candidate PDF pages. Inheritance and conditional Alleluia/Tract/Sequence ordering must still be checked. The four fixed slots are *not* a complete chant inventory for seasonal variants.
- [54 historically classified Mass–Scripture interpretations](https://github.com/Fulcanelli13/ad-orientem/blob/e8c3947154531be18f011834fdc9f2ae625b6e38/data/geography/research/mass-scripture-source-extractions-20261011.v1.json), [30 Fortescue original-book locators](https://github.com/Fulcanelli13/ad-orientem/blob/e8c3947154531be18f011834fdc9f2ae625b6e38/data/geography/research/mass-scripture-fortescue-order-extract-20261011.v1.json) and [22 Dujardin meditation positions](https://github.com/Fulcanelli13/ad-orientem/blob/e8c3947154531be18f011834fdc9f2ae625b6e38/data/geography/research/mass-dujardin-1962-order-bridge-20261011.v1.json) are existing source research with distinct authorship/meaning gates. They are not canonically validated 1962 cues and are not duplicated into the release JSON. Dujardin's devotional analogies are not the historical causes of the ceremonies.
- **MB11** correction: the Vulgate's Isaiah 6:3 says *Deus exercituum*, the liturgical Sanctus has *Deus Sabaoth*: [original-language chapter](https://www.newadvent.org/bible/isa006.htm). It remains labelled adapted Scripture, not a direct word-identical witness.

The five ordered certification gates are recorded in the queue. For each Proper, **independent original 1962 celebration eligibility, chant words and verse text** must all be checked before certification; there is presently no grounds to mark any 420 position published. Missing seasonal families and non-indexed sanctoral/commons remain outside this 105-source-path subcorpus. The ordinary Mass, 48 LIVE cards, rite rubrics, priest/faithful cues and daily Mass decision engine are unchanged.

### Critical scope boundary corrected from CI review

The **105 production Proper identities/420 fixed chant slots** and the separate **100 printed-Missal priority dossiers** refer to different selections from the wider **1,052 indexed source-path candidates**. There are **only 4 shared paths**; **96 of the 100 priority dossiers are outside the 105-path preview**. All **44 candidate printed-page clusters** belong to those wider 100 priority dossiers, and **0/44** are in the preview's 105 Proper paths. Thus the 44-cluster paper work cannot be counted as certification work completed on 44 of the 105 preview Propers. The [corrected queue](../../data/learn/mass-bible-source-certification-queue.v1.json) stores the 105-path/420-position matrix and a *separately labelled* 100-path printed-edition research queue, joined only by exact existing `sourcePath`. The earlier document paragraph should not be interpreted as equating these different denominators.

## Fortescue FT010 and First Sunday of Advent Introit — direct source comparison

Fortescue's final index-only locus **FT010** has been directly located in a digitized edition of *The Mass* (1912): **Part II, chapter V §3, printed pp. 225–226**, the celebrant's preparatory prayers. The author connects the altar approach with Psalm 42:4 and explains the later standardization by St Pius V; the original 1912 facsimile page remains *not visually certified*. [Original edition](https://archive.org/details/massstudyofroman00fort) · [Digitized text](https://gorettipub.org/fortescue_mass_study_liturgy.pdf). Together with the previous 29 donor passages, this makes **30/30 Fortescue textual loci located**, not 30 historically certified 1962 practices.

A concrete **wording discrepancy** was recorded in research Proper `Tempora/Adv1-0`, Introit: [upstream chant](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Adv1-0.txt) uses *qui te exspectant*, whereas [Clementine Psalm 24:3](https://www.newadvent.org/bible/psa024.htm) has *qui sustinent te*. The upstream citation correctly nominates a biblical passage, but it is not the same Latin word sequence. Do not normalize the chant automatically to the Clementine text, and do not assert the 1962 printed form was inspected. Details: [spotcheck registry](../../data/learn/mass-bible-direct-witness-spotchecks.v1.json).
