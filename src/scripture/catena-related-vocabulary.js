/*
 * Curated, narrowly-scoped patristic search vocabulary.
 *
 * This is NOT a theological equivalence ontology. Each pairing is an editorial
 * candidate-finding aid only. A hit must contain a qualifying phrase in its
 * ACTUAL attributed original source text before it can be displayed.
 *
 * No authored answer, paraphrase or reconstructed Father dialogue is allowed.
 */
export const CATENA_TOPICS_SCHEMA="ao.catena.related-vocabulary.v1";
export const CATENA_RELATED_TOPICS=Object.freeze([
 Object.freeze({
  id:"logos",label:"The Word / Logos",
  query:/\b(?:logos|divine word|word of god|why (?:is|was) (?:christ|jesus|he) called (?:the )?word)\b/i,
  probes:Object.freeze(["logos","word","reason"]),
  evidence:Object.freeze([/\blogos\b/i,/\bword (?:and|or) reason\b/i,/\bdivine word\b/i,/\bword of god\b/i])
 }),
 Object.freeze({
  id:"preexistence",label:"The Son before creation",
  query:/\b(?:pre.?exist(?:ence|ent)?|before (?:creation|the world|all (?:things|ages)|time)|always existed|is (?:jesus|christ|the son|the word) eternal|without (?:a )?beginning|eternal generation|eternity of (?:christ|the son|the word))\b/i,
  probes:Object.freeze(["eternal","eternity","beginning","before","begotten","generation","uncreated"]),
  evidence:Object.freeze([/\beternal generation\b/i,/\bbefore (?:all things|creation|the world|all ages|time)\b/i,/\bwithout (?:a )?beginning\b/i,/\bfrom eternity\b/i,/\bnever (?:had|has) a beginning\b/i,/\bin the beginning was the word\b/i,/\bword (?:was|is) (?:ever|eternal)\b/i,/\bnot created\b/i])
 }),
 Object.freeze({
  id:"incarnation",label:"Incarnation / Word made flesh",
  query:/\b(?:incarnat(?:ion|e|ed)|word (?:became|was made) flesh|god became man|took flesh|assuming flesh)\b/i,
  probes:Object.freeze(["incarnation","incarnate","flesh","assumed","made"]),
  evidence:Object.freeze([/\bincarnat(?:ion|e|ed)\b/i,/\bword was made flesh\b/i,/\bword became flesh\b/i,/\btook (?:on )?flesh\b/i,/\bassumed (?:our )?flesh\b/i,/\b(?:god|word) became man\b/i])
 }),
 Object.freeze({
  id:"holy-spirit",label:"Holy Spirit / Holy Ghost",
  query:/\b(?:holy (?:spirit|ghost)|paraclete|the comforter)\b/i,
  probes:Object.freeze(["spirit","ghost","paraclete","comforter"]),
  evidence:Object.freeze([/\bholy spirit\b/i,/\bholy ghost\b/i,/\bparaclete\b/i,/\bthe comforter\b/i])
 }),
 Object.freeze({
  id:"resurrection",label:"Resurrection / risen from the dead",
  query:/\b(?:resurrect(?:ion|ed)|risen from the dead|rise from the dead|rose from the dead|raised from the dead)\b/i,
  probes:Object.freeze(["resurrection","risen","rose","raised","dead"]),
  evidence:Object.freeze([/\bresurrect(?:ion|ed)\b/i,/\brisen from the dead\b/i,/\brose from the dead\b/i,/\braised from the dead\b/i,/\brise from the dead\b/i])
 }),
 Object.freeze({
  id:"remission",label:"Remission / forgiveness of sins",
  query:/\b(?:remission of sins|forgiveness of sins|forgive (?:our|my|their) sins|pardon (?:our|my|their) sins)\b/i,
  probes:Object.freeze(["remission","forgiveness","forgiven","sins","pardon"]),
  evidence:Object.freeze([/\bremission of sins\b/i,/\bforgiveness of sins\b/i,/\bforg(?:ive|iven) (?:our|my|their) sins\b/i,/\bpardon (?:our|my|their) sins\b/i])
 })
]);
export function catenaRelatedTopic(query){
 if(typeof query!=="string"||query.length>240)return null;
 return CATENA_RELATED_TOPICS.find(topic=>topic.query.test(query))||null;
}
export function catenaTopicEvidence(topic,sourceText){
 if(!topic||!CATENA_RELATED_TOPICS.includes(topic)||typeof sourceText!=="string")return null;
 for(const regex of topic.evidence){
  const matched=regex.exec(sourceText);
  if(matched)return Object.freeze({topicId:topic.id,label:topic.label,
    // Evidence phrases are verbatim source spans, never generated commentary.
    sourcePhrase:matched[0],status:"RELATED_SOURCE_WORDING_NOT_AN_ANSWER"});
 }
 return null;
}
export function retrieveCatenaRelatedMessages(rows,query,{limit=3,excludeIds=null,father=null}={}){
 const topic=catenaRelatedTopic(query);
 if(!topic||!Array.isArray(rows))return [];
 const hits=[];
 for(const r of rows){
  if(!r||typeof r.text!=="string"||typeof r.father!=="string")continue;
  if(father&&r.father!==father)continue;
  const evidence=catenaTopicEvidence(topic,r.text);
  if(evidence)hits.push(Object.freeze({row:r,evidence}));
 }
 hits.sort((a,b)=>
  Number(Boolean(excludeIds?.has?.(a.row.id)))-Number(Boolean(excludeIds?.has?.(b.row.id)))||
  b.evidence.sourcePhrase.length-a.evidence.sourcePhrase.length);
 const found=[],seenAuthors=new Set(),cap=Math.min(5,Math.max(1,limit));
 for(const hit of hits)if(found.length<cap&&!seenAuthors.has(hit.row.father)){
  seenAuthors.add(hit.row.father);found.push(hit);
 }
 for(const hit of hits)if(found.length<cap&&!found.includes(hit))found.push(hit);
 return found;
}
