/**
 * Editorial workbench selectors sourced from existing public module owners.
 * No duplicate Bible citations, competing navigation records or inferred links.
 */
import {SCRIPTURE_LINKED_OBJECTS} from "./related-objects.js";
import {loadScriptureAtlasEventObjects} from "./atlas-related-events.js";
import {parseScriptureContext} from "./context.js";

export const SCRIPTURE_MINING_MODULES=Object.freeze({
  rosary:"rosaryBead",
  mass:"massFormation",
  formation:"massFormation",
  novena:"novena",
  stations:"station",
  prayer:"prayer",
  historia:"atlas",
  other:null
});
const SOURCE_OBJECTS=Object.freeze(SCRIPTURE_LINKED_OBJECTS.filter(
  x=>["massFormation","novena","station","prayer"].includes(x.source)
));
const valid=(x)=>x&&typeof x.objectId==="string"&&
  typeof x.reference==="string"&&!!parseScriptureContext(x.reference)&&
  typeof x.title?.en==="string"&&typeof x.relation==="string";

/**
 * Returns only exact original module links. Atlas owner loads lazily; if its
 * 151-event data are absent, return [] rather than counterfeit placeholders.
 */
export function sourceMiningTargets(module,{atlasEvents=[]}={}){
 if(!Object.hasOwn(SCRIPTURE_MINING_MODULES,module))throw Error("UNRECOGNISED_MINING_MODULE");
 const source=SCRIPTURE_MINING_MODULES[module];
 if(!source||source==="rosaryBead")return Object.freeze([]);
 const objects=source==="atlas"?atlasEvents:SOURCE_OBJECTS;
 if(!Array.isArray(objects))throw TypeError("Source objects array required");
 return Object.freeze(objects.filter(x=>x.source===source&&valid(x)).map(x=>Object.freeze({
   id:x.id,objectId:x.objectId,source:x.source,reference:x.reference,
   passage:x.passage,relation:x.relation,title:x.title,
   description:x.description??null
 })));
}
export async function loadSourceMiningTargets(module,{atlasLoader=loadScriptureAtlasEventObjects}={}){
 if(module!=="historia")return sourceMiningTargets(module);
 const events=await atlasLoader();
 return sourceMiningTargets("historia",{atlasEvents:events});
}
export function miningSourceTarget(module,objectId,objects){
 const list=sourceMiningTargets(module,{atlasEvents:module==="historia"?objects:[]});
 return list.find(x=>x.objectId===objectId)??null;
}
export function miningWorkbenchUrl({module,objectId=null,mystery=null,bead=null,reference=null}={}){
 if(!Object.hasOwn(SCRIPTURE_MINING_MODULES,module))throw Error("UNRECOGNISED_MINING_MODULE");
 if(reference!==null&&!parseScriptureContext(reference))throw Error("INVALID_MINING_REFERENCE");
 if(objectId!==null&&(typeof objectId!=="string"||objectId.length>150))throw Error("INVALID_MINING_OBJECT");
 if(mystery!==null&&!/^(joy|lum|sor|glo)[1-5]$/.test(mystery))throw Error("INVALID_MINING_MYSTERY");
 if(bead!==null&&(!Number.isInteger(bead)||bead<1||bead>10))throw Error("INVALID_MINING_BEAD");
 const url=new URL("../../previews/scripture-mining-workbench-20261017.html",import.meta.url);
 url.searchParams.set("module",module);
 if(objectId!==null)url.searchParams.set("objectId",objectId);
 if(mystery!==null)url.searchParams.set("mystery",mystery);
 if(bead!==null)url.searchParams.set("bead",String(bead));
 if(reference!==null)url.searchParams.set("reference",reference);
 return url.href;
}
