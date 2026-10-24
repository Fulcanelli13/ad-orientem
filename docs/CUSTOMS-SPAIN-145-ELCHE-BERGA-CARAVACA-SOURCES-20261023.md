# Customs register — Spanish Catholic regional complexes source pass

**Research date:** 23 October 2026. **Branch:** `research/customs-full-registry-census-20261023`. **Scope:** non-canonical source observations only; NO app, Calendar, Missal, prayers or ritual publication.

## Summary

This batch screened **145 source/detail observations** from official institutional and local practice sources describing **three separate Catholic-linked festival complexes**:

| Complex | Detail records | Principal source authorities |
|---|---:|---|
| Elche, Valencia: Marian Assumption *Misteri d'Elx*, Roà, octave | **72** | Patronat del Misteri d'Elx: first/second-act official guides, feast and year-schedule pages |
| Berga, Catalonia: Corpus Christi-derived *La Patum* | **36** | Berga municipality: 2026 Thursday and Sunday programmes and overview; Government of Catalonia heritage overview |
| Caravaca de la Cruz, Murcia: Santísima y Vera Cruz and May festivals | **37** | Caravaca municipal tourism: detailed 1–5 May programme, Cross devotional history; Murcia regional tourism account |
| **Total** | **145** | Institutional HTML with exact web-text line references where available; eight Murcia excerpt entries have only the indexed textual witness |

Raw data: `data/customs/master/spain-elche-berga-caravaca-three-regional-complexes-action-detail-pass.v1.json`. It preserves an ID, location and parent tradition, short original action label, claim type, URL and source edition/access precision for every record. The 2026-specific programme is marked separately; modern touristic and historical summaries do **not** provide evidence for a practice at an assumed earlier date.

## Important interpretation

### Elche — the Assumption drama is not an official Catholic liturgical rite

The official [Misteri introduction](https://misteridelx.com/misteri/), [first-act script guide](https://misteridelx.com/representacion-guia/), [second-act guide](https://misteridelx.com/representacion-guia-segundo-acto/), and [festival description](https://misteridelx.com/misteri-festividad/) describe a medieval Catholic-themed Assumption *sacred theatre* and living local devotion.

Distinct Catholic devotional actions include the candlelit overnight **Roà** vigil of 14–15 August, early-morning Assumption Masses and octave **Salves** before the recumbent image. The theatrical angelic descent, symbolic St Peter baptism, Marian burial/Assumption/coronation, processional gestures, costumes, canopy and fireworks are components of that **one performance complex**. They must **not** be presented as the literal events depicted or as a Roman sacramental ritual approved for reproduction. The reuse of fallen gold foil and gold-palm fragments as heirlooms is a descriptive ethnographic report, **not a validated indulgence, relic or cult**. The specific October 2026 and November 2026 theatrical schedule comes from [the Patronat's 2026 page](https://misteridelx.com/informacion-horarios/) and is not a timeless feast prescription.

### Berga — Corpus Christi connection does not mean every action is the Mass

[Government of Catalonia heritage overview](https://patrimoni.gencat.cat/en/collection/la-patum) connects *La Patum* to medieval Corpus Christi processional theatre. [Berga's 2026 Thursday programme](https://ajberga.cat/temes/ambit-la-patum/5932-dijous-de-corpus-) and [2026 Sunday programme](https://ajberga.cat/actualitat/agenda/5935-diumenge-de-corpus-) distinguish actual parish Masses from **Patum de Lluïment**, **Patum Completa**, dance comparses, **Plens** fire-devils, **Guites** and **Tirabols**. A municipal [heritage description](https://www.ajberga.cat/actualitat/noticies/el-departament-de-cultura-reforca-el-seu-compromis-amb-la-patum-de-berga-) covers older mentions and the smaller Friday Patum Infantil.

The Corpus religious calendar anchor survives, but the festive dramatic figures and pyrotheatrics are not the Eucharistic procession, the 1962 Missal rubrics or additional separate devotional customs.

### Caravaca — actual religious ceremonies vs horse racing and legendary claims

The [Caravaca municipal festival account](https://www.turismocaravaca.com/es/nuestra-tierra/fiestas-de-caravaca/fiestas-de-mayo) and its [Cross history](https://nueva.turismocaravaca.com/en/the-cross-of-caravaca) describe a distinct sequence of May 1 **unblessed flower offerings**, May 2 blessing of wine and flowers, staged immersion of the Holy Cross reliquary in wine, May 2 relic procession, May 3 feast-day Mass and water immersion, visits by the Cross to the sick, and the May 5 candlelit return procession and fields/crops blessing.

The same local town programme details bareback-horse preparation, embroidery displays, costumed Moors and Christians, and the timed **Caballos del Vino** horse contest. These are civic traditions linked to the patronal fiesta, **not** automatically official sacramental ceremonies. The medieval siege/locust-plague legend, claimed papal privileges, precise relic authenticity, minister's prayer texts and validity/approval under the 1962 Roman Ritual all require independent primary documentation; municipal marketing is not sufficient. Even the municipality counts [nine religious ceremonial actions](https://nueva.turismocaravaca.com/en/the-cross-of-caravaca), and those nine are not automatically nine independent canonical custom identities.

## 20 explicit action-level contrasts (no automatic mergers)

`data/customs/master/spain-regional-20-working-owner-action-contrast-review.v1.json` records **20** specific comparisons of Spanish actions against existing provisional or working master labels. Examples:

- Elche Assumption vigil ≠ French Marian procession solely because both concern 15 August
- Berga Patum theatrical figures and drumming are historically related to **Corpus dramatic customs**, but are not the Eucharistic Benediction or a specific generic medieval play
- Berga giants are local members of a broader *Corpus giant procession* typological family, not a single worldwide identical custom
- Caravaca blessings of a Cross / wine / flowers are distinguishable from the **Assumption blessing of herbs** and **Corpus Christi house-wreath blessings**
- Caravaca May 5 blessing of fields shares an agricultural topic with an Assumption fields blessing, but different feast, sacred object, setting and source history

All 20 are **source-label action contrasts**, not whole-page dual-source verification; final owners, source-independent corroborations, ritual authorizations and published customs remain **zero**.

## Catalogue and provenance audit

The shared master was concurrently advanced to **2,457** by other research lanes (including a separate 114-detail Italian local-feasts wave). This Spanish batch adds **145** data/details, producing **2,602 source/detail research rows**, not 2,602 unique practices.

Existing **408** provisional action groups, **56** working old master identities, **0 newly certified distinct customs**, **0 automatic merges**, and **0 app publications** remain unchanged. Separately retained 157 Irish search-index-only leads and 100 second-pass Mueller entries are **nonadditive**.

Tests in `tests/customs-full-registry-census.mjs` validate exact 145 source IDs, three parent complexes, source URLs and HTML line fidelity, careful scope status, 20 action contrast targets and no identity or app promotion.

## Next useful work

Bulk literature acquisition should now target regionally distributed primary/local **feast-day and household customs** that people could meaningfully practise or attend, not repeated subdivision of one huge heritage festival. Prioritize church-issued descriptions, diocesan archival works, and pre-1962 printed or manuscript witnesses. Keep distinct layers for universal liturgical rites, actual participation in processions, household practice, local civic theatre, regional recipe, personal piety, folk claims and historic narratives.

The existing Ad Orientem Calendar stays authoritative; the research master will supply context-sensitive proposals there only after later verification.
