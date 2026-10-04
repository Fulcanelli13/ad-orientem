# Ad Orientem

Ad Orientem is a traditional Roman Mass companion for the 1962 Roman Rite, with calendar/Proper resolution, Mass preparation, native MISSAL / SIMPLE / LIVE readers, posture and gesture guidance, Schola state, liturgical actions, special rites, and devotional modules.

## Production architecture

`main` is the application source of truth.

The Mass stack is modular under `src/mass/` and its liturgical/source data under `data/mass/` and `data/presentation/`. The certified native R17 reader is the production reader UI.

The historical single-file application remains in the repository as migration evidence and an explicit rollback/compatibility donor where still required. It is not the normal visible Mass reader.

## Reader policy

Production default:

`R17_NATIVE`

Available presentation modes are selected before Mass:

- MISSAL
- SIMPLE
- LIVE

The legacy reader can still be forced explicitly with:

`?aoR17Reader=legacy`

That rollback path exists for diagnosis and recovery; it is not the product default.

## Release state

The current release gate certifies:

- source-first LIVE Canon structure;
- Low, Missa Cantata and Solemn form state;
- phone/touch reader acceptance;
- full-year special-structure projection;
- Proper readiness/fail-closed behavior;
- native Schola, Guide, cue rails, bells/cinematics and plan-aware lifecycle.

The former 4 October 2026 field build is retained under `field/2026-10-04/` as historical test evidence only. Date-specific rescue hooks are not part of the production runtime.

## Development rule

New work should converge on `main` and the modular source tree. Do not create another parallel Mass implementation, field copy, or standalone rescue runtime unless it is explicitly temporary and isolated.

Preserve canonical source ownership, fail closed when a rite or Proper is unresolved, and regression-test changes against both the full Node suite and the phone-browser suite.
