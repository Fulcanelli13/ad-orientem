# Repository control centre

> Updated 10 October 2026. This is the **navigation and ownership index**, not a substitute for original source registers or CI. `main` is the sole production source of truth.

## Start here

- [Product architecture](ARCHITECTURE.md) · [PR/reconciliation policy](PR-PIPELINE-POLICY.md) · [Release checklist](RELEASE-CHECKLIST.md)
- [App convergence](APP-CONVERGENCE.md) · [R17 Mass evidence](R17-CONVERGENCE-PROVENANCE.md) · [Directory owner](DIRECTORY-SOT-V1.md) · [Explore geography owner](EXPLORE-GEOGRAPHY-SOT-V1.md)
- [Canonical historical work register — #342](https://github.com/Fulcanelli13/ad-orientem/issues/342): evidence ledger, **not a queue of PRs to blindly resurrect**

## Open work: exactly one issue owner per outcome

| Stream | Canonical issue | Scope / next actionable gate |
| --- | --- | --- |
| Mass source integrity | [#779](https://github.com/Fulcanelli13/ad-orientem/issues/779) | Recover unresolved source macros, names, bilingual gaps; exact Proper-level tests |
| Prayer text integrity | [#799](https://github.com/Fulcanelli13/ad-orientem/issues/799) | Magnificat/Benedictus edition and EN/FR/Latin ending witnesses |
| Calendar ↔ Scripture | [#719](https://github.com/Fulcanelli13/ad-orientem/issues/719) | Original rubric/passages, contextual reading, exact return |
| Sacred Atlas | [#665](https://github.com/Fulcanelli13/ad-orientem/issues/665) | Source-gated **major** Marian pilgrimage shrines; no auto-published pins |
| Platform startup | [#560](https://github.com/Fulcanelli13/ad-orientem/issues/560) | Cold/warm phone benchmarks and release budgets |
| Sexual Ethics certification | [#658](https://github.com/Fulcanelli13/ad-orientem/issues/658) | Independent primary-source, competent theological and native-French review |
| Ephesians 5 subtopic | [#611](https://github.com/Fulcanelli13/ad-orientem/issues/611) | Existing CSE045 implementation merged; retained for external theological/source sign-off only, **no second course** |
| Guided Catechism certification | [#588](https://github.com/Fulcanelli13/ad-orientem/issues/588) | Individual independent review of 181 claims, not 181 release approvals |
| Non-Mass donor evidence | [#271](https://github.com/Fulcanelli13/ad-orientem/issues/271) | Immutable primary donor evidence / formal change of release requirement |
| Historical dispositions | [#342](https://github.com/Fulcanelli13/ad-orientem/issues/342) | Reconcile any unabsorbed evidence, not a duplicate implementation backlog |

**Interpretation:** A merged implementation is not independent liturgical, theological, textual or historical certification. Keep human review gates open and explicit.

## Branch and PR rules

1. **One issue → one active integration branch/PR per domain.** Link the canonical issue before opening a branch. Don't fork a second rescue architecture because `main` advanced.
2. Branch naming: `mass/<issue>-<purpose>`, `prayer/<issue>-<purpose>`, `formation/<issue>-<purpose>`, `explore/<issue>-<purpose>`, `platform/<issue>-<purpose>`, or `governance/<purpose>`. Research evidence goes into canonical `data/` and `docs/research/` trees, not competing deployed runtimes.
3. Reconcile against fresh `main`; compare existing owners/files; preserve the **48-card native R17** path and fail-closed liturgical/source logic.
4. A PR must have a real diff, cite sources, list owner, test actual phone navigation where UI changes, and state what remains **unverified**. No merge with failed required CI.
5. Close a superseded PR only with a named successor and explicit unique-delta disposition; retain its GitHub history. Never call a PR merged if it was only closed.
6. Archive refs (`archive/*`) are historical **read-only**. Never retarget or delete them during automatic cleanup. Preserve unmerged research branches unless manually adjudicated.

## Branch retirement — safe automation

The [branch-hygiene workflow](../.github/workflows/branch-hygiene.yml) performs **two separately audited safe retirement checks**: (1) ordinary branch heads provably ancestral to `main`, and (2) exact unchanged heads of GitHub PRs already recorded **merged**, including squash/rebase merges. Both require at least 72 hours' age and independently verify the live head SHA, branch protection and absence of an open PR before deletion. `main`, `archive/*`, `release/*`, `snapshot/*`, pinned donor/baseline refs, active research, closed-unmerged PRs and unverified heads are excluded. Each pass deletes at most 150 refs and publishes its own TSV artifact. Scheduled weekly runs safely prune eligible merged work; **Actions → Branch hygiene → Run workflow → audit** previews without deletion. Do **not** mass-delete the remaining branches: an unmerged or superseded research head may contain unique evidence.

> Initial 10 October audit: **953 branches** and **0 open PRs**; the first ancestry-only pass safely retired **94** fully merged heads. The 953 figure is a snapshot, not a live counter. Reachability / archive checks, not age or naming alone, determine removals.

## Build artifacts and workflows

- Root `ao-inline-*`, `ao-packed-*` and `ao-boot-*` assets may be referenced by the active HTML, offline manifest or tests. **Do not delete by glob.** First produce an explicit dependency ledger, verify no reachable entry point needs the file, and re-run startup/offline smoke tests.
- Specialized workflows (Directory, Mass, Formation, Scripture, Calendar, Prayer, visual acceptance) are valid independent evidence lanes. Retire a workflow only after its trigger paths and unique assertions are reconciled into a successor. Never disable failing CI merely to clear a red dashboard.
- For a new feature use [the shared PR template](../.github/PULL_REQUEST_TEMPLATE.md) and [issue template](../.github/ISSUE_TEMPLATE/work-item.md). No unnecessary tracking issues for already-completed PRs.

## Routine

- **Before coding:** choose issue and source owner, search merged PRs and current `main`, declare unique scope.
- **Before merging:** verify current branch head, full required checks, visual/phone evidence where relevant, original source links and release status.
- **After merging:** note merge SHA in the issue; close completed implementation items while retaining true certification holds; merged branches retire automatically via the guarded workflow.
- **Weekly:** review only canonical open issues and workflow failures; run branch audit; reconcile any long-lived unmerged work deliberately.
