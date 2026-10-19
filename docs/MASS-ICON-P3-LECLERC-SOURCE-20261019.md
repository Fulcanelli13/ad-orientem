# P3 Source acquisition — Leclerc’s original 1661 Mass illustrations

## Verified

The **Rijksmuseum's own object catalogue** confirms that the original print `RP-P-OB-69.179`, plate **29**, is titled *Quand le P. communie*. It belongs to a Catholic sequence of priestly Mass actions by **Sébastien Leclerc I**, published at Metz in **1661**, in an illustrated work attributed to **L. Mengin**, publisher **Claude Bouchard**. The museum explicitly gives the work as **public domain**.

- Original: https://id.rijksmuseum.nl/200217641
- Public-domain and catalogue information: https://www.rijksmuseum.nl/nl/collectie/object/Priester-met-twee-misdienaars-voor-een-altaar--a94279fd154e2a5849c70568bf1ee28f
- Complete currently enumerated source index: `data/presentation/mass-icon-originals-leclerc1661.p3.json`

The series also contains documented separate etchings of the Offertory (13), Canon (19), Host elevation (21), Fraction (26), breast strike at Agnus Dei (28), priest Communion (29), ablutions (30), and Postcommunion (31). These are distinct scenes: **an ablution is not the priest consuming from the chalice**, the elevation is **not** consuming the Host, and Fraction remains text-only under P2. Do not substitute their art for plate 29 merely to fill an illustration gap.

## Not yet verified

**Neither action-specific icon has an acquired original image.** Museum object existence and its public-domain designation are necessary but not sufficient. The rendering system must not assume the picture shows the exact moment, hand pose, divided Host, chalice or paten. The downloadable photograph/scan of this **exact print** has yet to be retrieved, its checksum recorded and its details visually inspected.

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
