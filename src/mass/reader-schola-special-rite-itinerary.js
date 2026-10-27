// Shared, read-only special-rite music itinerary: no new chant text,
// no synthetic Gregorian score, and no change to native rite navigation.
// Stage order is furnished by each *native controller*, not guessed from
// the editorial order of the music registry.
import {resolveRiteMusicScene} from "./reader-rite-music-authority.js";

const freeze=Object.freeze;
const SILENT_STAGES=new Set(["GF-PASS-320","GF-END-910"]);
const NAMES=freeze({
 "ASP.ME":"Asperges me","ASP.VIDI":"Vidi aquam",
 "PALM.HOSANNA":"Hosanna filio David","PALM.PUERI":"Pueri Hebraeorum",
 "PALM.GLORIA_LAUS":"Gloria laus","PALM.INGREDIENTE":"Ingrediente Domino",
 "REQ.LIBERA":"Libera me","REQ.IN_PARADISUM":"In paradisum",
 "CORPUS.PANGE":"Pange lingua","CORPUS.TANTUM":"Tantum ergo",
 "HT.PANGE":"Pange lingua","HT.TANTUM":"Tantum ergo",
});
const stageKey=(x)=>String(x?.recordId??x?.id??"");
export function nativeRiteStageOrder(controller){
 const cards=controller?.cards??controller?.built?.steps??controller?.built?.cards;
 if(!Array.isArray(cards)||!cards.length)return freeze([]);
 const ids=cards.map(stageKey);
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return freeze([]);
 return freeze(ids);
}
function displayTitle(event){
 const key=String(event.id??"").replace(/^AO\.MUS\./,"");
 if(NAMES[key])return NAMES[key];
 const token=key.split(".").slice(1).join(" ");
 if(!token)return "Rite music event";
 const label=token.replaceAll("_"," ").toLowerCase().replace(/\b[a-z]/g,x=>x.toUpperCase());
 return label;
}
function empty(reason,riteId=null,stageId=null){
 return freeze({schema:"ao-special-rite-schola-itinerary-v1",supported:false,reason,
  riteId,stageId,current:freeze([]),upcoming:null,events:freeze([]),
  actuallySinging:"UNKNOWN",independentFromMassSchola:true});
}
/** Accept only a complete ordered native stage registry, a recognized rite
 * and a pinned source payload. A candidate is expected, NEVER heard or timed.
 * The 1962 Mass Ordinary controller is not touched. */
export function projectSpecialRiteMusicItinerary({
 registry,riteId,stageId,sourcePayload,condition=null,stageOrder,
}={}){
 if(registry?.schema!=="ao-mass-special-rite-music-events-v1"||
    registry?.policy?.noSyntheticChant!==true)return empty("REGISTRY_NOT_CERTIFIED");
 const rite=(registry.rites??[]).find(x=>x.id===riteId);
 if(!rite)return empty("RITE_NOT_INDEXED",riteId,stageId);
 if(!sourcePayload||!Array.isArray(stageOrder)||!stageOrder.length||
   stageOrder.some(x=>typeof x!=="string"||!x)||
   new Set(stageOrder).size!==stageOrder.length)
  return empty("NATIVE_STAGE_ORDER_OR_PAYLOAD_REQUIRED",riteId,stageId);
 const stageIndex=stageOrder.indexOf(String(stageId??""));
 if(stageIndex<0)return empty("CURRENT_RITE_STAGE_UNRESOLVED",riteId,stageId);
 const catalogueStages=new Set((rite.events??[]).map(x=>x.stageId));
 if([...catalogueStages].some(id=>!stageOrder.includes(id)))
   return empty("REGISTRY_STAGE_NOT_IN_NATIVE_RITE",riteId,stageId);
 const events=[];
 for(let i=0;i<stageOrder.length;i++){
  const id=stageOrder[i];
  if(!catalogueStages.has(id))continue;
  const scene=resolveRiteMusicScene({
    registry,riteId,stageId:id,sourcePayload,condition,
  });
  // A missing branch condition is not evidence of the other branch.
  if(scene.status!=="EXPECTED_NOT_OBSERVED")continue;
  for(const e of scene.events){
   if(e.status!=="EXPECTED_NOT_OBSERVED"||e.kind==="SOURCE_HOLD")continue;
   events.push(freeze({
    id:e.id,kind:e.kind,label:displayTitle(e),performers:e.performers,
    category:/SCHOLA/.test(e.performers)?"SCHOLA":
      e.kind==="PRIEST_DIALOGUE_WITH_RESPONSES"?"RESPONSES":"LITURGICAL_CHANT",
    stageId:id,stageIndex:i,
    sourceOwner:"EXISTING_NATIVE_RITE",sourceFile:e.sourceFile,
    sourcePaths:freeze(e.sourceFound.map(x=>x.path)),
    endBoundary:e.endBoundary,segmentScope:e.segmentScope??null,
    status:"EXPECTED_NOT_OBSERVED",actuallySinging:"UNKNOWN",
    independentFromMassSchola:true,
   }));
  }
 }
 const silent=SILENT_STAGES.has(stageId);
 const current=freeze(silent?[]:events.filter(e=>e.stageIndex===stageIndex));
 const next=silent?null:events.find(e=>e.stageIndex>stageIndex)??null;
 return freeze({
  schema:"ao-special-rite-schola-itinerary-v1",supported:true,
  riteId,stageId,lifecycle:rite.lifecycle,
  current,upcoming:next?freeze({
   id:next.id,label:next.label,stageId:next.stageId,
   status:"UPCOMING_IN_RITE_ORDER_NOT_HEARD",
   sourceOwner:"EXISTING_NATIVE_RITE",actuallySinging:"UNKNOWN",
  }):null,
  events:freeze(events),stageOrder:freeze([...stageOrder]),
  silentStage:silent,actuallySinging:"UNKNOWN",
  independentFromMassSchola:true,organ:"EXISTING_RITE_PERMISSION_NOT_OBSERVED",
 });
}
export function projectNativeRiteMusicItinerary({
 registry,riteId,controller,sourcePayload,condition=null
}={}){
 const current=controller?.project?.();
 const stageId=current?.step?.recordId??current?.card?.id??current?.card?.recordId;
 return projectSpecialRiteMusicItinerary({
  registry,riteId,stageId,sourcePayload,condition,
  stageOrder:nativeRiteStageOrder(controller),
 });
}
