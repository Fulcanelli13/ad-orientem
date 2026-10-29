# Prayer UI/UX — consolidated closure audit
**29 October 2026 · Ad Orientem · source-owner register · bounded release gate**

## Decision
Stop introducing serial UX batches after B35–B38. The Prayer section already has its own navigation, source readers, shared focus adapter, family cards and specialised devotion flows. The correct next move is **one consolidated direct-entry and mobile-regression gate**, then a short and finite residual exception queue. No second reader architecture; no broad visual re-skin until production defects have evidence.

## Verified architecture and scope
- `src/pray/internal-route-owner.js` explicitly registers **27** supported internal Prayer / programme IDs, including some aliases and views that share an owner. `pray.rosary` is the **28th** supported direct-entry ID and intentionally delegates to the existing bead engine. **28 IDs does not mean 28 independent readers or 28 audited translations.**
- `src/pray/presentation-runtime.js` implements the actual direct entry dispatcher. The unified test identified three formerly advertised routes missing from `open(id)`: `pray.five_wounds`, `pray.precious_blood`, `pray.little_crown`. Those flows worked through family cards but failed a direct deep link. This PR aligns the dispatcher with the registry and resets state exactly as family-card entry does.
- The Rosary is still delegated; Angelus, Adoration and prayer-only aliases continue to use their canonical views. The old single-reader/parity gates and per-module ownership stay intact.
- Existing B35–B38 production work is merged: Novena progress/readability, Five Wounds legibility/language and thumb controls, Precious Blood prayer-first layout, historical private Litany typography. Do not reproduce those fixes or infer that the entire Prayer corpus is now fully art-reviewed.

## One finite release-gate matrix

| Gate | Type | Required evidence | Boundary |
| --- | --- | --- | --- |
| R0 — registry and dispatcher | Release blocker | 27/27 declared internal IDs appear in `open(id)`; unknown routes fail closed; Rosary still delegated | `tests/pray-ux-direct-route-contract.mjs`, run by existing `test:pray-owner` |
| R1 — real phone direct entry | Release blocker | All 27 internal views open at **320 and 390px**, render the expected view/title/main text, no global horizontal overflow, no duplicate devotional owner or uncaught page error | `tests/pray-ux-direct-route-mobile-audit.mjs`, 54 screen checks |
| R2 — existing high-risk readers | Release blocker | Keep previously passing B35–B38 phone/browser gates; maintain Rosary bead-focus, Novena EN/FR, Confession privacy, Adoration/Benediction public/private distinctions, Tenebrae, and the Required Main Gate | Existing GitHub Actions; no duplicate suite |
| R3 — historical provenance | Release blocker | No private 1883 English Litany used as public 1962 text, no uncollated 1862 French edition presented as certified; no fabricated French/Latin source variants or indulgence grants | Existing source-policy tests and fail-closed loaders |
| R4 — actual aesthetic assessment | Human review, not an automatic certification | Review the **13 representative entry routes** captured at 320 and 390px, plus existing dedicated EN/FR screenshots, specifically first prayer visibility, rails, touch targets, paragraph focus/contrast, icons and source-note density | 26 short-lived screenshots from the new gate; no new art assets |
| R5 — close remaining exceptions | Finite follow-up | Fix a defect only if R1/R4 proves it on a named reader and screen width. Group corrections by shared root cause, not single-prayer micro-phases | A single exception ledger; zero unbounded research waves |

## Remaining work ranked by user value
1. **P0 — deep-link correctness:** finish the 54-screen run and maintain the 3-entry fix; this was an actual broken route contract, not cosmetic polish.
2. **P1 — first-screen prayer visibility and controls:** read the representative screenshots. Flag only views where decorative headings/rail hide all source prayer, where a principal action cannot be reached with one thumb, or where text is unreadably dim. Existing B35–B38 fixes provide measured exemplars; do not propagate sticky nav to pages with an existing chapter timeline.
3. **P1 — bilingual/source behaviour:** retain existing historical English/French and optional Latin tests. Cross-language evidence must not be presented as a new verified edition. Expand only for a reproducible missing control or wrong source label.
4. **P2 — visual coherence:** icons, spacing, artwork quality and metadata density in family/reader cards. Tackle together with a representative design review, **after** all P0 findings are closed. Do not add a new card system.

## Scope and exit criteria
This audit is source-code grounded and supplements existing phone/browser acceptance. The route sweep in R1 is **English-first and entry/overflow-focused**; it is **not** a 28-route, three-language word-for-word certification or a claim that the public 1962 Litany has been collated. That remains a separate editorial task.

**Closure condition:** R0+R1+R2+R3 green at one exact PR head, screenshot review documented with any remaining P1 exceptions, merge, and production deployment `READY` at the exact merge SHA. Following that, stop the iterative B-number UX sequence and address only named issues from real use.

## Cost and evidence retention
Use only the existing GitHub repository, native free CI and 3-day temporary Actions screenshot artifacts. No paid assets, cloud storage subscriptions, continuous screenshot archive or additional reader dependencies. Do not advertise artifact retention as permanent preservation.
