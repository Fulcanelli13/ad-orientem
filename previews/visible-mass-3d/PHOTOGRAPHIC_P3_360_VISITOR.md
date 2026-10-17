# Visible Mass P3 — Genuine 360° panorama visitor proof (2026-10-17)

This P3 builds directly on the accepted **P2 photographic living glossary**. Delivered as the verified portable attachment `The_Visible_Mass_360_Brompton_Newman_P3.html` (about 21.5 MB, embeds photographs). It has **no generated images** and no external network runtime dependencies.

## Real spherical photographs
1. **Brompton Oratory, London**: `Brompton Oratory 360x180, London, UK - Diliff.jpg` by **DAVID ILIFF**, genuine 360°×180° panorama; original 13,704 × 6,852, Commons file https://commons.wikimedia.org/wiki/File:Brompton_Oratory_360x180,_London,_UK_-_Diliff.jpg, **CC BY-SA 3.0**. Principal TLM exploration environment; the panorama itself depicts architecture, not a 1962 service.
2. **Newman University Church, Dublin**: `Newman University Church Interior 360x180, Dublin, Ireland - Diliff.jpg`, by **DAVID ILIFF**, genuine 360°×180° photograph; original 13,700 × 6,850; https://commons.wikimedia.org/wiki/File:Newman_University_Church_Interior_360x180,_Dublin,_Ireland_-_Diliff.jpg, **CC BY-SA 3.0**. Strictly historical Catholic architecture exploration. **Never describe Newman as currently celebrating TLM or use its photos as 1962 liturgical proof.**
3. Five Newman church details fetched from actual Commons records (three main altar details, pulpit, apse), with individual source URLs and licences in the attached offline HTML's "Photo sources". Only three of those details are in the initial navigation; the rest are available for reviewed future expansion.

All panorama assets were downscaled/recompressed as separate adapted CC BY-SA photographs with the licence/source/attribution preserved prominently on screen and in the credits, with copies of the original source URLs in the data. Build action `.github/workflows/visible-mass-360-assets.yml` fetched and verified these, uploaded an artifact and the compiled HTML reuses the embedded photographic content from accepted P2.

## Reader architecture
- Genuine **360° looking around from a fixed photographic vantage point**; NOT six-degrees-of-freedom walking, photogrammetry or fictitious connected rooms.
- One portable self-contained HTML. The viewer uses a tiny embedded WebGL spherical shader; in browsers without WebGL it switches to an embedded software-rendered rectilinear panorama, not flat stretching.
- London main route: 360 nave → detailed high altar still → real TLM moments. Side chapels only entered deliberately.
- Dublin: explicit independent choice → 360 nave → historic altar/pulpit/apse views. Never silently moves between unrelated churches.
- Real glossary IDs for tabernacle (G080), high altar (G404) and altar (G079); the P2 eight existing `MF01–MF08` mass-formation stage summaries remain embedded, with existing real TLM photo moments separate.
- No changes to `src/mass`, `src/learn/mass-explorer.js`, or any production reader, and no merging of this draft PR.

## Accepted tests and remaining limits
- Both panoramic photographs embedded in their entirety at mobile-compatible 4096×2048; WebGL viewport shader and renderer implemented; Chromium sandbox disabled WebGL so full P3 UI interaction was verified via **CPU panorama fallback** in Chromium. Both 360 scenes, drag rotation, Newman altar, London altar, stage list, return transitions, photo credits: functional. Mobile 390×844 renderer verified without JS errors.
- Panorama resolution is lower than the photographer's originals; retaining the exact Commons source links allows a future optimized tiled image loader. The current HTML is **21.5 MB** and is a research proof, not production image delivery.
- No user acceptance yet for panoramas or UI. Rights, historical scene/object interpretation, mobile performance on actual device and full canonical registry parity must be reviewed before merging.
