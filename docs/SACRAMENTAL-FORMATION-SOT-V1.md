# Sacramental Formation — Source of Truth v1

**Status:** FROZEN  
**Freeze date:** 2026-10-07  
**Audited application baseline:** `4f31b6907b4eefdcb3d9b3976bfb4d8f5ee0eadc`  
**Machine-readable SOT:** `data/learn/sacramental-formation-sot.v1.json`

## Decision

The seven sacramental families now have complete lay-facing formation coverage. This freeze does **not** force every sacrament into an identical UI or into LEARN.

The governing rule is:

`one concern -> one canonical owner -> explicit handoffs`

The audit found no missing primary owner and no duplicate primary owner requiring another sacramental module.

## Canonical ownership

| Sacrament | Primary formation owner | Important supporting owners | Live / ritual owner |
|---|---|---|---|
| Baptism | `learn.rites.baptism` | Creed; Our Father | actual minister / parish |
| Confirmation | `learn.rites.confirmation` | `pray.confession`; Come Holy Spirit | actual authorized rite |
| Holy Eucharist / First Communion | `learn.rites.first_communion` | `pray.confession`; `mass.prepare`; `pray.communion_treasury`; `mass.thanksgiving`; Catechism | Mass reader |
| Penance / Reconciliation | **`pray.confession`** | Come Holy Spirit; Act of Contrition | priest + penitent; phone put away |
| Anointing of the Sick | `learn.rites.sick` | `pray.confession`; Rosary; `pray.dying_companion`; suffrages | priest |
| Holy Orders | `learn.rites.holy_orders` | Litany of Saints; Come Holy Spirit; Ember/Mass context | actual Pontifical rite |
| Matrimony | `learn.rites.matrimony` | certified Nuptial Mass reader | actual marriage rite + Nuptial Mass reader |

## Audit findings

### 1. Penance is an intentional cross-surface exception

Confession already has a mature five-stage owner in PRAY:

`Doctrine -> Prepare -> Examination -> In Confessional -> After`

Creating `learn.rites.penance` merely to make the seven sacraments look symmetrical would duplicate doctrine, examination, contrition and aftercare. It is therefore explicitly forbidden by this freeze unless a later SOT version changes the architecture.

### 2. Eucharist is intentionally lifecycle-split

First Communion formation belongs to LEARN, but the surrounding actions already have canonical owners:

- sacramental Confession -> `pray.confession`
- preparation before Mass -> `mass.prepare`
- the Communion moment -> Mass reader
- source-locked traditional Communion prayers -> `pray.communion_treasury`
- thanksgiving after Mass -> `mass.thanksgiving`
- continuing doctrine -> Catechism / Learn Mass

No new Communion-preparation or thanksgiving surface should be created.

### 3. Serious illness, dying and death are distinct states

`learn.rites.sick` owns sacramental formation and context.

When death may be near, the user moves to `pray.dying_companion`. After death, the app moves to suffrage and funeral/Requiem formation. These states must not be collapsed into one generic "sick/dying/dead" prayer flow.

### 4. Matrimony does not own a second Mass

`learn.rites.matrimony` explains preparation, consent and the lay-visible traditional ceremony. When a Nuptial Mass is celebrated, the existing certified 1962 Nuptial Mass reader owns the Mass sequence and its special prayers.

### 5. Holy Orders is formation, not clerical ceremonial

The Learn module may explain the historical Pontifical ladder and what a lay attendee may see. It must not become a bishop, master-of-ceremonies, ordinand or seminary manual, and it must not treat tonsure/minor orders/subdiaconate as extra current sacramental degrees.

## Normalized formation dimensions

The audit uses the same dimensions across the seven families without forcing identical card structures:

1. doctrine and meaning;
2. preparation;
3. lay participation / what you may see;
4. traditional-current authority boundary where relevant;
5. prayer handoff;
6. live ritual owner;
7. aftercare / continuing Christian life;
8. source authority.

A dimension may be marked **external-by-design**, **covered-by-handoff**, or **out-of-scope-by-design**. Those are valid states, not defects.

## Source policy

- Pre-conciliar Roman ritual/Pontifical sources explain the traditional rite.
- Current Catechism/canon-law/magisterial sources govern current universal discipline.
- Older discipline is never silently promoted into a current rule.
- French-world traditional witnesses are retained where available and useful.
- Sources are stored in the machine-readable SOT and in the external SOT workbook.

## Freeze rules

Future pipelines must not create duplicate sacramental owners merely because they discover new source material.

A new sacramental route or major ownership change requires all of the following:

1. identify the specific gap not served by an existing owner;
2. show why a handoff cannot solve it;
3. update `data/learn/sacramental-formation-sot.v1.json` by creating a **new SOT version**, not mutating the meaning of v1 silently;
4. update the regression contract;
5. pass the normal app/phone/visual convergence gates.

Research corrections to sources or wording are permitted without reopening the architecture if ownership remains unchanged.

## Out of scope after this freeze

The following are separate projects and must not be silently appended to sacramental formation:

- consecrated/religious life;
- general vocation programmes;
- Catholic customs/norms compendium;
- sacramentals;
- TLM directory / regional customs map;
- Latin course;
- broader marriage spirituality after the sacramental formation boundary.

Those may link to sacramental formation later, but they require their own ownership decision.
