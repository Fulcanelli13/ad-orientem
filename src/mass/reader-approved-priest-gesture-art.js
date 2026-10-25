// Exact existing user-approved generic hands-joined icon, restored for two
// published, 1962 priest GESTURE rubrics. It does NOT transfer a faithful
// posture to the priest-action rail or create a new observed gesture clock.
// Evidence: frozen v4.6 user bank, Oct 20 approved lock, 1962 gesture matrix.
const HANDS_JOINED_IMAGE=new URL("../../assets/active/mass-v46/hands_joined.svg",import.meta.url).href;
export const APPROVED_PRIEST_RUBRIC_GESTURE_ART=Object.freeze({
  "AO.RUB.C0117.02":Object.freeze({
    cueId:"AO.SM.C0117",label:"JOINS HANDS",
    actor:"PRIEST",kind:"GESTURE",assetId:"v46_hands_joined",
    gestureMatrixId:"GM.P.C0117.02",imageUrl:HANDS_JOINED_IMAGE,
  }),
  "AO.RUB.C0263.02":Object.freeze({
    cueId:"AO.SM.C0263",label:"JOINS HANDS",
    actor:"PRIEST",kind:"GESTURE",assetId:"v46_hands_joined",
    gestureMatrixId:"GM.P.C0263.02",imageUrl:HANDS_JOINED_IMAGE,
  }),
});
export function approvedPriestRubricGestureArt(event){
  const match=APPROVED_PRIEST_RUBRIC_GESTURE_ART[String(event?.id??"")];
  if(!match)return null;
  // A published rubric is an informative text annotation, not a LIVE
  // observation. Its actor, kind, cue, source, and exact action must agree.
  if(event?.sourceCueId!==match.cueId ||
     event?.shortAction!==match.label ||
     event?.actor!==match.actor ||
     event?.kind!==match.kind ||
     event?.observedNow!==false ||
     event?.owner!=="PUBLISHED_R17_MISSAL_INLINE" ||
     event?.review!=="EXISTING_PUBLISHED_R17_1962_RUBRIC" ||
     event?.sourceId!=="MR62_RITUS")return null;
  return match;
}
