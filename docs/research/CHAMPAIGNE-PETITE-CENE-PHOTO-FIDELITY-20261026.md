# Philippe de Champaigne — *La Petite Cène* (Louvre INV 1125)
## Exact-photo fidelity audit, 26 October 2026

**Two independent feast approvals:** Holy Thursday (2026-04-02; replaces Ugolino da Siena at user request), and Pentecost Ember Wednesday (2026-05-27; prior approval retained). **One identical source photograph for both uses.** Editorial choices are locked. No photograph is production approved yet.

### Four source-based photographic comparisons

| Source | Screenshot | Finding |
|---|---|---|
| Existing Commons original, 1112 × 591 | ![Old full-painting view](https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/whole-commons-full-review.jpg) | Frame-free and complete, but limited fine detail |
| Tangopaso camera original, 2816 × 2112 | ![Photograph with physical gilded frame](https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/tangopaso-museum-full-review.jpg) | Actual painting complete and clearer; frame and room make it unsuitable as the hero itself |
| Derivative C, 2250 × 1208 | ![Crop C with residual gold](https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/C-canvas-interior-clean-full-preview.jpg) | **FAILS strict frame-free condition**: independent native-pixel bottom perimeter test found a small gilded physical frame strip. Preserve as rejected QA evidence |
| Derivative D, 2250 × 1208 | ![Crop D without apparent gold strip](https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/D-bottom-frame-trim-review-full-preview.jpg) | **Preferred research candidate**, tighter around the painted area, with no obvious gilded border in the preview; still requires native-pixel confirmation of zero frame **and** zero lost paint |

[Mobile and desktop QA research page](https://github.com/Fulcanelli13/ad-orientem/blob/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/mobile-desktop-visual-qa.html), [native-pixel perimeter strips](https://github.com/Fulcanelli13/ad-orientem/blob/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research/D-frame-free-perimeter-inspection.png).

An earlier full-responsive automated browser test used **C** and passed four widths (320/390/768/1440) for layout, not image quality. A separate rerun targets **D**. Never use the previous C browser success as a D artwork or release certification.

### Source and image integrity

- [Louvre exact work](https://collections.louvre.fr/ark:/53355/cl010062076), INV 1125, **80 × 149 cm**, c. 1651–52. **Never substitute** the different *La Grande Cène* INV 1124 or an engraving/copy.
- [Commons 1112×591 source](https://commons.wikimedia.org/wiki/File:Champaigne_Petite_C%C3%A8ne_Louvre.jpg): SHA-256 `d4d8b3c1ea957c9517a24c62a97ab7143e07cdec2434c77ee05df17a5b29a320`; Commons PD-Art marking (jurisdiction rights review pending).
- [Commons original photograph by Tangopaso](https://commons.wikimedia.org/wiki/File:Philippe_de_Champaigne_-_La_Petite_C%C3%A8ne_(Louvre,_INV_1125).jpg): **photographer's explicit public-domain dedication**; original SHA-256 `3fce64afc767c16b803fd250e685f3a64caedb7e474380d3afeca68d84331942`; original camera file retained unchanged on research branch.
- Rejected derivative C SHA-256 `99e102df2d3644783bce3ac4cb81002337f8eb166583d84f74c630be6a8efc0f` (**residual physical gold band**). Improved research derivative D SHA-256 `f0742b795178e1a600e43694693f880a07039587b74ba6f352ccbf389919cb30`. D source quadrilateral in 2816×2112 camera pixels: TL (274,456), TR (2534,454), BR (2535,1643), BL (272,1642). Sampled without synthesis via Pillow bicubic QUAD projection; no AI, colour correction, atmospheric enhancement, painted restoration or object insertion.
- All original files, A/B/C geometric test derivatives, overlays and per-source checksum manifest: [research/champaigne-inv1125-photo-review-20261026](https://github.com/Fulcanelli13/ad-orientem/tree/research/champaigne-inv1125-photo-review-20261026/assets/staged/champaigne-petite-cene-research).
- **Reject A, B and C for final frame-free display**: visible moulding remains in A/B, and the native-pixel quality sheet caught a narrow gold strip in C. **D is the only remaining preferred frame-free research candidate**, not yet a production pass.

### Quality before pixels

Native-camera samples make Jesus's facial modelling, blue garment and faces at the edges clearer than the existing small photo. The camera photo, however, is *cooler and more washed out* than the old reproduction, with some visible gallery reflection/photographic haze in its darker painted background. Do **not** 'correct' it by matching an uncalibrated Google/Commons JPG. Colour requires cross-checking against a credible institution colour reference.

The [Gallerix 3528×1881 photograph](https://gallerix.org/storeroom/1265835004/N/3648454315/) appears full-frame and may make a useful visual reference, but its independent reuse permission has **not been proven** and it is excluded from our public image archive or live app. Louvre/RMN professional photography has separate restrictions for uses outside its free-listed categories ([Louvre image terms](https://collections.louvre.fr/page/cgu)); the Bridgeman high-resolution master is paid and prohibited by the user's €0 rule.

### Outstanding release gates

1. Compare derivative D **at full scale** with original boundaries, ensuring that no genuine painted content has been cut to remove the frame. The crop is **not yet signed off**.
2. Verify actual tonal and colour fidelity against reliable museum reference. Do not artificially darken, saturate or reconstruct.
3. Confirm reuse rights in all app distribution jurisdictions, plus whether the Louvre site restrictions apply to the independently dedicated photograph.
4. Test mobile 320/390 px, desktop and tap-to-view-full layouts in actual Ad Orientem. A 2250×1208 horizontal composition should normally be `contain`, not vertical centre-cropped.
5. Only after checks explicitly set photo release statuses to true and use the **same** approved source in Holy Thursday and Pentecost Ember Wednesday; do not duplicate.
6. Keep old archival Ugolino provenance while removing its framed photo from active Holy Thursday selection.

**Current decision:** `PHOTO_D_PREFERRED_RESEARCH_PENDING_COLOR_BOUNDS_RIGHTS_AND_APP_QA`. Production releases = **0**. Editorial approvals = **2**.
