# Catholic Life Retirement Audit — v1

**Status:** complete claim-level salvage audit  
**Date:** 2026-10-07  
**Audited baseline:** `4d40a6246f6af00fe1c11532177fc5bfad0db224`  
**Current route:** `learn.catholic_life`

## Decision

Retire **Catholic Life** as a standalone user-facing curriculum **after** its useful content has been deduplicated and re-homed.

The underlying research is not discarded. The audit treats Catholic Life as a temporary salvage corpus. The governing rule is:

`one concern -> one canonical owner -> explicit handoffs`

Catholic life is the whole application, not one catch-all course inside Formation.

## Corpus accounted for

- **10 courses**
- **79 stages**
- **409 claims**
- **101 registered sources**

Every claim and every registered source is represented in the machine-readable ledger:

`data/learn/catholic-life-retirement-audit.v1.json`

## Claim dispositions

- **MERGE_INTO_OWNER: 225**
- **PRODUCT_INTERNAL: 77**
- **MOVE_TO_SOT: 74**
- **REFERENCE_ONLY: 33**

Definitions:

- **MERGE_INTO_OWNER** — useful Catholic formation content. Deduplicate against the canonical owner and merge only missing substance.
- **MOVE_TO_SOT** — useful cross-surface norm, custom or reference fact. Normalize into the named shared SOT.
- **REFERENCE_ONLY** — useful recognition/vocabulary material, but not a formation curriculum.
- **PRODUCT_INTERNAL** — software ownership, inference, safety or rendering rules. Remove from learner-facing content.

## Largest canonical destinations

- `DEVELOPER_CONTRACTS_OR_DELETE` — 77 claims
- `learn.rites.matrimony` — 31 claims
- `pray.confession` — 28 claims
- `learn.rites.baptism` — 25 claims
- `learn.rites.sick` — 18 claims
- `CUSTOMARY_SOT.SACRAMENTALS` — 18 claims
- `FORMATION.FUNERAL_AND_REQUIEM` — 15 claims
- `learn.rites.holy_orders` — 13 claims
- `REFERENCE.CATHOLIC_GLOSSARY.CHURCH_ARCHITECTURE` — 12 claims
- `learn.rites.first_communion` — 11 claims
- `mass.prepare` — 11 claims
- `FORMATION.RELIGIOUS_LIFE` — 7 claims
- `FORMATION.VOCATIONS` — 7 claims
- `REFERENCE.CATHOLIC_GLOSSARY.SANCTUARY_FURNISHINGS` — 6 claims
- `learn.scapular` — 6 claims
- `CUSTOMARY_SOT.RELICS` — 6 claims
- `FORMATION.SPIRITUAL_LIFE.DAILY_RULE` — 6 claims
- `REFERENCE.CATHOLIC_GLOSSARY.CHURCH_FURNISHINGS` — 5 claims
- `REFERENCE.CATHOLIC_GLOSSARY.LITURGICAL_FURNISHINGS` — 5 claims
- `REFERENCE.CATHOLIC_GLOSSARY.DEVOTIONAL_SPACES` — 5 claims

## New owner decisions exposed by the audit

The retirement audit does **not** justify rebuilding Catholic Life. It exposes a small number of genuine formation gaps that need explicit ownership decisions:

- `FORMATION.CATHOLIC_HOME_AND_FAMILY` — 3 salvaged claims
- `FORMATION.SPIRITUAL_LIFE.INDULGENCES_AND_REPARATION` — 5 salvaged claims
- `FORMATION.SPIRITUAL_LIFE.SUPERSTITION_AND_DEVOTION` — 3 salvaged claims
- `FORMATION.SPIRITUAL_LIFE.DAILY_RULE` — 6 salvaged claims
- `FORMATION.FUNERAL_AND_REQUIEM` — 15 salvaged claims
- `FORMATION.RELIGIOUS_LIFE` — 7 salvaged claims
- `FORMATION.VOCATIONS` — 7 salvaged claims

These are candidates for focused formation strands, not a replacement umbrella module.

## Architectural consequences

### Sacraments

The frozen sacramental SOT remains authoritative. Baptism, Confirmation, First Communion, Serious Illness, Holy Orders and Matrimony keep their dedicated Formation owners; Confession remains in PRAY. Catholic Life loses duplicate ownership.

### Mass behaviour and gestures

Postures, gestures and reverences move to Mass/customary SOTs and should surface contextually in the reader and formation material rather than in a parallel behaviour course.

### Catholic year and devotions

Dates and temporal logic remain with Calendar. Prayer execution remains with PRAY. Historical/local practice belongs in Customs. Formation may explain meaning, but does not own a second calendar.

### Sacramentals and customs

Sacramental/customary claims move to shared customary SOTs and dedicated modules such as the Brown Scapular where one already exists.

### Places, shrines and pilgrimages

These route to the Explore/Directory corpus rather than a generic Catholic Life stage.

### Reference vocabulary

Church architecture and furnishing terminology is retained as contextual glossary/reference material. It is not a seven-stage formation course.

## Source ledger

All **101** Catholic Life source records are inventoried. Sources used by surviving claims are marked `RETAIN_AND_REHOME_WITH_CLAIMS` and list every destination that consumes them. Sources not used by any Catholic Life claim are flagged `REVIEW_UNUSED_IN_CATHOLIC_LIFE`; they are not automatically deleted because another corpus may use the same witness.

## Retirement gates

1. Deduplicate every `MERGE_INTO_OWNER` claim against its canonical owner.
2. Normalize every `MOVE_TO_SOT` claim into the named shared owner.
3. Resolve the focused new-owner gaps listed above.
4. Move `REFERENCE_ONLY` material into reference/glossary surfaces.
5. Remove `PRODUCT_INTERNAL` claims from learner-facing content.
6. Re-home all source records needed by surviving claims.
7. Run a coverage audit proving no useful claim exists only in Catholic Life.
8. Remove the `learn.catholic_life` launcher and runtime.
9. Delete the obsolete Catholic Life course files only after the coverage gate passes.

## Explicit non-goal

Do **not** build `Catholic Life 2.0`.

Any new formation work must be a focused canonical owner justified by a real gap exposed by this audit.
