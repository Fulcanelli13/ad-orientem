/**
 * Two-facet historic-source topic gate. Research-only, no answer inference.
 * All substantive anchors come from source-topic metadata, never from heldout
 * user test utterances. A single generic word cannot authorize a source.
 */
const fold=text=>String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
const hasPhrase=(hay,needle)=>hay===needle||(" "+hay+" ").includes(" "+needle+" ");
export function historicalFocusCandidates(question,topics,language="en"){
 const lang=language==="fr"?"fr":"en",query=fold(question);
 if(!query)return [];
 return topics.filter(t=>t.historicalIntent?.status==="DOCUMENTARY_TOPIC_ANCHORS_RESEARCH_ONLY")
  .filter(t=>{
   const sets=t.historicalIntent.facets?.[lang];
   return Array.isArray(sets)&&sets.length>=2&&sets.every(group=>Array.isArray(group)&&group.length>0
     &&group.some(term=>hasPhrase(query,fold(term))));
  });
}
export function validateHistoricalFocus(topics){
 for(const topic of topics.filter(t=>t.historicalIntent)){
  if(!topic.id.startsWith("pius.historical_spx_pilot_")||
    topic.historicalIntent.status!=="DOCUMENTARY_TOPIC_ANCHORS_RESEARCH_ONLY")
    throw Error("Historical anchor ownership violation: "+topic.id);
  for(const lang of ["en","fr"]){
   const facets=topic.historicalIntent.facets?.[lang];
   if(!Array.isArray(facets)||facets.length<2||facets.length>3||
       facets.some(g=>!Array.isArray(g)||!g.length||g.some(x=>typeof x!=="string"||!fold(x))))
     throw Error("Historical source focus needs two independent facets for "+topic.id+"/"+lang);
  }
 }
}
