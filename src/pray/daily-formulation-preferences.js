/**
 * Private-to-device Daily Prayer formulation preferences.
 *
 * Stores SOURCE IDs only; never prayer bodies, timing history, examination
 * answers or spiritual records. Storage is injected by the caller; importing
 * this module never reads/writes the browser or sends a network request.
 *
 * A stored choice is never trusted: each load/save revalidates it against
 * an explicitly supplied, release-cleared formulation manifest.
 */
import {
  availableFormulations,compileDailyFormulation,
  normalizedDailySelections
} from "./daily-formulation-engine.js";

export const DAILY_FORMULATION_PREFERENCES_KEY="ao.pray.daily.formulations.v1";
const MAX_BYTES=8192;
const VALID_DAYPART=new Set(["morning","evening"]);
const VALID_LANG=new Set(["en","fr","la"]);
const VALID_LENGTH=new Set(["short","complete"]);

function profileKey(language,daypart,length){
 if(!VALID_LANG.has(language)||!VALID_DAYPART.has(daypart)||!VALID_LENGTH.has(length))
   throw new RangeError("Unrecognized daily prayer profile");
 return [language,daypart,length].join(":");
}
function readRaw(storage,key){
 if(!storage||typeof storage.getItem!=="function")return {};
 try{
   const v=storage.getItem(key);
   if(typeof v!=="string"||v.length>MAX_BYTES)return {};
   const parsed=JSON.parse(v);
   if(!parsed||parsed.version!==1||!parsed.profiles||typeof parsed.profiles!=="object"||Array.isArray(parsed.profiles))
     return {};
   return parsed.profiles;
 }catch{return {}}
}

function validated(manifest,language,daypart,length,values){
 const key=profileKey(language,daypart,length);
 const source=normalizedDailySelections(values);
 const profile=manifest?.profiles?.[key];
 if(!profile || !Array.isArray(profile.steps))return {};
 const valid={};
 for(const step of profile.steps){
   if(step.type!=="prayer"||!Object.prototype.hasOwnProperty.call(source,step.id))continue;
   const ids=source[step.id];
   try{
     const choices=availableFormulations(manifest,{language,daypart,length,stepId:step.id});
     const choicesSet=new Set(choices.map(x=>x.id));
     if(step.multiple===true){
       if(!Array.isArray(ids)||ids.length>8||!ids.every(x=>choicesSet.has(x))||(!ids.length&&step.required))
         continue;
     }else if(typeof ids!=="string"||!choicesSet.has(ids))continue;
     valid[step.id]=ids;
   }catch{
     // A withdrawn, translated, absent or uncleared historical body is silently
     // ignored. The caller's canonical baseline remains available.
   }
 }
 // Even if every stored ID is valid individually, the final complete plan
 // must remain buildable. No malformed partial state may be committed.
 try{compileDailyFormulation(manifest,{language,daypart,length,selection:valid});return valid}
 catch{return {}}
}

export function createDailyFormulationPreferenceStore({
  storage=null,key=DAILY_FORMULATION_PREFERENCES_KEY
}={}){
 if(typeof key!=="string"||!key.startsWith("ao.pray.daily."))throw new TypeError("Invalid prayer storage namespace");
 function getProfiles(){return readRaw(storage,key)}
 function load(manifest,{language="en",daypart="morning",length="short"}={}){
   const id=profileKey(language,daypart,length);
   return Object.freeze(validated(manifest,language,daypart,length,getProfiles()[id]));
 }
 function save(manifest,{language="en",daypart="morning",length="short",selection={}}={}){
   const id=profileKey(language,daypart,length);
   const source=normalizedDailySelections(selection);
   const picked=validated(manifest,language,daypart,length,source);
   // Invalid and uncleared explicit selections must never silently turn
   // into the default while claiming persistence succeeded.
   const requested=Object.keys(source);
   if(requested.some(k=>!Object.prototype.hasOwnProperty.call(picked,k)))
     return {saved:false,selection:load(manifest,{language,daypart,length})};
   const others=getProfiles(),next={version:1,profiles:{...others,[id]:picked}};
   const serialized=JSON.stringify(next);
   if(serialized.length>MAX_BYTES || typeof storage?.setItem!=="function")
     return {saved:false,selection:picked};
   try{storage.setItem(key,serialized);return {saved:true,selection:Object.freeze(picked)}}
   catch{return {saved:false,selection:picked}}
 }
 function clear({language,daypart,length}={}){
   if(typeof storage?.removeItem!=="function")return false;
   if(language===undefined){
     try{storage.removeItem(key);return true}catch{return false}
   }
   const id=profileKey(language,daypart,length);
   const profiles=getProfiles();delete profiles[id];
   try{storage.setItem(key,JSON.stringify({version:1,profiles}));return true}
   catch{return false}
 }
 return Object.freeze({load,save,clear,key});
}
