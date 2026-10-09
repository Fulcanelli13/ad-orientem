# Ad Orientem — Canonical Content & Navigation Registry (v1)

**9 October 2026 · Architecture census, not a UI release**

- Machine-readable register: [`data/app/content-navigation-registry.v1.json`](../data/app/content-navigation-registry.v1.json)
- Snapshot baseline: `dab6b8319ddea39c5a968085ae8d9b85d1b36e14` on `main`
- Existing Formation authority: [`data/learn/content-ownership-registry.v1.json`](../data/learn/content-ownership-registry.v1.json)
- Formation recovery source: [`FORMATION-MASTER-INVENTORY-2026-10-09.md`](FORMATION-MASTER-INVENTORY-2026-10-09.md)
- This file and the JSON are **read-only architecture evidence**. They do not change routes, displayed content, runtime, navigation labels, database imports or release gates.

## Executive decision

**Reduce prominent navigation destinations from six to five only after acceptance**, by grouping existing Home and Calendar under a single user concept **Today**:

| Currently visible | Proposed permanent destination | Treatment |
|---|---|---|
| Home | Today | Home remains the short, liturgically-aware launch projection; no second calendar engine |
| Calendar | Today → Calendar | Full Calendar, liturgical year, feast intelligence and Coming Up stay in Calendar; highly discoverable from Today |
| Mass | Mass | Preserve the R17 native reader, preflight, and distinct prepare/live/thanksgiving lifecycle |
| Pray | Pray | Keep the existing six Prayer families pending Prayer audit; reduce repeated UI, not devotional depth |
| Learn (Formation) | Learn | Group existing routes under Foundations; Catholic Life; Liturgy & Latin; Questions & Debates; Apostolate |
| Find / Explore | Explore | Organise tasks around Find Mass, Sacred Places, Pilgrimages, Catholic Traditions; keep six internal search lenses |

Settings remains a global utility. Scripture, Glossary and bibliographical sources form **one shared contextual reference layer**, not three extra permanent tab slots. Apostolate is a major `Learn` family, not a separate permanent ribbon destination. **These are proposed IA groupings, not route changes.**

## Counts: do not sum dissimilar records

The register has 63 recorded route, alias or lens identifiers and 31 corpus-family records. The 63 include six visible destinations, utility routes, 15 Learn launchers, Prayer registry/lazy routes, six Explore lenses and explicitly gated/retired identifiers. They are **not 63 tested screens**. The 31 represent logical families and often overlap.

### Learn / Formation

| Corpus | Authoritative state at snapshot | Proposed presentation |
|---|---|---|
| Catechism of St Pius X (433 Q) | Live reported; single positive doctrine owner | One Catechism entry offering Daily Study and Complete Reference |
| Learn the Faith (54 IDs) | Recovered unpublished research composite; versions overlap | Selective sourced teaching content under Catechism, **not** a competing 54-card doctrine bank |
| Spiritual Life (14 lessons) | Published | Living Catholic Faith |
| Sexual Ethics (150 QA, 55 extended debates) | QA live; deep debates not fully independently source-certified | One owner; ordinary browse by 50 canonical topics, full question search retained, selected advanced debates |
| Mass Formation / Server practice | Live formation routes | Liturgy & Latin; no duplication of Mass liturgical runtime |
| Latin (40 lessons) | Live course, review issues still present | Liturgy & Latin, with shared glossary lookups |
| Glossary (450 concepts plus lexemes and phrases) | Live reference infrastructure | Reference service, visible from Learn and contextual lookups |
| Apologetics (60 dossier titles) | **FROZEN_TARGET_NOT_YET_PUBLISHED** | Questions & Debates **only after dossier-by-dossier source and EN/FR approval** |
| Church Crisis (81 dossier titles) | **FROZEN_TARGET_NOT_YET_PUBLISHED** | Same debate reader, separate canonical ownership and paragraph-level citation policy |
| Traditional Mass objections | 50 research-reconciled records in the inspected register | Index/aliases into Church Crisis; no new duplicate bank |
| Contemporary controversy material | Reconciled research, not 43 new approved debates | Deduplicate into relevant canonical APOL/CR owners |
| Apostolate | 36 registered scenarios in six families, 9 skills | Learn → Putting Faith into Practice, with source handoffs to appropriate modules |

**Publication prohibition:** Titles, bilingual drafts, citations to a source index, or a successful structural test do not prove that an objection has an authentic proponent or that each paragraph's claim follows the original text. The unpublished APOL/CR launchers are not to be introduced until certification. The existing `learn.catholic_life` catch-all remains retired. `learn.seasonal_rites` remains a compatibility alias, not a resurrected Formation card.

### Prayer

The current source already groups Prayer into **daily, eucharistic, penance, passion, devotions, library**. Preserve those six groupings during the independent Prayer audit unless that audit supplies user-tested evidence for a different grouping. The canonical prayer file has 48 prayer objects; the novena SOT has 16 playable targets. Prayer route counts include aliases, programmes and prayer objects and are not counts of independent applications.

Convergence targets are a single prayer text owner, unified language-switching and source controls, context-preserving Scripture expansion, consistent modal/ribbon behaviour, and specialised Rosary/Stations/Confession experiences only where justified. Calendar computes devotional dates; Prayer owns actual devotional execution.

### Explore / geography

The Explore loader names live seed datasets: 181 places, 177 shrines, 205 pilgrimages, 20 route definitions, 32 apparitions, 121 relics, 13 customs and 71 custom attestations at the audited snapshot. These record types overlap and are not unique destinations or independently verified opening hours.

**Important deduplication finding:** All 39 principal relic-site publication records in `data/explore/relic-principal-sites-publication.2026-10-09.json` match existing place, relic and shrine IDs in loaded seed corpora; 19 second-wave sites also appear there. **Do not re-import these as new places.** Improve source display, place relationships, discovery and verification. A physical place must have one stable ID with separate shrine, relic, apparition, pilgrimage and Mass-ministry relationships. Visitor access, relic authentication and Mass schedule verification are independent claims.

The directory retains its own schedule/provider validation even when a place also has a sacred-place profile. Research provider snapshots must not be treated as freshly verified live schedules solely because they are loadable.

### Scripture

The shared Scripture catalogue lists DR-Challoner, CPDV-2009, Crampon-1923 and Clementine Vulgate, all `enabled: false` at this snapshot. The presence of edition metadata and contextual Scripture buttons does **not** mean a complete certified offline Bible text is available. Do not manufacture full-text availability or silently cross-map verse numbering. Each originating module opens the one shared Scripture reader, receives a context-aware result, and returns to the originating state. Source editions must satisfy rights, collation and doctrinal/textual review gates.

## Publication and discoverability state machine

- **Navigation visible:** Declared global ribbon destination, not proof of successful rendered interaction.
- **Launcher declared:** User-facing route listed in source, not browser acceptance.
- **Registered but buried:** Route exists in a registry without a prominent matching navigation entry; test reachability.
- **Dataset loaded:** Data is referenced by a live loader, without proof every record appears in every filter or is accurate.
- **Research only / publication gated:** Preserved in GitHub but explicitly not eligible for public navigation.
- **Compatibility alias / retired:** Exists only to preserve historical entry points, not as a separate canonical owner.
- **Verified and published:** Requires source-level approval, bilingual parity, live interaction validation and release tests. **This status cannot be inferred from the current census alone.**

Unpublished material should be discoverable internally to editors in the register, **not** prematurely exposed to app users.

## Canonical ownership contracts

1. Calendar owns liturgical-date resolution, transfers, precedence and dates of devotional programmes.
2. Mass owns liturgical texts, celebration choice, cues and live liturgical execution.
3. Prayer owns private devotional text and prayer/programme execution.
4. Catechism owns positive doctrine, even when daily or lesson views project the same answer.
5. Apologetics defends doctrine; Church Crisis owns contested historical-ecclesial controversy; Sexual Ethics retains its specialised moral-content owner.
6. Scripture owns biblical passages, edition identity, contextual reading and cross-version safety.
7. Glossary owns term definitions and Latin lexemes; individual modules link to these definitions.
8. Explore owns place/venue identity and relevant geographically evidenced associations; the Mass directory owns its ministry, verification and schedules.
9. Apostolate owns interactive pastoral or practice scenarios; it links to doctrine or devotional execution rather than copying them.
10. Shared application shell owns permanent ribbon, overlay management, return context, fonts, icons, accessibility and the proposed future global index.

**Core rule:** *One canonical content object, one controlling authority, multiple relevant entry points.* Secondary routes are projections or links, not independently maintained text copies.

## Cross-surface acceptance requirements

- **Navigation:** Current six-tab routes and bookmarks continue to work until a verified migration is shipped. Proposed Today must preserve fast Calendar access, day selection and live-Mass leave protection.
- **Source links:** A reference must target the appropriate source/section and accurately distinguish original witness, historical commentary, secondary provider and editorial material.
- **Context:** If a user opens Scripture, a related novena, glossary or doctrinal explanation mid-flow, the app must restore that user's location and reading/prayer state upon return.
- **Languages:** The user experience must work in French and English; Latin text and edition information must not silently change their meaning.
- **Deduplication:** Search and indexes may list multiple contexts, but only one source owner. Never add ledger counts to canonical dossier counts or treat recovery variants as separate content.
- **Tests:** No architectural migration is accepted without an existing-route regression, phone touch/scroll acceptance, offline/loading checks, error-state review and source/EN-FR checks.

## Work packages and boundaries

| Code | Responsibility | Can proceed without production UI changes? |
|---|---|---|
| ARCH-01 | Route/corpus census and consistency test | Yes — this PR |
| ARCH-02 | Claim-level audit/recovery of APOL/CR and Learn the Faith | Yes, unpublished source reviews |
| ARCH-03 | Scripture source/edition readiness and contextual reference service | Yes, certification first |
| ARCH-04 | Formation grouping and common debate reader | No, coordinate with Formation and global design owners |
| ARCH-05 | Prayer presentation convergence | After ongoing Prayer audit |
| ARCH-06 | Explore four-family task presentation and place profile consolidation | Yes with isolated Explore branch, but verify external provider data |
| ARCH-07 | Today/Home + Calendar ribbon migration | **Hold** until Calendar audit, shell contracts, regression/return acceptance |
| ARCH-08 | Universal *published-only* search and entry-point index | After stable content identities |
| ARCH-09 | Alias retirement | Last; never break existing deep links without explicit redirects |

**Cross-pipeline rule:** Calendar and Prayer own their audits; this architecture PR changes no shared runtime, UI styles, app shell, content texts or source classifications. Changes to shared navigation/Scripture/component systems require one coordinating owner. Do not revive LEGACY Mass presentation, parallel rescue builds or a Catholic Life catch-all.

## Known limitations

This is a **source-level census**, not an independent phone-browser audit, independent source certification or full item-by-item physical-content inventory. A future second census must discover leaf entities (each prayer, dossier, place, source and edition) and classify them individually using the canonical family authority recorded here. The attached JSON's `browser_verified:false` fields are deliberate. Any proposed five-tab change must go through a separate reviewed implementation PR.
