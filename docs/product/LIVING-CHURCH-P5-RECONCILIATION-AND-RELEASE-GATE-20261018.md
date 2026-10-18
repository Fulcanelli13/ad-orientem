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

The machine-readable lock `data/learn/living-church-p5-convergence-lock.v1.json` has 16 source blob pins, ten source-viewer patch hunks, latest fifth-batch M6 source snapshots and nine explicit false publication gates. Fail on source drift; never auto-update a source pin or silently declare approval.

## Frozen owner-snapshot policy
M6 research is continuing independently. P5 imports through fifth batch at source owner `fe9fb6de79faec7f716ec8ff975ca88ec4e152b0`, then freezes that provenance as the acceptance baseline. Changes after that commit belong to the M6 upstream pipeline and require a deliberate future reconciled update, not an automatic rewrite of reviewed P5 tests. The P5 integration work does **not** approve or publish any of the 56 atlas image/source records.

## Scope limitation
This snapshot reconciles the named owner commits listed above. Upstream source branches may continue to evolve; newer commits require another comparison. A green test cannot substitute for physical-device and human historical/editorial review. P5 is **merge-review ready, not release-ready**.
