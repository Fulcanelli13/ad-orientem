# Ad Orientem — GitHub work and CI policy
*Operational housekeeping, 11 October 2026. Update this note when integration branches move.*

## One production owner, separate research

`main` is the only shipped code baseline. PRs to a feature branch form a **stack** and must be merged in the declared order. A GitHub Actions green check on a stacked PR does not mean the base branch, or production main, has been certified.

Do not delete research/source branches simply because a PR closes. Closing a superseded PR archives its proposed merge route; original commits, source URLs and artifact evidence remain available. Never close or replace a draft explicitly designated `ON HOLD` without resolving its research gate. The canonical R49–R54 preliminary map and user-facing Explore mobile work already landed on `main`.

## Working lanes

| Lane | Current release route | Keep distinct / holds |
| --- | --- | --- |
| Shared UI colour/readers | #999 consolidated current-main integration | Earlier #989 → #992 → #995 have been closed in favour of #999; #993 Calendar wheel and #997 Today still target the earlier theme branch and **must be reconciled/retargeted after #999**, not merged on stale base. #896 retains unique editorial UI hooks. |
| Biblical Atlas | #998 current-main integration (draft) | #963 and #990 older stacked merge routes closed; #923 remains separate research corpus |
| Scripture | #938 73-book Douay + French Crampon | #922 and #932 superseded merge routes closed; source witness and verse data still require certification |
| Mass / Tenebrae | #973 Mass entry; #934 Tenebrae Prayer | Distinct owners until handoff between the Office and Mass hub is settled |
| Sacred Art | #887 research acquisition, #949 on hold | Do not publish art from prototype ahead of full-year associations, rights and user exception audit |
| Directory | #926 research staging only | Current R49–R52 provisional pins already live on main; geocoding sources need reconciliation, not automatic canonical import |
| Formation / Prayer | #893 study, #903 IA draft, #915 contextual routes | #915 expressly blocks merge pending Sexual Ethics source-audit repair |
| Navigation/editorial | #889 module Back, #896 held | Resolve conflicts against later R53/R54 navigation and Home/Calendar work; do not discard unique route/history or design semantics |

## CI run routing

1. **PR revisions:** one latest attempt per PR per workflow. `cancel-in-progress` uses the PR number, never a global branch or workflow grouping across independent PRs. Manual runs and production-main integrity jobs are not cancelled by a new PR revision.
2. **Specialist triggers:** only paths owned by the specialist workflow should trigger that suite. A broad `package.json` edit should trigger **App convergence**, not duplicate Directory, Scripture, Rosary collation and Tenebrae source verification. Source-file, runtime, acceptance-test and workflow-self triggers remain.
3. **Native app integration:** `App convergence` remains the broad release smoke test for app/runtime changes; Directory foundation remains the source/venue owner and R49 is a narrow preliminary map check.
4. **Research:** costly external acquisitions and promotion operations must remain separately scoped, provenance-preserving, and manually controlled where possible; no automatic pin or Mass time promotion from candidate result files.
5. **Large-batch commits:** finish a cohesive batch on one branch before opening another PR or repeatedly updating `package.json`. Use a draft or research PR for long-running work, then validate the integration tip after dependencies merge.
6. **No downgrade for speed:** never suppress failing checks, remove source-provenance contracts, force-push over someone else's branch, or merge a failing integration into main merely to empty the queue.

## Housekeeping decisions — 11 October 2026

- Merged #876: PR-only supersession cancellation added to 17 specialist workflows.
- Closed unmerged #922 and #932: superseded Scripture merge routes; #938 retains the intended full 73-book bilingual recovery, subject to independent audit.
- Closed unmerged #963 and #990: superseded Atlas merge routes; #998 is the current-main candidate.
- Preserved #887/#949 sacred-art research and review holds, #896 held editorial/UI work, #923 geographic research, and #926 directory research; **no research branches deleted**.
- Closed unmerged #1002 (overlapping Today v2 implementation on held #896) in favour of #997 (theme-first, tests). Unique frontispiece CSS/geometry remains on #1002's branch for reconciliation; no visual design authority is discarded.
- A parallel UI integration has consolidated #989, #992 and #995 into #999 on current main. Do not continue their closed stacked routes; #997 and #993 still point at an older theme base and need a single rebase/retarget after #999 passes acceptance.
- Returned #887 art acquisition and #915 source-blocked Formation/Prayer to draft status pending their explicit gates. No source corpus was discarded.
- Verified existing source-owner CI failures on an unrelated workflow-only PR: Content Architecture geographic Places 182 vs 220, and Sexual Ethics `unjust exaction` wording assertion. These need separate owner review; **do not relax data or doctrinal gates as a queue workaround**.
- Scoped CI cleanup in `ci/queue-signal-routing-20261011`: deduplicate PR runs in R49, Explore, Tenebrae, Sexual Ethics and Content census; remove unrelated `package.json` triggers from four specialist workflows; test that app-wide dependency verification remains intact.

## Draft CI scheduling (follow-on #1004)

Draft PRs should still receive relevant source/unit-contract feedback, but full App, Explore, preliminary-map mobile and visual screenshot matrices are deferred until `ready_for_review` (or manual dispatch / production push). Workflow subscriptions must include `ready_for_review` explicitly so a promotion triggers actual phone acceptance on the same branch head without a meaningless extra commit. This reduces noisy draft-pipeline queuing without certifying untested drafts. Parent feature branches in an existing stack must be refreshed against `main` to inherit the latest CI routing changes.

## Safe next cleanup

After the UI chain reaches main, reconcile #896 and #889 against the latest shell; do not prematurely discard them. After #998 integrates, reconcile #923 source research separately. Leave #915 gated until opposing arguments and original source hyperlinks pass their editorial source requirements. Stop launching a new integration PR whenever a previous one already carries the same feature; update the existing owner branch or formally supersede it with a closure note.
