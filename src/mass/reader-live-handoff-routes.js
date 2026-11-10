// Owner-approved reference paths, WITHOUT a live-ceremony clock.
// Movement requires an exact current native cue and explicit user selection.
// This must never be called by Mass card navigation to advance a real actor.
import {LIVE_HANDOFF_ASPERGES_ROUTE,LIVE_HANDOFF_INCENSATION_ROUTE,
  LIVE_HANDOFF_SOURCE_POINTS,projectLiveHandoffPlanPosition}
  from "./reader-live-handoff-geometry.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
const freeze=Object.freeze;
const INCENSE_FORMS=new Set(["MISSA_CANTATA_INCENSE","SOLEMN"]);
const ROUTE_CUES=freeze({
  "AO.SM.C0041":freeze({
    id:"ENTRANCE_ALTAR_INCENSATION",name:"Entrance altar incensation",
    source:"SOURCE_PRIEST_POSITION_C0041",
  }),
  "AO.SM.C0122":freeze({
    id:"OFFERTORY_ALTAR_INCENSATION",name:"Offertory altar incensation",
    source:"SOURCE_PRIEST_POSITION_C0122",
  })
});
function guard(reason){
  return freeze({ok:false,reason,sourceCueId:null,id:null,
    path:freeze([]),observed:false,automatic:false,scope:"REFERENCE_ONLY"});
}
function mapRoute(steps){
  const path=steps.map((step,i)=>{
    const source=LIVE_HANDOFF_SOURCE_POINTS[step.station];
    if(!source)throw Error("UNAPPROVED_ROUTE_STATION:"+step.station);
    const p=projectLiveHandoffPlanPosition(source);
    if(!p||!Number.isFinite(step.rotation))
      throw Error("INVALID_APPROVED_ROUTE_WAYPOINT:"+i);
    return freeze({index:i,station:step.station,rotation:step.rotation,
      sourcePoint:source,point:p});
  });
  return freeze(path);
}
const INCENSE_PATH=mapRoute(LIVE_HANDOFF_INCENSATION_ROUTE);
const ASPERGES_PATH=mapRoute(LIVE_HANDOFF_ASPERGES_ROUTE);
/**
 * The 49 source position transitions identify both precise C0041/C0122
 * route cues, while the handoff provides ONE approved generic altar walk.
 * We let the user preview those reference waypoints, never issue timing or
 * claim that an actual incensation is taking place.
 */
export function projectLiveHandoffIncensationPreview({gate,nativeState,prepared}={}){
  if(gate?.ok!==true||!gate.reference)
    return guard("EXACT_NATIVE_65_REQUIRED");
  const cue=String(nativeState?.nativeCueId??"");
  const row=ROUTE_CUES[cue];
  if(!row)return guard("NOT_AN_APPROVED_INCENSATION_CUE");
  if(!gate.reference.evidence?.sourceCueIds?.includes(cue) ||
     nativeState?.cueProjectionSupported===false)
    return guard("CUE_NOT_OWNED_BY_CURRENT_NATIVE_CARD");
  if(gate.reference.evidence?.stateOnly===true ||
     gate.reference.evidence?.omittedByRite)
    return guard("OMITTED_OR_STATE_ONLY_SOURCE_CARD");
  const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  if(!INCENSE_FORMS.has(form))return guard("INCENSE_NOT_ENABLED_FOR_FORM");
  const resolved=prepared?.session?.resolvedMass??{};
  const blocked=[...(Array.isArray(resolved.conditions)?resolved.conditions:[]),
    ...(Array.isArray(prepared?.session?.conditions)?prepared.session.conditions:[])]
    .some(x=>["INCENSE_DISABLED","NO_INCENSE","OMIT_INCENSE"].includes(String(x).toUpperCase()));
  if(blocked)return guard("INCENSE_EXPLICITLY_DISABLED");
  if(cue==="AO.SM.C0041"&&isExplicitRequiemMass(prepared))
    return guard("REQUIEM_ENTRANCE_INCENSATION_OMITTED");
  return freeze({
    ok:true,reason:null,id:row.id,name:row.name,
    sourceCueId:cue,sourceRow:row.source,
    path:INCENSE_PATH,
    observed:false,automatic:false,scope:"REFERENCE_ONLY",
    mayTrackActualProgress:false,mayUpdateSchola:false,
    interaction:"USER_REQUESTED_WAYPOINT_EXPLANATION"
  });
}
/**
 * Reserved for the native outside-Mass Asperges controller. The 65-card
 * band must NEVER show this path by inferring it from Mass cards. An actual
 * ASPERGES source-controller stage AND a user initiation are mandatory.
 */
export function projectLiveHandoffAspergesPreview({
  sourceRiteId=null,sourceStageId=null,controllerVerified=false,
  explicitlyRequested=false
}={}){
  if(sourceRiteId!=="ASPERGES" || !sourceStageId ||
    controllerVerified!==true || explicitlyRequested!==true)
    return guard("INDEPENDENT_ASPERGES_CONTROLLER_REQUIRED");
  return freeze({
    ok:true,reason:null,id:"ASPERGES",
    sourceCueId:null,sourceStageId:String(sourceStageId),
    path:ASPERGES_PATH,
    observed:false,automatic:false,scope:"REFERENCE_ONLY",
    mayTrackActualProgress:false,mayUpdateSchola:false,
    interaction:"USER_REQUESTED_WAYPOINT_EXPLANATION"
  });
}
export function clampLiveHandoffRouteStep(route,index){
  if(route?.ok!==true||!route.path?.length)return null;
  const raw=Number(index);
  const i=Number.isFinite(raw)?Math.max(0,Math.min(route.path.length-1,Math.trunc(raw))):0;
  return freeze({current:route.path[i],next:route.path[i+1]??null,
    index:i,count:route.path.length,
    atEnd:i===route.path.length-1});
}
