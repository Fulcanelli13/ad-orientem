// Final user-approved Mass icon programme: 65-card curated LIVE only.
// A normative source cue is a reference, not proof that the priest moved.
// The 49 original station transitions remain with reader-cue-state.js.
//
// The physical celebrant's station, the place of the Missal, and the priest's
// transient liturgical actions are independent dimensions of one source event.
const FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const CUE=/^AO\.SM\.C(\d{4})$/;
const UNKNOWN=Object.freeze({
  label:"POSITION NOT CONFIRMED",
  station:"UNCONFIRMED",facing:null,routeId:null,
  owner:"PRIEST_POSITION_AWAITS_OBSERVATION",persistent:true,
});
const IN_TRANSIT=Object.freeze({
  label:"PRIEST MOVING",station:"IN_TRANSIT",facing:null,routeId:null,
  owner:"PRIEST_ROUTE_NOT_STATION",persistent:true,
});
function number(cueId){
  const m=String(cueId??"").match(CUE);
  return m?Number(m[1]):null;
}
function locationAt(n,observedEventId){
  if(n===null)return null;
  if(n<81)return "EPISTLE_SIDE";
  if(n<249)return "GOSPEL_SIDE";
  // The priest's independent Communion-antiphon event, MC-END-010, must be
  // observed. A Schola cue or a swipe through text cannot assert this transfer.
  if(n===249||n===250)return ["MC-END-010","MC-OBS-PC-TURN"].includes(observedEventId)?"EPISTLE_SIDE":null;
  // A proper Last Gospel may require a new Missal transfer. Do not assert
  // the ordinary book location without resolving that conditional branch.
  if(n>=267)return null;
  return "EPISTLE_SIDE";
}
const supplementPosition=Object.freeze({
 label:"AT EPISTLE-SIDE MISSAL",station:"ALTAR_EPISTLE_MISSAL",
 facing:"MISSAL",routeId:null,owner:"RITUS_XI_1_OBSERVED_MC_END_010",
 cueId:"AO.SM.C0249",persistent:true,
});
const waterPreparationPosition=Object.freeze({
 label:"AT EPISTLE-SIDE CHALICE PREPARATION",
 station:"ALTAR_EPISTLE_MISSAL",facing:"MISSAL",routeId:null,
 owner:"RITUS_VII_4_WATER_AND_CHALICE_PREPARATION",
 cueId:"AO.SM.C0112",persistent:true,
});
const returnToCentrePosition=Object.freeze({
 label:"AT CENTRE AFTER COMMUNION ANTIPHON",
 station:"ALTAR_CENTER",facing:"PEOPLE",routeId:null,
 owner:"MC_OBS_PC_TURN_INDEPENDENTLY_OBSERVED",
 cueId:"AO.SM.C0250",persistent:true,
});
const solemnGospelPosition=Object.freeze({
 label:"AT EPISTLE SIDE",station:"ALTAR_EPISTLE_SIDE",
 facing:"LITURGICAL_EAST",routeId:null,
 owner:"RITUS_VI_5_SOLEMN_DEACON_PROCLAIMS_GOSPEL",persistent:true,
});
export function projectCurated65PriestStation({
  cueId=null,sourcePosition=null,form=null,observedPriestEventId=null,
  enabled=false,sermonPause=false,
}={}){
  if(enabled!==true||!FORMS.has(String(form??"")))return null;
  const n=number(cueId);
  if(sermonPause===true){
    // Sermon location is intentionally unobserved. Do not surface an
    // internal diagnostic as user-facing priest-position copy.
    return Object.freeze({priestPosition:Object.freeze({...UNKNOWN,label:"—"}),
      missalLocation:"GOSPEL_SIDE",
      reason:"SERMON_PREACHER_AND_POSITION_REQUIRE_OBSERVATION"});
  }
  if(n===null)return null;
  const missalLocation=locationAt(n,observedPriestEventId);
  let position=sourcePosition;
  let reason="SOURCE_49_TRANSITIONS_PERSISTENT";
  if(n===112){
    // Water/chalice preparation is at the Epistle side regardless of
    // whether the water-blessing cross is omitted in a Requiem.
    position=waterPreparationPosition;
    reason="RITUS_VII_4_BOOK_AND_STATION_DISTINCT_FROM_WATER_CROSS";
  }else if(n===249){
    position=observedPriestEventId==="MC-END-010"?supplementPosition:UNKNOWN;
    reason=observedPriestEventId==="MC-END-010"
      ?"RITUS_XI_1_INDEPENDENTLY_OBSERVED":"COMMUNION_ANTIPHON_OBSERVATION_PENDING";
  }else if(n===250){
    position=observedPriestEventId==="MC-OBS-PC-TURN"?returnToCentrePosition:
      observedPriestEventId==="MC-END-010"?supplementPosition:UNKNOWN;
    reason=observedPriestEventId==="MC-OBS-PC-TURN"
      ?"PRIEST_RETURN_TO_CENTRE_INDEPENDENTLY_OBSERVED":
      observedPriestEventId==="MC-END-010"
      ?"PRIEST_ANTIPHON_AT_EPISTLE_OBSERVED":
      "PRIEST_RETURN_TO_CENTRE_OBSERVATION_PENDING";
  }else if(form==="SOLEMN"&&n>=75&&n<=78){
    // Subdeacon delivers Epistle; no automatic placement of the celebrant.
    position=UNKNOWN;reason="SOLEMN_EPISTLE_SUBDEACON_ACTOR_GUARD";
  }else if(form==="SOLEMN"&&n>=82&&n<=88){
    // Priest at Epistle side; deacon is the Gospel reader.
    position=solemnGospelPosition;reason="SOLEMN_GOSPEL_DEACON_ACTOR_GUARD";
  }else if(!sourcePosition||sourcePosition.station==="PRIEST_TRACK_ASYNC"){
    position=UNKNOWN;reason="INDEPENDENT_POSITION_OBSERVER_REQUIRED";
  }else if(sourcePosition.station==="ROUTE_CONTROLLED"){
    position=IN_TRANSIT;reason="MOVEMENT_ROUTE_NOT_FIXED_STATION";
  }
  const priestPosition=Object.freeze({...position,
    missalLocation,positionReferenceCueId:cueId,
    locationConfidence:position===UNKNOWN?"UNCONFIRMED":
      position===IN_TRANSIT?"IN_TRANSIT":"RUBRICAL_REFERENCE_NOT_GPS",
  });
  return Object.freeze({priestPosition,missalLocation,reason});
}
