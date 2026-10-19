# P3 — Original-picture acquisition, not icon generation

## Source and rights

The 1661 etching by Sébastien Leclerc, *Quand le P. communie*, Rijksmuseum `RP-P-OB-69.179`, is a **historical source drawing** depicting the celebrant's Communion in general, not a visually sufficient depiction of the 1962 Host-and-chalice gestures. Its current Wikimedia Commons scan is explicitly licensed **CC0 1.0**.

- Rights, creator, object and 2026 image version: https://commons.wikimedia.org/wiki/File:Priester_met_twee_misdienaars_voor_een_altaar,_RP-P-OB-69.179.jpg
- Museum permanent object ID: https://id.rijksmuseum.nl/200217641
- Exact acquisition manifest: `data/presentation/mass-icon-source-acquisition-p3.v1.json`
- Script: `node scripts/acquire-mass-icon-originals.mjs`
- CI: `.github/workflows/mass-icon-original-source-capture.yml`

The script fetches the **CC0 original image**, validates JPEG bytes and exactly 657 × 1045 dimensions, computes **real SHA-256 and SHA-1** from downloaded bytes, then writes its image and JSON evidence into `artifacts/mass-original-research/`. The CI workflow archives it as **research evidence for 90 days**. No asset is copied into the published app icon bank; this does not approve an SVG drawing or change Mass cues.

This represents a separate **acquisition test**, not the release gate. The provenance registry for `EA.PRIEST_COMMUNION_HOST` and `EA.PRIEST_COMMUNION_CHALICE` retains empty `originalPictures` until the source is explicitly evaluated and archived in its intended durable location with actual cryptographic evidence.

## Rights-isolated candidate photos

Two actual original photographs have been catalogued on Cathopic:

- `CTH49809`, **Carlos Sierra**, [Priest drinks the Most Precious Blood of Jesus](https://cathopic.com/photo/49809-priest-drinks-the-most-precious-blood-of-jesus/) — a promising **traditional Latin Mass chalice-drinking** subject.
- `CTH43758`, **Carlos Gaviria**, [Priest receiving communion at Mass](https://cathopic.com/photo/43758-priest-receiving-communion-at-mass/) — potentially the Host image, but the exact rite and moment need verification.

Cathopic's [May 2025 license](https://cathopic.com/legal/license/) permits modifications of lawfully obtained content under specified terms. It does **not** make unlicensed previews, downloads, or derivative icons available for public use. Individual license evidence, authorized acquisition, and permission for inclusion in the offline and possibly paid Ad Orientem app are required before use. **Neither image is downloaded by our acquisition script**.

## Ceremonial acceptance

The exact image still has to show the required 1962 gestures: the celebrant receives both halves of the Host while inclined with elbows on the altar (*Ritus servandus*, X.4), and receives from the chalice with the right hand while the left supports the paten beneath (X.5). Images of elevation, post-Host meditation, Fraction, ablutions, distribution to faithful or modern Mass variants cannot be substituted merely because they contain the Eucharistic species.

There must be a **side-by-side visual-family review** against user-approved rich priest art (`priest_elevate_chalice_rich`, `priest_rail_after_rich`, `priest_incense_altar_rich`) before any drawing is approved. A 1661 source is not itself the approved illustration style.

**As of creation:** The model's direct container acquisition previously failed, and the CI source-capture run must be checked before claiming an original-file hash exists. All generated icons remain **unapproved/unreleased**.
