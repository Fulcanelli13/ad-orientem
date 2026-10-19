import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const evidence=load("data/learn/research/pius-x-proof-of-answerability-12case-20261019.v1.json");
const pilot=load("data/learn/research/pius-x-ten-conversation-content-pilot-20261019.v1.json");
assert.equal(pilot.schema,"AO_PIUS_X_CONTENT_OWNED_TEN_CONVERSATION_PILOT_V1");
assert.equal(pilot.status,"SOURCE_FIRST_VOICE_EDIT_V2_PILOT_UNAPPROVED");
assert.equal(pilot.totals.topics,10);
assert.equal(pilot.totals.localizedResponseDrafts,60);
assert.equal(pilot.totals.approvedAnswers,0);
assert.equal(pilot.totals.avatarConversationTurns,23);
assert.equal(pilot.totals.outOfCharacterEditorialNotes,7);
assert.equal(pilot.totals.bilingualAvatarResponseDrafts,46);
assert.equal(pilot.totals.bilingualEditorialNoteDrafts,14);
assert.equal(pilot.totals.independentHistoricalCertifications,0);
assert.equal(pilot.voiceReviewState.editedCharacterTurns,23);
assert.equal(pilot.voiceReviewState.editorialNotesExcluded,7);
assert.equal(pilot.voiceReviewState.authenticSpeechCertified,false);
assert.equal(pilot.voiceReviewState.englishApproved,false);
assert.equal(pilot.voiceReviewState.frenchApproved,false);
const originalAudit=load("data/learn/research/pius-x-ten-conversation-primary-text-audit-20261019.v1.json");
assert.equal(originalAudit.schema,"AO_PIUS_X_TEN_PILOT_PRELIMINARY_ORIGINAL_TEXT_CLAIM_AUDIT_V1");
assert.equal(originalAudit.records.length,30);
assert.equal(originalAudit.counts.independentlyApprovedByTheologian,0);
const audits=new Map(originalAudit.records.map(x=>[x.turnId,x]));
assert.equal(pilot.totals.reviewedInApp,0);
assert.equal(pilot.episodes.length,10);
assert.deepEqual(Object.values(pilot.globalReleaseGates).every(x=>x===false),true);
const sourceIndex=new Map(evidence.records.map(x=>[x.case_id,x])),ids=new Set();
const approvedSprites=new Set(["neutral","welcoming","explaining","thoughtful","grave"]);
const permittedSources=new Set(evidence.records.filter(x=>x.screen_disposition==="PASS_CONSTRAINED").map(x=>x.case_id));
for(const e of pilot.episodes){
 assert.ok(permittedSources.has(e.caseId),"Unsafe source disposition "+e.caseId);
 assert.ok(!ids.has(e.id),"Duplicate episode");
 ids.add(e.id);
 const original=sourceIndex.get(e.caseId),ref=original.source_evidence[0];
 assert.equal(e.caseId,e.id);
 assert.equal(e.sourceUrl,ref.url);
 assert.equal(e.sourceScope,ref.section_or_question);
 assert.equal(e.sourceAttribution,ref.witness_type);
 assert.equal(e.prohibitedInference,original.prohibited_inference_or_discipline);
 assert.equal(e.historicalWitnessVerifiedInLinkedOnlineCopy,true);
 assert.ok(approvedSprites.has(e.spriteSuggestion));
 assert.equal(e.theologicalReview,"PENDING_INDEPENDENT_HUMAN");
 assert.equal(e.voiceOwnerReview,"PR_1419_STYLE_ONLY_UNREVIEWED");
 assert.equal(e.publishable,false);
 assert.equal(e.renderedByApp,false);
 assert.equal(e.turns.length,3);
 assert.deepEqual(e.turns.map(x=>x.intent),["opening","source_followup","misconception_correction"]);
 for(let i=0;i<e.turns.length;i++){
  const t=e.turns[i];
  assert.equal(t.id,e.id+"-T"+(i+1));
  assert.equal(t.sourceRef,e.id);
  if(t.id==="SPX-PILOT-04-T2")
   assert.equal(t.citationLabel,"Salzano manuscript Q508 (not Q506)");
  else assert.equal(t.citationLabel,e.sourceScope);
  assert.equal(t.editorialApproval,false);
  assert.equal(t.visitorRelease,false);
  assert.equal(t.sourceCheckedForSubstantiveClaims,false);
  assert.equal(t.unsupportedNewPastoralAdviceAllowed,false);
  const audit=audits.get(t.id);
  assert.ok(audit,"Missing sourced proposition-level assessment: "+t.id);
  assert.equal(audit.sourceRef,e.id);
  assert.equal(audit.sourceDocumentUrl,e.sourceUrl);
  assert.equal(audit.sourceWitnessClass,e.sourceAttribution);
  assert.equal(audit.independentTheologicalApproval,false);
  assert.equal(audit.responseLanguageCheck,"EN_AND_FR_SAME_SUBSTANTIVE_POSITION_PRELIMINARILY_COMPARED");
  assert.ok(audit.sourceSupportedPropositions.length>=1);
  if(t.id==="SPX-PILOT-04-T2"){
   assert.match(audit.sourceLocus,/Q508/);
   assert.match(t.language.en.visitor,/rest of Communion day/);
   assert.match(t.language.fr.response,/oisiveté/);
  }
  const isEditorial=audit.assessment.startsWith("EDITORIAL");
  assert.equal(t.avatarLineAllowed,!isEditorial);
  assert.equal(t.speaker,isEditorial?"DOCUMENTARY_EDITORIAL_NOTE_NOT_PIUS_X":"PIUS_X_EDUCATIONAL_RECONSTRUCTION");
  assert.equal(t.editorialDisplaySurface,isEditorial?
     "OUT_OF_CHARACTER_SOURCE_NOTE":"PIUS_X_SOURCE_BOUNDED_DIALOGUE");
  assert.equal(t.quotationLevel,isEditorial?"C_EDITORIAL_SOURCE_BOUNDARY_NOT_CHARACTER_SPEECH":
    "B_SOURCE_BOUNDED_PARAPHRASE_WITH_C_CONNECTIVE_NOT_AUTHENTIC_SPEECH");
  assert.equal(t.sourceLanguageTranslationApproval,false);
  assert.equal(t.periodVoiceApproval,false);
  assert.equal(t.voiceEditReview,
    isEditorial?"EDITORIAL_NOTE_EXCLUDED_FROM_CHARACTER_VOICE":"SOURCE_FIRST_PERIOD_REGISTER_DRAFT_UNAPPROVED");
  assert.equal(t.continuationOf,i===0?null:e.id+"-T1");
  for(const lang of ["en","fr"]){
   assert.ok(t.language[lang].visitor.length>=20,"Question too short "+t.id);
   assert.ok(t.language[lang].response.length>=55,"Reply lacks substantive content "+t.id);
   assert.ok(!/[”“]/.test(t.language[lang].response),"Possible unattributed historical quotation "+t.id);
  }
 }
}
for(const gap of ["SPX-PILOT-11","SPX-PILOT-12"]){
 assert.equal(pilot.episodes.some(x=>x.caseId===gap),false,"Unsourced first-person or individualized diagnosis");
 assert.notEqual(sourceIndex.get(gap).screen_disposition,"PASS_CONSTRAINED");
}
const firstPersonOnly=pilot.episodes.filter(e=>e.turns.some(t=>/\bI\b/.test(t.language.en.response))).map(x=>x.id);
assert.deepEqual(firstPersonOnly,["SPX-PILOT-01"],"First-person biographical claims must be limited to documented E supremi context");
const decree=pilot.episodes.find(e=>e.id==="SPX-PILOT-10");
assert.equal(decree.sourceAttribution,"PAPALLY_APPROVED_DICASTERY_DECREE_REPRINT");
assert.match(decree.turns[0].language.en.response,/beginning of the use of reason/);
assert.match(decree.turns[0].language.fr.response,/commencement de l’usage de raison/);
assert.doesNotMatch(decree.turns[0].language.en.response,/I issued|I wrote|my encyclical/);
assert.doesNotMatch(decree.turns[0].language.fr.response,/j.ai écrit|mon encyclique/);
assert.equal(decree.voiceOwnerReview,"PR_1419_STYLE_ONLY_UNREVIEWED");
console.log("PASS ten Pius X content-owned bilingual conversation drafts, 30 turns/60 localised replies, exact source pointers and zero publication approvals");
