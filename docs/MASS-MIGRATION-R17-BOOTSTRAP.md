# R17 — Modular bootstrap parity

## Goal

Load the extracted v1.76 Mass files externally without changing Mass behavior. The central reader runtime remains intact. R17 changes delivery, not ownership.

## Reference

- Mass reference SHA-256: `511145a0fc967abcc1f81504330a95a6242dece53ceb51105b7dc12a4d070c99`
- Logical blocks: 31
- JSON data/contract blocks: 7
- Executable external scripts: 24

## Loader strategy

Classic JavaScript uses parser-blocking external `script src` tags at the exact original insertion points. JSON data blocks preserve the original DOM IDs and `application/json` type; generated parser-blocking loaders assign their exact original textContent before the next logical block executes.

## Entry point

`migration/mass-v1.76/modular-index.html`

It intentionally does not replace repository root `index.html`.

## Deterministic parity result

All 11/11 checks pass, including source hashes, JS syntax, exact JSON textContent, DOM IDs, logical load order, inter-script DOM boundaries, JSON parsing, and absence of inline-script identity dependencies.

Browser interaction acceptance remains separate and is not claimed by this gate.


## Browser smoke result

A container Chromium smoke was attempted but timed out before producing DOM output. Browser acceptance is therefore **not claimed**. See `R17_BROWSER_SMOKE.json`. This does not downgrade the deterministic parity gate.