# R18 — GitHub Mass staging

Branch: `migration/mass-v1.76-r18`

Base: `migration/v43.33` at `2a3ac224c409f8a069d425f6933833e53182add4`.

## Scope

R18 stages the v1.76 Mass-subsystem migration in parallel with the existing v43.33 whole-app migration.

It does not replace the repository-wide baseline and it does not change the production `index.html`.

## Current staging state

Committed in this wave:

- Mass v1.76 canonical-baseline documentation;
- R16 extraction plan and report;
- R17 modular-bootstrap plan and parity report;
- R17 browser-smoke record;
- modular parity HTML entry;
- explicit staging-status gate.

The modular parity HTML is intentionally **not considered runnable yet**. Its extracted source dependencies and the intact 6.5 MB reader owner are still absent from this branch.

## Hard gate

Do not expose the modular Mass entry as production until all files listed in `STAGING-STATUS.json` exist and the following are rerun:

1. exact v1.76 SHA reconstruction;
2. extracted-source SHA checks;
3. JS syntax;
4. JSON data-loader exactness;
5. load-order 1–31;
6. DOM-ID preservation;
7. browser/device smoke.

## Large reader rule

Do not arbitrarily split `reader-runtime-v1.76.js` to satisfy an upload mechanism. It remains one frozen migration artifact until a deliberate extraction wave removes one tested ownership area at a time.
