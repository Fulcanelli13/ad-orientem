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

Full SHA-256:

`7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3`

The 37.9 MB legacy baseline is being imported under `legacy/v43.33.parts/` because the connector cannot safely write the monolith in one contents-API request. The import is currently **partial but byte-verified**: CI verifies that the committed chunks are an exact prefix of the frozen file. It will switch to the full-file SHA-256 gate only after the complete baseline is present.

`legacy/v43.33.parts/IMPORT-STATUS.json` is the explicit authority for partial/full import state. The migration PR stays Draft until this bootstrap gate is complete.

## Migration principle

**Preserve behaviour first. Refactor second. Improve features only after parity is demonstrated.**
