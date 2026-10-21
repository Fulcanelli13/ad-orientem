import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHybridQuestionRouter,HYBRID_QUESTION_RETRIEVAL_VERSION} from "../src/learn/living-church-hybrid-question-router.js";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";

const read=async(path)=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const catalog=await read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const semantic=await read("data/learn/living-church-symbolic-concepts.v1.json");
const fixture=await read("data/learn/living-church-fresh-question-probes.v1.json");
const legacy=createSharedQuestionRouter(catalog);
const hybrid=createHybridQuestionRouter(catalog,semantic);
assert.equal(hybrid.version,HYBRID_QUESTION_RETRIEVAL_VERSION);
assert.equal(hybrid.status,"RESEARCH_ONLY_NO_EMBEDDINGS");
assert.equal(hybrid.topicCount,197);
assert.equal(hybrid.conceptCount,40);
assert.equal(catalog.policy.canGenerateNewDoctrinalAnswer,false);
assert.equal(catalog.pilotLimits.approvedConversationalAnswers,0);
assert.equal(fixture.cases.length,52);
const topicIds=new Set(catalog.topics.map(t=>t.id));
for(const c of semantic.concepts){
 assert.equal(c.provenance,"EDITORIAL_TOPIC_MATCHING_ONLY");
 for(const id of Object.keys(c.targets))assert.ok(topicIds.has(id),"bad semantic endpoint "+id);
}
for(const input of [
 "why does the priest raise the host",
 "why does the priest wear different colours",
 "tell me about the prayer at the beginning of mass",
 "is it wrong to seek more money for my family",
 "what is the current eucharistic fast",
 "pourquoi parle-t-on du cœur immaculé de marie"
]){
 const orig=legacy.match(input,{language:input.includes("marie")?"fr":"en"});
 const next=hybrid.match(input,{language:input.includes("marie")?"fr":"en"});
 if(orig.kind==="clarify"||orig.reason==="family_livelihood_from_Q85"
   ||orig.reason==="unverified_modern_law"||orig.reason==="immaculate_heart_not_same_as_marian_intercession"){
  assert.equal(next.kind,orig.kind,"Did not preserve explicit safety/ambiguity: "+input);
 }
 assert.equal(next.answerText,null);
}
function assess(engine){
 const tally={correct:0,safeUnresolved:0,wrongSpecific:0,other:0};
 const misses=[];
 for(const c of fixture.cases){
  const res=engine.match(c.question,{language:c.language,currentCharacter:c.character});
  assert.equal(res.answerText,null,"AI answer created");
  assert.notEqual(res.kind,"handoff_context","Silent character transfer");
  if(["offer_handoff","source_navigation"].includes(res.kind)
   &&res.matchEvidence?.basis==="SYMBOLIC_HYBRID_RANKED"){
   assert.equal(res.requiresQuestionConfirmation,true,"Unconfirmed semantic guess");
   assert.equal(res.matchEvidence.usesEmbeddings,false);
   if(res.kind==="offer_handoff"){
    assert.equal(res.requiresAcceptance,true);
    assert.equal(engine.acceptHandoff(res,{accept:true}).kind,"needs_question_confirmation");
    assert.equal(engine.acceptHandoff({...res,requiresQuestionConfirmation:false},{accept:true}).kind,"invalid_handoff");
    assert.equal(engine.acceptHandoff({...res},{accept:true}).kind,"invalid_handoff");

    assert.equal(engine.acceptHandoff(res,{accept:false}).kind,"stay");
   }
  }
  const chosen=res.topicId||null, options=res.options?.map(x=>x.topicId)||[];
  const expected=c.intendedTopic;
  const correct=expected===null?["no_coverage","clarify"].includes(res.kind):
   (chosen===expected||(res.kind==="clarify"&&options.includes(expected)));
  if(correct)tally.correct++;
  else if(res.kind==="no_coverage")tally.safeUnresolved++;
  else if(["source_navigation","offer_handoff"].includes(res.kind))tally.wrongSpecific++;
  else tally.other++;
  if(!correct)misses.push({question:c.question,expected,kind:res.kind,chosen,options:options.slice(0,3),evidence:res.matchEvidence?.basis||null});
 }
 return {tally,misses};
}
const before=assess(legacy),after=assess(hybrid);
console.log("HYBRID_COMPARISON "+JSON.stringify({
 data:"existing 52-question frozen assistant-authored test (not independent user sample)",
 before:before.tally,after:after.tally,notAnAccuracyClaim:true
}));
for(const miss of after.misses)console.log("HYBRID_MISS "+JSON.stringify({...miss,ranked:hybrid.rank(miss.question,{language:fixture.cases.find(c=>c.question===miss.question)?.language||"en"}).slice(0,3).map(x=>({topicId:x.t.id,score:x.score,lex:x.lex,semantic:x.semantic,concepts:x.concepts}))}));
assert.equal(before.tally.correct+before.tally.safeUnresolved+before.tally.wrongSpecific+before.tally.other,52);
assert.equal(after.tally.correct+after.tally.safeUnresolved+after.tally.wrongSpecific+after.tally.other,52);
// No arbitrary publication-quality threshold; results are diagnostic.
for(const [q,lang] of [
 ["what is a thurible","en"],
 ["qu'est-ce que l'encensoir","fr"],
 ["what is the current eucharistic fast","en"],
 ["what is the status of the sspx","en"],
 ["how do i install wifi drivers","en"]
]){
 const out=hybrid.match(q,{language:lang});
 assert.equal(out.answerText,null);
 assert.equal(out.approvedReply||false,false);
 if(out.kind==="offer_handoff")assert.equal(out.requiresAcceptance,true);
}

const exact=hybrid.match("what happens to the bread at mass",{language:"en",currentCharacter:"pius-x"});
assert.equal(exact.kind,"source_navigation");
assert.equal(exact.matchEvidence.basis,"EXACT_VARIANT");
const exactNavigation=hybrid.confirmSourceNavigation(exact);
assert.equal(exactNavigation.kind,"confirmed_source_navigation");
assert.equal(exactNavigation.approvedReply,false);
assert.equal(exactNavigation.answerText,null);
const inferred=fixture.cases.map(c=>hybrid.match(c.question,{
 language:c.language,currentCharacter:c.character
})).find(x=>x.kind==="source_navigation"&&x.requiresQuestionConfirmation===true);
assert.ok(inferred,"Must test at least one inferred navigation");
assert.equal(hybrid.confirmSourceNavigation(inferred).kind,"needs_question_confirmation");
assert.equal(hybrid.confirmSourceNavigation({...inferred,requiresQuestionConfirmation:false}).kind,"invalid_navigation");
assert.equal(hybrid.confirmSourceNavigation({...inferred}).kind,"invalid_navigation");

const confirmed=hybrid.confirmSourceNavigation(inferred,{confirmQuestion:true});
assert.equal(confirmed.kind,"confirmed_source_navigation");
assert.equal(confirmed.topicId,inferred.topicId);
assert.equal(confirmed.answerText,null);
assert.equal(hybrid.confirmSourceNavigation({...inferred,sourceRefs:[]},{confirmQuestion:true}).kind,"invalid_navigation");
assert.equal(hybrid.confirmSourceNavigation({
 ...inferred,topicId:"canon.apologetics_apol_030"
},{confirmQuestion:true}).kind,"invalid_navigation");

console.log("PASS review-only hybrid semantic-proxy validation and nonpublication gates");
