## Update — actual CC0 Leclerc Communion image located and viewed

**The earlier statement that the Leclerc image itself had not been viewed is now superseded.** The actual scan of plate 29 has been located on Wikimedia Commons:

- https://commons.wikimedia.org/wiki/File:Priester_met_twee_misdienaars_voor_een_altaar,_RP-P-OB-69.179.jpg
- 1661 Sébastien Leclerc, `RP-P-OB-69.179`, engraved caption `Quand le P. communie`.
- Current losslessly cropped Commons original **657 × 1045 pixels**, labelled **CC0 1.0**. Wikimedia file history offers an earlier 2024 **1686 × 1843** uncropped museum-scan rendition.
- Museum: https://id.rijksmuseum.nl/200217641, identifies original as public domain.
- **Actually visually inspected:** celebrant bends towards the altar, his head and hands near his mouth; a chalice visibly remains on the altar, a server kneels and another stands. This corresponds to the printed Communion *context*.
- **What is still not visible enough:** two Host halves, exact finger positions, and whether both elbows rest on the altar. **Not the chalice Communion:** the priest is not lifting the chalice to drink, and the paten is not visible under a chalice in the left hand. It must not be assigned to `RECEIVES CHALICE`.
- **Technical outstanding:** actual image pixels were viewed through the media service, but copying the binary to the working container failed, so no original bytes or locally computed SHA-256 are stored; the provenance release gate remains blocked.
- **Approved-family outstanding:** the print's detailed ink style and expansive scene are **not** the Ad Orientem accepted priest icon family. No icon has been drawn or approved from it.

**Conclusion:** the real historical source and its digitized CC0 image are now identified; this solves an important provenance and rights question. It does **not** solve the exact Host/chalice hand-and-vessel pictograms or permit production release.

---

# P3 Source acquisition — Leclerc’s original 1661 Mass illustrations

## Verified

The **Rijksmuseum's own object catalogue** confirms that the original print `RP-P-OB-69.179`, plate **29**, is titled *Quand le P. communie*. It belongs to a Catholic sequence of priestly Mass actions by **Sébastien Leclerc I**, published at Metz in **1661**, in an illustrated work attributed to **L. Mengin**, publisher **Claude Bouchard**. The museum explicitly gives the work as **public domain**.

- Original: https://id.rijksmuseum.nl/200217641
- Public-domain and catalogue information: https://www.rijksmuseum.nl/nl/collectie/object/Priester-met-twee-misdienaars-voor-een-altaar--a94279fd154e2a5849c70568bf1ee28f
- Complete currently enumerated source index: `data/presentation/mass-icon-originals-leclerc1661.p3.json`

The series also contains documented separate etchings of the Offertory (13), Canon (19), Host elevation (21), Fraction (26), breast strike at Agnus Dei (28), priest Communion (29), ablutions (30), and Postcommunion (31). These are distinct scenes: **an ablution is not the priest consuming from the chalice**, the elevation is **not** consuming the Host, and Fraction remains text-only under P2. Do not substitute their art for plate 29 merely to fill an illustration gap.

## Still not verified for production

Although the **exact print is now visually inspected through the Commons image**, no binary has been archived locally and the exact divided Host, elbows, chalice and paten positions remain uncertified. Consequently neither action-specific icon has a locally verified original image plus complete rubrical evidence. A visually inspected original must not be confused with approved source for either essential action.

The 1661 artwork is historical iconographic evidence, **not** an independent source of 1962 rubrical detail: when the original and `Ritus servandus` X.4–5 differ, the latter governs Ad Orientem's UI.

## Exact acquisition sequence

1. Retrieve plate **29** from the official Rijksmuseum download or IIIF image API, preserving its official source object number, original link, technical metadata, and file bytes. Check licensing notice on the exact downloaded resource, not merely the page's general rights.
2. Record `assets/references/mass-icon-originals/<source-name>` and SHA-256 in the P2 provenance registry. If the original itself should not be distributed, keep a private backing reference and do not publish source file to the public app repo; the gate must be satisfied by an authorized asset location.
3. Inspect exact gestures **without OCR inference**. Mark separately whether priest consumes the Host, drinks from chalice, and whether the chalice is held in the right hand with paten below in left. Mark unknown rather than guessing from plate title.
4. Compare the actual source with relevant 1962 rubrics: Host with celebrant inclined, elbows resting on altar; chalice received at altar with correct hands/paten. No simulated correction before fact checking.
5. Compare any transformed drawing side-by-side with three reviewed Ad Orientem priest family masters (`priest_elevate_chalice_rich`, `priest_rail_after_rich`, `priest_incense_altar_rich`) at 32 and 48 px. Source engraving's line quality is **not permission to replace the approved icon family aesthetic**.
6. Obtain user's approval of the matched result. Until then, this inventory is **research-only** with zero runtime icon keys activated.

## Coverage and regression

`npm run test:mass-icon-source` now includes `tests/mass-icon-originals-leclerc1661.mjs`. It validates all eight distinct institution-sourced catalogue records and specifically prohibits a museum catalogue-only record being promoted into `originalPictures`, `APPROVED_FOR_PRODUCTION`, or a reader icon.

This source is complementary to the restricted Romanitas 1944 photo series, Carlos Sierra's Cathopic photograph, the in-copyright 1934 Subercaseaux lithograph, and the uncertain 1897 Lanslots book. It is a substantial improvement in provenance and rights evidence **but not yet a finished or visually audited picture**.

## Rubrical correction — Schumacher is NOT proven to depict consuming the Host

*Ritus servandus* X.4 requires two separate actions: (a) consuming both halves of the Host with elbows on the altar; (b) **after consumption**, rising, joining hands before the face and pausing in meditation. Schumacher's drawing clearly depicts **hands joined before the face**, but neither Host halves nor the actual act of consumption. Therefore, while its printed subject is "Priest Communion", the **closest identifiable pose may be post-consumption meditation**. It may be useful as Mass context or a rubric illustration, **not** as direct source evidence for the essential `RECEIVES HOST` action icon. Do not synthesize or assume the missing Host. The chalice on the mensa is not evidence of the celebrant drinking from it.

Authority: https://1962ordo.today/1962-rubrics/ , *Ritus servandus* X.4, immediately following *Corpus Domini nostri Jesu Christi*.

## Second original image (full illustration inspected): Schumacher, 1920

A distinctly stronger, **actually viewed** original is Philipp Schumacher's *Kněžské přijímání* (Priest Communion), published in Wilhelm Pichler's *Katholisches Religionsbüchlein für die unteren Klassen der Volksschule* (Vienna: Österreichischer Schulbücherverlag, 1920), **page 97**. Wikimedia Commons stores the 1,265 × 964 scan and describes the artist, source and **public-domain / mechanical scan** terms:

- Original scan and legal rationale: https://commons.wikimedia.org/wiki/File:Komunii%C4%9Do_(Schumacher,_Katholisches_Religionsb%C3%BCchlein)_001.jpg
- Original-image metadata and pictorial inspection: `data/presentation/mass-icon-originals-schumacher1920.p3.json`
- Commons' SHA-1 checksum `3073f3c53d38c007a821d3fe1c3dc3fe8d103436` is **catalogue metadata**, not a locally computed SHA-256.

The image was viewed at source resolution in web media display. It visibly shows a priest inclined over the traditional altar, with hands together at his mouth, chalice on the altar, altar server kneeling, and congregation beyond the rail. However **the divided Host itself is indistinct**, and exact contact of priest's elbows with the altar is not firmly visible. It **does not show drinking from the chalice** or the 1962-required left-hand paten support. Thus it is a **public-domain partial Host evidence witness**, never suitable as the celebrant's chalice-reception picture.

The original-file download into the working container failed; its bytes and SHA-256 are therefore **not yet verified**. It has **not been added to `originalPictures`** and still fails release gating. A mere source image with an appropriate subject is insufficient where key objects and gestures are visually unclear.

**Priority now:** acquire original bytes; then find a visually precise Host-consumption close-up or documentary photograph for X.4, and a **distinct authentic original of priest drinking from chalice with the paten in the left hand** for X.5. Regardless of the medium, derivative icons must match the approved rich-priest family—not the illustrated book's hatching style.
