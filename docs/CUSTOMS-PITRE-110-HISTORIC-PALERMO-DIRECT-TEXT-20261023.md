# Catholic Customs — Direct-text Giuseppe Pitrè Palermo historic practice evidence (23 October 2026)

## Research lane and outcome

This is the **Italian historic documentary stream**, separate from the other parallel chat's English-language historical household books, Portuguese/Spanish regional source intake and Irish Dúchas folklore queue. It does not duplicate our previously extracted modern Italian festival source webpages.

**110 source-located historical action/detail records** were extracted from **two full, readable historical Pitrè texts**, with **110 stable IDs and HTML lines**. The unified workbench grew from **2,875** source/detail research rows on the shared branch at integration to **2,985**, counting the parallel pipeline's current Portuguese and family-book work. As always, these rows include ceremony components, objects, civic activities, former/abolished traditions and archival claims, **not 110 new distinct Catholic customs**. The research master still has 408 provisional action groups and 56 older potentially overlapping working identities.

| Directly read textual witness | New details |
| --- | ---: |
| Pitrè, *La vita in Palermo cento e più anni fa*, volume II, 1950 posthumous national edition, chapters I and VII | 92 |
| Same title, volume I, later national edition, section on guilds and burial customs | 18 |
| **Total** | **110** |

Direct online texts:
- [Project Gutenberg #37720, volume II](https://dev.gutenberg.org/cache/epub/37720/pg37720-images.html), publication statement visibly giving **1950**.
- [Project Gutenberg #37719, volume I](https://www.gutenberg.org/cache/epub/37719/pg37719-images.html), the edition year not independently checked.
  
These are **not** Pitrè's separate ***Spettacoli e feste popolari siciliane* (1881)** or ***Feste patronali in Sicilia* (1900)**, despite those editions also having been bibliographically located. The latter scans were identified at Wikimedia Commons/Google Books but their full original printed pages could not be accessed through the available source reader, and **no claim of extracting from their page text is made**. Likewise, although Pitrè quotes named travellers and chronicles such as Houël and Villabianca, their original underlying diaries and manuscripts were **not independently read**, and citation reuse is not independent corroboration.

## Substantial historical findings (each with an exact record anchor)

**Holy Week and related penances** — volume II, Gutenberg HTML lines 154–157. Pitrè describes historical confraternity self-discipline, an especially severe bread-and-water fast, three differently constituted Marian/Passion processions, black-mantled visits to Sepolcri, and a local Good Friday avoidance of carriage travel. These are historical accounts, not normative practices for Catholics today.

**Corpus Christi** — volume II, lines 186–190. A 1782 governmental shift from morning to afternoon; route from Magione towards the Cathedral; household tapestry displays, kneeling as the Blessed Sacrament passes, city officers and military escort, and a concluding blessing. The date applies to the specific eighteenth-century change, **not a fixed 1962 festival schedule**.

**Palermo's Immaculate Conception civic vow** — volume II, lines 201–216. An earlier 1624 plague-period origin narrative, historic senate and clergy oath, candle/torch and giant reed-bundle vigils, procession of an ornate silver statue, municipal Vespers offering, and an **eight-evening** prayer journey `viaggio` between church and Cathedral, at times barefoot, with the Rosary. These acts have distinct person/setting/date fields; the old civic blood vow is not recommended as a contemporary household prayer.

**St Bartholomew's confraternity charity** — volume II, lines 183–184. The Carità confraternity made a feast-day visit to the hospital, bringing and changing poor patients' shirts and providing bandage lint. A related engagement custom of gifting a miniature shirt and lint illustrates overlap between confraternal charity and vernacular household custom, not an automatic identity match.

**Assumption and craft guilds** — volume II, lines 193–196, volume I, lines 866–870. Guilds carried decorated `cilii` with saint-life scenes and offered large candles; changes after 1783 affected guild prominence. Guilds separately honoured occupational patrons on their own feast days with cessation from work, Mass and patron image carrying. Historical organization and religious confraternities must be distinguished.

**St Rosalia's Festino** — volume II, lines 223–251. The city's five-day festival and attempted abbreviation, triumphal cart and relic urn, route alternation, craftspeople and decoration, fishermen's procession, and a traveller's account of a rapid Saints Cosmas and Damian litter race. **Cart engineering, secular racing, relic veneration and civic acts are recorded as separate classes**, not artificially distinct devotions. The historical Houël report as quoted by Pitrè cannot count as a second directly consulted witness.

**Monreale's Exaltation of the Cross `Dimostranza`** — volume II, lines 255–272. A silent staged sacred procession with Biblical history and the Passion in public stations, trained lay actors and symbolic tableaux. The 1783 and 1801 instances are cited as historic events, not proof of a continuous yearly fixed programme. This is not a liturgical ceremony specified by the Roman Missal.

**Rogations and Lent** — volume II, lines 842–884. Three historic Rogation processions involving religious communities and city-appointed preachers; competitive cathedral/Dominican/Oratorian Lenten preaching. Historical `Bolla della Crociata` purchases and a 1799 hospital-worker meat dispensation petition are **outdated disciplinary context**, not evidence of a currently valid fasting exception.

**Funerals and poor burial** — volume I, lines 2949–2961. Confraternity burial alms, the locally recorded 1775 cessation of placing pauper bodies on public display for collections, funeral Masses, professional lamenting women and `Memento mori` funeral biers. Some funeral folklore is civic/secular rather than an approved devotional custom.

## Classification and nonpromotion

| Research classification | Source-detail records |
|---|---:|
| Historical devotion | 30 |
| Processional segment | 16 |
| Material object or setting | 18 |
| Historical change | 9 |
| Folk belief not endorsed | 2 |
| Ritual authority not verified | 3 |
| Civic / confraternity context | 15 |
| Religious dramatization | 7 |
| Secular festival component | 10 |
| **Total** | **110** |

Every record stores `observation_id`, `volume`, `source_html_line`, `source_url`, `feast_or_context`, `claim_class`, and brief independent paraphrase, plus **false** for prior-era archival verification, source independence and certified distinctness. All records remain research-only with no app/Calendar publication or 1962 Roman Ritual authority claim.

The 110-row dataset is `data/customs/master/pitre-palermo-retrospective-vol1-vol2-source-details-wave01.v1.json`; the unified reference path is `source_dataset_paths.pitre_palermo_retrospective_vol1_vol2` in `data/customs/master/comprehensive-customs-working-catalogue.v1.json`; integrity checks are in `tests/customs-full-registry-census.mjs`.

## Next precise evidence gates

1. Compare only the high-value geographic/custom candidates to the old 408-group workbench at the **action level**, including feast, exact locale and era. Do not merge historic Corpus Christi or Marian candle practices merely because they share a material object.
2. For dated claims **1624, 1775, 1782, 1783, 1799 and 1801**, trace Pitrè's original footnotes to Villabianca, Houël and municipal archival books. Reading the original underlying document is required before upgrading its evidence independence.
3. Obtain readable actual folios/pages of Pitrè **1881** `Spettacoli` and **1900** `Feste patronali`, or use a valid digitized text/facsimile reader. No page-read certification until achieved.
4. Proceed with the existing Gubbio 1851 guild-statute and Trapani/Salemi 1779 account archival accession tasks, but count neither as inspected original manuscripts yet.
5. Preserve all parallel changes and exact source identity; verify current branch HEAD before writes. No changes to the **existing Ad Orientem Calendar**, LIVE reader, prayers, liturgical rites or public customs.

This source pass advances **historical documentary evidence**, not release-readiness or a final distinct-custom census.
