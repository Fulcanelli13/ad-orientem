# Ad Orientem

A traditional Roman Mass companion focused on helping the faithful follow the 1962 Mass, pray, learn, and prepare for the liturgy.

## Migration status

This repository is entering a controlled migration from the historical single-file application to a modular static/PWA architecture.

The frozen behavioural source of truth is **v43.33 — Icon Ownership Consolidation**. During migration, architectural extraction must not silently change liturgical texts, Proper resolution, calendar behaviour, navigation, artwork decisions, icon ownership, prayer content, or Live Mass behaviour.

Work is isolated on the `migration/v43.33` branch until parity is demonstrated.

See:

- `docs/CANONICAL-BASELINE.md`
- `docs/MIGRATION.md`
- `docs/ARCHITECTURE.md`
- `docs/ASSET-INVENTORY.md`
- `docs/RELEASE-CHECKLIST.md`

## Canonical baseline

`Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html`

SHA-256:

`7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3`

The baseline is being imported under `legacy/v43.33.parts/` in deterministic chunks because the connector cannot safely write the 37.9 MB monolith in a single contents-API call. `tools/reassemble-v43.33.mjs` reconstructs the byte-identical HTML and verifies the hash.

## Migration principle

**Preserve behaviour first. Refactor second. Improve features only after parity is demonstrated.**
