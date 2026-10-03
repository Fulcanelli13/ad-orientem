# R19 — Mass corpus import

Branch: `migration/mass-v1.76-r18`

## Result

The v1.76 Mass corpus is now present on the migration branch.

The repository root `index.html` remains unchanged.

### Frozen source parity

The 31 logical v1.76 script/data bodies were compared against the frozen conversation attachment:

- direct blocks 1–16 excluding reader: 15/15 exact;
- direct blocks 17–31: 15/15 exact;
- reader source: 20/20 GitHub parts exact against the frozen reader slices;
- exact shell bundle: 32/32 segments exact.

The complete source can therefore be reconstructed by `scripts/verify_mass_v176_r19_tree.py` and must produce:

`511145a0fc967abcc1f81504330a95a6242dece53ceb51105b7dc12a4d070c99`

### Reader transport

The connected GitHub writer rejected the intact 6.5 MB reader blob at its HTTP/2 transport boundary. The source was not refactored.

Instead it is stored as 20 exact source parts under:

`src/mass/legacy/reader-runtime-v1.76.parts/`

All 20 parts were fetched back from GitHub and compared exactly to the frozen reader source.

`reader-loader-v1.76.js` synchronously reconstructs those parts when the modular parity page is served over HTTP(S) and inserts the result as a classic parser script at logical order 4.

### Modular parity entry

`migration/mass-v1.76/modular-index.html`

R19 regenerated this file directly from the frozen v1.76 source after the earlier R18 staging copy was found truncated.

Current structural gates:

- logical order: 1–31;
- external script dependencies: 31/31 resolve on the branch;
- data / transport loader syntax: 8/8 pass;
- production root index changed: no.

## Promotion gate

R19 makes the modular page a **runnable candidate**, not a production release.

Before production promotion:

1. run the full-tree Python verifier in CI or a normal checkout;
2. serve the modular page via HTTP(S);
3. complete a real browser/device smoke;
4. exercise representative form and special-rite scenarios;
5. only then consider switching the repository entry point.
