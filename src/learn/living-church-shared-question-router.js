/**
 * Shared Living Church question interpretation — review-only.
 * Can return topic navigation, clarification, or a proposed character transfer.
 * Never returns an AI-authored historical answer.
 */
export const SHARED_QUESTION_ROUTER_VERSION="AO_LIVING_CHURCH_ROUTER_PILOT_V1";

const accents=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const norm=s=>accents(s).toLocaleLowerCase("en").replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
const STOP=new Set("a an and are as at be but by can do does for from how i in is it of on or our the there to us we what when where who why you your un une de des du le la les l d et est il elle au aux en pour par ce cette que qui quoi comment quel quelle quels quelles ne pas sur dans mon ma mes nos se sa son sont je tu vous nous avec y a t de".split(" "));
const tokens=s=>[...new Set(norm(s).split(" ").filter(t=>t.length>2&&!STOP.has(t)))];
const phrases=(entry,lang)=>entry?.[lang]||entry?.en||[];
const frozen=v=>Object.freeze(v);
const contain=(hay,needle)=>hay===needle||hay.includes(needle)||needle.includes(hay);
const overl=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.length||!B.length)return 0;
 const s=new Set(B),hits=A.filter(t=>s.has(t)).length;
 // Penalise generic overlaps; favour essential subject tokens.
 return .68*hits/Math.max(A.length,B.length)+.32*hits/Math.min(A.length,B.length);
};
function similarity(user,variants){
 const input=norm(user);let best=0;
 for(const raw of variants){const v=norm(raw);
  if(!v)continue;
  if(input===v)return 1;
  if(input.length>14&&v.length>12&&contain(input,v))best=Math.max(best,.88);
  best=Math.max(best,overl(input,v));
 }
 return best;
}
function present(topic,lang){
 return frozen({topicId:topic.id,character:topic.character,title:topic.title[lang]||topic.title.en,
  sourceRefs:topic.sourceRefs.map(x=>frozen({...x})),coverage:topic.coverage,sourceGapReason:topic.sourceGapReason||null,
  approvedReply:false,answerText:null});
}
export function createSharedQuestionRouter(catalog){
 if(catalog?.schema!=="AO_LIVING_CHURCH_SHARED_QUESTION_ROUTING_PILOT_V1"||!Array.isArray(catalog.topics)
  ||catalog.topics.length<10||catalog.policy?.canGenerateNewDoctrinalAnswer!==false
  ||catalog.policy?.canGeneratePastoralConclusion!==false)throw Error("Verified source-only question router registry required");
 const ids=new Set();
 for(const t of catalog.topics){
  if(!t.id||ids.has(t.id)||!catalog.owners[t.character]||!Array.isArray(t.sourceRefs)
  ||t.approvedReply!==false||!["SOURCE_NAVIGATION_ONLY","SOURCE_GAP"].includes(t.coverage)
  ||!t.questionVariants?.en?.length||!t.questionVariants?.fr?.length)
   throw Error("Unsafe question topic "+t.id);
  if(t.coverage==="SOURCE_NAVIGATION_ONLY"&&!t.sourceRefs.length)
   throw Error("Topic falsely claims evidence "+t.id);
  if(t.coverage==="SOURCE_GAP"&&(t.sourceRefs.length||!t.sourceGapReason))
   throw Error("Source gap must not claim a verified passage "+t.id);
  if(t.sourceRefs.some(s=>!s.owner||!s.ref||!s.evidence))throw Error("Unattributed source "+t.id);
  ids.add(t.id);
 }
 const byId=new Map(catalog.topics.map(t=>[t.id,t]));
 for(const rule of catalog.ambiguities){
  for(const id of rule.candidates)if(!byId.has(id))throw Error("Unknown ambiguity option "+id);
 }
 const ownerKeys=Object.keys(catalog.owners);
 const blocked=Object.freeze(catalog.blockedPatterns);
 function resolve(topic,input,opts){
  const current=opts.currentCharacter||"pius-x";
  const lang=opts.language==="fr"?"fr":"en";
  const history=opts.history||{visitedCharacters:[current],handoffCount:0};
  const payload=present(topic,lang);
  if(topic.coverage==="SOURCE_GAP")
   return frozen({kind:"no_coverage",reason:"TOPIC_SOURCE_GAP",topic:payload,
    topicId:topic.id,originalQuestion:opts.originalQuestion||input,
    sourceGap:topic.sourceGapReason,answerText:null,approvedReply:false});
  const common={topicId:topic.id,language:lang,originalQuestion:opts.originalQuestion||input,
   sourceRefs:payload.sourceRefs,approvedReply:false,answerText:null,
   explanation:"Research navigation only. No character answer is authored."};
  if(topic.character===current)
   return frozen({kind:"source_navigation",character:current,navigationRoute:catalog.owners[current].navigateTo,
     topic:payload,...common});
  const visited=history.visitedCharacters||[current];
  if((history.handoffCount||0)>=catalog.pilotLimits.maxTransfersPerQuestion||visited.includes(topic.character))
   return frozen({kind:"no_coverage",reason:"REFERRAL_LOOP_OR_TRANSFER_LIMIT",topic:payload, ...common});
  return frozen({kind:"offer_handoff",fromCharacter:current,targetCharacter:topic.character,
    targetRoute:catalog.owners[topic.character].navigateTo,topic:payload,requiresAcceptance:true,
    transferAction:"REVIEW_ONLY_NOT_EXECUTED", ...common});
 }
 function clarify(rule,input,lang,opts){
  const cand=rule.candidates.map((id,i)=>{
   const t=byId.get(id);
   return frozen({...present(t,lang),
    optionLabel:rule.displayOptions?.[lang]?.[i]||t.title[lang]||t.title.en,
    selected:false});
  });
  return frozen({kind:"clarify",ambiguityId:rule.id,originalQuestion:input,language:lang,
   clarification:rule.intro[lang]||rule.intro.en,options:cand,
   requiresContext:!!rule.needsContext,answerText:null,approvedReply:false,
   context:opts.context||null});
 }
 function match(question,opts={}){
  const input=String(question??"").trim(),lang=opts.language==="fr"?"fr":"en";
  const current=opts.currentCharacter||"pius-x";
  if(!ownerKeys.includes(current))throw Error("Unknown character "+current);
  if(!input)return frozen({kind:"clarify",reason:"EMPTY_QUESTION",clarification:lang==="fr"?"Quelle est votre question ?":"What would you like to ask?",options:[],answerText:null});
  const fixed={...opts,currentCharacter:current,language:lang};
  for(const rule of blocked)if(phrases(rule.phrases,lang).some(p=>similarity(input,[p])>.91))
    return frozen({kind:"no_coverage",reason:rule.id,sourceGap:rule.reason,originalQuestion:input,
      reference:rule.sourceRef,answerText:null,approvedReply:false});
  if(opts.chosenTopicId){
   const chosen=byId.get(opts.chosenTopicId);if(!chosen)throw Error("Unrecognised chosen topic");
   return resolve(chosen,input,fixed);
  }
  // Existing topic context can clarify short follow-ups without another dialogue turn.
  if(opts.context?.activeTopicId==="faith.real_presence"&&/\b(blood|sang|under (?:one|either) species|chaque espece)\b/i.test(accents(input)))
   return resolve(byId.get("faith.whole_christ"),input,fixed);
  for(const rule of catalog.ambiguities){
   if(phrases(rule.phrases,lang).some(p=>similarity(input,[p])>.91))return clarify(rule,input,lang,fixed);
  }
  const candidates=catalog.topics.map(t=>({t,score:similarity(input,phrases(t.questionVariants,lang))}))
   .sort((a,b)=>b.score-a.score);
  const [first,second]=candidates;
  if(!first||first.score<.41)
   return frozen({kind:"no_coverage",reason:"NO_RELEVANT_SOURCE_MATCH",originalQuestion:input,answerText:null,approvedReply:false});
  if(second?.score>.53&&first.score-second.score<.1){
   const options=candidates.filter(x=>x.score>.53).slice(0,catalog.pilotLimits.maxClarifications).map(x=>present(x.t,lang));
   return frozen({kind:"clarify",reason:"CLOSE_TOPICS",originalQuestion:input,language:lang,
    clarification:lang==="fr"?"Quelle question voulez-vous poser ?":"Which of these questions did you mean?",
    options,answerText:null,approvedReply:false});
  }
  return resolve(first.t,input,fixed);
 }
 function acceptHandoff(proposal,{accept=false,history={}}={}){
  const canonical=byId.get(proposal?.topicId);
  if(proposal?.kind!=="offer_handoff"||proposal.requiresAcceptance!==true
   ||!ownerKeys.includes(proposal.targetCharacter)||!canonical
   ||canonical.coverage!=="SOURCE_NAVIGATION_ONLY"
   ||canonical.character!==proposal.targetCharacter
   ||!canonical.sourceRefs.length
   ||proposal.targetRoute!==catalog.owners[proposal.targetCharacter].navigateTo
   ||JSON.stringify(proposal.sourceRefs)!==JSON.stringify(canonical.sourceRefs))
   return frozen({kind:"invalid_handoff",reason:"UNVERIFIED_DESTINATION_OR_FORGED_REFERRAL"});
  if(!accept)return frozen({kind:"stay",character:proposal.fromCharacter,answerText:null});
  const seen=[...new Set([...(history.visitedCharacters||[]),proposal.fromCharacter,proposal.targetCharacter])];
  if((history.handoffCount||0)>=catalog.pilotLimits.maxTransfersPerQuestion
   ||(history.visitedCharacters||[]).includes(proposal.targetCharacter))
   return frozen({kind:"no_coverage",reason:"REFERRAL_LOOP_OR_TRANSFER_LIMIT",answerText:null});
  return frozen({kind:"handoff_context",reviewOnly:true,approvedReply:false,answerText:null,
   originalQuestion:proposal.originalQuestion,language:proposal.language,topicId:proposal.topicId,
   fromCharacter:proposal.fromCharacter,toCharacter:proposal.targetCharacter,
   sourceRefs:proposal.sourceRefs,navigationRoute:proposal.targetRoute,
   history:frozen({visitedCharacters:seen,handoffCount:(history.handoffCount||0)+1})});
 }
 return frozen({version:SHARED_QUESTION_ROUTER_VERSION,status:"RESEARCH_ONLY",
  topicCount:catalog.topics.length,match,acceptHandoff,
  listTopics:({character}={})=>catalog.topics.filter(t=>!character||t.character===character).map(t=>present(t,"en"))});
}
