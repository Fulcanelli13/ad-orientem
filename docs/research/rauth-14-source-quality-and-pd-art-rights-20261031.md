# Peter Rauth, Edinburgh — 14 painted Stations: photo-source and zero-cost rights decision
Date: 31 October 2026 · Scope: editorial research and publication hold

## Result: two complete photographic collections, one practical-quality candidate

1. **Original works:** Peter Rauth (1828–1896), fourteen large paintings, 1871–1874, Jesuit Church of the Sacred Heart, Edinburgh. Original paintings public domain (artist died 1896). [Church source](https://edinburghjesuit.org.uk/stationsofcross).
2. **Peter Tuffy / Jesuit Church official individual photographs (2019 gallery):** 14/14 native JPEGs successfully decoded. Width 886–1158 px, height 1280–1778 px. Thirteen images have a short side at or above 900 px; Station XIV is 886 px, still potentially suitable for narrow phone screens. These are our **primary quality candidates**. Photographer credited Peter Tuffy; site asserts ©2019 Jesuit Church of the Sacred Heart. This fact is not itself a conclusive determination of copyright originality.
3. **Parish restoration archive (1999–2002):** separate individually linked photographs for all 14 paintings; 14/14 decoded from [archived parish page](https://www.geocities.ws/sharchive/stations.html). Sizes span 300–480 px in width and 414–640 px in height. All fall below the preferred 900-px short-side QA threshold, with historical warnings about poor winter light. These are **reference and restoration provenance** only, not primary app images.
4. **Wikimedia Commons church photographs:** [18 large interior/building photographs](https://commons.wikimedia.org/wiki/Category:Sacred_Heart,_Edinburgh), but not fourteen verified clean reproductions of Rauth's canvases. An individually licensed church photograph cannot silently be treated as a painting source. Free Creative Commons licences are not automatically PD/CC0.

Original native image measurements are permanently recorded in `native-28-photo-metadata-20261031.v1.json`, from GitHub Actions run `41194168406` (repeated successfully after index update). No photograph bytes were archived, posted as artifacts, or activated by the source checker.

## Legal analysis — do not convert a plausible theory into a clearance

- [UK IPO copyright notice](https://www.gov.uk/government/publications/copyright-notice-digital-images-photographs-and-the-internet/copyright-notice-digital-images-photographs-and-the-internet): a merely faithful photographic/digitised reproduction of a public-domain 2D work is *unlikely* to involve sufficient originality for a new copyright. The IPO explicitly cautions that its guidance is not a definitive ruling.
- [UK Parliament's 25 September 2025 answer](https://questions-statements.parliament.uk/written-questions/detail/2025-09-12/HL10481/): courts assess the actual creative choices in each reproduction; different photographs may have different outcomes.
- [THJ Systems v Sheridan (2023), Court of Appeal](https://www.bailii.org/ew/cases/EWCA/Civ/2023/1354.html): establishes the intellectual-creation/free-creative-choice originality framework. **Its facts concerned graphical software charts, not Peter Rauth or specific museum photographs**. Do not cite it as a holding directly removing copyright from these fourteen files.
- [Wikimedia Commons PD-Art policy](https://commons.wikimedia.org/wiki/Commons:When_to_use_the_PD-Art_tag/en): faithful, front-facing photos of old PD two-dimensional art can qualify; 3D frames and original creative choices are disqualifying factors. A third-party's {{PD-Art}} description is **not** a licence granted by the photographer, and one must substantiate its legal application.
- [EU Directive 2019/790 Article 14](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0790): EU Member States protect the public domain in faithful reproductions of expired visual art; it is **not a blanket UK copyright exemption** and is not proof of clearance for global distribution.
- The Church's asserted ©2019 credit applies to the photos, not the original Rauth works. Do not remove credits or falsely declare all photos 'licensed CC0'. Policy requires legal proof for PD and full terms for any Creative Commons material.

## Decisive publication conditions

A particular 2019 file may become a publication candidate **only after**:

- exact image verified to depict a flat original 2D painting alone, with no prominent 3D framing, installation or independently authored photographic composition;
- native file frame/crop, colour fidelity, exposure, suitability for mobile and image provenance assessed individually;
- explicit legal review of the faithfully reproduced image, the source site's claimed copyright, access terms and relevant target jurisdictions, or a genuinely independently PD/CC0 image or acceptable scoped license exception secured;
- earlier user approvals respected; selection of an entire Rauth alternative **not** silently inferred from preferring its style;
- copyright and provenance status logged for each image with no blanket transfer of one photo's status to the rest;
- existing 14-card prayer structure, V/R, recitation methods, cinematics and card boundaries retained during eventual reader integration.

**Current release:** 0/14 Rauth photos legally cleared, 0/14 activated, no fees, no contact, no changes to approved images. The 2019 source is the only practical full-series photo candidate; all older photographs are backup provenance. Uncertainty is not a €0 licence.

## 31 October addendum — exact-native visual diagnostics

Read-only GitHub Actions run `41195668732` inspected **all fourteen original 2019 JPEGs** in memory and recorded each exact source SHA-256, exposure, grayscale contrast, local-edge variation, colour statistics, outer 2.5–3.5% image strips, and entropy. The result is permanently recorded as *metadata only* in `data/prayer/stations/rauth-edinburgh/native-14-photo-visual-diagnostics-20261031.v1.json`. No photographs were committed, redistributed in Actions artifacts, or switched on in the app.

- **14/14** original files accessible, unique and dimensionally suitable for narrow-phone viewing.
- **0** machine-detected major problems for extreme darkness, overexposure, uniformly dark or white edges, or unusually low local detail.
- **1** advisory: Station XIV has a short side of 886 px, just 14 px below the 900-px preference. This is not a release blocker for a narrow phone by itself.
- **14/14** still lack human confirmation that no decorative frame, perspective distortion, reflection or other non-painting visual remains. Do not call these photographs 'frameless' on the basis of numeric metrics.
- **14/14** still require photo-specific UK-origin originality and relevant global distribution rights determination before they can count as PD/CC0 production assets. The owner's published ©2019 claim cannot be reinterpreted as a Creative Commons licence.
- Targeted Wikimedia Commons check: the Edinburgh `Sacred Heart` category contains 18 high-resolution independently CC BY-SA church-location images by Auldcathy and a further exterior photograph; these do not establish a complete separately licensed set of fourteen individual paintings. Treat them as photographic location evidence until each individual artwork is matched and shown complete.

The fail-closed regression test `tests/prayer-rauth-14-original-photo-qa-gates.mjs` passed on GitHub Actions run `41195902143`, preserving exact photo hashes, all 14 Station IDs, and zero premature publication.
