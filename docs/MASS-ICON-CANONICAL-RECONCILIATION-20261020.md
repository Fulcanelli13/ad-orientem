# Ad Orientem Mass icons — canonical artwork reconciliation (20 October 2026)

This is a **research/review registry**. It does not replace the frozen active Mass bank, change the 1962 Mass cue registries, or enable runtime assets. See [the machine-readable canonical registry](../data/presentation/mass-icon-canonical-artwork-registry-20261020.v1.json).

## Snapshot

- Mass V4.6 donor SVGs: **67 filenames, 47 distinct Git blobs**; aliases are recorded by **exact Git SHA**, not filename.
- Mass-relevant older bank gallery entries: **44**, including some paths no longer present on `main`.
- Modern 19 October study names: **35** (archive-only candidates are flagged, not invented as repository files).
- Permanent legacy exclusions: **16** exact SHA-256 fingerprints from rejected Batch 7.
- Final comparison #01: **all 16 icons retained**, because each image portrays a distinguishable setting/action. This does **not** authorize identical semantic bindings.
- Canonical reconciliation records: **135**, but this is **not** a count of unique physical pictures across different media.

## Authority precedence

1. **Exact user rejection of physical artwork** wins over prior semantic labels and historic approvals. Do not display it again.
2. **Reserve-only** retains a physical picture but excludes it from default candidate searches and production.
3. **Current visual approval** makes artwork eligible for appropriate uses, but requires a separate exact gesture/actor/posture binding check.
4. **Repurpose, hold, redraw and replaced-in-slot** are preserved without implying global removal of the same donor.
5. **Historical V4 gallery decisions** and 10 October selections are provenance, not absolute trump cards over a later review.
6. **Final comparison #01** preserved both pictures of each pair, not exclusive "winners."

## Required finishing gates (priority order)

1. **Reconcile asset bytes and canonical IDs.** Obtain every modern SVG from its source archive. Verify embedded/PNG vs genuine SVG, colour-mask compatibility, and SHA-256. Confirm gallery assets missing from `main`; migrate nothing without provenance.
2. **Resolve conflict list.** Review only genuinely ambiguous exact aliases, pending redraws, and the withheld status of the 16 retained comparison icons. Do not reopen old rejected imagery or repeat bulk galleries.
3. **Build a *reusable* semantic map.** Map each source-owned Mass cue category to an approved artwork or text-only; allow multiple visual uses, but never make artwork control ritual/posture/voice timing. Treat conditional ceremonies and actor profiles separately.
4. **Correct real gaps only.** Priest genuflection, generic priest positions, exact incensation actor and positioning, Lavabo, blurry icon quality, and anything revealed by exact on-device audit. Prefer using an existing accepted icon for minor repeated gestures.
5. **Validate and release selectively.** Test currentColor/mask with all actual liturgical palettes, sizes 32/48/64 on real phone viewports, cue triggers and actor/voice ownership, and canonical form coverage. Review PR #1460 and PR #1485; merge only after CI and visual acceptance.

## Known high-risk alias examples

- `chalice_elevation.svg` and `priest_elevation.svg` contain the same artwork, identified by the reviewer as a **Host elevation** depiction.
- `fraction.svg`, `commingling.svg`, and `communion.svg` are byte-identical despite distinct ceremonial meanings; their misleading fallback must stay blocked.
- `epistle.svg` and `gospel.svg` are identical; `priest_epistle_rich.svg` and `priest_gospel_rich.svg` have separately reviewed side assignments.
- `priest_kiss_altar_rich.svg` and `priest_profound_bow_rich.svg` share artwork despite different original descriptions; their accepted uses must remain explicitly distinguished.
- `priest_communion_rich.svg` and `priest_rail_rich.svg` share artwork; neither by itself proves the priest's own reception of Communion.

**Do not resolve these conflicts by renaming the ritual cue, copying unrelated image sources, or swapping priest/faithful actors.**

## Release status

**NOT MERGED / NOT RUN-TIME ACTIVE.** No application icon resolver, Frozen R17 masters, cue text, chronology, calendar, or posture profile is changed by this reconciliation. No tests were executed for the registry-only changes.
