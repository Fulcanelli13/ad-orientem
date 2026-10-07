# Formation Gap Ownership — v1

**Status:** frozen architecture decision · Spiritual Life publication completed  
**Date:** 2026-10-07  
**Baseline:** `2d403ad325ba901d32eca619f0a6999f3b422a94`

This decision follows the retirement of `learn.catholic_life`. Its purpose is to prevent the residual research clusters from quietly recreating the same catch-all architecture under new names.

## Decision summary

| Area | Decision |
| --- | --- |
| Spiritual Life | **Published focused Formation strand** — `learn.spiritual_life` |
| Catholic Home & Family | **No standalone Formation module** |
| Funeral & Requiem | **No standalone module; absorb into existing death/Requiem owners** |
| Religious Life | **Research-only; no route** |
| Vocations | **Research-only; no route** |

## 1. Spiritual Life — published focused Formation strand

This is the only residual area that passes the test for an independent Formation owner.

The project already has substantial prior research on mental prayer, particular/general examen, spiritual reading, presence of God, sanctification of ordinary duties and a flexible rule/plan of life. The research base includes work with Tanquerey, Chautard, St Francis de Sales and Saint-Sulpice-style mental-prayer material, but it is not yet normalized into a single source-controlled corpus.

The future strand should teach the interior life and the method of living it. It must **not** duplicate PRAY, Calendar or Catechism.

Core scope:

- call to holiness and the purpose of the interior life;
- presence of God and recollection;
- mental prayer and how to begin;
- vocal prayer in relation to mental prayer;
- general and particular examen;
- spiritual reading;
- a stable but flexible rule/plan of life;
- sanctification of ordinary duties and work;
- distractions, dryness, perseverance and prudent adaptation;
- indulgences and reparation, without points-economy language.

The source corpus is now normalized and the strand is published. Every explanatory claim remains explicitly sourced; English/French parity is mandatory; school-specific methods are not presented as universal law; and the app does not imitate spiritual direction, scoring, streaks or gamification.

## 2. Catholic Home & Family — no module

Do not create `learn.catholic_home`.

The current product already has the correct distributed architecture:

- Apostolate `FH01–FH08` handles practical family-help questions;
- PRAY owns Rosary, grace, Morning/Evening Prayer and Sacred Heart prayer texts;
- First Friday remains its owned programme;
- Baptism, First Communion, Confirmation and Matrimony own sacramental family formation;
- Calendar/Customary own temporal and inherited domestic practices.

The three residual Catholic Life claims are now sourced and absorbed into Matrimony aftercare / the existing Family Help and PRAY owner network. No `learn.catholic_home` route was created.

## 3. Funeral & Requiem — no module

Do not create a second Funeral/Requiem Formation route.

Ownership is already distributed correctly:

- `learn.rites.sick` — preparation for serious illness, dying and the immediate after-death/funeral handoff;
- Mass — Requiem and funeral Absolution;
- PRAY — Dying Companion, Good Death, Holy Souls and suffrages.

The remaining material on death, funerals, the traditional Requiem, burial, cremation and ashes is now a sourced **after-death/funeral section inside Serious Illness & Dying**, with explicit handoffs to Mass and PRAY. The previously unsourced pastoral claims were source-repaired before publication.

## 4. Religious Life — research-only

Do not add a route.

The surviving material is only seven claims, four unsourced. Religious profession must also not be forced into Holy Orders merely because both can involve clerics: profession and ordination are distinct realities.

Keep the distinctions as research/reference. Reopen the question only if a proper source-complete study of states of life warrants it.

## 5. Vocations — research-only

Do not add a route.

Six of the seven residual claims are unsourced, while concrete sacramental paths already have owners in Holy Orders and Matrimony. Generic discernment content has a high risk of becoming vague pastoral advice or pseudo-spiritual-direction.

If future research warrants it, Religious Life and Vocations may converge into a single **States of Life & Vocation** strand. Neither currently earns a launcher.

## Governing rule

`one concern -> one canonical owner -> explicit handoffs`

The purpose of Formation is to teach coherent bodies of knowledge and practice. It is not required to contain a card for every dimension of Catholic existence.


## Closure

The Catholic Life dismantling/re-homing pipeline is complete.

- Funeral/Requiem residuals: **15/15 absorbed and sourced**.
- Catholic Home & Family residuals: **3/3 absorbed and sourced**.
- Previously unsourced residuals repaired in this final pass: **8**.
- Publishable residual claims without a canonical owner: **0**.
- Religious Life and Vocations remain deliberate research-only exclusions, not unfinished launch work.

Canonical closure ledger: `data/learn/catholic-life-final-absorption.v1.json`.
