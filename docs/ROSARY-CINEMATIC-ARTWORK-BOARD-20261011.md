# Rosary cinematic artwork selection board — 11 October 2026

Status: **Antwerp (B) selected for a comparison collection; existing art retained as default.** Any prior three-family shortlist below is archival research. Implementation in `src/pray/rosary-cinematic.js` already reads the canonical 5-mystery set, the actual mystery-opening step indices and existing Rosary art. It does **not** own the bead engine, its prayers, translation, Scripture witnesses, nor any global liturgical calendar decision.

## Editorial decision — 11 October 2026

**Family B (St Paul's, Antwerp) selected for the historical collection. Preserve the existing coherent stained-glass art as the default devotional experience and do not delete or rewrite it.** The two collections have different value: current = consistent imagery and reading continuity; Antwerp = authentic Baroque cycle and painter-by-painter theological detail. There is no automatic global colour filter that would distort the historic painting. The user-facing switch Current / Antwerp appears only if ALL FIFTEEN vetted offline WebP files and SHA-256 provenance manifest are packaged; never show a half-complete cycle or secretly substitute an unrelated work. Optional Luminous mysteries continue to use the existing illustrated cycle only.

**Acquisition discovery:** Wikimedia Commons separates the actual St Paul's series into [Joyful](https://commons.wikimedia.org/wiki/Category:5_Joyful_Mysteries_of_the_Rosary_in_the_Sint-Pauluskerk_(Antwerpen)), [Sorrowful](https://commons.wikimedia.org/wiki/Category:5_Sorrowful_Mysteries_of_the_Rosary_in_the_Sint-Pauluskerk_(Antwerpen)) and [Glorious](https://commons.wikimedia.org/wiki/Category:5_Glorious_Mysteries_of_the_Rosary_in_the_Sint-Pauluskerk_(Antwerpen)). Fifteen individually selected source filename/pages and pixel dimensions are frozen in `data/pray/rosary-antwerp-commons-sources.v1.json`. File descriptions identify public-domain faithful reproductions; per-file metadata and original file size must still pass the fail-closed acquisition script. **Do not use the 2026 Het Noordbrabants Museum press pack:** its [press-image rights](https://www.hetnoordbrabantsmuseum.nl/het-museum/pers/15-mysterien/) expressly restrict reuse to coverage of that exhibition and bar commercial use. The artworks themselves are much older, but photographs have distinct provenance. Script: `tools/build-rosary-antwerp-art.py`; accepted pack: `data/pray/rosary-antwerp-production-pack.v1.json`, `src/pray/rosary-antwerp-licences.v1.js`, 15 local WebPs.

**Comparison quality gate:** Evaluate mystery-by-mystery in the same phone viewport (320, 360, 390, 430 px). Prefer the existing art unless Antwerp retains equal clarity, legibility, colour continuity and devotional quiet. The Antwerp collection may be an opt-in historical/art-study lens even after it passes the technical gates; technical passing alone is not a mandate to make it the default.

## A. Unified Netherlandish paintings — first choice for an art-led cinematic reader
**The Fifteen Mysteries and the Virgin of the Rosary**, Brussels painter, c. 1515–1520, The Metropolitan Museum of Art, accession 1987.290.3a–p.

Original object: https://www.metmuseum.org/art/collection/search/437216

15 small individually painted scenes plus central Madonna/Devotion: a consistent late medieval / early Renaissance palette and spatial grammar. The institution classifies the work as Public Domain and offers its Open Access images for unrestricted uses. Check whether all fifteen panels have sufficient separately downloadable resolution, image dimensions, scene ordering and subject-safe crops before selecting. Do not substitute arbitrary paintings for missing panels.

**Iconographic exception / nontrivial acceptance gate:** The Met's scholarly monograph identifies the fourth Glorious panel as **the Death (Dormition) of the Virgin, not the customary bodily Assumption**. Do not falsely relabel its content or silently present this panel as a literal Assumption scene. When evaluating family A, either disclose this iconography in the meditative caption with orthodox theological context, or commission/select a separate approved Assumption work for that movement (which breaks the one-family visual lock). Scholarly source: https://resources.metmuseum.org/resources/metpublications/pdf/Rosary_Picture_View_of_Park_of_Ducal_Palace_Brussels_The_Metropolitan_Museum_Journal_v_24_1989.pdf (Guy C. Bauman, 1989).

Potential effects: slow lateral camera travel through panel-to-panel scene thresholds; architectural/light reveal in Joyful; shadow and restrained camera in Sorrowful; vertical light/ascension in Glorious.

## B. Antwerp St Paul's Rosary cycle — historically exact fifteen but multiple authors
**The Fifteen Mysteries**, northern aisle of Sint-Pauluskerk, Antwerp, commissioned before 1617. Institutional church source: https://www.sintpaulusantwerpen.be/en/art-history/art-collection/15-mysteries/

Historical corroboration and author identification: https://www.rijksmuseum.nl/en/collection/object/The-Interior-of-the-Dominican-Church-Antwerp-Looking-East-with-the-Procession-of-the-Holy-Sacrament--726b246f95fceeb2c845f889ddb4b733

Official church accounts for all fifteen. Antwerp includes art by Hendrik van Balen (Annunciation), Frans Francken II (Visitation), Cornelis de Vos (Nativity and Presentation), Matthys Voet (Finding in the Temple and Pentecost), David Teniers I (Gethsemane), Rubens (Flagellation), Artus de Bruyn (Crowning with Thorns), Van Dyck (Carrying the Cross), Jordaens (Crucifixion), Arnout/Aernout Vinckenborch (Resurrection and Coronation), Artus Wolffort (Ascension), Jan Aertsen (Assumption). Historical source / current availability / actual high-resolution file for each painting must be individually confirmed; paintings have diverse palettes, so this family is more cinematic variety than literal painted continuity. Do **not** mark images public domain merely because the artists are old; review photographic reproduction terms.

## C. Original Wierix engraving cycle — strongest continuity and graphic identity
Antonie Wierix II, **Fifteen Mysteries of the Rosary**, 1605–1619, three companion sheets in the Rijksmuseum:

- Joyful five (RP-P-1898-A-19831): https://www.rijksmuseum.nl/en/collection/object/Vijf%2Bblijde%2Bmysteries--28e521a3350bae8c5cb2b5fea137cf14
- Sorrowful five (RP-P-1898-A-19832): https://www.rijksmuseum.nl/en/collection/object/Vijf-droevige-mysteries--3499433d38abd5e9339e28ee443cb5a1
- Glorious five (RP-P-1898-A-19833): https://www.rijksmuseum.nl/en/collection/object/Vijf-glorierijke-mysteries--3615032945a5283121fc8d845bfd05bb

All three paintings/prints are labelled **Public Domain** by the Rijksmuseum (engraving medium). The medallions depict the five mysteries per set; the whole sheet also has a central Marian composition. Cinematic direction: travel between illustrated medallions inside a single engraving, use restrained bronze/ivory light, **no colourised painted figures** and no AI-generative morphing of sacred subjects. Primary technical risk: medallion detail may prove too low-resolution for a 390px cinematic zoom.

## Direct effect-to-scene cinematography

| Mystery | Cinematic beat | Stage-to-stage art transition |
| --- | --- | --- |
| Joyful I Annunciation | light crossing threshold | Gabriel → Mary without puppeteering either |
| Joyful II Visitation | meeting / near-camera travel | exchange of gestures and glances; then freeze |
| Joyful III Nativity | warmth and low illumination | no simulated breathing or infant motion |
| Joyful IV Presentation | temple / sanctuary light | long architecture becomes focus |
| Joyful V Finding | distance then recognition | do not replace biblical event with generalized sentimental portrait |
| Sorrowful I Gethsemane | night vigilance | sparse light; no forced audio |
| Sorrowful II Flagellation | withheld, restrained | no shock treatment or violence morphing |
| Sorrowful III Crowning | shadow | no halo-puppet or crown effects |
| Sorrowful IV Carrying the Cross | horizontal travel | camera follows movement painted in the original |
| Sorrowful V Crucifixion | **absolute stillness** | hold at death; no Resurrection image inserted here |
| Glorious I Resurrection | dawn reveal | gentle light, not a bright app-like burst |
| Glorious II Ascension | vertical ascent | camera framing only, bodies remain still |
| Glorious III Pentecost | directional radiance | rays from existing iconography, no invented tongues |
| Glorious IV Assumption | vertical upward composition | maintain distinctive Marian theology |
| Glorious V Coronation | luminance settles | final image remains still during prayer |

**Luminous Mysteries:** optional 2002 extension, supported by existing Rosary reader and Scripture corpus but absent from all the historical traditional fifteen-image families. Keep their image assignment unselected, separate, and never force them into the fifteen canonical images.

## Motion contract

**The transition is a mystery boundary**, not ten Hail Mary micro-transitions. The five-stop horizontal ribbon follows the selected set; a tap moves to the original canonical mystery-opening step through `AO_ROSARY_V381.setStep`. Bead navigation, Simple/Guided selection, source-linked bilingual contexts, group recitation, language replacements and existing icon/rail cues remain owned by the preserved donor. All animated art stops immediately after the brief visual entry. No timer, streak, fabricated performance metric or obligatory image pause.

## Production/source gate

Before assigning one family: verify scene-by-scene 15/15 image coverage, individual images’ actual URLs and native dimensions; artist/title/museum/source and licence provenance on each; user-facing credits; safe cropping on 320/360/390/430px viewports; reduced motion; local offline optimized files; and real Playwright images of five mysteries. Do not ship 15 unrelated images chosen ad hoc, and do not assign imagery for the optional Luminous set by inventing historical paintings. 
