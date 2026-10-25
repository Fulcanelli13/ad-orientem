// Exact published rubric-event artwork from the 11 October user-approved
// extension. The October 20 consolidated bank marks these two as unreviewed:
// preserve that historical lock unchanged, reconcile approvals here.
const APPROVED_FINGER_ART=Object.freeze({
  "AO.RUB.C0174.06":Object.freeze({
    cueId:"AO.SM.C0174",kind:"STATE",stateKey:"THUMB_INDEX_JOINED",
    assetId:"priest:fingers_joined_after_consecration",
    path:"assets/approved/mass/finger-contact-post-consecration.svg",
    sourceApproval:"data/presentation/mass-icon-extension-approvals-20261011.v1.json",
    imageUrl:new URL("../../assets/approved/mass/finger-contact-post-consecration.svg",import.meta.url).href,
  }),
  "AO.RUB.C0248.01":Object.freeze({
    cueId:"AO.SM.C0248",kind:"STATE",stateKey:"THUMB_INDEX_JOINED",
    assetId:"priest:post_communion_finger_ablutions",
    path:"assets/approved/mass/finger-ablutions-post-communion.svg",
    sourceApproval:"data/presentation/mass-icon-extension-approvals-20261011.v1.json",
    imageUrl:new URL("../../assets/approved/mass/finger-ablutions-post-communion.svg",import.meta.url).href,
  }),
});
export {APPROVED_FINGER_ART};
export function approvedFingerRubricArt(event){
  const item=APPROVED_FINGER_ART[String(event?.id??"")];
  return item&&event?.kind===item.kind&&
    (event?.sourceCueId??event?.cueId)===item.cueId &&
    (event?.stateKey??"THUMB_INDEX_JOINED")===item.stateKey
    ?item:null;
}
