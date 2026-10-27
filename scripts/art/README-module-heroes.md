# Ad Orientem module hero asset acquisition (zero-cost)

The 22 **editorial selections** are frozen in `data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json`.
The **asset readiness audit** is `data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json`.
Do not silently replace paintings, merge editorial approval with rights approval, or treat webpage metadata as a downloaded file.

## Workflow

1. Inspect all Commons metadata (no images saved): `python3 scripts/art/acquire-module-hero-masters.py`
2. Acquire only public-domain-file candidates classified `commons_pd_art`: `python3 scripts/art/acquire-module-hero-masters.py --download`
3. Original files are staged in `assets/staged/module-hero-masters/`. The script checks Commons SHA-1 against the bytes and reports local SHA-256. Retain the original, unaltered bytes.
4. Visually confirm exact painting, holding institution, no photographic degradation, correct orientation and colour, and full composition. Do not use AI reconstruction or uncontrolled upscaling. Reconcile institution inventory and reproduction terms for each file.
5. Record file-specific rights, needed attribution and permanent SHA-256 provenance. Promote only *verified and licensed* originals to a permanent, zero-cost, versioned repository location. Do not rely on GitHub Actions artifacts (these expire). If repository size becomes impractical, retain only source masters within appropriate documented free storage allowances; do not use metered storage.
6. Create separately reviewed crops for portrait and landscape surfaces, while retaining access to uncropped full painting; use responsive focal positions. Saint Jerome, Pentecost, First Mass in Brazil, and other horizontal paintings must not be auto-centre-cropped without manual review. Lotto's Rosary hero should preserve its fifteen medallions.
7. Mark an asset ready only after the approved crop renders correctly on phone and desktop, with correct credit/source accessibility and a clean integration test in the actual app.

## Rights gates

- `commons_pd_art`: Wikimedia file page claims faithful-reproduction public-domain status; acquisition can proceed to human jurisdiction/license review, **not automatic release**.
- `attribution_required`: Lotto photograph by **Sailko**, **CC BY 3.0**, needs a conspicuous artwork/photograph credit, licence URL, and indication of alterations. Script will not automatically download until attribution policy is reviewed.
- `licence_conflict_manual`: Restout higher-resolution 2015 photo has Commons PD-Art marking but the photographer EXIF contains **CC-BY-SA**. Must resolve the exact rights of the image before any use.
- `rights_conflict_manual`: Art UK restricts reuse of its *The Prayer* display; an independent Commons listing is a candidate but cannot inherit Art UK's terms or vice versa. The user approval remains unchanged.
- `source_link_wrong_fixed_candidate`: the Christ the King ledger source at Christie's lot **6223948** describes an unrelated Italian ceiling painting; the verified Benson *Salvator Mundi* is lot **6238407**, and Wikimedia has a candidate 2,987 × 3,200 reproduction. Confirm the file matches the user's original selected visual; do not overwrite editorial source or selection until provenance is reconciled.
- `resolution_shortfall`: Guardian Angel source is 694 × 1100; Gérôme original art source is 1600 × 990. Seek better free originals; do not generate larger synthetic variants.
- `poster_reproduction_review`: Our Lady of Perpetual Help has an editorially approved **poster scan**, not the original icon photograph; iconographic fidelity and poster photographic reuse must be checked.
- `museum_public_domain_object`: Seven Sorrows MNAC inventory **008327-000** records the artwork as public domain, not yet a verified master download.
- `master_rights_pending`: neither media bytes nor reuse approval has been checked.
- `museum_public_domain`: museum identifies media as open access; downloaded exact bytes and SHA are still needed.

## Safeguards

- Cost: €0 only. No paid requests, paid datasets, paid cloud storage or subscription dependencies.
- Source: Wikimedia Commons Metadata API only, using original file URLs returned by Commons. No scraping secondary image search results.
- No automatic resizing, editing, publication, app integration, or status promotion.
- No GitHub Actions artifacts as primary storage. No claim that a *candidate* is a *master*.
- Production gate remains **0/22** until actual byte acquisition, visual QA, reuse/credit, and crop/app tests occur.

## Painting fidelity inspection (mandatory)

[Painting visual-fidelity policy](../../docs/module-hero-painting-visual-fidelity-policy-20261026.md) sets the real-world standard. Do not infer painterly quality from file size or pixels. After acquiring real source files:

```bash
python3 scripts/art/review-module-hero-quality.py
python3 scripts/art/assert-module-hero-release.py rosary
```

The quality script produces *unedited* source-colour previews plus 100%-scale detail crops and a machine-readable checklist. The second script blocks production promotion while **any** master, verified museum identity, SHA-256, visual-review item, rights approval or responsive crop is outstanding. Do not run the second test as an unrelated app-wide release gate: it evaluates one module hero's attempted promotion and all 22 heroes are still rightly pending master review.
