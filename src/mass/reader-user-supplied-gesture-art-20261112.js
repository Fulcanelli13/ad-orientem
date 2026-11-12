// User-supplied 12 Nov 2026 gesture artwork, separate from frozen V4/V4.6.
 // The three original transparent PNGs were converted into transparent
 // contour-preserving SVGs (source SHA-256 retained in the asset manifest).
 // This layer alters artwork only. All gesture, priest/faithful, form and
 // special-rite source ownership remains in R17 and the exact cue registries.
const crosses=new URL("../../assets/extensions/mass-user-gesture-20261112/gospel_crosses.svg",import.meta.url).href;
const breast=new URL("../../assets/extensions/mass-user-gesture-20261112/breast_strike.svg",import.meta.url).href;
const bow=new URL("../../assets/extensions/mass-user-gesture-20261112/profound_bow.svg",import.meta.url).href;
export const USER_SUPPLIED_MASS_GESTURE_ASSETS_20261112=Object.freeze({
 // Existing 65-card cue-bank keys (C0084/C0269; Confiteor and Domine).
 gospel_crosses:crosses,
 breast_strike:breast,
 profound_bow:bow,
 owner_profound_bow:bow,
 // The final approved source bank retains its original data and names;
 // these are explicit newer artwork aliases, not donor byte replacements.
 final_profound_bow:bow,
 // Shared reader semantic keys, including special-rite Gospel headings.
 "canon:faithful.gesture.gospel_crosses":crosses,
 "canon:faithful.gesture.strike_breast":breast,
 "canon:faithful.gesture.bow_profound":bow,
 "canon:priest.action.profound_bow":bow,
 // The priest's breast strike already deliberately reused the approved
 // generic asset, unlike his separate priest-specific profound-bow art.
 "canon:priest.action.strike_breast":breast,
});
export const USER_SUPPLIED_MASS_GESTURE_SOURCE_CUES_20261112=Object.freeze({
 gospel_crosses:Object.freeze(["AO.SM.C0084","AO.SM.C0269"]),
 breast_strike:Object.freeze([
  "AO.SM.C0017","AO.SM.C0022",
  "AO.SM.C0196","AO.SM.C0197","AO.SM.C0198",
  "AO.SM.C0222","AO.SM.C0223","AO.SM.C0224",
  "AO.SM.C0236","AO.SM.C0243","AO.SM.C0244","AO.SM.C0245"
 ]),
 profound_bow:Object.freeze(["AO.SM.C0021","AO.SM.C0016","AO.SM.C0079",
  "AO.SM.C0150","AO.SM.C0187"]),
});
// The last source is conditional: profound bow at Confiteor is shown
// only when the resolved faithful gesture is actually PROFOUND_BOW,
// never for a kneeling communicant or a head-only bow.
