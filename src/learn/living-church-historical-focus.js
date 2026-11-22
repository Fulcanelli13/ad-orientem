/**
 * Two-facet historic-source topic gate. Research-only, no answer inference.
 * All substantive anchors come from source-topic metadata, never from heldout
 * user test utterances. A single generic word cannot authorize a source.
 */
const fold=text=>String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
const hasPhrase=(hay,needle)=>hay===needle||(" "+hay+" ").includes(" "+needle+" ");
// Shared documentary-scope restriction for both literal and concept-based
// source navigation. A historically clergy-only retreat is not a personal
// obligation imposed on a lay visitor merely because the words match.
export function historicalSourceScopeExcluded(topicId,question){
 const query=fold(question);
 return topicId==="pius.historical_spx_pilot_24"
  && /\b(?:laic|laique|laics|laiques|layperson|laypeople|laywoman|layman|laity)\b/.test(query);
}
export function historicalFocusCandidates(question,topics,language="en"){
 const lang=language==="fr"?"fr":"en",query=fold(question);
 if(!query)return [];
 return topics.filter(t=>t.historicalIntent?.status==="DOCUMENTARY_TOPIC_ANCHORS_RESEARCH_ONLY")
  .filter(t=>{
   if(historicalSourceScopeExcluded(t.id,question))return false;
   const actor=t.historicalIntent.actorRequired?.[lang];
   if(actor?.length&&!actor.some(x=>hasPhrase(query,fold(x))))return false;
   const sets=t.historicalIntent.facets?.[lang];
   return Array.isArray(sets)&&sets.length>=2&&sets.every(group=>Array.isArray(group)&&group.length>0
     &&group.some(term=>hasPhrase(query,fold(term))));
  });
}

export function historicalConfirmedContinuation(question,topic,language="en"){
 const lang=language==="fr"?"fr":"en",n=fold(question);
 const terms=topic?.historicalIntent?.contextContinuation?.[lang];
 if(!n||!Array.isArray(terms)||terms.length<2)return false;
 // A contextual cue can continue an explicitly confirmed source, but cannot
 // bootstrap an unconfirmed lexical guess into an authoritative document link.
 return terms.some(term=>hasPhrase(n,fold(term)));
}
export function validateHistoricalFocus(topics){
 for(const topic of topics.filter(t=>t.historicalIntent)){
  if(!topic.id.startsWith("pius.historical_spx_pilot_")||
    topic.historicalIntent.status!=="DOCUMENTARY_TOPIC_ANCHORS_RESEARCH_ONLY")
    throw Error("Historical anchor ownership violation: "+topic.id);
  for(const lang of ["en","fr"]){
   const actor=topic.historicalIntent.actorRequired?.[lang];
   if(actor&&( !Array.isArray(actor)||actor.length<2
      ||actor.some(x=>typeof x!=="string"||!fold(x))))
    throw Error("Invalid specific historical actor scope for "+topic.id+"/"+lang);
   const continuation=topic.historicalIntent.contextContinuation?.[lang];
   if(!Array.isArray(continuation)||continuation.length<2
      ||continuation.some(x=>typeof x!=="string"||!fold(x)))
    throw Error("Missing historically defined conversation continuations for "+topic.id+"/"+lang);
   const facets=topic.historicalIntent.facets?.[lang];
   if(!Array.isArray(facets)||facets.length<2||facets.length>3||
       facets.some(g=>!Array.isArray(g)||!g.length||g.some(x=>typeof x!=="string"||!fold(x))))
     throw Error("Historical source focus needs two independent facets for "+topic.id+"/"+lang);
  }
 }
}
