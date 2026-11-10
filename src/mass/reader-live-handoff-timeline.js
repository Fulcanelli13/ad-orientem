import {liveHandoffCrosswalkAccepted} from "./reader-live-handoff-source-crosswalk.js";
// Stage D source-first visual readout. The 65 native reader cards are the
// only ordinal axis. The other five lanes are not "time" forecasts.
// In particular, Schola playback/selection is independent and may not be
// located on the current prayer-card x coordinate.
const freeze=Object.freeze;
export const LIVE_HANDOFF_TIMELINE_LANES=freeze([
  freeze({id:"PRIEST",label:"Celebrant"}),
  freeze({id:"MINISTERS",label:"Ministers"}),
  freeze({id:"SCHOLA",label:"Schola"}),
  freeze({id:"ORGAN",label:"Organ"}),
  freeze({id:"BELLS",label:"Bells"}),
  freeze({id:"FAITHFUL",label:"Faithful"})
]);
const validNativeCue=cue=>/^AO\.SM\.C\d{4}$/.test(String(cue??""));
const plain=value=>String(value??"").trim().replace(/\s+/g," ").slice(0,110);
const safeNumber=value=>Number.isFinite(Number(value))?Number(value):null;
const matchNative=(gate,nativeState)=>Boolean(
  gate?.ok===true &&
  liveHandoffCrosswalkAccepted(gate?.crosswalk?.status) &&
  gate?.reference?.status==="MATCHED_SOURCE_CARD" &&
  gate?.reference?.nativeCardId &&
  gate.reference.expectedNativeId===gate.reference.nativeCardId &&
  validNativeCue(nativeState?.nativeCueId) &&
  gate.reference.evidence?.sourceCueIds?.includes(nativeState.nativeCueId) &&
  nativeState?.cueProjectionSupported===true
);
function lane(id,status,text,source=null,location=null){
  return freeze({id,status,text,source,location,
    // 'location' is intentionally null for Schola: no inferred time sync.
    cardClockOnly:location!=null,observedPerformance:false});
}
export function projectLiveHandoffTimeline({gate,nativeState,scholaState=null,model}={}){
  if(gate?.ok!==true || !Array.isArray(model?.cards) ||
     ![65,66].includes(model.cards.length) ||
     !liveHandoffCrosswalkAccepted(gate.crosswalk?.status) ||
     gate.reference?.status!=="MATCHED_SOURCE_CARD")
    return freeze({ok:false,reason:"EXACT_NATIVE_65_REQUIRED",current:null,lanes:freeze([]),
      cards:freeze([]),total:0,observedTiming:false});
  const ordered=gate.crosswalk.expandedMappings;
  if(!Array.isArray(ordered)||ordered.length!==model.cards.length ||
     ordered.some((ref,i)=>
      ref.status!=="MATCHED_SOURCE_CARD" ||
      ref.nativeSequence!==i+1 ||
      model.cards[i]?.sectionId!==ref.nativeCardId))
    return freeze({ok:false,reason:"SOURCE_SEQUENCE_DRIFT",current:null,lanes:freeze([]),
      cards:freeze([]),total:0,observedTiming:false});
  const reference=gate.reference;
  const n=safeNumber(reference.nativeSequence);
  if(!Number.isInteger(n)||n<1||n>ordered.length)
    return freeze({ok:false,reason:"NATIVE_SEQUENCE_INVALID",current:null,lanes:freeze([]),
      cards:freeze([]),total:0,observedTiming:false});
  const nativeMatch=matchNative(gate,nativeState);
  const at=n-1;
  const priest= nativeMatch && nativeState?.priestPosition &&
    !["UNCONFIRMED","IN_TRANSIT","PRIEST_TRACK_ASYNC","ROUTE_CONTROLLED"].includes(
      String(nativeState.priestPosition.station??"")) &&
    nativeState?.priestPosition?.locationConfidence!=="UNCONFIRMED"
    ?lane("PRIEST","SOURCE_REFERENCE",
      plain(nativeState.priestPosition.label||"Source station reference"),
      plain(nativeState.priestPosition.owner||"NATIVE_SOURCE"),at)
    :lane("PRIEST","PENDING","No verified current station",null,null);
  // Solemn minister events may be certified as data, but the visual handoff
  // lacks a reviewed form/actor/position pairing. Never invent positions.
  const ministers=lane("MINISTERS","REVIEW_HOLD","Choreography awaiting visual audit");
  const scholaSource=scholaState && typeof scholaState==="object" &&
    (scholaState.trackId||scholaState.composedWorkId||scholaState.schola);
  const schola=scholaSource
    ?lane("SCHOLA","INDEPENDENT","Independent Schola control",
      "NATIVE_SCHOLA_PROJECTOR",null)
    :lane("SCHOLA","INDEPENDENT","Separate from reader position",null,null);
  const organ=lane("ORGAN","REVIEW_HOLD","No verified organ event at this card");
  const bell=nativeMatch && nativeState?.bell && !nativeState?.bell?.suppressed
    ?lane("BELLS","SOURCE_CUE","Bell cue (not detected ringing)",
      plain(nativeState?.ownership?.bell??"NATIVE_BELL_SOURCE"),at)
    :lane("BELLS","PENDING","No current source bell cue");
  const posture=plain(nativeState?.posture?.value??nativeState?.posture?.label);
  const faithful=nativeMatch && ["STAND","SIT","KNEEL"].includes(posture.toUpperCase())
    ?lane("FAITHFUL","PROFILE_REFERENCE",posture.toUpperCase(),
      plain(nativeState?.ownership?.posture??"NATIVE_POSTURE_PROFILE"),at)
    :lane("FAITHFUL","PENDING","Posture not sourced at current cue");
  const cards=freeze(ordered.map((ref,i)=>freeze({
    referenceId:ref.referenceId,nativeCardId:ref.nativeCardId,
    sequence:i+1,title:plain(ref.nativeTitle),
    current:i===at,
    sourceOwner:plain(ref.evidence?.sourceMacroId||ref.evidence?.canonSegmentId),
    // No durations, chant observations or inferred actor actions.
  })));
  return freeze({ok:true,reason:null,total:ordered.length,position:n,
    current:cards[at],cards,lanes:freeze([priest,ministers,schola,organ,bell,faithful]),
    observedTiming:false,
    progressOwner:"NATIVE_CARD_ORDINAL_ONLY",
    scholaProgressIndependent:true,
    stage:"SOURCE_ONLY_NO_DURATION_ESTIMATE"});
}
export function projectLiveHandoffWheel(timeline){
  if(timeline?.ok!==true)return freeze({ok:false,reason:"TIMELINE_SOURCE_REQUIRED",
    segments:freeze([])});
  const total=timeline.cards.length;
  if(![65,66].includes(total)||timeline.position<1||timeline.position>total)
    return freeze({ok:false,reason:"NATIVE_65_REQUIRED",segments:freeze([])});
  return freeze({
    ok:true,total,current:timeline.current,
    segments:freeze(timeline.cards.map((card,i)=>freeze({
      nativeCardId:card.nativeCardId,referenceId:card.referenceId,
      title:card.title,startAngle:360*i/total,endAngle:360*(i+1)/total,
      position:i+1,current:card.current,visited:i<timeline.position-1
    }))),
    meaning:null,meaningStatus:"EDITORIAL_REVIEW_PENDING_NO_SYNTHETIC_MEANING",
    isDurationClock:false,scholaProgressIndependent:true
  });
}
export function liveHandoffLaneAt(timeline,id){
  return timeline?.ok?timeline.lanes.find(lane=>lane.id===id)??null:null;
}
