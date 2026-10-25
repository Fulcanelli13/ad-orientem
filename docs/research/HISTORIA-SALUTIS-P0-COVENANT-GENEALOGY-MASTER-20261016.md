# Historia Salutis — P0 Covenant–Genealogy–Narrative Master Matrix (16 October 2026)

## Decision and ownership

**This is a non-destructive research crosswalk, not a new Bible reader or a second Atlas.** The canonical production owner is `src/find/bible-atlas.js` (151 eventKeys). The 37 currently displayed reading groups remain in `src/find/bible-atlas-reading-chapters.js`; the ten currently displayed arcs and nine themes remain in `src/find/bible-atlas-journeys.js`. No canonical IDs, Scripture, pins, art or Mass mappings are changed.

**Machine-readable source:** `data/explore/historia-salutis-p0-master-crosswalk.v1.json`

**Regression guard:** `node tests/historia-salutis-p0-master-crosswalk.mjs`

The new *Historia Salutis* layer offers two principal navigation perspectives over the same underlying material:
1. **Divine covenants/promises** — theological milestones and their fulfilment, carefully distinguishing explicit covenants, promises, prophetic announcement and the New Covenant in Christ.
2. **Genealogy** — human ancestry and biblical figures, with the Genesis network and Matthew and Luke preserved as separate source witnesses. Genealogy requires person-identity reconciliation and must never infer parenthood from appearance in one story.

The **continuous narrative** is a third presentation of that common corpus, with individual stories and cross-era themes branching into the existing event, Scripture, person, art and geography identities.

## Actual reconciliation completed in this P0 pass

| Research base | Reconciled result | Editorial boundary |
| --- | ---: | --- |
| Canonical Atlas events | **151 / 151**, original `eventKey` and exact order preserved | No new events |
| Existing reading groups | **37 / 37**, all 151 keys exactly once | Navigation headings, not approved original prose |
| Existing Atlas arcs and themes | **10 arcs + 9 themes** remain untouched | Existing theme links are exact-citation-only and provisional |
| Proposed covenant-centred primary narrative spine | **12 arcs** covering all 151 keys exactly once | Separate research classification, **not** a replacement of existing 10 navigation arcs |
| Covenant/promise stages | **7** research entries | Includes first promise and Jeremiah's prophecy, which must not be mislabelled as new covenant institutions |
| Comparative source-selection evidence | **460 records** across **149 of 151** event identities with qualified independent records | Not 460 chosen readings; no automatic verse selection |
| Atlas ↔ research cinematic scenes | **67 exact, 17 overlap-only, 67 absent** | Overlap is not same event, geography or theological verification |
| Character-story donor | **39 classified stories** with scene pointers | Classification only; no approved narrative prose |
| Curated genealogical donor | **90** Genesis edges; **41** Matthew nodes; **76** Luke nodes | All in draft/research sources, editorial review required |
| External people index | **3,231** research identities | Cannot certify raw external relationships or promote them wholesale |

The two events without qualifying comparative source-selection evidence are **Daniel 14:1–22** (Bel) and **Daniel 14:23–42** (the dragon). These are *source-selection-frequency gaps*, not proof that the events are unimportant or absent from Scripture. They do not justify deletion.

### Twelve proposed primary arcs

| Sequence | Primary arc | Existing events |
| --- | --- | ---: |
| 1 | Creation, Fall and First Promise | 3 |
| 2 | Noah, Covenant and Nations | 3 |
| 3 | Abraham and the Patriarchs | 12 |
| 4 | Exodus and Covenant at Sinai | 11 |
| 5 | Promised Land and First Kings | 6 |
| 6 | Davidic Kingdom | 4 |
| 7 | Prophets, Exile and Return | 27 |
| 8 | Incarnation and Holy Family | 12 |
| 9 | Public Ministry of Christ | 31 |
| 10 | New Covenant: Passion and Resurrection | 17 |
| 11 | Pentecost and Apostolic Church | 20 |
| 12 | Christ's Triumph and New Jerusalem | 5 |
| **Total** | | **151** |

These labels are a **proposed reader outline**, not assertions that every arc has accepted continuous narrative text. The entire 27-event Prophets/Exile unit and 31-event public ministry unit will require careful editorial subdivision. The Apocalypse is symbolic and prophetic vision, not an invented dated itinerary after Acts.

### Covenant and promise source anchors

| Stage | Scripture | Canonical 151 relationship |
| --- | --- | --- |
| First promise (not an explicit named covenant with Adam) | Genesis 3:15 | Within the Fall episode |
| Covenant with Noah | Genesis 9:8–17 | Exact episode |
| Covenant with Abraham | Genesis 15:1–21 | Exact episode |
| Covenant at Sinai | Exodus 19–24 | Canonical Sinai event captures only part of the fuller covenant narrative |
| Royal promise / covenant with David | 2 Samuel 7:12–16; Psalm 89:3–4 | **Gap: no exact selected episode** |
| Prophetic promise of the New Covenant | Jeremiah 31:31–34 | **Gap: no exact selected episode** |
| New and Eternal Covenant in Christ | Luke 22:20 | Within the Last Supper episode (`biblical:event:cenacle-e1`) |

In particular, do not portray an event having "David" in the title as sufficient support for the covenant of 2 Samuel 7. A covenant arc needs the actual covenant scripture, or a clearly marked source-only companion reading.

## Genuine high-priority gaps

1. **2 Samuel 7:12–16 — Davidic royal promise.** This is a substantive theological bridge to Christ. Provide a source-anchored supplemental reading; only propose an additional Atlas episode through the existing Atlas editorial workflow.
2. **Jeremiah 31:31–34 — promise of the New Covenant.** It is distinct from the covenant's institution at the Last Supper; preserve that progression.
3. **Ruth 4:13–22 — ancestry of David.** This connects individual character stories to the genealogical spine; do not conflate lineage with an Atlas milestone.
4. **Matthew 1:1–17 and Luke 3:23–38 — two textual genealogies.** Separate networks, Joseph's legal/putative role, duplicate-name disambiguation, textual-variant exceptions; do not synthesize one biological tree.
5. **Historical Catholic authored narration.** Draft #1069 expressly holds all narrative prose until original printed-source and translation review. **No AI-authored Bible narrative is allowed under the existing editorial policy.** Original Scripture can always be surfaced from the existing reader; faithful, documented translations of verified historical Catholic-author narrative require human editorial acceptance.
6. **Typology.** Biblical textual identity is not typological certification. Old/New Testament relationships need an explicit evidence registry, authorial witness where applicable, and editorial signoff.

A secondary gap is the discontinuity between **151 selected events** and 183 dramatic scene studies. Scene research is not a substitute for source-mapped canonical coverage. The 3,231-person corpus likewise should be searchable research, not a verified expanding family tree until edges are source-adjudicated.

## P1 execution order, using existing research

1. Resolve the **covenant-anchor lacunae** (2 Samuel 7, Jeremiah 31), then explicit genealogy bridge (Ruth 4), without changing the live Atlas or multiplying event identities.
2. Build an **identity-safe person ↔ episode** registry from the 90 Genesis source-linked edges and separate Matthew/Luke data; block asserted maternal genealogy of Our Lady, imported erroneous sibling/offspring edges, and unverifiable parentage.
3. Reconcile all **39 donor character stories** and their 183 research scenes against canonical eventKeys, keeping exact vs overlap-only vs no-match distinctions.
4. Classify **source-backed typological links** (e.g. first Adam / Christ) into cited, proposed and held, never automatic.
5. Continue source witness and paragraph-level review for **historical Catholic narrative authorship** before implementing a continuous story reader.
6. Once theology and identity are reviewed, test the reading experience linking covenants, genealogy, character stories, Scripture, approved sacred art and existing physical Atlas without interrupting the user's place.

## Source ownership and pinned evidence

- Published production: `src/find/bible-atlas.js`, `src/find/bible-atlas-reading-chapters.js`, `src/find/bible-atlas-journeys.js` on `main`.
- PR **#1069** source continuity: `data/explore/biblical-reading-continuity-review.v1.json`, blob `8ea13c49c0285330bc0bcfe6aa3cbcf79d14c2c8`.
- PR **#1069** comparative source matrix V7: `data/explore/biblical-pericope-comparative-full-master.v7.json`, blob `469036f830a128a80bab31d8e34722117570862d`.
- PR **#1069** journeys/stories donor: `data/explore/biblical-narrative-journeys-review.v1.json`, blob `7d1e3a1d1ed719ac3440d1b0d180fde6a9ee5951`.
- PR **#1069** curated genealogy: `data/explore/biblical-lineage-curated-review.v1.json`, blob `2eacefc54cba0d570b8cccbea81b8a21e063ab05`.
- PR **#1018** full 3,231-person research corpus; remains isolated and unmerged.

**Release gate:** P0 is evidence-and-identity reconciliation, **not** permission to merge into production or promote historical text, iconography, theological links, speculative dates or genealogical edges.
