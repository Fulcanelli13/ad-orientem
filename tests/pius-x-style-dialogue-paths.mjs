import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const load=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
const cases=await load("../data/learn/pius-x-style-dialogue-paths.v1.json");
const voices=await load("../data/learn/pius-x-documentary-voice-style.v1.json");
const pre=await load("../data/learn/pius-x-prepapal-style-batch2.v1.json");
const review=await load("../data/learn/pius-x-unified-documentary-voice-review.v1.json");
const collation=await load("../data/learn/pius-x-original-language-collation.v1.json");
const personalBench=await load("../data/learn/pius-x-personal-voice-benchmark.v1.json");
const personalWit=await load("../data/learn/pius-x-personal-correspondence-evidence.v2.json");
const contrast=await load("../data/learn/pius-x-personal-voice-contrastive-eval.v1.json");
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
   assert.ok(t.reply[lang].trim().length>0,"Missing drafted reply; no arbitrary prose-length minimum");
   assert.ok(!/\[(?:source|quote|TODO|citation)\]/i.test(t.reply[lang]),"No unfilled display placeholders");
  }
  assert.equal(t.requiresOriginalSourceForSubstance===true||t.requiresOriginalSourceForSubstance===false,true);
  if(t.rhetoricalPattern==="SPARSE_SITUATIONAL_WIT"){humour++;assert.equal(t.register,"FAMILIAR");}
 }
}
assert.equal(totalTurns,9);
assert.ok(Number.isInteger(humour),"Humour is tracked, never required by quota");
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
 "PX-STYL-CHILD-CATECHISM-02":[["PX1912-Q342"],["PX1912-Q325","PX1912-Q338"],["PX1912-Q338"]],
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


/** Editorial-source constraints for the stronger nine-turn dialogue.
 * These checks verify provenance and fail-closed publication, not theological
 * accuracy or bilingual translation quality (both remain human review gates).
 */
assert.equal(cases.editorialRevision.version,"SOURCE_BOUNDED_EN_FR_V2");
assert.equal(cases.editorialRevision.status,"EDITORIAL_DRAFT_UNRELEASED");
assert.equal(cases.editorialRevision.sourceAccuracy,"EDITORIAL_REVIEW_REQUIRED_NOT_CERTIFIED");
assert.equal(cases.editorialRevision.deployment,"NOT_EXPORTED_TO_PUBLIC_OR_PRODUCTION_CHARACTER");
assert.equal(cases.editorialRevision.approvals.historicalStyle,false);
assert.equal(cases.editorialRevision.approvals.theological,false);
assert.equal(cases.editorialRevision.approvals.french,false);
assert.equal(cases.editorialRevision.approvals.english,false);
assert.equal(cases.editorialRevision.approvals.runtime,false);
assert.equal(cases.cases.length,3);
assert.ok(cases.editorialRevision.contemporaryDiscipline.includes("midnight Eucharistic fast"));
const externalIds=new Map(cases.editorialEvidenceCatalog.map(x=>[x.id,x]));
assert.equal(externalIds.size,cases.editorialEvidenceCatalog.length,"No duplicate documentary locators");
for(const d of cases.editorialEvidenceCatalog){
 assert.match(d.url,/^https:\/\//);
 assert.ok(d.locator&&d.source);
 if(d.id.startsWith("QUAM-"))
  assert.equal(d.kind,"HISTORICAL_DECREE_ISSUED_UNDER_PIUS_X_NOT_PERSONAL_VERBATIM");
 if(d.kind==="VATICAN_PRIMARY_TEXT")assert.match(d.url,/^https:\/\/www\.vatican\.va\//);
}
const evidenceIndex=new Map(witness.entries.map(q=>["PX1912-Q"+String(q.q).padStart(3,"0"),q]));
const declaredClaims=new Set();
for(const scenario of cases.cases){
 for(const [index,turn] of scenario.turns.entries()){
  const check=turn.sourceBoundReview;
  assert.equal(check.classification,"SOURCE_BOUNDED_C_EDUCATIONAL_RECONSTRUCTION");
  assert.equal(check.claimedHistoricalUtterance,false);
  assert.equal(check.verbatimOriginalSourceText,false);
  assert.equal(check.originalSourceQuoteApproval,false);
  assert.equal(check.claimReviewStatus,"SUBSTANTIVE_EDITORIAL_APPROVAL_PENDING");
  assert.equal(check.languageReviewStatus,"EN_FR_EDITORIAL_APPROVAL_PENDING");
  assert.equal(check.contentSourceOwner,"EXISTING_CATECHISM_AND_PAPAL_DOCUMENT_PIPELINE");
  assert.equal(turn.requiresOriginalSourceForSubstance,true);
  assert.ok(check.claimIds.length>=2,"Every reply must make a meaningful, source-indexed point");
  assert.ok(check.evidenceIds.length>=1);
  for(const claim of check.claimIds){assert.match(claim,/^[A-Z][A-Z0-9-]+$/);declaredClaims.add(claim);}
  for(const id of check.evidenceIds){
   if(id.startsWith("PX1912-"))assert.ok(evidenceIndex.has(id),"Indexed witness missing "+id);
   else assert.ok(externalIds.has(id),"Document source pointer missing "+id);
  }
  for(const language of ["en","fr"]){
   const reply=turn.reply[language];
   assert.ok(reply.trim().length>0,scenario.id+"/"+index+" missing editorial draft");
   assert.ok(!/^(let us (?:consult|turn to)|revenons à (?:l'|l’)?enseignement)/i.test(reply),
     "Do not replace an answer with a redirect to source");
   assert.ok(!/^(?:As Pope Pius X|Comme le pape Pie X) (?:said|a dit)/i.test(reply),
     "Never attribute invented dialogue as a recorded quotation");
  }
 }
}
assert.ok(declaredClaims.size>=18,"Dialogues must cover the claims rather than repeat one filler");
const marian=cases.cases.find(x=>x.id==="PX-STYL-OUR-LADY-01");
assert.match(marian.turns[0].reply.en,/Adoration belongs to God alone/);
assert.match(marian.turns[1].reply.en,/every grace we receive is owed to His merits/);
const childScenario=cases.cases.find(x=>x.id==="PX-STYL-CHILD-CATECHISM-02");
assert.match(childScenario.turns[0].reply.en,/need not have mastered the whole Catechism/);
assert.match(childScenario.turns[2].reply.en,/day of her First Communion/);
assert.equal(childScenario.turns[0].register,"FAMILIAR");
assert.ok(childScenario.turns.some(t=>t.sourceBoundReview.evidenceIds.some(x=>x.startsWith("QUAM-"))));
const authority=cases.cases.find(x=>x.id==="PX-STYL-TEACHING-OBJECTION-03");
assert.match(authority.turns[1].reply.en,/not make every passing remark/);
assert.ok(!authority.turns.some(t=>t.reply.en.includes("all statements by clergy are infallible")));


// The common cross-pipeline contract is documentary REVIEW, never approval.
assert.equal(review.schema,"AO_PIUS_X_UNIFIED_DOCUMENTARY_VOICE_REVIEW_V1");
assert.equal(review.publication,"DRAFT_NOT_RUNTIME");
assert.equal(review.mandatoryGates.minimumReplyCharacters,null);
assert.equal(review.mandatoryGates.requiredHumourCount,null);
assert.equal(review.mandatoryGates.requiredRhetoricalQuestionCount,null);
assert.equal(review.mandatoryGates.manuscriptVoiceCertified,false);
assert.equal(review.mandatoryGates.contentOwnerApproval,false);
assert.equal(review.mandatoryGates.importIntoLivingChurchAllowed,false);
assert.equal(review.sourceBoundary.completeMayorBortoloTranscriptRead,false);
assert.equal(review.sourceBoundary.historicAutographsCollated,false);
const availableSources=new Set([...voices.sourceDocuments.map(x=>x.id),...pre.documentedItems.map(x=>x.id)]);
const featureIds=new Set(review.personalityInvariants.map(x=>x.id));
assert.equal(featureIds.size,review.personalityInvariants.length,"Unique documentary personality rules");
assert.ok(review.personalityInvariants.length>=8);
for(const rule of review.personalityInvariants){
 assert.ok(rule.rule.length>35&&rule.status&&rule.originRefs.length>0,rule.id);
 for(const src of rule.originRefs)assert.ok(availableSources.has(src),"Unregistered documentary source "+src);
}
const knownCases=new Map(cases.cases.map(c=>[c.id,c]));
const reviewed=new Set();
for(const r of review.reviews){
 const scenario=knownCases.get(r.caseId);
 assert.ok(scenario,"Unknown scenario under review "+r.caseId);
 assert.ok(scenario.turns.some(t=>t.no===r.turn),"No reviewed turn "+r.caseId+" #"+r.turn);
 const k=r.caseId+"-"+r.turn;
 assert.ok(!reviewed.has(k),"Duplicate voice assessment: "+k);reviewed.add(k);
 assert.ok(["RETAIN_WITH_LOCAL_EDIT","REVISE_LOCALLY","HOLD_FOR_SOURCE"].includes(r.disposition));
 assert.ok(["GOOD","FAIR","WEAK"].includes(r.rhetoricalFit));
 assert.ok(["LOW","MEDIUM","HIGH"].includes(r.risk));
 assert.ok(r.strength&&r.defect&&r.nextEdit&&r.sourceLimit);
 for(const p of r.documentaryPatterns)assert.ok(featureIds.has(p),"Unknown personality pattern "+p);
}
assert.equal(reviewed.size,cases.cases.reduce((n,c)=>n+c.turns.length,0),
 "Every draft turn must have one explicit documentary/editorial assessment");
assert.equal(review.reviews.filter(r=>r.disposition==="REVISE_LOCALLY").length,4,
 "Track the four localized problems, rather than reauthoring all nine.");
assert.equal(cases.editorialRevision.localVoiceReconciliation.targetedEdits,4);
assert.equal(cases.editorialRevision.localVoiceReconciliation.unchangedTurns,5);
assert.equal(cases.editorialRevision.localVoiceReconciliation.approved,false);
assert.equal(cases.editorialRevision.localVoiceReconciliation.runtimeImportAllowed,false);
const updatedTurns=cases.cases.flatMap(c=>c.turns.filter(t=>t.editorialLocalRevision));
assert.equal(updatedTurns.length,4,"Only 4 turns may be locally revised");
for(const t of updatedTurns){
 assert.equal(t.editorialLocalRevision.status,"TEXT_EDITED_NOT_APPROVED");
 assert.equal(t.editorialLocalRevision.sourceReferencesRetained,true);
 assert.equal(t.editorialLocalRevision.historicalSpeech,false);
 assert.equal(t.editorialLocalRevision.languageReview,"BOTH_DRAFT_UNAPPROVED");
}
assert.doesNotMatch(childScenario.turns[0].reply.en,/keeping her teacher well occupied/i);
assert.doesNotMatch(childScenario.turns[2].reply.en,/lesson learnt only for the day of an examination/);

assert.equal(review.reviews.find(r=>r.caseId==="PX-STYL-CHILD-CATECHISM-02"&&r.turn===1).risk,"HIGH",
 "Do not certify the invented joke from unrelated private correspondence");


// Original-language cross-checks are an editorial audit, not automatic source approval.
assert.equal(collation.schema,"AO_PIUS_X_VOICE_SOURCE_COLLATION_V1");
assert.equal(collation.publication,"DRAFT_NOT_RUNTIME");
assert.equal(collation.editorialApproval.runtimeImportAllowed,false);
assert.equal(collation.editorialApproval.originalItalian1912QuestionAnswersChecked,false);
assert.equal(collation.editorialApproval.latinMarianMeaningChecked,true);
assert.equal(collation.editorialApproval.latinQuamRulesChecked,true);
assert.equal(collation.editorialApproval.italianOnlineMarianWordingSuspicious,true);
assert.equal(collation.editorialApproval.theologicalReviewerSignedOff,false);
assert.equal(collation.editorialApproval.inventedReplyFRApproved,false);
assert.equal(collation.editorialApproval.inventedReplyENApproved,false);
const collationIds=new Set(collation.witnesses.map(w=>w.id));
assert.equal(collationIds.size,collation.witnesses.length);
assert.ok(collationIds.has("ADIEM-LA-1904"));
assert.ok(collationIds.has("ADIEM-IT-1904"));
assert.ok(collationIds.has("ADIEM-FR-1904"));
assert.ok(collationIds.has("QUAM-1910-LA-DH"));
assert.ok(collationIds.has("PIUS1912-IT-LETTER"));
assert.ok(collationIds.has("PX1912-IT-STRUCT"));
assert.ok(collationIds.has("PX1912-IT-SECOND-INDEPENDENT"));
assert.equal(collation.editorialApproval.targetedItalian1912TranscriptionAligned,true);
assert.equal(collation.editorialApproval.italian1912ContemporaneousPrintChecked,false);
assert.equal(collation.targetedItalianTranscription.questions.length,15);
assert.equal(collation.targetedItalianTranscription.claimedContemporaneousPrintedEditionChecked,false);
assert.equal(collation.targetedItalianTranscription.claimOfSartoPrivateSpeech,false);
assert.equal(collation.targetedItalianTranscription.questions.filter(q=>q.doubleWitness).length,10);
const italianSourceIds=new Set(collation.targetedItalianTranscription.questions.map(q=>q.q));
assert.equal(italianSourceIds.size,15);
for(const q of collation.targetedItalianTranscription.questions){
 assert.ok(witness.entries.find(x=>x.q===q.q),"Original Italian sample must be indexed by real QID");
 assert.match(q.p,/^(orazione|credo-chiesa|legge-virtu|sacramento-eucaristia)\.md$/);
 assert.ok(q.anchor.length>=17);
}

const hazards=new Set(collation.criticalDiscrepancies.map(h=>h.id));
for(const id of ["ADIEM-ITALIAN-NEGATION-OMISSION","QUAM-Q342-SCOPE","Q335-OLD-FAST","EARLY_IT_CAT_NOT_COLLATED"]){
 assert.ok(hazards.has(id),"Missing original-language/source-age hazard "+id);
}
const marianNegation=collation.criticalDiscrepancies.find(h=>h.id==="ADIEM-ITALIAN-NEGATION-OMISSION");
assert.equal(marianNegation.releaseGate,"NEVER_DERIVE_CONTRARY_DOCTRINE_FROM_ITALIAN_ONLY");
assert.match(marianNegation.latinText,/abesse profecto plurimum/);
assert.match(marianNegation.frenchText,/Il s'en faut donc grandement/);
assert.match(marianNegation.italianOnlineText,/dobbiamo attribuire/);
const collatedTurns=new Set();
for(const item of collation.turnReviews){
 const scenario=knownCases.get(item.caseId);
 assert.ok(scenario?.turns.some(t=>t.no===item.turn),"Invalid collation turn");
 const key=item.caseId+":"+item.turn;
 assert.ok(!collatedTurns.has(key),"Duplicate source check: "+key);
 collatedTurns.add(key);
 assert.ok(item.sourceVerdict&&item.originalSynthesis&&item.requiredAction);
 for(const w of item.verifiedWitnessIds)assert.ok(collationIds.has(w),"Unknown collated source "+w);
}
assert.equal(collatedTurns.size,9,"Source critical review must cover every reply");
assert.equal(cases.sourceReconciliation.collationReviewPath,"data/learn/pius-x-original-language-collation.v1.json");
assert.match(cases.sourceReconciliation.translationHazard,/Latin negation/);
const communionTurn=cases.cases.find(c=>c.id==="PX-STYL-CHILD-CATECHISM-02").turns[1];
assert.ok(communionTurn.questionCandidates.includes("PX1912-Q325"));
assert.ok(!communionTurn.questionCandidates.includes("PX1912-Q335"));
assert.ok(communionTurn.sourceBoundReview.evidenceIds.includes("PX1912-Q325"));
assert.ok(!communionTurn.sourceBoundReview.evidenceIds.includes("PX1912-Q335"));
assert.equal(communionTurn.sourceBoundReview.sourceCriticalUpdate.contentOwnerApproval,false);


/** Source-anchored Sarto personal voice: validate attribution boundaries, not prose aesthetics. */
assert.equal(personalBench.schema,"AO_PIUS_X_PERSONAL_VOICE_BENCHMARK_V1");
assert.equal(personalBench.publication,"DRAFT_NOT_RUNTIME");
assert.equal(personalBench.runtimeImportAllowed,false);
assert.equal(personalBench.releaseGates.runtimeImportAllowed,false);
assert.equal(personalBench.releaseGates.historicalSourceReview,false);
assert.equal(personalBench.releaseGates.doctrinalReview,false);
assert.equal(personalBench.releaseGates.englishReview,false);
assert.equal(personalBench.releaseGates.frenchReview,false);
assert.equal(personalBench.sources.length,3);
assert.equal(personalBench.patterns.length,3);
assert.equal(personalBench.benchmarks.length,3);
const sourceById=new Map(personalBench.sources.map(x=>[x.id,x]));
assert.equal(sourceById.size,3);
for(const original of personalBench.sources){
 assert.match(original.url,/^https:\/\//);
 assert.ok(original.date&&original.originalLanguage==="it");
 assert.ok(original.limits&&original.attestedSubject);
 assert.match(original.access,/PARTIAL|IMAGES_WITH_EDITIONAL_ENGLISH/);
 assert.ok(!original.access.startsWith("COMPLETE_MANUSCRIPT"),"Do not falsely claim an uncollated full autograph");
}
const patternById=new Map(personalBench.patterns.map(x=>[x.id,x]));
assert.equal(patternById.size,3);
for(const p of personalBench.patterns){
 assert.ok(p.rule&&p.negative&&p.evidenceIds.length>=1);
 for(const evidence of p.evidenceIds)assert.ok(sourceById.has(evidence),"No source for "+p.id);
}
for(const b of personalBench.benchmarks){
 assert.ok(patternById.has(b.patternId));
 assert.equal(b.status,"C_LEVEL_EDUCATIONAL_RECONSTRUCTION_UNAPPROVED");
 assert.equal(b.unsupportedHistoricalFirstPerson,false);
 assert.equal(b.firstPersonRecollectionInvented,false);
 assert.equal(b.approval.historical,false);
 assert.equal(b.approval.doctrinal,false);
 assert.equal(b.approval.english,false);
 assert.equal(b.approval.french,false);
 for(const id of b.sourceIds)assert.ok(sourceById.has(id));
 for(const lang of ["en","fr"]){
  assert.ok(b.visitor[lang]?.trim()&&b.reply[lang]?.trim());
  assert.doesNotMatch(b.reply[lang],/\b(?:I remember|when I was|I once|je me souviens|quand j'étais)\b/i,
   "Cannot invent autobiographical memories");
 }
 assert.ok(b.supportedElements.length&&b.constructedElements.length);
}
assert.match(personalBench.benchmarks[1].reply.en,/May God console you in your grief/);
assert.doesNotMatch(personalBench.benchmarks[2].reply.en,/Why cover it\?/);


/** Expanded personal source controls: documentary excerpts and manual, non-automated voice comparisons. */
assert.equal(personalWit.schema,"AO_PIUS_X_PERSONAL_VOICE_PRIMARY_EXCERPT_BATCH_V2");
assert.equal(personalWit.publication,"RESEARCH_ONLY_NOT_RUNTIME");
assert.equal(personalWit.runtimeImportAllowed,false);
assert.equal(personalWit.witnesses.length,11);
assert.equal(personalWit.approval.originalManuscriptsFullyRead,false);
assert.equal(personalWit.approval.philologicalPeriodItalianCertified,false);
assert.equal(personalWit.approval.runtimeAllowed,false);
const letterMap=new Map(personalWit.witnesses.map(w=>[w.id,w]));
assert.equal(letterMap.size,11,"Every source ID unique");
for(const w of personalWit.witnesses){
 assert.match(w.url,/^https:\/\//);
 assert.ok(w.genre&&w.access&&w.archive&&w.date);
 assert.ok(w.evidence.length>=50);
 assert.ok(w.rule&&w.caution);
 assert.ok(w.locator.length>25);
 assert.ok(!/FULL_AUTOGRAPH_TRANSCRIBED_AND_COLLATION_VERIFIED/.test(w.access));
}
assert.equal(contrast.schema,"AO_PIUS_X_PERSONAL_VOICE_CONTRASTIVE_EVAL_V1");
assert.equal(contrast.publication,"DRAFT_NOT_RUNTIME");
assert.equal(contrast.runtimeImportAllowed,false);
assert.equal(contrast.reviewPolicy.historicalSpeechClaim,false);
assert.equal(contrast.reviewPolicy.noLengthQuota,true);
assert.equal(contrast.reviewPolicy.noHumourQuota,true);
assert.equal(contrast.reviewPolicy.noQuestionQuota,true);
assert.equal(contrast.reviewPolicy.canImportToRuntime,false);
assert.equal(contrast.reviewPolicy.automaticTestOnlyValidatesProvenanceAndGates,true);
// Assert on the actual documented key, not a subjectively assigned "authenticity score".
assert.equal(contrast.cases.length,8);
assert.equal(contrast.aggregate.approvalCount,0);
assert.equal(contrast.aggregate.automaticallyRated,false);
assert.equal(contrast.rubric.length,6);
const seenPersonalPrompts=new Set();
for(const c of contrast.cases){
 assert.ok(c.id&&c.sourceIds.length>=1);
 assert.ok(!seenPersonalPrompts.has(c.id),"Duplicate personal voice test "+c.id); seenPersonalPrompts.add(c.id);
 assert.equal(c.grade,"MANUAL_REVIEW_PENDING");
 for(const k of ["historical","theology","english","french","runtime"])assert.equal(c.approval[k],false);
 for(const id of c.sourceIds)assert.ok(letterMap.has(id),"Nonexistent personal historical witness "+id);
 assert.ok(c.historicalBasis.length>=60);
 assert.ok(c.constructed.length>=30&&c.disallowed.length>=2);
 assert.ok(c.failureContrast.length>=30);
 for(const lang of ["en","fr"]){
  assert.ok(c.visitor[lang].trim()&&c.response[lang].trim());
  assert.ok(!/^In (?:the year|my childhood)/i.test(c.response[lang])||c.id==="PXC-01-MYTH");
 }
}
const legendCase=contrast.cases.find(x=>x.id==="PXC-01-MYTH");
assert.ok(legendCase.sourceIds.includes("PIUS-1908-REFUTE-CHILDHOOD-MYTH"));
assert.match(legendCase.response.en,/ought not to be presented as certain/);
assert.doesNotMatch(legendCase.response.en,/save (?:my|their) parents' money/);
const secretariatCase=contrast.cases.find(x=>x.id==="PXC-07-SECRETARIAT");
assert.ok(secretariatCase.disallowed.some(x=>x.includes("Bressan")));
assert.equal(contrast.aggregate.sourceWitnessesTouched,
 new Set(contrast.cases.flatMap(x=>x.sourceIds)).size);

console.log("PASS Pius X 3 bilingual x 3 exchanges in both languages, source-gated end-to-end scripted playback = 18 interactions, 9 unique style-only replies; pinned route references, original-source gate, approved sprite names, no fabricated quotations or new doctrinal corpus");
