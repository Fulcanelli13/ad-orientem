// Source-certified reference turns inside the opt-in LIVE handoff.
// A reference card number alone is NOT ceremonial authority. Each turn
// requires (1) the exact native 65-card mapping, (2) the current exact native
// source cue, and (3) its corresponding source-owned priest station/facing.
// Manual demonstration only; never an observation of real-world movement.
import {LIVE_HANDOFF_REFERENCE_TURNS,LIVE_HANDOFF_SOURCE_POINTS,
  projectLiveHandoffPlanPosition} from "./reader-live-handoff-geometry.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {liveHandoffCrosswalkAccepted} from "./reader-live-handoff-source-crosswalk.js";
const freeze=Object.freeze;
const TURNS=freeze([
  // The source's 49 verified priest-position transitions, NOT handoff
  // guessed timings, own these turns (reader-priest-positions.v1.json).
  freeze({referenceId:"C10",sourceCueId:"AO.SM.C0070",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  freeze({referenceId:"C20",sourceCueId:"AO.SM.C0106",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  freeze({referenceId:"C26",sourceCueId:"AO.SM.C0130",
    expectedFacing:"PEOPLE_DURING_TURN",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  // C55 (optional second Confiteor) is intentionally held: the source
  // transition C0238 has UNRESOLVED facing, not a certified facing turn.
  freeze({referenceId:"C56",sourceCueId:"AO.SM.C0242",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  freeze({referenceId:"C60",sourceCueId:"AO.SM.C0251",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  freeze({referenceId:"C61",sourceCueId:"AO.SM.C0257",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"}),
  freeze({referenceId:"C63",sourceCueId:"AO.SM.C0265",
    expectedFacing:"PEOPLE",sourceOwner:"R17_PRIEST_STATION_TRANSITION"})
]);
export const LIVE_HANDOFF_SOURCE_CERTIFIED_TURNS=TURNS;
export const LIVE_HANDOFF_TURN_HOLDS=freeze([
  freeze({referenceId:"C55",reason:"SECOND_CONFITEOR_CONDITIONAL_UNRESOLVED_FACING_C0238"})
]);
const hold=reason=>freeze({ok:false,reason,sourceCueId:null,id:null,
  path:freeze([]),kind:"TURN",automatic:false,observed:false,scope:"REFERENCE_ONLY"});

function sourcePathFor(refNumber){
  const steps=LIVE_HANDOFF_REFERENCE_TURNS[refNumber];
  // Never adopt the handoff's remaining unverified intermediate acts.
  // The 49-transition source only certifies CENTER -> face people.
  if(!Array.isArray(steps)||steps.length<2||
     steps[0]?.station!=="CENTER"||steps[1]?.station!=="CENTER"||
     steps[0]?.rotation!==0||steps[1]?.rotation!==180)
    return null;
  return freeze(steps.slice(0,2).map((step,index)=>{
    const sourcePoint=LIVE_HANDOFF_SOURCE_POINTS[step.station];
    const point=projectLiveHandoffPlanPosition(sourcePoint);
    if(!point)return null;
    return freeze({index,station:step.station,rotation:step.rotation,
      sourcePoint,point});
  }));
}

/**
 * A source cue allows the user to preview what turning to the people looks
 * like. It is NOT evidence that the celebrant was seen to turn, and no
 * return-to-altar sequence is invented.
 */
export function projectLiveHandoffSourceTurnPreview({gate,nativeState,prepared}={}){
  if(gate?.ok!==true||!gate.reference)
    return hold("EXACT_NATIVE_CROSSWALK_REQUIRED");
  if(!liveHandoffCrosswalkAccepted(gate.crosswalk?.status)||
     gate.reference.status!=="MATCHED_SOURCE_CARD"||
     gate.reference.expectedNativeId!==gate.reference.nativeCardId)
    return hold("CERTIFIED_NATIVE_SOURCE_IDENTITY_REQUIRED");
  const row=TURNS.find(x=>x.referenceId===gate.reference.referenceId);
  if(!row)return hold(LIVE_HANDOFF_TURN_HOLDS.some(x=>
    x.referenceId===gate.reference.referenceId)?
    "CONDITIONAL_SECOND_CONFITEOR_TURN_ON_HOLD":"NO_CERTIFIED_TURN_AT_REFERENCE");
  if(row.referenceId==="C63"&&isExplicitRequiemMass(prepared))
    return hold("REQUIEM_FINAL_BLESSING_OMITTED");
  if(gate.reference.evidence?.stateOnly===true||
     gate.reference.evidence?.omittedByRite)
    return hold("SUPPRESSED_OR_STATE_ONLY_CARD");
  const cue=String(nativeState?.nativeCueId??"");
  if(cue!==row.sourceCueId ||
     !gate.reference.evidence?.sourceCueIds?.includes(cue) ||
     nativeState?.cueProjectionSupported!==true)
    return hold("CURRENT_NATIVE_CUE_NOT_CERTIFIED_FOR_TURN");
  const position=nativeState?.priestPosition;
  if(position?.station!=="ALTAR_CENTER" ||
     position?.facing!==row.expectedFacing ||
     ["IN_TRANSIT","UNCONFIRMED"].includes(position.locationConfidence))
    return hold("SOURCE_PRIEST_STATION_OR_FACING_NOT_CONFIRMED");
  const anchoredCue=position.positionReferenceCueId??position.cueId??null;
  if(anchoredCue && anchoredCue!==cue)
    return hold("PRIEST_STATION_FROM_DIFFERENT_SOURCE_CUE");
  const referenceNumber=Number(row.referenceId.slice(1));
  const path=sourcePathFor(referenceNumber);
  if(!path||path.some(step=>!step))
    return hold("APPROVED_REFERENCE_TURN_GEOMETRY_MISMATCH");
  return freeze({
    ok:true,reason:null,id:"SOURCE_TURN_"+row.referenceId,
    name:"Reference celebrant turn toward congregation",
    referenceId:row.referenceId,sourceCueId:row.sourceCueId,
    sourceOwner:row.sourceOwner,kind:"TURN",path,
    observed:false,automatic:false,scope:"REFERENCE_ONLY",
    mayTrackActualProgress:false,mayUpdateSchola:false,
    interaction:"MANUAL_TURN_ILLUSTRATION_ONLY",
    isActualTurnObserved:false
  });
}
