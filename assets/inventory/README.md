# Ad Orientem asset authority

The repository has two different asset populations and they must not be conflated.

## Authoritative bank

`assets/inventory/` records the frozen semantic contract. V4.0 froze 109 active semantic assets. V4.1.1 preserves that core exactly and admits 8 explicit post-contract identities, for 117 active identities in the hardened contract.

`assets/active/` is the externalized production subset of that authoritative bank. A file being absent from `assets/active/` does not authorize substitution from legacy artwork. Externalization should proceed by canonical `asset_id` and semantic identity from the inventory.

## Legacy and artwork

Historical/legacy assets may still be useful as hero artwork, illustrations, or provenance material. They do not regain semantic UI ownership merely because a canonical file has not yet been externalized.

Rules:

1. Semantic UI state is owned by the frozen/hardened inventory.
2. Legacy assets cannot silently replace a canonical semantic asset.
3. Decorative hero/illustration reuse is allowed only as presentation artwork, not semantic state.
4. R17 compatibility aliases may keep their current paths while they resolve to canonical V4 asset identities.
5. New module migrations should resolve by `asset_id`, not by guessing filenames from old HTML.

The runtime-neutral lookup table is `src/assets/asset-registry.js`.

## Binary source

The original binary source is `Ad_Orientem_Icon_Asset_Bank_v4_FROZEN.zip`. The inventories here are preserved from that freeze and the later V4.1.1 hardened contract.
