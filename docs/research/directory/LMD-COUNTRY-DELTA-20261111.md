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

**Historical matching error exposed:** eight previous name-only candidate suggestions conflict with the new location-specific proposal. Examples:

- Colorado Springs, Omaha and Rapid City “Immaculate Conception” were previously suggested as matches to the **El Paso** CL2 site. Distinct current CL2 sites exist in their actual named cities; these proposals still need building identity verification before linking LMD source IDs.
- La Roche-sur-Yon and Angers “Notre-Dame” listings had older suggestions for other French towns with the same dedication. City-specific CL2 candidate sites now replace these as research leads.
- Freiburg im Breisgau's Adelhauser Kirche and Le Havre's Saint Michael of Ingouville similarly require their own current locality rather than a same-name church elsewhere.

**Potential same-city CL2 collisions:** “All Souls” in Sanford (US) and “Nossa Senhora das Dores” in Brasília (BR) each produce **two** viable CL2 IDs at the same textual confidence. Preserve both canonical IDs and do **not** auto-merge until exact physical-site/source lineage is checked.

**Largest remaining no-direct-or-textual-match archive queues** (not proven missing sites): US **338**, France **198**, Poland **112**, Italy **96**, GB **81**, Brazil **74**, Germany **61**. Italy and Brazil have older dedicated source research already preserved in PRs #1716 and #1694; do not repeat those screens.

The matcher intentionally fails closed on dedication-only matching; its threshold requires country equality, at least two significant title words, strong rarity-adjusted title coverage, and a distinctive word shared with the CL2 address/locality. A street address marked “locality only” remains unverified even if its city word matches. None of these 282 claims is automatically promoted into production or the Excel approval master.

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
