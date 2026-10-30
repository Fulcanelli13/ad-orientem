// Session-local, direct-human-observation layer on the existing 36-event
// Ordinary Mass itinerary. A cue, card navigation, timer, source boundary,
// printed title or local music-plan selection NEVER proves heard music.
// No storage: an observation of one Mass must not leak to another Mass.
const freeze=Object.freeze;
const ELIGIBLE=new Set(["CHANT","LOCAL_OPTION","ORGAN_OPTION"]);
const ACTIONS=new Set(["START","FINISH","SKIP","RESET"]);
const DEFAULT="EXPECTED_NOT_OBSERVED";
const terminal=new Set(["FINISHED_OBSERVED","SKIPPED_BY_USER"]);
const statuses=freeze({
 START:"STARTED_OBSERVED",FINISH:"FINISHED_OBSERVED",
 SKIP:"SKIPPED_BY_USER",RESET:DEFAULT
});
export const SCHOLA_PERFORMANCE_ACTIONS=freeze([...ACTIONS]);
function reason(event){
 if(!event||!ELIGIBLE.has(event.kind))return "NOT_A_MUSIC_PERFORMANCE";
 if(event.id==="BENEDICTUS_CONTINUOUS")return "CONTINUOUS_WITH_SANCTUS";
 if(event.manualOnly && event.id!=="BENEDICTUS_AFTER_CHALICE")
  return "MANUAL_CEREMONY_GATE";
 if(event.musicWindow?.status==="SOURCE_ANCHORS_UNVERIFIED")
  return "SOURCE_ANCHORS_UNVERIFIED";
 if(["ORGAN_OPTION","LOCAL_OPTION"].includes(event.kind) &&
    event.localPlan?.selected!==true)return "OPTION_NOT_SELECTED";
 // A personal plan is not sufficient authority to assert legal organ use.
 if(event.kind==="ORGAN_OPTION" &&
    event.organPermission?.status!=="SOLO_POTENTIALLY_PERMITTED")
  return "ORGAN_PERMISSION_NOT_CONFIRMED";
 return null;
}
function sourceEvent(itinerary,id){
 if(!itinerary?.supported)return null;
 return (itinerary.events??[]).find(e=>e.id===id)??null;
}
export function createScholaPerformanceLedger(){
 const records=new Map();
 let sequence=0;
 function project(itinerary,{selectedEventId=null}={}){
  if(!itinerary?.supported)return freeze({
   supported:false,reason:itinerary?.reason??"ITINERARY_REQUIRED",
   events:freeze([]),counts:freeze({expected:0,started:0,finished:0,skipped:0}),
   source:"USER_SESSION_ONLY_NO_AUTO_DETECTION"
  });
  const counts={expected:0,started:0,finished:0,skipped:0};
  const events=freeze(itinerary.events.map(event=>{
   const blocked=reason(event);
   const record=records.get(event.id);
   const status=record?.status??DEFAULT;
   if(!blocked)counts[status==="STARTED_OBSERVED"?"started":
     status==="FINISHED_OBSERVED"?"finished":
     status==="SKIPPED_BY_USER"?"skipped":"expected"]++;
   return freeze({...event,
    performance:freeze({
     status,eligible:!blocked,hold:blocked,
     observed:status==="STARTED_OBSERVED"||status==="FINISHED_OBSERVED",
     selectedForDisplay:event.id===selectedEventId,
     origin:record?"EXPLICIT_USER_ACTION":"NOT_OBSERVED",
     sequence:record?.sequence??null
    })
   });
  }));
  return freeze({...itinerary,events,counts:freeze(counts),
   performanceSchema:"ao-schola-performance-session-v1",
   performanceAuthority:"USER_ACTION_ONLY_NOT_AUTOMATIC_DETECTION"});
 }
 function change(itinerary,{eventId,action,manualRelease=false}={}){
  const id=String(eventId??""),kind=String(action??"");
  if(!ACTIONS.has(kind))return freeze({ok:false,reason:"INVALID_ACTION"});
  const event=sourceEvent(itinerary,id);
  if(!event)return freeze({ok:false,reason:"NOT_IN_THIS_MASS"});
  const blocked=reason(event);
  if(blocked)return freeze({ok:false,reason:blocked});
  // Delayed polyphonic Benedictus is owned by the existing post-Chalice
  // manual-release button, which separately verifies the actual boundary.
  if(event.id==="BENEDICTUS_AFTER_CHALICE" &&
    (manualRelease!==true||kind!=="START"))
    return freeze({ok:false,reason:"BENEDICTUS_MANUAL_RELEASE_REQUIRED"});
  const previous=records.get(id)?.status??DEFAULT;
  if(kind==="START"&&previous!==DEFAULT||
     kind==="FINISH"&&previous!=="STARTED_OBSERVED"||
     kind==="SKIP"&&previous!==DEFAULT||
     kind==="RESET"&&previous===DEFAULT)
    return freeze({ok:false,reason:"INVALID_STATUS_TRANSITION"});
  sequence+=1;
  if(kind==="RESET")records.delete(id);
  else records.set(id,freeze({status:statuses[kind],sequence,
   source:"EXPLICIT_USER_ACTION"}));
  return freeze({ok:true,eventId:id,status:statuses[kind],sequence,
   source:"EXPLICIT_USER_ACTION",actuallyHeardAssumed:false});
 }
 return freeze({schema:"ao-schola-performance-session-v1",project,change});
}
