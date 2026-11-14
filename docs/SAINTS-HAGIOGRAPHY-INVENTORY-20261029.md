# Saints / Hagiography — source-and-identity inventory audit (29 October 2026)

**Status:** research audit only. **No new Saint identity owner, biography publication, calendar observance, Mass selection, relic authentication, photo or map pin.** Repository audited: `Fulcanelli13/ad-orientem` default `main`, with original research branches cross-checked. The private `Fulcanelli13/folio-core` `main` was also enumerated; this audit is not a private-canonical import or a deployment.

## Executive conclusion

Do **not** commission ~300–400 new biographies or create a second hagiographical master. The project already contains a historical source index, modern canonization/Doctor indexes, 30 source-linked English/French life drafts in distinct release states, physical-site/relic links and a read-only relationship projection. The main missing deliverable is a **reviewed identity + source-availability crosswalk against the current 1962 day resolver**, followed by rights-aware source extraction, editorial approvals and *existing* Calendar/Explore presentation. Source keys and archived artwork components are not persons.

## Audited numbers, with denominators and caveats

| Existing source / scope | Verified count | Editorial interpretation |
|---|---:|---|
| v43.33 historical art/date archive | 311 components on 252 nominal dates, 307 historical source identities | Not 311 individual saints, and not a certified full 1962 Calendar person census |
| Research source-key ledger | 608 source keys across the recorded families | Not 608 unique persons; cross-owner keys are deduplicated only by exact stable source key |
| Ledger non-group exact-key union | 595 | Still includes angels and liturgical records; not a biography denominator |
| Ledger inferred entity types | 529 person candidates, 70 groups, 7 liturgical-event subjects, 2 angelic records | All are source records, not approved canonical person identities |
| Keys in two or more source-owner families | 33 | Exact-key overlap only; no generalized alias merge |
| Final canonical person-ID approvals in W86 readiness summary | 0 | Reported research owner state on 16 October; no retrospective claim about later adjudication |
| Later official-source canonizations | 258 named persons, 13 collective groups, 112 recorded events / 51 year indexes | Canonization date is NOT the universal feast date; group remains one public profile unless separately important members warrant profiles |
| Doctor roster | 38 names | Roster review; not 38 new persons to add |
| Living-sanctoral P2 draft | 293 individual identities, 13 groups, 338 date-evidence ledger entries | Source-date research; not certified jurisdiction/1962 Mass eligibility or production |
| Main Saints pilot | 6 bilingual profiles: 5 saints, 1 Blessed | Explicit `RESEARCH_ONLY_NOT_APP_VISIBLE` data and `EDITORIAL_REVIEW_ONLY` person labels; `ACTIVE_SAINTS_CHANNEL=PILOT_SIX` is an app release boundary, not a certification of every biographical fact |
| Separate Saints draft branch | 8 Doctors + 16 cross-vocation biographies = 24 additional EN/FR reader drafts | 24/24 longer narratives available for second-editor review; **0** approved by second editor and **0** newly app-visible |
| Original shrine-name audit | 250 shrine snapshot rows, 121 with saint-name associations, 145 association edges, 119 distinct name strings | Historical branch snapshot; current main `shrines-pilgrimages-seed` contains 257 shrines. These are not 119 distinct verified saints or biographical life-event links |
| Shrine-to-person research triage | 119 name strings; 38 with no existing source-key match in W86 owner-readiness | Explicit exception queue; do not normalize by name or generate new person IDs |
| Main relic-subject census base | 161 subjects | Base research records; not 161 independently authenticated relics or unique canonized saints; later waves and conflict ledgers are separate |
| Existing published bilingual sanctuary guides | 33 | Site stories, not saints' lives; P65 already reuses them, so do not rewrite |

## Verified file provenance and status

- **Current main:** `data/saints/holiness-first-editorial-pilot-20261015.v1.json` (6 people, blob `15de6374ab766303cfc53b8b3a4585ae6f3c066f`); `src/find/saints-release-policy.js` (PILOT_SIX); `src/find/connected-sacred-entities.js` (read-only exact-ID graph); `data/calendar/post1960-canonizations.official-batch1.v1.json` (258 persons and 13 groups); `data/calendar/doctors-of-church-roster.review.v1.json` (38); `data/explore/worldwide-relic-subject-census.research.v1.json` (161 base); `data/shrines/shrines-pilgrimages-seed.v1.json` (257 shrines).
- **Research-only, existing draft PR #1227**, branch `saints/2026-10-15-identity-and-holiness-pilot`: `data/saints/historical-v4333-311-components.recovered.v1.json` (311/307/252, blob `c06c4294e07666c81b045a65e61317c851156715`); `data/saints/read-only-calendar-art-index-20261015.v1.json` (307 historical, 258 later, 13 groups, 38 Doctors, blob `ae209938712873ced3921ffdf155ab32972a61f9`); `data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json` (608, blob `5b7275461d1a5a40456be68324194ce366fbbb1a`); `data/saints/holiness-first-eight-doctors-research-20261015.v1.json` (8); `data/saints/holiness-first-sixteen-cross-vocation-research.v1.json` (16); `data/saints/held-24-editorial-desk-review.v1.json` (24 held); `data/saints/legacy-shrine-name-audit-20261015.v1.json` (119 names); `data/saints/w78-bulk-119-shrine-person-match-triage-20261016.v1.json` (exceptions).
- **Draft PR #1302** owns the 293-person + 13-group **date/jurisdiction crosswalk**. Preserve the distinction between attested date and universal calendrical authority. Do not overwrite/reharvest it to get another 293.
- **Merged PR #1907 / P64** owns exact read-only relationships across Saints, Places, relics, Customs and Calendar; its Saints links are editorial-hold, not published biographies.
- **Merged PR #1908 / P65** owns source-bound place-copy reuse: 33 PUBLISHED bilingual shrine guides and bounded 1–12-Place offline Claude research packets. Do not duplicate source stories or create a second Saint owner.
- **Private `folio-core` `main`** tree reviewed, but no matching `data/saints/` editorial dataset appeared there. Therefore do not assume the draft public research branch is the private canonical corpus.

## Pilot profiles and explicit identity exception

Six main pilot entries: `saint:therese-of-lisieux`, `saint:bernadette-soubirous`, `saint:margaret-mary-alacoque`, `saint:claude-la-colombiere`, `saint:peter-chanel`, and `blessed:jacques-desire-laval`. **Do not merge Blessed Jacques-Désiré Laval of Mauritius with Saint François de Montmorency-Laval of Québec.** Only exact, reviewed cross-owner identity links authorize Calendar → profile navigation. A shrine association is not evidence of birth, residence, martyrdom, tomb, relic custody or visitor access.

## External source intake — existing availability vs imported coverage

| Candidate source | Access and role | Audit disposition |
|---|---|---|
| ICKSP `archives-vies_des_saints.htm` | Public French index mixes traditional saints, feasts, institute dates and later figures (e.g. Padre Pio) | **Discovery-only** until a complete URL/index census and identity match is generated. Modern hosted article rights are not assumed to permit copying. A separate ICRSP 855-metadata / 783-commentary corpus research PR #1666 is **not** proof of full Saint-du-Jour biography intake. |
| Divinum Officium | Public GitHub MIT-labelled project; structured Office files in `web/www/horas/`, arranged by language and section | High-priority offline **historical lesson** source; pin revision and map `Lectio IV–VI` by actual calendar form/rubric. Check language-/edition-specific provenance before displaying any text; no dedicated bulk matching Saints intake was confirmed in the audited Ad Orientem tree. |
| Alban Butler | Identifiable old editions (e.g., Library of Congress 1913 volume explicitly public domain) | Bulk primary/secondary biography comparison, edition fingerprint required. Do not assume later revised translations share the same rights. |
| Catholic Encyclopedia / Roman Martyrology | Biographical and martyrological witness layers | Confirm exact edition, text rights, saint identity and group-vs-individual semantics; no present full coverage percentage asserted. |

Source links: https://www.icrsp.org/Calendriers/Le%20Saint%20du%20Jour/archives-vies_des_saints.htm ; https://github.com/DivinumOfficium/divinum-officium ; https://www.loc.gov/item/13024457/ .

## Finite implementation order; no extra research programmes

1. **Freeze owner IDs and base denominator.** Generate 365 (or 366) observed day records from the **current** 1962 Calendar resolver, with principal, secondary commemoration, transferred/displaced source IDs and group semantics; include independent nominal fixed-date source references. Reconcile against the existing 307 archive and 608 exact source-key ledger *without creating replacement identities*. Deliver two explicit counts: distinct observed 1962 person/group identities, and additional source-only/research identities. Never claim 1962 completeness using the 307 historical *art* list.
2. **Harvest sources mechanically, once.** Fetch ICKSP index to `source_url → title/date` research rows; acquire a pinned Divinum Officium revision and transcribe selected historical lessons; ingest a clearly public-domain edition of Butler. Extract structured facts and source fragments with licence/provenance labels, not generated stories.
3. **Run deterministic identity join.** Match exact authority IDs/source keys first, then supervised aliases with proof. Route the 38 previously unmatched shrine-name strings and historically ambiguous group/saint cases to a finite exception queue. Respect Blesseds, angels, saint groups, later canonizations and local calendars.
4. **Complete editorial release queue.** Reuse the six existing bilingual pilot narratives and 24 bilingual second-editor-ready drafts. Prioritize source review and correction, not regenerating them. Draft only missing saints from attached source facts; publish short (60–100 words), standard (180–250) and long (400–600 only with sufficient substance) lengths as projections of the *same* reviewed record. Every claim retains text/edition/source URL; tradition, historical uncertainty and relic claims are separately typed.
5. **Present inside current app.** Calendar uses observed 1962 authority and a secondary “Life & sources” route; Explore/Place uses P64 exact relationships and P65 published site stories. Distinct saint, relic, shrine and artwork IDs stay with owners. Use approved images only, or a typography-first fallback. No new calendar, relic atlas, map owner or hotlinked Google photo collection.
6. **Close by release gates rather than batches.** Metrics: exact 1962 distinct-identity denominator, source-linked coverage, EN/FR biography coverage by editorial approval, exact Calendar links, exact Place links, rights-cleared images, relic-custody evidence, and remaining exception queue. A source-linked short card is not a 500-word finished biography.

## Publication vetoes

No mutation of canonical 1962 Mass selection/Proper/rank; no post-1960 saint silently inserted into the historic Roman calendar; no biography promoted from research-only just because it has references; no undifferentiated import of ICKSP wording; no saint/Place join inferred from matching words; no “relic authenticated” claim from a custody citation; no new map pin for a person without a physical-site owner; no payment, metered photo service or paid Claude pipeline.

**This audit establishes the existing baselines and scope. It has not run the current 365-day Calendar resolver or completed ICKSP/Divinum/Butler URL-to-saint cross-matching; those are precisely the finite remaining inventory computation, not achieved progress.**
