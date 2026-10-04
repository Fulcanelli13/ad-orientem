# Ad Orientem

Ad Orientem is a traditional Roman Mass companion for the 1962 Roman Rite, with calendar/Proper resolution, Mass preparation, native MISSAL / SIMPLE / LIVE readers, posture and gesture guidance, Schola state, liturgical actions, special rites, and devotional modules.

## Production architecture

`main` is the application source of truth.

The Mass stack is modular under `src/mass/` and its liturgical/source data under `data/mass/` and `data/presentation/`. The certified native R17 reader is the production reader UI inside the explicitly promoted rollout scope.

The historical single-file application remains in the repository as migration evidence and an explicit rollback/compatibility donor where still required. Outside the promoted reader scope it remains the safe production fallback until that special rite's visible native surface is separately accepted.

## Reader policy

Production default:

`FIELD_NATIVE_PREVIEW`

The native default currently covers ordinary/votive Mass in the certified forms, plus Asperges, Palm Sunday and Ash Wednesday. Other special structures may already have complete runtime/data parity without yet being production-promoted as visible native surfaces.

Available presentation modes are selected before Mass:

- MISSAL
- SIMPLE
- LIVE

The legacy reader can still be forced explicitly with:

`?aoR17Reader=legacy`

That rollback path exists for diagnosis and recovery. It is also the automatic outside-scope fallback until a special rite is explicitly promoted.

## Release state

The current release gate certifies:

- source-first LIVE Canon structure;
- Low, Missa Cantata and Solemn form state;
- phone/touch reader acceptance;
- full-year special-structure projection (runtime/data parity, not automatic UI promotion);
- Proper readiness/fail-closed behavior;
- native Schola, Guide, cue rails, bells/cinematics and plan-aware lifecycle.

The former 4 October 2026 field build is retained under `field/2026-10-04/` as historical test evidence only. Date-specific rescue hooks are not part of the production runtime.

## Development rule

New work should converge on `main` and the modular source tree. Do not create another parallel Mass implementation, field copy, or standalone rescue runtime unless it is explicitly temporary and isolated.

Preserve canonical source ownership, fail closed when a rite or Proper is unresolved, and regression-test changes against both the full Node suite and the phone-browser suite.
