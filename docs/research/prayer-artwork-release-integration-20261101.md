# Prayer sacred art — release integration contract (2026-11-01)

**Scope:** PR #2144, draft branch `research/prayer-artwork-approved-reuse-wave1-20261031`. The existing approved Claude UI, Prayer text, language and focus system, Rosary donor and canonical selections are not to be redesigned or overwritten.

## What is now wired

- `src/pray/artwork-slot-authority.v1.js`: generated 267 exact editorial slots, with 14 held primaries and nine category doors, sourcing the corrected November 1 curatorial master.
- `src/pray/artwork-release-runtime.js`: release-cleared, local-file image adapter. Production release manifest is intentionally **empty** until photo proof exists.
- `src/pray/artwork-release-styles.js`: responsive image window with gently enlarged crop (approximately 6% zoom), a visible **ⓘ** information control and a painting title, artist, source credit and original museum record in the disclosure. This is a display crop only: a painting with a photographed physical frame does not qualify for release.
- `src/pray/presentation-runtime.js`: respects source Prayer routes, prayer library, daily, Angelus/Regina Cæli, adoration, benediction, Stations and stage cards. If image proof is unavailable, it inserts **no art container and no blank reserved space**.
- `src/pray/rosary-active-card.js`: attaches a *certified image only* to the existing source-owned Rosary card, using the actual Joyful/Sorrowful/Glorious mystery set. One fixed image per mystery, not a random image per bead. The existing 15-mystery programme, source Scripture, prayer/focus, bilingual toggles and deck navigation remain untouched.
- Nine Prayer discovery doors: four have individual existing candidate selections and may render only with exact **door-specific release** proof; five remain research-only pools (not random rotation, not empty fake painting zones).

## Current inventory and hard blockers

The exact source queue is `data/prayer/artwork-editorial-20261101/photo-release-acquisition-queue-267-20261101.v1.json`.

| Item | Count |
| --- | ---: |
| Editorial artwork positions | 267 |
| Positions holding a currently selected painting | 248 |
| Distinct **candidate** artwork/photo-source groups (not all verified unique originals) | 124 |
| Conflict holds requiring exact identification or editorial resolution | 14 |
| Generic door pools without individual painting assignment | 5 |
| Photographs released under the new evidence contract | **0** |

A museum catalogue page, existing editor keep, research candidate, Met/Cleveland public-domain **object**, historic user photograph, or a user-approved scene **does not by itself** establish an approved cropped image file. Do not substitute a Studio of Rubens Assumption for the exact kept Rubens work. Do not re-enable rejected Ugolino / out-of-scope Lochner or Carracci. Do not use any Prado-origin photograph. Keep original work IDs and verdicts in the source ledgers.

## Required sign-off per concrete image file

An entry in `PRAYER_RELEASED_IMAGE_ASSETS_V1` is publishable only when it meets **every** check enforced by `releaseClearedPrayerArtwork`:

1. Exact selected original artwork matches the assigned slot, with recorded source/original ID; formal editorial approval **for this exact prayer slot** (and exact category door, when applicable).
2. The *actual chosen photograph/file* has reuse rights verified, its original downloaded and archived with SHA-256 hash and a separately hashed release derivative.
3. The derivative resides at `assets/pray/released/<slug>.webp|avif|png|jpg`, not a remote candidate URL; native dimensions are recorded (at least 800 px per dimension under the current schema), actual pixel quality checked.
4. Human visual review confirms no photographed physical frame/gallery surrounds, no synthetic fill, and distinct mobile/desktop responsive crop approval; phone and app rendering checked.
5. The artwork's title/artist matches the canonical primary and credits and source-record URL are supplied. Any held slot and any non-individual category-door pool remains unavailable.
6. The image must not obstruct prayer text/gesture cues. Fixed Rosary mystery art persists across the ten beads; source prayer/crosses/recitation modes stay owned by their existing components.
7. Only then set `editorialApproved=true`, `publicationState=READY_FOR_PUBLICATION`, `productionEnabled=true` with the complete `releaseEvidence`; update tests so actual local files exist. Do **not** edit the release manifest from a source catalogue link alone.

## Recommended work order

- **P0:** Original final cover locks (Lotto Rosary, MNAC Seven Sorrows, user-supplied St Thérèse photograph), plus established Ingres Adoration/Benediction. Reuse only after matching real supplied approved photographs.
- **P1:** Original Oct28 restored Morning (Breton), Evening (Frère), Hymns (exact Rubens original unresolved), and Rubens Resurrection (Regina Cæli/Easter and Rosary Resurrection). Avoid premature substituted files.
- **P1:** Rosary’s fifteen mystery images and Tiepolo's fourteen San Polo Stations. Preserve one-per-mystery/station.
- **P2:** All other prayer stages, fixed covers and the four individually assigned category doors; five pool doors need individual editorial selections first.
- **HOLD:** the fourteen conflicted current primaries and eleven same-slot exclusions remain ineligible; do not auto-fill with alternatives or publish until resolved.

The existing Angelus Tanner WebP at `assets/pray/angelus/tanner-annunciation-1898.webp` has provenance but explicitly records `productionApproval=pending-phone-visual-and-liturgical-gates`; it must not be silently treated as an approved final Angelus painting.

## Verification

`tests/prayer-artwork-curatorial-reorganization-contract.mjs` verifies 267 slot parity, 14 holds, 22 blocked alternatives, editorial source retention, zero released photos, gated local paths, exact license/crop proof, fifteen Rosary mystery mapping, photo-acquisition queue, and protected door pools.

**This integration is not a publication of sacred-art imagery.** Do not claim paintings are live until individual release assets exist, PR validation passes, the visual capture is completed, and the release branch/deployment actually contains the approved image bytes.
