# R35 — one-pass original-JPEG recovery for the frozen 19 approved Sacred Atlas covers

**No photos are published by this workflow.** This preserves the original R28 owner-approved file titles/SHA-1s, all R29 rights and crop gates, and the existing 379/530 public covers. It never changes the public media registry.

The existing R28 source verifier already checks Commons metadata (file title, current SHA-1, byte length, JPEG MIME, dimensions, photographer and CC licence) before obtaining the original from Wikimedia's reported `upload.wikimedia.org` URL. It makes one serial attempt per source, waits at least 6 seconds between source requests, and **halts immediately on HTTP 429** without mirrors, proxies, other hosts, automatic retries or scheduled runs.

R35 adds a deliberately optional **retain-verified-originals** switch. Only after *the downloaded bytes match the frozen original SHA-1 and dimensions and decode successfully* does the script retain `<sha1>.jpg` under a temporary GitHub Actions artifact with 7-day retention. The ordinary offline R28 run has no download or retention. The original files are not published to GitHub Pages and are not registered as approved covers.

## Operator path — GitHub Actions only

1. On GitHub, open Actions → **Sacred Atlas R35 — manually recover frozen original JPEGs** → **Run workflow** on **main**. Choose **probe** (one original).
2. Read the workflow artifact `report.json`. If it reports HTTP 429, stop; do not run another batch until source access is allowed. A successful workflow execution is **not** an image or rights approval: examine `originals_verified`, `retained_originals`, and each per-place outcome.
3. Only after a successful, legitimate probe, run **remainder** to check original selections 2–19. Do not run **all** if the probe has already been acquired; this avoids duplicate requests.
4. Recover the two artifacts in a single local source directory (retaining SHA-1 filenames) and invoke existing `tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py --source-dir ... --output-dir ...` for non-public WebP previews and a batch QA report.
5. Independently clear the seven R29 per-photo rights/source-revision/site/mobile-quality gates. A further reviewed publication PR may run R29 `--apply` for only eligible rows. GitHub Actions and GitHub Pages remain the only deployment path.

**Important:** Original-source retrieval cannot itself clear underlying architectural/sculpture rights. The selected Haemi image must remain bound to its canonical main church; La Salette's winter night selection depicts the welcome centre and remains frozen as chosen. The small Zacatecas image has no added native resolution. Bettbrunn and Hannover have special near-image attribution requirements.

There is no automatic trigger for the download job: pull requests run only synthetic offline tests. The user need not choose the photographs again.
