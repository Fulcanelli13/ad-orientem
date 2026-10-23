# W67 — Static live-source image trace: 14 Stations, 24 site photos, 4 historic artist-policy conflicts

**15 October 2026 | Sacred Art PR #1231 | No app changes, no permission requests, no image publication**

This is the first **current `main` source-code + Git tree verification** following W66's 938-target source pre-audit. It does not claim to have run Chromium, downloaded/reviewed the actual image pixels or inspected 938 on-screen route/date renders.

## Confirmed evidence

| Source integration | Existing asset paths | Found in main Git tree | Runtime basis | Current phone/image render checked? |
|---|---:|---:|---|---|
| Stations of the Cross | **14** | **14** | `ao-boot-61e8e41b5e1992e2.js`, v43.11; figure per station when the artwork setting is on; supports landing, resume, preloading, onerror fallback | No |
| Sacred Geography principal site photos | **18** | **18** | `src/find/place-profiles.js` reviews media metadata, `src/find/explore-presentation.js` / Heritage render the media when present | No |
| Sacred Geography extra gallery photos | **6** | **6** | `src/find/place-profiles.js` approved gallery source, `src/find/explore-presentation.js` creates gallery figures | No |
| **Asset references verified** | **38** | **38** | Source-wired local files with Git blob SHAs and byte lengths | **No** |

The **24** Sacred Geography media references belong to **19 unique site IDs** in the canonical **258** place seed list. The remaining 239 place IDs lack an approved file **in this restricted source register**, but cannot yet be declared entirely without usable media in every source or user-visible view. Source-defined approved assets have rights, subject, crop, license and path checks before the Place renderer. W67 has not independently revalidated upstream licenses, original image bytes, pixel quality or browser-visible behavior.

The 14 Stations images are an older **stained-glass Stations cycle** (declared v43.11), whereas the Sacred Art W61/W66 editorial register contains **14 separate candidate painting-selection records**. These are different artifacts. Do not mistake the historical photo cycle for 14 newly 5/5-rated paintings, and do not remove the existing functionality simply because the new artwork selection remains under review.

## Critical old Home/Proper art source conflict

The `index.html` page loads the historic `AO_PHASE1_ART` bundle. `src/home/presentation.js` calls its `homeMarkup` hook when present; when no picture is emitted it uses an explicit empty-art fallback.

The historical bundled base has **50 Proper-path rows / 49 artworks**, with **47 GREEN / 2 HOLD / 1 NO_ART** as an *old initial state*, not current release counts or resolved-calendar image coverage. Four old GREEN assignments refer to artists now permanently excluded by the user:

| Proper path | Legacy artwork | Historical artist |
|---|---|---|
| `Sancti/03-25` — Annunciation | `AO001` *The Annunciation* | Fra Angelico |
| `Tempora/Pasc7-0` — Pentecost | `AO015` *Pentecost* | El Greco |
| `Tempora/Pent01-0` — Trinity Sunday | `AO105` *The Holy Trinity* | El Greco |
| `Tempora/Pent09-0` — Ninth Sunday after Pentecost | `AO084` *Christ Cleansing the Temple* | El Greco |

The later `AO_SACRED_ART_AESTHETIC_V4312` gate explicitly blocked **nine different IDs**: AO087, AO092, AO122, AO125, AO147, AO148, AO149, AO150, AO152. It does **not** explicitly prohibit these four earlier excluded-artist IDs. The historic Home renderer is then wrapped through multiple versioned overlays; W67 did not execute the entire overlay chain against actual dated states. **Thus these four are confirmed legacy source policy conflicts, not yet proof that four banned images were displayed today.**

**Handoff requirement to existing Home/Calendar/Art frontend owners:** determine the actual final `effectiveRow` and selected artwork for each of the four Proper paths after all wrappers; if still selecting an excluded original, suppress it fail-closed or use a separately user-approved genuine alternative (not a title-based substitute). Add a regression test forbidding excluded painters in the resolved final artwork, not by deleting historical evidence or transferring an unrelated 5/5 score.

## What this changes in W66

- W66's 938 distinct visual obligations remain a valid **demand inventory**, but every row was marked **NOT_INSPECTED**; it should **not** be interpreted as 938 missing images.
- W67 establishes **38 concrete repository asset paths** and identifies the source renderer that can use them. This is progress on **source/asset existence**, not 38 previously unidentified approved sacred paintings.
- Bible Atlas canonical **151** events still require per-event image mapping and on-screen visual confirmation. The base `src/find/bible-atlas.js` does not itself expose a painting-media field. Other historical/experimental imagery must still be reconciled before asserting absent images.
- The 109 previously recovered five-star **record keys** remain unchanged; W67 does not conflate them with 49 historic Proper paintings, the 14 stained-glass images, or 24 Place photographs.

## Practical next source checks

1. Resolve the **four** historic artist-exclusion cases in the **effective** production art resolver; then check the current Calendar/Home 2026 observed-day mapping per date, keeping sanctoral principal and commemorations distinct.
2. Audit each of the **151** Atlas event-media slots and identify precise chapter/verse relationship of reused 5/5 originals, distinguishing story, subepisode, contextual view and diagram.
3. Compare all existing source-linked images against W66 prayer, novena, saints/group and exploration demands; use source owner IDs, never fuzzy portrait-name guessing.
4. Test real route display at relevant screen widths and collect screenshots/error results. Only then assign verified `VISIBLE_EXACT`, `VISIBLE_CONTEXTUAL`, `KNOWN_FILE_NOT_RENDERED` and `NO_VISIBLE_VISUAL` states per user-visible target.
5. Research or propose new art **only for confirmed gaps**, especially Biblical Atlas and Map of Saints. Do not redo existing five-star ratings.

Machine data: [W67 runtime source audit](../../data/research/sacred-visual-w67-main-runtime-existing-image-asset-and-legacy-exclusion-audit-20261015.v1.json).

**Policy:** no permission requests, no emails to institutions, no paid licences; do not re-rate accepted originals, no Fra Angelico or El Greco in suggested/published art, and no live frontend change in this research PR.
