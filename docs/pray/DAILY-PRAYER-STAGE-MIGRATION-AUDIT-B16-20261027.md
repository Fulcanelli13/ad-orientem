# B16 — Lossless Morning/Evening stage migration audit

**27 October 2026 · Implementation draft PR #1786 · no change to production sequences**

## Why attaching historical tabs to existing cards is insufficient

The current Prayer reader uses its own stable Morning 11 / Evening 13 sequence IDs. It does **not** have a dedicated Morning Offering, and its Evening sequence lacks a separate Thanksgiving, Resolution, Protection before sleep, and Final Commendation. Replacing the text on an unrelated canonical ID would mislabel prayer identity, confuse saved preferences, and falsely imply a historical recitation was part of the original sequence.

This audit uses the actual repository arrays in `src/pray/traditional-pray-data.js` and `guidedDailyCards()`, not a historical 48-card mapping.

Machine source: `src/pray/daily-sequence-migration-audit.js`. Its `auditDailyStageMigration()` checks that **all 11/13 existing card IDs** are accounted for exactly once, including optional retained devotions. Unit regressions are in `tests/daily-formulation-engine.mjs`.

## Morning — nine requested purposes versus current 11 cards

| Proposed stage | Current coverage | What must change before opting in |
|---|---|---|
| Presence and adoration | **Partial**: `foundations_sign_of_cross` starts the prayer, but does not itself recite adoration | Add a complete sourced Adoration; keep Sign of Cross as separate opening cue |
| Thanksgiving | **Missing** | Add complete historical Thanksgiving, or a single combined Adoration/Thanksgiving when source does so |
| Holy Ghost invocation | **Present**: `sacrament_come_holy_spirit` | Retain, validate historical edition text/provenance |
| Morning Offering | **Missing** | Explicit stage for approved Apostleship / Sacred Heart / Good Intention variants |
| Faith, Hope, Charity | **Present**: three canonical Acts | Alternative source forms only after editorial and reuse approval |
| Petitions and resolution | **Missing** | Add a sourced petition and concrete resolution; original `sacrament_act_of_contrition` must not be falsely renamed |
| Common prayers | **Present**: Our Father, Hail Mary, Apostles' Creed | Keep optional/complete as appropriate, never truncate |
| Marian and Guardian | **Partial**: Guardian Angel present; Marian Hail Mary currently in Common prayers | Allow a complementary Marian stage without reciting shared Hail Mary twice |
| Conclusion | **Present**: Glory Be | Keep doxological conclusion |

**Coverage: 4 present, 2 partial, 3 missing.** The current Morning Act of Contrition is kept as a retained legacy option rather than discarded.

## Evening — nine requested purposes versus current 13 cards

| Proposed stage | Current coverage | What must change before opting in |
|---|---|---|
| Presence and adoration | **Partial**: opening Sign of Cross, not full Adoration | Add distinct historical Evening Adoration |
| Thanksgiving | **Missing** | Add separate Thanksgiving or source-original combined prayer |
| Examination | **Partial**: Holy Ghost invocation and `pray.nightly_examen` guided reflection | Source-specific petition for light stays distinct from guided, non-spoken conscience examination |
| Contrition | **Present**: `sacrament_act_of_contrition` | Allow real shorter and extended historical text alternatives |
| Purpose of amendment | **Missing** | Independent Resolution where printed separately (1905 French source) |
| Intercessions and departed | **Partial**: De Profundis, no intercessions for the living | Add historically attested living intercessions, don't relabel De Profundis as a collect |
| Marian | **Present**: Hail Mary, Hail Holy Queen | Share/reuse the prayer without redundant repetition |
| Night protection | **Missing** | Bedtime prayer, Salva nos antiphon, Visita collect; complementary text types can coexist |
| Final commendation | **Missing** | Complete sourced In manus tuas or comparable prayer; Glory Be is not equivalent |

**Coverage: 2 present, 3 partial, 4 missing.** Retain Our Father, Creed, three theological Acts and Glory Be as identifiable optional/complete items instead of silently deleting them.

## Guardrails for actual migration

1. **No change in this PR:** `DAILY_PROPOSED_STAGE_COVERAGE` is an audit/planning object, not a replacement for `MORNING_PRAYER_SEQUENCE_V381` or `EVENING_PRAYER_SEQUENCE_V381`.
2. **Exact ID ownership:** old cards retain their canonical IDs. New prayer stages receive fresh stable identifiers only when certified source bodies, language and editorial decisions exist.
3. **Source compounds render once:** 1905 French Thanksgiving/Offering is one original body; Lasance Evening Adoration/Thanksgiving/Light is one original body even though the schema has separate devotional purposes.
4. **No hidden deletions:** `auditDailyStageMigration()` fails if a legacy ID is unaccounted, double-assigned, or newly fabricated.
5. **Short means fewer complete prayers.** Complete and faithful historical single-book sequences are different types of presets; the Ad Orientem compositional routine must never be attributed to one old manual.
6. **Release gate:** `daily-approved-formulations.js` remains intentionally empty. User-approved wordings + territorial redistribution rights + printed-original copyediting are prerequisites to showing historical variants.
7. **Timer independent:** no automatic navigation; opening timer must not move the prayer itself.

## Technical status

Previous SHA `7c1ff060` passed required regression, traditional daily phone, and 23-route parity. Expanded phone interaction test from B15 and the new migration audit are newer changes, so passing CI for the latest HEAD remains required. No production release or merge is authorized.

Once editorial choices are approved, implement a **new sequence adapter** alongside current 11/13 baseline (feature-gated), test EN/FR source identity and mobile gestures, then only switch the default if the new sequence is validated. Do not force prayer categories into unrelated existing card IDs.

€0 cost; no paid storage, publisher contact, or Mass/Home/Calendar changes.
