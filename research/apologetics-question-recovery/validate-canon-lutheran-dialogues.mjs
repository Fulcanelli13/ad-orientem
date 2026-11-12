import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>JSON.parse(readFileSync(new URL("./"+name,import.meta.url),"utf8"));
const historical=load("ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json").numbered_question_excerpts.filter(q=>q.bank==="LUT");
const crosswalk=load("CANON_HISTORICAL_452_TOPIC_CONCORDANCE_P1_20261018.v1.json").questions.filter(q=>q.bank==="LUT");
const sources=load("CANON_LUTHERAN_PRIMARY_SOURCE_MANIFEST_20261018.v1.json").sources;
const a=load("CANON_LUTHERAN_DIALOGUES_LUT001_013_20261018.v1.json").questions;
const b=load("CANON_LUTHERAN_DIALOGUES_LUT014_025_20261018.v1.json").questions;
const all=[...a,...b];const old=new Map(historical.map(x=>[x.id,x]));
const canonical=new Map(crosswalk.map(x=>[x.historicalId,x]));
assert.equal(historical.length,25);
assert.equal(crosswalk.length,25);
assert.equal(a.length,13);
assert.equal(b.length,12);
assert.equal(all.length,25);
assert.equal(new Set(all.map(x=>x.id)).size,25);
for(let i=0;i<all.length;i++){
 const q=all[i],id="LUT-"+String(i+1).padStart(3,"0");
 assert.equal(q.id,id);
 assert.equal(q.originalEnglishQuestion,old.get(q.id)?.question);
 assert.deepEqual(q.canonicalOwnerCandidates,canonical.get(q.id)?.canonicalTopicCandidates);
 assert.equal(q.originalQuestionTranscriptCertified,false);
 assert.equal(q.publicationAllowed,false);
 assert.equal(q.claimContextApproved,false);
 assert.equal(q.doctrinalReviewed,false);
 assert.equal(q.frenchNativeApproved,false);
 assert.equal(q.conversationCharacter,"MONSIEUR_LE_CHANOINE");
 assert.equal(q.opposition.status,"EDITORIAL_CHALLENGE_NOT_LITERAL_OPPONENT_QUOTATION");
 for(const s of [q.editorialFrenchQuestion,q.answer.en,q.answer.fr,q.opposition.en,q.opposition.fr,q.reply.en,q.reply.fr])assert.ok(typeof s==="string"&&s.trim().length>25,id+" missing language content");
 assert.equal(q.followupQuestionIds.length,2);
 for(const s of q.followupQuestionIds)assert.ok(old.has(s),id+" invalid followup "+s);
 assert.ok(q.sourcePointerIds.length>0);
 for(const s of q.sourcePointerIds){assert.ok(sources[s],id+" invalid document "+s);assert.match(sources[s].url,/^https:\/\//);}
 assert.ok(q.additionalReview);
}
console.log("PASS: all 25 Lutheran historical IDs preserved, 25 bilingual answers/challenges/responses, 50 valid follow-up links, owner links, evidence pointers, no publication/claim approvals.");
