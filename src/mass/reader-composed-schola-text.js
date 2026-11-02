// An optional literal-text performance map on TOP of R17's certified Schola.
// It never changes the priest clock, Gregorian source tracks, prescribed
// sequence, or claims that a choir was actually heard. All lyrics are looked
// up from stable shared text IDs (not copied per composer).
import {SACRED_MUSIC_TEXT_PLANS} from "./sacred-music-sung-texts.js";
import {sharedRequiemTextUnit} from "./shared-requiem-text-units.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

export const COMPOSER_SCHOLA_SETTING_IDS=Object.freeze(["","faure-requiem-op48"]);
const AVAILABLE=new Set(COMPOSER_SCHOLA_SETTING_IDS);
const ROUTES=Object.freeze({
 INTROIT:Object.freeze({movement:0,from:0,to:6}),
 KYRIE:Object.freeze({movement:0,from:6,to:9}),
 OFFERTORY:Object.freeze({movement:1,from:0,to:14}),
 SANCTUS_BENEDICTUS:Object.freeze({movement:2,from:0,to:4}),
 AGNUS_DEI:Object.freeze({movement:4,from:0,to:4}),
 COMMUNION:Object.freeze({movement:4,from:4,to:8})
});
// These belong to a musical work, not to a native Mass chant window.
 // Selecting one is an EXPLICIT manual display action. No source cue starts it.
export const COMPOSED_MANUAL_MOVEMENTS=Object.freeze([
 Object.freeze({id:"",label:"Follow Mass Schola (default)",movement:null}),
 Object.freeze({id:"PIE_JESU",label:"Pie Jesu · manual only",movement:3}),
 Object.freeze({id:"LIBERA_ME",label:"Libera me · optional Absolution / music programme",movement:5}),
 Object.freeze({id:"IN_PARADISUM",label:"In paradisum · optional funeral procession / music programme",movement:6}),
]);
const EXTRA_BY_ID=new Map(COMPOSED_MANUAL_MOVEMENTS.filter(x=>x.id).map(x=>[x.id,x]));
export function composedScholaRoute(trackId){return ROUTES[trackId]??null;}
export function eligibleComposedScholaWork({workId,prepared,native}={}){
 const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
 return AVAILABLE.has(workId)&&Boolean(workId)&&
   ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form)&&
   isExplicitRequiemMass(prepared)&&native?.supported===true;
}
export function createComposedScholaTextController({prepared,language="en"}={}){
 let trackId=null,workId="",index=0,complete=false,manualMovementId="";
 const state=()=>Object.freeze({workId,trackId,index,complete,manualMovementId});
 function clearPosition(){trackId=null;workId="";index=0;complete=false;}
 function reset(){clearPosition();manualMovementId="";return state();}
 function setManualMovement(id,native,selectedWorkId){
  if(!eligibleComposedScholaWork({workId:selectedWorkId,prepared,native}))return false;
  const requested=String(id??"");
  if(requested && !EXTRA_BY_ID.has(requested))return false;
  if(manualMovementId!==requested){
   manualMovementId=requested;clearPosition();
  }
  return true;
 }
 function routeFor(native,selectedWorkId){
  if(!eligibleComposedScholaWork({workId:selectedWorkId,prepared,native}))return null;
  if(manualMovementId){
   const extra=EXTRA_BY_ID.get(manualMovementId);
   const movement=SACRED_MUSIC_TEXT_PLANS[selectedWorkId]?.[extra?.movement];
   return movement?.textIds?.length
     ?{track:"COMPOSER_MANUAL_"+manualMovementId,ids:movement.textIds,
       movementId:movement.movementId,manual:true}:null;
  }
  const track=native?.trackId??native?.schola?.trackId;
  if(!native?.schola || !ROUTES[track] || native.schola.complete===true)return null;
  const route=ROUTES[track],movement=SACRED_MUSIC_TEXT_PLANS[selectedWorkId]?.[route.movement];
  if(!movement)return null;
  const ids=movement.textIds.slice(route.from,route.to);
  return ids.length?{track,ids,movementId:movement.movementId}:null;
 }
 function project(native,selectedWorkId,locale=language){
  const route=routeFor(native,selectedWorkId);
  if(!route){clearPosition();return native;}
  if(trackId!==route.track || workId!==selectedWorkId){
   trackId=route.track;workId=selectedWorkId;index=0;complete=false;
  }
  // An explicit FINISH stays visible, never starts another movement.
  const id=route.ids[Math.min(index,route.ids.length-1)];
  const item=sharedRequiemTextUnit(id);
  if(!item)return native; // Never invent substitute words.
  const source=native.schola??{};
  return Object.freeze({...native,
   ownership:route.manual?"COMPOSED_MANUAL_TEXT_REFERENCE":"COMPOSED_SCHOLA_TEXT_OVER_SOURCE_WINDOW",
   schola:Object.freeze({...source,
     latin:item.latin,english:locale==="fr"?item.fr:item.en,
     label:item.latin,trackId:route.track,
     index,total:route.ids.length,complete,
     segmentId:"COMPOSED:"+selectedWorkId+":"+route.movementId+":"+index,
     cueId:null,benedictusHold:false,
     musicStatus:route.manual?"MANUAL_TEXT_REFERENCE_NOT_OBSERVED":"SELECTED_LOCAL_SETTING_NOT_OBSERVED",
     manualMusicReference:route.manual===true,
     manualMovementId:route.manual?manualMovementId:null,
     sourceTextId:id,composedWorkId:selectedWorkId,
     composedMovementId:route.movementId,owner:"COMPOSED_TEXT_SHARED_REQUIEM_REGISTRY",
   }),
   index,total:route.ids.length,complete,benedictusHold:false
  });
 }
 function change(native,selectedWorkId,delta,locale=language){
  const route=routeFor(native,selectedWorkId);
  if(!route)return null;
  if(trackId!==route.track||workId!==selectedWorkId)
   project(native,selectedWorkId,locale);
  if(delta>0){
   if(index>=route.ids.length-1)complete=true;
   else index++;
  }else if(delta<0){index=Math.max(0,index-1);complete=false;}
  return project(native,selectedWorkId,locale);
 }
 function finish(native,selectedWorkId,locale=language){
  const route=routeFor(native,selectedWorkId);
  if(!route)return null;
  project(native,selectedWorkId,locale);complete=true;
  return project(native,selectedWorkId,locale);
 }
 return Object.freeze({project,next:(native,id,locale)=>change(native,id,1,locale),
  previous:(native,id,locale)=>change(native,id,-1,locale),
  finish,reset,setManualMovement,state});
}
