/**
 * Living Church embedding-provider contract (review only).
 *
 * Requires REAL externally supplied bilingual vectors for real-world evaluation.
 * No model, vectors, or user-question transmission is bundled here. A synthetic
 * test index checks plumbing only; it is NOT a semantic quality result.
 */
import {createHybridQuestionRouter} from "./living-church-hybrid-question-router.js";

export const EMBEDDING_CANDIDATE_VERSION="AO_LC_EMBEDDING_PROVIDER_CONTRACT_V1";
const noReply={answerText:null,approvedReply:false};
const serial=t=>JSON.stringify([t.id,t.character,t.coverage,t.sourceRefs,t.questionVariants]);
export function catalogueSignature(catalog){
 if(!Array.isArray(catalog?.topics))throw Error("No indexed topics");
 const full=catalog.topics.map(serial).join("\n");
 // Noncryptographic stale-index detector, NOT an authentication signature.
 let hash=2166136261;
 for(let i=0;i<full.length;i++){
  hash^=full.charCodeAt(i);
  hash=Math.imul(hash,16777619);
 }
 return "catalogue-fnv32-"+(hash>>>0).toString(16).padStart(8,"0");
}
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
function isUnitVector(arr,d){
 if(!Array.isArray(arr)||arr.length!==d||arr.some(x=>typeof x!=="number"||!Number.isFinite(x)))return false;
 const mag=Math.hypot(...arr);
 return mag>=.995&&mag<=1.005;
}
const langs=["en","fr"];
export function createEmbeddingCandidateRouter({catalog,conceptRegistry,index=null,embedQuery=null}){
 const base=createHybridQuestionRouter(catalog,conceptRegistry);
 const byId=new Map(catalog.topics.map(x=>[x.id,x]));
 const issued=new WeakMap();
 let active=false,reason="INDEX_OR_MODEL_MISSING";
 let corpusVectors=null,meta=null;
 if(index!==null||embedQuery!==null){
  if(!index||typeof embedQuery!=="function")throw Error("Embedding requires both a verified index and a query provider");
  if(index.schema!=="AO_LIVING_CHURCH_EMBEDDING_INDEX_V1"||
   !["REVIEW_ONLY_MODEL_VECTORS","SYNTHETIC_TEST_ONLY"].includes(index.status)
   ||index.catalogueSignature!==catalogueSignature(catalog)
   ||!index.model?.id||!index.model?.immutableRevision
   ||!Number.isInteger(index.model.dimensions)||index.model.dimensions<8
   ||index.model.languages?.join(",")!=="en,fr"
   ||index.topicVectors?.length!==catalog.topics.length*2
   ||index.answersIncluded!==false||index.approvedReply!==false
   ||!["on_device","remote","synthetic_test"].includes(index.providerExecution))
   throw Error("Incomplete/stale/nonattributable embedding index");
  if(index.status==="SYNTHETIC_TEST_ONLY"&&index.providerExecution!=="synthetic_test")
   throw Error("Synthetic vectors must identify themselves as test-only");
  if(index.status==="REVIEW_ONLY_MODEL_VECTORS"&&(index.model.dimensions<64||
   index.providerExecution==="synthetic_test"||!index.model.source||!index.model.license))
   throw Error("Actual model metadata and dimensionality required");
  corpusVectors=new Map();
  const expectedIds=new Set(catalog.topics.map(x=>x.id));
  for(const item of index.topicVectors){
   if(!expectedIds.has(item.topicId)||!langs.includes(item.language)
     ||!isUnitVector(item.vector,index.model.dimensions))
     throw Error("Invalid vector or unexpected topic "+item.topicId);
   const key=item.language+":"+item.topicId;
   if(corpusVectors.has(key))throw Error("Duplicated topic/language vector "+key);
   corpusVectors.set(key,item.vector);
  }
  if(corpusVectors.size!==catalog.topics.length*2)throw Error("Missing bilingual vector");
  meta=index;
  active=true;
  reason=null;
 }
 const register=(proposal,original,needs)=>{
  if(!proposal||!["offer_handoff","source_navigation"].includes(proposal.kind))
   return proposal;
  const result=Object.freeze({...proposal,
   answerText:null,approvedReply:false,
   requiresQuestionConfirmation:needs,
   sourceRefs:Object.freeze(proposal.sourceRefs.map(s=>Object.freeze({...s}))),
   matchEvidence:proposal.matchEvidence?Object.freeze({...proposal.matchEvidence}):null});
  issued.set(result,{original,needs});
  return result;
 };
 const fallback=(question,opts,status)=>{
  const r=base.match(question,opts);
  return register({...r,embeddingStatus:status},r,r.requiresQuestionConfirmation===true);
 };
 async function rank(question,{language="en",consentRemoteTransfer=false}={}){
  if(!active)return {kind:"embedding_unavailable",reason,results:[]};
  const lang=language==="fr"?"fr":"en";
  if(meta.providerExecution==="remote"&&consentRemoteTransfer!==true)
   return {kind:"embedding_unavailable",reason:"REMOTE_QUESTION_TRANSFER_CONSENT_REQUIRED",results:[]};
  let received;
  try{received=await embedQuery(question,{language:lang,modelId:meta.model.id,immutableRevision:meta.model.immutableRevision});}
  catch{return {kind:"embedding_unavailable",reason:"EMBEDDING_PROVIDER_ERROR",results:[]};}
  if(received?.modelId!==meta.model.id||received?.immutableRevision!==meta.model.immutableRevision
   ||received?.language!==lang||!isUnitVector(received.vector,meta.model.dimensions))
   return {kind:"embedding_unavailable",reason:"UNVERIFIED_QUERY_EMBEDDING",results:[]};
  const results=catalog.topics.map(t=>({
   topicId:t.id,character:t.character,coverage:t.coverage,
   score:Number(dot(received.vector,corpusVectors.get(lang+":"+t.id)).toFixed(4))
  })).sort((a,b)=>b.score-a.score||a.topicId.localeCompare(b.topicId));
  return {kind:"ranked",modelId:meta.model.id,modelRevision:meta.model.immutableRevision,
   language:lang,results};
 }
 async function match(question,opts={}){
  const prior=base.match(question,opts);
  // Preserve exact authored variants, explicit choices, blocking and clarification.
  if(opts.chosenTopicId||prior.kind==="clarify"||prior.matchEvidence?.basis==="EXACT_VARIANT"
   ||prior.matchEvidence?.basis==="EXPLICIT_REFORMULATION_CHOICE"
   ||prior.matchEvidence?.basis==="CONTEXT_FOLLOW_UP_RULE"
   ||prior.reason==="UNSUPPORTED_PERSONAL_MORAL_APPLICATION"
   ||catalog.blockedPatterns.some(x=>x.id===prior.reason))
   return register({...prior,embeddingStatus:active?"BASELINE_PROTECTED_OR_EXACT":reason},prior,prior.requiresQuestionConfirmation===true);
  const ranked=await rank(question,{language:opts.language,consentRemoteTransfer:opts.consentRemoteTransfer});
  if(ranked.kind!=="ranked")return fallback(question,opts,ranked.reason);
  const [top,runner]=ranked.results;
  const threshold=meta.status==="SYNTHETIC_TEST_ONLY"?.7:.72;
  if(!top||top.score<threshold)
   return {kind:"no_coverage",reason:"EMBEDDING_LOW_SIMILARITY",
    originalQuestion:question,modelId:ranked.modelId,reviewOnly:true,...noReply};
  if(runner&&top.score-runner.score<.10){
   const choices=ranked.results.filter(x=>top.score-x.score<=.105).slice(0,3);
   return {kind:"clarify",reason:"EMBEDDING_AMBIGUOUS",originalQuestion:question,
    language:ranked.language,options:choices.map(x=>{
     const t=byId.get(x.topicId);
     return {topicId:t.id,title:t.title[ranked.language]||t.title.en,
      character:t.character,coverage:t.coverage,
      sourceRefs:t.sourceRefs.map(y=>({...y})),score:x.score,...noReply};
    }),...noReply};
  }
  // Re-enter the canonical resolver. Embedding results cannot mint source refs.
  const verified=base.match(question,{...opts,chosenTopicId:top.topicId});
  if(!["offer_handoff","source_navigation"].includes(verified.kind))
   return {...verified,embeddingStatus:"SOURCE_GAP_UNRESOLVED",...noReply};
  const proposal={...verified,requiresQuestionConfirmation:true,
   matchEvidence:{basis:"EMBEDDING_RANKED",usesEmbeddings:true,
    score:top.score,margin:runner?Number((top.score-runner.score).toFixed(4)):null,
    modelId:ranked.modelId,immutableRevision:ranked.modelRevision},
   embeddingStatus:"REVIEW_ONLY_UNCONFIRMED",...noReply};
  return register(proposal,verified,true);
 }
 function confirmSourceNavigation(proposal,{confirmQuestion=false}={}){
  const record=issued.get(proposal);
  if(!record||proposal.kind!=="source_navigation")
   return {kind:"invalid_navigation",reason:"UNISSUED_EMBEDDING_PROPOSAL",answerText:null};
  if(record.needs&&!confirmQuestion)
   return {kind:"needs_question_confirmation",topicId:proposal.topicId,answerText:null};
  return base.confirmSourceNavigation(record.original,{confirmQuestion:true});
 }
 function acceptHandoff(proposal,{accept=false,confirmQuestion=false,history={}}={}){
  const record=issued.get(proposal);
  if(!record||proposal.kind!=="offer_handoff")
   return {kind:"invalid_handoff",reason:"UNISSUED_EMBEDDING_REFERRAL",answerText:null};
  if(!accept)return {kind:"stay",character:proposal.fromCharacter,answerText:null};
  if(record.needs&&!confirmQuestion)
   return {kind:"needs_question_confirmation",topicId:proposal.topicId,answerText:null};
  return base.acceptHandoff(record.original,{accept:true,confirmQuestion:true,history});
 }
 return Object.freeze({version:EMBEDDING_CANDIDATE_VERSION,
  status:active?(meta.status==="SYNTHETIC_TEST_ONLY"?"SYNTHETIC_TEST_ONLY":"MODEL_VECTORS_REVIEW_ONLY"):
   "EMBEDDINGS_NOT_CONFIGURED",
  topicCount:catalog.topics.length,modelId:meta?.model?.id||null,
  match,rank,confirmSourceNavigation,acceptHandoff});
}
