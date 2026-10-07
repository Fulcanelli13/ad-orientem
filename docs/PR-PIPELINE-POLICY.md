# Pull Request Pipeline Policy

This repository uses `main` as the continuing source of truth. Donor prototypes, rescue branches, research branches and parallel ChatGPT pipelines are inputs to convergence, not independent product lines.

## One workstream, one active integration branch

For a given product surface or defect cluster, maintain one current integration PR wherever practical.

Do not create a new PR merely because `main` advanced. Prefer updating or replaying the existing integration branch onto current `main` while preserving concurrent work.

If a replacement PR is unavoidable, the old PR must receive a final comment in the form:

> SUPERSEDED BY #NNN — no unique implementation scope remains.

Do not close the old PR until unique files/commits have been checked.

## No zero-commit implementation PRs

Research specifications, future plans and unresolved donor gaps belong in issues, source ledgers or research documents until implementation commits exist.

A PR with zero implementation commits must not be used as evidence that a feature was implemented.

## Current main wins

Before merging any long-lived branch:

1. read the current `main` head;
2. compare files changed on `main` since the branch base;
3. identify overlap explicitly;
4. preserve newer unrelated work;
5. rerun the relevant static, phone and visual gates on the reconciled head.

Do not revive an older donor implementation over a later exact-donor implementation merely because the older PR contains a missing asset or useful fragment. Extract the unique fragment and keep the later architecture.

## Supersession test

A PR may be closed as superseded only when all of the following are true:

- a successor is named;
- unique changed files have been compared;
- any unique required asset/data has been transplanted or deliberately rejected with rationale;
- the successor is based on or reconciled with current `main`;
- relevant CI is green, or the remaining failure is explicitly proven unrelated and tracked separately.

## Separate implementation from certification

Do not mark a ledger `CERTIFIED` solely because a branch author updated the ledger.

Certification requires the independent repository gates appropriate to the surface, including as applicable:

- static contract tests;
- real-phone/browser acceptance;
- visual acceptance;
- source/donor provenance tests;
- application-level convergence.

A self-declared PASS that is contradicted by CI is not a PASS.

## Cross-pipeline ownership

Parallel pipelines must not create competing owners for the same state.

Examples:

- Mass canonical/session/event state remains separate from presentation mode.
- Calendar date intelligence has one owner; Home/PRAY/Coming Up consume it rather than recalculating dates.
- Devotional-practice and novena date semantics must converge on one canonical registry.
- Rosary translation/recitation behavior must have one runtime owner.
- Historic donor shells may supply evidence or exact UI fragments but must not become a second production shell.

## Closed-PR interpretation

`Closed` does not mean `resolved`.

For audit purposes every closed-unmerged PR must resolve to one of:

- `SUPERSEDED`
- `DUPLICATE`
- `DECOMPOSED_INTO_SUCCESSORS`
- `OBSOLETE_AGAINST_MAIN`
- `PLANNING_ONLY_TRACKED_ELSEWHERE`

Any PR that cannot be placed in one of these classes remains an audit exception.
