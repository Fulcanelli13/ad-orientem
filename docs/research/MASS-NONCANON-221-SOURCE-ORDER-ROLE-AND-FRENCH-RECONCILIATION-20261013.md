# Mass reader — non-Canon 221-cue evidence reconciliation, prayer-order audit and French guidance (13 October 2026)

**Result:** first source-to-paragraph crosswalk completed for **all 221 source cues outside the 58-cue Canon**. This is a content and discrepancy research pass, **not a claim of 221 certified priestly actions, approved French translations or new LIVE UI implementation**. The existing 64/65 curated LIVE reader, Latin donor, rubric registries and Mass-form engine remain unchanged.

## Governing functional contract

The user's hard project decision in [the four-surface specification](../MASS-PARAGRAPH-RAILS-AND-DYNAMIC-GUIDANCE-CONTRACT-20261013.md) remains binding:
- Left rail = faithful posture and gestures **at every paragraph**, only where sourced under an actual community profile (otherwise observational).
- Right rail = priest's position and posture at every paragraph, with source-state persistence and separate priest clock.
- In-text = exact priest movements/reverences/actions at the actual words of each prayer; no duplication in other surfaces.
- Second top ribbon = **replace** the redundant icon/status ribbon with contextual explanations, norms and guidance changing with the prayer/part of Mass actually in view. Existing long Guide is a source, not a duplicate in-reader guide panel.

## New research assets saved

| File | Function and status |
|---|---|
| [221-cue evidence crosswalk](../../data/research/mass-noncanon-221-cue-evidence-crosswalk-20261013.json) | Entire non-Canon source cue set (source Latin/clock/branch/proper slot; distinct faithful posture/gesture; priest station/action; in-text detailed event; direct 1962 English Ritus, Latin-phrase research, separately actor-scoped Solemn evidence; existing long Guide owner). Research pointers, **not validated runtime events**. |
| [221-cue independent state projection](../../data/research/mass-noncanon-221-profiled-source-state-projection-20261013.json) | All 221 cues with last unconditional priest station **as research candidate**, explicit condition-matched transitions, possible local faithful posture candidates, non-cue observational anchors and no-synthetic-state gates. Priest timeline remains independent from the text's scroll or the schola's clock. |
| [1962 sequence and authority issues](../../data/research/mass-noncanon-1962-sequence-role-and-posture-gates-20261013.json) | **24** specific prayer-order, actor, gesture, Requiem, special feast and lay participation acceptance gates, with original cue anchors and direct Ritus/General Rubrics references. These are acceptance tests; not all are proven production bugs. |
| [French non-Canon contextual guidance drafts](../../data/research/mass-noncanon-1962-french-guidance-review-batch-20261013.json) | **46** precise-cue French editorial drafts; **24** overlap with earlier original-French Guéranger topics and must **enrich/reconcile** existing canonical subjects rather than create duplicates; **22** do not overlap an earlier FRG entry on the exact same cue, but still require comparison with the existing long Guide. |
| [Future form regression scenarios](../../data/research/mass-noncanon-1962-forms-and-prayer-order-test-cases-20261013.json) | **20** concrete future production test designs, not CI results: prayer groups, Ember lessons, forms/minister roles, special Requiem conditions, second Confiteor, dismissal, priest/Schola clocks and postures. |

## Quantitative source inventory — the denominators matter

| Measure | Research source count | Correct interpretation |
|---|---:|---|
| Non-Canon canonical Sung source cues | **221 / 221** | Indexed, cue IDs linked to source registries; 58 Canon separately handled |
| Source block branches | **207** normative/ordinary, **7** conditional incensation, **7** optional pre-1960 Communion Confiteor | The donor's classification, not a 1962 attestation of every printed phrase/branch |
| Day-resolved Proper-dependent cue placeholders | **19** | Latin `null` at source; must be expanded from date-specific `ResolvedMass.proper` and cannot be certified as literal source paragraphs yet |
| Cues with direct source-backed ceremonial *research* from 46+36+67 event families | **50 / 221** | 1962 English Ritus, 1962 Latin-phrase transcription or Solemn minister source records; mostly **not Latin facsimile/release certified** |
| Cues with existing detailed in-text rubric event | **24 / 221** | Does not imply the other 197 need a new action; many are unchanged text, dialogue or inherited states |
| Cues with existing priest station transition | **49 / 221** | Source position transitions, many conditional; persistent between transitions, not 49 separate unique stations |
| Cues with direct faithful posture change event | **16 / 221** | Local/period profile rules; **not** universal rules for all pews |
| Cues with faithful gesture presentation candidate | **53 / 221** | Must be validated for role, exact words, and local custom |
| Cues mapped to historical long-guide owner by macro | **221 / 221** | **Context-level mapping only**, not 221 distinct short explanation endorsements |
| New paragraph-attached French drafts | **46** | 24 share earlier FRG anchors; remaining 22 do not, and all 46 must be reviewed against historical long Guide |
| Future source/form tests | **20** | Designed, not run |

The `221` denominator counts canonical source units outside the `C0150–C0207` Canon, including **four special state (sedilia) cues** `C0276–C0279`, which are not prayer paragraphs. The synthetic sermon pause is not a numbered Canonical `C####` cue and is excluded. The global original Sung source is **279 canonical cues** plus one synthetic non-liturgical pause.

## High-priority *verified rules* to guide implementation

**Multiple Collects (and matched Postcommunions):**
- `C0072–C0074` `COLLECT_SET` holds opaque day-specific prayers. Under the regular 1962 separate-conclusion rules, **two Collects need two `Oremus`**, while when there are three, the second and third are joined under the second conclusion: **two `Oremus`**, not three. Certain ritual or other explicitly permitted additions belong *under one conclusion* with the primary prayer and must be handled differently. Do not hardcode one Oremus per `COLLECT_SET` or one per raw Collect.
- The `POSTCOMMUNION_SET` at `C0253–C0256` follows **the same number, arrangement and rules** as the opening Collects (General Rubrics **505**). The Lenten `Oratio super populum` is a **separate** concluding prayer with `Oremus. Humiliate capita vestra Deo` and its own ending under **506**. `SECRET_SET` contains the same number/order of secret orations but **no new `Oremus`**; the last secret's public conclusion leads to Preface (**480–481**).
- Sources: [1960/1962 General Rubrics §§433–446, 480–481, 505–506](https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf), [practical 1962 treatment](https://1962ordo.today/1962-rubrics/). **Audit the actual runtime resolver before labelling this a deployed bug**.

**Lessons, responses, role labeling:**
- `C0073–C0078` need an *ordered data structure*, not one prayer-shaped placeholder. Ember Saturdays carry multiple lessons, differing `Deo gratias` cases and particular `Flectamus genua/Levate` locations, governed by **RG60 440, 442–443, 466–468**. Responses must be labelled as responses and attributed to the actual server, choir, ministers or congregation, per the form, not guessed from the donor's generic `USER_RESPONSE`.
- `C0079–C0088` Gospel crosses, book, and proclamation distinguish priest, deacon and faithful. `Missa Cantata` is **not** Solemn Mass and cannot inherit the solemn deacon/subdeacon lane. **RG60 471–473**.
- The optional homily remains a non-liturgical pause, not an invented priest-action prayer cue.

**Other strict branches:**
- `C0112` water blessing excluded at Requiem, but chalice preparation persists; `C0125–C0127` Lavabo doxology has Passiontide/Requiem exceptions; incensation at `C0040–C0041` and `C0120–C0124` is form/rite dependent.
- `C0235–C0241` second Communion Confiteor is **not the normative 1962 sequence**; `Ecce Agnus Dei` `C0242` is said once, and `Domine non sum dignus` `C0243–C0245` three times under **RG60 503**.
- `C0259` dismissal formula, speaker and response depend on the rite. `Requiescant in pace` takes `Amen` rather than `Deo gratias`; `Benedicamus Domino` can suppress blessing, and Last Gospel exceptions have **independent** gates (**RG60 507–510**).
- The priest's private pre-Communion formula `C0229–C0231` must never be merged with the later faithful preparation `C0243–C0245`.

## Source and interpretation precautions

- Existing **32 long Guide entries**, French Guéranger batches (71 candidates), the red 2013 booklet witness, and **422 archived source claims** remain canonical research *inputs*. No textual replacement, suppression or duplication of prior research is done here.
- We do **not** imply 50 / 221 is the rate at which the priest actually gestures: the direct micro-source corpus is a deliberately limited first pass. Some paragraphs need no new gesture; others need inferred persisted physical state **only after** condition and priest-timing validation.
- The local faithful cannot be forced to mimic every priest gesture, particularly the Gospel crosses, Confiteor, Eucharistic adoration, and kneeling customs; posture evidence must be a separate rail.
- One overall source identity serves multiple liturgical forms only when the actor, movement and prayer are genuinely shared. Deacon/subdeacon and Schola cues remain independent.
- Do not call a new draft public-ready because it has a `sourceLocator`; citations must support its actual claim, and the French wording still needs line/facsimile review. Copyrighted contemporary Barroux/Joly translations are benchmarking witnesses rather than text to copy wholesale.

## What this batch deliberately does not do

- **No runtime fix yet** to the potentially faulty `COLLECT_SET`, responses, or postcommunion counts; the repository may have form-aware logic outside these static source blocks.
- No dynamic explanatory ribbon implementation, no changes to the 64/65 LIVE default or 48-card rollback, no unconditional faithful posture map, no Canon source mutation.
- No claim the 221 cues now have fully certified in-text priest rubrics: the new data records **where source evidence is present, absent, or conditional**.
- The source-level Canon `C0194` missing `et` issue [#1145](https://github.com/Fulcanelli13/ad-orientem/issues/1145) remains a separately tracked confirmed text defect.

## Next acceptance path

**First:** test the 20 form scenarios and confirm/fix actual `ResolvedMass.proper` prayer and response order; treat *incorrect ordinary Mass text or sacramental action order* as a release blocker.

**Second:** extend Latin-facsimile/original-Ritus phrase verification to the remaining non-Canon prescriptions in coherent prayer-group batches, then consolidate priest-action events into exact in-text rubrics and inherited right-rail state by selected Mass form.

**Third:** consolidate the 46 new French guidance drafts into the existing 32 long Guide topics and the 71 previously preserved French micro-explanations; do **not** create duplicates. French human/source review and legal translation checks are still required.

**Fourth:** add the dynamic text-guidance surface and run current LIVE mobile acceptance and physical-device checks.
