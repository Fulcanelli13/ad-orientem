// A single local/parish music plan for this browser. Editing it cannot
// certify a 1962 Proper, a GregoBase score, local practice, or sound heard.
export const SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY="ao-schola-local-programme-v1";
export const SCHOLA_OPTIONAL_EVENT_IDS=Object.freeze([
 "ENTRANCE_ORGAN_OPTION","OFFERTORY_LOCAL_MOTET","OFFERTORY_ORGAN_OPTION",
 "COMMUNION_LOCAL_MOTET","RECESSIONAL_ORGAN_OPTION"
]);
const OPTION_SET=new Set(SCHOLA_OPTIONAL_EVENT_IDS);
const freeze=Object.freeze;
const clean=value=>String(value??"").trim().replace(/[\u0000-\u001f\u007f]+/g," ").slice(0,80);
const object=v=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const safe=(s,k,v)=>{try{return v===undefined?s?.getItem?.(k)??null:s?.setItem?.(k,v);}catch{return null;}};
export function normalizeScholaLocalProgramme(value){
 const source=object(value),input=object(source.choices),choices={};
 for(const id of SCHOLA_OPTIONAL_EVENT_IDS){
  const item=object(input[id]);
  choices[id]=freeze({selected:item.selected===true,title:clean(item.title)});
 }
 return freeze({schema:"ao-schola-local-programme-v1",
  parishLabel:clean(source.parishLabel),choices:freeze(choices),
  editorialStatus:"PERSONAL_LOCAL_UNVERIFIED",observedSinging:false});
}
export function readScholaLocalProgramme(storage=null){
 let saved={};
 try{saved=JSON.parse(safe(storage,SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY)||"{}");}catch{}
 return normalizeScholaLocalProgramme(saved);
}
export function updateScholaLocalProgramme(previous,change,storage=null){
 const current=normalizeScholaLocalProgramme(previous),field=String(change?.kind??"");
 let next=null;
 if(field==="parishLabel"){
  if(typeof change.value!=="string")return current;
  next={...current,parishLabel:clean(change.value)};
 }else if(["eventSelected","eventTitle"].includes(field)){
  const id=String(change?.eventId??"");
  if(!OPTION_SET.has(id))return current;
  if(field==="eventSelected"&&typeof change.value!=="boolean")return current;
  if(field==="eventTitle"&&typeof change.value!=="string")return current;
  next={...current,choices:{...current.choices,[id]:{
    ...current.choices[id],...(field==="eventSelected"
      ?{selected:change.value}:{title:clean(change.value)})}}};
 }else return current;
 const result=normalizeScholaLocalProgramme(next);
 safe(storage,SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY,JSON.stringify(result));
 return result;
}
/** Annotate optional events without converting selections into observed music.
 * Disallowed solo organ plans remain visibly BLOCKED. No canonical texts or
 * independent Schola state are mutated. */
export function applyScholaLocalProgramme(itinerary,programme){
 if(!itinerary?.supported)return itinerary;
 const selected=normalizeScholaLocalProgramme(programme);
 return freeze({...itinerary,localProgrammeStatus:"PERSONAL_PLAN_NOT_PERFORMANCE",
  localParishLabel:selected.parishLabel,
  events:freeze(itinerary.events.map(event=>{
   const choice=selected.choices[event.id];
   if(!choice)return event;
   const blocked=event.kind==="ORGAN_OPTION" &&
     (event.organPermission?.status==="SOLO_FORBIDDEN"||
      event.organPermission?.status==="REQUIRES_EXACT_RITE_STAGE");
   return freeze({...event,localPlan:freeze({
    selected:choice.selected,title:choice.title||null,
    status:choice.selected?(blocked?"SELECTED_BUT_NOT_PERMITTED":
      "SELECTED_NOT_OBSERVED"):"NOT_SELECTED",
    authority:"PERSONAL_LOCAL_PROGRAMME",observed:false
   })});
  }))});
}
