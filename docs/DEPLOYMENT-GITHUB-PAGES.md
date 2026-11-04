# Ad Orientem — GitHub Pages-only publication

**Decision (4 November 2026): GitHub hosts both source and public site. Vercel is not a release target.**

- Source: [`Fulcanelli13/ad-orientem`](https://github.com/Fulcanelli13/ad-orientem), protected `main`.
- Public site: https://fulcanelli13.github.io/ad-orientem/
- Build: `node tools/build-web-preview.mjs`, producing `dist/web-preview/`.
- Publish: `.github/workflows/github-pages.yml` uses the official GitHub Pages Actions.
- Do not deploy the repository root. Research, editorial evidence, staging assets, and historical bundles remain in GitHub, not the public website.
- Keep canonical source guards and the normal PR/CI gates before merging into `main`. GitHub Pages is a static host; no backend service is introduced.

## One-time GitHub Pages configuration

GitHub repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
A repository administrator must select this setting; the workflow cannot set it through ordinary commits.

Once enabled, run the **Publish Ad Orientem — GitHub Pages only** workflow from GitHub Actions, or merge an approved runtime change into `main`.

Verify that the action completes, that the emitted `page_url` is the canonical GitHub Pages URL, and that the site boots on desktop and phone. Run the existing `Canonical Pages source and service-worker byte parity` workflow manually against the public site; check the stored JSON for actual source-byte matches, not merely a green run. Verify the service-worker scope is `/ad-orientem/`, and that Mass, Calendar, Pray, Explore, assets, EN/FR switching and offline install/update work. A test alone does not establish published parity.

## Vercel retirement

The Vercel production and preview projects have their build steps configured to skip and their preview deployments disabled. The repository's `vercel.json` has deploymentEnabled=false for all Git branches, as a second safeguard.

After GitHub Pages is publicly verified:

1. Disconnect Git integration from the Vercel projects `ad-orientem` and `ad-orientem-preview` in the Vercel dashboard; do **not** enable further Vercel deployments.
2. Remove or redirect any public domain still pointing to Vercel. The legacy `ad-orientem.vercel.app` is **not** the new production URL.
3. Update the GitHub repository homepage field and any external links to the canonical GitHub Pages address. Update or retire old CI checks whose target is the Vercel site.
4. Leave Vercel deletion or production shutdown until the public GitHub Pages site has been verified to avoid a service interruption.

No future pull request, scheduled task, CI release, or manual publication should target Vercel. GitHub Actions and GitHub Pages are the only publication channel.
