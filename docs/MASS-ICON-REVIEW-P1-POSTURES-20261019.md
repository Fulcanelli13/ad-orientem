# P1 — 19 October approved posture and bow artwork

## Source
The explicit 19 October 2026 icon review JSON supersedes prior selections only where a new decision was made. Exact approval references:
- `bank:POSTURE.STAND` — accept; better if cropped properly
- `bank:POSTURE.SIT` — accept; better than old sit
- `bank:POSTURE.KNEEL` — accept; better if cropped properly
- `bank:POSTURE.GENUFLECT` — accept; better if cropped properly
- `bank:POSTURE.BOW` — accept; for faithful bow
- `mass:bow` — repurpose; for priest bow
- `mass:head_bow` and `bank:GESTURE.HEAD_BOW` — reject
- `mass:priest_profound_bow_rich` — repurpose; reviewer identified it as priest kissing altar rather than bowing
- `mass:priest_genuflect` — repurpose without approved priest-specific destination

## Implementation
1. Add five namespaced `review_*` posture assets, preserving the 67 original v1.80 Mass donor masters and all frozen core bank files.
2. The three approved bank SVGs had `viewbox` (lowercase) in source, which is invalid XML for the standard case-sensitive `viewBox` attribute. Normalized **copies** with exact source artwork and tighter viewBoxes live under `assets/approved/live-posture`, without rewriting source images or shapes.
3. `SIT` and faithful `BOW` use their bank PNG masks directly. Do not rewrite or upscale pixels on speculation.
4. Faithful Posture/gesture icon mapping is actor-scoped; `BOW` means reviewed faithful bow. Priest slight bow uses the separate approved Mass `bow` donor key.
5. Both rejected head-bow variants and the misidentified profound-bow-as-altar-kiss display no artwork. The source ritual cue, label, and chronological triggers remain.
6. Registry/ceremony data, 1962 posture/customary profiles, textual Mass, guides, and icon donor parity are unchanged.

## Acceptance boundaries
- No icon may cause a cue's activation or disappearance; missing art must fail closed at presentation only.
- Priest actions and faithful gestures are never inferred solely from an illustration.
- Do not promote the user-unreviewed alternative positions, priests' genuflection or exact degree of profound bow to approval.
- The new files must resolve through the production host, not only through review-gallery paths.
- Normalized SVG cropping is numerical and preserves all source shapes; on-device framing requires visual acceptance, particularly at 320–390 px phone widths.

## Follow-up
A new priest/faithful head-bow depiction and exact priest profound-bow artwork need separate review. P2 should address remaining unapproved action illustrations and Schola rendering size.
