# The Visible Mass — Four free-form guided trails (editorial decision sheet)
Date: 18 October 2026
Status: **RESEARCH NAVIGATION DESIGN ONLY** — not an active dialogue UI, not new answers, not publication permission.

## Product decision

Use **one shared, non-linear network of canonical question IDs**, not four scripts or four progress tracks. A visitor may select any visible object before, during or after a tour. The guide is an optional narrator, **not** a fictional priest or historical personality and not a general AI chat. The six photographed Brompton subjects, canonical 134 sanctuary questions, existing G### glossary entries, 97 held Phase 1.5 historical drafts, and existing published Mass Explorer remain content owners.

Machine-readable source of this decision: [GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json](GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json). The graph contains only *IDs, optional candidate transitions and state-policy flags*. It duplicates no doctrinal question wording, answers, image bytes, 48-card LIVE reader, or Mass actions.

## Four proposed opening trails

| Entrance | Six/seven recommended stops (original VMQ IDs) | Why it feels different |
| --- | --- | --- |
| **My First Latin Mass** | **0062** sanctuary steps → **0056** identify rail → **0001** high altar → **0013** crucifix → **0005** altar reverence → **0057** traditional Communion rail | Observation and practical orientation; not a posture/eligibility tutorial |
| **Secrets of the Sanctuary** | **0052** identify retable → **0053** retable versus altar → **0017** candlestick furniture → **0019** meaning of light → **0021** are all six necessarily lit? → **0016** history of crucifix → **0006** high/side/freestanding altar | Visual comparison and the pleasure of noticing objects previously missed. Never infer universal lit candle counts from photo |
| **The Mystery of the Altar** | **0013** why crucifix → **0014** Calvary and sacrifice → **0002** altar as table/sacrifice → **0003** Old Testament/early Christian altar → **0005** altar reverence → **0058** rail and sacred boundary → **0057** Communion at rail | Theological connections suggested by visible material things, not invented historical dramatization |
| **Follow the Priest** | **0065** sanctuary steps versus predella → **0063** practical and symbolic steps → **0005** altar reverence → **0002** altar/sacrifice → **0014** crucifix and Calvary → **0057** Communion | *Why actions take place* only where backed by actual source questions. No photographic priest reenactment or automatic merger of Low, Sung, Solemn actions |

A route's ordered stops are **editorial recommendations, not requirements, prerequisites or a linear event clock**. Each subject has its original context and may be reached from any other visible object. Existing Guide IDs must be handed to the real Mass Explorer using the P5 review gate. Never silently claim the exact 1962 gesture/moment from these historical question texts.

## Strong crossovers — prioritize these six for UX

1. **VMQ-0013 → VMQ-0014:** The visitor identifies the crucifix; the guide can offer its relationship to Calvary. Crosses *First Visit* / *Secrets* into *Mystery*.
2. **VMQ-0001 → VMQ-0002:** The visitor has understood why the high altar matters; an optional change from physical to theological inquiry. *First Visit* → *Mystery*.
3. **VMQ-0053 → VMQ-0001:** A retable is physically behind but not identical to the altar; clicking the altar becomes an intuitive visual pivot. *Secrets* → *First Visit*.
4. **VMQ-0005 → VMQ-0065:** The guide can invite the visitor to inspect where the priest approaches the altar; the visitor elects a spatial/cinematic viewpoint. *Mystery* → *Follow the Priest*. This is **not** source certification of an exact action chronology.
5. **VMQ-0017 → VMQ-0021:** Six candlesticks are seen, but the viewer should not conclude all are always lit. A genuinely investigative follow-up; **not** a blanket candle-count rule.
6. **VMQ-0063 → VMQ-0056:** Understanding sanctuary steps leads naturally to the communion rail nearby. *Follow the Priest* → *First Visit*.

Seven other editorial edges are recorded in the JSON for review; these are deliberately *not* mandatory automatic hops. In particular, `VMQ-0019 → VMQ-0014` (light symbolism → Calvary) is an evocative but potentially forced theological segue. It should remain low-priority or be dropped if it feels artificial in actual use.

## Short optional investigation and explicit research holds

- **VMQ-0059** (history of Communion rails) is a short side investigation, not an additional full trail.
- **VMQ-0004, VMQ-0018, VMQ-0061, VMQ-0064** are indexed from the existing VMQ owner but **lack an exact research answer** at this stage. They must **never** be served as automatically answered tour dialogue. A user who asks may see the question and an explicit unavailable/research gate.
- All **20** currently researched route-pool questions are themselves Phase 1.5 **research drafts awaiting publication approval**. A draft graph cannot turn them into published doctrinal responses.

## State and freedom contract

- **Skip this suggestion**: remove it only from *this trail's next recommendations*, not from the global discovery record. It remains accessible whenever the visitor taps the object.
- **Skip this trail**: hide its prompts; *do not* mark its stops read, ban shared questions from other trails, or reset the selected photographic viewpoint.
- **Switch trails**: preserve read question IDs globally, save each trail's cursor/skips separately, retain current photo/object/question. By default suggest unseen content, not already read content.
- **Dismiss guide**: hide dialogue and preserve the exact scene pose and selected object. The visitor can always show it again.
- **Revisit**: explicit selection of a previously read item always works; no automatic replay. Skipping is not failure; there is no required finale, quiz result or streak.
- **What counts as read**: opening the original source-owned question/answer detail, **not** merely looking at its photographic object or scrolling past a dialogue teaser.
- **New user**: offer the four starting interests, plus *Explore freely*. A resumed session offers *Continue*, *Choose another trail*, *Something not yet explored*, or *Explore freely*.
- **Completion**: a trail can run out of new recommendations without closing the church. Never reset all tours to step one when the user switches back.

## Presentation constraints

The existing Ad Orientem home/bottom navigation and dark, liturgically responsive aesthetic stay intact. Dialogue should occupy a **compact folio over genuine photography**, with fadeable choices and source/camera continuity. Avoid NPC character sprites, cartoon art, fake 3D clergy, dialogue barks after every tap, large numerical chapter badges and theatrical religious reconstruction.

These records attach to six exact-camera photo hotspots on `BROMPTON_ALTAR_2019_B`; `AL19` (retable) and `SN04` (steps) currently have no certified P5 Mass-action edge. All transition meanings are editorial; photograph credits and other-venue Mass witness distinctions must remain visible. Continue to distinguish all 30 inventory objects from the six currently visible exact-photo hotspots.

## Deliberately out of scope until this map is approved

- No new public tour UI or fifth independent prototype.
- No free-form chatbot backend or generative answer text.
- No isolated storyteller content registry.
- No autonomous Low/Sung/Solemn priest simulation or reuse of the B002 objective graph for Missa Cantata.
- No bulk addition of visually unverified hotspots for the other 24 sanctuary objects.
- No rewriting of the Catechism of St Pius X or impersonated character voice.

## Acceptance before scripting

Editorially inspect the **six strong crossovers** above and remove artificial links. Confirm the distinct reason each trail exists, whether the first two scene pivots actually feel natural and that nobody must replay a shared stop. Then implement one **non-linear three-object slice** (high altar, crucifix, Communion rail), using original VMQ IDs, retained 360° camera, skip/switch/return semantics and research publication gates. Only after that expand to the other three photographed hotspots.


## Implementation continuation — six source-mapped hotspot trails (18 October)

The previous three-photo *implementation slice* is now extended within the **same original sanctuary-hotspot-pilot.html** to every source-mapped Brompton subject: `AL01` high altar, `AL06` crucifix, `AL07` candlesticks, `AL19` retable, `SN02` communion rail, and `SN04` sanctuary steps. The four route identities and canonical question graph are **unchanged**; the director simply admits their original VMQ entries on these photo marks. All six photo coordinates **still require real-device acceptance**.

The existing read-only `visible-mass-dialogue-director.mjs` tracks actually opened source-backed question IDs globally and records skipped suggestions separately per trail. `visible-mass-dialogue-folio.mjs` now keeps all four trails selectable even after a complete trail is dismissed; the original viewer owns the photograph pan, original question text, historical draft explanation and source references. Session restoration keeps prior read/skip state when reentering the reviewer. The original source photo is not manipulated, and we have introduced **no reenacted priest or Mass actions**. The smallest photographic cue is a restrained marker highlight, cleared on ordinary free exploration. Guided jumps use photo-native panning and respect reduced-motion preference.

The 24-question pool is a **research pool, not 24 published answers**. Twenty exact questions have Phase 1.5 answer drafts; four were explicitly held. The canonical questions, historical drafts, glossary definitions, photographed hotspot IDs and Guide relationship review gates remain owned by their original sources. There is **no authored fictional script** and no St Pius X impersonation or chatbot backend.

Automated QA: `tests/visible-mass-guided-folio.mjs` validates six-object routing, published-answer gates, skip versus read, route switching and session resume. The extended `tests/visible-mass-sanctuary-photo-browser.mjs` exercises the retable, candlesticks, crucifix and steps, following/skipping/switching/whole-trail abandon/reload on both phone and desktop Chromium. This is browser regression coverage; it **does not** certify exact hotspot position on real devices or publication readiness. Check the latest commit's CI status before claiming all workflows passed.

**Next design decision:** test whether the compact horizontal trail chooser and quiet dialogue folio feel natural on an actual phone, including step and Communion-rail markers above the object sheet. Then review which of the thirteen proposed crossovers are truly useful; only after that consider optional natural-language "Ask the Guide" retrieval. No seventh hotspot without independently matched photography.
