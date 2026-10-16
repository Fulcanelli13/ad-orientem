/**
 * Non-publishing linkage adapter for the 16 October 2026 Mass Ultra Master.
 * Owns neither the Mass reader nor the Mystery/Formation manuscripts.
 * IDs are research pointers; no source text or edition is certified here.
 */
export const MASS_KNOWLEDGE_BRIDGE_SCHEMA="AO_MASS_KNOWLEDGE_RESEARCH_BRIDGE_V1";
export const MASS_KNOWLEDGE_BRIDGE_STATUS="RESEARCH_ONLY_NO_AUTO_PUBLICATION";
const COUNTS=Object.freeze({units:435,cues:279,wordAnchors:66,authorClaims:139,mysteryOwners:39});
const list=v=>Array.isArray(v)?v:[];
const nonempty=v=>typeof v==="string"&&v.length>0;
const unique=arr=>[...new Set(arr.filter(nonempty))];
const invariant=(test,message)=>{if(!test)throw new Error("Mass knowledge bridge: "+message);};
const indexBy=(items,key,label)=>{
  const index=new Map();
  for(const item of items){
    invariant(item&&nonempty(item[key]),label+" missing "+key);
    invariant(!index.has(item[key]),label+" duplicate "+item[key]);
    index.set(item[key],item);
  }
  return index;
};
/**
 * A structural integrity test, deliberately not an editorial certification.
 * The frozen census prevents a shortened excerpt being mistaken for the full index.
 */
export function validateMassKnowledgeResearchBridge(bridge,{enforceCensus=true}={}){
  invariant(bridge?.schema===MASS_KNOWLEDGE_BRIDGE_SCHEMA,"wrong schema");
  invariant(bridge.status===MASS_KNOWLEDGE_BRIDGE_STATUS,"must remain research-only");
  invariant(bridge.governance?.autoReleaseAllowed===false,"auto-release must be forbidden");
  invariant(bridge.governance?.massReaderMutationAllowed===false,"reader ownership must be preserved");
  invariant(bridge.governance?.runtimeMutationAllowed===false,"runtime mutation must be forbidden");
  invariant(bridge.governance?.manuscriptCopyAllowed===false,"draft manuscript copying must be forbidden");
  for(const [key,total] of Object.entries(COUNTS)){
    invariant(Array.isArray(bridge[key]),"missing "+key+" collection");
    if(enforceCensus)invariant(bridge[key].length===total,key+" census "+bridge[key].length+" != "+total);
  }
  const units=indexBy(bridge.units,"id","unit");
  const cues=indexBy(bridge.cues,"id","cue");
  const claims=indexBy(bridge.authorClaims,"id","author claim");
  indexBy(bridge.wordAnchors,"id","word anchor");
  indexBy(bridge.mysteryOwners,"guideId","Mystery owner");
  for(const u of units.values()){
    invariant(cues.has(u.cueId),"unresolved cue "+u.cueId+" for "+u.id);
    for(const claimId of list(u.verifiedClaimIds)){
      invariant(claims.has(claimId),"unresolved claim "+claimId+" for "+u.id);
      invariant(claims.get(claimId).unitId===u.id,"claim belongs to another unit "+claimId);
    }
    invariant(u.releaseGate==="RESEARCH ONLY — NO AUTOMATIC PUBLISH","unsafe unit release gate "+u.id);
  }
  for(const a of bridge.wordAnchors){
    invariant(units.has(a.unitId),"word anchor without unit "+a.id);
    invariant(cues.has(a.cueId),"word anchor without cue "+a.id);
    invariant(units.get(a.unitId).cueId===a.cueId,"cross-cue word anchor "+a.id);
  }
  for(const claim of claims.values())invariant(units.has(claim.unitId),"claim without unit "+claim.id);
  return Object.freeze({status:bridge.status,units:units.size,cues:cues.size,wordAnchors:bridge.wordAnchors.length,authorClaims:claims.size,mysteryOwners:bridge.mysteryOwners.length,editoriallyCertified:false});
}
/**
 * Research-only exact-ID navigation. Returns identifiers and relation labels,
 * never publication-ready citations, linked source text, or ritual instructions.
 * Callers must not render this directly on public or ritual Mass surfaces.
 */
export function massKnowledgeResearchContext(bridge,{unitId="",cueId="",guideId=""}={}){
  validateMassKnowledgeResearchBridge(bridge,{enforceCensus:false});
  invariant([unitId,cueId,guideId].filter(Boolean).length===1,"select exactly one existing ID");
  const baseUnits=list(bridge.units).filter(u=>
    unitId?u.id===unitId:cueId?u.cueId===cueId:list(u.guideIds).includes(guideId));
  const matchedCueIds=new Set(baseUnits.map(u=>u.cueId));
  const matchedUnitIds=new Set(baseUnits.map(u=>u.id));
  const matchedGuides=new Set(baseUnits.flatMap(u=>list(u.guideIds)));
  if(guideId)matchedGuides.add(guideId);
  const claims=list(bridge.authorClaims).filter(c=>matchedUnitIds.has(c.unitId));
  const words=list(bridge.wordAnchors).filter(a=>matchedUnitIds.has(a.unitId));
  const mystery=list(bridge.mysteryOwners).filter(m=>matchedGuides.has(m.guideId));
  return Object.freeze({
    visibility:"EDITORIAL_RESEARCH_ONLY",
    publicationAllowed:false,
    ritualReaderMutationAllowed:false,
    unitIds:unique(baseUnits.map(u=>u.id)),
    cueIds:unique([...matchedCueIds]),
    guideIds:unique([...matchedGuides]),
    authorClaimIds:unique(claims.map(c=>c.id)),
    wordAnchorIds:unique(words.map(a=>a.id)),
    mysteryOwnerIds:unique(mystery.map(m=>m.guideId)),
    scriptureCandidates:baseUnits.filter(u=>u.bibleWitness).map(u=>({
      unitId:u.id,reference:u.bibleWitness,relation:u.bibleRelation||"UNCLASSIFIED",
      status:"EDITORIAL_REVIEW_REQUIRED"
    }))
  });
}
