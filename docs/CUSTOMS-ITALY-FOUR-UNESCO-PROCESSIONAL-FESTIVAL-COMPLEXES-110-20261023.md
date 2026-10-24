# Customs Registry — four Italian local Catholic festival complexes (23 October 2026)

**Authority:** research catalogue only; not part of Ad Orientem Calendar, rites, missal, module publication or UI.

## New documentary emphasis

Four regionally bounded Italian processional festivals appear as separate local traditions within the UNESCO Intangible Cultural Heritage network **00721** (inscribed **2013**): *Festa dei Gigli* for St Paulinus (Nola, Campania); *Faradda dei Candelieri* for the Assumption (Sassari, Sardinia); *Varia* in honour of Our Lady of the Holy Letter and representation of her Assumption (Palmi, Calabria); *Macchina di Santa Rosa* (Viterbo, Lazio). The UNESCO designation groups them as a processional network, **not a single local festival and not 110 individual customs**.

UNESCO / Italian ministry reference: https://unesco.cultura.gov.it/en/projects/rete-delle-feste-delle-grandi-macchine-a-spalla/.

### Witness texts consulted (not original medieval charters)

- **Nola (30 detail observations)** — official Festa dei Gigli foundation [procession route](https://www.fondazionefestadeigigli.org/percorso/), [22 June religious celebrations](https://www.fondazionefestadeigigli.org/22-giugno/), and [2026 dated programme](https://www.fondazionefestadeigigli.org/programma/); supplementary source-critical account Mario Cesarano, [La millenaria Festa dei Gigli di Nola](https://www.engramma.it/eOS/index.php?id_articolo=4971) (2023). Distinguish St Paulinus's bust/reliquary procession from the festival procession of obelisks, including changes of date/sequence through time. The **2026 programme** demonstrates what was scheduled that year; it is not a guarantee of fixed annual observance.
- **Sassari (41 detail observations)** — [municipal tourism's Candelieri explanation](https://turismosassari.it/component/content/article/discesa-candelieri-sassari?catid=22). Covers thirteen gremi, the Vestizione, bells/banners/costume, Candeliere dance, municipal Intregu, final church blessing, octave, and children's derivative event. Some older festival material describes **eleven** or **thirteen** candelieri; the currently detailed tourism witness and another page's conflicting duplicate paragraph should not be combined into a timeless exact number. The source cited is the thirteen-Gremi description.
- **Palmi (18 detail observations)** — [Reggio Calabria regional tourism](https://turismo.reggiocal.it/lo-spirito-religioso/la-spiritualita-nel-territorio-reggino/la-varia-di-palmi), plus the separately dated [2023 Palmi municipal-tourism festival page](https://www.palmiviva.it/la-varia/). The festival is **not annual every year**: the source describes a multi-year cadence. Costume, selected children's and adult roles, claimed Marian hair relic, rope teams, and August processional preparation remain components or history claims, not universal devotional instructions. The authenticity of the claimed relic has **not** been verified.
- **Viterbo (21 detail observations)** — direct practitioner's organisation [Sodalizio Facchini di Santa Rosa: 3 September programme](https://facchinidisantarosa.it/la-giornata-del-3-settembre/). The pre-carrying seven-church visiting circuit, prayers, Marian hymn, saints' honors, bishop's reported **'in articulo mortis'** blessing, and ceremonial civic handover are kept distinct from the main tower transport. The reported blessing nomenclature must not be represented as verified Roman Ritual textual authority without ritual review.

### Count and identity model

`data/customs/master/italy-four-unesco-processional-complexes-local-detail-pass.v1.json` contains **110 short, independently phrased, URL-and-line-anchored documentary details**, classified as follows:

| Local complex | Source detail rows | Identity unit |
|---|---:|---|
| Nola / St Paulinus Gigli | 30 | One regional festival complex with multiple events |
| Sassari / Assumption Candelieri | 41 | One votive festival complex with multiple gremi and rites |
| Palmi / Varia | 18 | One regional processional festival complex |
| Viterbo / Santa Rosa Macchina | 21 | One local patronal complex including preliminary visitation |
| **Total** | **110** | **Four local complexes, not 110 customs** |

Some details are transport apparatus, guild structure, civic succession, historical assertions, a **dated 2026/2023 programme** or ecclesiastical ceremonies rather than standalone pious practices. Sources are multiple online textual witnesses, but repetitions of the same general UNESCO festival summary or the same local ceremony do not increase the count of independent eyewitnesses.

### Catalogue state and checks

- Prior concurrent workbench head: **2,137** source/detail research rows, already including **86** La Sanch French PCI inventory components from another research pipeline.
- Italian detail intake: **+110**, yielding **2,247 research/source-detail rows**, **not 2,247 distinct or independently verified Catholic customs**.
- Existing **408 provisional action labels** and **56 overlapping older research master identities** remain unaltered.
- **0** newly certified global distinct customs, **0** new canonical or provisional master IDs, **0** app publications, **0** ritual formulas adopted.
- `tests/customs-full-registry-census.mjs` asserts 110 unique detail IDs, each relevant four-festival parent, source URLs/line numbers, date-variant containment, 2,247 source-row total and 408 unchanged provisional groups. A passing GitHub workflow on the **latest commit** is required before claiming verified repository validation.

### Work remaining

Do not manufacture festival customs out of subcomponents. Next suitable high-volume research work is to acquire **separately held original historical church records and local archival narratives** for these same four complexes and determine whether their specific actions appear in those originals, while researching **other regional Catholic calendar feasts** instead of adding ever more paragraphs for the same four processions. Irish Dúchas school folklore search results remain discovery leads until full folio and locality verification.

The later Ad Orientem integration should surface source-qualified relevant customs only through the **existing Calendar**, with each documented date, region, nature of participation, source edition, and ministerial authority represented accurately. This PR does not alter that Calendar.
