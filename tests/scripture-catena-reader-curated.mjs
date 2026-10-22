import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CATENA_READER_QUESTION_ROWS,CATENA_READER_QUESTION_SCHEMA,curatedCatenaReaderQuestions,curatedCatenaReaderCompanions}
 from "../src/scripture/catena-reader-questions.js";
import {indexCatenaMessages,suggestCatenaQuestions} from "../src/scripture/catena-messenger.js";
assert.equal(CATENA_READER_QUESTION_SCHEMA,"ao.catena.reader-source-questions.v1");
assert.equal(CATENA_READER_QUESTION_ROWS.length,60);
const names=new Set(),pointers=new Set(),covered=new Set();let verifiedPairs=0;
for(const proposal of CATENA_READER_QUESTION_ROWS){
 assert.ok(!names.has(proposal.id)&&!pointers.has(proposal.sourcePointer));
 names.add(proposal.id);pointers.add(proposal.sourcePointer);
 assert.equal(proposal.editorialStatus,"unapproved_reader_navigation_not_standalone_answer");
 assert.ok(!proposal.question.includes("What do the Fathers say about"),
  "These cards must be genuine passage-specific questions, not relabeled word chips");
 assert.ok(proposal.question.length>35);
 const match=/^catena\.(matthew|mark|luke|john)\.(\d+)\.(\d+):(\d+)$/.exec(proposal.sourcePointer);
 assert.ok(match,proposal.sourcePointer);
 const [,gospel,chapter,verse,idx]=match;
 covered.add(gospel);
 const packet=JSON.parse(readFileSync("data/scripture/catena/chunks/"+proposal.sourceChunk+".json","utf8"));
 const section=packet.pericopes.find(p=>p.id==="catena."+gospel+"."+chapter+"."+verse);
 assert.ok(section,"Canonical excerpt missing for "+proposal.id);
 const seg=section.segments[Number(idx)];
 assert.ok(seg);
 assert.equal(seg.father,proposal.father);
 assert.ok(seg.text.includes(proposal.evidence), "Exact source phrase differs: "+proposal.id);
 assert.ok(section.verse_keys.includes(gospel+"/"+chapter+"/"+verse));
 const original=indexCatenaMessages([{id:section.id,citation:section.citation,
  source:{url:section.source_url},segments:section.segments}]);
 const routes=curatedCatenaReaderQuestions(original);
 assert.ok(routes.some(q=>q.sourcePointer===proposal.sourcePointer), "Fail-closed source link invalid: "+proposal.id);
 const route=routes.find(q=>q.sourcePointer===proposal.sourcePointer);
 assert.equal(route.kind,"curated-source-pointer");
 assert.equal(route.question,proposal.question);
 assert.equal(route.sourceEvidence,proposal.evidence);
 assert.equal(route.editorialStatus,proposal.editorialStatus);
 if(proposal.related){
  verifiedPairs++;
  assert.equal(proposal.related.length,1);
  const companions=curatedCatenaReaderCompanions(original,route);
  assert.equal(companions.length,1,"Exact companion source must load with a distinct author: "+proposal.id);
  const rel=proposal.related[0],matched=companions[0];
  assert.equal(matched.id,rel.sourcePointer);
  assert.equal(matched.father,rel.father);
  assert.notEqual(matched.father,proposal.father);
  assert.equal(matched.pericopeId,section.id);
  assert.ok(matched.text.includes(rel.evidence));
  assert.equal(matched.comparisonOf,proposal.sourcePointer);
  assert.equal(matched.comparisonSourceEvidence,rel.evidence);
  const mutilated=indexCatenaMessages([{id:section.id,citation:section.citation,
   source:{url:section.source_url},segments:section.segments.map((s,n)=>
    section.id+":"+n===rel.sourcePointer?{...s,text:"Nonsense replacement"}:s)}]);
  assert.equal(curatedCatenaReaderCompanions(mutilated,route).length,0,
   "Do not infer another Father when his original words change");
  const switched=indexCatenaMessages([{id:section.id,citation:section.citation,
   source:{url:section.source_url},segments:section.segments.map((s,n)=>
    section.id+":"+n===rel.sourcePointer?{...s,father:"Incorrectly attributed"}:s)}]);
  assert.equal(curatedCatenaReaderCompanions(switched,route).length,0,
   "Wrongly attributed alternate Father must not render");
 }
 assert.ok(suggestCatenaQuestions(original).some(x=>x.kind==="curated-source-pointer"),
  "The reader must prioritize curated questions when exact evidence is present");
 const tampered=indexCatenaMessages([{id:section.id,citation:section.citation,
  source:{url:section.source_url},segments:section.segments.map((s,n)=>
   n===Number(idx)?{...s,text:"Falsified excerpt and fabricated interpretation"}:s)}]);
 assert.ok(!curatedCatenaReaderQuestions(tampered).some(q=>q.id===proposal.id),
  "Source-text tampering must withhold the proposed question: "+proposal.id);
 const misattributed=indexCatenaMessages([{id:section.id,citation:section.citation,
  source:{url:section.source_url},segments:section.segments.map((s,n)=>
   n===Number(idx)?{...s,father:"Editorially invented Father"}:s)}]);
 assert.ok(!curatedCatenaReaderQuestions(misattributed).some(q=>q.id===proposal.id),
  "Wrong source owner must suppress question: "+proposal.id);
}
assert.deepEqual([...covered].sort(),["john","luke","mark","matthew"]);
assert.equal(names.size,60);
assert.equal(verifiedPairs,13);
assert.ok(curatedCatenaReaderQuestions([]).length===0);
assert.equal(suggestCatenaQuestions([]).length,0);
console.log("PASS: 60 exact source-pointer questions plus 13 validated distinct Father comparisons, no synthesized speech");
