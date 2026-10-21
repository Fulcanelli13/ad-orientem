import {historicalSourceScopeExcluded} from "./living-church-historical-focus.js";

/**
 * Conservative concept-to-document navigation for St Pius X. No embeddings,
 * answer generation, spiritual diagnosis or application of present-day law.
 * Two semantically distinct topic facets must match a bilingual expression.
 */
const fold=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g," ")
 .replace(/\s+/g," ").trim();
const terms=text=>fold(text).split(" ").filter(Boolean);
const phraseMatch=(q,entry)=>{
 const p=fold(entry);if(!p)return false;
 const words=terms(p),qWords=terms(q);
 // Controlled morphological prefix support on sufficiently long single stems;
 // multiword documentary phrases must occur as contiguous expressions.
 if(words.length>1)return (" "+q+" ").includes(" "+p+" ");
 if(p.length<4)return qWords.includes(p);
 return qWords.some(w=>w===p||(p.length>=5&&w.startsWith(p)));
};
export function validatePiusSourceConceptRegistry(registry,catalog){
 if(registry?.schema!=="AO_LC_PIUS_X_SOURCE_CONCEPT_FACETS_V1"
   ||registry.status!=="RESEARCH_ONLY_SOURCE_OWNER_INTERPRETATION_NOT_HISTORICAL_PROSE"
   ||registry.policy?.canAuthorHistoricalAnswer!==false
   ||registry.policy?.mayOverrideSafetyHold!==false
   ||registry.policy?.requiresSourcePointer!==true
   ||registry.policy?.minimumIndependentFacets!==2
   ||!Array.isArray(registry.families))throw Error("Untrusted St Pius X historical source-concept index");
 const byId=new Map(catalog.topics.map(x=>[x.id,x])),seen=new Set();
 for(const family of registry.families){
  const topic=byId.get(family.topicId);
  if(!topic||seen.has(family.topicId)
    ||topic.character!=="pius-x"||topic.coverage!=="SOURCE_NAVIGATION_ONLY"
    ||topic.category!=="pius_historical_source_navigation"
    ||!topic.sourceRefs.some(x=>x.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"&&x.ref===family.sourceRef)
    ||family.provenance!=="EDITORIAL_INTENT_FACETS_DERIVED_FROM_VERIFIED_SOURCE_TOPIC_NOT_VISITOR_PROBE_QUOTE")
     throw Error("Concept attempts to claim unowned historical passage "+family.topicId);
  seen.add(family.topicId);
  for(const lang of ["en","fr"]){
   const groups=family.facets?.[lang];
   if(!Array.isArray(groups)||groups.length!==2
     ||groups.some(g=>!Array.isArray(g)||!g.length
       ||g.some(t=>typeof t!=="string"||!fold(t))))
     throw Error("Source-owned bilingual independent facets missing: "+family.topicId+"/"+lang);
  }
 }
}
export function piusSourceConceptCandidates(question,registry,{language="en"}={}){
 if(!registry)return [];
 const q=fold(question),lang=language==="fr"?"fr":"en";
 if(!q)return [];
 return registry.families.filter(f=>{
  if(historicalSourceScopeExcluded(f.topicId,question))return false;
  const groups=f.facets[lang];
  return groups.length===2&&groups.every(g=>g.some(term=>phraseMatch(q,term)));
 }).map(f=>Object.freeze({topicId:f.topicId,sourceRef:f.sourceRef,concept:f.concept,
   basis:"SOURCE_OWNED_TWO_INDEPENDENT_CONCEPTS",language:lang}));
}
