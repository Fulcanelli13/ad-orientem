/**
 * PRIVATE bounded intent routing for four manually checked papal-source pilots.
 * This is not semantic search, a doctrine classifier, or an unbounded source
 * matcher. It never crosses chapters, and unknown wording returns no match.
 */
const canonicalTopics={
 'SPX-PILOT-01':[
  {key:'restoration-in-christ',pattern:/restor|restaur|instaur|in christ|dans le christ/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2'},
  {key:'unworthiness',pattern:/unworth|indignit|weakness|faiblesse|predecessor|predecesseur/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_1'},
  {key:'strength-in-god',pattern:/strength|force de dieu|force.*dieu/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_01.OPEN'},
  {key:'reluctance-to-papacy',pattern:/election|pontificat|papac|papaut|resist|ecarter|charge pontificale/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_01.OPEN'}
 ],
 'SPX-PILOT-09':[
  {key:'clergy-audience',pattern:/clergy|clerg|address|adresse/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_2'},
  {key:'ministry-as-excuse',pattern:/busy|ministry|ministere|pastoral|excuse|pretexte|distract|dispens/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_1'},
  {key:'daily-priestly-meditation',pattern:/meditat|prayer|prier|priest|pretr|daily|quotidien/u,nodeId:'AO.SPX.DIALOGUE.SPX_PILOT_09.OPEN'}
 ],
 'SPX-029':[
  {key:'christian-virtues',pattern:/virtue|vertu/u,nodeId:'SPX.DIALOGUE.SPX-029.F2'},
  {key:'revealed-truth',pattern:/reveal|revele|truth|verite/u,nodeId:'SPX.DIALOGUE.SPX-029.OPEN'},
  {key:'spiritual-corporal-mercy',pattern:/spiritual|spirituel|bodil|corporal|corporel|misericorde|mercy/u,nodeId:'SPX.DIALOGUE.SPX-029.F1'},
  {key:'charity-overview',pattern:/charit|charity/u,nodeId:'SPX.DIALOGUE.SPX-029.OPEN'}
 ],
 'SPX-NEW-012':[
  {key:'episcopal-review',pattern:/facult|suitab|examin|aptit|reprend|resume.*ministr|ministry.*without/u,nodeId:'AO.SPX.DIALOGUE.SPX-NEW-012.FOLLOW_2'},
  {key:'historical-mariavite-return',pattern:/mariavite|association|repent|return|revenir|retour|charit|charity|patern|correction|corriger|pardon|forgiv|supprim/u,nodeId:'AO.SPX.DIALOGUE.SPX-NEW-012.OPEN'}
 ]
};
const normalize=q=>String(q||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');
export function routePilotQuestion(store,input){
 if(!input||!['en','fr'].includes(input.language))
  return {status:'unmatched',reason:'invalid_locale'};
 const chapter=store.chapters.get(input.chapterId);
 const topics=canonicalTopics[input.chapterId];
 if(!chapter||!topics||chapter.partial||chapter.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION')
  return {status:'unmatched',reason:'not_a_curated_primary_source_pilot'};
 const question=String(input.question||'').trim();
 if(question.length<4||question.length>240)return {status:'unmatched',reason:'invalid_question'};
 const normalized=normalize(question);
 // Narrow keyword routing must not misinterpret private-life questions as
 // source-backed simply because they mention election, predecessor or pope.
 // These require evidence outside the bounded original papal extracts.
 const speculativePrivateDetail=/(?:secret|private (?:meeting|conversation|diary)|childhood|birthplace|doctor|dinner|breakfast|what did (?:you|he) eat|(?:predecessor|predecesseur).{0,32}(?:name|nom)|(?:name|nom).{0,32}(?:predecessor|predecesseur)|(?:repas|secret|enfance|medecin|dejeuner|diner|manger))/u;
 if(speculativePrivateDetail.test(normalized))
  return {status:'unmatched',reason:'no_explicit_bounded_intent'};
 // Exact questions from the original P6 source owner remain available even
 // when their ordinary grammar omits our manually chosen topic keyphrases.
 const exact=chapter.nodes.find(n=>normalize(n.q[input.language])===normalized);
 if(exact)return {status:'matched',chapterId:chapter.id,nodeId:exact.id,
  intentKey:'exact_canonical_dialogue_question',
  method:'ORIGINAL_OWNER_QUESTION_EXACT_MATCH'};
 const found=topics.find(x=>x.pattern.test(normalized));
 if(!found)return {status:'unmatched',reason:'no_explicit_bounded_intent'};
 if(!chapter.nodes.some(x=>x.id===found.nodeId))
  throw new Error('Curated route has no original owner node: '+found.nodeId);
 // Caller still runs the regular source-only gate and every canonical or safety
 // preflight; matching is not clearance for an answer.
 return {status:'matched',chapterId:chapter.id,nodeId:found.nodeId,
  intentKey:found.key,method:'FINITE_BILINGUAL_HUMAN_CURATED_SOURCE_ROUTING_NOT_SEMANTIC_CERTIFICATION'};
}
