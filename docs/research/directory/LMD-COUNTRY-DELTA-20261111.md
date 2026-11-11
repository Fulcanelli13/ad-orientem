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

## Finite closure criterion
A *complete LMD comparison* means every legally accessible current LMD venue candidate can be mapped to one unique CL2 ID, a genuinely proposed new physical site, an explained scope exclusion or a precisely named evidence hold — **without inventing unresolved truths**. The existing 2,583 cards remain production-accepted regardless of these holds. This document is the first bounded country census, **not** the finished worldwide row-level audit.

### Primary sources
- [LMD country counts](https://www.latinmassdir.org/countries/)
- [LMD about/eligibility](https://www.latinmassdir.org/about/)
- [LMD terms](https://www.latinmassdir.org/terms-and-conditions/)
- [Mauritius venue list](https://www.latinmassdir.org/country/mu/?view=list)
- [Ireland venue list](https://www.latinmassdir.org/country/ie/?view=list)
- [Poland venue list](https://www.latinmassdir.org/country/pl/?view=list)
