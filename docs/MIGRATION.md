# Controlled implementation / migration sequence

The application remains a donor monolith, but the next phase is not another patch layer and not a broad refactor. It is a source-controlled rebuild around canonical data ownership.

The governing sequence comes from MODULE v7 sheet 36_IMPLEMENTATION_SEQUENCE.

## Wave 0 — freeze donor and contracts

Freeze SOT12, PREPOST5, MODULE7 and the v43.53 donor/reference. Generate one implementation manifest. Do not add UI features.

Acceptance: no implementation uses superseded research IDs or a prototype as authority.

## Wave 1 — canonical runtime data model

Build the stable MC-* runtime event graph from SOT evidence.

In parallel:
- define actor/form/voice/concurrency/event contracts and projection interfaces;
- extract/confirm pure Calendar + Proper data contracts.

Acceptance:
- every enabled runtime event traces to SOT;
- E01–E71 remain evidence taxonomy;
- M001–M117 are absent from runtime identity;
- Low/Solemn form scope is explicit;
- unavailable overlays fail closed rather than being inferred;
- actor scope is explicit;
- there is no bell boolean;
- Calendar and Proper have independent failure states;
- no fake Feria Proper is generated.

## Wave 2 — repair objective Mass core

Repair objective Low Mass and certified Solemn Mass against the MC graph and Calendar/Proper contracts.

Do not infer Missa Cantata, Requiem, Asperges or Nuptial overlays.

## Wave 3 — participation projection

Add sparse faithful cues over the objective graph. Never copy priest/server/choir actions to the faithful without explicit evidence.

## Wave 4 — Guide / Understand the Mass

Produce source-controlled formation keyed to stable MC/section IDs. Function, history, meaning, custom and private devotion remain distinct lanes.

## Wave 5 — Before / After lifecycle

Integrate the already-certified PREPOST lifecycle outside the MC graph.

## Waves 6–10

Shared Scripture/prayer/saint/provenance services → PRAY → LEARN/TODAY → source-closed special forms only → modular migration/PWA/release hardening.

Historical v43.33 extraction work remains useful for regression and assets but cannot override this sequence or the frozen research heads.
