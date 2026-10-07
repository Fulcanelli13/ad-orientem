# Release / migration checklist

Before replacing any legacy owner:

- [ ] JavaScript parses without error.
- [ ] No duplicate DOM/SVG IDs.
- [ ] No new global click/router owner.
- [ ] Back closes the topmost visible surface first.
- [ ] Home performs the canonical presentation reset.
- [ ] Bottom ribbon remains stable on Home, Mass, Pray, Learn and Calendar.
- [ ] Lab-ora icons do not change/disappear after rerender, language change or Back/Home.
- [ ] Coming Up retains semantic icon + hero behaviour.
- [ ] Low Mass and Sung Mass both load.
- [ ] Sunday Asperges/Vidi aquam gating remains correct.
- [ ] Proper/Secret resolution remains exact.
- [ ] Schola/Missal duplicate text handling remains correct.
- [ ] Sign-of-the-Cross live cues remain icon-only.
- [ ] Live Mass swipe does not interfere with vertical scrolling or controls.
- [ ] Rosary and Stations direct navigation work.
- [ ] Adoration & Benediction remains one top-level Eucharistic module.
- [ ] Sacred-art mappings and provenance are unchanged unless explicitly reviewed.
- [ ] Prayer/liturgical text has not been editorially rewritten.
## Current tracked release blockers

As of 07/10/2026, the application release gate is tracked through GitHub issues rather than hidden PR descriptions:

- **#271 — EXACT_NON_MASS_DONOR_PARITY:** recover exact primary bytes or immutable renders for the missing v3.4.14 Rosary donor and v3.22 final non-Mass head. Current implementation tests are already green; this is a primary-evidence blocker.
- **#267 — Calendar/devotional corpus:** complete the canonical devotional-practice registry and 16-novena reconciliation. This is tracked separately from the release-evidence blocker and must not recreate a second Calendar/date engine.

A green implementation suite does not by itself close #271; follow the closure rule in that issue and `data/presentation/exact-donor-parity.v1.json`.

