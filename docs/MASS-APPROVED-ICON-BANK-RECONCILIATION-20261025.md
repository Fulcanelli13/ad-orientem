# Mass reader — approved artwork reconciliation (25 October 2026)

**Status: source-reconciled; no pictograms renamed or generated.** This is a targeted reconciliation of the older 608-assignment atlas, October 10 user selections, October 20 final approved lock/crosswalk, October 21 canonical set, and today's deployed reader. It is not a replacement card map or liturgical engine.

## What is already solved

The canonical reader already has distinct, locked and source-timed artwork for these phases. It must not treat any as a missing icon:

| Source cue | Ceremony | Current approved asset |
|---|---|---|
| C0110 | Offertory: offers Host | `v46_priest_elevate_host_rich` |
| C0114 | Offertory: offers Chalice | `v46_priest_elevate_chalice_rich` |
| C0174 | High elevation of Host after Consecration | `v46_priest_elevation` |
| C0181 | High elevation of Chalice after Consecration | `ao_elevation_chalice` |
| C0216 | Fraction | `ea_priest_fraction_host` |
| C0221 | Commingling | `ea_priest_commingling` |
| C0232 | Priest's Communion: Host | `ea_priest_communion_host_original` |
| C0234 | Priest's Communion: Chalice | `ea_priest_communion_chalice_original` |
| C0247 | *Quod ore sumpsimus*: first ablution / chalice | `ao_purify_chalice` |
| C0248 | *Corpus tuum*: finger ablution | `ao_purify_fingers` |

**Historical discrepancy.** The frozen 20 October crosswalk incorrectly has `ao_purify_fingers` at C0247 and `ao_purify_chalice` at C0248. The 21 October canonical set and current runtime already have the correct order. Keep the old crosswalk for provenance, but **never use it to overwrite current mappings**. The new executable test enforces that distinction.

## User recollection: "Priest offers Host / Chalice" as minor elevation

Both are real, individually approved pieces. The later user-name/semantic contract explicitly anchors them to the **Offertory**. The priest's **minor elevation** at `Per ipsum` (C0204) is a separate event: Host held above the chalice, raised together only slightly. A pair of one-object Offertory icons must not be relabelled as an exact illustration of this joint action on filename similarity alone.

The 10 October donor selection separately named `priest:elevate_host` for `priest_elevation.svg` (high elevation). The later bank gives the two "offers" icons their Offertory meanings. The missing `priest.action.minor_elevation` entry therefore represents a **phase-specific approval decision still required**, not missing image bytes. No mapping is changed pending explicit visual identification of an exact scene.

The same limitation applies to `Ecce Agnus Dei` (C0242): showing the Host to the people is not the high elevation nor the Offertory gesture.

## What the earlier gesture matrix already covers

The original 142-event matrix explicitly recorded:

- Priest **joins hands** at C0117 and C0263 using `hands_joined`.
- Priest **bows his head** at C0090 and others using `head_bow`.
- Priest **signs Gospel book, forehead, lips and breast** at C0084/C0269 using `gospel_crosses`.

These are **previously assigned**, but later canonical priest-action meanings are text-only. Earlier matrix assignment is evidence, not an authorization to overwrite the final approved actor/semantic lock: `gospel_crosses` is visually identical to `cross`; `head_bow` and `hands_joined` are in generic/faithful artwork banks. User confirmation should decide their exact priest usage. Importantly, existing **rubric text stays visible** and cannot be replaced by an approximate image.

## Other already-held artwork

- Final blessing: `assets/recovered/ao-live-blessing.svg` is a genuine recovery of frozen V4 artwork. Unlike `priest_blessing_rich` (*Indulgentiam*), this may be a useful candidate **subject to exact scene review**.
- `Hanc igitur`: an appropriately titled file exists under `assets/review/mass-icon-candidates/priest-hands-over-oblations.svg`, but **is not approved**. The older `priest_centre_hands_rich` depicts an altar-centre position, not a certified hand action.
- Kiss of Gospel: the named `priest_gospel_rich` is repurposed for the **Epistle-side station**, while `priest_kiss_altar_rich` is an **altar kiss**, not a Gospel-book kiss.
- Consecration priest inclined over Host/chalice: `ao_adoration` depicts a profound bow; `priest_profound_bow_rich` is the same original picture as the altar-kiss asset. Neither is an exact confirmation of the two consecratory postures.

## Priority for actual LIVE artwork use

1. **No new art:** maintain the approved ten-phase Offertory–Canon–Communion–ablution sequence above.
2. Reconcile generic hands-joined, Gospel small-crosses and head-bow assets against the full bank and user-approved *priest* semantics; provide exact image comparisons before changing LIVE ownership.
3. Verify the recovered original blessing artwork against the actual final blessing pose, without reusing *Indulgentiam* art.
4. Keep C0204 minor elevation and C0242 `Ecce Agnus Dei` textual unless an *exact* pre-existing approved depiction is identified and assigned by the user.
5. Keep the ten remaining text-only meanings documented in `mass-existing-icon-bank-reconciliation-20261025.v1.json`; do not advertise them as ten missing image files.

**Gate:** `npm run test:mass-icon-canonical-set` now includes source-verified existing-art sequence invariants, exact artifact existence, known historical discrepancies, and non-conflation checks. This audit is intentionally **non-publishing**, changing no asset assignments, frozen user decisions, app pages or runtime state.
