/**
 * Shared Living Church question interpretation — review-only.
 * Can return topic navigation, clarification, or a proposed character transfer.
 * Never returns an AI-authored historical answer.
 */
import {historicalFocusCandidates,historicalConfirmedContinuation,validateHistoricalFocus} from "./living-church-historical-focus.js";
import {screenPersonalSpiritualVerdict} from "./living-church-personal-verdict-gate.js";
import {scopeLiturgicalQuestion} from "./living-church-liturgical-source-scope.js";
import {piusSourceConceptCandidates,validatePiusSourceConceptRegistry} from "./living-church-pius-x-source-concepts.js";
import {screenContemporaryChurchDiscipline} from "./living-church-contemporary-discipline-scope.js";
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
  relatedTopics:(topic.relatedTopics||[]).map(x=>frozen({...x})),
  approvedReply:false,answerText:null});
}
export function createSharedQuestionRouter(catalog,{historicalPointers=null,sourceConceptRegistry=null}={}){
 if(historicalPointers&&(historicalPointers.schema!=="AO_LIVING_CHURCH_PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"
    ||historicalPointers.status!=="RESEARCH_ONLY_LINKED_HISTORICAL_DOCUMENT_LOCATORS_NOT_APPROVED_REPLIES"
    ||!Array.isArray(historicalPointers.records)))
  throw Error("Unverified historical source-pointer registry");
 const byHistoricalRef=new Map((historicalPointers?.records||[]).map(p=>{
  if(!/^SPX-PILOT-\d{2}$/.test(p.id)||!/^https:\/\//.test(p.originalDocumentUrl)
   ||!p.sourceLocator||p.approvedReply!==false||!p.witnessClassification
   ||p.sourceAttestation!=="PASSAGE_SCREEN_ONLY_NOT_ORIGINAL_FACSIMILE_COLLATED")
   throw Error("Invalid original historical source pointer "+p.id);
  return [p.id,p];
 }));
 if(byHistoricalRef.size!==(historicalPointers?.records.length||0))throw Error("Duplicate historical source pointer");
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
 validateHistoricalFocus(catalog.topics);
 if(sourceConceptRegistry)validatePiusSourceConceptRegistry(sourceConceptRegistry,catalog);
 const byId=new Map(catalog.topics.map(t=>[t.id,t]));
 const historicalDoc=topic=>{
  if(topic.category!=="pius_historical_source_navigation")return null;
  const ref=topic.sourceRefs.find(x=>x.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1");
  const item=ref&&byHistoricalRef.get(ref.ref);
  if(!item)return null;
  return frozen({url:item.originalDocumentUrl,sourceLocator:item.sourceLocator,
    researchSourceId:item.sourceResearchId,witnessClassification:item.witnessClassification,
    sourceRef:item.id,externalDocument:true,approvedReply:false});
 };

 for(const topic of catalog.topics){
  const links=new Set();
  for(const link of topic.relatedTopics||[]){
   if(!byId.has(link.id)||link.id===topic.id||links.has(link.id)
     ||link.publication!=="RELATIONSHIP_RESEARCH_ONLY"||!link.relation)
     throw Error("Unverified topic relationship "+topic.id+" -> "+link.id);
   links.add(link.id);
  }
 }

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
  const originalDocument=historicalDoc(topic);
  // The generic Catechism route is never a substitute for an original document.
  if(topic.category==="pius_historical_source_navigation"&&!originalDocument)
   return frozen({kind:"no_coverage",reason:"HISTORICAL_SOURCE_POINTER_NOT_RESOLVED",
    topicId:topic.id,originalQuestion:opts.originalQuestion||input,
    approvedReply:false,answerText:null});
  const evidence=opts.matchEvidence||frozen({basis:"NOT_CLASSIFIED",score:null});
  const needsConfirmation=!["EXACT_VARIANT","EXPLICIT_REFORMULATION_CHOICE"].includes(evidence.basis);
  if(topic.coverage==="SOURCE_GAP")
   return frozen({kind:"no_coverage",reason:"TOPIC_SOURCE_GAP",topic:payload,
    topicId:topic.id,originalQuestion:opts.originalQuestion||input,
    sourceGap:topic.sourceGapReason,answerText:null,approvedReply:false});
  const common={topicId:topic.id,language:lang,originalQuestion:opts.originalQuestion||input,
   sourceRefs:payload.sourceRefs,...(originalDocument?{documentNavigation:originalDocument}:{}),
   approvedReply:false,answerText:null,
   matchEvidence:evidence,requiresQuestionConfirmation:needsConfirmation,
   explanation:"Research navigation only. No character answer is authored."};
  if(topic.character===current)
   return frozen({kind:"source_navigation",character:current,
     navigationRoute:originalDocument?"historical.external_document":catalog.owners[current].navigateTo,
     topic:payload,...common});
  const visited=history.visitedCharacters||[current];
  if((history.handoffCount||0)>=catalog.pilotLimits.maxTransfersPerQuestion||visited.includes(topic.character))
   return frozen({kind:"no_coverage",reason:"REFERRAL_LOOP_OR_TRANSFER_LIMIT",topic:payload, ...common});
  return frozen({kind:"offer_handoff",fromCharacter:current,targetCharacter:topic.character,
    targetRoute:originalDocument?"historical.external_document":catalog.owners[topic.character].navigateTo,
    topic:payload,requiresAcceptance:true,
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
  // This must precede caller-specified topic IDs, prior confirmed history,
  // and both lexical/semantic retrieval: none may authorize an individual verdict.
  const personalVerdict=screenPersonalSpiritualVerdict(input,{language:lang});
  if(personalVerdict)return frozen({kind:"no_coverage",
   reason:personalVerdict.reason,scope:personalVerdict.scope,
   sourceGap:personalVerdict.sourceGap,originalQuestion:input,
   approvedReply:false,answerText:null});
  const contemporaryDiscipline=screenContemporaryChurchDiscipline(input,{language:lang});
  if(contemporaryDiscipline)return frozen({kind:"no_coverage",
   reason:contemporaryDiscipline.reason,scope:contemporaryDiscipline.scope,
   sourceGap:contemporaryDiscipline.sourceGap,originalQuestion:input,
   approvedReply:false,answerText:null});
  const fixed={...opts,currentCharacter:current,language:lang};
  // A specific Mass/reception question cannot be claimed by an unrelated
  // clergy exhortation, altar object, or general Eucharistic definition.
  const liturgicalScope=scopeLiturgicalQuestion(input,{language:lang});
  if(liturgicalScope?.kind==="ABSTAIN")return frozen({kind:"no_coverage",
   reason:liturgicalScope.reason,scope:liturgicalScope.scope,
   originalQuestion:input,answerText:null,approvedReply:false});

  for(const rule of blocked)if(phrases(rule.phrases,lang).some(p=>similarity(input,[p])>.91))
    return frozen({kind:"no_coverage",reason:rule.id,sourceGap:rule.reason,originalQuestion:input,
      reference:rule.sourceRef,answerText:null,approvedReply:false});

  // The priest's Postcommunion already belongs to the continuity-certified
  // Mass Guide/Canon topic, not to the Pius X private-thanksgiving source.
  if(liturgicalScope?.kind==="EXISTING_TOPIC_OWNER"){
   const topic=catalog.topics.find(t=>t.id===liturgicalScope.topicId);
   if(!topic||topic.character!=="canon"||topic.coverage!=="SOURCE_NAVIGATION_ONLY"
     ||!topic.sourceRefs.some(r=>r.owner==="MASS_EXPLORER_PUBLISHED_GUIDE"))
    return frozen({kind:"no_coverage",reason:"OFFICIAL_MASS_SOURCE_NOT_VERIFIED",
      originalQuestion:input,approvedReply:false,answerText:null});
   if(opts.chosenTopicId&&opts.chosenTopicId!==topic.id)
    return frozen({kind:"no_coverage",reason:"EXPLICIT_TOPIC_SOURCE_SCOPE_CONFLICT",
      originalQuestion:input,approvedReply:false,answerText:null});
   return resolve(topic,input,{...fixed,matchEvidence:frozen({
    basis:"DOCUMENTARY_LITURGICAL_SCOPE",scope:liturgicalScope.scope,score:null})});
  }
  if(liturgicalScope?.kind==="SOURCE_OWNER"){
   const topic=catalog.topics.find(t=>t.sourceRefs.some(r=>
     r.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"&&r.ref===liturgicalScope.sourceId));
   if(!topic||topic.character!=="pius-x")return frozen({kind:"no_coverage",
    reason:"HISTORICAL_SCOPE_OWNER_NOT_INDEXED",originalQuestion:input,
    approvedReply:false,answerText:null});
   if(opts.chosenTopicId&&opts.chosenTopicId!==topic.id)return frozen({kind:"no_coverage",
    reason:"EXPLICIT_TOPIC_SOURCE_SCOPE_CONFLICT",originalQuestion:input,
    approvedReply:false,answerText:null});
   return resolve(topic,input,{...fixed,matchEvidence:frozen({
    basis:"DOCUMENTARY_LITURGICAL_SCOPE",scope:liturgicalScope.scope,score:null})});
  }
  if(opts.chosenTopicId){
   const chosen=byId.get(opts.chosenTopicId);if(!chosen)throw Error("Unrecognised chosen topic");
   return resolve(chosen,input,{...fixed,matchEvidence:frozen({basis:"EXPLICIT_REFORMULATION_CHOICE",score:1})});
  }
  // Existing topic context can clarify short follow-ups without another dialogue turn.
  if(opts.context?.activeTopicId==="faith.real_presence"&&/\b(blood|sang|under (?:one|either) species|chaque espece)\b/i.test(accents(input)))
   return resolve(byId.get("faith.whole_christ"),input,{...fixed,matchEvidence:frozen({basis:"CONTEXT_FOLLOW_UP_RULE",score:null})});
  for(const rule of catalog.ambiguities){
   if(phrases(rule.phrases,lang).some(p=>similarity(input,[p])>.91))return clarify(rule,input,lang,fixed);
  }
  // Historical source topics require corroborating facets, not generic prayer/sin matches.
  const focused=historicalFocusCandidates(input,catalog.topics,lang);
  if(focused.length===1)return resolve(focused[0],input,{...fixed,
   matchEvidence:frozen({basis:"DOCUMENTARY_ANCHORED",score:null})});
  if(focused.length>1)return frozen({kind:"clarify",reason:"MULTIPLE_DOCUMENTARY_FOCI",
   originalQuestion:input,language:lang,clarification:lang==="fr"?
    "De quelle question historique parlez-vous ?":"Which historical subject did you mean?",
   options:focused.slice(0,catalog.pilotLimits.maxClarifications).map(t=>present(t,lang)),
   answerText:null,approvedReply:false});

  // Only source-owned concepts can nominate the historically exact passage.
  // This cannot run ahead of personal-verdict and liturgical role/moment gates.
  // Multiple plausible historical passages require explicit clarification.
  const conceptHits=piusSourceConceptCandidates(input,sourceConceptRegistry,{language:lang});
  if(conceptHits.length===1){
   const hit=conceptHits[0],topic=byId.get(hit.topicId);
   if(!topic||!topic.sourceRefs.some(r=>r.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"
     &&r.ref===hit.sourceRef))
    return frozen({kind:"no_coverage",reason:"UNVERIFIED_CONCEPT_SOURCE_OWNER",
     originalQuestion:input,approvedReply:false,answerText:null});
   return resolve(topic,input,{...fixed,matchEvidence:frozen({
    basis:"DOCUMENTARY_TWO_FACET_CONCEPT",concept:hit.concept,score:null})});
  }
  if(conceptHits.length>1)return frozen({kind:"clarify",
   reason:"MULTIPLE_VERIFIED_HISTORICAL_CONCEPTS",originalQuestion:input,
   language:lang,clarification:lang==="fr"?
    "À quelle question doctrinale faites-vous référence ?":"Which doctrinal question do you mean?",
   options:conceptHits.slice(0,catalog.pilotLimits.maxClarifications)
     .map(hit=>present(byId.get(hit.topicId),lang)),
   approvedReply:false,answerText:null});
  // A previous *confirmed* topic can license a narrow documentary follow-up.
  // Merely attaching a previous lexical guess may not influence source ownership.
  if(focused.length===0&&opts.context?.confirmedActiveTopicId){
   const previous=byId.get(opts.context.confirmedActiveTopicId);
   if(previous?.character===current&&historicalConfirmedContinuation(input,previous,lang))
    return resolve(previous,input,{...fixed,
     matchEvidence:frozen({basis:"DOCUMENTARY_CONFIRMED_FOLLOWUP",score:null})});
  }
  const candidates=catalog.topics.map(t=>({t,score:similarity(input,phrases(t.questionVariants,lang))}))
   .sort((a,b)=>b.score-a.score);
  const [first,second]=candidates;
  if(!first||first.score<.41)
   return frozen({kind:"no_coverage",reason:"NO_RELEVANT_SOURCE_MATCH",originalQuestion:input,answerText:null,approvedReply:false});
  const literal=phrases(first.t.questionVariants,lang).some(v=>norm(v)===norm(input));
  if((!literal||second?.score===1)&&second?.score>.53&&first.score-second.score<.1){
   const options=candidates.filter(x=>x.score>.53).slice(0,catalog.pilotLimits.maxClarifications).map(x=>present(x.t,lang));
   return frozen({kind:"clarify",reason:"CLOSE_TOPICS",originalQuestion:input,language:lang,
    clarification:lang==="fr"?"Quelle question voulez-vous poser ?":"Which of these questions did you mean?",
    options,answerText:null,approvedReply:false});
  }
  // A historical passage is never inferred from a merely nearby topical
  // question. The two documentary facets above or an exact authored variant
  // are required. This guards against priest/prayer versus lay Mass prayer.
  if(first.t.historicalIntent&&!literal)return frozen({kind:"no_coverage",
   reason:"HISTORICAL_SOURCE_SCOPE_UNCORROBORATED",originalQuestion:input,
   answerText:null,approvedReply:false});
  return resolve(first.t,input,{...fixed,matchEvidence:frozen({
   basis:literal?"EXACT_VARIANT":"LEXICAL_RANKED",
   score:Number(first.score.toFixed(3))})});
 }
 function acceptHandoff(proposal,{accept=false,confirmQuestion=false,history={}}={}){
  const canonical=byId.get(proposal?.topicId);
  if(proposal?.kind!=="offer_handoff"||proposal.requiresAcceptance!==true
   ||!ownerKeys.includes(proposal.targetCharacter)||!canonical
   ||canonical.coverage!=="SOURCE_NAVIGATION_ONLY"
   ||canonical.character!==proposal.targetCharacter
   ||!canonical.sourceRefs.length
   ||proposal.targetRoute!==(canonical.category==="pius_historical_source_navigation"?
    "historical.external_document":catalog.owners[proposal.targetCharacter].navigateTo)
   ||(canonical.category==="pius_historical_source_navigation"&&JSON.stringify(proposal.documentNavigation)!==JSON.stringify(historicalDoc(canonical)))
   ||JSON.stringify(proposal.sourceRefs)!==JSON.stringify(canonical.sourceRefs))
   return frozen({kind:"invalid_handoff",reason:"UNVERIFIED_DESTINATION_OR_FORGED_REFERRAL"});
  if(!accept)return frozen({kind:"stay",character:proposal.fromCharacter,answerText:null});
  if(proposal.requiresQuestionConfirmation===true&&!confirmQuestion)
   return frozen({kind:"needs_question_confirmation",reason:"LEXICAL_MATCH_NOT_CONFIRMED",
    topicId:canonical.id,originalQuestion:proposal.originalQuestion,
    optionLabel:proposal.topic?.title||canonical.title.en,answerText:null});
  const seen=[...new Set([...(history.visitedCharacters||[]),proposal.fromCharacter,proposal.targetCharacter])];
  if((history.handoffCount||0)>=catalog.pilotLimits.maxTransfersPerQuestion
   ||(history.visitedCharacters||[]).includes(proposal.targetCharacter))
   return frozen({kind:"no_coverage",reason:"REFERRAL_LOOP_OR_TRANSFER_LIMIT",answerText:null});
  return frozen({kind:"handoff_context",reviewOnly:true,approvedReply:false,answerText:null,
   originalQuestion:proposal.originalQuestion,language:proposal.language,topicId:proposal.topicId,
   fromCharacter:proposal.fromCharacter,toCharacter:proposal.targetCharacter,
   sourceRefs:proposal.sourceRefs,navigationRoute:proposal.targetRoute,
   ...(proposal.documentNavigation?{documentNavigation:proposal.documentNavigation}:{}),
   history:frozen({visitedCharacters:seen,handoffCount:(history.handoffCount||0)+1})});
 }
 return frozen({version:SHARED_QUESTION_ROUTER_VERSION,status:"RESEARCH_ONLY",
  topicCount:catalog.topics.length,match,acceptHandoff,
  listTopics:({character}={})=>catalog.topics.filter(t=>!character||t.character===character).map(t=>present(t,"en"))});
}
