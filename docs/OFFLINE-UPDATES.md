# Offline startup and application updates — v1

The production application has one project-scoped service worker at `sw.js`, registered from `src/app/offline-boot.js` after page load. This does **not** replace the independent, rights-gated Scripture pack cache in `src/scripture/offline.js`.

## What is guaranteed

- A completed first online snapshot is required before offline Home can start. The snapshot contains `index.html`, linked static assets, and the traversed static ES-module/CSS dependency graph.
- **Core Prayer first-use is included:** the four literal lazy entry points owned by `src/pray/browser-entry.js` and their static dependencies are part of the committed snapshot. Once the first online snapshot is complete, a user can enter the ordinary Rosary through the real 15-decade method chooser and advance a prayer offline, even if they have not opened Prayer online. This is an explicit, bounded exception to the otherwise on-demand dynamic-import policy.
- Files are fetched and SHA-256 fingerprinted before committing a versioned cache. A completion marker and a second fetch of entry HTML guard against partial writes or a changing deploy. Failure leaves the previous committed version intact.
- Subsequent navigations use the committed snapshot, including while offline. Offline fallback is explicitly scoped to the GitHub Pages project. The worker never takes over unrelated URLs or storage.
- A newer snapshot is offered as **Update / Later**. It is never substituted silently while the current document is running; users must choose to reload. A live Mass requires additional confirmation. Existing tabs continue using their version until they navigate.
- Previously visited additional module assets may be served offline from the current version when cached.

## What is not guaranteed

- Not every Mass Proper, every Latin/French Bible passage, deep Formation dossier, pilgrimage/mapping resource, externally linked Rosary source, or linked website is part of the core snapshot. Core Rosary prayers can open offline after initial bootstrap, but remote sources, optional art and deeper dynamic content can still be unavailable. Do not advertise “the entire app works offline.”
- Updates are checked on online entry, connectivity restoration and return from an inactive tab (with a 30-minute throttle). No server push or background notifications are promised.
- The first download can be substantial. Browser storage quotas and eviction remain in force; offline startup requires that the browser retain the cache.
- Individual dynamic data URLs are not always content-addressed. If a domain asset was never cached, a later online fetch can come from a newer deploy. This v1 guarantees coherent *pre-cached bootstrap files*, not arbitrary deep-link transaction isolation.
- The worker deliberately does not delete older completed snapshots automatically, because a long-lived Mass tab could still rely on them. Browser storage may eventually evict these caches. Follow-up: safe reference-counted cache retention and a storage quota/status panel.

## Installed-version parity and two web addresses

- **Installed pilot origin:** `https://fulcanelli13.github.io/ad-orientem/`. A Home Screen icon installed from this site remains on the GitHub Pages origin and its transactional service-worker snapshot. The current production `main` branch is deployed there by GitHub Pages, but a prior snapshot may stay active until the user explicitly installs the staged update.
- **Separate Vercel web site:** `https://ad-orientem.vercel.app/`. It receives the same GitHub repository but runs as a network-based site, not as the GitHub Pages PWA's offline snapshot. Opening Vercel does **not** update, replace or migrate the GitHub Pages install or its origin-scoped local preferences.
- On the existing GitHub Pages installed app, open **Settings → Installed app & sources**. Check the **This site** address, **Launch mode**, **Release label** (product version only), and **Offline snapshot** (12-character content fingerprint, *not* Git commit). Tap **Check for updates**, then **Install ready update** only if a newer completed snapshot is offered. This is explicit, safe update/reload, not a forced Mass interruption.
- If the same origin already has an installed icon, **do not reinstall** merely to pick up a new Calendar/Home change. Never routinely clear site data: doing so may remove stored preferences/progress. Test one real handset before claiming installed-mobile parity; GitHub Actions browser emulation alone does not prove the user's Home Screen icon has updated.
- On Vercel, the installed GitHub Pages update button is intentionally unavailable. Reopen Vercel online for its current network build; use the Home Screen icon's Settings for the original GitHub Pages installation.

## Operational recovery

If the app cannot load while offline, reconnect once, open Home, and let the offline snapshot complete. If the browser reports repeated failed stages, check the console for `AO_OFFLINE_APP_V1.status.error`; the previous completed snapshot should remain usable. Reload online and accept the update if it appears. Site-data removal resets the offline snapshot and also removes other local data; it is **not** a normal update procedure.

## QA and release gates

`node tests/offline-snapshot-e2e.mjs` exercises first online staging, a real offline Home reload, **first-use Rosary method selection and prayer advancement offline**, rejection of an intentionally incomplete release, explicit new-version selection, and a second offline reload under the `/ad-orientem/` project prefix. It additionally checks that the completed version contains the four canonical Prayer lazy entry points and remains inside the 320-item / 35 MB core snapshot limits. The standalone GitHub Action `Offline snapshot acceptance` runs it on pull requests touching the worker/bridge and on main deployments. App convergence and visual acceptance remain separate required checks.
