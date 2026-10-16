// Single presentation adapter for *observed* 1962 commemorations.
// Home and Calendar must render identical names from the same resolved day.
// This module never changes the resolver, rank, Mass Proper, orations or ICS.
export const OBSERVED_COMMEMORATION_LABELS_VERSION="ao-1962-observed-commemoration-labels-v1";
const rawSourceCode=value=>{
 const raw=String(value||"").trim();
 return !raw||/^(?:(?:sancti|tempora|commune|votive):|:[a-z]+:|\d{1,2}[-_/]\d{1,4}$)/i.test(raw);
};
const sourceIdentity=value=>{
 if(typeof value!=="string")return null;
 const id=value.trim();
 return /^(?:sancti|tempora|commune|votive):[a-z0-9:-]+$/i.test(id)
   ?id.replace(/:[1-4]:[a-z]{1,3}$/i,""):null;
};
function resolvedLabel(item,language){
 if(typeof item==="string")return rawSourceCode(item)?null:item.trim();
 if(!item||typeof item!=="object")return null;
 const title=item.title;
 const isFrench=String(language||"en").toLowerCase().startsWith("fr");
 const options=isFrench?[
   item.titleFr,item.nameFr,item.displayNameFr,
   typeof title==="object"?title?.fr:null,
   typeof title==="string"?title:null,
   item.name,
   typeof title==="object"?title?.en:null,item.titleEn,item.nameEn
 ]:[
   typeof title==="string"?title:null,
   typeof title==="object"?title?.en:null,
   item.titleEn,item.nameEn,item.displayNameEn,item.name,
   typeof title==="object"?title?.fr:null,item.titleFr,item.nameFr
 ];
 for(const raw of options){
   if(typeof raw!=="string")continue;
   const text=raw.trim();
   if(text&&!rawSourceCode(text))return text;
 }
 return null;
}
export function observedCommemorationLabels(resolution,{language="en"}={}){
 // DayResolver may expose a preferred resolved-day list and compatibility
 // fallbacks. Choose the first one containing actual displayable observances,
 // never union unrelated fallback candidate lists.
 for(const raw of [
   resolution?.day?.commemorations,
   resolution?.day?.main?.commemorations,
   resolution?.commemorations
 ]){
   const items=Array.isArray(raw)?raw:raw==null?[]:[raw];
   const entries=[],seen=new Set(),aliases=new Set();
   const normalize=text=>String(text).trim().toLocaleLowerCase(language==="fr"?"fr":"en");
   // A mixed legacy array can hold both a sourced saint object and an
   // unsourced vernacular title for the *same* commemoration. Suppress the
   // duplicate bare title using the sourced item's actual EN/FR aliases.
   for(const item of items){
     if(!item||typeof item!=="object")continue;
     const id=sourceIdentity(item.id||item.sourceId||item.resolverIdentity);
     if(!id)continue;
     for(const lang of ["en","fr"]){
       const name=resolvedLabel(item,lang);
       if(name)aliases.add(normalize(name));
     }
   }
   for(const item of items){
     const name=resolvedLabel(item,language);
     if(!name)continue;
     const id=sourceIdentity(typeof item==="string"?item:item?.id||item?.sourceId||item?.resolverIdentity);
     const labelKey="title:"+normalize(name);
     if((!id&&aliases.has(normalize(name)))||seen.has(id||labelKey))continue;
     seen.add(id||labelKey);
     entries.push(Object.freeze({sourceId:id,name}));
   }
   if(entries.length)return Object.freeze(entries);
 }
 return Object.freeze([]);
}
