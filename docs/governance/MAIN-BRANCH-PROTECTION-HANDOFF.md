# Main branch protection — administrator handoff

Owner: [release safeguard #1047](https://github.com/Fulcanelli13/ad-orientem/issues/1047).

## Background

The repository's Mass, App, Directory and source-audit workflows use pull-request
`paths` filters. They are still valuable and must remain enabled. However, selecting
one of their job statuses as an **unconditional required** check could leave
unrelated PRs permanently Pending because no job was created for that change.

The `Required main gate / required-main-gate` check is intentionally triggered
on every pull request, with **no path filters**. It runs the existing `npm test`
non-browser suite (the same broad suite used by R17 convergence). It is not a
replacement for specialised source-audit, full phone, screenshot or independent
editorial gates, and it does not certify physical-handset acceptance.

## Apply protection in GitHub Settings (administrative action required)

1. Open [repository rules](https://github.com/Fulcanelli13/ad-orientem/settings/rules)
   or [branch-protection settings](https://github.com/Fulcanelli13/ad-orientem/settings/branches).
2. Apply a rule to the branch named **`main`**, requiring a PR before merging.
3. Require the exact **`required-main-gate`** job, once its check appears on a PR.
   Do not blindly require path-filtered statuses (App Convergence, R17, etc.) for
   every PR. Keep specialist CI failures as a separate merge/review stop.
4. Disable force-push and branch deletion; review bypass and administrator
   enforcement. Use settings compatible with the repository's active release
   flow; avoid imposing an unstaffed review-count requirement.
5. Test with one documentation-only PR (the required gate should run and pass)
   and one PR with a deliberately failing gate (merge must be blocked).
   Undo any test-only changes without merging them.
6. Confirm effective protection in the GitHub UI, production Pages deployment,
   and that the required check reports terminal status for all PR file types.

Important: the connected GitHub integration has repository contents write
permission but **does not have accessible branch-protection administration**
(the endpoint returned HTTP 403). No protection change is claimed by this PR.

## Operating policy

Before merging, verify the required gate is green **and** every relevant
specialised workflow triggered for the PR is green. Missing/skipped specialist
checks must be investigated when their domain is touched. Never weaken source,
liturgical or human approval holds to clear CI. Track outstanding real Android
handset signoff under #1047 and independent Sexual Ethics certification under #658.
