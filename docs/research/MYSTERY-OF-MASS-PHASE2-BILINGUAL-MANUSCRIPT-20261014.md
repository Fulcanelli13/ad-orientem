# Mystery of the Mass — Phase 2 bilingual manuscript assembly

**14 October 2026 · Research draft PR #1193 · Not approved for production.**

This work turns the Phase 1 inventory into a **complete first-draft manuscript** for all 39 source-first Mass sections, while preserving the existing 8-lesson `learn.mass` course and existing Guide source owners. It does **not** modify the 1962 Mass reader or publish the texts.

## Concrete deliverables

1. **[20 selected polished Scripture explanations](../../data/learn/research/mystery-mass-selected20-bilingual-mystagogy-20261014.v1.json).** The pre-existing Mass–Bible EN/FR manuscript is now placed under exact owners for **15 distinct Mass sections**. Each has a concise EN/FR introduction, the source-linked, polished longer explanation, original Vatican 1962 printed-page image links and Bible witnesses. Linked Guéranger and Lanslots notes are explicitly marked **supporting** or **critical**, rather than creating redundant standalone Guides. Four substantial complementary bilingual paragraphs were drafted where an original French interpretation genuinely deepens the retained text. No historical interpretation is a prescriptive 1962 gesture.
2. **[24 additional sourced bilingual Mass-section explanations](../../data/learn/research/mystery-mass-24-bilingual-gap-manuscript-20261014.v1.json)** for precisely the 24 source-first sections not already reached by the polished Bible explanations. Each has a distinct one-sentence introduction, a substantive longer EN/FR reading, clickable primary sources, any relevant Guéranger cue IDs, its parent Guide owner and relevant Missal-form warnings. These explain, inter alia, Kyrie, Collect, Epistle, Gradual, sermon, Orate fratres, Preface, the remaining Canon prayers, Fraction/commingling, faithful Communion preparation, Ablutions, Postcommunion, dismissal and blessing.
3. **[Eight bilingual lesson-level syntheses](../../data/learn/research/mystery-mass-eight-lesson-bilingual-synthesis-20261014.v1.json)** extending (not replacing) the existing **24 baseline formation claims**. The 16 substantial paired-language paragraphs have individual original-source links and point to existing Mass section owners: structural unity; prayer/gestures; oblation of the faithful; Canon; Consecration; Calvary and sacrifice; priestly and faithful Communion; thanksgiving and Christian life.
4. **[Automated bilingual/source ownership acceptance](../../tests/mystery-mass-phase2-bilingual-manuscript.mjs)** verifies every paragraph's sources, French/English presence, 39/39 canonical section coverage, 20 + 24 record count, no duplicate new-section ownership, living Canon mapping, key 1962 distinctions and **zero publication approvals**. Read-only [CI workflow](../../.github/workflows/mystery-mass-editorial-inventory.yml) also validates the existing eight-stage formation reader and Phase 1 source inventory.

### Coverage at the level that matters

| Coverage measure | Result | Interpretation |
|---|---:|---|
| Canonical source-first Mass explanation owners | **39 / 39** | One owner per liturgical section |
| Source-first sections reached by the polished Mass–Bible text | **15 / 39** | 20 individual Scripture moments, sometimes several under one prayer |
| Remaining section owners given new bilingual manuscript | **24 / 24** | Explanatory copy now drafted for every remaining Mass section |
| Total EN/FR explanatory units | **44** | 20 selected Bible passages + 24 new section explanations; **44 does not mean 44 competing cards** |
| Existing eight lessons given bilingual synthesis | **8 / 8** | 16 sourced lesson paragraphs supplement 24 existing formation claims |
| Newly approved explanations for publication | **0** | Draft completeness does not equal doctrinal/editorial release approval |

## Breakdown across the eight lessons

| Existing thematic chapter | Primary section owners mapped | New EN/FR explanatory units |
|---|---:|---:|
| `MF01` The shape of the Mass | 9 | 9 |
| `MF02` The body at prayer | 0 | 0 |
| `MF03` The Offertory and your offering | 2 | 4 |
| `MF04` Inside the Roman Canon | 7 | 7 |
| `MF05` What changes at the Consecration | 2 | 2 |
| `MF06` Is the Mass another Calvary? | 7 | 9 |
| `MF07` Why the priest must receive | 7 | 8 |
| `MF08` Thanksgiving and being sent | 5 | 5 |

`MF02`, the lesson on the body at prayer, is deliberately cross-cutting: it explains distinctions between priestly gestures and the faithful's devotional postures without owning an extra live Mass text step.

## Decisions that prevent duplicate or misleading teaching

- **Psalm 42**: choose `MB02`; treat `MB01` as source background and respect the days/rites when `Judica me` is omitted. No second introductory Psalm card.
- **Gospel and feast readings**: explain what is proclaimed from the **actual** day's Proper; do not hardwire the Tenth Sunday after Pentecost Gospel/Epistle to every Mass.
- **Sanctus / Benedictus**: one `AO.CARD.013` owner can explain Isaiah 6, Revelation 4 and the entry into Jerusalem, but the texts retain their distinct sources.
- **Consecrations**: Host and Chalice are distinct owners; the first genuflection follows the actual Consecration, not merely the Elevation. The historical details of Jesus's gestures must not be inferred from unrelated Gospel scenes.
- **Supra quae**: three polished passages for **Abel, Abraham and Melchisedech** belong under one Canon segment. Keep Isaac's sparing and do not claim Genesis describes an elaborate consecrated meal for Abraham's soldiers.
- **Supplices**: Guéranger's Christological angel reading and the created-angel alternative are properly distinguished from settled doctrine; do not describe a physical transfer of Eucharistic species to heaven.
- **Communicantes**: **St Joseph is retained** in the Roman Canon according to the decree effective **8 December 1962**, notwithstanding his absence from the nineteenth-century Guéranger/Lanslots witnesses.
- **Commingling**: consecratio in *Hæc commixtio* **does not** effect a second transubstantiation.
- **Communion**: the priest's triple `Domine, non sum dignus` belongs to his own preparation; distribution to the faithful has a separate owner, conditional on there being communicants. The older/local second Confiteor is not universalized.
- **Conclusion**: selected dismissal, blessing and Last Gospel follow the relevant 1962 form, not a hard-coded identical ending.
- **Scripture provenance**: the user-facing paragraphs cite linked Bible texts, Roman Missal/rubrical texts and (where relevant) Guéranger or doctrinal sources. Scriptural typology never becomes a new gesture instruction.

## What remains before launch

**Next — editorial approval, in substantial batches:** Read and compare all 44 explanation units in both languages for doctrinal precision, devotional substance, readable French and correct hyperlinks. Reconcile specific competing explanatory claims against the older Guéranger FRG01–30 and 422 historical reference corpus, not only the already mapped FRG31–71. The pre-existing Missal and Scripture citations are starting source evidence; inspect **selected original pages**, not necessarily every one of Lanslots's 404 images. Resolve Bible numbering, permissions for verbatim translated passages and the Catholic authority of each claim.

**Then — native interface integration:** Decide how the short/deep explanation lives in the eight existing `learn.mass` lessons and the contextual Guide without creating duplicate cards or disturbing the 48-card LIVE concept. Reuse common section IDs and use the source-first 39-unit mapping strictly as an editorial index.

**Finally — release acceptance:** Test seasonal/Proper variation, Requiem and other omission cases, conditional incensation, minister ownership, postures, priest/faithful Communion separation, bilingual navigation, citations and mobile rendering. Only after approval, merge and verify the actual Vercel application. The current PR is research-only and unmerged.

**Current gate:** content *draft coverage* complete at **39/39**; *release-certified content* remains **0**. This is a substantial transition from source discovery to a concrete bilingual manuscript—not a claim of a finished live module.
