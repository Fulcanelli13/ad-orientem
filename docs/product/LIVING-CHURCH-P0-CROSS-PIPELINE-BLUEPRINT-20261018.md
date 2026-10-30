# The Living Church — P0 cross-pipeline experience contract

**18 October 2026 · REVIEW ONLY · not public content, not a launcher, not a merger**

## Objective

Build one visitor experience across **Visible Mass (PR #1309)**, **Ask the Church (PR #1391)**, the **St Pius X Catechism owner**, and already published **Mass Explorer / Apostolate / Prayer** owners. It is not one large data merge. Canonical source and editorial publication decisions remain with each module.

The journey is: *inspect an authentic church object → optionally ask a guide → inspect source-owned explanatory material → optionally open a published native destination → return to the same photograph, selected object, question, active guide and route without replay.*

## Domain ownership — no new duplicated source

| Domain | Source owner | This contract may store |
| --- | --- | --- |
| Original sanctuary photo, exact hotspot and panoramic camera | Visible Mass scene and six-object registry in draft #1309 | Current scene/photo IDs, confirmed object ID, camera pose supplied by original scene owner |
| Four non-linear trails, visited/skip state and VMQ questions | Visible Mass dialogue director / question registry in draft #1309 | Current trail ID and current question ID **only**; never mark an unanswered question read |
| General objectives and 26 situation paths | Ask the Church V7 engine in draft #1391 | Never duplicate the objective or the conversation transcript; keep external owner reference |
| Sacristan | Object, glossary and available certified instructions | Character selection only; no manufactured speech or approved historical identity inferred |
| Monsieur le Chanoine | Certified Mass Explorer, liturgical/historical sources | Character selection only; specific source ID required to claim a referral |
| St Pius X | Existing 433-question Catechism owner / source editions | Disclosed historical simulation, exact original Q&A through owning module; no paraphrased quotation |
| Scripture, Saints, geography and source art | Their own canonical source registries and release gates | Source references only |
| LIVE 65 / Simple / Missal | Existing Mass reader | **Nothing.** No new guide, Mass rubric or runtime state in this cross-pipeline layer |

The Sacristan and Canon visual references remain user-selected **S5** and **C3**, but this milestone does not insert unverified image assets or impersonation voices. St Pius X character use requires the existing historical-simulation disclosure. Character selection is **not a source permit**.

## Shared contract implemented

`src/learn/living-church-context.js` is a dependency-injected, review-gated context engine. It depends on owner-provided, fail-closed verifiers: `verifyScene`, `verifyObject`, `verifyQuestion`, `verifyTrail`, `verifyGuideReferral`, `authorizeDestination`, `openDestination`, `restoreScene`.

It stores only scene/photo/pose, object and question references, guide identity, current trail, visitor mode (Explore / Discover / Understand) and selected interface language. It does **not** store free-text messages, private circumstances, confession data, theological answers, source quotations, visited/skip arrays, person names or invented Mass actions. The original director still owns visited/skipped state.

**Review gate:** `reviewEnabled()` must explicitly return true to enter a scene, switch guides, select a question or open a native destination. Feature code is never a public-availability decision. Native `authorizeDestination` must verify original route publication and any object→moment source relationship; passing `AO.CARD.010` does not by itself certify a liturgical action at Brompton.

**Handoff:** the engine locks navigation before asynchronous source authorization, verifies the existing native destination result, issues a one-time in-memory return token and delegates exact photo/camera/focus restoration to the original scene owner. Failed returns retain the token for safe retry. It cannot synthesize a destination or claim completion from a navigation button click.

**Referral:** switching characters is allowed without authorising an answer; any advertised source-to-source referral must carry an exact original `sourceRef` and pass `verifyGuideReferral`. A fictional voice, alleged personal opinion of St Pius X, or unsupported mapping to Q&A is forbidden. Same design system and contextual folio should be used in the later UI, not floating chat bubbles.

## Pilot: source-identified altar → Mass Explorer

1. Visible Mass at **BROMPTON_ALTAR_2019_B** has the **AL01 high altar** original photo object, linked to original glossary **G404** (research photo bindings still await real-device approval).
2. The existing source question **VMQ-0001** asks why the altar is important. Its research answer must remain behind #1309's publication gate.
3. The visitor may choose Sacristan or Canon; this engine adds **no** new answer. The original guide and original question renderer remain responsible for relevant source material.
4. The source-restricted #1309 P5 candidate edge AL01 → **AO.CARD.010** permits **research preview navigation only**, explicitly NOT proof that the photograph shows an Offertory action. An owner-approved native `learn.mass_explorer` destination can be opened; the Mass Explorer is the sole content owner.
5. The return callback must restore exact photo/pose, AL01, VMQ-0001, current trail and character context; original VMQ visited/skip semantics remain untouched.

An additional research demonstration may refer AL06 crucifix to the Canon, or to the St Pius X Catechism only when an **exact source-backed Catechism question mapping** exists. Do not invent that mapping to complete a demo.

## Integration strategy across active branches

**P0 (this draft PR, independent of #1309/#1391):** commit this contract, test source-gated state and handoff behavior, keep it unused by the public app.

**P1 (stack only after stable review branch heads):** adapt #1309's original `visible-mass-dialogue-director.mjs` and photo viewer to supply verified scene/object/question/trail context, without copying its arrays into the new engine. Add a narrow same-origin iframe-to-parent return handshake; no wide exposure of `AO_MODULES` or Mass runtime. Require source/routing evidence for each suggested cross-guide referral.

**P2:** adapt #1391's `ask-church-objective-engine.js` as the *objective classifier and handoff orchestrator*, not a second theological answer database. Its seven objectives and 26 branches remain the owner. Preserve existing 8/8 real-shell acceptance and the return-button obstruction regression.

**P3:** three character-facing folios with fixed approved sprites, disclosure, source badges and fallback. Keep the original photographic scene visible; offer Explore freely, Skip suggestion, Skip path and Switch guide without resetting original director state. The contextual guide must never be compulsory.

**P4:** real combined app-shell, 320/390/1280px and actual-device acceptance. Required checks: camera source, original photo licence, skip/read invariants, exact return focus after a native handoff, sibling guide referral only with precise source, no research-only answer publication, EN/FR controls, no overlay of the global ribbon or Confession, and zero changes to LIVE/Simple/Missal reader.

## Unresolved decisions and release gates

- **No avatar image bank committed to this branch:** approved S5/C3 sprites and the approved five-expression St Pius X set require file ownership/asset-rights confirmation before app packaging.
- Original VMQ source texts, 97 historic/functional research answers, four held questions, real photograph rights and trial captions remain in #1309; this PR certifies none of them.
- PR #1309 and PR #1391 each modify Formation code, and main continues evolving; do not merge branches or copy source data until a fresh overlap and API audit is performed.
- A source-appropriate St Pius X Q&A referral cannot be asserted solely from a photo object or character switch.
- A unit test with authentic ID spellings and simulated authority callbacks is **not** an integrated native browser acceptance. Real-path integration must be tested independently when those owners are available on one branch.
- No public launcher, no automatic AI theology, no invention of historic dialogue, no merge, no production deploy without explicit editorial/product approval.
