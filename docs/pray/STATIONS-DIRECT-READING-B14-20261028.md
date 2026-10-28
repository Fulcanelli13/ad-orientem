# B14 · Stations of the Cross — direct reader choice

28 October 2026 · follows merged B08–B13.

## Existing corpus and boundaries

The native Stations reader already has **fourteen source-owned St Alphonsus Stations**, historic English meditation/prayers and an editorial French rendering whose printed collation is not claimed complete; optional Latin prayer faces, V/R, corresponding Gospel contextual capsules and optional Stabat Mater between stations. The phone reader has one fourteen-stop timeline, horizontal swipe for stations, vertical prayer scrolling, and I–XIV jump controls.

The historic public posture cues (genuflect at versicle / stand during meditation / kneel for prayer) apply **only when the optional public method has explicitly been chosen**, not to all Stations or every group recitation. It cannot be deactivated accidentally by switching to the Simple view.

## B14 implementation

- Show just **two one-tap reading depths** directly above the existing prayer card: “Guided · St Alphonsus” (existing historical meditation/prayer, responses and optional Our Father/Hail Mary/Glory Be) and “Simple · contemplation” (existing station heading, Gospel context and silence).
- This is **not two alternative printed methods**. Neither station titles nor source texts, editions, readings, counts, provenance or ritual permissions are changed. The existing saved `S.stations.mode` property owns the choice; there is no new persistence store.
- Remove the redundant depth selector from the secondary settings disclosure. Group/individual recitation, optional historical public posture, Stabat Mater and simple V/R remain separately available there.
- The public method continues to force the guided group recitation as already implemented. Simple is disabled with a short explanation while that method is explicitly active. Switching reader depth never silently changes public posture.
- Rename the existing one-tap trio disclosure “Our Father · Hail Mary · Glory Be” so complete canonical prayer texts are obvious; no long new settings panel or duplicate prayers.
- Preserve native 14-card progress, keyboard and touch navigation, cinematic transitions, source links and explicit completion. No new prayers, no extra station, no costs.

## Release acceptance

Static source/provenance contract asserts fourteen-source progression, original three canonical prayer IDs and optional public postures. Real 390px mobile asserts guided/simple one tap, exact source-conditional content, trio disclosure, protected public-mode selection, and unchanged progress/swipes. Real 320px checks no selector overflow. Required-main/Prayer-owner/App-convergence gates and production alias must be verified before release.
