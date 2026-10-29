# Breviarium.ink → Ad Orientem Sacred Art: 83-plate source intake

Status: **research register committed; no production art changes** (29 October 2026).

Source: https://breviarium.ink/art/ — an 83-artwork gallery. Every figure exposes a direct Wikimedia Commons `Special:FilePath` original. We ingest source metadata, not Breviarium's matted website compositions, HTML, CSS or original editorial prose.

## Completed bulk intake

| Gate | Recorded |
|---|---:|
| Site figures identified with unique source URLs | **83/83** |
| Commons current-image metadata retrieved | **83/83** |
| Explicit hard artist exclusions: El Greco / Fra Angelico | **4 / 3** |
| Priority for full photograph inspection (not approval) | **33** |
| Contextual art candidates | **17** |
| Secondary aesthetic review | **14** |
| Style-exception holds | **12** |
| Both native image dimensions at least 1,800 px | **40** |
| Possible existing 281-candidate registry title+artist collisions | **4** |
| Possible approved Prayer hero collision | **1** (Guido Reni, Saint Michael) |
| Records in historical exact-identity user-rejection blocklist protected | **103** |
| Photo original master source files acquired in first 14-image run | **2** |
| Source downloads stopped by Commons HTTP 429 | **11** |
| Copyright/licence evidence requiring separate treatment | **1** (Cosimo Ulivelli, CC BY-SA 3.0) |
| New final pristine/photo-rights approvals | **0** |
| Production image releases / spending | **0 / €0** |

Corrected artist normalization is vital: French/Spanish name particles initially missed **Georges de La Tour, Philippe de Champaigne, Antonio de Pereda, Jusepe de Ribera, Francisco de Zurbarán**. All five are explicitly in the **33-work priority pool**.

## Actual original archives (checksums and whole/corners inspection)

**Caravaggio, *The Incredulity of Saint Thomas*** — 8,550 × 6,325 source pixels; SHA-256 `878f6d726f2e38acbe36ba4fedf3bbd388150f69615f51424a243834e005982c`.

**Caravaggio, *The Supper at Emmaus*** — 11,412 × 8,117 source pixels; SHA-256 `0ad5e515781f1ef52e5d60b43002a98ff0dceaf8707f9c9b8e944d97feea824f`.

Both original bytes, matching Commons SHA-1, native dimensions, four native-corner samples and full-work inspection panels are committed within `assets/staged/sacred-art-breviarium-wave1-native-20261029/`. They **are not pristine-certified**: exposure, reproduction fidelity, in-paint condition, full edges, photo rights and editorial selection remain separate gates.

## Reuse and exclusions

The data is **append-only research**. The canonical current source registry `data/calendar/sacred-art-candidates.v1.json`, the 103-item global rejection authority `data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json`, existing Prayer 22 hero selections and prior Sacred Art explicit approvals stay unchanged.

Artist exclusion is categorical for El Greco and Fra Angelico. Source version and photo suitability are *not* inferred from an artwork's date or Commons' public-domain label. The same title and artist do **not** prove the same physical work, so four potential 281-registry matches remain identity leads rather than automatic de-duplication. Reni's already-approved Saint Michael is kept under its existing owner, not re-acquired.

Works already approved in other contexts, including Champaigne's *Last Supper* and Raphael's *Transfiguration*, must not be replaced because this website uses a different photographic reproduction. The selected, original artwork identity and full prior editorial decision remain authoritative.

## Next source-acquisition wave (no blind 429 retries)

Focus on the 33 priority records, especially the Caravaggio Passion and Gospel scenes; Champaigne's *Last Supper*; Georges de La Tour's *The Newborn*; Ribera's *Saint Jerome*; Zurbarán's *Saint Francis in Meditation*; Pereda's *Saint Anthony*; and Reni's *Saint Joseph*. Reuse matching native images already in the Sacred Art library before downloading. Pursue **museum-issued open-access full-size photographs** for Wikimedia-throttled files, and exclude versions with external frames, watermarks, manipulated colour or low detail. Large images (e.g. Rembrandt Prodigal 250 MB, Bellini Francis 217 MB) remain metadata-only until permanent zero-cost storage and verified versions permit a safe acquisition. Do not retry source URLs in a tight loop.

References:
- [Full 83-plate structured registry](../../data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json)
- [Native-source W1 intake results](../../assets/staged/sacred-art-breviarium-wave1-native-20261029/wave1-source-intake-results.json)
- [Source gallery DOM evidence](../../assets/staged/sacred-art-breviarium-source-audit-20261029/structure.json)
- [Reproducibility script](../../scripts/art/breviarium-83-bulk-registry-intake-20261029.py)
