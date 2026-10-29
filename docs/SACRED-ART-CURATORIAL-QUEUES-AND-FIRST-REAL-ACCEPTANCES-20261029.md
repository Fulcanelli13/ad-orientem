# Ad Orientem Sacred Art — consolidated curatorial review

**29 October 2026 · Source: PR #1870 research branch · €0 · no automatic production changes**

This replaces undifferentiated “research pending” labels with precise evidence-based curation. The master has **383 canonical artwork records**, **107 of them editorially approved**. Prayer's 22 selected primary heroes and Breviarium's 83 source plates are **overlapping annexes**, not 105 distinct paintings to add to the 383.

## 1. Exact photograph-licence review

[All 355 active per-artwork licence cases (CSV)](../data/calendar/sacred-art-curator-licence-review-20261029.csv)

| Status in 383 master | Records | Editorial treatment |
|---|---:|---|
| Current official Met/Cleveland CC0 JPEG **has SHA-256 identical to frozen selected archive** | **18** | **Licence gate passes for this exact version.** Continue photographic QA; not automatic release |
| Same museum object's **current official CC0 JPEG differs** from selected archived variant | **3** | Reconcile *chosen archive bytes* versus current CC0 original, then quality QA |
| Full-work source has public-domain/open *metadata* but no approved exact-photo rights chain | **216** | Verify exact file page, photographer, rights basis, and jurisdiction/usage |
| Full-work source rights evidence incomplete | **99** | Establish real file ownership and specific licence; prioritize approved originals |
| No complete original / only partial source | **25** | Acquire correct whole painting and verify its image reuse rights |
| Photographer-specific Commons CC BY-SA 4.0 within above licence queue | **12** | These are **conditional** free licences: attribution, licence notice and share-alike obligations; not CC0 |
| Excluded user-disliked/rejected original IDs in this master | **9** | Do not source/release |
| Historical editorial contradiction (Albert Bouts CMA 122338 approved and banned under same ID) | **1** | Freeze, resolve prior authority explicitly; no silent acceptance/rejection |

**Active licence-review queue: 355.** The 12 conditional CC BY-SA records are a subset, *not* added to 355. The exact current museum CC0 coverage is 18 original-file matches plus three official alternative files needing historical selection reconciliation. No declared photographic rights are inferred solely from paintings being public-domain works.

## 2. Photograph repair or replacement

[All 65 main-gallery per-work repair/acquisition records (CSV)](../data/calendar/sacred-art-curator-photo-repair-20261029.csv)

| Specific action | Records |
|---|---:|
| Find exact complete source (none exists) | **23** |
| Replace partial reproduction with whole image | **2** |
| Approved master resolution/photographic quality source replacement | **24** |
| Original 44-work preview shows suspicious support/border edges | **2** |
| Official CC0 **clean painting plus non-art support/frame**: crop losslessly, then verify | **13** |
| Official CC0 complex exterior frame/mount needing special decision | **1** |
| **Total** | **65** |

**Crucial policy change:** a frame is not automatically a reason to download a different photograph. Recover the true painted rectangle/arch from the exact full-size original, **without discarding pigment or resampling**, and retain source hash + crop coordinates/derivative hash. Seek a different photo only for gallery perspective, glare, watermarks, unfixable colour/defocus, original incompleteness or insufficient painting-only pixels. The 65 issues are not all failed artworks.

### Actual native first-pass review of 18 official CC0 archival matches

[18 individual curatorial decisions](../data/calendar/sacred-art-curator-official18-native-first-visual-20261029.v1.json) · [Six image contact sheets and SHA reports](../assets/staged/sacred-art-curator-18-official-cc0-native-qa-20261029/native-official-photo-qa.json)

| Source-photo assessment | Count | Action |
|---|---:|---|
| **Painting-only, complete and plausibly frameless** | **3** | **Advance directly to final quality sign-off** |
| Exterior raw support/wooden frame visible, crop may preserve full painting | **13** | Exact-source non-art crop proof, then final sign-off |
| Complex gilt and fabric presentation | **1** | Classify painted subject/mount before selecting crop or alternative |
| Ugolino da Siena's *Last Supper*, explicitly disliked by user | **1** | Do **not** promote based on technical licensing alone |
| **Total** | **18** | No change to original approvals or original files |

The three **first-pass accepted** source photographs are:

1. **Carlo Dolci — *Adoration of the Shepherds***, Cleveland CMA **143784**, **2,715 × 3,400**, official CC0 current image identical to selected original SHA. The full frame and four native corner samples show painted field, not an external mount.
2. **Caravaggio — *Crucifixion of Saint Andrew***, Cleveland CMA **148758**, **2,563 × 3,400**, official CC0 and exact frozen source bytes, with painting-only border and strong native chiaroscuro.
3. **Nicolas Poussin — *The Agony in the Garden***, Met **442488**, **3,153 × 4,000**, official CC0 and exact frozen source bytes; complete composition and painted corners.

These are **not new artwork selections**. They are photographed-master candidates ready for *final full-perimeter, colour/focus and application crop checks*. Until that final check, `pristine_final_certified=false` and `production_approved=false` remain correct. They are no longer mixed with those requiring new source acquisition.

## 3. Additional first-pass evidence that must not be conflated

- **44 original-file source cases (A8)**: 40 appeared free of an external frame at reduced contact-sheet scale, two flagged boundary/support issues, two not covered in the original visual contact sheets. Original source bytes were later checked for all 44. Those 40 have *not* yet passed native 1:1 complete-edge or source-photo-rights acceptance.
- **Prayer 22**: 20 original masters archived; ten first-visual clean, ten need image repair/replacement/assessment and two still lack original masters. Among ten needing repair, two current photographs show fundamental framing/gallery-installation issues. The exact issue and next action are listed individually in the unified annex.
- **Breviarium 83**: 83 metadata records, four new originals archived, one photo rejected for frame/wall. Seven artist exclusions (El Greco four, Fra Angelico three) remain blocked; no Breviarium website thumbnail is a pristine photographic master.

## 4. Deterministic repeatable curation pipeline

For each distinct **physical artwork and image-source version**:

1. **RIGHTS** — exact original image bytes, source checksum, photographer, museum policy or Commons file-specific licence. Prefer *official CC0 / verified public-domain faithful reproductions*; hold photographer claims that conflict. CC BY-SA is conditional, not unconditional.
2. **VISUAL** — compare whole painting and four native corners, look for wood, frame, walls, glare, poster/overprint, unnatural tone, severe blur, missing composition. Preserve the painting's full painted surface, especially curved altarpieces and medallions.
3. **REPAIR OR REPLACE** — make a non-destructive source-pixel crop/alpha if safely possible, else fetch another *exact-object* full-size photograph. Archive original, derivative bounds, both checksums and provenance.
4. **CURATED** — mark accepted only when rights, complete painting, fidelity and colour checks pass. Record reason and museum object ID. Exact artwork approvals/rejections remain immutable.
5. **APP RELEASE** — separate deployment acceptance, responsive crops and correct Calendar/Prayer associations. Do not infer publication from a research registry.

## Full persistent queues

- [Consolidated 383 records with visual, rights and editorial classification](../data/calendar/sacred-art-curator-queues-383-20261029.v1.json)
- [355 exact-file licence reviews](../data/calendar/sacred-art-curator-licence-review-20261029.csv)
- [65 actual photography repair / source-acquisition cases](../data/calendar/sacred-art-curator-photo-repair-20261029.csv)
- [Three source-verified, first-visual accepted photographs](../data/calendar/sacred-art-curator-near-ready-20261029.csv)
- [18 official museum CC0 original photo first-pass decisions](../data/calendar/sacred-art-curator-official18-native-first-visual-20261029.v1.json)
- [Auditable test for source cohorts, exclusions and all curatorial quantities](../scripts/art/validate-sacred-art-curator-queues-20261029.mjs)

**Execution order:** finish final photographic QA on the three strong candidates; crop the 13 official CC0 exact-source photographs that only need trimming; process the 40 A8 preliminary frameless images' rights and full native edges; handle the 99 substantive rights gaps and 25 missing/partial paintings by priority. Do not reopen approved artwork selection.
