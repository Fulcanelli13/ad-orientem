# R19 — Corpus and objective-engine reconciliation

## Result

R19 closes the **Mass domain/objective** migration gate without creating a second competing Mass engine.

The repository already contained the R17 objective engine. Instead of importing the v1.76 recovery scripts as another owner, R19 grafts that engine onto the v1.76 staging branch and reconciles it with the later R03 Missa Cantata certification.

## Canonical layering

```text
178-event MC-* objective core
  ├─ Low native certification
  ├─ Solemn native certification
  └─ Missa Cantata certification projection
       ├─ SIMPLE_NO_INCENSE
       └─ SOLEMNIZED_WITH_INCENSE

then:
Proper resolver
→ recovered overlays / distinct rites / following actions
→ reader / presentation projection
```

The 178-event core is not rewritten to pretend it always knew about RG-003 closure.

## Missa Cantata reconciliation

Authority: `MC-CERT-2026-09-22.1`.

- 189 certification bindings;
- all 178 canonical core IDs have exactly one binding;
- 11 certificate IDs are explicitly outside the canonical core;
- MC Simple and MC Incense remain the same form with distinct ceremonial profiles;
- no deacon or subdeacon runtime actor;
- torchbearers are optional staffing metadata only, not a canonical MC runtime actor;
- Epistle resolver remains tonsured cleric if present, otherwise celebrant;
- Gospel remains celebrant;
- formal Solemn Pax remains excluded;
- Second Confiteor remains suppressed.

The three explicit incense-only canonical moments are:

- `MC-ALT-040`;
- `MC-OFF-110`;
- `MC-OFF-120`.

## GitHub CI

Run: https://github.com/Fulcanelli13/ad-orientem/actions/runs/37094461958

The branch passes:

- Wave 1 canonical graph validation;
- B005 Low;
- B006 Solemn;
- B007 invariant regression;
- R17 recovered-form convergence;
- R19 Missa Cantata certification projection.

## Presentation / reader boundary

The v1.76 reader remains the presentation reference, but its exact GitHub import is intentionally not complete.

`reader-runtime-v1.76.js` is 6,579,106 bytes. Approximately 6.28 million characters are 57 embedded image data URIs; the actual non-image JavaScript is only about 295k characters.

R19 therefore does **not** arbitrarily split the reader's ceremonial logic to satisfy an upload mechanism.

The next migration gate is exact asset extraction:

1. extract the 57 data-URI assets byte-for-byte;
2. give each asset a stable semantic/path manifest;
3. replace embedded URIs only through a verified asset resolver;
4. prove reader behavior and icon ownership unchanged;
5. then activate the parallel modular entry for browser/device parity.

## Production

The repository root `index.html` remains untouched.
