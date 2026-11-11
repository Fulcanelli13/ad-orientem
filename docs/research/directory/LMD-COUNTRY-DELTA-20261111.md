# Latin Mass Directory vs Ad Orientem — finite reconciliation (11 November 2026)

**Status:** one worldwide **country-level** census completed; Mauritius and Ireland venue-level identity check completed. **Not** a claim of worldwide venue-level match completion, verified current Mass schedules, or new site approvals.

## Binding baselines
- Current CL2 physical index: **2,580** canonical physical sites in **76** countries/territories. Three separately published sites make **2,583** public cards. Preserve all identifiers and the 14 list-only location safeguards.
- Latin Mass Directory country index: **65** countries/territories, **1,570** reported venue positions at this observation. These figures are mutable and from a directory with **different admission criteria**.
- CL2 already has **212** physical sites whose retained source IDs or URLs refer to Latin Mass Directory. This is historical provenance, **not 212 reverified 2026 matches**.

## Results already resolved — no new research batch
- **Mauritius:** LMD 5 / CL2 5. All five listed venue names and localities correspond to existing canonical sites. No new Mauritius venue proposed.
- **Ireland:** LMD 16 / CL2 22. All 16 listed venue identities have an existing CL2 physical-site ID. The other six CL2 identities consist of five SSPX-labelled sites and a separately sourced Carmelite hermitage; **none is incorrect merely because LMD omits it**.
- Current source-linked name/locality crosswalk for these **21** identities is in `matched_existing_site_ids` in the adjacent JSON manifest. This does **not** certify schedules or visitor entrances.
- Historical independent-directory research already exists: [Brazil draft #1694](https://github.com/Fulcanelli13/ad-orientem/pull/1694) screened 91 positions (89 unique names/localities after pagination duplicates) and [Italy draft #1716](https://github.com/Fulcanelli13/ad-orientem/pull/1716) screened 117 venue listings. Their findings require reconciliation to **current CL2 IDs** before any reuse; do not repeat their scraping or count them as admitted new sites.

## Complete archived 1,531-row ID reconciliation — no new scrape
The repository already contained a [9 October LMD research archive](../../../data/directory/research/approved-mass-worldwide-crosswalk-20261009.v1.json) with **1,531** source records across **56** countries. I processed **all 1,531 IDs** against the **current** CL2 physical-site index without fetching or republishing any new external venue records. The row-by-row status ledger is [here](../../../data/directory/research/lmd-archived-1531-to-cl2-crosswalk-20261111.v1.json).

| Current CL2 ID reconciliation of archived rows | Rows |
|---|---:|
| Exact historical LMD source ID or URL already in CL2 | **118** |
| Only an old name-based suggestion to a present CL2 source ID — **unverified** | **128** |
| No direct CL2 provenance link and no surviving old name suggestion — **not automatically missing** | **1,285** |
| **All archived rows accounted for** | **1,531** |

The 118 direct matches comprise **87** source-ID matches and **31** URL-only matches (of the 87 source-ID matches, three also have the matching URL). These are source-provenance matches only, **not** active-Mass or exact-building approvals.

The 128 old name-only suggestions require identity checks; historical suggestions frequently matched different towns sharing common church names, so they must **not** be silently promoted. The 1,285 other rows may already have a CL2 identity sourced from a different directory, and their lack of an LMD provenance link is **not** proof of absence.

The **1,531 archived positions** and **1,570 current LMD country-reported positions** come from different dates and selection processes. Their raw numerical difference of 39 is **not** a verified list of 39 new venues. These source-ID counts also **must not be added** to the separately validated Mauritius/Ireland 21 current identity matches without de-duplication.

## Archived directory locality reconciliation — 282 additional potential matches

A second deterministic comparison now covers **every one of the 1,413 archived LMD records not already linked by an exact source ID or URL**. It uses the archive's existing LMD source slug, the current CL2 country, normalised church dedication and at least one distinctive locality token in the CL2 physical description. This is **not a new crawl of the LMD website**.

| Archived listing classification | Rows |
|---|---:|
| Existing CL2 ID/URL provenance, preserved unchanged | **118** |
| Previously unlinked, one plausible current CL2 site from both name and locality | **280** |
| Previously unlinked, two competing current CL2 sites at the same textual score | **2** |
| No sufficiently specific dedications-plus-locality match | **1,131** |
| **All archived positions** | **1,531** |

All **282** locality-matched rows remain **research-only candidate relationships**, not independently verified physical-building identity, currently celebrated Masses or authorised canonical link merges. Neither the remaining 1,131 nor Ad Orientem-only sites are presumed incorrect. The row-level proposed IDs and **56-country** status summary are in the existing [archive crosswalk JSON](../../../data/directory/research/lmd-archived-1531-to-cl2-crosswalk-20261111.v1.json), not a duplicate register.

**Historical matching error screen (subsequently reviewed against first-party evidence):** eight old name-only suggestions were inconsistent with the initial locality-specific screen. Their final dispositions are recorded in the ten-case review below; not every disagreement means the historical suggestion was entirely wrong.

- Colorado Springs, Omaha and Rapid City “Immaculate Conception” were historically linked to multiple same-dedication FSSP church names, including **El Paso**. The owners identify three distinct existing localities. **Colorado Springs additionally announced a new worship building effective 8 November 2026**; the current CL2 location needs Excel review.
- La Roche-sur-Yon and Angers “Notre-Dame” listings had older suggestions for other French towns with the same dedication. City-specific CL2 candidate sites now replace these as research leads.
- Freiburg im Breisgau's Adelhauser Kirche is actually represented **twice in current CL2** at the same building with different diocesan/FSSP labels; a historical FSSP match was pointing to one of those two correctly. Le Havre's Saint Michael of Ingouville matches its existing local FSSP chapel, not a same-dedication church in Dijon.

**The two ambiguous same-city screens have been resolved at the physical-building level:** the two Sanford All Souls locations are **different buildings** (the historic chapel at 800 S Oak Avenue and main parish church at 3280 W 1st Street), so neither CL2 ID may be deleted based merely on the parish name; the generic locality-only CL2 site's exact building remains a further Excel identity hold. Brasília's two Nossa Senhora das Dores CL2 entries refer to **the same IBP chapel and address** and constitute a strong potential double canonical identity for supervised Excel alias review. Freiburg is a second independently evidenced same-building duplicate pair. No merge has been made.

**Largest remaining no-direct-or-textual-match archive queues** (not proven missing sites): US **338**, France **198**, Poland **112**, Italy **96**, GB **81**, Brazil **74**, Germany **61**. Italy and Brazil have older dedicated source research already preserved in PRs #1716 and #1694; do not repeat those screens.

The matcher intentionally fails closed on dedication-only matching; its threshold requires country equality, at least two significant title words, strong rarity-adjusted title coverage, and a distinctive word shared with the CL2 address/locality. A street address marked “locality only” remains unverified even if its city word matches. None of these 282 claims is automatically promoted into production or the Excel approval master.

## Ten high-ambiguity archive matches — first-party identity resolution (11 Nov 2026)

The [ten-case identity ledger](../../../data/directory/research/lmd-ten-ambiguous-conflict-identity-resolutions-20261111.v1.json) resolves **both** multiple-CL2 locality cases and checks **all eight** pre-existing historical name-only suggestion conflicts against owner, diocesan or institute evidence. Each archive row preserves its original suggestion and classification and carries a **separate evidence overlay**; this is not a silent replacement of provenance.

| Evidence disposition | Cases | Result |
|---|---:|---|
| Locality-specific existing physical CL2 identity verified | **6** | Omaha, Rapid City, La Roche-sur-Yon, Angers, Saint-Maur-des-Fossés and Le Havre |
| Same building represented by two CL2 records | **2** | Brasília `RG-3C3AAA8BD104` + `RG-FECDA1DB9A9E`; Freiburg `RG-0A6B76396C09` + `RG-CC7E25BA567F` — **strong duplicate candidates, not authorised merges** |
| Two distinct physical buildings of the same parish | **1** | Sanford, Florida: separate main church and historic chapel — **do not merge** |
| Same parish identity but announced change of physical Mass venue | **1** | Colorado Springs: **current address and geometry review required** |
| **Total** | **10** | **0 auto-merged IDs, 0 new sites, 0 production changes** |

**Sanford — physical separation, not automatic deduplication.** [The parish's own page](https://www.asccsanford.org/mass-times) names the **main All Souls Catholic Church at 3280 W 1st Street**, and the **All Souls Historic Chapel at 800 S Oak Avenue**. The historic-chapel archive reference corresponds to existing CL2 `RG-A5A7B8559AF2`. Another CL2 `RG-84277A3C62ED` is named only “All Souls” with a locality-only address and **must not be assumed to be the same chapel**. Its correct main-church attribution requires Excel review; do not merge the two physically separate buildings.

**Brasília — one building despite two CL2 records.** [The Instituto Bom Pastor's own Brasília page](https://ibpamericalatina.org/casa/brasilia/) names **Capela Nossa Senhora das Dores, Av. das Paineiras, Entrequadra 9/10, Jardim Botânico III**, exactly as both CL2 records do. Their **Diocesan** versus **IBP** labels reflect site-operator/minister classification to reconcile, not two physical chapels. Alias/role reconciliation belongs in the Excel canonical master.

**Freiburg — one building despite two CL2 records.** [The FSSP](https://petrusbruderschaft.de/pages/wo-wir-sind/schweiz/niederlassungen/thalwil/freiburg.php) states that the archdiocese made the Adelhauser Kirche at **Adelhauserstraße 31A** available for older-rite Mass from March 2025, with FSSP ministry. Current CL2 contains both `RG-0A6B76396C09` (diocesan-labelled) and `RG-CC7E25BA567F` (FSSP-labelled) for that same church. Historical name suggestion `RG-CC7E25BA567F` was not an unrelated-city error; treat both as one **physical-building duplicate candidate** awaiting approved canonical merge.

**Colorado Springs — important 8 November 2026 location change.** [Immaculate Conception Parish's current FSSP site](https://www.cosfssp.org/) explicitly says that **from Sunday 8 November 2026**, Sunday Masses move into a *new church building* at **2715 E Pikes Peak Avenue**. Existing CL2 `RG-E6BFCFC669A3` contains an unverified **2745 E Pikes Peak Avenue** address. This is a **potential physical-site relocation / provenance problem**; do not create a second “Immaculate Conception” card or silently overwrite the old address, coordinate or historical source. Verify the replacement building, operator and geometry in the original Excel master before deployment.

**Other old name-match errors now grounded in the proper locality:**
- [Omaha Immaculate Conception](https://latinmassomaha.org/about/) is `RG-F1132C8E46E5`, 2708 S 24th St; [Rapid City's](https://fssp-rapidcity.org/contact) distinct church is `RG-4943D1C3E848`, 922 5th St. They must not be equated with El Paso's unrelated Immaculate Conception.
- [La Roche-sur-Yon's parish](https://stlouisdelaroche.fr/la-paroisse-et-ses-eglises/) identifies Notre-Dame at **14 rue Lazare Carnot**, with the [2025–26 parish schedule](https://stlouisdelaroche.fr/wp-content/uploads/2025/09/Horaires-messes-2025-2026_pour-imprim-A5.pdf) explicitly defining the Sunday Tridentine rite as the **1962 Missal**. Match existing `RG-F1ED8101F0B9`, not Bourges or Chambéry.
- [Angers Notre-Dame-des-Victoires parish](https://cathedralestmauricenotredame.diocese49.org/rite-st-jean-xxiii-2/) teaches and [schedules](https://cathedralestmauricenotredame.diocese49.org/la-paroisse/horaires-2/) its Saint John XXIII Missal worship; match `RG-6CC764E4B257`, not other Notre-Dame dedications.
- [FSSP Saint-Maur-des-Fossés](https://www.fssp.org/en/find-us/where-are-we/) identifies Notre-Dame du Rosaire at Place des Marronniers: current `RG-1FB1C4BCCBF2`; the [diocese](https://catholiques-val-de-marne.cef.fr/diocese/communes/saint-maur-des-fosses/notre-dame-rosaire/) gives a parish/contact address (11 avenue Joffre), which must not be silently equated to the building entrance.
- [FSSP Le Havre](https://www.fssp.org/en/find-us/where-are-we/) identifies the chapel of Saint-Michel d'Ingouville on rue Saint-Michel: current `RG-2EA3A303947B`, not an Église Saint-Michel in Dijon.

The old **118 direct provenance / 280 single textual / 2 multiple textual / 1,131 no-strong-textual** baseline remains preserved for reproducibility. The new ten-case findings are **identity evidence overlays**, not a recalculated census or authorisation to replace the original **2,580 canonical site** dataset.

## Remaining 1,118 no-original-URL archive rows — complete second locality classification (11 Nov 2026)

A second, intentionally **non-authoritative** title-and-locality comparison has now dispositioned **every one of the 1,118** archived records with no retained original first-party URL and no prior strong same-country match. It reuses only the October source IDs and the current CL2 physical index; there was **no further worldwide LMD website scrape**. Individual results are held on their original rows in [the existing 1,531-row archive crosswalk](../../../data/directory/research/lmd-archived-1531-to-cl2-crosswalk-20261111.v1.json), under `secondary_archive_locality_screen_20261111`. Original row `status` and provenance are unchanged.

| Follow-on textual outcome | Archive records | Meaning |
|---|---:|---|
| **One** plausible existing CL2 site with same country, name fragment and address locality | **281** | Review identity against the actual church/owner. **Not independently verified** by this automated screen |
| **Multiple** plausible CL2 sites | **16** | Requires exact building, municipality/state, and ministry-role disambiguation |
| **No** sufficiently aligned CL2 name **and** locality | **821** | **Not** 821 proven missing venues; includes name variants, ambiguous geography, absent original sources and genuinely new-site possibilities |
| **Total classified** | **1,118** | **0 new CL2 sites, 0 auto-linked old archive IDs** |

Among these 1,118, **513** contain a locality fragment shared with at least one current CL2 geographic description; **605** did not match any geographic-description locality fragment by this strict parser. Of the 513, **216** yielded locality-only overlap without a satisfactory church-name overlap: **same town alone is not the same building**. All figures are scoped to the *archived* records, **not** the live LMD site's current count.

The second matcher suppresses postal numbers, street words, country names and obvious church-name headers before extracting probable location segments from CL2 descriptions. It requires at least one significant shared dedication/title token *as well as* the locality fragment. However, abbreviated church names, homonymous towns, old chapel names, differing scripts and partially verified CL2 street fields still create both false matches and missed matches. For that reason **all 281 + 16 remain candidate links only**, with `proof_of_same_physical_site=false` and `cl2_import_or_alias_approved=false`.

### Five of the 281 single candidates independently confirmed

[The separate first-party evidence ledger](../../../data/directory/research/lmd-1118-v2-firstparty-confirmations-20261111.v1.json) corroborates five proposed **existing CL2 physical identities** against current official institutional sources:

| Existing CL2 identity | Evidence | Important caveat |
|---|---|---|
| **Minneapolis All Saints** `RG-C7B3D8B5A0B3` | [FSSP parish](https://www.fsspminneapolis.org/) confirms church at **434 5th Avenue NE** and traditional Roman Rite | **435 4th Street NE** is a parish-registration / mailing address found on the same owner site; not a replacement church entrance |
| **Saint Paul St Agnes** `RG-368B7B3B5FA3` | [Parish](https://churchofsaintagnes.org/home) confirms **535 Thomas Avenue** and explicitly identifies its Sunday 8 AM EF Low Mass | Do not assume every service labelled only “Latin” uses the same liturgical books |
| **Indianapolis Holy Rosary** `RG-CF187910B7D3` | [Parish 15 Nov 2026 event](https://www.holyrosaryindy.org/events/low-mass-extraordinary-form/20261115) explicitly specifies **1962 Missal Low Mass** at **520 Stevens Street** | Event is still scheduled as of 11 Nov; no claim it has already occurred, or that future times are guaranteed |
| **Kansas City Old St Patrick** `RG-AA3084B4438A` | [Diocese](https://kcsjcatholic.org/locator/) explicitly identifies **1962 Missale Romanum** at **806 Cherry Street**; [ICKSP owner](https://www.institute-christ-king.org/kansascity-home/) confirms address | North Kansas City office/mail address is not the church |
| **Sarasota Christ the King** `RG-7120BD16562F` | [FSSP parish](https://christthekingsarasota.org/about/) and [Venice diocese](https://dioceseofvenice.org/find-a-parish/) confirm the Latin Mass apostolate at **1900 Meadowood Street** | Do not auto-import current timetable |

These **five confirmed matches are a subset of the 281 candidates**, not five additional LMD positions. Independent identity evidence can now be reviewed by the CL2 master owner, but **no production source-ID rewrites, Mass times, coordinates or cards** are approved or changed. The other **276** single candidates remain unverified by owner-source evidence in this pass.

**Finite audit direction:** screen the **16 competing-ID cases** for false same-town collisions and existing CL2 duplicates; prioritize independent identity checks of the other **276** high-specificity singles; then triage the **821** with the same caution (especially France, Poland and Italy). A complete disposition is not the same as full current world-directory verification.

## All 16 competing V2 candidate rows reviewed against full CL2 and institutions (11 Nov 2026)

The [16-case first-party identity register](../../../data/directory/research/lmd-v2-16-multiple-identity-dispositions-20261111.v1.json) now classifies **every one of the 16** competing-candidate rows from the 1,118-record fallback screen. Crucially, the review searched **the whole CL2 index** rather than assuming the algorithm's suggested candidate IDs were exhaustive; four true venue identities in **Rome, Mexico City and Colombia** had been omitted from its short candidate lists.

| Review outcome | Archived rows | Action |
|---|---:|---|
| Existing named CL2 physical site found (without multiple-CL2 identity dispute in this screen) | **10** | Retain current sites; historic usage, ritual basis or venue-specific caveats where applicable |
| Strongly suspected *same-building* pair of CL2 IDs | **4** | Brick St Dominic, Neptune Holy Innocents, Providence Holy Name, South St Paul St Augustine Oratory: **Excel duplicate/alias review, no automatic merge** |
| Same parish, different worship buildings | **1** | Fredericksburg St Patrick historic chapel vs newer parish church: confirm precise site/room attribution; **do not auto-merge** |
| Independent existing TLM venue, no corresponding physical CL2 site in inspected index | **1** | Christ the King, Kansas City MO, **8510 Wornall Rd**: propose a new physical-site review in the original Excel master, **not a published card** |
| **Total classified** | **16** | **0 new production sites, 0 merges, 0 pins or schedules changed** |

**Main new-site candidate — Kansas City.** [Christ the King Catholic Church's official site](https://www.ctkkcmo.org/) identifies its building at **8510 Wornall Road, Kansas City MO** and [advertises Traditional Latin Mass](https://ctkkcmo.org/events/traditional-latin-mass). The first matcher incorrectly offered two unrelated CL2 sites: Christ the King Convent at **1409 E Meyer Blvd, Kansas City MO** and a generic Christ the King entry in **Kansas City KS**. The full 2,580-record CL2 index has no church at 8510 Wornall. **This is one owner-supported Excel candidate** subject to exact physical identity/duplicate checking and explicit approval. Neither a new ID nor a coordinate has been created.

**Four strong duplicate-identity candidates (unmerged).** [Brick St Dominic](https://stdominicsparish.com/) is at **250 Old Squan Rd** (CL2 `RG-4EBF82DFE117` and `RG-86A7C04C87B8`); [Neptune Holy Innocents](https://holyinnocentschurch.net/venue/holy-innocents-church/) is at **3455 W Bangs Ave** (`RG-476BA44067AE` and `RG-B119D4B2F3CE`); [Providence Holy Name of Jesus](https://holynameprovidence.org/contact-us) is at **99 Camp St** (`RG-C9E134BD039D` and `RG-FF973A70A17F`); and [South St Paul St Augustine Oratory](https://www.holytrinitysspmn.org/join) is at **408 3rd St N** (`RG-19FC3C61905B` and `RG-90591ACAA073`). Each pair has matching church name/locality and common institutional source. Record as **potential duplicate physical site** subject to original Excel CL2 master lineage, ministry/owner-role and alias review—not an auto-merge. South St Paul also has a **separate Holy Trinity Church at 749 6th Ave S**, which must never be collapsed into St Augustine Oratory.

**Fredericksburg venue scope.** [St Patrick's TLM organiser](https://stpatrick.latinmassarlington.org/) identifies the **historic parish chapel** as the present worship space; the [parish's own site](https://www.saintpatrickparish.org/) describes the newer St Patrick Church on the same parish property. Current CL2 historic chapel `RG-1F4B6AFB7CE1` and generic parish `RG-27DBA41B403D` are not sufficient evidence of two identical physical buildings. Distinguish historic chapel from newer church before any alias or coordinate action.

**Other cases already in CL2, including false multi-candidates:**
- [FSSP Our Lady of Mount Carmel](https://www.olmcfssp.org/welcome/about/), Littleton CO `RG-619323A26D92` (5612 S Hickory) is distinct from the Carmelite monastery at 6138 S Gallup; [St Mary Parish Akron](https://latinmasscleveland.weebly.com/) `RG-FA7101FE83D3` is distinct from the area's SSPX-linked Immaculate Heart of Mary chapel.
- [Basilica San Giovanni dei Fiorentini](https://www.diocesidiroma.it/phpenti/ente/?ID=43) **already exists** as `RG-C11191C53318`. The ICRSS [January 2026 bulletin](https://www.icrss.it/roma/wp-content/uploads/sites/3/2026/01/Settimana-dal-11-al-18-gennaio-2026.pdf) documents its *earlier temporary Mass venue*; the [current ICRSS page](https://www.icrss.it/roma/) places the apostolate at **Immacolata dei Miracoli** `RG-C14F352FA2E8`. These are two buildings, not one alias. The ICRSS page says **Via Sebastiano Veniero 1**, while CL2's existing entry says **number 3**; check precise building entrance before any pin change.
- [Rome Santi Domenico e Sisto](https://www.diocesidiroma.it/phpenti/ente/?ID=932) is already `RG-2323CFCF49FD`, **not a new church**. [The Angelicum's own schedule](https://angelicum.it/it/ateneo/uffici/cappellania/) explicitly references a **Latin Dominican Rite** Mass; do **not** automatically label it a 1962 *Roman* Missal venue. [Santissima Trinità dei Pellegrini](https://roma.fssp.it/parrocchia/) is a separate FSSP church `RG-A10546242DF4`, not Immacolata dei Miracoli. Generic Rome CL2 `RG-5DB8924C5BEB` may be a secondary same-church alias but is not approved for merge.
- El Puerto de Santa María has **two distinct ICKSP worship sites**: Convento de la Concepción `RG-9569B5F07DB8` at **Pedro Muñoz Seca 45**, and Oratorio de la Inmaculada Concepción `RG-71DC122F0292` at **San Bartolomé**. [Independent venue record](https://misas.org/p/concepcionistas-franciscanas-el-puerto-de-santa-maria) supports the convent identity. Do not copy Sunday convent times to the weekday chapel.
- [Vyšší Brod Cistercian abbey](https://www.klastervyssibrod.cz/prohlidky) already has `RG-761A34E746A6`: its Assumption abbey church is **not** the SSPX cemetery chapel at **Uherský Brod**. Owner says summer traditional Roman Rite Mass is in the abbey church and winter in the convent chapel; keep the seasonal physical-room distinction.
- [Mexico City's diocesan San Pedrito parish record](https://dondehaymisa.com/parroquia/4118) at **Francisco de Garay 6** corresponds to existing `RG-2351B92BD2C6`, entirely missed by the initial machine shortlist; retain owner-source rite/schedule verification holds. [The FSSP's Colombia listing](https://www.fssp.org/en/find-us/where-are-we/) locates **Capilla Nuestra Señora de Fátima** at **Casa San Martín de Porres, Vereda La María, Anolaima**; this already exists as `RG-1A1E54C59588` and is unrelated to the three SSPX chapels incorrectly proposed by the matcher.

**Accounting:** the 16 rows retain their original `MULTIPLE_NAME_AND_LOCALITY_CANDIDATES` screen classification but now also carry a non-destructive `v2_competing_identity_resolution_20261111` evidence overlay. This resolves **all 16 competing candidates for follow-on triage**, not the **276** other single-candidate leads still awaiting owner-source corroboration or the **821** no-strong-match archive leads. **No existing site was downgraded merely because LMD omits it.**

## Twenty more single-site first-party checks and source readiness for remaining 256 (11 Nov 2026)

The [twenty-case evidence register](../../../data/directory/research/lmd-v2-single-20-owner-verifications-20261111.v1.json) now independently corroborates **20 additional existing CL2 church identities** from the **281** single title-and-locality candidates in the second 1,118-record archive screen. Together with the **five** previously owner-confirmed singles, that means **25/281** have current institutional confirmation of physical site identity, while **256** remain only textual candidates. They are not new LMD positions or production edits.

| 20 first-party-reviewed site identities | Records | Meaning |
|---|---:|---|
| Older-form Roman Rite independently supported (explicit 1962, Traditional Roman, or institute-reported Extraordinary Form) | **17** | Same existing CL2 physical church; distinct confirmation level retained per case |
| Historic **Dominican** Rite independently identified | **1** | Holy Rosary, Portland: not the 1962 **Roman** Missal |
| Physical church identified, but 1962 rite still unconfirmed | **2** | Holy Comforter, Charlottesville (parish says Latin Mass); Holy Rosary, Cedar MI (parish identifies church but not old rite) |
| **Total** | **20** | **0 new IDs, 0 Mass times or coordinates imported** |

Confirmed existing sites include St Anne (San Diego), St Benedict (Fort Worth), St Damien (Edmond), Holy Family (Dayton), Sacred Heart (Fort Wayne), North American Martyrs (Edmonds), Our Lady of Sorrows (Springdale), Holy Ghost (Bethlehem), St Cecilia (Clarkdale), St Leo Oratory (Columbus), St Gianna Oratory (Tucson), Holy Family (Latrobe), Our Lady of the Valley (Easthampton), Sacred Heart of Mary (Boulder), Holy Rosary (Portland), Church of the Nativity (Menlo Park), Holy Trinity (Poughkeepsie), St Adelaide (Peabody), Holy Comforter (Charlottesville) and Holy Rosary (Cedar). Each row in the JSON contains its authoritative owner/institute/diocese links, CL2 ID, scoped rite claim and hold.

**Important geometry and rubrical distinctions:**
- [FSSP Holy Family Dayton](https://fssp.com/apostolate/fssp-dayton/) identifies the **church at Fifth and Findlay Streets**, while [its parish staff page](https://www.daytonlatinmass.org/about/chaplain/) says **140 South Findlay Street is the office/residence mailing address**, presently used in CL2. Do not mark that correspondence address as the visitor entrance without Excel approval.
- [ICKSP St Gianna Tucson](https://institute-christ-king.org/tucson-about) celebrates 1962 Roman liturgy **inside Holy Family Church** at 338 W University Boulevard. ICKSP notes that **Holy Family Parish and St Gianna Oratory are two ministries sharing the same church**, not two independent physical buildings.
- [Dominican Holy Rosary Portland](https://holyrosarypdx.org/dominicanrite) explicitly says its Latin Mass is the **traditional Dominican Rite**. It would be a classification error to label this as a Roman 1962 Missal celebration.
- [Sacred Heart of Mary Boulder](https://sacredheartofmary.org/) explicitly distinguishes its **1962 Roman** Traditional Latin Mass from another **Latin Novus Ordo** Mass. Latin language alone does not determine rite.
- [Holy Family Latrobe](https://www.holyfamilylatrobe.org/mass-times) and its [resident traditional-Mass group](https://www.latinmasslatrobe.com/) corroborate the same building and older-form use; keep current schedule separate from the identity check.
- [St Adelaide Peabody](https://www.saintadelaide.com/) lists the parish office/contact address at 712 Lowell St, but precise church entrance and separate associated St Ann parish should not be inferred from a shared collaborative office.
- [Holy Comforter Charlottesville](https://holycomforterparish.org/events-archive/latin-mass-2026-10-25/) documents a dated Latin Mass in the named church, but it does **not** explicitly call it a 1962-Missal celebration. [Holy Rosary Cedar](https://www.holyrosarycedar.org/) confirms the church at 6982 S Schomberg Rd but does not independently establish an older-form liturgical event in the inspected owner page. Both remain rite holds.

### Source readiness of the other 256 (not new matches)

To avoid redoing directory/source discovery, the original crosswalk now also classifies **all 256** as to availability of already-retained CL2 URLs:

| Existing CL2 source situation | Rows | Next operation |
|---|---:|---|
| At least one non-obvious directory external source URL to examine | **215** | Check whether each is actually a church, diocese, institute or reliable research organiser, then test exact building and rite |
| Only known external directory-style URLs | **21** | Seek separate institutional corroboration; no current owner inferred |
| Only an Ad Orientem internal link | **18** | New independent source needed |
| No retained URL | **2** | Source identification required |
| **Total** | **256** | **0 certified by this URL availability screen** |

Presence of an external URL is **not evidence that it is authoritative or current**; the 215 include specialist organisers and possibly historic sources. These source-readiness statuses are stored on each existing crosswalk row under `v2_single_source_readiness_20261111`, without modifying prior source IDs or converting candidate relationships to certified CL2 links.

The 1,531-archive census remains unchanged: **118 initial direct provenance links**, **282** first-pass textual leads, **1,118** follow-on no-original-URL screens split **281/16/821**. This work has closed the first-party verification of **25 of 281** single identity leads and **fully classified the source availability of all 256 others**; it is **not** complete contemporary venue-by-venue verification of the LMD website's current 1,570 reported positions.

## Independent owner-source resolution + Poland 2026 changes

A [separate evidence-linked delta ledger](../../../data/directory/research/lmd-firstparty-exact-urls-and-poland-2026-delta.v1.json) has closed a **first-party URL comparison** of the remaining **1,131** archived LMD rows without a strong ID, name and locality match.

- **Four** previously unlinked archived LMD rows share **exact original institutional URLs** with **five** existing CL2 IDs. This is source-provenance corroboration, *not* an automatic CL2 source-ID reassignment. The owners for three cases independently attest Traditional Latin/Extraordinary Form Masses: the Poor Clares' Annunciation Monastery in Minooka, Ave Maria Parish in Florida, and Blessed Sacrament Chapel in Gibson. Their published times remain separate from Ad Orientem's approved CL27 timetable.
- **One physical-site identity collision:** both `RG-4ED6CD089356` and `RG-AFAA6529F2CD` describe **Annunciation Monastery at 6200 E Minooka Road** and point to the monastery's identical liturgical-schedule URL. The former is labelled FSSP (ministry association); the latter is labelled Poor Clare Colettine nuns (site owner). **Potential duplicate physical church; review the institutional-role distinction in the canonical Excel master before approving any alias/merge.** Neither current ID was removed or changed.
- **St Stephen's Basilica, New Orleans:** matching official parish URL confirms the physical parish identity, but the parish's *First Friday Latin Mass* listing is not sufficient proof of a 1962-Missal service at the precise basilica venue. Diocesan information additionally references an Extraordinary Form occasion and other Good Shepherd worship sites. Keep rite/room/date evidence held.
- Only **13 of the 1,131** previously unmatched archive rows actually contain an original institutional URL. **Four** share an exact source with CL2, **nine** carry a URL with no exact CL2 overlap, and **1,118** have no original URL at all. The **1,127** without an exact URL overlap are **not** confirmed missing venues, and most cannot be screened by URL using the historical archive.

### The remaining nine original-URL cases: now identity-dispositioned (11 Nov 2026)

The October source archive had **13** original institutional-URL leads among the **1,131** records that resisted the earlier direct/textual matcher. The prior pass linked **4** by exact original first-party URL. This follow-up independently reviewed the remaining **9/9** whose URL did not exactly equal a current CL2 source URL. **No additional current-CL2 exact provenance links were fabricated**; the evidence lives in `nonexact_firstparty_original_url_dispositions` in the existing [first-party/Poland ledger](../../../data/directory/research/lmd-firstparty-exact-urls-and-poland-2026-delta.v1.json), and the nine corresponding archive rows now carry a separate audit field.

| Classification | Archived records | Disposition |
|---|---:|---|
| Same named physical institution already in CL2 | **6** | Houston Annunciation `RG-3AF61C17A39B`; Yonkers Annunciation `RG-FC18299DDF0F`; Wilmington Basilica `RG-ABD010C7A5D7`; Honolulu Blessed Sacrament `RG-9F7550645D32`; Fairfield Carmel `RG-C51DCE8B1899`; Valparaiso Carmel `RG-0ECBB0E72D34` |
| Organisation-level archive record, not a single physical venue | **1** | Miami archive 'Agrupación Católica Universitaria' points to a present chaplaincy source serving **three** separately registered CL2 chapels (`RG-2B24CC45DB61`, `RG-4ACD125CC3CD`, `RG-A03EB23BDD92`). Do not conflate the organisation with one building or presume organisational succession |
| Historic room within an existing building | **1** | Boston Cathedral `RG-AAEB19C81AB3`: archived Blessed Sacrament Chapel name conflicts with the **current Latin Mass location, Our Lady's Chapel**; these are different worship rooms inside the same cathedral, not two confirmed new buildings |
| Independently supported physical site absent from the inspected CL2 index | **1** | **St Mary of the Angels Chapel, Winona, Minnesota**, 1160 W Wabasha St; proposed **Excel-review new-site candidate**, not yet approved or published |
| **Total original-URL cases newly dispositioned** | **9** | **0 new CL2 groups or schedules** |

**Current institutional corroboration:** Houston's [parish event explicitly identifies a 2026 Extraordinary Form High Mass](https://annunciationcc.org/events/archangels); Yonkers [parish attributes its Latin Mass to Annunciation's lower church](https://annunciation-fatima.com/mass-devotions), **not** the distinct Our Lady of Fatima church; Wilmington's [traditional-Mass organiser explicitly identifies the Basilica Shrine and dated 2026 celebrations](https://www.traditionallatinmasswilmingtonnc.com/); Honolulu's [parish explicitly specifies the 1962 Missal at Blessed Sacrament, Pauoa](https://blessedsacramentpauoa.blogspot.com/p/latin-mass.html). None of those current source times has been copied into CL27.

**Liturgical-book precision:** The [Fairfield Carmelites identify their monastery and Extraordinary Form practice](https://www.fairfieldcarmelites.org/the-nuns-of-fairfield), while the historically archived LMD record uses **1937 Carmelite Rite** terminology. The local rite/rubrical-basis classification must be reviewed rather than silently recoded to the 1962 Roman Missal. The Valparaiso Carmelite site identity exists in CL2; a fresh specific liturgical-calendar verification remains held.

**Boston chapel distinction:** The [cathedral's current first-party schedule](https://bostoncathedral.com/mass-times/) assigns the Sunday Latin Mass to **Our Lady's Chapel** and other Masses to **Blessed Sacrament Chapel**. This is a historical venue-location change inside an existing building, not a reason to restore an old chapel label or invent a second cathedral pin.

**One independently evidenced new-site candidate — Winona:** The [Basilica of St Stanislaus's November 2026 calendar](https://www.basilicawinona.org/latin-mass) explicitly states Mass according to the **1962 Missal** in **St Mary of the Angels Chapel, 1160 West Wabasha Street, Winona**. [Saint Mary's University confirms it owns this named chapel](https://www.smumn.edu/about/our-mission/history-heritage/). No Winona physical site appears in the currently inspected **2,580-site CL2 index**. This justifies **one Excel master candidate** (with duplicate check and approval), **not** automatic GitHub import, an inferred coordinate or a new public card.

These **13/13** historically recorded original-URL leads have now undergone finite identity screening (**four prior exact + nine current nonexact**). The other **1,118** archived no-match records have **no preserved original institutional URL**; that absence does not imply missing sites and requires a different, bounded identity approach—not repeating this URL step. Baseline archive classifications remain **118 direct provenance**, **280 single textual leads**, **2 multiple textual leads** and **1,131 with no earlier strong textual lead**. The new supplemental dispositions must not be summed into the original 118 without deduplication.

The [LMD Poland 2026 change log](https://www.latinmassdir.org/trends/2026/pl/) reports **eight newly listed venues and one cancellation**; these are changes to LMD's coverage, **not** necessarily newly opened or closed churches. Comparing all nine against CL2:

- **One new LMD listing is an existing Ad Orientem record:** Mikołów St Wojciech / Our Lady of the Snows old church = `RG-783CD50DD217` (abbreviated CL2 title). [The parish's own schedule](https://www.bazylikamikolow.pl/duszpasterstwo/msze-i-nabozenstwa) establishes the traditional Roman rite in that specific old church. **Do not create a duplicate.**
- **Two further listed churches have independent owner/diocesan physical-building evidence but no independently established 1962-Missal recurrence from the reviewed official pages:** Holy Trinity in Włodzienin and the Holy Spirit rectoral church in Sandomierz. Hold their rite and times.
- **The remaining five newer Polish listings have now been checked against independent church/diocesan or order sources**. Łowicz and Obra have 2026 first-party evidence explicitly identifying Traditional Roman Rite Masses at their named churches; this is **site-and-rite evidence**, not blanket certification of a future recurring timetable. The [Piarists' 1 November 2026 announcement](https://www.lowicz.pijarzy.pl/) specifically reports the first-Sunday Vetus Ordo at Łowicz, with [provincial identification of its physical church](https://pijarzy.pl/strona%2C14.html). The [Missionary Oblates' 19 January 2026 report](https://oblaci.pl/2026/01/19/obra-msze-swiete-trydenckie-w-przyklasztornym-kosciele-sw-jakuba/) explicitly confirms older-rite Masses in Obra's St James church but describes a break and planned later resumption, so a November schedule is **not** yet approved.
- **Styrzyniec and Stary Sławacinek** are named chapels of Biała Podlaska's Nativity of Our Lady parish in the [Siedlce diocesan register](https://diecezja.siedlce.pl/parafie/parafia-narodzenia-nmp/); [the parish schedule](https://parafianabrzeskiej.eu/?page_id=988) confirms worship at each chapel but does not identify the older rite. **Brwinów** is an explicit worship-space separation: [Warsaw archdiocese lists the Capuchin Poor Clares' monastery at Kępińska 57](https://archwwa.pl/zakony-i-zgromadzenia/) while [St Florian's own parish at Biskupicka 2 separately lists a Tridentine Mass](https://archwwa.pl/parafie/brwinow-sw-floriana/). The parish Mass cannot validate or relocate an alleged convent-chapel celebration.
- **Updated 2026 Poland disposition:** all **8** LMD 'new' positions now have independent physical church or monastery evidence; **3** (Mikołów, Łowicz, Obra) have explicit independent owner/order older-rite evidence; **5** retain rite or exact-chapel holds. **Only 1** was previously present in CL2 (Mikołów). The independently corroborated remaining sites are **Excel review candidates**, not approved new CL2 entries. None of the eight was automatically imported, and schedules remain untouched.
- The canceled Ostrów Wielkopolski entry has no exact same-town CL2 physical-site identity. **Do not delete or suppress** unrelated CL2 churches based on this LMD status.

The owner-source and Polish-change audit has **zero imported Mass times, zero new pins, zero accepted sites and zero automatic merges**. Current findings are usable for a *bounded identity/evidence review*, not a reason to run fresh worldwide source scraping.

## Geographic candidates — more meaningful than raw totals
**Fourteen** LMD-listed countries/territories have **zero** physical sites in the current CL2 country field. Their LMD country pages collectively report **20 venue positions**.

| Code | Country/territory | LMD positions | CL2 sites |
|---|---|---:|---:|
| BO | Bolivia | 2 | 0 |
| DK | Denmark | 2 | 0 |
| FK | Falkland Islands | 1 | 0 |
| FI | Finland | 1 | 0 |
| GU | Guam | 1 | 0 |
| VA | Vatican City | 2 | 0 |
| IL | Israel | 1 | 0 |
| JM | Jamaica | 1 | 0 |
| LI | Liechtenstein | 2 | 0 |
| LU | Luxembourg | 1 | 0 |
| MT | Malta | 1 | 0 |
| MC | Monaco | 1 | 0 |
| PR | Puerto Rico | 2 | 0 |
| UA | Ukraine | 2 | 0 |

These are **country-level candidate leads**, not 20 verified active chapels, not approved coordinates and not independent proof of a weekly 1962 Mass. Prioritise a building/diocesan-or-institute source check before anything enters the Excel master.

Another high-priority mismatch is Poland: **117** LMD-reported positions vs **92** CL2 sites (43 SSPX-labelled, leaving 49 other sites). The raw differences of 25 or 68 are **not** verified missing-site counts; church identities, chapels within churches, historic Mass sites and source scopes may overlap.

## All 20 zero-country positions dispositioned against independent sources (11 Nov)

The bounded [first-party/owner evidence triage](../../../data/directory/research/lmd-20-country-gaps-firstparty-triage-20261111.v1.json) now classifies **all 20 country-gap positions** without accepting them into CL2:

| Disposition | Positions | Import decision |
|---|---:|---|
| Independent church/institute or diocese plus explicitly traditional/1962 celebration | **5** | **Candidate for existing Excel identity and evidence review only** |
| Historic explicitly traditional rite but no fresh current owner timetable | **1** | Current celebration hold |
| Independent older-rite calendar clue but chapel-versus-church geometry uncertain | **1** | Building identity and rite approval hold |
| Catholic physical institution corroborated, no independent 1962 celebration | **8** | Rite/activity hold |
| Archived LMD or current country-list lead without independent confirmation | **5** | Evidence hold |
| **Total** | **20** | **0 approved imports** |

**The five strongly evidenced candidates:** Sacred Heart (Jesu Hjerte) in Copenhagen, St Mary's in Helsinki, Jesuits' Church in Valletta, San José in Villa Caparra/Guaynabo, and San Martín de Porres in Arecibo. Institutional links appear individually in the JSON. These are not five automatic new pins: exact identity and local approval still belong to the existing CL2 Excel register.

**Specific non-trivial holds:**
- Puerto Rico: Una Voce's updated 2026 Arecibo **13:00** notice conflicts with the diocesan schedule's **14:00** figure. Guaynabo's organiser and parish calendars have different coverage and historical clock revisions. **No times imported.**
- Liechtenstein: St Martin's ordinary parish building is not automatically the same visitor entrance as the chapel listed for the *Alte Messe*. Do not create two pins from a title collision.
- Vatican City: the Bocciata and Clementine chapels belong to the same St Peter's Basilica building; two source venue entries do not establish two distinct physical buildings. Neither is a verified public recurring schedule.
- Monaco: the diocese's 2026 **Latin** Mass is not alone proof that the **1962** Missal was used.
- Luxembourg: earlier explicit traditional Mass evidence is not a fresh 2026 owner schedule.
- Denmark, Finland, Malta and Puerto Rico: the existence of local church/owner evidence does not bypass existing Excel review and current CL27 timetable gates.

The 20 positions comprise **17** already in the October source archive and **3** currently known only through LMD country pages (Israel one; Ukraine two). No LMD bulk page extraction is required to preserve these cases. Other missing-country uncertainty remains recorded exactly as a hold, not as a negative finding against Ad Orientem.

## Matching and disposition rules
1. Same physical venue confirmed by source-owned address + city + institutional reference: link to the existing CL2 ID; never create a duplicate.
2. Name+locality only: strong *identity lead*; hold exact entrance, schedule, priest, rite and jurisdiction claims.
3. LMD listed but absent in CL2: independent parish/diocese/institute source required; enter candidate in the owner-approved **CL2 Excel master**, preserve exact building identity and duplicate checks; import only after explicit Excel approval.
4. CL2 venue absent in LMD: **do not treat as an error**, downgrade or delete. Categorise as the different directory scope (notably SSPX), outside-LMD country coverage, historic/occasional, or simply not indexed. Status remains unknown if not independently verified.
5. Same venue with differing schedules: retain the CL27 historical/evidence distinction. No LMD timetable may supersede an owner source or become a guaranteed recurring Mass from this audit alone.
6. Source-specific exceptions stay held. Do not create any new pin, alter original CL2 coordinates or reduce the 2,583-card census.

## What is complete and what is not
- **Complete:** comparison of all 65 LMD country aggregates with the full 2,580-site CL2 country census, plus direct page-level name/locality checks for all 5 Mauritius and all 16 Ireland LMD entries.
- **Not complete:** line-by-line reconciliation of the other LMD venue listings, independent church identity/source review, systematic current schedules and full permission/legal screening for any large-scale LMD data import. Historical LMD links are **not** the same as fresh live matches.
- The website's [terms](https://www.latinmassdir.org/terms-and-conditions/) restrict reproduction, duplication and redistribution. This register stores **only published country-level aggregates, link pointers and our own canonical IDs**. Do not bulk copy the source directory's venue profiles, schedules or photographs or implement a crawler against the site.

## Consolidated worldwide archive disposition — all 1,531 historical entries (11 Nov 2026)

The [canonical consolidated research triage](../../../data/directory/research/lmd-20261111-consolidated-1531-closed-triage.v1.json) is now the **single, exhaustive historic-archive review surface**. It assigns one explicit, QA-checked disposition to **each of 1,531** distinct venue-source identities from the **9 October 2026** internal LMD archive, without re-fetching or reproducing LMD venue text or schedules. It combines existing CL2 provenance, the initial name/locality screens, institutional URLs, later owner checks, all 16 multiple-match resolutions, the 256 one-candidate outstanding cases, the 821 name-mismatch cases, and the 20 zero-country triages.

**The entire remaining 1,077-record backlog has been *classified* in this single consolidation**, rather than left in small batches. This does *not* mean 1,077 owners have verified each site. Specifically:

| Previously outstanding category | All records dispositioned | Meaning |
|---|---:|---|
| V2 single-site leads lacking owner corroboration | **256/256** | Still **256 owner-evidence holds**; CL2 source-link readiness already separated into 215 external candidates, 21 directory-only, 18 AO-only, 2 no retained URLs |
| V2 no strong name/locality match | **821/821** | **126** have internal title+locality lead from wider index scan, **104** title-only lead, **54** homonymous/multiple-site hold, **514** no defensible CL2 internal lead; **23** have institutionally/owner-based evidence or country gap dispositions superseding initial text-only status |
| **Total backlog given a disposition** | **1,077/1,077** | **0 forced matches, 0 auto-approved new sites or schedules** |

**Full 1,531 archive**: the source buckets reconcile exactly to 118 historically direct provenance links, 282 first-pass textual co-location leads, 13 archived original institutional-URL cases, 281 later single textual candidates, 16 competing textual cases, and 821 later no-strong-textual cases. These are mutually exclusive *baseline groups* summing to **1,531**. Every row has its original source ID and one final review disposition, with no mass/schedule import approval. The **1,570 current country-reported positions** are a *different scope/date*, not a row-level census of the October 1,531 archive.

**Eight independently supported new-physical-site Excel candidates** are explicitly marked, **not created**: St Mary of the Angels Chapel (Winona MN); Christ the King Church (8510 Wornall Rd, Kansas City MO); Cor Jesu Oratory (Boyd WI, 1962 rite unconfirmed); Sacred Heart (Copenhagen DK); St Mary's (Helsinki FI); Jesuits' Church (Valletta MT); San José Parish (Guaynabo PR); and San Martín de Porres Parish (Arecibo PR). The exact existing Excel master, building identity, classification, institute/diocese and duplicate rules remain mandatory. A further **eight source-identified institutions retain older-rite evidence holds**, and additional items have historic-schedule or building-identity holds; these are **not** approved Mass venues from the archive alone.

This completes **finite internal archive-level triage**, not complete independent verification of every 2026 venue or reconciliation of the *live* LMD provider's currently reported 1,570 positions. The other source's independent scope may exclude SSPX, and its omissions are not grounds for removing our existing sites.

**QA invariants** reported by the consolidated file: 1,531 unique source IDs; exact 1,531 resolution total; 118 historical direct-provenance matches; 282 original textual leads; 13 owner-URL source cases; 281 later singles; 16 later multiples; 821 later no-strong-textual; all 256/821 examined; all 20 zero-country cases represented; 2,580 existing canonical physical sites preserved; 0 approved additions; 0 automatic merges; 0 times imported. Work stops at source evidence holds rather than inventing certification for them.

## Finite closure criterion
A *complete LMD comparison* means every legally accessible current LMD venue candidate can be mapped to one unique CL2 ID, a genuinely proposed new physical site, an explained scope exclusion or a precisely named evidence hold — **without inventing unresolved truths**. The existing 2,583 cards remain production-accepted regardless of these holds. This document is the first bounded country census, **not** the finished worldwide row-level audit.

### Primary sources
- [LMD country counts](https://www.latinmassdir.org/countries/)
- [LMD about/eligibility](https://www.latinmassdir.org/about/)
- [LMD terms](https://www.latinmassdir.org/terms-and-conditions/)
- [Mauritius venue list](https://www.latinmassdir.org/country/mu/?view=list)
- [Ireland venue list](https://www.latinmassdir.org/country/ie/?view=list)
- [Poland venue list](https://www.latinmassdir.org/country/pl/?view=list)
