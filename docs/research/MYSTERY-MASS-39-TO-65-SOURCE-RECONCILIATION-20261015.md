# Mystery of the Mass — 39-source-owner ⇢ 65–67 LIVE card reconciliation (15 Oct 2026)

**State:** research handoff; **not** in-app publication, editorial acceptance, fresh original-book collation, or a new Mass reader. JSON ledger: [39-to-65–67 crosswalk](../../data/learn/research/mystery-mass-39-to-curated65-67-source-author-handoff-20261015.v1.json).

## Correction to the 39-versus-65 question

The original `39` is a source-first **ownership** boundary (25 other source sections + 14 Roman Canon source segments), not a limit on user-facing commentary or a demand to revert the current production card projection. The main `src/mass/reader-live-curated-cards.js` has 16 actively subdivided owners and 23 unsplit owners, yielding **65 ordinary base cards** (64 ordinarily visible when optional local second Confiteor is omitted). Conditional source-verified Proper content can yield **66/67**. Separate preceding rites may begin with Introit and produce **61/62/63** models. Do not report one universal fixed card count across all forms or special days.

Every LIVE card has a `sourceSectionId` and derived `AO.LIVECURATED.….ordinal` presentation ID. The 39 owner records should synthesize shared interpretation; each finer prayer, sentence or gesture gains a **passage/cue anchor** within that owner. The 39 research owners must not drive Mass LIVE navigation.

### Machine-derived base model map

The table below is derived from the actual grouped card titles in `main` and the 39 source-first inventory in PR #1193. Titles of **ungrouped** cards are inherited inventory labels pending a runtime title parity check. Conditional pre-Gospel variants are specified in the JSON and must be generated from actual Proper data.

| Source owner | Owner name | Base LIVE cards | Reader presentations |
|---|---|---:|---|
| `AO.CARD.001` | Introit & Preparatory Prayers | 5 | At the Foot of the Altar · Opening and Psalm 42; Confiteor of the Celebrant; Confiteor of the Servers; Versicles and Ascent of the Altar; Introit |
| `AO.CARD.002` | Kyrie | 1 | Kyrie |
| `AO.CARD.003` | Gloria | 3 | Gloria · The Celebrant's Intonation; Gloria · Praise and Supplication; Gloria · Doxology |
| `AO.CARD.004` | Collect | 1 | Collect |
| `AO.CARD.005` | Epistle / Lesson | 1 | Epistle / Lesson |
| `AO.CARD.006` | Gradual · Alleluia / Tract / Sequence | 1 | Gradual · Alleluia / Tract / Sequence |
| `AO.CARD.007` | Holy Gospel | 2 | Preparation for the Gospel; Proclamation of the Holy Gospel |
| `AO.CARD.008` | Sermon / Homily | 1 | Sermon / Homily |
| `AO.CARD.009` | Credo | 4 | Credo · The Celebrant's Intonation; Credo · The Father and the Son; Credo · Incarnation, Passion and Resurrection; Credo · The Holy Spirit, Church and Life Eternal |
| `AO.CARD.010` | Offertory | 5 | Offertory · Invitation and Antiphon; Offertory · Offering of the Bread and Chalice; Offertory · Humility and Invocation; Offertory · Incensation; Offertory · Lavabo and Offering to the Trinity |
| `AO.CARD.011` | Orate fratres & Secret | 2 | Orate, fratres · Prayer and Response; Secret Prayer and Conclusion |
| `AO.CARD.012` | Preface | 1 | Preface |
| `AO.CARD.013` | Sanctus · Benedictus | 2 | Sanctus; Benedictus |
| `AO.CANON.01` | Te igitur | 1 | Te igitur |
| `AO.CANON.02` | Memento, Domine — Living | 1 | Memento, Domine — Living |
| `AO.CANON.03` | Communicantes | 1 | Communicantes |
| `AO.CANON.04` | Hanc igitur | 1 | Hanc igitur |
| `AO.CANON.05` | Quam oblationem | 1 | Quam oblationem |
| `AO.CANON.06` | Consecration of the Sacred Host | 2 | Consecration of the Host · Preparation; Words of Consecration and Elevation · Host |
| `AO.CANON.07` | Consecration of the Chalice | 2 | Consecration of the Chalice · Preparation; Words of Consecration and Elevation · Chalice |
| `AO.CANON.08` | Unde et memores | 1 | Unde et memores |
| `AO.CANON.09` | Supra quae | 1 | Supra quae |
| `AO.CANON.10` | Supplices te rogamus | 1 | Supplices te rogamus |
| `AO.CANON.11` | Memento etiam, Domine — Dead | 1 | Memento etiam, Domine — Dead |
| `AO.CANON.12` | Nobis quoque peccatoribus | 1 | Nobis quoque peccatoribus |
| `AO.CANON.13` | Per quem haec omnia | 1 | Per quem haec omnia |
| `AO.CANON.14` | Per ipsum · Minor Elevation | 1 | Per ipsum · Minor Elevation |
| `AO.CARD.019` | Pater noster | 1 | Pater noster |
| `AO.CARD.020` | Libera nos · Fraction · Pax Domini | 3 | Libera nos · Prayer and Conclusion; Pax Domini; Commingling of the Sacred Species |
| `AO.CARD.021` | Agnus Dei | 1 | Agnus Dei |
| `AO.CARD.022` | Prayers before Communion | 2 | Prayers before the Priest's Communion; Domine, non sum dignus · Celebrant |
| `AO.CARD.023` | Communion of the Priest | 2 | The Priest receives the Sacred Host; The Priest receives the Precious Blood |
| `AO.CARD.024` | Ecce Agnus Dei & Faithful Preparation | 2 | Second Confiteor · Optional Local Custom; Ecce Agnus Dei · Preparation of the Faithful |
| `AO.CARD.025` | Communion of the Faithful | 1 | Communion of the Faithful |
| `AO.CARD.026` | Ablutions & Communion Antiphon | 2 | Ablutions; Communion Antiphon |
| `AO.CARD.027` | Postcommunion | 1 | Postcommunion |
| `AO.CARD.028` | Dismissal | 1 | Dismissal |
| `AO.CARD.029` | Placeat & Final Blessing | 2 | Placeat tibi · Closing Prayer; Final Blessing |
| `AO.CARD.030` | Last Gospel | 2 | Last Gospel · Prologue of St John; Last Gospel · The Word Made Flesh |

Base reader presentation count: **65**. Canon source owners: **14**. Total original archival evidence: **422**; 402 macro-owned, 20 held for precise cue/external event placement. These macro assignments **do not** prove every source locator, quote, rite condition, or interpretation.

## Granularity and attribution

Use a three-level invariant:

1. **Source owner** — e.g. `AO.CANON.10` / *Supplices te rogamus*; reused by the study course and Mystery liturgical chronology.
2. **LIVE card** — e.g. one or several derived `AO.LIVECURATED.…` IDs, ordered and conditional according to the sourced 1962 reader.
3. **Exact explanatory anchor** — phrase/word/gesture (not an invented new card), keyed eventually by verified `sourceCueId` and exact source range.

Examples in the JSON cover *Quam oblationem*'s five epithets, the angel/altar and profound bow in *Supplices*, Abel/Abraham/Melchisedech in *Supra quae*, separate Host/Chalice words and elevations, `et Verbum caro factum est`, and the clergy/faithful Confiteor distinction. All sample cue identifiers marked pending **remain proposals**, not certified links.

**Proper rule:** Gradual, Alleluia, Tract and Sequence must receive distinct navigation if and only if actual Latin/EN/FR source-certified boundaries warrant this. Never split a composite Proper using typography or inferred theology. Preserve the complete text and all cue/event ownership.

**Special-rite rule:** Asperges, Vidi aquam, Palm/Ash/Candlemas and processions have conditional external stages. Neither assign them automatically to Introit nor manufacture a historical interpretation as a 1962 rubric.

## Work/edition/witness handoff, not a second registry

The current `data/reference/canonical-works-pilot.v1.json` is a **13-work pilot**, not a comprehensive Mass source census; it already contains `WORK-MISSALE-ROMANUM-1962` and `WORK-MEDIATOR-DEI-1947`, among others. The shared source parser is `src/reference/passage-packs.js` (PR #1222 + merged #1233/#1234). Source identity requests from parallel work must be **reconciled first**.

The companion machine-readable JSON proposes **24 identity/work *checks***, not 24 newly verified books or original transcriptions. Priorities:

- **Foundational/patristic:** Justin, Cyril, Ambrose, Augustine, Gregory the Great. Gregory's historic papal role and the uncertain attributions of particular developments must be distinguished.
- **Medieval/Tridentine:** Aquinas, Innocent III, Durandus, Trent, Pius V and Benedict XIV. Use the correct 1570/1962 Missal edition context; St Pius V was a codifier, not the sole originator.
- **Historical and twentieth-century scholarship:** Guardini, Jungmann, Casel and Bouyer. Avoid labelling all as Ratzinger's direct teachers; note documented influences individually.
- **Ratzinger/Benedict XVI:** **one person/author identity**. Keep works written as Joseph Ratzinger distinct from papal exhortations/teaching with their proper authority and publication context.
- **Biblical typology:** Scott Hahn and Brant Pitre, explicitly distinguishing a biblical analogy, traditional interpretation and **documented historical dependency** of Roman ritual.
- **Traditionalist source voices:** Marcel Lefebvre, SSPX institutional writings with individually identified authors, Michael Davies and Alcuin Reid, separately classified as interpretive/historical/controversial where appropriate.
- **Denzinger:** useful *index* to councils/papal decisions; it is not an independent magisterial author behind every quotation. Prefer the underlying primary text and its citation number, preserving edition/numbering.

**Never infer** full-text access, passage collation, online link stability, translation rights or publication approval from this candidate list.

## Immediate sequenced tasks and acceptance gates

1. **Runtime check:** verify all 65 base IDs/titles and the real 66/67 (plus 61–63 Introit-entry) proper-conditioned outputs against actual compiled source model. The current mapping is code-derived, not full live-browser verified.
2. **Canon first:** process the existing **32 same-author cases** and five highest-overlap comparisons without losing independent author testimonies; preserve the five already logged disputed interpretation groups.
3. **Source-owner precise anchors:** bind all 422 historical claims, including the 20 unassigned, to a verified exact passage or legitimately external rite, then attach real cue IDs from the source corpus.
4. **Reference ownership:** compare the 24 work proposals with current work/edition/witness IDs, 26 outstanding earlier identity requests and independent research branches. Register only truly new works in the *shared reference pipeline*.
5. **Source collation:** prioritize Aquinas, Guéranger, Gihr, Le Brun and the added liturgists where the passage actually explains this Mass prayer. Source authority type and printed edition are separate dimensions.
6. **App editorial gate:** synthesize EN/FR summaries only after theological/source review. Do not alter canonical Mass prayers, reader projection, rite variants, or publish existing Mystery draft prematurely.

**Related work:** [Mystery PR #1193](https://github.com/Fulcanelli13/ad-orientem/pull/1193), [Mass release #1210](https://github.com/Fulcanelli13/ad-orientem/pull/1210), [shared reference #1212](https://github.com/Fulcanelli13/ad-orientem/pull/1212), [parsing #1229](https://github.com/Fulcanelli13/ad-orientem/pull/1229), [shared reader #1233](https://github.com/Fulcanelli13/ad-orientem/pull/1233) and [source identity #1234](https://github.com/Fulcanelli13/ad-orientem/pull/1234).
