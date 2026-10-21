# Historia Salutis P4 — continuity and theatre research checkpoint

**21 October 2026 · Research only · Work in progress, not editorially approved**

This checkpoint was added to the P3 continuation branch after inspecting the latest records on PR #1345, PR #1310 and PR #1069. It records the source baseline and a resumable queue; it does not certify work that the source records leave open.

## Source records inspected

- P3 continuous-reading proof: `data/research/historia-salutis-v18-continuous-reading-proof.v1.json` (37 movements; exact CPDV coordinates; separate Douay comparison/wording data; publication approval false).
- P3 continuity desk pass: `data/research/historia-salutis-v18-continuity-desk-pass.v1.md` and its JSON companion.
- P3 main spine: `data/research/historia-salutis-v18-main-spine-consolidation.v1.json` (217 original units retained and dispositioned).
- P1 master crosswalk: `data/explore/historia-salutis-p0-master-crosswalk.v1.json` and `data/explore/historia-salutis-p1-person-story-scripture-links.v1.json`.
- Existing theatre source: `data/explore/biblical-cinematic-studies-review.v1.json` on the #1069 research branch.

## Task A — movement review state

The P3 continuity desk document describes source-level opening/closing checks for M01–M19 and explicitly says it is not a start-to-end oral reading. The 37-movement proof supplies proposed CPDV verse spans for every movement. For M20–M37, the proof contains no movement-level `literaryDeskPass` record. Therefore those exact spans are a starting citation set, not evidence that the requested full seam review, Douay comparison, omission-sufficiency check, parallel-account treatment or source-matrix reconciliation has been completed.

| Movement | Working title | Recorded literary desk state | Proposed Scripture references in the proof |
|---|---|---|| HS-M20 | The Forerunner and first disciples | NO movement-level desk-pass record | Matthew 3:1–6; Matthew 3:11–17; Matthew 4:1–11; Mark 1:14–15; John 1:35–51 |
| HS-M21 | The Kingdom in Christ's teaching and signs | NO movement-level desk-pass record | Matthew 5:1–12; Matthew 6:9–15; Mark 2:1–12 |
| HS-M22 | Christ the Bread of Life | NO movement-level desk-pass record | John 6:1–15; John 6:26–35; John 6:47–59 |
| HS-M23 | Peter's confession and the Transfiguration | NO movement-level desk-pass record | Matthew 16:13–28; Matthew 17:1–9 |
| HS-M24 | The approach to Jerusalem | NO movement-level desk-pass record | John 11:1–7; John 11:14–17; John 11:20–27; John 11:32–35; John 11:38–44; John 11:45–53 |
| HS-M25 | The King's entry into Jerusalem | NO movement-level desk-pass record | Matthew 21:1–11 |
| HS-M26 | The Last Supper and Christ's final teaching | NO movement-level desk-pass record | Luke 22:7–20; John 14:16–17 |
| HS-M27 | Gethsemane, betrayal and trial | NO movement-level desk-pass record | Matthew 26:36–46; Matthew 26:47–56; Matthew 26:57–75; Matthew 27:1–2; Matthew 27:11–26; John 19:1–16 |
| HS-M28 | The sacrifice on Calvary | NO movement-level desk-pass record | John 19:17–30; John 19:38–42 |
| HS-M29 | The risen Lord and his witnesses | NO movement-level desk-pass record | John 20:1–3; John 20:6–9; John 20:11–18; John 20:19–29; Luke 24:13–35 |
| HS-M30 | The Ascension and promised mission | NO movement-level desk-pass record | Acts 1:3–5; Acts 1:6–12 |
| HS-M31 | Pentecost and the first Church | NO movement-level desk-pass record | Acts 2:1–8; Acts 2:11–18; Acts 2:21; Acts 2:37–41; Acts 2:42–47; Acts 7:51–53; Acts 7:54–59 |
| HS-M32 | Saul and the Gospel to the Gentiles | NO movement-level desk-pass record | Acts 9:1–11; Acts 9:17–22; Acts 10:1–6; Acts 10:9–16; Acts 10:19–20; Acts 10:24; Acts 10:28–29; Acts 10:33–48 |
| HS-M33 | Antioch, apostolic missions and the Council | NO movement-level desk-pass record | Acts 11:19–26; Acts 13:1–5; Acts 15:1–2; Acts 15:5–11; Acts 15:13–20; Acts 15:22–29 |
| HS-M34 | The Gospel proclaimed in Rome | NO movement-level desk-pass record | Acts 19:21; Acts 28:16; Acts 28:23–31 |
| HS-M35 | Christ and the Lamb in heavenly vision | NO movement-level desk-pass record | Revelation 4:1–11; Revelation 5:1–14 |
| HS-M36 | The final conflict and judgment | NO movement-level desk-pass record | Revelation 12:1–17; Revelation 19:11–21; Revelation 20:1–15 |
| HS-M37 | The New Creation | NO movement-level desk-pass record | Revelation 21:1–7; Revelation 22:1–5 |

Across the 37 movements, the proof still marks `readAloudAccepted:false` and `readyForPublication:false`. M20–M37 queue: compare each listed span to the original v18 segment and independent source-evidence matrices; read the selected Catholic witness text in order; assess omitted setup, agency, response, consequence and ending; check Gospel parallels individually; record source verses separately from editorial connective context. Do not promote a verse trim solely to meet a length target. Keep Matthew 1:1–17 and Luke 3:23–38 independent in the existing genealogy view.

## Task B — theatre scene source audit

The existing scene study declares 183 scenes in 14 chapters against the 151-event chronology. Its recorded classifications are 67 exact-reference, 29 passage-overlap-review-only and 87 with no direct passage match. All 183 have a Bible reference, English synopsis, English evidence note, location label, stable scene key and classification. The 87 unmatched records have no Atlas candidate. The record is citation-only and declares that it imported no coordinates, routes or artwork.

The 14 existing chapter batches, in current index order, are: PATRIARCHS (25; indices 0–24); DELIVERANCE (13; indices 25–37); WILDERNESS (5; indices 38–42); COVENANT (6; indices 43–48); WANDERINGS (8; indices 49–56); INCARNATION (13; indices 57–181); MINISTRY (46; indices 69–114); PASSION (16; indices 115–130); RISEN (7; indices 131–137); APOSTLES (6; indices 138–182); FIRST_MISSION (10; indices 143–152); SECOND_MISSION (11; indices 153–163); THIRD_MISSION (6; indices 164–169); TO_ROME (11; indices 170–180).

The scene JSON gives useful preliminary evidence labels but does not itself provide source citations for its historical-geographic assertions, a normalized actor list, event dates or covenant/genealogy relationship fields. Its prose sometimes explicitly limits a marker to a city or region, a traditional identification, a proposed identification or an unidentified site. These need a row-by-row evidence audit before any coordinates or historical claim can be added. Do not infer a point from a place name or from a schematic route. Where Scripture names a region but not an exact site, retain that distinction. Where tradition identifies a site, label it as tradition; where scholarship disputes the identification, keep competing candidates and citations; otherwise mark it unidentified.

## Task C — crosswalk rules and current limits

Use `sceneKey` as the scene identity and the existing `atlasEventKey` values in each scene's `candidates` array for Atlas relationships. Preserve the existing status values. An exact reference remains a citation relationship, not proof that two records describe the same event. Passage overlaps remain review-only. A missing candidate remains null/none and must not be filled by guessed coordinates or a duplicate canonical event.

Join narrative movements only when the movement's source reference demonstrably overlaps the scene's biblical reference, with the relation labeled exact or overlap and the movement/source citation retained. Covenant links must use the seven existing covenant IDs and P0's source-backed relationships. Genealogy links must use existing Genesis, Matthew and Luke witness structures; no inferred identity joins and no Matthew/Luke harmonization. This checkpoint adds no location coordinates, canonical IDs, production text, UI or new storytelling route.

## Resumable work queue

1. Complete a verse-by-verse seam review for HS-M20–HS-M37; record each decision, supporting Catholic witness/reference, parallel-account handling and open issue in the existing P3 proof/desk-pass schema.
2. Reconcile those movements against the 217-unit necessity audit and publisher source matrices; carry forward all original unit IDs and preserve the original workbook as editorial owner.
3. Audit all 183 theatre rows in their existing index order (chapter batches above). For each, document chronology basis, actors actually identified by the cited text, location class (exactly named biblical place / regional only / traditional / disputed / unidentified), sourced historical-geographic claim and associated event keys. Keep uncertainty explicit.
4. Add only substantiated movement–scene–Atlas–covenant–genealogy relations to a reusable crosswalk; report unmatched scenes as unresolved rather than manufacturing anchors.
5. Update this queue as batches are actually completed. Publication, merge, canonical Scripture edits, coordinate creation, and new experience routes remain outside this research task.

## Review boundary

PR #1345 is a draft research overlay; PR #1310 owns the master covenant/genealogy/story crosswalk; PR #1069 owns the existing Atlas and scene studies. This branch is based on the latest P3 head and is intended as a continuation checkpoint. No source in this file approves Bible text, historical prose, coordinates, rights, theology, production UI or publication.


## P4 citation crosswalk and isolated theatre laboratory — 21 October 2026

This subsection records **completed research engineering only**, after the original continuity checkpoint. It does not revise the original 217-unit workbook, the P3 verse selections, #1310's canonical P0 owner, #1069's 183-scene owner, the public 151-event Atlas, or the app's production Explore screen.

### Written deliverables

- \`data/research/historia-p4-movement-theatre-citation-crosswalk.v1.json\`: source-pinned reference comparisons for **37 P3 movements**, **183 scene keys**, and **151 P0 canonical Atlas keys**. Source blob SHAs and branch owner references are embedded.
- \`data/research/historia-p4-m20-m37-literary-review-queue.v1.json\`: **18** pending movement reviews, with **35** specific candidate narrative-seam or witness-integrity issues. Issue triage is **not** a verse-by-verse witness reading, oral pass, or approval.
- \`labs/historia-salutis-theatre-p4.html\`: isolated four-state bilingual theatre prototype; MapLibre geographic camera for the Jordan region, traditional Mount Tabor and Jerusalem city context; a separate non-geographic Revelation scene. Scripture text and artwork assets are **not** imported.
- \`tests/historia-p4-theatre-citation-contract.mjs\`: standalone fail-closed test for identifiers, invariant source counts, provenance restrictions, nonpublication flags, 18 literary holds and four-state laboratory source markers. Run from repository root using \`node tests/historia-p4-theatre-citation-contract.mjs\`.

### Measured joins

| Classification | Count | Interpretation |
|---|---:|---|
| P3 movements | 37 | Research proposal, not the P0's distinct 37 reading-chapter IDs |
| Movements with one or more matched scene references | 24 | Scripture-book and selected-verse span overlap only |
| Movements without matched scene references | 13 | Keep as source-coverage queue; do not invent scenes or force joins |
| Scene rows with at least one matched movement | 57 | No equality of event identity established |
| Scene rows without a matched movement | 126 | Remain available for independent research; no deletion |
| Movement-to-scene citation links | 57 | Every result reciprocal in scene audit queue |
| Movement-to-P0 Atlas citation links | 60 | Event references only, not verified identical historical events |
| Source scene-to-Atlas classifications | 67 exact / 29 overlap / 87 unmatched | **Original #1069 status preserved**, independent of P3 citation overlaps |
| Location row-by-row evidence approvals | 0 | All 183 geography and actor audits explicitly pending |
| M20–M37 oral readings/editorial approvals | 0 / 0 | No claim of completed literary acceptance |

The 13 movements without a linked scene are: HS-M01, M02, M03, M06, M12, M13, M14, M15, M16, M17, M35, M36 and M37. Many are essential theological or visionary episodes and do **not** require invented terrestrial map events.

### Nonnegotiable boundary

A shared biblical verse span is an **indexing aid**. It never certifies actor identity, geolocation, chronology, covenant provenance, textual wording, artistic suitability, reproduction rights or editorial approval. P0's reading chapters and P3's movements both happen to number 37 but have different chapter boundaries: **never join by their ordinal numbers**. The seven existing covenant/promise IDs remain differentiated; Matthew and Luke genealogies stay distinct. Explicit scene/Atlas candidate status is preserved without promotion.

The theatre laboratory takes three localized camera positions as *presentation only*: a broad regional camera for the Jordan, and **already existing** \`ATLAS_GEO.transfiguration\` (traditional Mount Tabor) and \`ATLAS_GEO.cenacle\` (Jerusalem city-context) values. No point is drawn claiming the exact biblical event location. These positions are not additions to the canonical coordinate registry. Revelation is deliberately non-geographic. MapLibre and a dark basemap are loaded from public CDNs; network access is required for tiles, while the labelled dark fallback stays legible without them.

The lab's English/French source synopses are copied from the **existing research scene records** for scenes 069, 104 and 119, not newly fabricated Scripture prose. M37 displays a carefully labelled short scriptural cue, not a certified edition import. Canonical reader content must eventually be injected by the existing source owner. The art display is deliberately held pending the existing sacred-art approval/rights pipeline.

### Verification performed

- Three upstream source datasets checked: 37 movements, 183 distinct scene keys, 151 distinct Atlas keys, and 488 total reference strings fitting the supported single-passage form in this comparison.
- Saved output re-read from GitHub after each write; counts and nonpublication fields checked, including that 183 scenes have zero location certifications.
- Prototype inline JavaScript passed a syntax compilation check and a mocked DOM interaction smoke test covering first scene, Revelation map-to-vision swap, French toggle and previous-scene navigation.
- **Not done:** external-tile loading, browser screenshot/320–768px visual acceptance, Node-based repository test execution, scholarly verse witness reading, publication gate or release test. No CI or production deploy claimed.

### Next bounded execution batch

1. Execute the standalone Node contract in a repository runner and verify a real MapLibre/mobile browser acceptance at 320px, 390px and 768px, including no network/fallback and map attribution.
2. Conduct actual Catholic text collation and sequential seam review of M20–M37 using the 35-item review queue. Do not set \`readAloudAccepted\` by inference.
3. Complete evidence audits of 183 scene rows in the established 14 scene-chapter batches, adding text-identified actors, chronology basis and supported location class; no coordinate changes until sourced.
4. Reconcile P0 seven stages/12 arcs and P3 37 movements through **verified event/source relationships**, not positional chapter matching. Distinguish main-reading scene coverage from optional scene repertoire.
5. Substitute approved sacred art and canonical Scripture text into the theatre after their respective owners explicitly certify them. Production integration and publication are separate gates.


## P4 first source-witness geography cohort and browser acceptance — 21 October 2026

### Completed

- \`data/research/historia-p4-patriarchs-witness-desk-audit.v1.json\` now contains **25 of 183** scene desk-triage records in the original PATRIARCHS (indices 0–24) batch. The exact ranges in all 25 were found in both installed Genesis CPDV and Douay–Rheims Challoner source witnesses. Both are explicitly **uncollated historical research transcriptions**; matching verse presence does not establish publication, precise site identification or translation parity.
- The 25 records include actor candidates and the **precise limitation of each original geographical label**; no event coordinates are approved or inserted. One priority error is confirmed from the selected verses: scene \`biblical:scene:abraham:021\` (Genesis 21:1–7) places Isaac's birth in Beersheba, while that reference **does not name Beersheba as the birthplace**. The original source scene remains unchanged pending its owner's editorial correction.
- Other source warnings: Genesis 15 does not place the covenant ritual at Mamre; Genesis 14:17–20 does not prove the Melchizedek meeting took place at modern Jerusalem; Genesis 22:2 in both installed Catholic English witnesses describes the "land of vision" and an unspecified mountain; the rescue of Lot spans several biblical places and cannot have one certified event pin. Source-witness and topographic review are separate gates.
- \`tests/historia-p4-theatre-phone.mjs\` now checks the **actual Chromium rendering** at 320, 390, 768 and 1280 viewport widths, offline fallback, previous/next steps, EN/FR controls, Revelation without a terrestrial map, genuine online MapLibre canvas and attribution. \`tests/historia-p4-theatre-citation-contract.mjs\` also locks the 25-Genesis-row audit and its Beersheba correction.
- \`.github/workflows/historia-p4-theatre-review.yml\` is restricted to the P4 research branch; the **latest complete run** [#39560795972](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39560795972) finished with **success** on the source and browser jobs. The prior failed run exposed an overly strict French string assertion, which was corrected; it did not constitute a MapLibre or app production regression. Browser logs include distinct pass lines for offline phone/tablet/desktop responsiveness and online MapLibre canvas/attribution/map-to-vision transitions.

### Remaining editorial and implementation boundaries

- **158 scene rows** beyond PATRIARCHS await the same passage-level and archaeological-evidence review.
- M20–M37 still have no signed-off sequential Catholic witness read-aloud. Their **35 candidate issues** remain triage findings only.
- This theatre laboratory has no certified principal Scripture text integration and no sacred-art import. The existing Mass, Bible overlay, Explore and published Atlas remain unmodified; no production reader, source translation, artwork or coordinate has been promoted.
- Real Chromium acceptance establishes browser functionality for the **four tested states**, not an accepted 37-movement production route, rights certification or a historical-geography sign-off.

Next source batch: DELIVERANCE (scene indices 25–37); afterwards WILDERNESS and COVENANT. Keep actor/place evidence anchored to installed Catholic texts and preserve each scene's original matching status.


## P4 next Exodus and Sinai witness cohorts — 21 October 2026

The source audit now covers **49 of 183 scenes (indices 0–48, four complete source chapter batches)**, with no changes to canonical event IDs, UI, readings, artwork or coordinates:

| Chapter batch | Scene indices | Rows desk-triaged | Witness basis | Remaining caution |
|---|---:|---:|---|---|
| PATRIARCHS | 0–24 | 25 | Genesis CPDV and Douay | Explicitly unlocated birthplace of Isaac, unsupported Mamre and traditional-site assumptions |
| DELIVERANCE | 25–37 | 13 | Exodus CPDV and Douay | Goshen and Rameses often not named within the selected passage; no precise Exodus journey or sea-crossing pin |
| WILDERNESS | 38–42 | 5 | Exodus CPDV, Douay and Crampon | Marah, Elim, Rephidim, wilderness sites not established by modern coordinates |
| COVENANT | 43–48 | 6 | Exodus CPDV, Douay and Crampon | Jebel Musa is traditional/contested; edition-safe handling of Exodus 40 mandatory |

**High-priority versification mismatch:** original scene \`biblical:scene:moses:048\` cites **Exodus 40:1–38**, matching the **38 numbered verses** in the installed French Crampon witness. The installed **Douay–Rheims Challoner and CPDV** witnesses instead have **36 numbered verses**. Thus a request for English \`Exodus 40:37–38\` would be invalid, not evidence that the English texts lack narrative closure. The canonical Bible overlay must use witness-specific coordinate ranges and must never manufacture or numerically align these verses. All three source files remain uncollated against named printed editions. See \`data/research/historia-p4-wilderness-sinai-witness-desk-audit.v1.json\`, especially row 48.

The second source batch is \`data/research/historia-p4-deliverance-witness-desk-audit.v1.json\` (13 scenes); the third is \`data/research/historia-p4-wilderness-sinai-witness-desk-audit.v1.json\` (11 scenes). All rows preserve their source scene key, original Atlas-candidate keys and original match classification. \`tests/historia-p4-theatre-citation-contract.mjs\` now locks the 49 desk-triage rows and the 36/38 English/French boundary. **Geographic or publication approvals: 0.**

**Remaining 134 scene rows** begin with WANDERINGS (scene indices 49–56) followed by INCARNATION, MINISTRY, PASSION, RISEN and the apostolic batches. Carry forward the established chronology and witness conventions. Do not promote the scene research into production from citation overlap alone.


## P4 Wanderings and Incarnation evidence cohorts — 21 October 2026

### Research files committed

- \`data/research/historia-p4-wanderings-three-witness-desk-audit.v1.json\`: **8** WANDERINGS scene rows (49–56). Numbers, Deuteronomy and Joshua reference spans were checked for passage presence in installed Douay–Rheims Challoner, CPDV and Crampon source witnesses. The unusually long Balaam citation (Numbers 22:1–24:25) contains 96 verse entries in each of the three consulted witnesses; this count is not an approved editorial length.
- \`data/research/historia-p4-incarnation-three-witness-desk-audit.v1.json\`: **all 13** INCARNATION scene rows (57–68 and appended index **181**, Holy Innocents). Luke and Matthew passage spans were checked for reference presence in the three uncollated Catholic witnesses. The inherited chronology and the out-of-sequence \`sceneKey\` for 181 remain intact.
- \`tests/historia-p4-theatre-citation-contract.mjs\` now enforces **70 unique reviewed scene IDs** (0–68, plus 181), nonpublication and no-pin gates, the original Exodus 40 36/38 edition discrepancy, Mt 2:16–18 index-181 coverage, and the source-only Ein Karem and Circumcision limits.

### Scene-evidence coverage

| Batch | Original indices | Audited |
|---|---|---:|
| PATRIARCHS | 0–24 | 25 |
| DELIVERANCE | 25–37 | 13 |
| WILDERNESS | 38–42 | 5 |
| COVENANT | 43–48 | 6 |
| WANDERINGS | 49–56 | 8 |
| INCARNATION | 57–68 and 181 | 13 |
| **Total** | **70 distinct source rows** | **70/183 (38.3%)** |

The remaining **113** begin with MINISTRY (69–114), PASSION (115–130), RISEN (131–137), APOSTLES (138–142 and 182), and apostolic missions (143–180). The source indexes are *not* simple story order: 181 is the Holy Innocents in the INCARNATION chapter; 182 is Pentecost in APOSTLES.

### Key provenance and geography findings

1. **Moses' unknown burial site:** Deuteronomy 34:6 explicitly prevents creating a tomb pin. Nebo/Pisgah is named biblically; a modern viewing platform or grave identification is a distinct claim.
2. **Canaan reconnaissance:** Numbers 13:27 names Paran/Kadesh in the source witness, but does not settle a modern Kadesh-Barnea coordinate. Joshua 3 places the crossing in the Jordan/Jericho context without specifying a modern ford.
3. **Nazareth/Annunciation:** Luke 1:26 names Nazareth, not the precise Annunciation dwelling. Matthew 1:18–25 does not itself identify Nazareth as the site of Joseph's dream.
4. **Visitation / John the Baptist's birth:** Luke 1:39 names the hill country and a city of Judah, not Ein Karem. Luke 1:57–80 does not name the modern birth site. Treat Ein Karem strictly as a traditional location.
5. **Nativity, Circumcision, Magi:** Luke 2:4–7 names Bethlehem, but not a confirmed modern sanctuary spot. Luke 2:21 alone has **no stated ceremony location**. Matthew 2:1–12 names Bethlehem and a house (2:11), not a certified contemporary structure. Keep the evangelists' separate staging and chronology.
6. **Flight, return and hidden years:** Egypt in Matthew 2:13–15 is an unlocated region with no endorsed journey itinerary; Matthew 2:19–23 does name eventual residence at Nazareth. Luke 2:39–52 spans Nazareth and Jerusalem and must not collapse into a single location or be automatically harmonised with Matthew's flight.
7. **Holy Innocents:** Matthew 2:16–18 names Bethlehem and its district, not individual victims' locations or a precise historical massacre date. The app must not invent victim pins, grave locations or individual biographies.

Three-way matching passage availability is not translation-level collation, approval of an abridged literary sequence, a theological review or a map-point certification. All 70 scene records preserve the original scene sources and Atlas-candidate status; **approved coordinates added: zero; published changes: zero**.

### Next bounded step

Review MINISTRY as original-source rows 69–114, prioritising Jesus' public teaching and high-impact event/location claims, then PASSION and RISEN. Continue M20–M37 literary seam reviews independently; no acceptance flags may be set solely because scene citation coordinates are present.


## P4 Public Ministry desk audit — 21 October 2026

A complete 46-row source desk audit has been committed as \`data/research/historia-p4-public-ministry-three-witness-desk-audit.v1.json\`, covering original source indices **69–114** with stable \`biblical:scene:christ:*\` keys. All 46 reference spans return verse entries in each of the three installed, uncollated Catholic witness files (Douay–Rheims Challoner, CPDV and Crampon), with **one source-reference end-boundary mismatch** and **two editorially material versification/alignment flags**. Source witness blob SHAs are pinned in the artifact; no printed-edition/translation certification is claimed.

**Coverage rises to 116 distinct scenes of 183 (63.4%)**: original indices 0–114 plus 181 (Holy Innocents). Other 67 source scene rows remain unreviewed at this desk-audit depth. No geocoding or publication changes have been authorised.

### Specific documented issues

- **Mark 4 storm**: source study scene 090 uses \`Mark 4:35–41\`, whereas the current three imported witnesses each contain six numbered entries 4:35–40, with the concluding question in 4:40. A request for 4:41 against these witnesses must not yield fabricated text. Printed edition verification remains open, and the imported witness transcription might have an edition-specific boundary difference.
- **Bread of Life**: scene 097 uses \`John 6:22–59\`, but the statement locating the teaching in the Capernaum synagogue is **6:60 in installed Douay and CPDV**, **6:59 in installed Crampon**. The full source reference has equal count of numbered entries but *not* verse-by-verse semantic identity across editions. No silent alignment or invented site location.
- **Ordering**: source-list scene 095 (walking on water, Matthew 14:22–33) precedes scene 096 (multiplication, John 6:1–15), though **Matthew 14:13–21 precedes Matthew 14:22–33** and John 6 has a similar within-Gospel feeding-then-lake transition. This is a **review flag**, not permission to merge two evangelists' narratives or automatically reorder canonical Atlas events; a within-witness evidence-adjudicated movement ordering is required.
- **Distinct signs**: scene 096 (five thousand) and scene 100 (four thousand) are separate narrated miracles, not versions of one event. Scene 097 is a discourse, not simply a caption for a meal.
- **Separate women and anointings**: Luke 7:36–50 describes an **unnamed** woman and a Pharisee host. John 12:1–8 names Mary and Bethany. Do not automatically identify the two women or merge the episodes from the location alone. If a traditional interpretation is presented, distinguish it transparently from the literary source and canonical identity.
- **Parables**: scene 089 (Sower), 108 (Good Samaritan), and 110 (Prodigal Son) cannot be represented as pinpointed historical incidents, even if their settings contain recognizable places.
- **Restricted precise geography**: Cana and Bethsaida identification disputed; Caesarea Philippi is a district, not a precise grotto; Mount Tabor is a *traditional* Transfiguration location, not named in Matthew 17; Temple scenes have Jerusalem/city context, not a surviving first-century room point; Tabgha is a traditional site for the loaves; the Baptist's execution fortress is not named in Mark 6; Lazarus' tomb identification needs independent attestation.
- **Multiple places/persons**: John's Cana official's child is ill at Capernaum, distinct from where the official petitions Christ; Mark 5:21–43 interleaves the woman healed on the journey and Jairus' daughter; Mark 5:1 eastern shore readings require named-edition and synoptic variant review. John 10's Good Shepherd discourse does not warrant a sheepfold map coordinate.

Every row preserves the original scene↔Atlas candidate classification; its actor list is an **uncertified source review hint**, never a canonical genealogy or impersonation. All 46 indicate zero historical-coordinate approvals and zero publication acceptances. Literary read-aloud review for P3 M20–M37 remains open.

\`tests/historia-p4-theatre-citation-contract.mjs\` now enforces the **116 unique audited IDs**, both edition-specific warnings, the 095/096 ordering hold, parable geolocation rules and all non-publication controls. Continue with PASSION (115–130) and RISEN (131–137); compare distinct Gospel accounts before attaching cinematics or sacred art. MapLibre laboratory remains four-scene only; 46 desk-audited records are not yet runtime scenes.


## P4 Passion and Resurrection scene audit — 21 October 2026

Added \`data/research/historia-p4-passion-risen-three-witness-desk-audit.v1.json\`, completing **23 additional original-source scene rows**, indices **115–137**, comprising **16 PASSION** and **7 RISEN** scenes. Matthew, Mark, Luke, John and Acts selected passage references were found with the complete requested numbered verse ranges in the installed, *uncollated* Douay–Rheims Challoner, CPDV and Crampon witnesses. This is passage-presence verification, **not** proof of their translation fidelity to a printed edition.

The work now covers **139 unique records out of 183 (76.0%)**: scene indices 0–137 and 181. Remaining **44** comprise apostles and mission/source-led journeys (indices 138–180 and appended index 182 Pentecost). The base research collection still owns the scenes; the current P4 branch only stores overlays/audits.

Source-critical findings include:

- **Temple cleansing:** Mark 11:15–19 (scene 117) and John 2:13–22 (scene 074) must not be automatically merged or split into distinct historical events. Preserve evangelist provenance for adjudication.
- **Cenacle:** scenes 119–122 and 133–134 may use Jerusalem/Upper-Room **traditional** contextualization; no passage certifies an extant modern room as the exact site of all six acts or discourses. John 17:1–26 itself does not name a modern room.
- **Gethsemane:** Matthew 26:36 names Gethsemane, but exact prayer stones, surviving garden trees and an arrest point remain unproven from the biblical text.
- **Trial, Calvary and burial:** the text names the praetorium and Golgotha. A modern archaeological identification or street-by-street Via Dolorosa route remains independently uncertain. The Holy Sepulchre is a venerable **traditional** association, not GIS certainty derived from John 19.
- **Resurrection:** John 20:1–18 (scene 131) *contains* the Peter/Beloved Disciple episode John 20:3–10 (scene 132). They can be separate dramatic beats, never two distinct empty tomb/resurrection events in the canonical knowledge registry.
- **Appearance to the disciples and St Thomas:** John 20:19–29 gives no authenticated modern Cenacle room, and the latter appearance is distinct in time.
- **Emmaus:** Luke 24:13–35 names Emmaus, but competing modern identifications mean no certified village point or physical walking route.
- **Ascension:** Acts 1:12 refers to the Mount of Olives, without identifying the specific contemporary chapel/stone footprint.

\`tests/historia-p4-theatre-citation-contract.mjs\` now fail-closes on **139 unique scene indexes**, 23 three-witness passage records, and original Gospel/scene identity safety flags. No literary acceptances, geocodes, art, Scriptures, source rewriting, or production interfaces have been published. The source/test browser CI is handled by \`.github/workflows/historia-p4-theatre-review.yml\` on this research branch.

**Next execution:** complete indices 138–180 and 182, retaining source order and the independent appended Pentecost source record, then address 37-movement literary acceptance and source/art runtime integration separately.


## P4 full 183-scene reference desk census — 21 October 2026

**The preliminary passage-presence, geography and event-identity desk audit now covers every one of the source study's 183 scenes, exactly once.** This is **100% of the planned source-reference census**, *not* 100% editorial readiness, printed-edition certification, manuscript collation, source-text authorship review, archaeology, or publication.

The final research file is \`data/research/historia-p4-apostles-missions-rome-three-witness-desk-audit.v1.json\`. It covers 44 original scene keys: contiguous indexes **138–180** across APOSTLES, FIRST_MISSION, SECOND_MISSION, THIRD_MISSION and TO_ROME, and the appended **182** Pentecost entry. Each has an Acts passage checked for available numbered verse entries in the three installed Catholic research transcriptions, with source Git blob SHAs pinned. The exact source indexes 181 (Holy Innocents) and 182 (Pentecost) have both been reconciled without incorrectly using their numeric offsets as narrative time.

### All scene batches

| Source grouping | Scene keys accounted for |
|---|---:|
| Patriarchs | 25 |
| Deliverance | 13 |
| Wilderness and Covenant | 11 |
| Wanderings | 8 |
| Incarnation, including Holy Innocents (#181) | 13 |
| Public Ministry | 46 |
| Passion and Risen | 23 |
| Apostles, first/second/third missions, voyage to Rome, and Pentecost (#182) | 44 |
| **Entire 183-scene source catalogue** | **183** |

**Four original-scene passage-boundary hazards now documented across the census:**

- **Exodus 40:1–38**: the current CPDV and Douay witnesses have 36 numbered verses, Crampon has 38; a different French/English versification boundary, not permission to supply nonexistent English 37–38.
- **Mark 4:35–41**: all three imported source witnesses include 4:35–40 (6 entries) and lack 4:41 as a separate entry. Print-edition comparison is required.
- **Acts 14:20–28**: all three imported source witnesses contain only Acts 14:20–27 (8 entries).
- **Acts 19:23–41**: all three imported source witnesses contain only Acts 19:23–40 (18 entries).

**One additional cross-edition verse alignment issue:** the Capernaum synagogue statement in John 6 occurs at **6:60** in the installed Douay and CPDV witnesses and at **6:59** in the installed French Crampon. Consequently equal row counts alone do not establish verse-by-verse bilingual parity. Do not invent verses, blindly apply cross-edition boundaries, or silently alter canonical Scripture sources.

### Narrative and geography corrections queued

- Acts 18:23 names the Galatian and Phrygian regions, not Pisidian Antioch; source scene 165's place label is therefore unsupported by that selected passage and must not yield a Pisidian Antioch event pin.
- Acts 13:4–12 spans several Cyprus stages, not a single point in Paphos; similarly Acts 18:18–23 and Acts 27:1–12 span multiple locations. The source chapter scenes can drive an evidence-qualified *named-port itinerary*, never an imagined literal ship track or exact 1st-century road.
- Acts 27:13–44 shipwreck remains unlocated: the UI must not fabricate a Mediterranean wreck marker or identify the physical vessel route. Acts 28:1–10 names Malta, not an authenticated modern landing beach.
- Acts 28:13–14 overlaps Acts 28:11–14; these are two reader beats from one segment, not duplicate canonical port-arrival incidents.
- Acts 2:1–41's Pentecost is placed in Jerusalem and does not certify the current Upper Room as the exact location of the coming of the Holy Ghost.
- The original 183 source scene identifiers and Atlas candidate statuses remain unchanged, and no source toponyms, regional bounds or biblical-genealogy person records have been overwritten.

\`tests/historia-p4-theatre-citation-contract.mjs\` now requires **all original indexes 0–182, exactly once across the eight desk files**, rejects false geolocation approvals, and locks both Acts short-reference hazards. The real-browser theatre lab remains a four-state prototype and is separate from this editorial corpus.

### Meaning of "complete"

The following milestone is **complete**: the source-research catalogue of 183 scenes has a preliminary verse-coordinate/witness-presence and geography-confidence desk record for every item.

The following milestones are **not complete**: verifying every verse string against exact print editions; approving actor identities and source chronology; deciding whether 183 optional scenes are sufficient for a continuous 37-movement Theatre; geospatial certification and art rights; adapting every scene for the bilingual reader; completing a read-aloud review of the full 37-movement narrative; integrating source-driven MapLibre scenes in production. The 183 research records are **not** 183 release-accepted scenes.

Next P4 sequence: move from **coverage** to **adjudication** by prioritising the five versification/alignment hazards above, the 35 M20–M37 narrative-seam questions, passage-overlap identity and staging conflicts, and the separate source-owner art and geolocation approvals. No need to repeat the 183-row preliminary desk census.


## P4 verse-boundary and M20–M24 adjudication — 21 October 2026

**Research-engineering result:** source desk audit remains 183/183 complete; literary acceptance and print-edition certification remain incomplete. Two additional decision datasets provide the first edition-aware resolution and bounded literary seam corrections **without changing P3 verse selections or the production Scripture reader**:

1. \`data/research/historia-p4-edition-specific-reference-adjudication.v1.json\`: five source-verified discrepancies, with pinned source blob SHAs and independent Catholic Challoner online evidence. **For current imported witnesses only**, use Exodus 40:1–36 (DR/CPDV), 40:1–38 (Crampon); Mark 4:35–40 in all three; Acts 14:20–27 in all three; Acts 19:23–40 in all three. John 6:22–59 has the **same numeric bounds but different substantive final verse content**; the Capernaum synagogue line is John 6:60 in DR/CPDV and 6:59 in Crampon. Preserve the source 183-scene references as historical research citations, not runtime display slices.
2. \`data/research/historia-p4-m20-m24-literary-seam-adjudication.v1.json\`: a first source-anchored review of **five** of the 18 held late movements:
   - **HS-M20 HIGH:** Beat H51-03 (Mark 1:14–15, after the Baptist's imprisonment) currently comes before H52-01 (John 1:35–51, with the Baptist still addressing his disciples). Recommend placing the John beat *before* Mark 1:14–15, pending an editor's timeline and read-aloud check. If readers begin John 1:35, the "next day" cue also needs the 1:29–34 context reviewed, not an invented preface.
   - **HS-M21 scope:** "Teaching and signs" overpromises because the selected Scripture contains teaching only. Recommend accurate retitle, **or** independently approve a selected sign such as Mark 2:1–12 rather than presenting an editorial-context beat as Bible text.
   - **HS-M22 HIGH:** John 6:26–35 joins 47–59 while omitting 36–46, including the theological objection and the Father's drawing at 44–45. Evaluate a source-economical bridge without suppressing doctrine or silently importing a nonselected verse. The scene's English/French location-verse mismatch must be respected.
   - **HS-M23 staging:** The chosen Matthew 16:13–28 and 17:1–9 preserve the six-day transition but comprise confession, Passion prediction, and Transfiguration: three separate visual beats with one unchanged Scripture-witness stream; Tabor remains a *traditional* site.
   - **HS-M24 HIGH:** John 11:20–27 explicitly leaves Mary at home, while the next selected segment 11:32–35 depicts her already at the Lord's feet. John 11:28–31 includes Martha summoning Mary and her movement. Review the smallest agency-preserving bridge (at least verses 28–29). The separate John 11:45–53 Passion-plot candidate **HS-CF-05** remains held.

**Safety contracts:** all five references can now resolve to an explicit source-specific research slice, rather than being incorrectly labeled missing Bible text. There is **no full inter-edition semantic mapping, named printed-edition certification or permission to synthesize or silently copy Scripture**. The M20–M24 findings are recommendations only: movement beat order, titles and verse units have not been changed. The existing 35-question M20–M37 queue remains the authoritative review backlog. The research data and \`tests/historia-p4-scripture-adjudication.mjs\` verify all five edition slices and the source cues for these five continuity decisions; the P4 GitHub Actions source job runs that new check alongside the existing source-contract and Chromium browser jobs.

Next: complete the M25–M37 high-priority literary and scene-identity reviews, then seek explicit source-owner approval to apply selected necessary beat order/verse changes with diff and witness provenance. Only after that should the 37-movement MapLibre/story folio be expanded using approved Scripture and art. **No new production integration is authorized by this checkpoint.**


## P4 M25–M37 seam recommendations and Scripture economy — 21 October 2026

The last 13 late movements now have a complete source-anchored **desk adjudication** in \`data/research/historia-p4-m25-m37-literary-seam-adjudication.v1.json\`. Together with the earlier \`...m20-m24-literary-seam-adjudication.v1.json\`, all **18 movements M20–M37** have an individually described issue/decision proposal. This *does not* constitute oral acceptance or an authorized P3 scripture-selection change. Source witnesses for Matthew, Luke, John, Acts and Revelation were consulted directly in the three installed Catholic research transcriptions; source Git SHAs are retained.

Priority issues:

- **M28→M29, burial:** John 19:17–30 ends at the Cross and M29 opens John 20 with an empty tomb. Held \`HS-CF-06\`, **John 19:38–42**, is the least invasive already-identified burial witness for review; no new Gospel narration.
- **M29, tomb blocking:** Existing jumps from John 20:3→6 and 20:9→11 omit **20:4–5** (the other disciple's arrival) and **20:10** (the disciples depart); propose 3 Scripture verses for actor continuity, not duplicated Resurrection events.
- **M31, Pentecost and martyrdom:** Acts 2:21→37 omits Peter's explicit kerygma 2:22–36. Proposed economical desk option is **2:22–24 and 2:32–36** (eight verses), alongside held \`HS-CF-08\` Acts 7:51–53. Crucial **edition semantic split**: Stephen's final prayer and death are in **Acts 7:59** in installed Douay/CPDV, but **7:60** in Crampon. They must not be silently linked by the same verse number.
- **M32, Saul, Ananias, Cornelius:** Candidate Acts 9:15–16 preserves Saul's appointed mission; Acts 10:7–8 explains messengers travelling from Caesarea to Peter; 10:30–32 gives Cornelius's response to Peter's question. Actor coherence and verse-economy still await an actual selected-text read-aloud.
- **M33, Gentile mission:** Candidate Acts 14:26–27 (edition-safe current witness coordinates) is the concise apostolic return and Gentile report between missionary departure and the Jerusalem Council. Existing scene records, especially Cyprus/Derbe, remain optional source-linked theatre, not geocoded route fabrication.
- **M37, New Jerusalem:** Revelation 22:1 uses an antecedent absent from the selected Rev 21:1–7. Candidate Rev 21:9–10 names the angel showing the holy city. Candidate Rev 22:20–21 would preserve the actual final biblical ending if the theatre elects to conclude the *book*, rather than simply the selected vision. All Revelation staging stays non-terrestrial.
- **M25/M36:** No additional Scripture required for their currently selected direct narrative/vision; short accurately labelled transitions or visual genre treatment may suffice.
- **M26/M27/M30/M34/M35:** Other decisions concern the Supper/final-teaching title and held Johannine promise, Judas/Pilate omission, Ascension prior promise, Paul's Rome audience/arrival, and heavenly-throne antecedent. Each remains a held option with source provenance.

The separate \`data/research/historia-p4-late-movement-bridge-verse-budget.v1.json\` compares **18 M20–M37 movements** against imported **Douay** source verse coordinates, deduplicating overlapping selected passages:

| Audit-only budget | Numbered Douay verse entries |
|---|---:|
| Currently selected | 444 |
| Increment if every listed *optional* source bridge were accepted | +69 |
| All-candidate hypothetical | 513 |

These are **unique verse-entry counts**, not reading time/word count, not printed-edition collation, and not gospel-by-gospel bilingual equivalence. Proposed additions are **15.5%** of the baseline, which argues for selective editorial decisions rather than treating all candidate material as mandatory. M20's order-only correction, M21 retitle and M23 three visual beats add zero verses. Two counted source-numbering areas (M22 John 6 and M31 Acts 7) have explicit **edition semantic matching holds**.

The standalone \`tests/historia-p4-m25-m37-source-seams.mjs\` verifies all 18 desk records, original P3 verse ownership, held candidate state, Douay source anchors, Martyr Stephen's 59/60 split and the +69 verse arithmetic. The same P4 research-branch GitHub workflow runs it with the existing P4 source contracts and browser laboratory. CI status is determined by the run itself; this checkpoint does **not** imply publication readiness.

**Editorial next gate:** decide *one by one* which high-priority source bridges are necessary for a continuous self-explanatory Catholic Scripture presentation; collate exact printed English/French texts and read them sequentially. Only then prepare minimal changes through the existing P3 owner (#1345); retain the 37-movement IDs, independent canonical Atlas event ownership, and never fork the scene census.
