# Calendar Ordo month layer — ICRSP reference, 26 October 2026

## Decision
Enhance the **existing** Ad Orientem 1962 Calendar; do not create another Calendar, change the shared day resolver, or replace the Liturgical Clock and month grid.

ICRSP France's https://icrspfrance.fr/ordo.php is a reference for a compact, readable liturgical *ordo*: each date exposes feast, rank, Mass colour, commemorations, and—where the source explicitly supports it—Mass formulary, Gloria, Credo, preface, discipline, and office notes. Their Ordo is **proper to the Institute of Christ the King**, not a universal norm.

## Phase 1 — this PR
- Add an optional **Grid / Ordo** presentation switch *within* the canonical Month tab, preserving the 42-cell grid and its three All / Temporale / Sanctorale filters.
- Render one expandable Ordo entry for every date actually in the displayed month, backed **only** by the same Calendar day cache. No second calendar, independent feast algorithm or parallel source registry.
- Display day, feast title, rank, colour and named commemorations **only when available from the resolved record**. Saved month previews explicitly remain provisional; unavailable days do not invent titles or rank.
- Keep the existing Day and Mass actions as the handoff. The Ordo's action opens the selected day, not an unverified alternate Mass.
- Include EN/FR strings, accessible native details/summary, 44px targets, and existing responsive font/colour system.
- Local, diocesan and religious propers remain explicitly outside this general-Roman projection; successful source loading is not equivalent to independent historical/rubrical certification.

## Phase 2 — not implemented here
Source-backed **Mass-specific Ordo** contract, to be developed from the existing canonical Mass resolver and properly adjudicated source records:
1. The exact observance/profile behind the selected principal Mass, including genuine local or religious overrides.
2. Alternative/votive Masses only when separately attested as permissible for the selected date, locality and liturgical profile; do not infer an option from the same saint's name.
3. Gloria, Credo, proper commemoration orations, preface and any special concluding Gospel or ceremonial notes **per formulary**, not as generic day-level booleans.
4. Sunday/feast transfers, local precedence, additional commemorations and their authority.
5. Optional office notes should be a separate attested source; do not derive them from a Mass Proper.
6. Precise citations and a fail-closed state when the source or permission is missing.

## Regression gates
The existing `tests/calendar-phone-month-controls.mjs` verifies both month presentations on 320/390/430px EN/FR, 42 retained grid dates, an expandable Ordo entry, the canonical day navigation control, filter synchronisation and absence of horizontal overflow. The existing CI workflow runs it for PR changes to the calendar runtime and test.

## Source hierarchy
- General Roman 1962 calendar/Code of Rubrics — normative baseline.
- The application's canonical 1962 day resolver for runtime display (not a new certification).
- ICRSP France's Ordo — presentation reference and institute-specific evidence only; no direct replacement of the general Roman observance.
