import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=n=>JSON.parse(readFileSync(new URL("./"+n,import.meta.url),"utf8"));
const pilot=load("CANON_EIGHT_QUESTION_CONVERSATION_PILOT_20261018.v1.json");
const originals=load("ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json").numbered_question_excerpts;
const concordance=load("CANON_HISTORICAL_452_TOPIC_CONCORDANCE_P1_20261018.v1.json").questions;
const historic=new Map(originals.map(q=>[q.id,q]));
const link=new Map(concordance.map(q=>[q.historicalId,q]));
const fixed=["ERR-012","PEN-010","LIT-064","PROT-025","SAN-009","PROT-013","MAR-017","ERR-009"];
assert.deepEqual(pilot.questions.map(q=>q.questionId),fixed);
assert.equal(pilot.sampleSize,8);
assert.equal(new Set(pilot.questions.map(q=>q.questionId)).size,8);
const nonempty=s=>typeof s==="string" && s.trim().length>35;
for(const q of pilot.questions){
 assert.equal(q.originalQuestion,historic.get(q.questionId)?.question);
 assert.equal(q.originalBank,historic.get(q.questionId)?.bank);
 assert.equal(q.conversationCharacter,"MONSIEUR_LE_CHANOINE");
 assert.ok(link.has(q.questionId));
 assert.ok(link.get(q.questionId).canonicalTopicCandidates.includes(q.originalCanonicalOwner)
  ||link.get(q.questionId).otherOwnedModuleCandidates.includes(q.originalCanonicalOwner));
 assert.equal(q.publicationAllowed,false);
 assert.equal(q.canonicalOwnerPermissionGranted,false);
 assert.equal(q.independentTheologicalReview,false);
 assert.equal(q.nativeFrenchApproval,false);
 assert.equal(q.originalExcerptVerified,false);
 assert.ok(q.seriousObjectionAttributionStatus && q.seriousObjectionAttributionStatus.length>20);
 for(const part of ["answer","seriousObjection","reasonedResponse"]){
  assert.ok(nonempty(q[part].en),"missing EN "+q.questionId+" "+part);
  assert.ok(nonempty(q[part].fr),"missing FR "+q.questionId+" "+part);
 }
 assert.equal(q.followups.length,2);
 for(const f of q.followups){
  assert.ok(f.label.en && f.label.fr && f.sourceReviewScope);
 }
 assert.ok(q.sources.length>0);
 for(const s of q.sources){
  assert.ok(s.authority && s.scope && s.witnessKind);
  assert.ok(/^https:\/\//.test(s.url),"bad URL "+q.questionId+" "+s.url);
 }
 if(["PEN-010","LIT-064"].includes(q.questionId))assert.ok(q.unresolvedChecks.length>0);
}
console.log("Canon 8-dialogue contract: identities, original source owners, EN/FR, two followups, external witnesses and all publication gates retained.");
