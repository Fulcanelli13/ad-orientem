// Explicit 19 October 2026 user-approved faithful posture variants.
// Separate from the 67 frozen v1.80 / Mass v4.6 donor files.
// The normalized SVG copies correct malformed source viewbox casing and
// tighten visible framing without modifying the frozen v4 bank originals.
export const R17_REVIEWED_POSTURE_ASSETS=Object.freeze({
  review_posture_stand:new URL("../../assets/approved/live-posture/ao-reviewed-stand.svg",import.meta.url).href,
  review_posture_sit:new URL("../../assets/active/live-posture/ao-live-sit.png",import.meta.url).href,
  review_posture_kneel:new URL("../../assets/approved/live-posture/ao-reviewed-kneel.svg",import.meta.url).href,
  review_posture_genuflect:new URL("../../assets/approved/live-posture/ao-reviewed-genuflect.svg",import.meta.url).href,
  review_faithful_bow:new URL("../../assets/active/live-posture/ao-live-bow.png",import.meta.url).href,
});
