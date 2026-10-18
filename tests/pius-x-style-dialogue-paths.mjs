import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const load=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
const cases=await load("../data/learn/pius-x-style-dialogue-paths.v1.json");
const voices=await load("../data/learn/pius-x-documentary-voice-style.v1.json");
const pre=await load("../data/learn/pius-x-prepapal-style-batch2.v1.json");
assert.equal(cases.schema,"AO_PIUS_X_STYLE_DIALOGUE_PATHS_V1");
assert.equal(cases.owner,"STYLE_ONLY_REVIEW");
assert.equal(cases.publication,"DRAFT_NOT_RUNTIME");
assert.equal(cases.runtimeImportAllowed,false);
assert.equal(cases.reviewStatus.runtimeWired,false);
assert.equal(cases.reviewStatus.editoriallyApproved,false);
assert.equal(cases.reviewStatus.bilingualEditorialReview,false);
assert.equal(cases.reviewStatus.approvedTopicHandoffs,0);
assert.equal(cases.fidelityPolicy.historicalQuotationsAllowed,false);
assert.equal(cases.fidelityPolicy.allGeneratedDialogue,"C_EDUCATIONAL_RECONSTRUCTION");
assert.equal(cases.fidelityPolicy.reconstructionDisclosed,true);
assert.match(cases.fidelityPolicy.substantiveAnswers,/MUST_RESOLVE_FROM_AUTHORITATIVE_CONTENT_OWNER/);
assert.equal(cases.externalOwners.catechism.originalTextCopied,false);
assert.equal(cases.externalOwners.catechism.questionId,null);
assert.match(cases.externalOwners.scopeLimit,/PX1912-Q322/);
assert.equal(cases.externalOwners.characterScene.existingCharacter,"pius-x");
assert.equal(cases.externalOwners.characterScene.existingNode,"pius");
assert.equal(cases.externalOwners.characterScene.existingAction,"source-catechism");
assert.equal(cases.externalOwners.routeSurvey.blobSha,"af787cb864b6fc60f9df9c85537b1e798da7b400",
 "Route membership is checked against the pinned external PR #1402 blob; reverify on rebase/integration");
const routeContract=new Map([
 ["PX-STYL-OUR-LADY-01",["explore","ideas","learn.catechism"]],
 ["PX-STYL-CHILD-CATECHISM-02",["prepare","first_communion","learn.catechism"]],
 ["PX-STYL-TEACHING-OBJECTION-03",["defend","critic","learn.catechism"]]
]);
const sourceIds=new Set(voices.sourceDocuments.map(x=>x.id));
const historicalIds=new Set(pre.documents.map(x=>x.id));
const availableSprites=new Set(["pius_neutral","pius_welcoming","pius_explaining","pius_thoughtful","pius_grave"]);
const voicesAllowed=new Set(["PASTORAL","CATECHETICAL","FAMILIAR","DOCTRINAL_CORRECTION","SOLEMN"]);
assert.equal(cases.cases.length,3);
assert.equal(cases.reviewStatus.threeExchangeSequences,3);
let totalTurns=0,humour=0;
for(const scenario of cases.cases){
 const r=routeContract.get(scenario.id);
 assert.ok(r,"Unrecognised conversation scenario "+scenario.id);
 assert.deepEqual([scenario.router.objective,scenario.router.branch,scenario.router.requiredTarget],r);
 assert.equal(scenario.openingScene,"pius");
 assert.equal(scenario.testMode,"STYLE_ONLY_SOURCE_SLOT_PENDING");
 assert.equal(scenario.router.exactNativeQuestion,null,"No generic catechism question deep-link was source-authorized");
 assert.equal(scenario.router.sourceStatus,"ROUTE_DECLARED_ONLY");
 assert.ok(scenario.styleSourceIds.length>0);
 for(const sid of scenario.styleSourceIds)assert.ok(sourceIds.has(sid),"Unknown style source "+sid);
 for(const sid of scenario.historicalContextIds)assert.ok(historicalIds.has(sid),"Unknown pre-papal witness "+sid);
 assert.equal(scenario.turns.length,3);
 let previous=0;
 for(const t of scenario.turns){
  totalTurns++;
  assert.equal(t.no,previous+1,"Turn ordering must remain sequential");previous=t.no;
  assert.ok(voicesAllowed.has(t.register),"Unknown rhetorical register");
  assert.ok(availableSprites.has(t.sprite),"Approved sprite only");
  for(const lang of ["en","fr"]){
   assert.ok(t.visitor[lang].length>=20,"Missing visitor prompt");
   assert.ok(t.reply[lang].length>=65,"Reply too short");
   assert.ok(!/\[(?:source|quote|TODO|citation)\]/i.test(t.reply[lang]),"No unfilled display placeholders");
  }
  assert.equal(t.requiresOriginalSourceForSubstance===true||t.requiresOriginalSourceForSubstance===false,true);
  if(t.rhetoricalPattern==="SPARSE_SITUATIONAL_WIT"){humour++;assert.equal(t.register,"FAMILIAR");}
 }
}
assert.equal(totalTurns,9);
assert.equal(humour,1,"One mild joke across nine replies; not a humour quota for production");
assert.equal(cases.reviewStatus.constructedHistoricalQuotations,0);
assert.equal(cases.reviewStatus.publishedTheologicalAnswers,0);
const gates=new Set(cases.negativeGates.filter(x=>x.mustBlock).map(x=>x.case));
for(const id of ["FALSE_DIRECT_QUOTATION","CONSTRUCT_CATECHISM_ANSWER_FROM_STYLE",
 "INVENT_PAPAL_PERSONAL_MEMORY","ASSUME_NATIVE_DEEP_LINK_FROM_SURVEY_ONLY",
 "ENTER_CRISES_OR_APOLOGETICS_HELD_ROUTES",
 "ROUTE_CHILD_STUDY_TO_FIRST_COMMUNION_WITHOUT_FIRST_COMMUNION_CONTEXT"])assert.ok(gates.has(id));
assert.ok(cases.cases[1].router.routeUseLimit.includes("ONLY_WHEN_CHILD_PREPARING"));
const raw=JSON.stringify(cases);
assert.ok(!raw.includes("answerText"),"No duplicate Catechism answers");
assert.ok(!raw.includes("autographVerified"),"Do not falsely certify manuscripts");
console.log("PASS Pius X 3 bilingual x 3 exchanges = 9 style-only replies; pinned route references, original-source gate, approved sprite names, no fabricated quotations or new doctrinal corpus");
