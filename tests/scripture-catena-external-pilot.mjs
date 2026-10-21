import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const pilot=JSON.parse(readFileSync(new URL("../data/scripture/catena/research/external-pilot-40-pericopes.v1.json",import.meta.url),"utf8"));
assert.equal(pilot.schema,"ao.living-catena.external-pilot.v1");
assert.equal(pilot.publicationAllowed,false);
assert.equal(pilot.independentCatholicEditorialReview,false);
assert.equal(pilot.passages.length,40);
assert.equal(pilot.totals.questionCandidates,41);
assert.equal(pilot.totals.externalCandidateLinks,11);
assert.equal(pilot.totals.verifiedHistoricalTopicToVerseLinks,3);

const expectedBooks=["matthew","mark","luke","john"],actualIds=new Set();
const corpus=new Map();
for(const gospel of expectedBooks){
 const source=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+gospel+".json",import.meta.url),"utf8"));
 for(const p of source.pericopes)corpus.set(p.id,p);
 assert.equal(pilot.passages.filter(p=>p.book===gospel).length,10);
}
let sourceChecked=0,topicLinks=0;
for(const item of pilot.passages){
 assert.ok(!actualIds.has(item.pericopeId),"Duplicate passage");
 actualIds.add(item.pericopeId);
 assert.ok(item.pericopeId.startsWith("catena."+item.book+"."));
 assert.equal(item.subjectStatus,"editorial_candidate_not_external_taxonomy");
 const original=corpus.get(item.pericopeId);
 assert.ok(original,"Original pericope absent: "+item.pericopeId);
 const match=/^([A-Za-z]+) (\d+):(\d+)$/.exec(item.focusReference);
 assert.ok(match,"Invalid focus reference: "+item.focusReference);
 assert.equal(match[1].toLowerCase(),item.book);
 assert.ok(original.verse_keys.includes(item.book+"/"+match[2]+"/"+match[3]),
  "Verse focus not present in original: "+item.pericopeId);
 for(const q of item.questions){
  assert.equal(q.origin,"previous_ad_orientem_editorial_fixture");
  assert.ok(q.question.length>10&&q.originalSegment.ordinal>=1);
  const segment=original.segments[q.originalSegment.ordinal-1];
  assert.ok(segment,"Original ordinal absent: "+item.pericopeId);
  assert.equal(segment.father,q.originalSegment.fatherAsInCatena,
   "Father attribution drift: "+item.pericopeId);
  assert.ok(segment.text.includes(q.originalSegment.verbatimEvidencePhrase),
   "Original literal evidence drift: "+item.pericopeId);
  assert.ok(q.status.includes("relevance_not_certified"));
  sourceChecked++;
 }
 for(const link of item.externalCandidateLinks){
  if(link.kind==="historical_topic_to_verse"){
   topicLinks++;
   assert.equal(link.relationship,"external_topic_to_verse_verified__no_Father_answer_link_approved");
   assert.ok(link.sourceRecordUrl.startsWith("https://github.com/neuu-org/bible-topics-dataset/"));
   assert.ok(original.verse_keys.includes(item.book+"/"+link.matchedVerse.split(" ")[1].replace(":","/")));
  }else if(link.kind==="catholic_catechism_question"){
   assert.equal(link.isFatherQuotation,false);
   assert.ok(link.sourceItemId&&link.originalQuestion);
   assert.ok(link.relationship==="topic_candidate_unreviewed_against_patristic_segment");
  }else if(link.kind==="parallel_patristic_witness"){
   assert.ok(link.relationship.includes("not_collated"));
  }else throw Error("Unknown candidate kind "+link.kind);
 }
}
assert.equal(sourceChecked,41);
assert.equal(topicLinks,3);
console.log("PASS Living Catena external research pilot: 40 unique verified source pericopes (10 each Gospel), 41 verbatim source references, three independently sampled topic-to-verse links; zero approved external Father answers");
