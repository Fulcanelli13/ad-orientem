# P102 — actual rendered source-image review and EXIF correction

**Scope:** inspected **11 exact-source Wikimedia Commons rendered photographs** (ten from P100 full-JPEG decoding and the separate hash-verified Blandford #195). These were visually examined as 500–960 px *source previews*, **not** at 100% original pixel scale, and not in Ad Orientem's actual responsive Directory cards. Do not call these publication-ready images.

## Exact-image editorial outcomes

| ID | Church | P102 source-preview assessment | Reason |
|---:|---|---|---|
| [61](https://commons.wikimedia.org/wiki/File:Basilica_St_Clemens_Clemensstrasse_Calenberger_Neustadt_Hannover_Germany_02.jpg) | Hannover St Clemens | **Preferred exterior preview** | Baroque dome and entrance clear; dusk lighting coherent; excess paving safely crop-checkable |
| [71](https://commons.wikimedia.org/wiki/File:Hl._Bruder_Konrad_Kolbermoor-4.jpg) | Kolbermoor Bruder Konrad | **Preferred exterior preview** | Clean white facade, crucifix and clock tower; saturated blue sky needs full-size quality check |
| [195](https://commons.wikimedia.org/wiki/File:Church_of_Our_Lady_of_Lourdes_and_St_Cecilia,_Whitecliff_Mill_Street,_Blandford_Forum_(September_2025)_(4).jpg) | Blandford Forum | **Preferred exterior preview** | Unobstructed red-brick architecture, both crosses and porch; excess asphalt; independent hash verified but P100 full pixel decoding still pending |
| [58](https://commons.wikimedia.org/wiki/File:Adelhauser_Kirche_in_Freiburg.jpg) | Adelhauser | **Downgraded to secondary exterior** | Dense bare branches, harsh facade shadows, central fountain and adjacent buildings make poor hero composition |
| [20](https://commons.wikimedia.org/wiki/File:Sydney_(AU),_St_Mary's_Cathedral_--_2019_--_3107.jpg) | Sydney cathedral | **Secondary exterior** | Cars, signal lights and trees obscure the lower church; contextual city image only |
| [12](https://commons.wikimedia.org/wiki/File:Fatimakapelle_Schardenberg.JPG) | Schardenberg Fatimakapelle | **Secondary exterior** | Building is correct but trees surround it and original is only 1,280×960 |
| [96](https://commons.wikimedia.org/wiki/File:France-Bayonne-Cathedrale_Sainte-Cecile.jpg) | Bayonne Sainte-Marie | **Secondary exterior** | Cloister side angle; spire tips cropped out of original image; filename misleading but correct building identity preserved |
| [15](https://commons.wikimedia.org/wiki/File:Wallfahrtskirche_Maria_Lebing_03.jpg) | Maria Lebing | **Portrait gallery only** | Frontal church legible, but tower/roof, main doorway cannot survive a forced 16:9 crop and trees intrude |
| [52](https://commons.wikimedia.org/wiki/File:Kostel_sv._Petra_Na_Po%C5%99%C3%AD%C4%8D%C3%AD_(Nov%C3%A9_M%C4%9Bsto)_(4).jpg) | Prague St Peter | **Portrait gallery only** | Towers legible, almost white sky visually confirmed; aggressive horizontal crop loses vertical architecture |
| [75](https://commons.wikimedia.org/wiki/File:Marktplatz10_Grafing-01.JPG) | Grafing Marktkirche | **Portrait gallery only** | Clear white facade and cupola in narrow streetscape; no useful whole-building widescreen crop |
| [62](https://commons.wikimedia.org/wiki/File:Basilika_St._Clemens_in_Hannover,_yKrypta_3.jpg) | Hannover crypt | **Secondary crypt portrait only** | Clearly crypt vaulted nave, not principal basilica interior; orientation correction below |

See [p102-actual-preview-editorial.json](./p102-actual-preview-editorial.json) for individual source-image preview URLs, recorded visual composition observations, preserved identity and hash references, editorial roles, crop cautions and final clearance flags.

### Corrected EXIF display-orientation defect

P101 treated **#62** as 4,000×2,252 landscape because that is the *stored JPEG raster*. However P100 already recorded **EXIF orientation 6**, and Commons displays it as **2,252×4,000 portrait**. The P101 JSON, README and validator are corrected in this same PR:

- Raw raster remains 4,000×2,252.
- Oriented display is 2,252×4,000.
- A hypothetical 16:9 center crop is 2,252×1,266, **31.7% area retention**; previous near-widescreen conclusion was wrong.
- Because the photograph shows a crypt, its accepted role is secondary crypt gallery only.

Crop calculations must first apply EXIF orientation; they are *not* actual app UI screenshots. The P101 first-priority queue was technical triage and is superseded by P102's actual source-image judgments: **#58 has been downgraded**; #61 and #71 remain strongest, with #195 added from a separately hash-verified original and exact-file preview.

## Unchanged blocks and next execution

- The 31-candidate original queue remains: 11 independently hash-verified (10 fully decoded + #195 hash-only), 20 without successful original-byte verification due to Wikimedia HTTP 429. **Do not initiate further automated downloads while throttle is unresolved.**
- The prior P97 identity-confirmed preview exceptions **#77, #110, #204, #261** remain unviewed.
- The 385-image identity ledger remains **90 wrong-building rejects, 83 corroborated subjects and 212 unverified**.
- **0** photographs granted final full-resolution artistic acceptance, final rights clearance or production publication.
- No JPEGs, thumbnails, or preview images are committed; only source links and evidence data. No new acquisition workflow, fees or owner contact.

For release, inspect original at 100% and actual Ad Orientem mobile/desktop card crops, verify image rights/credit and exact Mass venue, then obtain explicit editorial approval. This PR is research-only.

Validation: `node docs/research/directory/p101-verified-original-quality-triage-20261030/verify-p101.mjs` plus `node docs/research/directory/p102-source-preview-editorial-20261030/verify-p102.mjs`, P100 and P91 identity gates.
