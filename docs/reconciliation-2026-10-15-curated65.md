# Ad Orientem — Phase 1 + Phase 2 reconciliation (15 October 2026)

Status: **working branch / not approved / not deployed**. This is an auditable baseline, not visual certification.

## Protected source and historic viewer

- Historic app: https://fulcanelli13.github.io/ad-orientem/
- Canonical repository: https://github.com/Fulcanelli13/ad-orientem
- Main source at beginning: `169f740744700c65a7feabed242a5ce27d72331d` (14 October map merge).
- Safety branch: `archive/2026-10-15-phase12-pre-reconciliation` at that same SHA.
- Working branch: `mass/phase12-curated65-reconciliation-20261015`. It is the only owner for this first reconciled change set.
- Folio Core is a donor/evidence archive, not a parallel production app. Preserve its unmerged unique improvements for separate selective PRs.
- **Live Pages network source verified 15 October 2026**, [GitHub Actions run #38685515747](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38685515747): `index.html`, `sw.js`, `src/mass/browser-entry.js`, and `src/mass/reader-live-curated-cards.js` all match the same files on `main` at `169f740744700c65a7feabed242a5ce27d72331d` byte-for-byte (uncached HTTP 200 downloads). Thus the **GitHub Pages network source is already current**; there is no distinct Pages fork to transplant or switch. This network comparison does **not** certify the currently open user's browser tab or the complete dependency graph. The app's versioned `sw.js` is cache-first for completed offline snapshots, and `src/app/offline-boot.js` offers an explicit Update/Later choice instead of silently activating updates. A browser may therefore continue displaying an earlier offline snapshot despite current Pages network files. Do not clear site data; preserve Scripture/Prayer state and use in-app Update when offered.

## Agreed Mass reading product

- 39 underlying certified source moments, curated into **65** ordinary Sung LIVE cards.
- **64 visible** normally, **65** when the optional second Confiteor is enabled.
- 48-card presentation remains an explicit `?aoLiveCards=48` rollback, NOT the new ordinary Sung default.
- Existing production browser entry already uses `reviewCuratedCards:!rollback48`. The native lower-level test fixture may still require `?aoLiveCards=65`: fixture behaviour must not be confused with the real app's entrypoint.
- No restoration of the rejected 116-card experiment. Do not replace the current app shell, three modes, or the sourced Canon and gesture/cinematic work.

## Phase 2 — pre-Gospel navigation: implemented first source-backed subdivision

**Implemented on review branch, not yet deployed:** the independently witnessed Sequence in `AO.SM.B022` now receives its own visible navigation card when and only when the day’s resolved Proper supplies nonempty source paragraphs. `AO.SM.B021` retains its original Gradual / Alleluia or Tract prayer paragraphs, without creating phantom separate chants from a coalesced source string. The adjacent `AO.SM.B023` Munda cor meum / Gospel preparation retains its own existing card. This gives:

- No separately sourced Sequence: **65 model cards** (64 visible normally / 65 with optional second Confiteor).
- Separate source-backed Sequence: **66 model cards** (65 visible normally / 66 with optional second Confiteor).
- Pre-Mass Introit handoff: **61 or 62 model cards** respectively after omitting the four Foot-of-Altar prayers, while keeping exact source cue/paragraph identity.
- The **48-card explicit rollback** remains unchanged.

The integration changes only source-backed presentation grouping, not canonical prayers, rubric time, priest/schola speaker owners or the host visual shell. New tests assert English/French texts, paragraph conservation, exact B021/B022 block ownership, Schola track handoff, previous/next navigation and Introit/mode-switch projections. The R17 phone suite additionally includes a real conditional Sequence test via `tests/reader-phone-conditional-sequence.mjs` at 320, 390 and 768 px with English, French and optional Confiteor; screenshots are retained in the existing curated65 artifact.

**Still open:** Gradual versus Alleluia/Tract **within** the B021 source paragraph. The source resolver often coalesces their text in `proper.gradual`, so no honest cue-safe split is possible until separate witnessed Latin/French/English source sections are carried through to the reader. Existing `src/mass/pre-gospel-sequence.js` recognizes `GradualeL…`, `TractusL…`, `AlleluiaL…` and `SequentiaL…` in exact source order; integrate those actual sourced payload boundaries instead of guessing at regex words. This is an explicit remaining Phase 2 issue and is **not** certified by adding the Sequence card.

Verified Pages network parity and initial fresh-browser Home baseline: [run #38685965148](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38685965148). Network files matched source `main`; the live site has not been updated by the draft PR.

## Acceptance before promoting

1. Prove the current Pages deployment's source SHA, retain screenshots at 320/390/768/1280 px in English and French and compare the preferred historic Home, Mass, Prayer and Calendar screens.
2. Run the **production entry**, not just the low-level fixture: 64 visible/65 optional, source text conservation, 48 rollback, swipe versus vertical scroll, Schola independence, Guide, icon rails, bells, exact highlighted cues and focus.
3. Verify the new independently sourced Sequence card in actual production phone/browser acceptance and continue resolving separate source-witnessed Gradual versus Alleluia/Tract paragraphs. Test Ordinary, Lent, Sequence days and special rites; no phantom chants.
4. Preserve Missal/Simple, Low, Missa Cantata, Solemn, Canon, Good Friday, Easter Vigil, Palm/Ash/Candlemas, Requiem, nuptial, Ember lessons and processions with fail-closed source ownership.
5. Do not merge to `main` or alter the approved Pages link until Node release tests, real browser acceptance and **user visual review** are recorded against the exact candidate commit.

## Result at initial reconciliation

- Baseline branch and working branch: **established**.
- 65-default source contract: **inspected**, protected by `tests/mass-phase12-curated65-contract.mjs`.
- Sequence distinct conditional card: **implemented on review branch, exact-head CI/visual approval pending**. Independent Gradual versus Tract/Alleluia split **open pending source witness**.
- Historic Pages network source and fresh Home at four widths: **verified**. User's existing cached-tab visual parity, exact-head new Sequence phone acceptance, user approval and deployment: **open**.
