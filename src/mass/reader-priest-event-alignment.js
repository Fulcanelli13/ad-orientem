import { ORDINARY_SUNG_SOURCE_ONLY_CUES } from "./reader-source-only-cues.js";

// Canonical MC-event identity, NOT card number or audible Schola phrase, is
// the only accepted synchronization boundary for source-only priest states.
// The event bridge is inert until an independent ceremonial observer reports
// the exact MC-* event. In particular, a swipe cannot trigger the priest.
const ROWS=Object.freeze([
  ["AO.SM.C0042",null,null,null,null,"PARALLEL_INTOIT_POSITION_UNRESOLVED"],
  ["AO.SM.C0043","MC-INT-020","INTROIT","PRIEST","proper.introit","INDEPENDENT_INTROIT_PRIEST_RECITATION"],
  ["AO.SM.C0075","MC-EPI-020","EPISTLE","RESOLVED_READER","proper.epistle","CELEBRANT_EPISTLE_OBSERVED"],
  ["AO.SM.C0077",null,null,null,null,"ASYNCHRONOUS_GRADUAL_UNRESOLVED"],
  ["AO.SM.C0086","MC-GSP-060","GOSPEL","PRIEST","proper.gospel","MISSA_CANTATA_ONLY"],
  ["AO.SM.C0109",null,null,null,null,"ASYNCHRONOUS_OFFERTORY_UNRESOLVED"],
  ["AO.SM.C0134","MC-SEC-010","SECRET","PRIEST","proper.secrets[]","PRIEST_EVENT_EXACT"],
  ["AO.SM.C0144","MC-PREF-040","PREFACE","PRIEST","proper.preface","PRIEST_EVENT_EXACT"],
  ["AO.SM.C0249","MC-END-010","CONCLUSION","PRIEST","proper.communion","PRIEST_COMMUNION_ANTIPHON_AFTER_ABLUTIONS"],
  ["AO.SM.C0250",null,null,null,null,"PRIEST_TURN_EVENT_UNRESOLVED"],
  ["AO.SM.C0256",null,null,null,null,"POSTCOMMUNION_TURN_UNRESOLVED"],
  ["AO.SM.C0276","MC-GLR-040","GLORIA","PRIEST","ordinary.gloria","SEDILIA_DURING_CHANT"],
  ["AO.SM.C0277","MC-GLR-060","GLORIA","PRIEST",null,"SEDILIA_RETURN"],
  ["AO.SM.C0278","MC-CRD-040","CREDO","PRIEST","ordinary.credo","SEDILIA_DURING_CHANT"],
  ["AO.SM.C0279","MC-CRD-070","CREDO","PRIEST",null,"SEDILIA_RETURN"],
]);
export const ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT=Object.freeze(ROWS.map(
  ([cueId,eventId,phase,actor,contentRef,gate])=>Object.freeze({
    cueId,eventId,phase,actor,contentRef,gate,
    activation:eventId?"EXPLICIT_INDEPENDENT_EVENT":"UNRESOLVED_NO_EVENT_TRIGGER",
  })
));
const FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const MISSA_CANTATA=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]);
const rowByEvent=new Map(ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT.filter(x=>x.eventId)
  .map(x=>[x.eventId,x]));

/** Invariant: all 15 sources accounted for, no duplicate/event alias, and
 * exact source graph metadata (phase, actor, content, priest voice) matches. */
export function auditOrdinarySungPriestEventAlignment(events){
  if(!Array.isArray(events))throw new TypeError("Certified canonical MC events required");
  const expected=new Set(ORDINARY_SUNG_SOURCE_ONLY_CUES.map(x=>x.cueId));
  const rows=ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT;
  if(rows.length!==15 || new Set(rows.map(x=>x.cueId)).size!==15 ||
     rows.some(x=>!expected.has(x.cueId)) ||
     expected.size!==15)throw Error("Source-only priest event mapping no longer covers exactly 15 cues");
  const index=new Map(events.map(e=>[e.id,e]));
  if(index.size!==events.length)throw Error("Duplicate canonical MC event");
  if(rowByEvent.size!==10)throw Error("Expected ten event-identifiable ceremonial boundaries");
  for(const row of rows.filter(x=>x.eventId)){
    const e=index.get(row.eventId);
    if(!e||e.phase!==row.phase||e.actor!==row.actor||
      (e.contentRef??null)!==row.contentRef)
      throw Error(row.cueId+": mismatched canonical ceremonial event "+row.eventId);
    if(["MC-GLR-060","MC-CRD-070"].includes(e.id)){
      if(e.voice?.speechAudibility!=="NONE")
        throw Error(e.id+": altar return is not a spoken priest phrase");
    }else if(e.voice?.speechAudibility==="NONE")
      throw Error(e.id+": expected an independently reported priest prayer/event");
  }
  return Object.freeze({schema:"ao-ordinary-sung-priest-event-alignment-v1",
    sourceOnlyCues:15,eventMatched:10,pending:5,
    matchedEvents:Object.freeze(rows.filter(x=>x.eventId).map(x=>x.eventId)),
    pendingCueIds:Object.freeze(rows.filter(x=>!x.eventId).map(x=>x.cueId)),
  });
}

function hasConditions(row,conditions){
  const conditionsSet=new Set(conditions??[]);
  if(row.gate==="SEDILIA_DURING_CHANT")
    return conditionsSet.has("SEDILIA_USED") &&
      conditionsSet.has("SEDILIA_USED_AND_CHANT_CONTINUES");
  if(row.gate==="SEDILIA_RETURN")return conditionsSet.has("SEDILIA_USED");
  return true;
}
/**
 * A separate priest-side input may report the actual certified MC event.
 * Neither scrolling, Schola changes nor inferred text ownership may call it.
 * The result contains ONLY priest-related lanes, never personal faithful
 * instructions, bell, cinematic, or unverified special-day overlays.
 */
export function projectObservedOrdinaryPriestEvent({
  observedEventId=null,independentlyObserved=false,
  form=null,conditions=[],sourceSectionId=null,
  eventIndex=null,cueController=null,
  observedActor=null,observedDelivery=null,
}={}){
  if(independentlyObserved!==true)return null;
  if(!FORMS.has(String(form??"")))return null;
  const row=rowByEvent.get(String(observedEventId??""));
  if(!row)return null;
  if(row.gate==="MISSA_CANTATA_ONLY" && !MISSA_CANTATA.has(form))return null;
  if(row.gate==="CELEBRANT_EPISTLE_OBSERVED"){
    // 1962 n. 514: at Missa Cantata an instituted lector may sing the
    // Epistle; when there is no lector the priest may read OR sing it.
    // The MC graph labels this actor RESOLVED_READER: it cannot resolve the
    // human minister without explicit independent identity/delivery data.
    if(!MISSA_CANTATA.has(form) || observedActor!=="PRIEST" ||
       !["READ","SUNG"].includes(observedDelivery))return null;
  }
  if(!hasConditions(row,conditions))return null;
  const block=ORDINARY_SUNG_SOURCE_ONLY_CUES.find(x=>x.cueId===row.cueId);
  const sourceSection=block?.blockId==="AO.SM.B016"?"AO.CARD.003"
    :block?.blockId==="AO.SM.B027"?"AO.CARD.009"
    :block?.blockId==="AO.SM.B026"?"AO.CARD.007"
    :block?.blockId==="AO.SM.B014"?"AO.CARD.001"
    :block?.blockId==="AO.SM.B020"?"AO.CARD.005"
    :block?.blockId==="AO.SM.B085"?"AO.CARD.026"
    :block?.blockId==="AO.SM.B040"?"AO.CARD.011"
    :block?.blockId==="AO.SM.B045"?"AO.CARD.012":null;
  if(!sourceSection || sourceSection!==sourceSectionId)return null;
  const event=eventIndex?.get?.(row.eventId);
  if(!event || event.actor!==row.actor || event.phase!==row.phase ||
     (event.contentRef??null)!==row.contentRef)return null;
  const cue=cueController?.project?.(row.cueId,{conditions})??null;
  if(!cue?.supported || cue.reason || cue.cueId!==row.cueId)return null;
  // Never transfer an unrelated state from a previously focused cue. Only
  // event-owned, explicit priest lanes can be surfaced at this event.
  return Object.freeze({
    cueId:row.cueId,eventId:row.eventId,gate:row.gate,
    owner:"EXPLICIT_SOURCE_PRIEST_EVENT",
    // The positional literal PRIEST_TRACK_ASYNC is a scheduling marker,
    // not a physical altar station. Never display it as a priest icon.
    priestPosition:row.gate==="CELEBRANT_EPISTLE_OBSERVED" ||
      cue.priestPosition?.station==="PRIEST_TRACK_ASYNC"
      ? null : cue.priestPosition??null,
    priestVoice:row.gate==="CELEBRANT_EPISTLE_OBSERVED"
      ? Object.freeze({label:observedDelivery==="READ"?"READS EPISTLE":"SINGS EPISTLE",
        value:observedDelivery==="READ"?"READ / NOT SUNG":"SUNG / CLEAR",
        owner:"1962_RUBRIC_514_OBSERVED_PRIEST_DELIVERY"})
      : cue.priestVoice??null,
    priestAction:cue.priestAction??null,
    priestPosture:null,faithfulPosture:null,faithfulGesture:null,
    bell:null,cinematic:null,
  });
}
