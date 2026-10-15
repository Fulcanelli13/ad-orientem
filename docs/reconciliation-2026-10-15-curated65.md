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

## Identified Phase 2 issue — pre-Gospel navigation

The 65-card source grouping currently retains **AO.CARD.006**, titled “Gradual · Alleluia / Tract / Sequence,” as ONE visible presentation card. The source layer separately identifies `AO.SM.B021` (Gradual), `AO.SM.B022` (Alleluia/Tract/Sequence) and `AO.SM.B023` (Munda / Gospel preparation). The Proper resolver often coalesces Gradual/Alleluia/Tract in `proper.gradual`, and only offers a distinct Sequence if actually present in `proper.sequence`.

**This does not yet meet the requested finer pre-Gospel navigation.** Next integration should split source-witnessed chant moments where texts and rubrics allow, with distinct focus/cue boundaries, without inventing source text, chapel practice, absent chants, or an inflexible universal card count. Exact handling of Solemn priest vs Schola ownership must remain intact.

## Acceptance before promoting

1. Prove the current Pages deployment's source SHA, retain screenshots at 320/390/768/1280 px in English and French and compare the preferred historic Home, Mass, Prayer and Calendar screens.
2. Run the **production entry**, not just the low-level fixture: 64 visible/65 optional, source text conservation, 48 rollback, swipe versus vertical scroll, Schola independence, Guide, icon rails, bells, exact highlighted cues and focus.
3. Reconcile proper-conditional Gradual, seasonal Alleluia/Tract and sourced Sequence as navigable boundaries. Test ordinary Sunday, Lent, a Mass with Sequence, special rites and cases with absent chants.
4. Preserve Missal/Simple, Low, Missa Cantata, Solemn, Canon, Good Friday, Easter Vigil, Palm/Ash/Candlemas, Requiem, nuptial, Ember lessons and processions with fail-closed source ownership.
5. Do not merge to `main` or alter the approved Pages link until Node release tests, real browser acceptance and **user visual review** are recorded against the exact candidate commit.

## Result at initial reconciliation

- Baseline branch and working branch: **established**.
- 65-default source contract: **inspected**, protected by `tests/mass-phase12-curated65-contract.mjs`.
- Independent visible Gradual/Tract/Alleluia/Sequence navigation: **open**.
- Verified historical Pages parity, exact-head browser tests, deployment: **open**.
