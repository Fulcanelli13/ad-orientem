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
const historicalIds=new Set(pre.documentedItems.map(x=>x.id));
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

/**
 * An editorial playback driver, NOT a production conversation engine:
 * advance each scripted exchange in both languages, asserting complete
 * turn-to-turn continuity, fail-closed source ownership, and no fourth reply.
 * This never loads the character runtime or emits authentic papal text.
 */
function editorialPlayback(scenario,{lang,preparingForFirstCommunion=false}={}){
 if(scenario.router.branch==="first_communion"&&!preparingForFirstCommunion)
  return {blocked:"FIRST_COMMUNION_CONTEXT_REQUIRED"};
 let cursor=0;
 return {next(input){
  if(cursor>=scenario.turns.length)return {ok:false,reason:"END_OF_SCRIPTED_PREVIEW"};
  const turn=scenario.turns[cursor];
  if(input!==turn.visitor[lang])return {ok:false,reason:"NO_UNSCRIPTED_THEOLOGY"};
  cursor++;
  return {ok:true,turn:cursor,sprite:turn.sprite,register:turn.register,
   reply:turn.reply[lang],historicalQuotation:false,authoritativeAnswer:null,
   sourceGate:turn.requiresOriginalSourceForSubstance?"ORIGINAL_CONTENT_OWNER_PENDING":"STYLE_ONLY_CONNECTIVE"};
 }};
}
for(const scenario of cases.cases){
 for(const lang of ["en","fr"]){
  const player=editorialPlayback(scenario,{lang,preparingForFirstCommunion:true});
  assert.equal(player.next("Unmapped visitor question").reason,"NO_UNSCRIPTED_THEOLOGY");
  for(const turn of scenario.turns){
   const exchange=player.next(turn.visitor[lang]);
   assert.equal(exchange.ok,true);
   assert.equal(exchange.turn,turn.no);
   assert.equal(exchange.reply,turn.reply[lang]);
   assert.equal(exchange.sprite,turn.sprite);
   assert.equal(exchange.authoritativeAnswer,null);
   assert.equal(exchange.historicalQuotation,false);
   if(turn.requiresOriginalSourceForSubstance)
    assert.equal(exchange.sourceGate,"ORIGINAL_CONTENT_OWNER_PENDING");
  }
  assert.equal(player.next("One more question").reason,"END_OF_SCRIPTED_PREVIEW");
 }
}
const child=cases.cases.find(x=>x.router.branch==="first_communion");
assert.equal(editorialPlayback(child,{lang:"en",preparingForFirstCommunion:false}).blocked,
 "FIRST_COMMUNION_CONTEXT_REQUIRED");


/**
 * Source reconciliation: read the EXISTING index in place, do not fork or
 * rewrite its English answers or convert question stems to attributed speech.
 * The Git blob fingerprint protects against silent ref drift.
 */
const {createHash}=await import("node:crypto");
const indexBuffer=await readFile(new URL("../data/learn/ltfaith-pius-x-en-witness-index.v1.json",import.meta.url));
const actualBlob=createHash("sha1").update("blob "+indexBuffer.length+"\0").update(indexBuffer).digest("hex");
const witness=JSON.parse(indexBuffer.toString("utf8"));
assert.equal(actualBlob,cases.sourceReconciliation.indexBlobSha,"Witness must remain pinned; re-review QIDs on change");
assert.equal(witness.version,cases.sourceReconciliation.indexVersion);
assert.equal(witness.entries.length,433);
assert.equal(cases.sourceReconciliation.entryCount,433);
assert.match(cases.sourceReconciliation.evidenceGrade,/NOT_CANONICAL_ANSWER_CERTIFICATION/);
assert.equal(cases.reviewStatus.questionNumbersMatchedInWitnessIndex,true);
assert.equal(cases.reviewStatus.topicSpecificAnswerContentApproved,false);
assert.equal(cases.reviewStatus.topicSpecificNativeHandoffsBrowserVerified,false);
assert.equal(cases.sourceReconciliation.p4SourceBridge.theseThreeDialoguePathsBrowserVerified,false);
assert.equal(cases.sourceReconciliation.p4SourceBridge.nativeRouteIsDraft,true);
const canonicalEntries=new Map(witness.entries.map(q=>["PX1912-Q"+String(q.q).padStart(3,"0"),q]));
const acceptedRefs={
 "PX-STYL-OUR-LADY-01":[["PX1912-Q433","PX1912-Q430"],["PX1912-Q430","PX1912-Q433"],["PX1912-Q431","PX1912-Q432"]],
 "PX-STYL-CHILD-CATECHISM-02":[["PX1912-Q342"],["PX1912-Q335","PX1912-Q338"],["PX1912-Q338"]],
 "PX-STYL-TEACHING-OBJECTION-03":[["PX1912-Q114","PX1912-Q236"],["PX1912-Q115","PX1912-Q236"],["PX1912-Q114","PX1912-Q115"]]
};
for(const scenario of cases.cases){
 const expected=acceptedRefs[scenario.id];
 assert.ok(expected);
 assert.deepEqual(scenario.turns.map(x=>x.questionCandidates),expected,"Crosswalk is curated to each turn, not arbitrary search");
 assert.deepEqual(scenario.router.candidateQuestionRefs,[...new Set(expected.flat())]);
 assert.equal(scenario.router.exactNativeQuestion,null,"Indexed candidate is not an approved native conversation handoff");
 assert.match(scenario.router.sourceIndexReview,/NOT_ANSWER_CONTENT/);
 for(const ref of scenario.router.candidateQuestionRefs){
  const source=canonicalEntries.get(ref);
  assert.ok(source&&source.q_stem.length>=10,ref+" missing in original witness index");
  assert.ok(source.source_file_url.startsWith("https://github.com/"),"Question source reference must be original pinned owner");
 }
}
assert.equal(cases.sourceReconciliation.historicalDisciplineCaution.sourceRef,"PX1912-Q335");
assert.match(cases.sourceReconciliation.historicalDisciplineCaution.runtimeConstraint,/NO_UNQUALIFIED_CURRENT_PRACTICE/);
assert.match(cases.sourceReconciliation.editionLimitation,/NOT a certified historical English/);
assert.ok(!JSON.stringify(cases).includes('"historicalAnswerText"'));

console.log("PASS Pius X 3 bilingual x 3 exchanges in both languages, source-gated end-to-end scripted playback = 18 interactions, 9 unique style-only replies; pinned route references, original-source gate, approved sprite names, no fabricated quotations or new doctrinal corpus");
