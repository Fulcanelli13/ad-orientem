# GitHub Pages deployment recovery — 15 October 2026

**Incident:** The exact-main Pages build for the Biblical Atlas historical-landscape acceptance commit `37f8d0e5d6731d23d91265813e8ec20bdb1d7cc0` was cancelled (run [#38773339668](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38773339668), attempt 1) amid competing Pages builds.

The GitHub Actions “rerun failed jobs” operation produced **attempt 2 in the same run**. The Jekyll build completed successfully, but `actions/deploy-pages@v5` failed because that run then contained **two uploaded artifacts named `github-pages`**. Actual deploy job error: `Multiple artifacts named "github-pages" were unexpectedly found for this workflow run. Artifact count is 2.` This is **deployment orchestration failure**, not a demonstrated app-build failure. Do not repeat reruns of that same artifact-ambiguous run.

**Recovery:** A new ordinary change to the documentation branch creates a **fresh main commit on PR merge**, causing an entirely new Pages workflow run with a single fresh artifact name. Verify **all** Pages jobs (build, deploy, report-build-status) on the new exact main SHA before reporting the Atlas preview as live. This incident has no bearing on the source-integrity/browser test results of [Atlas #1249](https://github.com/Fulcanelli13/ad-orientem/pull/1249), whose 10 original and latest-main acceptance workflows succeeded.

**General operational policy:** When a Pages deployment job fails after a successful build, inspect the precise deploy log, artifact count and concurrency before rerunning. Do **not** rerun a build that will upload another artifact with the same `github-pages` name into the same workflow run unless the duplicate is removed. A *fresh workflow run* is safer. Do not force-push another owner's branch or modify Bible/map implementation solely to compensate for a Pages artifact collision.

This entry records a reproducible deployment failure mode rather than changing any product feature, map, Bible event, text, artwork, source record or editorial hold. Coordination owner [#342](https://github.com/Fulcanelli13/ad-orientem/issues/342).
