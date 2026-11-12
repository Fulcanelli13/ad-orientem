# Prayer Church R10 — original Claude interior, production-host pilot

**Scope:** source-first integration of the owner's already-reviewed R8 Prayer Church, not a new church design. The baseline Prayer UI is unchanged. **Release hold** remains in effect.

## What actually exists in this branch

- `src/pray/church-host.v1.js`: guarded same-origin iframe host for the original R8 interior, its camera, gallery, lectern and Places UI.
- `src/pray/browser-entry.js`: optional `?aoChurchPilot=1` path. On failed or absent Church assets it falls back to the current production Prayer reader. Normal navigation is unchanged without this flag.
- `src/pray/church-novena-route.v1.js` from the preceding R9 branch: existing production `AO_NOVENAS_V3` remains the source of all 19 novena programmes.
- `tools/pray/stage-claude-church-r8.mjs`: imports the **owner's actual R8 source** from a local extracted package, checks source signatures and painting assets, preserves the original Church JS and inserts only a suspend/resume listener. The generated manifest records its SHA-256 and source-artwork coverage.
- `tests/pray-claude-church-host-r10.mjs`: checks iframe lifecycle, same-origin Home exit, no network dependency for the test, source integrity and no font copying.
- `tools/build-web-preview.mjs`: explicitly excludes `assets/pray-church` from GitHub Pages even if the owner's source package is staged there. Publication requires an independent source/artwork/accessibility release decision.

## Staging the original review package

Unzip the owner's **Ad_Orientem_R8_Church_Novena_Integration.zip** outside the Git repository. From the Ad Orientem checkout:

```sh
node tools/pray/stage-claude-church-r8.mjs \
  --source /path/to/unzipped/Ad_Orientem \
  --dest assets/pray-church
node tests/pray-claude-church-host-r10.mjs
# Full 3D Church test (only after the original R8 source is supplied):
AO_R8_SOURCE=/path/to/unzipped/Ad_Orientem \\
  node tests/pray-claude-church-staged-phone.mjs
```

The target is a **staging surface**, not permission to publish. The copy is local and does not fetch proprietary media. The importer **does not copy font files**. The original source and artwork files remain the owner's review package; no alternative paintings or rebuilt 3D geometry are substituted.

Once staged, a local HTTP server serving the repo can open:

`/index.html?aoChurchPilot=1`

Do not use `file://` for the cross-frame production-reader check; the pilot requires a same-origin served app.

## Behaviour

1. Enter Pray with the pilot flag. If the staged R8 scene is present, it opens its original immersive Church.
2. Places, interactive painting galleries, the lectern's Tabula, movement controls and west-door Home exit are rendered by the unchanged R8 source.
3. When an R8 novena door invokes `window.parent.AO_PRAY_APP_V1.openChurchNovenaRoute(...)`, the **existing production N3 reader** opens in the parent. The host hides the iframe and signals the renderer to stop its animation while praying.
4. When the reader's real Back action triggers its one-time Church return callback, the host shows and resumes the original Church, and R8 restores the originating gallery/camera.
5. The shell's Home exit removes the iframe. Its event listeners and scroll lock are released. No second text database or Church renderer is installed.

## Tested versus not tested

The source staging and iframe owner have Node contract tests. R9's successful 76 real reader journeys establish N3 reader/return callback compatibility, **but do not themselves certify that R8's iframe camera and gallery state restore**.

Before publication, perform an actual served-app browser test with staged originals at 320px and 390px for both languages, test every Church door and the lectern, verify full painting references, Back and Home exit, screen-reader and keyboard access, and inspect the approved image source/licence records. In particular, test performance on a physical phone and validate that suspend actually stops R8's animation loop.

**This PR is not a release and contains no R8 painting files or font bundles.** Pages exclusion is intentional. Do not merge or deploy until gates are green and the original source has been reviewed in the production shell. Deployment policy remains **GitHub Actions + GitHub Pages only**, never Vercel.

The staged browser test above **fails loudly if the original R8 files are absent**. It is not part of default CI because the owner-supplied image bundle is not committed or licensed for public publication. It exercises the original Places menu, Votive Candles entry, a real N3 St Joseph novena, Back-to-original-gallery and west-door Home exit at 320/390px and EN/FR. Successful execution is a prerequisite to lifting the publication hold; it is not assumed from the green host unit test.
