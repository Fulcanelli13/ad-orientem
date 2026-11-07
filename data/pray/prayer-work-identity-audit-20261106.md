# Prayer work identity registry — Stage 1 audit (6 November 2026)

**Scope:** Research branch only. No edits to existing prayer texts, readers, navigation, public assets, main, or GitHub Pages. This is not a certification that all 133 works are independently published.

## Deliverables

- data/pray/prayer-work-identity-registry-20261106.v1.json — source-owner identity registry. **No prayer body text is copied.**
- tests/pray-work-identity-registry-20261106.mjs — executable coverage and integrity contract.
- .github/workflows/pray-work-identity-registry.yml — branch / PR validator with no deployment job.

## Exact accounting

| Measure | Result |
| --- | ---: |
| Original masterplan numbered rows | 138 |
| Proposed catalogue work records | **133** |
| Canonical source records | 48 |
| Independent canonical works after Loreto/Requiem grouping | 46 |
| Main novena programmes | 16 |
| Rosary-owned components (not standalone entries) | 2 |
| Distinct Immaculate Conception novenas | 2 |
| Source-owned works whose live route still needs independent verification | 85 |
| Canonical-family works with existing published availability preserved | 46 |
| External-link-only St Thérèse items | 2 |

The 138 original numbers become 133 works by combining the Loreto editions, Requiem forms and Easter hymn recensions (three fewer), plus retaining the Fatima prayer and Rosary collect as components of the Rosary (two fewer). **Do not combine the two independently structured Immaculate Conception novenas.** The previous 132 estimate is superseded.

## Family counts

| Family | Works |
| --- | ---: |
| I — God, the Most Holy Trinity | 23 |
| II — Our Lord Jesus Christ | 28 |
| III — The Holy Eucharist | 20 |
| IV — The Holy Ghost | 5 |
| V — Our Lady | 22 |
| VI — The Angels and Saints | 15 |
| VII — Holy Church and every need | 8 |
| VIII — Scriptural Prayer | 4 |
| IX — The last things | 8 |
| **Total** | **133** |

Relative to the old 132 projection, V increases by one from retaining the distinct Institute Immaculate Conception novena. VIII increases by one and IX decreases by one because De profundis is classified as a Psalm.

## Specific corrections recorded

- Morning Offering: II / Sacred Heart; morning is a contextual facet.
- De profundis: VIII / Psalms; faithful-departed use is a contextual facet.
- Adoremus in aeternum and Psalm 116: III / Benediction, with Scripture reuse metadata.
- Divine Praises: I / Praise and thanksgiving, referenced by Benediction.
- Loreto and Requiem: one work each, with both original canonical form IDs preserved.
- Immaculate Conception novenas: two separate programmes, same subject but not the same edition.
- Tantum Ergo: excerpt of the not-yet-acquired full Pange lingua. No fabricated destination ID.
- Holy Name Litany: one work, referenced in Montfort preparation.
- Fatima Prayer and Rosary collect: two programme-owned Rosary components, not independent library entries.
- Montfort's Augustine prayer and consecration act: tagged as programme-owned components, not new independent prayer library entries.
- St Thérèse Institute perpetual Tuesday novena and missionary intercession: external links only; the Twenty-Four Glory Bes novena and historical 1925 prayer remain distinct.
- No Learning to Pray module, exercises, navigation or generic reader has been added.

## What the validation actually establishes

The test checks original table-row coverage, one family and subcategory, unique identities, source-owner paths, 48 canonical source IDs, sixteen main novenas, edition groupings, parent relations, missing references, source pointers for full-language canonical records, and separate publication / verification status.

**85 records have route-unverified availability.** This does not mean unpublished or hidden. It means this research pass has not individually audited their public reader route. No existing live entry may be removed on that basis.

The 46 canonical-family works preserve their published state, while their edition evidence remains source-recorded-not-recertified. The registry has language evidence pointers but does not claim new original-edition print certification.

The separate 97-row historical acquisition ledger is not another catalogue of published prayers. It is not counted in the 133 and its statuses remain unchanged.

## Open research (not silent publication blockers)

1. Confirm exact addressee/edition for the Montfort components and the three questioned Lenten hymns: Audi benigne, O sol salutis, Ex more docti.
2. Collate St Thérèse's separate missionary and historical 1925 texts before treating them as editions of one work.
3. Verify whether a complete Pange lingua is already source-owned; only then wire the Tantum Ergo excerpt relation.
4. Audit the 85 source-owned reader routes and their actual available languages without removing public functionality.
5. Reconcile remaining source editions and the acquisition ledger without mistaking overlapping research for unique works.
6. Confirm homepage facets against the existing calendar and user customisation before changing presentation.

## Non-regression gate

- Never rewrite or overwrite the Latin, English or French prayer texts for classification.
- Never replace or alter specialised Rosary, Mass, Confession, Adoration, Benediction, Stations, Offices or Novena readers.
- No app imports this research registry yet, and no Prayer / homepage UI has changed.
- GitHub Actions + GitHub Pages remain the sole publication infrastructure; the new validation workflow deploys nothing.
- Do not claim structural test success as proof of public route, print edition, historical rights or liturgical-correctness audits.

Run the validator with:

    node tests/pray-work-identity-registry-20261106.mjs

Only a finished Node or GitHub Actions execution counts as validation execution evidence; the initial in-memory construction check is a separate preliminary check.


## Stage 2 source-pointer audit — executed in GitHub Actions

Successful workflow run: https://github.com/Fulcanelli13/ad-orientem/actions/runs/42285083538

The Stage 2 executable audit tested all **87 non-canonical-family work records** (84 with unverified reader routes, 2 external links, 1 source-only Office). Results:

| Evidence from the source checker | Records |
| --- | ---: |
| Exact ID found in an imported source object | 31 |
| Exact ID found in an imported source array | 12 |
| Source export and member resolved | 17 |
| Exported object with a distinct source ID | 1 |
| Exported arrays requiring programme-member ID crosswalk | 8 |
| Symbol/token visible in its owner file (not runtime import-certified) | 18 |
| **Total audited source-owned records** | **87** |

**69 records** have source-module import evidence; the remaining **18** have lexical source-file evidence only. There were **zero unresolved source keys** in the tested importable sources and zero module import failures.

**29** work IDs appeared as literal tokens in known runtime owner files; **58** did not. Neither observation proves browser reachability, and some programme IDs intentionally do not appear as standalone route strings. **No extra records have been marked published.**

### Four errors caught and fixed by the new audit

The initial Stage 2 run failed on four entries that had used public route IDs as if they were exported data symbols:

| Reader route | Corrected source key |
| --- | --- |
| pray.little_crown | LITTLE_CROWN_B30_BEADS |
| pray.st_joseph_seven_sorrows | JOSEPH_SEVEN_PRAYERS_B24 |
| pray.penitential_psalms | PENITENTIAL_PSALMS_VULGATE |
| pray.good_death | GOOD_DEATH_DYING_V384 |

Each still retains its original public route ID as independent registry metadata. No original programme data or runtime code was edited.

Two other corrections were made directly from repository source evidence: the Montfort Act points to the real MONTFORT_B26_CONSECRATION_ACT_EN export, and Vespers of the Dead points to OFFICE_DEAD_VESPERS_1960_CONTEXT. The latter explicitly remains **source-only, not a public reader**.

The three Latin hymn classifications (Audi, benigne Conditor; O sol salutis intimis; Ex more docti mystico) were checked against their full Latin openings and closing doxologies. The source-addressee review flags were closed without altering the hymn texts.

The 133-work Stage 1 structural test and Stage 2 source-pointer test **both passed** in the linked successful run. This establishes data-identity and pointer integrity, not live rendering, complete text collation or a merge/deployment certification.

### Next controlled step

Individually check reader exposure for 84 route-unverified records and the relevant historical source language witnesses; mark availability as verified only after a reader-level test, and keep all currently live content visible. The research PR must remain draft and not enter the application until that work and the non-regression gate are done.

## Stage 2 reader-route ownership check — additional corrections

Validation run: https://github.com/Fulcanelli13/ad-orientem/actions/runs/42285836367

**24 of 24 actual module route identities** in the registry were matched to one of two pre-existing route contracts: the PRAY internal route owner (supportedDirectPrayerRoute) or the traditional Prayer route registry (ROUTES). None of the 24 was invented by the research classification. This is route **declaration** verification, not a claim that the live browser successfully opens each one.

An important identity collision was repaired:

- The already published pray.montfort_consecration route owns the **33-day Montfort preparation programme** (source masterplan row 123).
- The final Montfort Consecration Act (row 73) is a separate **child component** with registry identity montfort_consecration_act_1863. It is not an independent registered route. The actual prayer body stays MONTFORT_B26_CONSECRATION_ACT_EN in its original source file.
- The St Augustine component and Litany of the Holy Name now point to the correctly identified programme route. The test explicitly prevents restoring the former collision.

This correction does not rename a live app route or change the Montfort reader. It avoids the registry falsely assigning that route to a single source prayer.

**Reader availability still unverified:** 84 additional source-owned records require actual UI-level checking by language, edition and context. The 24 route declarations are a subset of route ownership evidence and must not be subtracted from 84 as though they had passed browser tests.

## Stage 3 — 36-work language-body and source-to-card audit

Executed and passed in GitHub Actions: https://github.com/Fulcanelli13/ad-orientem/actions/runs/42332029090

Machine-readable evidence: data/pray/prayer-work-language-evidence-20261107.v1.json (36 work rows, source keys, body-presence measures, version/recension information, and existing reader-container links). Test: tests/pray-work-language-source-audit-20261107.mjs.

| Source group | Catalogued works | Evidence |
| --- | ---: | --- |
| Main novenas | 16 | Each has nine specified days with English and French proper prayer bodies, whether repeated or day-specific. No independent Latin proper bodies detected in this module; Latin common prayers or canonical references must be assessed separately. |
| Traditional standalone prayers/hymns | 11 | Source object contains Latin, English and French prayer/hymn bodies; each retains its distinct source owner. |
| Traditional daily orders | 2 | Morning and evening sequences reference existing canonical prayer IDs. Evening additionally and correctly refers to the separately owned Nightly Examination reader route. No copied body text. |
| Seasonal hymns | 7 works, eight recensions | All have Latin and English texts. Five work groups also have French texts. The two without French are the Easter Ad regias/Ad cenam recensions and Aeterne Rex altissime. |
| **Total** | **36** | Source-structure coverage, not a new historical-translation certification. |

The audit first reported a false missing source for Nightly Examination because this is a companion route, not a member of the 48-record canonical text bank. Its cross-owner reference was validated; the source test now passes without treating the companion as an invented prayer.

Seven pre-existing source and renderer contract suites were additionally executed:

1. pray-novenas.mjs
2. pray-whole-novena-component-audit.mjs
3. pray-traditional-life.mjs
4. icrsp-seasonal-hymns.mjs
5. pray-traditional-six-source-to-card-v1.mjs
6. pray-final-four-traditional-source-to-card-v1.mjs
7. pray-direct-hymns-bedside-b16.mjs

Results include 19 novena programmes (171 day occasions), 258 original-source-to-card checks across six prayer reader contexts, and 75 additional original-source-to-rendered-card checks. All seven suites passed in the cited run.

**No publication status or live-reader verification was upgraded by these results.** Each of the 36 registry records now has a sourceBodyEvidence pointer and evidence profile, but remains source/route unverified until independently tested at the actual browser UI and verified against source editions. In particular, the `lang` certification flags remain `unassessed` for these supplemental items. The full registry still has 84 route-unverified records, of which 36 now have additional measured source-body evidence.

**Next controlled batch:** the other 48 route-unverified works across the Institute novenas, occasional intentions, clergy, Holy Face, Rosary and specialised-devotion modules. Evaluate each source/route with explicit owner and language evidence. After the source inventory is complete, test published routes and bilingual display end-to-end before a navigation or homepage change.

## Stage 4 — remaining 48 work identities: completed source ownership batch (7 November 2026)

Passing CI: https://github.com/Fulcanelli13/ad-orientem/actions/runs/42334718834

Machine-readable evidence: data/pray/prayer-work-remaining-source-evidence-20261107.v1.json. Executable test: tests/pray-work-remaining-source-audit-20261107.mjs. Every remaining work has an individual sourceOwnerEvidence pointer and a source digest where its resolved data structure supports hashing. No prayer body was copied into the classification registry.

| Evidence class | Records | Distinction |
| --- | ---: | --- |
| Individual source prayers | 19 | Direct source object/member or historical witness; original language and provenance remain independently qualified |
| Litany-specialist reader | 1 | Route ownership, not complete text collation |
| Additional Institute/Holy Face novenas | 3 | Distinct nine-day programme identities, no merging with the main 16 |
| Canonical composite prayers | 3 | Angelus, Regina Caeli and a Stabat Mater source-stanza array, not extra 48-prayer-bank records |
| Chaplets, Rosary, Stations and other devotion/way texts | 10 | Structured components and canonical prayer references, not new standalone prayers |
| Specialised companion readers and programmes | 12 | Existing route, sequence and source-controller contracts only |
| **Total** | **48** | All 48 have an explicit evidence classification; no UI-level availability upgrade |

Result: **zero unresolved source-export checks, zero import failures, zero declared route contract mismatches** in the tested code. Twenty-three of the 48 carry actual existing route declarations. Their presence in a module registry still does not establish live browser rendering. Six earlier route-ID/source-export conflations were corrected without modifying reader routes.

Important edition/language findings:

- Divine Infant King (ICKSP) and the Institute Immaculate Conception novena preserve nine days with separately sourced English and French repeated proper prayers. The latter remains distinct from the main day-specific Immaculate Conception novena.
- The Janvier 1887 Holy Face novena has nine English historical day-proper prayers. Its French guides/titles are not French translations of those nine prayer bodies; no complete French proper-text source is currently claimed.
- The Stabat Mater source array in canonical-data.js contains **13 Latin stanzas**, not a certified complete hymn. The catalogue entry must remain qualified as a partial source rather than automatically treated as a full prayer. A complete edition or additional source must be audited separately.
- The Five Wounds source retains 30 canonical-reference beads; Precious Blood retains seven mysteries; Little Crown retains 15 beads; Joseph Seven Sorrows and Joys retains seven prayers; Seven Last Words retains seven source entries; Penitential Psalms retain seven Vulgate-numbered Scripture references.
- Historical witness aliases remain attached to their existing source identities, including the Montfort final act, which is a paragraph array belonging to the 33-day preparation programme; no separate live route was created.
- Language-field candidates from a source structure are never equated with independently verified full prayer translations. Reader controllers, schedule data and Scripture reference arrays naturally have no independent prayer-body languages.

The dedicated validator also ran **12 existing specialist devotional regression suites** for the extra Institute novenas, Holy Face, Montfort, Little Crown, clergy, occasional intercessions, Seven Words, penitential sources and chaplets. All twelve passed, as did the earlier seven novena/traditional source-to-card suites. This makes **19 existing specialist/source regression suites**, in addition to the new registry and source-pointer audit tests, green in the cited workflow run.

### Correct cumulative progress and release boundary

| Stage | Scope | Status |
| --- | --- | --- |
| Canonical identities | 48 source records / 46 grouped canonical work identities | Structurally checked; historical editions not all freshly recertified |
| Supplemental source evidence | 36 Stage-3 text-body analyses + 48 Stage-4 source-owner analyses = **84 / 84** | Complete at repository source/structure level only |
| Other registered items | 2 external-link-only and 1 source-only Office | Explicitly not counted as published readers |
| Existing module-route contracts | 24 / 24 source-declared | Pass, but not browser-reachability proof |
| Actual browser/page and language presentation | 84 supplemental route-unverified records | **Not yet certified** |
| Historical first-edition and rights certification | Separate per-work review | Pending; cannot be inferred from text-field presence |

**No changes to Mass, Rosary, Confession, Benediction, Adoration, Office, novena readers, prayer texts, assets, public navigation or homepage.** The draft registry remains unconsumed by production code. The next gated work is targeted reader-level / browser acceptance and source-edition qualification, followed by category-facing wiring only when authorised. GitHub Actions + Pages remain the only publication infrastructure.
