# Branch retirement — evidence-review queue (10 October 2026)

The [machine-readable snapshot](../data/governance/branch-disposition-audit-20261010.v1.json) records **each branch requiring manual disposition**, the exact HEAD SHA and any closed PR counterpart. It is a point-in-time audit, **not deletion authority**.

## Findings

| Classification | Count | Decision |
| --- | ---: | --- |
| Production / active PR head | 2 | Keep |
| Historical archives and reserved refs | 47 | Keep |
| Exact closed **merged** PR heads | 497 | Covered by guarded branch-hygiene workflow; 72-hour age gate and fresh SHA check |
| Closed **unmerged** PR head with unchanged SHA | 147 | **Hold**: compare unique diff and find canonical successor before retirement |
| Former PR branch that moved after its reviewed head | 17 | **Hold**: cannot infer what the branch now contains from PR status |
| Branch with no matching closed PR | 90 | **Hold**: check whether research, abandoned draft, donor or active pipeline |

The snapshot contains **254 manual review candidates** (147 + 17 + 90). Some newly created maintenance branches count as orphans until a PR exists, so always consult the current open PR inventory before making changes. There were **three same-SHA branch pairs** at audit time; all require the same owner check, not automatic deletion.

## Decision standard for the manual queue

1. For a candidate HEAD, fetch current branch SHA and search **all** open/closed PRs linked to that ref. If SHA differs from the audit snapshot, cancel review and rescan.
2. Compare the branch with **current** `main`. If there are unique files or historical primary texts, identify their canonical `data/` / `docs/research/` owner and exact source. An apparently old head may still contain undelivered Formation, Mass or pilgrimage work.
3. Record one disposition: **merged in successor**, **identical duplicate head**, **preserved donor evidence**, **source/research hold** or **genuine unpublished implementation**. Link exact relevant PR, commit SHA and independent test evidence.
4. For a closed-unmerged PR, comment on that PR with its successor and unique-delta reconciliation. Never write "merged" for closed-unmerged history.
5. **Delete the branch ref only if** it is redundant with a preserved, independently verified Git commit/research artifact and no open PR still uses it. Prefer guarded GitHub Actions cleanup over manually deleting by glob. Preserve reserved `archive/*`, `snapshot/*`, `release/*` refs.
6. Rerun the audit following large merges or when `main` changes materially. The historical snapshot is not a perpetual permission to remove branches.

## Priority and delegation

Work in **domain-sized batches** rather than opening one new issue per branch. Use [#342](https://github.com/Fulcanelli13/ad-orientem/issues/342) as the canonical historical disposition register:

- First: older superseded **App / Mass UI** branches with current R17 ownership, ensuring the frozen 48-card LIVE experience and exact source-cue regressions survive.
- Second: **Formation / Prayer** content heads; prioritize actual original sources, bilingual texts and independent approval. A published answer or prayer is not certified merely because a PR passed.
- Third: **Directory / Atlas** geocoding and relic research; never import an approximate pin as a physical venue or convert disputed custody to certainty.
- Finally: stale development **CI, performance and exploratory** refs. Keep one live workflow per independent coverage goal.

This queue is separate from the **10 existing canonical release/content issues** (and any new valid CI regression such as #870). It is a repository-operations classification, not evidence that those tasks have been completed.

## Generated root assets

At the same audit, the root held **89 `ao-inline-*` files, 5 `ao-boot-*` files, and 1 `ao-packed-*` file**. Their dependency/manifest audit belongs under [#560](https://github.com/Fulcanelli13/ad-orientem/issues/560). No artifact is safe to remove by hash-prefix alone. A cleanup PR must prove no references from `index.html`, offline precache, service workers, tests and donor wrappers, then pass current phone, offline and R17 gates.
