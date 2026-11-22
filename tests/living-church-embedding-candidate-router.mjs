import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createEmbeddingCandidateRouter,catalogueSignature} from "../src/learn/living-church-embedding-candidate-router.js";
const read=async p=>JSON.parse(await readFile(new URL("../"+p,import.meta.url),"utf8"));
const catalog=await read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const concepts=await read("data/learn/living-church-symbolic-concepts.v1.json");
const noModel=createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts});
assert.equal(noModel.status,"EMBEDDINGS_NOT_CONFIGURED");
const fallback=await noModel.match("I cannot explain which unrecognised abstract concern this is");
assert.equal(fallback.answerText,null);
assert.equal(fallback.embeddingStatus,"INDEX_OR_MODEL_MISSING");
const topics=catalog.topics.map(x=>x.id),N=topics.length;
assert.equal(N,197);
const basis=(i)=>Array.from({length:N},(_,j)=>i===j?1:0);
const model={id:"test-synthetic-dim-"+N,immutableRevision:"synthetic-fixture-not-real-20261019",
 dimensions:N,languages:["en","fr"]};
const index={schema:"AO_LIVING_CHURCH_EMBEDDING_INDEX_V1",
 status:"SYNTHETIC_TEST_ONLY",catalogueSignature:catalogueSignature(catalog),
 model,providerExecution:"synthetic_test",answersIncluded:false,approvedReply:false,
 topicVectors:topics.flatMap((topicId,i)=>["en","fr"].map(language=>({topicId,language,vector:basis(i)})))};
let queryCount=0;
let emitted=null;
const embedQuery=async(question,{language,modelId,immutableRevision})=>{
 queryCount++;
 const vector=emitted||basis(topics.indexOf("objects.pall"));emitted=null;
 return {language,modelId,immutableRevision,vector};
};
const router=createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts,index,embedQuery});
assert.equal(router.status,"SYNTHETIC_TEST_ONLY");
assert.equal(router.topicCount,197);
assert.equal(router.modelId,model.id);
assert.equal(queryCount,0);
let result=await router.match("What is the square on top of the chalice?",{language:"en"});
// Original exact form may trigger no embedding, and this is permitted.
assert.equal(result.answerText,null);
const q="I have an unprecedented phrasing which cannot be matched lexically";
result=await router.match(q,{currentCharacter:"pius-x"});
assert.equal(result.kind,"offer_handoff");
assert.equal(result.topicId,"objects.pall");
assert.equal(result.requiresQuestionConfirmation,true);
assert.equal(result.matchEvidence.basis,"EMBEDDING_RANKED");
assert.equal(result.matchEvidence.usesEmbeddings,true);
assert.equal(result.matchEvidence.modelId,model.id);
assert.equal(router.acceptHandoff(result,{accept:false}).kind,"stay");
assert.equal(router.acceptHandoff(result,{accept:true}).kind,"needs_question_confirmation");
assert.equal(router.acceptHandoff({...result,requiresQuestionConfirmation:false},{accept:true}).kind,"invalid_handoff");
const confirmed=router.acceptHandoff(result,{accept:true,confirmQuestion:true});
assert.equal(confirmed.kind,"handoff_context");
assert.equal(confirmed.toCharacter,"sacristan");
assert.equal(confirmed.answerText,null);
assert.equal(router.acceptHandoff(result,{accept:true,confirmQuestion:true,history:confirmed.history}).kind,"no_coverage");
const origin=await router.match(q,{currentCharacter:"sacristan"});
assert.equal(origin.kind,"source_navigation");
assert.equal(origin.requiresQuestionConfirmation,true);
assert.equal(router.confirmSourceNavigation(origin).kind,"needs_question_confirmation");
assert.equal(router.confirmSourceNavigation({...origin,requiresQuestionConfirmation:false},{confirmQuestion:true}).kind,"invalid_navigation");
const opened=router.confirmSourceNavigation(origin,{confirmQuestion:true});
assert.equal(opened.kind,"confirmed_source_navigation");
assert.equal(opened.topicId,"objects.pall");
assert.equal(opened.answerText,null);
assert.equal(opened.approvedReply,false);
emitted=basis(topics.indexOf("canon.apologetics_apol_014"));
const held=await router.match(q);
assert.equal(held.kind,"no_coverage");
assert.equal(held.reason,"TOPIC_SOURCE_GAP");
assert.equal(held.answerText,null);
emitted=Array.from({length:N},(_,i)=>i===topics.indexOf("objects.pall")||i===topics.indexOf("objects.chalice")?Math.SQRT1_2:0);
const ambiguous=await router.match(q);
assert.equal(ambiguous.kind,"clarify");
assert.equal(ambiguous.reason,"EMBEDDING_AMBIGUOUS");
assert.equal(ambiguous.options.length,2);
assert.ok(ambiguous.options.every(x=>x.answerText===null));
assert.equal(router.acceptHandoff(ambiguous,{accept:true}).kind,"invalid_handoff");
emitted=Array.from({length:N},()=>1/Math.sqrt(N));
const weak=await router.match(q);
assert.equal(weak.kind,"no_coverage");
assert.equal(weak.reason,"EMBEDDING_LOW_SIMILARITY");
const blocked=await router.match("what is the current eucharistic fast");
assert.equal(blocked.kind,"no_coverage");
assert.equal(blocked.reason,"unverified_modern_law");
const clarify=await router.match("why does the priest raise the host");
assert.equal(clarify.kind,"clarify");
assert.equal(clarify.ambiguityId,"host_raised");
assert.throws(()=>createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts,index:{
 ...index,catalogueSignature:"incorrect"
},embedQuery}),/Incomplete\/stale/);
assert.throws(()=>createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts,index:{
 ...index,topicVectors:index.topicVectors.slice(1)
},embedQuery}),/Incomplete\/stale/);
assert.throws(()=>createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts,index:{
 ...index,topicVectors:index.topicVectors.map((x,i)=>i===0?{...x,vector:[NaN,...x.vector.slice(1)]}:x)
},embedQuery}),/Invalid vector/);
const remoteIndex={...index,status:"REVIEW_ONLY_MODEL_VECTORS",
 model:{...model,id:"mock-remote-model",source:"example.mock",license:"mock-only-do-not-ship"},
 providerExecution:"remote"};
let remoteCalls=0;
const remote=createEmbeddingCandidateRouter({catalog,conceptRegistry:concepts,index:remoteIndex,
 embedQuery:async()=>{remoteCalls++;return null;}});
const refused=await remote.match(q);
assert.equal(refused.embeddingStatus,"REMOTE_QUESTION_TRANSFER_CONSENT_REQUIRED");
assert.equal(remoteCalls,0,"Never send private visitor query remotely without explicit consent");
const withConsent=await remote.match(q,{consentRemoteTransfer:true});
assert.equal(withConsent.embeddingStatus,"UNVERIFIED_QUERY_EMBEDDING");
assert.equal(remoteCalls,1);
assert.throws(()=>createEmbeddingCandidateRouter({
 catalog,conceptRegistry:concepts,index:{...remoteIndex,model:{...remoteIndex.model,dimensions:12}},embedQuery
}),/Actual model metadata and dimensionality required/);
console.log("PASS embedding adapter: 197-topic/2-language synthetic-index plumbing only; no real model, no doctrinal answer, remote consent required");
