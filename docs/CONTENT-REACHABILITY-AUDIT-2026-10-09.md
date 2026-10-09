# Ad Orientem — User-facing Reachability: Source-Level Audit

**9 October 2026 · PR #737 · No runtime changes**

**Canonical evidence:** [`data/app/content-reachability-audit.v1.json`](../data/app/content-reachability-audit.v1.json).  
**Underlying items:** [`data/app/content-item-census.v1.json`](../data/app/content-item-census.v1.json).

## Method and limit

Trace each of the **63 declared route, compatibility-alias or Explore-lens IDs** through launcher markup, click handlers, source module owners and available readers. Map the **39 item types** to their current entry-point contract and publication status. This is a *source trace* rather than a real mobile/browser test. For that reason, none of the 63 is marked `browser_verified:true`, and no content is labelled fully certified based solely on source wiring.

Use the following classifications to avoid misleading conclusions:

- **Directly declared:** a ribbon destination, active Formation launcher, Prayer family card or Explore filter.
- **Nested:** a real user experience entered through another one (Visit to Blessed Sacrament under Adoration, an individual prayer through Prayer Library).
- **Compatibility alias:** prior route preserved for an existing experience, not an additional destination.
- **Intentionally unpublished:** research whose source, attribution and bilingual gates have not passed.
- **Dataset indexed but not shown in an Explore lens:** a candidate actual discovery gap, not a duplicated public map marker.
- **Unknown until browser QA:** a source-declared path whose click, loading and return state still requires running the app.

## I. Route-level census

| Kind | Source-level count | Evidence and verdict |
|---|---:|---|
| Permanent destinations | 6 | Home, Mass, Pray, Learn, Calendar, Explore declared in `src/app/contracts.js`; global ribbon adapter in `src/app/browser-entry.js` |
| Secondary Home utility / Learn bridge | 2 | Settings from Home; Apostolate from Formation; neither should become another permanent tab |
| Formation family card launchers | 15 | All have card selectors in `src/learn/presentation.js`; 13 first-use/owner module paths, Catechism and Daily Catechism delegate to existing donor owners |
| Prayer family entries | 23 | Six current Prayer families, wired by `data-p435930-own` or lazy `data-p435930-external` |
| Prayer hub | 1 | Opened from main Pray destination |
| Prayer nested/direct special entries | 3 | Visit to Blessed Sacrament; De profundis; Eternal Rest. These need usability/return QA, not three new nav cards |
| Prayer Angelus alias | 1 | `pray.angelus` → `pray.angelus_regina`, intentionally no duplicate card |
| Explore lenses | 6 | TLM, shrines, apparitions, relics, traditions, pilgrimages, connected to projection/filter callbacks |
| Shared Scripture reader | 1 | Home Scripture card plus contextual passage capsules; actual full text remains source/edition gated |
| Calendar compatibility entry | 1 | `today.calendar` maintained as a link to full Calendar |
| Unpublished Formation routes | 2 | `learn.apologetics` and `learn.church_crisis` have explicit publication holds, not accidental missing buttons |
| Retired Formation catch-all | 1 | `learn.catholic_life` must not be restored |
| Retired seasonal alias | 1 | `learn.seasonal_rites` handoff to Calendar only |

The source confirms the relevant navigation code paths; it cannot prove all first-use imports, phone scrolling, modal returns and real data loading succeed at runtime.

## II. Specific discoverability findings

### RCH-011 — Two canonical geographical records lack a source-level Explore entry relationship

The live `data/geography/seed-registry.v1.json` contains **181** Place IDs. **179** connect to at least one shrine, apparition, relic, custom attestation, directory-place relationship or novena-context relationship. Two have none:

| Place (canonical ID) | Known potential relationship | Next action |
|---|---|---|
| `place:DE:kevelaer-kerzenkapelle` — Kerzenkapelle Kevelaer | `place:DE:kevelaer-gnadenkapelle` — Gnadenkapelle Kevelaer | Verify chapel/complex relationship from original institutional evidence, add explicit linked place display if supported |
| `place:GB:holywell-st-winefride-church` — St Winefride's RC Church, Holywell | `place:GB:holywell-st-winefride` — St Winefride's Shrine & Well | Verify exact parish/shrine association and distinct physical addresses; link contextually as separate places where justified |

Both have **null geographic coordinates** and no matching novena-context link. The current `src/find/explore-projection.js` builds search/lens items from shrine, apparition, relic, pilgrimage, tradition and Mass-directory inputs, not a standalone all-places list. `src/find/place-profiles.js` does instantiate a profile for each canonical Place, but `src/find/explore-presentation.js` opens a profile from an existing result. **Therefore these two look structurally buried**, although user-visible unreachability still requires a rendered browser test.

Do not copy the coordinates of the nearby shrine to these distinct locations; do not invent a relic, an apparition, a traditional Mass or public access merely to produce a map pin. A documented relationship or place discovery entry is the appropriate correction.

### RCH-004 — Home error fallback can hide a failed target

In `src/home/browser-entry.js`, `openRoute(id)` attempts a registered Prayer module and, upon failure, can fall back to the general Prayer hub (`AO_PRAY_APP_V1.open()`). That preserves access to prayer generally but **does not fulfil the specifically selected shortcut**. Normal-path success is not known to be defective; this is a **conditional misleading-navigation risk**. The Home owner should preserve the original requested ID and give a visible retry or explanatory error rather than silently substituting the hub. Coordinate with the Home/Prayer audit pipelines; do not modify their shared runtime here.

### RCH-005 — Registered does not mean missing

The Prayer registry exposes `pray.visit_blessed_sacrament`, `pray.de_profundis` and `pray.eternal_rest`; the first starts the Adoration reader in visit mode, while the remaining prayers can be located in the shared 48-text Prayer Library. These should be tested in their intended context, **not** turned into redundant major cards. The legacy `pray.angelus` alias is correctly separate from the canonical Angelus / Regina Cæli route.

### RCH-001/RCH-009 — Research is intentionally hidden

Apologetics (60 canonical target titles), Church Crisis (81) and the 54 recovered / 55 proposed Catechism teaching arrangements are **not new ready-to-publish cards**. Preserve their provenance, recover the factual sources, certify actual opponents' argumentation and French text, then expose within Learn's future umbrella. An inventory row tagged `FROZEN` or `RESEARCH` should never be counted as a broken public route.

### RCH-002 — Scripture entry accessible in source, edition availability restricted

The contextual Scripture component opens one shared reader. At this snapshot, four edition catalogue entries are disabled for local full text. Verify that the interface clearly distinguishes source-backed external reading and a locally installed edition; keep the originating position and exact reference when returning.

### RCH-007 — Explore type census versus displayed result census

The Explore projector maps 177 shrines, 121 relics, 32 apparitions and 205 pilgrimages into their respective lens lists. **That is code coverage, not proof that each item is accessible through search, map display, pagination and source links on a phone.** Users may also have place pages combining several such objects. Tests must compare the full list, counts, search/filter conditions and source controls.

## III. Prioritised next corrections

1. **Explore-owned P2:** resolve two structurally orphaned place records through verified geographic relationships, not additional duplicated entries. Verify on real device afterward.
2. **Home-owned P2:** handle the failed deep-link fallback honestly; preserve the selected target and display a retry/error instead of silently opening a different experience.
3. **Learn-owned P2:** verify 15 module launchers, including cold Catechism and Daily Catechism donor readers, focus/scroll and import errors.
4. **Prayer-owned P2:** verify six families/23 cards, nested visit and library prayers, bilingual/source controls and return position.
5. **Reference-owned P1:** verify Scripture context, disabled edition fallback, source link and return-to-origin.
6. **Architecture-held:** do not consolidate the permanent ribbon into five slots until full Calendar/Prayer audit and phone user-journey acceptance.

## IV. Acceptance script — phone and desktop

Run the following as a signed-off owner pass; do not assert they already passed.

- Launch a clean browser session, online and offline; switch English/French; test keyboard and touch.
- Visit all six permanent destinations; check active ribbon, Back/Home, first-use load, error retry and accessibility.
- Open all fifteen Formation cards. Confirm the requested child, rather than a generic fallback, is visible. Open, close, and reenter.
- Open each Prayer family item (23), all registered programmes and Prayer Library; search both `De profundis` and `Eternal Rest`; verify the Adoration Visit mode.
- Open every Explore lens; switch list/map; search a known place and inspect one linked shrine, relic, apparition, pilgrimage, custom and venue; ensure citations refer to the exact item.
- Attempt to find the two unlinked geographical Places through every normal entry and search, then add documented links and retest.
- From a Prayer, Mass reading and Formation text, open Scripture context and return to the exact origin, without losing reader state. Confirm no disabled edition falsely promises offline full text.
- Check explicitly that retired Catholic Life and unapproved Apologetics/Crisis research are not published as public navigation.

The accompanying contract test [`tests/content-reachability-source-contract.mjs`](../tests/content-reachability-source-contract.mjs) verifies static route/entry integrity and the two-source orphan calculation against current files. **It is not a substitute for the described browser acceptance.**

## V. Freeze conditions

Do not change global navigation or move Prayer/Calendar content in this PR. The underlying production app is receiving parallel work, and a source census must not silently overrule those owners. Final UI consolidation is a separate PR after route, return-context, publication and phone acceptance are certified.
