/*
 * Formation first-use registry. Keep all historic module IDs discoverable
 * on Home, without downloading the underlying course or dossier libraries.
 * Each canonical runtime/registry remains authoritative when first opened.
 */
import { LEARN_LAYOUT } from "./presentation.js";
const traditionalIds=[
 "learn.rites.sick","learn.rites.baptism","learn.rites.first_communion",
 "learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony",
 "learn.serve_mass.responses","learn.scapular"
];
export const TRADITIONAL_LEARN_ROUTES=Object.freeze(Object.fromEntries(traditionalIds.map(id=>[id,Object.freeze({id,type:"module",domain:"learn",category:"traditional-formation",title:id})])));
export const SPIRITUAL_LIFE_ROUTE_ID="learn.spiritual_life";
export const LATIN_COURSE_ROUTE_ID="learn.latin";
export const GLOSSARY_ROUTE_ID="learn.glossary";
export const MASS_FORMATION_ROUTE="learn.mass";
const aliases=Object.freeze({"learn.serve_mass":"learn.serve_mass.responses"});
const named=new Map(LEARN_LAYOUT.sections.flatMap(s=>s.items.map(i=>[i.id,i])));
const descriptors=Object.freeze(Object.fromEntries([...named].map(([id,item])=>[id,Object.freeze({
 id,domain:"learn",type:item.type==="reference"?"reference":"module",
 category:"formation",title:item.title?.[0]||id
})])));
const imported=new Map();
const loaders=Object.freeze({
 traditional:()=>import("./traditional-life.js"),
 ethics:()=>import("./sexual-ethics.js"),
 spiritual:()=>import("./spiritual-life.js"),
 latin:()=>import("./latin-course-v2.js"),
 glossary:()=>import("../glossary/browser-entry.js"),
 mass:()=>import("./mass-formation.js")
});
const groupFor=id=>{
 if(TRADITIONAL_LEARN_ROUTES[id])return "traditional";
 if(id==="learn.sexual_ethics")return "ethics";
 if(id===SPIRITUAL_LIFE_ROUTE_ID)return "spiritual";
 if(id===LATIN_COURSE_ROUTE_ID)return "latin";
 if(id===GLOSSARY_ROUTE_ID)return "glossary";
 if(id===MASS_FORMATION_ROUTE)return "mass";
 return null; // existing Daily Catechism, Catechism, Today are untouched
};
export async function ensureLearnModule(id,win=globalThis){
 const key=aliases[id]||id,group=groupFor(key);
 if(!group)return true;
 if(!imported.has(group)){
   const loading=win?.AO_LOADING_DIRECTOR_V1?.begin?.("learn");
   const promise=loaders[group]().catch(err=>{imported.delete(group);throw err}).finally(()=>loading?.end?.());
   imported.set(group,promise);
 }
 const mod=await imported.get(group);
 // Calls are idempotent, and install exactly the original canonical owners.
 if(group==="traditional")mod.installTraditionalLearnModules(win);
 else if(group==="ethics")mod.installSexualEthicsModule(win);
 else if(group==="spiritual")mod.installSpiritualLifeModule(win);
 else if(group==="latin")mod.installLatinCourseModule(win);
 else if(group==="glossary")mod.installGlossaryModule(win);
 else if(group==="mass")mod.installMassFormationModule(win);
 return true;
}
export function installLazyLearnRegistry(win=globalThis){
 const base=win?.AO_MODULES;
 if(!base||base.__aoLearnLazyV1)return false;
 const proxy={...base,__aoLearnLazyV1:true,
  definitions:{...base.definitions,...descriptors},
  aliases:{...base.aliases,...aliases},
  get(id){return descriptors[aliases[id]||id]||base.get?.(id)||null},
  resolve(id){const canonical=aliases[id]||id,def=descriptors[canonical];
   return def?{ok:true,input:id,id:canonical,defaults:{},chain:canonical===id?[]:[id],definition:def}:base.resolve?.(id);
  },
  async open(id,opts={}){
   const key=aliases[id]||id;
   if(!groupFor(key))return base.open?.(id,opts);
   try{
    await ensureLearnModule(key,win);
    const actual=win.AO_MODULES;
    if(!actual||actual===proxy||typeof actual.open!=="function")
      return {ok:false,canonicalId:key,error:"LEARN_OWNER_NOT_READY"};
    return actual.open(id,opts);
   }catch(error){
    try{win.console?.error?.("Formation runtime loading failed",error)}catch{}
    return {ok:false,canonicalId:key,error:"LEARN_OWNER_NOT_READY"};
   }
  },
  list(filter={}){
   const previous=base.list?.(filter)||[];
   if(filter.domain&&filter.domain!=="learn")return previous;
   const seen=new Set(previous.map(x=>x.id));
   return [...previous,...Object.values(descriptors).filter(x=>!seen.has(x.id)&&(!filter.type||filter.type===x.type))];
  }
 };
 win.AO_MODULES=proxy;
 win.AO_MODULE_REGISTRY_V36=proxy;
 return true;
}
