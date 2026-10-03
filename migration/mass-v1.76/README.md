# Ad Orientem R16 GitHub Migration Pack

Target repository: `Fulcanelli13/ad-orientem`

Observed repository migration branch: `migration/v43.33`

This pack adds a **Mass-specific v1.76 frozen baseline** alongside, not instead of, the repository's whole-app v43.33 baseline.

## Verification

From the root of this pack:

```bash
python scripts/verify_mass_v176_extraction.py
python scripts/reassemble_mass_v176_reference.py
```

Both must pass.

Reference SHA-256:

`511145a0fc967abcc1f81504330a95a6242dece53ceb51105b7dc12a4d070c99`

The extraction verification is byte-exact: shell segments plus extracted script/data bodies reconstruct the original v1.76 HTML byte-for-byte.

## Important

`src/mass/legacy/reader-runtime-v1.76.js` is intentionally still large. R16 freezes and externalizes ownership seams; it does not prematurely refactor the central reader.


## R17 modular bootstrap

Entry point:

`migration/mass-v1.76/modular-index.html`

Verification:

```bash
python scripts/verify_mass_v176_modular_bootstrap.py
```

R17 preserves all 31 logical script/data blocks in original order. No production entry point is switched.