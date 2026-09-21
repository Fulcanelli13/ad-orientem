# Ad Orientem

A traditional Roman Mass companion focused on helping the faithful follow the 1962 Mass, pray, learn, and prepare for the liturgy.

## Controlled implementation status

Research convergence is complete. New implementation work is governed by SOT-2026-09-21.12, PREPOST-2026-09-21.5 and MODULE-SOURCE-2026-09-21.7.

The implementation lane is now Wave 0 → Wave 1: freeze donor/contracts, build the canonical MC-* event graph, then repair objective Low and certified Solemn Mass against that graph.

See docs/IMPLEMENTATION-MANIFEST.md.

## Identity policy

E01–E71 are research/evidence taxonomy only.
MC-* are canonical runtime event identities.
M001–M117 are disposable prototype traversal numbers and must not become persisted identity.

## Donor monolith

Frozen donor/reference: Ad-Orientem-2.0-v43.53-LIFECYCLE-RUNTIME-FREEZE.html
SHA-256: 3f25713c9f7de9707332ee39f971a4fcb82192f97bea89e2bf543cee39996cb5

The donor preserves certified behavior but may not override the frozen research heads.

## Repository rule

Implementation work stays isolated from main until the acceptance gates pass. Current lane: implementation/wave-0-1-canonical-runtime.

The earlier v43.33 migration material is historical regression evidence only, not authority for new implementation decisions.

## Next gate

B001 — freeze heads/donor and manifest.
B002 — canonical MC event graph.
B003 — actor/form/voice/concurrency/event and projection contracts.
B004 — pure Calendar/Proper contracts.

Wave 2 Mass repair starts only after B002–B004 pass.
