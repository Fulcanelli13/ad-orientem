// Optional observation channel for the two major Consecration elevations.
// The 1962-certified, *already published* R17 source register supplies the
// actions. Reader scrolling, a text cue, and Schola audio never activate them.
// The unresolved R62 editorial corpus is deliberately not imported.
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const SPECS=Object.freeze({
 "AO.SM.C0174":Object.freeze({
   section:"AO.CANON.06",subject:"HOST",
   ids:Object.freeze(["AO.RUB.C0174.01","AO.RUB.C0174.02",
     "AO.RUB.C0174.03","AO.RUB.C0174.04","AO.RUB.C0174.05"]),
 }),
 "AO.SM.C0181":Object.freeze({
   section:"AO.CANON.07",subject:"CHALICE",
   ids:Object.freeze(["AO.RUB.C0181.01","AO.RUB.C0181.02",
     "AO.RUB.C0181.03","AO.RUB.C0181.04","AO.RUB.C0181.05"]),
 }),
});
const FREEZE=Object.freeze;
const REQUIRED_LABELS=FREEZE({
 "AO.RUB.C0174.01":"GENUFLECTS",
 "AO.RUB.C0174.02":"ELEVATES HOST",
 "AO.RUB.C0174.03":"ELEVATION BELL · HOST",
 "AO.RUB.C0174.04":"REPLACES HOST",
 "AO.RUB.C0174.05":"GENUFLECTS",
 "AO.RUB.C0181.01":"GENUFLECTS",
 "AO.RUB.C0181.02":"ELEVATES CHALICE",
 "AO.RUB.C0181.03":"ELEVATION BELL · CHALICE",
 "AO.RUB.C0181.04":"REPLACES AND COVERS CHALICE",
 "AO.RUB.C0181.05":"GENUFLECTS",
});
function validatePublished(registry){
 if(registry?.schema!=="ao-reader-rubric-events-v1"||
    registry?.status!=="SOURCE_BACKED_OVERLAY"||
    registry?.authority!=="PRESENTATION_RUBRIC_DETAIL_ONLY"||
    !Array.isArray(registry.items)||
    !registry.sources?.some(s=>s.id==="MR62_RITUS"&&s.role==="NORMATIVE_PRIMARY"))
   throw Error("A certified R17 1962 rubric registry is required");
 const index=new Map();
 for(const row of registry.items){
   if(index.has(row.id))throw Error("Duplicate published rubric ID");
   index.set(row.id,row);
 }
 const events=new Map();
 for(const [cueId,spec] of Object.entries(SPECS)){
   for(let i=0;i<spec.ids.length;i++){
     const id=spec.ids[i],row=index.get(id),server=i===2;
     if(!row||row.cueId!==cueId||row.order!==i+1||
        row.actor!==(server?"SERVER":"PRIEST")||
        row.kind!==(server?"BELL":"ACTION")||
        row.label!==REQUIRED_LABELS[id]||
        row.authorityClass!==(server?"1962_NORMATIVE_WITH_LOCAL_PATTERN":"1962_NORMATIVE")||
        !row.sources?.includes("MR62_RITUS")||
        (!server && !String(row.iconKey??"").trim())||
        (server && row.presentationOwner!=="reader-transients"))
       throw Error("Published Canon stage authority differs: "+id);
     events.set(id,FREEZE({id,cueId,actor:row.actor,kind:row.kind,
       label:row.label,iconKey:row.iconKey??null,order:row.order}));
   }
 }
 return events;
}
// These short control labels are navigational/UI text, not rubrical copy.
// Canonical actions and publication authority remain the verified R17 IDs.
const CHOICE_LABELS=FREEZE({
 "AO.RUB.C0174.01":["First genuflection","Première génuflexion"],
 "AO.RUB.C0174.02":["Elevation of the Host","Élévation de l’Hostie"],
 "AO.RUB.C0174.03":["Server rings bell","Le servant sonne la clochette"],
 "AO.RUB.C0174.04":["Replace the Host","Repose l’Hostie"],
 "AO.RUB.C0174.05":["Second genuflection","Deuxième génuflexion"],
 "AO.RUB.C0181.01":["First genuflection","Première génuflexion"],
 "AO.RUB.C0181.02":["Elevation of the Chalice","Élévation du Calice"],
 "AO.RUB.C0181.03":["Server rings bell","Le servant sonne la clochette"],
 "AO.RUB.C0181.04":["Replace and cover the Chalice","Repose et couvre le Calice"],
 "AO.RUB.C0181.05":["Second genuflection","Deuxième génuflexion"],
});
const STAGE_OFF=FREEZE({
 status:"NO_INDEPENDENT_CANON_OBSERVATION",cueId:null,
 priestAction:null,bell:null,cinematic:null,observedNow:false,
 lastPriestEventId:null,lastServerEventId:null,
});

/**
 * The caller, not this controller, must check that the 65-family LIVE reader
 * is actually showing the matching Canon source cue.
 * An observation identifies actor + published event + independent witness.
 */
export function createLiveCanonStageObservationController({registry,form}={}){
 const events=validatePublished(registry);
 const selected=String(form??"").toUpperCase();
 if(!FORMS.has(selected))throw Error("Unsupported Mass form for Canon observations");
 let cueId=null;
 let lastPriestOrder=0;
 let lastPriest=null;
 let lastServer=null;
 let visible=false;
 function reset(){
   cueId=null;lastPriestOrder=0;lastPriest=null;lastServer=null;visible=false;
   return snapshot();
 }
 function snapshot(){
   const priest=visible?lastPriest:null;
   const server=visible?lastServer:null;
   const elevation=priest?.order===2;
   return FREEZE({
     status:visible?"INDEPENDENT_CANON_STAGE_OBSERVED":"NO_ACTIVE_CANON_STAGE",
     cueId,
     priestAction:priest?FREEZE({
       id:priest.id,cueId:priest.cueId,sourceCueId:priest.cueId,
       actor:"PRIEST",label:priest.label,iconKey:priest.iconKey,
       observedNow:true,transient:true,owner:"INDEPENDENT_CANON_PRIEST_OBSERVATION",
     }):null,
     bell:server?FREEZE({
       id:server.id,cueId:server.cueId,sourceCueId:server.cueId,
       actor:"SERVER",label:server.label,
       detail:server.cueId==="AO.SM.C0174"?"Sacred Host":"Precious Blood",
       observedNow:true,transient:true,presentationHoldMs:1800,
       owner:"INDEPENDENT_CANON_SERVER_OBSERVATION",
       localPatternNotInferred:true,
     }):null,
     cinematic:elevation?FREEZE({
       id:"OBSERVED:"+priest.id,kind:"ELEVATION",
       title:"ELEVATION",subtitle:priest.cueId==="AO.SM.C0174"?"SACRED HOST":"PRECIOUS BLOOD",
       cueId:priest.cueId,sourceRubricEventId:priest.id,
       canonicalAuthority:false,transient:true,durationMs:1800,
       observedNow:true,owner:"INDEPENDENT_CANON_PRIEST_OBSERVATION",
     }):null,
     observedNow:visible,lastPriestEventId:lastPriest?.id??null,
     lastServerEventId:lastServer?.id??null,
   });
 }
 function observe({eventId,actor,sourceCueId,observed=false,source}={}){
   const rejected=reason=>FREEZE({accepted:false,reason,state:snapshot()});
   if(observed!==true||source!=="EXPLICIT_OBSERVATION")
     return rejected("INDEPENDENT_OBSERVATION_REQUIRED");
   const nextCue=String(sourceCueId??"");
   if(!Object.hasOwn(SPECS,nextCue))return rejected("NOT_A_MAJOR_CANON_ELEVATION");
   const event=events.get(String(eventId??""));
   if(!event||event.cueId!==nextCue||event.actor!==actor)
     return rejected("UNCERTIFIED_EVENT_OR_ACTOR");
   // The old combined replaces-and-covers action cannot be attributed to
   // the priest at Solemn Mass, where covering may belong to the deacon.
   if(selected==="SOLEMN"&&event.id==="AO.RUB.C0181.04")
     return rejected("SOLEMN_MIXED_ROLE_CHALICE_COVERING_UNRESOLVED");
   if(cueId!==null&&cueId!==nextCue)
     return rejected("CEREMONY_CHANGED_RESET_REQUIRED");
   if(event.actor==="PRIEST"&&event.order<=lastPriestOrder)
     return rejected("PRIEST_STAGES_NOT_CHRONOLOGICAL");
   if(event.actor==="SERVER"&&lastPriestOrder>=4)
     return rejected("BELL_OUTSIDE_ELEVATION_WINDOW");
   cueId=nextCue;
   visible=true;
   if(event.actor==="PRIEST"){
     lastPriestOrder=event.order;
     lastPriest=event;
     // A server bell is independently witnessed, and cannot persist
     // through a later priest phase as though the bell were still ringing.
     if(event.order!==2)lastServer=null;
   }else{
     // One witnessed bell does not imply that elevation or genuflection
     // has been seen, and never advances the priest's own action index.
     lastServer=event;
   }
   return FREEZE({accepted:true,reason:null,eventId:event.id,state:snapshot()});
 }
 /**
  * The action sheet offers independent observations. It never provides
  * automatic timing: even its disabled/completed state derives only from
  * events the user or an independent observer explicitly recorded.
  */
 function getChoices({sourceCueId,language="en"}={}){
   const id=String(sourceCueId??"");
   const spec=SPECS[id];
   if(!spec)return FREEZE([]);
   const french=String(language).toLowerCase().startsWith("fr");
   return FREEZE(spec.ids.flatMap(eventId=>{
     const event=events.get(eventId);
     const mixed=selected==="SOLEMN"&&eventId==="AO.RUB.C0181.04";
     // Do not offer an inaccurately assigned priest/deacon composite.
     if(mixed)return [];
     const completed=event.actor==="PRIEST"&&event.order<=lastPriestOrder&&
       cueId===id;
     const bellLate=event.actor==="SERVER"&&
       cueId===id&&lastPriestOrder>=4;
     return [FREEZE({
       eventId:event.id,actor:event.actor,sourceCueId:id,
       label:CHOICE_LABELS[eventId][french?1:0],
       disabled:completed||bellLate,
       completed,kind:event.kind,
     })];
   }));
 }
 function settleTransient(){
   visible=false;
   return snapshot();
 }
 return FREEZE({
   form:selected,observe,reset,snapshot,settleTransient,getChoices,
   expectedCueIds:FREEZE(Object.keys(SPECS)),
   stageIds:FREEZE(Object.values(SPECS).flatMap(spec=>spec.ids)),
 });
}
