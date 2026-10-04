export const GUIDE_REGISTRY_FILE="guide-registry.v1.json";

function guideUrl(baseUrl){
  return new URL("../../data/presentation/"+GUIDE_REGISTRY_FILE,baseUrl);
}

function assertEntryShape(entry,key){
  if(!entry || typeof entry!=="object") throw new Error("Guide entry missing: "+key);
  for(const field of ["key","profile","sequence","moment","short","long","sourceLine","sourceLinks"]){
    if(entry[field]===undefined || entry[field]===null || String(entry[field]).trim()===""){
      throw new Error("Guide entry "+key+" missing "+field);
    }
  }
  if(entry.key!==key) throw new Error("Guide entry key mismatch: "+key);
  return entry;
}

export function validateGuideRegistry(registry){
  if(!registry || registry.schema!=="ao-r17-guide-registry-v1") throw new TypeError("ao-r17-guide-registry-v1 required");
  if(registry.status!=="RECOVERED_CONTINUITY_CERTIFIED") throw new Error("Guide registry is not continuity-certified");
  const entries=registry.entries??{};
  const keys=Object.keys(entries);
  if(keys.length!==32 || registry.entryCount!==32) throw new Error("Guide registry must contain exactly 32 entries");
  for(let i=1;i<=30;i++){
    const key="AO.CARD."+String(i).padStart(3,"0");
    const entry=assertEntryShape(entries[key],key);
    if(Number(entry.sequence)!==i) throw new Error("Guide sequence mismatch for "+key);
    if(entry.profile!=="ORDINARY_SUNG") throw new Error("Guide profile mismatch for "+key);
  }
  const pre=assertEntryShape(entries["PRE.ASPERGES"],"PRE.ASPERGES");
  const post=assertEntryShape(entries["POST.MASS"],"POST.MASS");
  if(pre.profile!=="PRE_MASS" || Number(pre.sequence)!==0) throw new Error("PRE.ASPERGES Guide contract mismatch");
  if(post.profile!=="POST_MASS" || Number(post.sequence)!==31) throw new Error("POST.MASS Guide contract mismatch");
  return registry;
}

export async function loadGuideRegistry({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function") throw new TypeError("fetch implementation required");
  const url=guideUrl(baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok) throw new Error("Unable to load Guide registry ("+(response?.status??"network")+")");
  return Object.freeze({registry:validateGuideRegistry(await response.json()),url:String(url)});
}

export function guideKeyForSequence(sequence){
  const n=Number(sequence);
  if(!Number.isInteger(n) || n<1 || n>30) return null;
  return "AO.CARD."+String(n).padStart(3,"0");
}

export function guideForSequence(registry,sequence){
  validateGuideRegistry(registry);
  const key=guideKeyForSequence(sequence);
  if(!key) return null;
  const entry=registry.entries[key];
  return Object.freeze({
    registryAvailable:true,
    key,
    text:entry.short,
    detail:entry.long,
    moment:entry.moment,
    sourceLine:entry.sourceLine,
    sourceLinks:entry.sourceLinks,
  });
}

export function guideForKey(registry,key){
  validateGuideRegistry(registry);
  const resolved=registry.aliases?.[key]??key;
  const entry=registry.entries?.[resolved];
  if(!entry) return null;
  return Object.freeze({
    registryAvailable:true,
    key:resolved,
    text:entry.short,
    detail:entry.long,
    moment:entry.moment,
    sourceLine:entry.sourceLine,
    sourceLinks:entry.sourceLinks,
  });
}
