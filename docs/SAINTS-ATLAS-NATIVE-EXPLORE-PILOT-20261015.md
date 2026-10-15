# Map of Saints — Native Explore Pilot

Date: 15 October 2026
Branch: `saints/2026-10-15-identity-and-holiness-pilot` / draft PR #1227
Publication state: **DRAFT, UNMERGED; historic GitHub Pages main unaffected**.

## One architecture, not competing maps

The existing `src/find/browser-entry.js`, `src/find/map-runtime.js`, `src/find/explore-projection.js` and `src/find/explore-presentation.js` now include a `saints` lens. From the existing Heritage (Sacred places) map the user can tap **Saints** in the horizontal filter strip. The navigation uses the native Explore map, search, List/Map tabs, selection sheet and Place page buttons, not an independent app instance.

The optional research payload `data/saints/holiness-first-editorial-pilot-20261015.v1.json` is loaded as an immutable additional resource. The feature fails closed if that payload or its schema is absent. `src/find/saints-lens.js` refuses all unsupported person states and unsourced shrine/place relationships. It validates every person–shrine–Place source edge against its existing source owners. There is **one map item per existing physical Place**; multiple saint links may share one item.

### First pilot, using current research

- **Six biographical profiles:** Thérèse of Lisieux; Bernadette Soubirous; Margaret Mary Alacoque; Claude La Colombière; Peter Chanel; **Blessed** Jacques-Désiré Laval.
- **Ten** source-preserving saint–shrine associations across **nine** distinct canonical physical Places.
- **Eight** mapped Places have non-indicative, provenance-bound coordinates. **Russell, New Zealand is listed only** because its current geocode is a nearby school, not the exact National Shrine entrance. No invented Futuna place is plotted for Chanel.
- Paray-le-Monial appears once on the map and shows **both** Margaret Mary and Claude, each with independent biography and reference links.
- English and French summaries answer **why the person is holy** (virtue, deeds/martyrdom, mission, legacy) ahead of dates or bibliographic metadata.
- Source citations are collapsed under **Sources & further reading**. Links stay external; no full copyrighted books are copied. All seven existing pilot source URLs point to Holy See original documents and were manually confirmed to resolve on 15 October 2026.
- **Approved portraits bound: zero.** Honest neutral placeholders avoid confusing shrine photos or unreviewed painting research with approved saint iconography.
- Neither the 1962 sanctoral resolver, nor actual feast-rank precedence/commemorations, nor the historical Pages deployment changes.

### Tests

`tests/saints-explore-native-lens.mjs` guards map pin counts, source matches, parent Place identity, absence of duplicate pins, BLESSED versus SAINT distinction, two saints at Paray, held Russell coordinates, bilateral search spelling, bilingual meaningful biographies, HTML source links and return to canonical physical Place pages.

`tests/saints-atlas-editorial-pilot.mjs` preserves all shrine name edges and guards extra liturgical/art/relic assumptions.

The full Explore regression fixture was updated **only** to add the new lens without changing the six existing categories, and reconciled to the latest main shrine count as the main repository evolved. A two-parent merge commit synced draft PR #1227 with main without changing main.

### Remaining acceptance gates

1. Native 390px and desktop **browser screenshot review**, including loaded MapLibre tiles, touch gestures, search focus and sheet dismissal. Source/DOM tests do not substitute for pixel review.
2. Human bilingual copy check on each of six initial saints.
3. Approve at least one genuine saint image with provenance and reproduction rights via Sacred Art pipeline; no independent artwork approvals in this PR.
4. Broaden saint identity register across the actual 1962 sanctoral owner and all commemorations; include later saints separately without rewriting 1962 Mass.
5. Extend substantive text to the first 30–50 saints, then expand beyond pilot. Initial 119 shrine name strings and 161 relic subject records do not represent a certified full world saints list.
6. Merge only after integration review; do not publish a prematurely incomplete map as comprehensive.

## Observed unrelated baseline concern

The existing content architecture census historically assumed 182 geographical Places while main now owns 258. That static assertion needs synchronization in the owning Content pipeline. This feature does **not** change geographic Place counts or modify that unrelated census test. All Explore-source projection and Saints-owner checks must still pass.

## Phase 5: identity classification, extraordinary phenomena, and observed Calendar matching

**Canonical profile data remains in** `data/saints/holiness-first-editorial-pilot-20261015.v1.json`, not in a new directory of duplicate biographies. The additive structure is documented by `data/saints/classification-taxonomy.v1.json` and validated in `src/find/saints-classification.js`.

The first six biographies carry **one formal Doctor title**, **16 separately sourced descriptive role assignments**, and **two source-identified reported apparitions**, with EN/FR labels and specific primary references. Roles currently represented include contemplative religious, religious, spiritual writer, priest, spiritual director, missionary, martyr, mystic, visionary witness and pastoral charity. This is not a comprehensive taxonomy census. Doctor of the Church has a formal papal basis, not merely a theologian descriptor. The two extraordinary accounts are **Bernadette’s Marian apparition testimony** (Benedict XVI 2007) and **Margaret Mary’s Christ/Sacred Heart experience** (Francis, *Dilexit nos* 2024 §§119–121). They are deliberately presented as source-described reports, with nuances on discernment, not as every detail independently proved.

**No source-vetted personal cures, stigmata, bilocations or levitation entries are assigned to these six.** That means *not yet established by the sources used here*, not that these things never happened. Neither Lourdes healing testimonies nor canonization/intercessory miracles are attached as miracles physically performed by Bernadette. Lived holiness, miraculous claims, beatification/canonization and sanctioned shrine cult remain separate concepts. Avoid promoting 0 miracles as a quantitative claim.

UI: concise documented role labels under names; an additional closed **Reported extraordinary experiences** section where a qualifying account actually exists, with immediate sources. Category words are indexed in the existing native search (Doctor, Mystic, Martyr, etc.) and do not create a competing Browse service. Empty sections stay hidden. Existing image approval holds remain.

The source-backed **1962 Calendar crosswalk** is in `data/saints/1962-observed-identity-crosswalk-pilot.v1.json`. The existing `AO_RUNTIME_V8.resolver.resolveDay` and `observedCycle` verified, for **2026**:
- 3 October 2026: **Thérèse of Lisieux** principal source `sancti:10-03:3:w`.
- 17 October 2026: **Margaret Mary Alacoque** principal source `sancti:10-17:3:w`.

This verifies exactly those two **observed 2026 days**. It does not certify every future year's precedence/transfer or locally approved feasts. Bernadette, Peter Chanel, Claude La Colombière and Blessed Père Laval are **not automatically inserted into the general 1962 Calendar**; the latter two had their canonization/beatification after 1962, and local/religious propers may cover other figures. Calendar source resolver, commemorations, rubrics, rank and output have **not been modified** in this PR.

Validation adds classification checks in `tests/saints-explore-native-lens.mjs` and date-source checks against the **actual browser runtime resolver** within `tests/saints-native-visual-acceptance.mjs`, not a claimed exhaustive full-year static mapping. Further source and art sign-off remain separate owning pipelines.
