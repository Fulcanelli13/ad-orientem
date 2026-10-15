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

## Phase 2 — verified pre-Gospel source ownership (draft)

**Implemented on review branch, NOT yet deployed to historic Pages.** The reader now distinguishes source-backed Gradual, Alleluia, Tract and Sequence navigation only when each actually occurs in the resolved celebration.

**Source model:**
- Named separate sections `[Graduale]` + `[Alleluia]` or `[Tractus]` in all three language sources: reconcile every word with the host's existing flattened `proper.gradual` before adding a separate navigation card.
- Real Divinum Officium often coalesces chants in one `[Graduale]` section. The named-source route alone is insufficient. The parser now recognizes a single exact `!Tractus` heading (for example [First Sunday of Lent](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-0.txt)) or one double-Alleluia incipit that can be located **independently in Latin, English and French** (for example [Holy Rosary](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/10-07.txt)). It checks all 3 text reconstructions; conflicting source order, unsupported incipits or mismatched translations fall back to the **unsplit**, unmodified Proper, not guessed fragments.
- Existing `src/mass/pre-gospel-sequence.js` continues to own extended multi-lesson section sequences (Ember, Holy Week etc). Do not hijack this ordinary-Mass presentation splitter for them.
- The recovered witness lives in new `readerChantSourceProof` metadata, **not** `preGospelChants` (already used by the legacy host as a different kind of flag). This prevents a host-state collision discovered during 11 October 2026 real-calendar acceptance.
- No fixed text, original source paragraph, priest/Schola clock, Mass-form cue, rubric or date-specific Proper is editorially rewritten.

**Presentation denominators:**
| Sourced configuration | Model card count | Normally visible, with second Confiteor off |
| --- | ---: | ---: |
| Combined/no proven split | 65 | 64 |
| Separate Gradual + Alleluia/Tract OR separately sourced Sequence | 66 | 65 |
| Separate Gradual + Alleluia/Tract + Sequence | 67 | 66 |

The same optional Confiteor adds one *visible* card when selected. A preceding rite with authenticated Introit entry omits the four Foot-of-Altar cards (61/62/63 model). Explicit 48 rollback remains intact.

**Test evidence:** `tests/mass-phase12-chant-source-navigation.mjs` includes real-source-shaped Rosary/Lent multilingual boundaries, refusal of translated drift, exact source-paragraph conservation, Schola segment ownership and Introit/mode switching. `tests/reader-phone-source-chant-navigation.mjs` covers actual navigation buttons on 320/390/768 px, English/French, with Alleluia, Tract and optional Sequence. `tests/mass-pre-gospel-live-source-audit.mjs` independently checks real calendar resolver dates 2026-10-07 (Rosary) and 2026-02-22 (Lent 1); the audit must explicitly distinguish available verified proofs from source holds. **Passing synthetic/fixture tests does not establish that every live calendar Proper was split.**

Historic Pages network fingerprint and initial fresh-browser Home four-width check: [run #38685965148](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38685965148). No PR changes have been merged to public Pages.

## Acceptance before promoting

1. Prove the current Pages deployment's source SHA, retain screenshots at 320/390/768/1280 px in English and French and compare the preferred historic Home, Mass, Prayer and Calendar screens.
2. Run the **production entry**, not just the low-level fixture: 64 visible/65 optional, source text conservation, 48 rollback, swipe versus vertical scroll, Schola independence, Guide, icon rails, bells, exact highlighted cues and focus.
3. Verify independently source-matched Gradual, Alleluia/Tract and Sequence on actual calendar Masses, in real phone/browser acceptance, and expose unresolved Proper sources as evidence holds rather than phantom chants.
4. Preserve Missal/Simple, Low, Missa Cantata, Solemn, Canon, Good Friday, Easter Vigil, Palm/Ash/Candlemas, Requiem, nuptial, Ember lessons and processions with fail-closed source ownership.
5. Do not merge to `main` or alter the approved Pages link until Node release tests, real browser acceptance and **user visual review** are recorded against the exact candidate commit.

## Result at initial reconciliation

- Baseline branch and working branch: **established**.
- 65-default source contract: **inspected**, protected by `tests/mass-phase12-curated65-contract.mjs`.
- Conditional Sequence and triple-language-source-verified Gradual / Alleluia / Tract navigation: **implemented on review branch**, with live resolver evidence, full CI, browser screenshot review and coverage gaps to certify before merge.
- Historic Pages network source and fresh Home at four widths: **verified**. User's existing cached-tab visual parity, exact-head new Sequence phone acceptance, user approval and deployment: **open**.
