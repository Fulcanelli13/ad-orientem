# Breviarium.ink — Wave 3: bulk source recovery and photographic gate

**29 October 2026 · research-only · €0 · no production changes**

This continues the frozen 83-plate Sacred Art import. We deliberately performed one complete batch on **all 35 photographs below the 1,800-pixel short-edge threshold** and **all 28 stronger-resolution candidate photographs**. The remaining 20 cases are the seven hard artist exclusions, eight historical style exceptions, four oversized files and one existing Prayer hero: those were previously reconciled and remain out of this particular source-quality queue.

## Accurate progress

| Measure | Verified outcome |
|---|---:|
| All 35 weak photographs individually dispositioned | **35/35** |
| All 28 eligible source records checked for source-file/native inspection readiness | **28/28** |
| Alternative original-file titles with Commons ImageInfo metadata confirmed | **10/10** |
| Separate paintings represented in those ten alternative file titles | **7** |
| Alternative files offering substantial short-edge improvement without >30 MB size | **7** |
| Weak paintings with qualifying alternatives | **6** |
| Existing source-original image archives in the 28-file quality cohort | **2** |
| **New full originals acquired in W3b** | **2** |
| **Running Breviarium original master archives (W1 + W3b)** | **4** |
| W3b originals with visible external frame rejection | **1** |
| W3b original with preliminary painting-only composition | **1** |
| HTTP 429 responses received in W3b | **1** |
| W3b requests skipped after HTTP 429 | **3** |
| New pristine quality/photo-rights certifications | **0** |
| Production image releases | **0** |
| Cost | **€0** |

**Technical accuracy:** “35 processed” means complete source-file triage; it does **not** mean 35 valid full-res photos downloaded or visually accepted. “28 processed” means photographic QA evidence/readiness assigned; only the two previous Caravaggio source originals are fully archived for that set. The ten alternative files were verified via one metadata request, not ten image downloads.

## Two new full-original image archives

**Zurbarán — Saint Francis in Meditation**, Timken Museum **2015:001**. [Full unaltered Commons original](https://commons.wikimedia.org/wiki/File:Saint_francis_in_meditation_075217.JPG) at **2,847 × 3,688**; archive SHA-256: `113427179a174a8b4aa45c29c7243503add6e00629173081902bcea45bab69c5`. The whole-image/native-corner proof reveals a large **gilt external frame and museum wall**. This **specific photograph is rejected for the pristine photo registry**, although the exact-work identity and source bytes are preserved. It is not a substitute for a clean painting-only original. The visible photo includes strong yellow lighting: no naive automated colour correction.

**Murillo — Immaculate Conception of El Escorial**, Prado **P00972**. [Full Commons original](https://commons.wikimedia.org/wiki/File:Inmaculada_Concepci%C3%B3n_(Murillo%2C_El_Escorial).jpg) at **1,888 × 2,717**; SHA-256: `fc324fbea27fcd8950c11b54176f061f1f9f2ddd1d279e24501c907edc16394f`. The whole image has no obvious external frame and retains the composition. It is a **preliminary painting-only candidate**, still unapproved for precise painted edge, colour fidelity and source-photo rights.

**Object-identity warning:** Prado Murillo P00972 is *not* Cleveland Murillo 1959.189. Never deduplicate them by their common title, `Immaculate Conception`.

Both source files retain verified Wikimedia SHA-1, independently calculated SHA-256, recorded native dimensions, original bytes and inspection panels. W3b ceased all further original-file requests as soon as the subsequent Reni Cecilia request returned 429; the later Velázquez, Raphael and Caravaggio image requests were **not attempted**. No use of 800px thumbnails as fake originals.

## Seven bounded better-photo options

The metadata-confirmed, file-specific alternative set with a better native short edge, without the large-file exclusion, comprises:

- Prado Murillo El Escorial P00972 — two source versions, 1,888×2,717 and 2,051×2,952
- Caravaggio, Contarelli Chapel *Calling of Saint Matthew* — 9,770×10,039
- Prado Velázquez *Christ Crucified* P01167 — 2,046×3,051
- Vatican Raphael *Transfiguration* — 3,737×5,691
- Norton Simon Guido Reni *Saint Cecilia* — 2,052×2,574
- Timken Zurbarán *Saint Francis in Meditation* — 2,847×3,688 (now screened and **photo rejected for frame**)

Three additional large-file alternatives remain metadata only: Titian Assumption 12,758×23,671 / 87 MB, Raphael Vatican higher variant 6,349×9,381 / 40 MB, Caravaggio Calling of Matthew 8,792×8,304 / 46 MB (CC0 camera image with high ISO and colour edits). No paid archival service, overage-risk storage or unbounded Git LFS was introduced.

All other weak-work cases remain explicitly in the queue with `INSTITUTIONAL_EXACT_PHOTO_SOURCE_STILL_NEEDED` or relevant style/identity hold. Photographs are not substituted with different paintings.

## Source records and code

- [Complete W3 metadata source and 63 case QA register](../data/calendar/sacred-art-breviarium-83-w3-weak-photo-alternatives-20261029.v1.json)
- [W3b actual original acquisition / HTTP 429 stop record](../assets/staged/sacred-art-breviarium-w3b-exact-originals-20261029/source-original-results.json)
- [Master 83-plate gallery, updated with new photos](../data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json)
- [Native source acquisition script](../scripts/art/breviarium-w3b-exact-bounded-originals-20261029.py)
- [Cross-batch integrity validator](../scripts/art/validate-breviarium-w3-63-and-w3b-20261029.mjs)

## Next release-quality gate

Prioritize clean photos for the six exact-painting upgrades **without redownloading the rejected Zurbarán framed photograph**. Independently verify the photo rights, colour/focus and native full-field painted boundary of the retained Murillo source; then conduct a true full-size inspection of the original 26 eligible source files that are *not yet archived*. Use free institutional source assets and existing original photo caches before Commons retry. Keep all original painting selections, all hard rejected works, and the prior approved Prayer hero registry unchanged.
