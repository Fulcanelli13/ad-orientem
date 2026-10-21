/*
 * Verify Father-attributed questions against the canonical Catena originals.
 * Research only: passing checks proves text/provenance, NOT authorship or
 * editorial answer relevance. Never constructs or displays a Father reply.
 *
 * Run: node tests/scripture-catena-original-questions.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const seed=load("data/scripture/catena/research/patristic-questions-seed.v1.json");
const pilot=load("data/scripture/catena/research/external-pilot-40-pericopes.v1.json");
assert.equal(seed.schema,"ao.catena.original-questions-seed.v1");
assert.equal(seed.displayPolicy.startsWith("Research-only:"),true);
assert.equal(pilot.state,"research_only_not_approved_app_material");
const allowed=new Set(pilot.passages.map(p=>p.pericopeId));
assert.equal(allowed.size,40,"Pilot must retain forty distinct pericopes");
const corpus=new Map();
for(const gospel of ["matthew","mark","luke","john"]){
 const pack=load("data/scripture/catena/"+gospel+".json");
 for(const p of pack.pericopes){
  assert.ok(!corpus.has(p.id),"Duplicate Catena canonical pericope");
  corpus.set(p.id,p);
 }
}
const seen=new Set(),hitBooks=new Map(),hitPassages=new Set();
for(const row of seed.questions){
 assert.ok(!seen.has(row.id),"Duplicated source question ID: "+row.id);
 seen.add(row.id);
 assert.ok(allowed.has(row.pericopeId),"Outside 40-passage pilot: "+row.id);
 const original=corpus.get(row.pericopeId);
 assert.ok(original,"Absent canonical Catena pericope: "+row.pericopeId);
 const gospel=row.pericopeId.split(".")[1];
 assert.ok(original.verse_keys.every(k=>k.startsWith(gospel+"/")));
 assert.ok(original.source_url?.startsWith("https://www.ecatholic2000.com/"));
 assert.equal(row.sourceFragmentId,row.pericopeId+":"+(row.sourceOrdinal-1),
  "Fragment offset must be original and zero-based");
 const originalSegment=original.segments[row.sourceOrdinal-1];
 assert.ok(originalSegment,"Nonexistent original segment "+row.id);
 assert.equal(originalSegment.father,row.attributionAsInCompilation,
  "Inherited Catena attribution must remain intact: "+row.id);
 assert.ok(row.originalQuestionExact.includes("?"),"Not an original question: "+row.id);
 const qAt=originalSegment.text.indexOf(row.originalQuestionExact);
 const evidenceAt=originalSegment.text.indexOf(row.answerEvidenceExact);
 assert.ok(qAt>=0,"Question isn't exact original English source text: "+row.id);
 assert.ok(evidenceAt>qAt+row.originalQuestionExact.length-1,
  "The claimed answer evidence must follow the question in the same source fragment: "+row.id);
 assert.equal(row.answerLocation,"same_original_attributed_excerpt");
 assert.equal(row.editorialStatus,"candidate_requires_independent_author_attribution_and_context_review");
 assert.equal(row.subjectTagOrigin,"editorial_navigation_not_original_patristic_taxonomy");
 assert.equal(row.foreignAnswersExcluded,true);
 assert.ok(!("generatedFatherReply" in row),"No invented Father speech");
 hitBooks.set(gospel,(hitBooks.get(gospel)||0)+1);
 hitPassages.add(row.pericopeId);
}
assert.ok(seed.questions.length>=27,"Do not silently remove reviewed source candidates");
assert.equal(hitPassages.size,14,
 "Initial 27-question pilot covers exactly 14 unique Gospel pericopes");
for(const gospel of ["matthew","mark","luke","john"])
 assert.ok(hitBooks.get(gospel)>0,"At least one true original-source question per Gospel");
console.log("PASS original patristic questions: "+seed.questions.length+
 " exact Father-attributed questions and subsequent original answer evidence in "+
 hitPassages.size+"/40 unique pilot passages; "+
 [...hitBooks].map(([book,count])=>book+"="+count).join(", ")+
 ". No invented replies; no editorial/publication approval implied.");
