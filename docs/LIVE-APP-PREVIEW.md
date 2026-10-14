# Live application preview — canonical deployment

**Live application:** https://ad-orientem.vercel.app/

**Canonical source repository:** `Fulcanelli13/ad-orientem`, branch `main`. Its `vercel.json` runs `node tools/build-web-preview.mjs`, producing `dist/web-preview`.

The live site is the **integrated app**, not a per-pipeline prototype. Pull requests and unpublished research do not appear here before approved integration. The Mass reader must retain its canonical R17 native 48-card LIVE presentation, with MISSAL and SIMPLE modes. No alternate reader or second app shell is authorized.

## Review and release

1. UI and text PRs must document an exact change and pass relevant source, regression, mobile and visual gates.
2. Changes merged into the canonical `main` should trigger a new Vercel production build of this Git-linked project. Verify the Vercel deployment's Git source and SHA match `ad-orientem/main`.
3. A Vercel READY build confirms hosting success, **not** a complete functional/browser acceptance. Verify touch navigation, Home, Mass, Pray, Formation, Calendar and Explore in EN/FR where relevant before claiming a release.
4. Per-PR Vercel previews are review-only and may require Vercel authentication; never describe an unmerged preview as the current app.
5. Folio Core remains a preserved historical donor until all of its unique data, assets and code have been reconciled; do not overwrite current canonical owners.

## Obsolete preview

`ad-orientem-preview.vercel.app` is an older Folio Core-connected deployment. Do not use it to determine whether Ad Orientem's canonical `main` has been updated. Preserve it only as a temporary rollback reference pending donor audit.

## Incident response

When a review appears stale, first compare Vercel's deployed Git commit SHA to GitHub `main`, confirm the deployed source repository is `ad-orientem`, then inspect the build and test results. On phones, check that a prior Service Worker is not supplying obsolete cached assets. Do not solve missing changes by building another parallel app.
