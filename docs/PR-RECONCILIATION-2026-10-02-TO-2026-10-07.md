# Pull Request Reconciliation — 02/10/2026 to 07/10/2026

Status date: 07/10/2026  
Authority: current `main` plus GitHub PR history

## Executive result

The five-day audit covered 262 pull requests created from 02/10/2026 through 07/10/2026.

- 149 merged during the audited population.
- 110 were closed without merge.
- 3 were open when the audit began.
- After convergence work on 07/10/2026, there are no remaining implementation PRs from that audit cycle.
- 109 of the 110 closed-unmerged PRs now have no unique implementation scope remaining.
- The remaining exception is zero-commit PR #256: its unfinished Calendar/devotional-practice scope is tracked canonically in issue #267 and must not be treated as implemented.

The large closed-unmerged count was primarily branch churn: stale branches, rebases, clean replays, decomposed successor PRs, and obsolete integration scaffolding. It was not evidence of 110 missing features.

## Convergence completed during the audit

### Mass

The competing Mass branches were reduced to one surviving line.

- #239 was superseded by #240.
- #240 was audited against #249 and closed as superseded.
- #249 was replayed onto current production, preserving the current non-Mass gate state and the later exact v4.6 Mass donor bank.
- #249 then certified:
  - real-touch two-axis LIVE navigation;
  - Schola page/progress, speed, pause/resume, translation lifecycle, hide/show and resize;
  - structured v1.79 Guide presentation;
  - concise/state-aware rubric ownership;
  - exact 67-entry v4.6 Mass master icon bank.
- #249 passed Visual acceptance, R17 Mass convergence and App convergence and was merged.
- The Mass app-release blocker `MASS_V180_INTERACTION_ICON_PARITY` is closed.
- `EXACT_NON_MASS_DONOR_PARITY` remains the application-level presentation blocker and is tracked explicitly in issue #271.

Do not revive #207, #239 or #240 as alternate Mass architectures.

### Shared visual gates

PR #268 repaired two stale acceptance assumptions without changing production behavior:

1. Rosary visual acceptance no longer assumes that `AO_ROSARY_V381.steps()` serializes common-prayer text; it validates the rendered Hail Mary through the visible Next path.
2. donor-reference E2E no longer expects screenshots from the retired duplicate v38.4 Calendar dashboard; it consumes the current single-Calendar practice and discipline captures.

#268 passed Visual acceptance and R17 phone acceptance and was merged.

### Learn formation

PR #265 was shown to be file-disjoint from the concurrent Mass/PRAY changes. After #268, its Visual, R17 and App suites were all green. It was merged without reopening Mass or PRAY ownership.

### Calendar / devotional practices

PR #256 contains zero implementation commits. Its descriptive scope is not evidence that the work landed.

Merged #260 owns the Calendar Intelligence foundation. Remaining devotional-practice / 16-novena reconciliation is tracked in issue #267, including explicit missing-donor holds. The separate primary-evidence release blocker is tracked in issue #271. Do not reopen #256.

## Key historical successor chains

These are the most misleading closed-unmerged chains found in the audit.

- Early Mass/R18/R19 work: #6/#7/#17/#18/#19 → #9/#20/#23/#24 and later certified production work.
- Special structures: early closed branches → #22/#29/#37/#47/#48/#49/#52/#53, then production-shell certification through #69/#74/#76/#84/#86/#88/#89/#94/#99.
- App shell and modular extraction: closed integration scaffolding → #79/#83/#105/#107/#112/#114/#115/#117/#120/#122/#128/#133/#136/#139.
- Donor/presentation rails: broad #198 work decomposed into #203/#204/#205.
- Mass definitive reader: #207 → #216 → final parity convergence #249.
- Rosary: repeated repair/rebase chain ultimately represented by #200/#205/#226/#250/#257/#258.
- Calendar v38.4 recovery: zero-commit #232 → #235/#237, with the duplicate dashboard later deliberately retired by #263.
- Calendar devotional planning: #256 → foundation #260 + outstanding canonical issue #267.
- Mass visual certification: #239 → #240 → #249.

## Current rule

A closed PR is not considered reconciled merely because GitHub shows it as closed. It is reconciled only when one of the following is true:

1. its commits were merged;
2. a named successor contains all unique implementation scope;
3. its scope was intentionally decomposed into named merged PRs;
4. it is proven obsolete against current `main`; or
5. unfinished non-code scope has been moved to a canonical issue/ledger.

See `docs/PR-PIPELINE-POLICY.md` for the continuing governance rule.
