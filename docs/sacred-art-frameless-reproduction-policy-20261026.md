# Sacred-art display rule — the painting, never the museum frame
**Ad Orientem editorial directive · 26 October 2026**

Applies to **all** painted artwork shown as an image in Ad Orientem, in particular:
- the **22 approved devotional module heroes**;
- **all Class I feast paintings**, including the ten date-specific selected feast heroes and subsequent Class I selections;
- the same artwork when reused on Home, Calendar, Pray, or supporting artwork panels.

## Non-negotiable displayed-image standard

1. **Show the painting, not a photograph of a framed object or an exhibition.** No wooden or gilded frame, mat, passe-partout, exhibition wall, surrounding sculpture, display labels, museum visitors, lighting fixtures, or adjacent paintings. Do not treat a CSS container around the picture as a physical photographic frame; this restriction concerns the actual pixels *inside the displayed image*.
2. **Preserve all genuine painted content**, including artist-painted illusionistic mouldings, architectural frames *within the painted scene*, irregular canvas/panel edges when intrinsic to the painted object, inscriptions, signatures, figures, borders and all medallions. Never crop a painted boundary or theological/iconographic detail simply to make a convenient aspect ratio.
3. **Prefer a professionally captured full-frame image of the painting itself**, photographed front-on with even lighting, no perspective skew or glare. A source photograph showing a physical frame is not a first-choice master just because it has more pixels.
4. **If no separate frame-free original exists**, preserve and checksum the unchanged source bytes, then propose a distinct, human-reviewed *non-painting-area trim only*, with exact image-pixel crop bounds recorded. It must remove the entire physical frame and room while preserving all of the painting. If the image is angled or occluded and a clean trim cannot do this, mark it **BLOCKED — REACQUIRE**. Do not use algorithmic frame detectors as proof or reconstruct/extend painted corners with AI.
5. **Always show the entire painting as the default artwork view**, using an appropriate contained layout. A second mobile *detail* can be offered only as a separate deliberately labelled view (with the full painting available); it must never silently replace a composition containing more iconography.
6. **Keep the original evidence separate** from publication derivatives. Original source path, photographer, source SHA-256, exact object identity, source terms, derivative SHA-256, crop rectangle and sign-off must remain linked.

## Frame-specific release evidence

Every candidate must explicitly record:

- `physicalFrameAbsent: true` — no external physical frame visible in output image;
- `gallerySurroundAbsent: true` — no museum wall, mat, installation, adjacent paintings or photographic white margins;
- `paintingSurfaceComplete: true` — every painted edge and pictorial element survives intact;
- `paintingBoundsVerified: true` — a human checked the actual final image bounds against the correct artwork;
- `noSyntheticFill: true` — no inpainting, generative extension or fake paint;
- `reviewedDerivativeSha256` and `sourceOriginalSha256` plus crop bounds if a separate derivative is made.

Unknown/null is NOT approval. Any missing true gate blocks promotion. Dimensions, automatic edge detection or `object-fit:contain` do **not** demonstrate frame absence.

## Existing Class I candidate review (2026-10-26)

Ten currently selected date-specific Class I feast source-derived WEBPs on `fix/approved-feast-heroes-main-20261021` were inspected visually. **None has production photo approval yet.** Artist and title approvals remain fixed.

| Date | Selected feast painting | Existing candidate frame assessment | Action |
|---|---|---|---|
| Mar 29 | Anthony van Dyck, *Entry of Christ into Jerusalem* | No obvious external physical frame at preview scale | Human bounds verification pending |
| Apr 02 | Ugolino da Siena, *Last Supper* | **Prominent gilded external physical frame visible** | **BLOCK** this derivative until a complete frame-free photo or verified non-painted trim exists |
| May 23 | Juan Bautista Maíno, *Pentecost* | No obvious external physical frame | Human bounds verification pending |
| May 24 | Jean Restout, *Pentecost* | No obvious physical frame on previously staged low-resolution painting view; separate newer higher-resolution reproduction has glare | Find clean faithful frame-free source; retain original selection |
| May 27 | Philippe de Champaigne, *La Petite Cène* | No obvious external frame | Human bounds verification pending |
| Jun 12 | Juan Patricio Morlete Ruiz, *The Heart of Jesus* | Oval portrait frames appear to be **painted iconographic elements inside the work**; NOT removable physical photo frames | Keep intrinsic painted oval frames; inspect outer edge only |
| Oct 25 | Ambrosius Benson, *Salvator Mundi* | **White photographic margins outside the rectangular painting** | Trim only external white space; preserve every painted pixel |
| Nov 01 | Carlo Saraceni, *Paradise* | **Visible dark/brown physical-looking perimeter border** | **HOLD** pending review distinguishing original panel margin from removable external frame; never automatically trim the artwork |
| Nov 02 | Ludovico Carracci, *An Angel Frees the Souls of Purgatory* | No obvious external frame | Human bounds verification pending |
| Nov 29 | John Martin, *The Great Day of His Wrath* | No obvious external frame | Human bounds verification pending |

These are observations from the already staged source-derived previews, **not final quality, colour, licence or production approval**.

## Devotional module alignment

- Dürer's *Adoration of the Trinity* — never use a photograph of the whole carved Landauer altarpiece as the module hero; prefer the full **painted panel alone**. Preserve architectural context photography separately as educational evidence.
- Murillo, Ingres, Lotto and other complete canvas/panel reproductions — check their physical perimeter, including any unpainted backing and margins; remove extraneous photo borders if and only if every genuine painted edge remains.
- Murillo's *Prodigal Son* and Lotto's fifteen Rosary mysteries must not lose narrative context to mobile crops.
- Photographs of **gallery rooms**, such as the 6,000×4,000 Gérôme museum installation, are ineligible regardless of pixel dimensions.
- Decorative borders or frames **painted by the artist inside the composition** are authentic art and must be kept.

The requirements are *cumulative* with source ownership, €0 usage rights, photographic fidelity, native-pixel quality, accessible full view and mobile layout validation.

**No image automatically becomes published or approved by this policy.**
