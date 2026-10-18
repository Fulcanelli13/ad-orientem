# The Living Church — P5 source convergence and release acceptance
18 October 2026 · editorial and technical hold · not a public launch

## What is actually integrated
The source-owned cross-pipeline experience remains staged and review-only. Its original running surfaces are the Visible Mass photographic viewer (Brompton high altar and separately sourced 360° views), canonical Ask the Church objective engine, original St Pius X 433-question Catechism, and published Mass Explorer. Three fixed approved illustrated guide identities — Sacristan, Canon, St Pius X — are presented in the P3 visual-novel folio, with St Pius X historical simulation disclosed. Return preserves source scene, camera, selected original object, VMQ and original guided-trail state.

P0 #1395 through P4 #1406 were tested on the stacked branch, but **NONE is merged into main**. P5 is a scoped convergence draft stacked on P4, not a substitute production merge.

## Exact upstream reconciliation accomplished by P5

| Source owner | Exact reviewed source snapshot | Reconciliation | Limits |
| --- | --- | --- | --- |
| Visible Mass #1309 | `fe9fb6de79faec7f716ec8ff975ca88ec4e152b0` (M5 10-hunk baseline from `1685bb9`) | Applied all ten post-P1 M5 image/360 loading differences in the **original** `sanctuary-hotspot-pilot.html`, retaining P1 context and VMQ trail director. Copied nine source-owned M6 assets and updated M4 regression tests **by original Git blob SHA**. | M6 remains research only. No invented hotspots or object photographs. |
| P0 shared context #1395 | `c9cc400144c657cf8726545117469cf04adfd791` | Shared context file is **byte-identical** to source Git blob `19fb33d1aa0924b4aca31a02a5390a5b512779cd`. | Single original registry; no secondary answer store. |
| Ask the Church #1391 | `374e34f9032665c315e5eda95e99c71784978e39` | Objective engine, native handoff, digest and route survey are **byte-identical**. Original guided preview has three explicit host integration changes only (hide, focus, one managed return button). | All 7 objectives and 26 paths retained; external routes remain held without exact return. |
| P4 Catechism #1406 | `04a2caffbec08cc6185a56085340643304ec4b07` | 433 verified English source question titles and native original answer handoff preserved. | Unverified French translations are not invented or published. |

Original M6 atlas state in the reconciled owner snapshot: **170 objects in 13 zones**, **56 research image/source records** (mixed types and roles), **45 objects with a photo candidate or exact hotspot**, **125 still needing a qualifying photograph**, including **2 of the 30 sanctuary pilot objects**. These are research records, not publication-approved images; six Brompton hotspots belong to a *single* original photograph. A historical illustration or a reference image from another venue is not proof that an object appears in a given sanctuary.

## Conversation deduplication — same P5 PR, no new phase

P5 now removes the genuinely duplicate Ask objective session. Previously `ask-church-guided-preview.js` and `living-church-character-folio.js` each independently called `createAskChurchObjectiveEngine`, allowing diverging objectives after switching presentations. The P2 integration adapter now creates **exactly one** lazy canonical engine per mounted visitor session. Both renderers receive that engine; the character folio does not create one. Guide/persona switches, original module handoffs and returns preserve the same objective/branch/turn data. Closing the Living Church review disposes that session; reopening begins a new one.

With character review explicitly enabled, the approved Sacristan / Canon / St Pius X folio is the **single visible conversational presentation**; the generic Ask window is hidden. Without the character review flag, the existing P2 Ask-the-Church experience remains unchanged. There is one source survey fetch per review session, one original source-owned engine and one native return button; original photo/VMQ and 433-question Catechism remain independent canonical owners.

P5's integrated browser job is reduced to the original M6 offline atlas plus **one** representative 320/390/1280px full journey (character objective, original Catechism, Mass Explorer, exact return). P1, P2, P3 and P4 continue to own their focused regressions in their respective workflows; there is no need for P5 to re-run all four full browser journeys. One owner for each test concern is preferred to repeated look-alike acceptance scripts.

## Live upstream landing check — 18 October 2026

The independent P3 character branch advanced after P4 was cut. P5 therefore imports **only four exact P3 source-owned files** from its reviewed `7c1869616aae8bf9b666730277dee964ca476822` snapshot: the amended three-character metadata, the Canon referral *contract*, the contract assertion and its CI workflow. This is a preservation/reconciliation step, **not a second apologetics research pipeline**.

The original Canon apologetics/Formation work is owned by `Fulcanelli13/folio-core` [draft PR #36](https://github.com/Fulcanelli13/folio-core/pull/36). Its ledger references 534 historical candidate identities (519 + 15), not 534 public, answered or newly authored dialogues. Source review records zero certified historical-quotation transcripts and zero approved public Canon answers. Its own CI was not certified at the inspected `0709b2f2b43307c6ab6fef7b08bedfe07095513d` revision. The local P3/P5 Canon contract retains **no answer text** and has **no public answer route**; P5 tests explicitly block any change to these holds.

Current upstream dependency state: [#1395](https://github.com/Fulcanelli13/ad-orientem/pull/1395) P0 shared context, [#1397](https://github.com/Fulcanelli13/ad-orientem/pull/1397) P1 original-photo adapter and [#1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406) P4 character extension were reported *not auto-mergeable* by GitHub on 18 October; other named draft PRs reported mergeable. These are **base-branch convergence blockers**, not permission to force a merge. The original M6 research branch has newer research-only changes after P5's frozen M6 source snapshot. Leave those changes with their owner until the next agreed checkpoint.

Landing conditions: source owners #1309 / #1391 / #1395 must be reviewed against current main first; #1397 must be rebased against the final owner viewer; #1404's Canon source contract must precede P4; the P2–P5 integration should then be replayed against the owner branches with its single Ask session intact. Only after this should any PR change from draft to merge-ready. No automatic downstream rebasing or research copying.

## Current acceptance matrix

| Scope | Verified automated? | Required human/owner approval |
| --- | --- | --- |
| Original photographic scene & 4 optional guide trails | Yes: P1, P2, P4 browser gates | Image rights, source citations, no implied 1962 ceremony in a photograph |
| Original Ask 7 objectives / 26 situations | Yes: original unit tests, real-shell handoff | Hold all native destinations without exact same-source return |
| Sacristan, Canon, St Pius X approved sprite bank | Yes: exact 15 WebP assets and 3-character interface | Human rights/license signoff before public distribution, aesthetic acceptance |
| St Pius X Catechism | Yes: 433 source refs; native answer at 320/390/1280px; same-photo return | Do not attribute generated prompts to the historical pope; check original-language witness/translation |
| Mass Explorer navigation and return | Yes: canonical native module and source restoration | Original Mass Explorer source and formation editorial approval |
| Latest M5 photo loading/zoom behavior | P5 re-integrated upstream source; new CI checks required | Verify on actual low-power hardware and photo bandwidth |
| M6 object/image atlas | Original M6 contract, plus P5 source blob pins | Qualifying licensing, venue identity, provenance and object coverage |
| R17 LIVE 65 / Simple / Missal | **Out of scope**; this branch must not modify them | Separate Mass reader validation before final merge |
| App release / Play Store | **Not approved** | Real Android device tests, keyboard/assistive-technology pass, contributor/editorial signoff, complete branch reconciliation |

## Recommended merge and release order — NOT performed

1. Reconcile the original source PRs #1309, #1391 and P0 #1395 against **current main**, keeping their canonical ownership and preserving their research/publication gates. Resolve PR merge conflicts and owner review first.
2. Once source owners converge, replay/rebase #1397 (P1), #1400 (P2), #1404 (P3), #1406 (P4), then this P5 convergence commit in order. Avoid merging stale owner copies over newer source revisions. Retest combined native context and unchanged reader.
3. Run desktop and phone screenshot acceptance and physical Android devices with real image/network conditions. Verify no overlay covers the native Catechism/Confession, zoom/scroll stays stable, screen reader focus, gesture access and 320px layout.
4. Obtain approval for historical simulation disclosure, original doctrinal verbatim transcription, retained Catechism witness and actual artwork/photograph licences. The four held VMQ question candidates and historical answers stay unpublished until source certified.
5. Only after **all** gates clear, prepare an explicit release PR and ask for deployment authorization. This document or passing CI never authorizes release.

The machine-readable lock `data/learn/living-church-p5-convergence-lock.v1.json` has 20 source blob pins, ten source-viewer patch hunks, latest fifth-batch M6 source snapshots and nine explicit false publication gates. Fail on source drift; never auto-update a source pin or silently declare approval.

## Frozen owner-snapshot policy
M6 research is continuing independently. P5 imports through fifth batch at source owner `fe9fb6de79faec7f716ec8ff975ca88ec4e152b0`, then freezes that provenance as the acceptance baseline. Changes after that commit belong to the M6 upstream pipeline and require a deliberate future reconciled update, not an automatic rewrite of reviewed P5 tests. The P5 integration work does **not** approve or publish any of the 56 atlas image/source records.


## Canon and Catechism combined-source reconciliation — frozen review integration

The P4 Catechism branch was reconciled through [merge commit `b2a83094`](https://github.com/Fulcanelli13/ad-orientem/commit/b2a83094ebe62be42e40ef1e288c8434fc91f982): it retains the original St Pius X 433-question native reader and the P3 **research-only** Canon editorial folio from snapshot `7603c175164f918884f749d76654c214f14aa969`. P4's original eight-file scope and its real 320/390/1280px original-return tests passed on the reconciled head. P5 then incorporated that exact P4 snapshot while preserving its **single canonical Ask objective session**.

P3's independent research owner `Fulcanelli13/folio-core` PR #36 is still unmerged and its latest observed CI for source `a4b0257d9d787e8f715557deac0c930b7fd98555` failed. **Do not confuse 534 indexed historical question candidates with approved answers.** The original imported mirror comprises **27 draft Folio files** with SHA identities pinned by `data/learn/formation-canon-migration-provenance-20261018.v1.json`. P5 now checks all 27 hashes in addition to **24 original owner-file SHA pins**. This import is strictly a temporary editorial snapshot, never a new canonical public answer database.

**Critical deployment blocker:** four query parameters restrict the *UI* but cannot restrict direct requests to public `/data/learn/research/*.json` paths. This draft MUST NOT be promoted, served as a public build, or automatically deployed while those unpublished Folio JSON files are statically accessible. Before release, the draft research corpus must be excluded from every publicly served build or kept behind genuine access control, with network-access verification. The lock keeps `canonUnpublishedJsonAssetsExcludedFromPublicStaticDeploy=false` and `publicStaticAccessVerifiedBlocked=false` until that has been proven; the eleven prior release gates also remain false.

One Canon visual-novel folio, one original Catechism reader, one Ask objective engine. No new scripted religious answers, duplicated research or live Mass reader changes.

## Scope limitation
This snapshot reconciles the named owner commits listed above. Upstream source branches may continue to evolve; newer commits require another comparison. A green test cannot substitute for physical-device and human historical/editorial review. P5 is **merge-review ready, not release-ready**.
