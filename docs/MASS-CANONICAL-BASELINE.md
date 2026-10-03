# Mass canonical migration baseline — v1.76

## Scope

This document freezes the **Mass subsystem** reference used for the next GitHub migration wave.

It does **not** replace the repository-wide v43.33 baseline. The full application baseline remains authoritative for Home, Pray, Learn, Calendar, artwork, devotional modules, navigation, and other non-Mass behavior.

## Frozen Mass reference

- Build: `Ad_Orientem_v1.76_R15_RELEASE_HARDENING.html`
- SHA-256: `511145a0fc967abcc1f81504330a95a6242dece53ceb51105b7dc12a4d070c99`
- Size: `8,297,430` bytes
- Executable/data script blocks: 31
- Recovery status: R01–R15 integrated; v1.76 is the release-hardened Mass candidate.
- Migration status: frozen reference; refactor prohibited until extraction parity passes.

## Governing Mass behavior

The baseline includes:

- Low Mass;
- Missa Cantata — simple and with incense;
- Solemn Mass;
- Requiem variance overlay;
- funeral Absolution following action;
- Nuptial composite;
- manual/supplementary Proper resolution bridge;
- Asperges / Vidi aquam;
- Palm Sunday, Ash Wednesday, Candlemas and Rogations;
- Holy Thursday, Good Friday and Easter Vigil boundaries;
- Corpus Christi and generic procession following actions;
- Server / MC practice projection;
- MISSAL / SIMPLE / LIVE reader modes;
- priest route, posture/gesture, response, Schola, bell and cinematic surfaces.

## Preservation rule

Migration commits may externalize data and code but must not silently change:

- the two canonical Mass payloads;
- Proper selection precedence;
- Mass form topology;
- special-rite activation guards;
- response ownership;
- priest route/voice;
- posture/gesture cues;
- Schola deduplication;
- bell ownership;
- reader card/focus lifecycle;
- translation behavior.

Run `python scripts/verify_mass_v176_extraction.py` after every extraction-only change.

## Baseline relationship

```text
Whole application baseline
v43.33
  └── remains authoritative outside the Mass subsystem

Mass subsystem baseline
v1.76
  └── authoritative for the recovered Mass engine/reader migration
```