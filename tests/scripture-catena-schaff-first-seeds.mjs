import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const root="data/scripture/catena/";
const f=root+"research/full-corpus-pass-20261021/";
const corpus=read(f+"schaff-first-full-work-question-seeds.v1.json");
const mark=read(root+"mark.json"),matthew=read(root+"matthew.json");
const existing=new Map([...mark.pericopes,...matthew.pericopes].map(x=>[x.id,x]));
const earlierMark=read(f+"mark-ten-original-work-crosswalk.v1.json");
const earlierMatthew=read(f+"matthew-nine-focused-original-work-signoff.v1.json");
assert.equal(corpus.schema,"ao.catena.schaff-full-work-question-seeds.v1");
assert.equal(corpus.state,"automated_research_only");
assert.equal(corpus.rows.length,14);
assert.equal(corpus.counts.sourcePassages,corpus.rows.length);
assert.equal(corpus.counts.augustine,10);
assert.equal(corpus.counts.chrysostom,4);
assert.equal(corpus.counts.existingCatenaLinked,3);
assert.equal(corpus.counts.criticallyCollated,0);
assert.equal(corpus.counts.humanReviewed,0);
assert.equal(corpus.counts.approvedForPublication,0);
assert.equal(corpus.editionBases.length,2);
const ids=new Set(),q=new Set(),linked=new Set();
const roots={"NPNF1-06":"https://www.ccel.org/ccel/schaff/npnf106.",
"NPNF1-10":"https://www.ccel.org/ccel/schaff/npnf110."};
const origins=new Set(["author_explicit_question","reported_objection_in_homily","editorial_question_from_author_argument"]);
for(const row of corpus.rows){
 assert.match(row.id,/^SCH-(?:AUG|CHR)-0\d\d$/);
 assert.ok(!ids.has(row.id));ids.add(row.id);
 assert.equal(row.father,row.id.startsWith("SCH-AUG-")?"Augustine":"John Chrysostom");
 assert.ok(!q.has(row.editorialQuestion));q.add(row.editorialQuestion);
 assert.ok(row.sourceUrl.startsWith(roots[row.editionId]||"ERR"));
 assert.match(row.sourceUrl,/\.html$/);
 assert.ok(row.workLocus.length>=15&&row.originalWork.length>=15);
 assert.ok(row.scriptureReferences.length>=10);
 assert.ok(row.editorialQuestion.endsWith("?")&&row.editorialQuestion.length>25);
 assert.ok(origins.has(row.questionOrigin));
 assert.ok(row.exactEnglishAnchor.length>=25&&row.exactEnglishAnchor.length<=140);
 assert.ok(row.contextGuard.length>60);
 assert.equal(row.englishBodyWitnessInspected,true);
 assert.equal(row.originalGreekOrLatinCompared,false);
 assert.equal(row.textCriticallyCollated,false);
 assert.equal(row.independentHumanReviewed,false);
 assert.equal(row.publicationEligibility,"blocked_research_only");
 assert.equal(row.fullTextImported,false);
 assert.ok(!Object.hasOwn(row,"generatedFatherAnswer"));
 assert.ok(!Object.hasOwn(row,"assistantParaphrase"));
 assert.ok(!Object.hasOwn(row,"originalWords"));
 if(row.catenaSourcePointer){
  assert.equal(row.overlapState,"linked_existing_catena_excerpt");
  linked.add(row.catenaSourcePointer);
  const [pericope,segment]=row.catenaSourcePointer.split(":");
  assert.ok(existing.has(pericope),"Missing canonical Catena pericope "+pericope);
  const original=existing.get(pericope).segments[Number(segment)];
  assert.ok(original,"No original segment "+row.catenaSourcePointer);
  assert.ok(original.father.includes(row.father==="John Chrysostom"?"Chrysostom":"Augustine"),
   "Source pointer has wrong inherited Father");
  if(row.father==="Augustine")
   assert.ok(earlierMark.rows.some(x=>x.sourcePointer===row.catenaSourcePointer));
  if(row.father==="John Chrysostom")
   assert.ok(earlierMatthew.rows.some(x=>x.sourcePointer===row.catenaSourcePointer));
 }else assert.equal(row.overlapState,"candidate_overlap_unresolved");
}
assert.equal(ids.size,14);
assert.deepEqual(new Set(linked),new Set([
 "catena.mark.15.29:4","catena.mark.16.14:3","catena.matthew.13.1:17"
]));
assert.equal(corpus.rows.filter(x=>x.father==="Augustine").length,10);
assert.equal(corpus.rows.filter(x=>x.father==="John Chrysostom").length,4);
assert.equal(corpus.rows.filter(x=>x.catenaSourcePointer===null).length,11);
console.log("PASS Schaff pilot: 14 actual full-work body anchors across 2 historical NPNF volumes; 3 existing Catena links; 11 unresolved nonduplicated leads; zero generated Father words");
