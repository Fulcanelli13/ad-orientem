# Ad Orientem — 19 October icon review: P0 semantic corrections

**Source of authority:** the user's 19 October 2026 `Ad_Orientem_Icon_Review_2026-10-19.json` export, following the full 200-entry icon gallery. The later review supersedes earlier 10 October artwork assignments **only** where the user reviewed the particular illustration.

## Implemented in P0

- The physical artwork currently named `priest_epistle_rich` is used for Gospel-side stations/actions and vice versa for `priest_gospel_rich`. Both the station resolver and explicit priest-action icon keys are covered. Donor filenames, raw artwork, and station records are preserved.
- `GIVES COMMUNION` uses the user-approved `priest_rail_after_rich`, identified by the reviewer as **priest giving Communion to the faithful**.
- A generic `COMMUNION_RAIL` position is intentionally **not** illustrated by that distribution-specific depiction. The position text and state still exist.
- `ELEVATES CHALICE` resolves to the approved, distinct `priest_elevate_chalice_rich`, even when a source-owned cue directly requests the misleading `chalice_elevation` alias. Host elevation keeps its separately approved `priest_elevation` artwork.
- Unresolved `RECEIVES HOST`, `RECEIVES CHALICE`, `BREAKS HOST` and `PLACES PARTICLE` requests render **no action picture** instead of the shared, misidentified fraction/commingling/communion donor or Host-elevation art.
- `INCENSES PEOPLE` and `RECEIVES INCENSE` render no misleading priest-incenses-people action picture until actor-specific minister/incensation artwork is approved. In the standard ceremonial sequence the appropriate minister incenses the celebrant and faithful; this rendering correction does not alter any source-owned rubric.

## Important exclusions

This is an **icon-resolution patch only**. It changes no Mass text, prayer, oration, proper, Schola phase, temporal cue, state registry, posture instruction, voice cue, minister record, or form-specific/1962 rite behavior.

It does **not** delete original assets or rename them. The 67 donor masters remain byte-for-byte untouched. The `R17_FROZEN_ACTIVE_ICON_KEYS` and full host icon bank contract are unchanged.

The original review marked some position, action and gesture icons as `repurpose` **without assigning a replacement**. This P0 does not guess how to reuse those illustrations. Outstanding work includes actual faithful/priest bow distinctions, head-bow replacement, priest-motion art, Schola effective sizing, and source-aware incensation-minister illustrations.

## Coverage / regression expectations

`tests/reader-icons.mjs` must verify:
1. all six Epistle/Gospel station variations;
2. both direct source icon keys and label-only action resolution;
3. Host/Chalice separation and preservation of the Host **offering** illustration;
4. the Communion distribution action and absent generic position icon;
5. no contradictory priest incensing-people cue;
6. null action art when no reviewed exact illustration exists, without suppressing the native priest action, position or source cue.

**Status:** implementation prepared for integration; test results and deployment must be established separately.
