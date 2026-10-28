# Ad Orientem — Pray implementation PR integration/readiness
**GitHub snapshot:** 28 October 2026, approx. 07:17 UTC. **Status:** HOLD — no merges executed from this pass. Research PR [#1819](https://github.com/Fulcanelli13/ad-orientem/pull/1819) owns this evidence; the separately scoped content-census correction is [#1821](https://github.com/Fulcanelli13/ad-orientem/pull/1821).

## 1. Action completed in this pass

- Verified PR statuses, SHA, changed-file lists and recorded GitHub Actions runs in *both* `Fulcanelli13/ad-orientem` and canonical private `Fulcanelli13/folio-core`.
- Confirmed **#1818 has merged** since the initial consolidated audit. Live public main was `744cc6de848c698d173d11afc8eb4c6cb4cd02af` when read, and its GitHub deployment/status jobs were successful. This is not acceptance for unrelated prayer batches.
- Identified three shared-file overlaps between every major PR pair listed below. In the absence of a verified merge-based integration test, these must remain independent.
- Created **PR #1821** with exactly three source-census metadata corrections: geography 261→512, customs 13→38, and customs attestations 71→97. Existing seed data, place identities, map pins and Calendar were not modified.
- Commented directly on **private #59**, **public #1800**, **public #1813**, and **public #1821** with precise failed checks and acceptable follow-up. No costs, quota increases or workflow re-runs requested.

## 2. Active blocking PR evidence

| PR | Head SHA | Status | CI facts | Decision |
|---|---|---|---|---|
| [Private Batch 1 #59](https://github.com/Fulcanelli13/folio-core/pull/59) | `ad72ad417f6bfeb728296cd7cb88f579c18e0582` | Open, mergeable, not merged | **14/14 workflow checks failed ~5 seconds after triggering**; examined jobs have zero execution steps; GitHub log fetch returned BlobNotFound. Cannot determine precise root cause from available evidence; do **not** call these 14 code failures, nor green tests. | HOLD |
| [Institute supplement #1800](https://github.com/Fulcanelli13/ad-orientem/pull/1800) | `cb94a3a91e1790edb413d0cacd851f71f911e453` | Draft, `mergeable=false` | Content census failed initial `geographical-places 261 != 512`, a pre-existing shared registry mismatch; CI running and one failed content-census check. Branch stages actual app code, including Infant King, St Thérèse, Marian prayer, priest prayer, and 8 Latin seasonal recensions, not solely documentation. | HOLD |
| [Batch 2 implementation #1813](https://github.com/Fulcanelli13/ad-orientem/pull/1813) | `8affe677ee89f2d1464dafb2fe0f62c0dd625436` | Open, mergeable, not merged | Required-main, Benediction phone and many other tests passed; **Prayer real Scripture offline PWA restart failed** at job [122679711604](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40647527357/job/122679711604) before Prayer assertions: `OFFLINE_SNAPSHOT_ITEM_LIMIT`. Existing `sw.js` holds `MAX_ITEMS=384`, `MAX_BYTES=35000000`. | HOLD |
| [Content census #1821](https://github.com/Fulcanelli13/ad-orientem/pull/1821) | `34e1ee4d39584d123054aa5542cd4141d98f521c` | Open, mergeable, not merged | Content architecture run [40648898906](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40648898906): `tests/content-navigation-registry.mjs` **passed** after count fixes; `tests/content-item-census.mjs` **passed**; *next* `tests/content-reachability-source-contract.mjs` **failed**, detecting newer unlinked Place records beyond the former two expected IDs. | HOLD |

**Important:** For private #59 the available GitHub data do not establish whether the zero-step failures arose from billing, runner availability, permissions, repository configuration or something else. No paid features should be enabled as a guess.

## 3. Shared-file collision matrix

Source: exact changed-file lists reported by GitHub for each open PR.

| PR pair | Overlapping files | Risk |
|---|---|---|
| Private #59 ↔ public #1800 | `package.json`; `src/pray/presentation-runtime.js`; `src/pray/traditional-pray-runtime.js` | Shared routing, source/reader ownership, test scripts |
| Private #59 ↔ public #1813 | `package.json`; `src/pray/canonical-data.js`; `src/pray/presentation-runtime.js` | Historical source and direct prayer body changes vs Benediction/Adoration runtime |
| Public #1800 ↔ public #1813 | `package.json`; `src/pray/presentation-runtime.js`; `tests/pray-all-modules-mobile.mjs` | App navigation, release scripts and mobile test baselines |

These overlap counts do not establish a line-level conflict, except that #1800 currently reports GitHub `mergeable=false`. A merge simulation on the exact latest main, not the older PR base SHA, must determine line-level resolution. Do not wipe one batch's changes by selecting one whole-file side.

## 4. Source count correction vs genuinely independent Explore hold

The content-census test originally failed because three numeric metadata counters had drifted from the canonical seed data. #1821 changes **only** those counts. The succeeding reachability guard is much more substantive: `tests/content-reachability-source-contract.mjs` expects older particular unlinked Place IDs; the current geography seed has many additional records.

Do not turn this into an automatic approval of 251 new locations or equivalence with the separate worldwide TLM physical venue register. Preserve stable Place IDs, source provenance, parish/association relationships and existing map-release gates. The Explore identity/linkage audit must decide which new records can be linked or published. Never bypass the guard by wholesale whitelisting.

## 5. Offline item limit: bounded next action, not a guess

`sw.js` creates a transactional first-use offline graph, with root HTML, static dependencies, Prayer first-use owner and local Angelus art. It caps `MAX_ITEMS=384` and `MAX_BYTES=35000000`. On #1813, graph expansion triggers `OFFLINE_SNAPSHOT_ITEM_LIMIT`, then fail-closes before the rest of the test executes. Do not blindly lift the item ceiling without measuring total entries and byte size or selectively excluding assets from the critical graph without verifying that first-use Prayer and saved Scripture work offline. A separate scoped fix should emit/measure the graph first and run the same offline restart Playwright test, followed by full main acceptance. Vercel explicitly uses the live network version, so this PWA regression is on a distinct host/deployment context; it still fails the required offline assurance.

## 6. Minimal-risk next release order

1. Restore **private #59** usable actual Actions runner evidence / appropriate zero-cost equivalent and run required source + phone tests. Do not expose private source content in public repos.
2. Reconcile **#1800** with main and #1813 on shared files, preserving all already-staged Institute additions. Keep independent Explore content-reachability hold rather than changing unrelated Place data casually.
3. Repair **#1813 offline PWA snapshot** on a scoped branch and verify service worker first-use graph within both constraints. No new cloud costs.
4. Only then merge small, independently verified changes in dependency order, run exact deployed-SHA smoke tests and protect live rollback.
5. Independently implement the remaining two P0 prayer-text corrections: Litany of the Saints version distinctions and Good Death's St Joseph 1909 versus 2021 recension, with original print witnesses and distinct stable IDs.

**Consolidated disposition:** 25/25 Pray hub module audits remain complete; 10 modules in open implementation PRs, 2 partially staged, 13 research only. This pass improved machine-readable release tracking but deliberately did not mark any PR or audited module as published merely because a PR was open.
