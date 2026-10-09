import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP,CSE_PUBLIC_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-practical-relationships-source-batch-20261009.v1.json","utf8"));
const expected=["CSE029","CSE031","CSE035","CSE038","CSE039","CSE040","CSE043","CSE044","CSE045","CSE049","CSE050","CSE054","CSE071","CSE074","CSE076"];
assert.equal(doc.summary.debates,15);
assert.equal(doc.summary.stages,120);
assert.equal(doc.summary.fully_certified,0);
assert.deepEqual(doc.cases.map(c=>c.id),expected);
const result={};let stageCount=0;
for(const c of doc.cases){
 assert.equal(c.full_case_certified,false);
 assert.ok(c.case_scope_en.length>75&&c.case_scope_fr.length>75);
 assert.ok(CSE_QUESTION_MAP[c.id]&&CSE_DEBATE_MAP[c.id]);
 assert.ok(CSE_PUBLIC_QUESTION_MAP[c.id],"Public item "+c.id+" must remain visible");
 assert.deepEqual(c.stages.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
 for(const s of c.stages){
  assert.equal(s.whole_stage_original_passage_verified,false);
  assert.equal(s.full_en_fr_certified,false);
  assert.equal(s.independent_french_and_theology_approved,false);
  assert.ok(s.finding_en.length>150&&s.finding_fr.length>150,c.id+"."+s.stage+" bilingual findings");
  assert.deepEqual(s.selected_sources.map(r=>r.id),paragraphRefsFor(CSE_QUESTION_MAP[c.id],"debate",s.stage).map(x=>x[0]),c.id+"."+s.stage+" source chain");
  for(const source of s.selected_sources)assert.equal(source.url,CSE_SOURCE_MAP[source.id].canonical_url);
  result[s.status]=(result[s.status]||0)+1;stageCount++;
 }
}
assert.equal(stageCount,120);
assert.deepEqual(result,doc.summary.category_counts);
assert.match(CSE_DEBATE_MAP.CSE049.catholicCase[0],/can\. 1141/);
assert.match(CSE_DEBATE_MAP.CSE049.response[0],/can\. 1153/);
assert.match(CSE_DEBATE_MAP.CSE050.catholicCase[0],/1142/);
assert.match(CSE_DEBATE_MAP.CSE029.opposition[0],/15 US priests/);
assert.match(CSE_DEBATE_MAP.CSE035.opposition[0],/23%/);
assert.match(CSE_DEBATE_MAP.CSE054.catholicCase[0],/Humanae Vitae/);
assert.match(CSE_DEBATE_MAP.CSE040.opposition[0],/genital sexual acts/);
assert.match(CSE_QUESTION_MAP.CSE049.d[0],/1153/);
assert.match(CSE_QUESTION_MAP.CSE050.a[0],/1085/);
assert.match(CSE_QUESTION_MAP.CSE054.d[0],/1153/);
for(const [id,field] of [["CSE031","catholicCase"],["CSE049","catholicCase"],["CSE049","response"],["CSE054","catholicCase"]])assert.ok(paragraphRefsFor(CSE_QUESTION_MAP[id],"debate",field).some(x=>x[0]==="CIC"),id+"."+field+" missing canonical citation");
console.log("PASS: 15 public debates / 120 bilingual stage source-role findings; canons 1057, 1085, 1141–1153 and clinical/consent distinctions preserved, no false 8-stage certifications.");
