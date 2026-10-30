import {canonicalKyrialeSelection,resolveKyrialeChoice} from "./reader-kyriale-catalogue.js";
// Personal parish programmes extend the existing Schola plan without
// changing the 1962 Proper, Gregorian source texts, event or priest clocks.
export const SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY="ao-schola-local-programme-v1";
export const SCHOLA_PROFILE_STORAGE_KEY="ao-schola-profile-library-v2";
export const SCHOLA_OPTIONAL_EVENT_IDS=Object.freeze([
 "ENTRANCE_ORGAN_OPTION","OFFERTORY_LOCAL_MOTET","OFFERTORY_ORGAN_OPTION",
 "COMMUNION_LOCAL_MOTET","RECESSIONAL_ORGAN_OPTION"
]);
export const SCHOLA_ORDINARY_SETTING_IDS=Object.freeze([
 "KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"
]);
const OPTION_SET=new Set(SCHOLA_OPTIONAL_EVENT_IDS);
const ORDINARY_SET=new Set(SCHOLA_ORDINARY_SETTING_IDS);
const PERFORMANCES=new Set(["UNSPECIFIED","GREGORIAN","POLYPHONIC"]);
const freeze=Object.freeze,MAX_PROFILES=10,DEFAULT_ID="p1";
const clean=value=>String(value??"").trim().replace(/[\u0000-\u001f\u007f]+/g," ").slice(0,80);
const object=v=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const safe=(s,k,v)=>{try{return v===undefined?s?.getItem?.(k)??null:s?.setItem?.(k,v);}catch{return null;}};
const validId=id=>/^p[1-9]\d{0,3}$/.test(String(id??""));
function choicesOf(input){
 const result={},source=object(input);
 for(const id of SCHOLA_OPTIONAL_EVENT_IDS){
  const item=object(source[id]);
  result[id]=freeze({selected:item.selected===true,title:clean(item.title)});
 }
 return freeze(result);
}
function ordinaryOf(input){
 const result={},source=object(input);
 for(const id of SCHOLA_ORDINARY_SETTING_IDS)result[id]=clean(source[id]);
 return freeze(result);
}
function verifiedSelectionsOf(value){
 const source=object(value),result={};
 for(const id of SCHOLA_ORDINARY_SETTING_IDS)
  result[id]=canonicalKyrialeSelection(source[id],id);
 return freeze(result);
}
function performanceOf(value){
 return PERFORMANCES.has(value)?value:"UNSPECIFIED";
}
function profileOf(value,id){
 const v=object(value);
 return freeze({id,name:clean(v.name)||"Local programme",
  parishLabel:clean(v.parishLabel),choices:choicesOf(v.choices),
  ordinarySettings:ordinaryOf(v.ordinarySettings),
  ordinarySelections:verifiedSelectionsOf(v.ordinarySelections),
  sanctusPerformance:performanceOf(v.sanctusPerformance)});
}
function wrap(profiles,activeProfileId){
 const list=freeze(profiles);
 const active=list.find(p=>p.id===activeProfileId)??list[0];
 return freeze({schema:"ao-schola-local-programme-v2",
  profiles:list,activeProfileId:active.id,
  // Backwards-compatible projection: the existing UI/event controller
  // reads the currently selected profile's v1 fields.
  parishLabel:active.parishLabel,choices:active.choices,
  ordinarySettings:active.ordinarySettings,
  ordinarySelections:active.ordinarySelections,
  sanctusPerformance:active.sanctusPerformance,
  editorialStatus:"PERSONAL_LOCAL_UNVERIFIED",observedSinging:false});
}
export function normalizeScholaLocalProgramme(value){
 const source=object(value);
 const unique=new Set(),profiles=[];
 if(Array.isArray(source.profiles)){
  for(const raw of source.profiles){
   if(profiles.length>=MAX_PROFILES)break;
   const id=object(raw).id;
   if(!validId(id)||unique.has(id))continue;
   unique.add(id);profiles.push(profileOf(raw,id));
  }
 }
 if(!profiles.length){
  profiles.push(profileOf({...source,name:source.name||source.parishLabel||"Local programme"},DEFAULT_ID));
 }
 return wrap(profiles,source.activeProfileId);
}
export function readScholaLocalProgramme(storage=null,fallbackSanctus="UNSPECIFIED"){
 const v2=safe(storage,SCHOLA_PROFILE_STORAGE_KEY);
 if(v2){try{
  const parsed=JSON.parse(v2);
  if(Array.isArray(parsed?.profiles)&&parsed.profiles.length)return normalizeScholaLocalProgramme(parsed);
 }catch{}}
 // Legacy v1 remains readable and is not erased; first edit writes both keys.
 let legacy={};
 try{legacy=JSON.parse(safe(storage,SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY)||"{}");}catch{}
 return normalizeScholaLocalProgramme({...object(legacy),
  sanctusPerformance:performanceOf(fallbackSanctus)});
}
function updatedProfile(current,change){
 const kind=String(change?.kind??""),id=String(change?.eventId??"");
 const active=current.profiles.find(p=>p.id===current.activeProfileId);
 if(kind==="parishLabel" && typeof change.value==="string")
  return {...active,parishLabel:clean(change.value)};
 if(kind==="profileRename" && typeof change.value==="string" && clean(change.value))
  return {...active,name:clean(change.value)};
 if(kind==="ordinarySetting"&&ORDINARY_SET.has(id)&&typeof change.value==="string")
  return {...active,ordinarySettings:{...active.ordinarySettings,[id]:clean(change.value)},
   // Explicit custom typing demotes catalogue provenance; never preserve a
   // verified ID after the user changes the printed setting's title.
   ordinarySelections:{...active.ordinarySelections,[id]:""}};
 if(kind==="ordinarySelection"&&ORDINARY_SET.has(id)&&typeof change.value==="string"){
  if(change.value==="CUSTOM")
   return {...active,ordinarySelections:{...active.ordinarySelections,[id]:""}};
  if(change.value===""){
   return {...active,ordinarySelections:{...active.ordinarySelections,[id]:""},
    ordinarySettings:{...active.ordinarySettings,[id]:""}};
  }
  const found=resolveKyrialeChoice(id,change.value);
  if(!found)return null;
  return {...active,ordinarySelections:{...active.ordinarySelections,[id]:found.id},
   ordinarySettings:{...active.ordinarySettings,[id]:found.title}};
 }
 if(kind==="sanctusPerformance"&&PERFORMANCES.has(change.value))
  return {...active,sanctusPerformance:change.value};
 if(["eventSelected","eventTitle"].includes(kind)&&OPTION_SET.has(id)){
  if(kind==="eventSelected"&&typeof change.value!=="boolean")return null;
  if(kind==="eventTitle"&&typeof change.value!=="string")return null;
  return {...active,choices:{...active.choices,[id]:{
   ...active.choices[id],...(kind==="eventSelected"
    ?{selected:change.value}:{title:clean(change.value)})}}};
 }
 return null;
}
export function updateScholaLocalProgramme(previous,change,storage=null){
 const current=normalizeScholaLocalProgramme(previous),kind=String(change?.kind??"");
 let next=null;
 if(kind==="profileSelect"){
  const id=String(change?.value??"");
  if(!current.profiles.some(p=>p.id===id)||id===current.activeProfileId)return current;
  next=wrap(current.profiles,id);
 }else if(kind==="profileCreate"){
  if(current.profiles.length>=MAX_PROFILES||typeof change?.value!=="string"||!clean(change.value))
   return current;
  const used=new Set(current.profiles.map(p=>p.id));
  let n=2;while(used.has("p"+n)&&n<10000)n++;
  if(n>=10000)return current;
  // New profile starts empty: never inherit a parish's musical choices.
  const created=profileOf({name:change.value}, "p"+n);
  next=wrap([...current.profiles,created],created.id);
 }else if(kind==="profileDelete"){
  if(current.profiles.length===1)return current;
  const retained=current.profiles.filter(p=>p.id!==current.activeProfileId);
  next=wrap(retained,retained[0].id);
 }else{
  const edited=updatedProfile(current,change);
  if(!edited)return current;
  next=wrap(current.profiles.map(p=>p.id===current.activeProfileId
   ?profileOf(edited,p.id):p),current.activeProfileId);
 }
 safe(storage,SCHOLA_PROFILE_STORAGE_KEY,JSON.stringify({
  schema:next.schema,profiles:next.profiles,activeProfileId:next.activeProfileId
 }));
 // Mirror the currently selected v1 programme for rollback compatibility.
 safe(storage,SCHOLA_LOCAL_PROGRAMME_STORAGE_KEY,JSON.stringify({
  schema:"ao-schola-local-programme-v1",
  parishLabel:next.parishLabel,choices:next.choices,
  editorialStatus:"PERSONAL_LOCAL_UNVERIFIED",observedSinging:false
 }));
 return next;
}
/** Local choices are labels, not approvals, audible observations, or
 * instructions to modify the certified 1962 Mass or Latin sung text. */
export function applyScholaLocalProgramme(itinerary,programme){
 if(!itinerary?.supported)return itinerary;
 const selected=normalizeScholaLocalProgramme(programme);
 return freeze({...itinerary,localProgrammeStatus:"PERSONAL_PLAN_NOT_PERFORMANCE",
  localParishLabel:selected.parishLabel,localProfileId:selected.activeProfileId,
  localOrdinarySettings:selected.ordinarySettings,
  localOrdinarySelections:selected.ordinarySelections,
  events:freeze(itinerary.events.map(event=>{
   const ordinarySetting=selected.ordinarySettings[event.trackId]||
    selected.ordinarySettings[event.id]||null;
   const choice=selected.choices[event.id];
   if(!choice){
    const movement=event.trackId==="SANCTUS_BENEDICTUS"?"SANCTUS_BENEDICTUS":
      event.trackId||event.id;
    const source=resolveKyrialeChoice(movement,selected.ordinarySelections[movement]);
    return ordinarySetting?freeze({...event,localOrdinary:freeze({
     title:ordinarySetting,
     status:source?"SOURCE_EDITION_INDEXED_NOT_OBSERVED":"PERSONAL_UNVERIFIED_SETTING",
     catalogueId:source?.id??null,
     sourceUrl:source?.sourceUrl??null,
     observed:false
    })}):event;
   }
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
