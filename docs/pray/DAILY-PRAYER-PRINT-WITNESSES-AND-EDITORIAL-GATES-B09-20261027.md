# B09 — Four high-value daily-prayer source families, full historical texts

**27 October 2026 · Ad Orientem · Draft PR #1785, research only.**

## Outcome

Thirteen **complete source-form witnesses** were manually compared with images of the original printed pages, not just Wikisource OCR or chapter openings. Cumulative image-checked source forms are **27**: 9 from B07, 5 from B08 and 13 from B09; **15 French / 12 English**. These figures are not counts of independent prayer families or user-facing approved tabs.

Full historical bodies and exact original page links: `data/pray/daily-prayer-high-priority-original-prints.b09.json`. Existing concordance links have been updated. No source has been merged into live PRAY.

### 1. F. X. Lasance, *With God* (1911), printed p. 127 — two Apostleship offerings

Image: https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/137

The original page prints **two distinct complete historical prayers connected by the word 'or:'**:

| Form | Opening | Editorial relationship |
|---|---|---|
| Lasance Apostleship A | *O my God, I offer Thee my prayers, works, and sufferings this day...* | Sacred Heart / thanksgiving / reparation / associates / monthly intention |
| Lasance Apostleship B | *O, Jesus, through the immaculate heart of Mary...* | Through the Immaculate Heart / worldwide Mass / associates / intention recommended by the Pope |

The second is already described in B01 occurrence `AO.DAILY.B01.087`; the first is **newly distinguished within the same original printed section**, not a made-up prayer nor an extra book.

**Do not conflate them** with the form appearing in `Blessed Be God` (1925), which includes *reparation for my sins* and *intention of the Apostleship of Prayer*, rather than the Pope's particular recommended intention. The latter remains source-chapter witnessed and awaits separate direct print-image comparison before publication. The 2005 Compendium/modern USCCB canonical Offering is a separate later textual witness and not a source for the 1911 text.

### 2. Lasance, *With God* (1911), printed p. 145 — Night Prayer headed St Alphonsus

Image: https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/155

Complete short prayer starting *Jesus Christ, my God, I adore Thee and I thank Thee*, offering sleep to God and asking protection through the Savior, Our Lady and angels. Source clearly **attributes** it to St Alphonsus Liguori; authorial attribution is **as printed**, not a newly verified critical attribution to the saint.

The 1911 page also prints an **old 60-days indulgence notice**. This is *historical source metadata only*. Do not display an active indulgence claim.

### 3. Patrick F. Moran, *The Catholic Prayer Book and Manual of Meditations* (1883), pp. 14–15

Pages:
- https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/32
- https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/33

The complete Act of Contrition beginning *O dread Lord, and most indulgent Father of mercies* spans two original printed pages. Distinct from the brief penitential reflections and lay Confiteor earlier in the Night Prayer section. Its archaic literary and devotional style may be valuable as **Long historical form**, not suitable as the only default.

### 4. Historical French daily prayer, 1905 print appendix

Original images:
- https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42 — printed p. 6*.
- https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/43 — printed p. 7*.
- https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44 — printed p. 8*.

**Nine complete prayer-form texts recovered**, including:
- Evening adoration with short professions of Faith/Hope/Charity.
- Evening thanksgiving.
- Holy Ghost petition for light **before examination** (not examination questions).
- Contrition.
- Explicit purpose of amendment, **separate prayer beginning 'Que je souhaiterais...'**, spanning pp. 7*–8*.
- Prayer for sleep and Marian/angelic protection (one compound prayer).
- Prayer for living **and departed** (one compound intercession; includes historical confessional wording and needs editorial-context consideration).
- `Visita, quaesumus` French collect; OCR loses the middle clause, but original printed page clearly contains *d'en éloigner toutes les embûches de l'ennemi*.
- Closing prayer to all the saints, **not initially inventoried in B06**. It should not be appended silently to Visita.

**Corrected error:** B06 had the *Source éternelle de lumière* prayer on image 43. It is actually printed on image **42**; this locator is now corrected and linked to exact text in B09.

**Original prayer source, not Catechism authorship:** the prayers appear in introductory devotional pages of a 1905 printed edition carrying the Council of Trent's Catechism; they are not statements composed by the Council of Trent.

## Specific editorial recommendation without preapproval

- Make **Morning Offering** a multi-form choice: Apostleship A and B (1911), *Blessed Be God* variant (1925, pending image check), 1899 Sacred Heart Morning Offering (B08 scan verified), and Moran's Good Intention (B07 verified). Two closely repeated formulae across books should share a tab with multiple witnesses unless materially different.
- Add **Evening preparation, contrition and resolution** as separate distinct-stage texts; the 1905 French sequence establishes exactly why this distinction matters.
- Give users **optional combination** of a bedtime protection prayer (e.g. St Alphonsus), an antiphon `Salva nos`, and the collect `Visita quaesumus`. They are different devotional types, not competing wordings of one prayer.
- A **Faith/Hope/Charity** triplet can be represented in one category with sub-stages; do not manufacture additional prayer text or collapse three acts into one generic summary.
- Distinguish the coherent historical whole-routine presets (one particular edition in its printed sequence) from the user-customizable composite routine.
- The approved optional **timer** belongs to the separate session-control layer, never changes prayer text provenance, and never automatically advances cards.

## Remaining holds

1. Print-page verification of `Blessed Be God` Morning Offering and its incomplete Wikisource daypart transclusion.
2. French source rights/edition boundaries and language parity: **15 verified French source bodies do not imply historical EN translations**.
3. Cross-manual complete-form deduplication and source-attribution checks for other shortlisted forms.
4. Editorial approval of candidate tabs/defaults; existing UI and production prayer bank unchanged.
5. No publication of old indulgence day/year counts as modern grants; preserve period language as historical witness, while deciding if appropriate as a default.

**QA target:** B09=13 complete form records, 7 distinct scan image URLs, correct referenced source IDs; cumulative 27 forms; no duplicate B09 form IDs; all 15 French/12 English. This is **source text certification**, not a merge or a production release.

**Cost** €0; no rights-holder contact or paid tooling.
