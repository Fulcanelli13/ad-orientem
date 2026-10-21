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


/**
 * P0 source-owner comparison against the actual Sung donor. This does not
 * modify, import, or project Mass reader cards. Research Latin must be passed
 * by the editorial caller from the original workbook; the exported ID bridge
 * deliberately contains no textual witnesses.
 */
export const MASS_CANONICAL_RECONCILIATION_SCHEMA="AO_MASS_CANONICAL_RECONCILIATION_V1";
export function reconcileMassResearchToCanonical(
  bridge,{sungCorpus,guideRegistry,researchLatinByUnitId={},enforceCensus=true}={}
){
  validateMassKnowledgeResearchBridge(bridge,{enforceCensus});
  invariant(sungCorpus?.schema==="ao-reader-text-corpus-v1"&&sungCorpus.form==="SUNG",
    "canonical Sung text corpus required");
  invariant(Array.isArray(sungCorpus.blocks),"canonical source blocks required");
  invariant(guideRegistry?.schema==="ao-r17-guide-registry-v1"&&
    guideRegistry.status==="RECOVERED_CONTINUITY_CERTIFIED",
    "continuity-certified Guide registry required");
  invariant(guideRegistry.entries&&typeof guideRegistry.entries==="object",
    "Guide entries required");
  const corpusCues=new Map();
  for(const block of sungCorpus.blocks){
    for(const cue of list(block.units)){
      invariant(nonempty(cue.cue_id),"canonical cue missing ID");
      invariant(!corpusCues.has(cue.cue_id),"duplicate canonical cue "+cue.cue_id);
      corpusCues.set(cue.cue_id,{
        id:cue.cue_id,blockId:block.Block_ID,
        latin:cue.latin,properSlot:cue.proper_slot,
        branch:block.Branch_Status
      });
    }
  }
  const sourceUnitsByCue=new Map();
  const dispositions={};
  const sourceUnits=bridge.units.map(unit=>{
    const canonical=corpusCues.get(unit.cueId);
    const witness=Object.prototype.hasOwnProperty.call(researchLatinByUnitId,unit.id)
      ? researchLatinByUnitId[unit.id]:null;
    invariant(witness===null||typeof witness==="string",
      "research Latin witness must be a string "+unit.id);
    let disposition="EDITORIAL_HOLD",evidence="NO_EXACT_LATIN_WITNESS";
    if(!canonical){disposition="MATRIX_ONLY";evidence="CUE_ABSENT_FROM_CANONICAL_SOURCE";}
    else if(canonical.latin===null){disposition="CONDITIONAL_VARIANT";evidence="VARIABLE_SOURCE_SLOT";}
    else if(typeof witness==="string"&&witness.length){
      // Unicode NFC retains wording, accents, rubrical crosses and punctuation.
      const actual=canonical.latin.normalize("NFC"),expected=witness.normalize("NFC");
      if(actual===expected){disposition="EXACT_MATCH";evidence="FULL_CUE_LATIN_EQUAL";}
      else if(actual.includes(expected)){
        disposition="EDITORIAL_HOLD";evidence="EXACT_SUBSPAN_BUT_BOUNDARY_UNCERTIFIED";
      }else{disposition="CONTENT_DIFFERENCE";evidence="NO_EXACT_LATIN_SPAN_MATCH";}
    }
    const sourceGuideIds=unique(list(unit.guideIds));
    const publishedGuideIds=sourceGuideIds.filter(id=>
      Object.prototype.hasOwnProperty.call(guideRegistry.entries,id));
    const historicalGuideIds=sourceGuideIds.filter(id=>!publishedGuideIds.includes(id));
    const rec={
      unitId:unit.id,parentId:unit.parentId,cueId:unit.cueId,
      canonicalBlockId:canonical?.blockId??null,
      researchBranch:unit.branch||null,canonicalBranch:canonical?.branch??null,
      canonicalProperSlot:canonical?.properSlot??null,
      publishedGuideIds,historicalGuideIds,
      authorClaimIds:unique(list(unit.verifiedClaimIds)),
      disposition,evidence,latinWitnessProvided:typeof witness==="string"&&witness.length>0,
      publicationAllowed:false
    };
    dispositions[disposition]=(dispositions[disposition]??0)+1;
    if(!sourceUnitsByCue.has(unit.cueId))sourceUnitsByCue.set(unit.cueId,[]);
    sourceUnitsByCue.get(unit.cueId).push(unit.id);
    return rec;
  });
  const canonicalReverse=[...corpusCues.values()].map(cue=>{
    const unitIds=sourceUnitsByCue.get(cue.id)??[];
    return {
      cueId:cue.id,blockId:cue.blockId,
      unitIds:[...unitIds],
      disposition:unitIds.length?"RESEARCH_LINK_ONLY":"APP_ONLY",
      variableSourceSlot:cue.latin===null,
      publicationAllowed:false
    };
  });
  const guideReverse=Object.keys(guideRegistry.entries).sort().map(guideId=>({
    guideId,
    researchUnitIds:sourceUnits.filter(u=>u.publishedGuideIds.includes(guideId))
      .map(u=>u.unitId),
    explanationOwner:"data/presentation/guide-registry.v1.json",
    contentParity:"NOT_VERIFIED_BY_THIS_RESOLVER",
    publicationPermissionInherited:false
  }));
  return Object.freeze({
    schema:MASS_CANONICAL_RECONCILIATION_SCHEMA,
    status:"RESEARCH_ONLY_NO_AUTO_PUBLICATION",
    basis:{
      researchSchema:bridge.schema,
      sungDonorHash:sungCorpus.source?.rawSha256??null,
      guideStatus:guideRegistry.status
    },
    counts:{
      researchUnits:sourceUnits.length,
      canonicalSourceCues:canonicalReverse.length,
      canonicalCuesWithResearch:canonicalReverse.filter(x=>x.unitIds.length).length,
      canonicalSourceOnly:canonicalReverse.filter(x=>!x.unitIds.length).length,
      publishedGuides:guideReverse.length,dispositions
    },
    units:sourceUnits,canonicalReverse,guideReverse
  });
}

/**
 * The P1 interface receives only explicitly owner-certified link IDs. Research
 * links are not promoted by a structural match, even a FULL_CUE_LATIN_EQUAL.
 * This returns no source text and never alters the liturgical reader.
 */
export function massP1ApprovedLinkIds(reconciliation,{cueId,approvals=[]}={}){
  invariant(reconciliation?.schema===MASS_CANONICAL_RECONCILIATION_SCHEMA,
    "P0 canonical reconciliation required");
  invariant(nonempty(cueId),"canonical cue ID required");
  const row=list(reconciliation.canonicalReverse).find(x=>x.cueId===cueId);
  if(!row)return Object.freeze([]);
  // A relationship approval cannot bypass an unresolved research-unit identity.
  const eligibleUnitIds=new Set(list(reconciliation.units).filter(u=>
    u.disposition==="EXACT_MATCH"&&u.evidence==="FULL_CUE_LATIN_EQUAL"&&
    u.latinWitnessProvided===true
  ).map(u=>u.unitId));
  const unitSet=new Set(row.unitIds);
  const approved=list(approvals).filter(x=>
    unitSet.has(x?.unitId)&&eligibleUnitIds.has(x?.unitId)&&
    nonempty(x?.targetId)&&nonempty(x?.targetOwner)&&
    nonempty(x?.evidenceLocator)&&
    x?.editorialDecision==="APPROVED_FOR_PUBLICATION"&&
    x?.ownerAccepted===true&&x?.publicationAllowed===true&&
    x?.sourceTextCertified===true&&x?.ritualApplicabilityCertified===true&&
    x?.sourceRevision===reconciliation.basis.sungDonorHash
  ).map(x=>Object.freeze({
    unitId:x.unitId,targetOwner:x.targetOwner,targetId:x.targetId,
    relationshipType:x.relationshipType||"OWNER_APPROVED_LINK"
  }));
  return Object.freeze(approved);
}
