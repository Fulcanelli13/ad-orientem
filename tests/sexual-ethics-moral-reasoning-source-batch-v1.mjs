import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_CONTEXT_ONLY_POSITION_IDS,paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";

const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-moral-reasoning-source-batch-20261009.v1.json","utf8"));
const expected=["CSE007","CSE008","CSE010","CSE012","CSE013","CSE014","CSE016","CSE018","CSE020","CSE021"];
assert.equal(doc.version,"CSE_MORAL_REASONING_80_STAGE_BATCH_V1");
assert.equal(doc.summary.debates,10);
assert.equal(doc.summary.stages,80);
assert.equal(doc.summary.fully_certified,0);
assert.deepEqual(doc.cases.map(x=>x.id),expected);
let count=0,found={};
for(const rec of doc.cases){
 assert.equal(rec.fully_certified,false);
 assert.deepEqual(rec.stages.map(s=>s.stage),[...CSE_DEBATE_FIELDS]);
 const q=CSE_QUESTION_MAP[rec.id],debate=CSE_DEBATE_MAP[rec.id];assert.ok(q&&debate);
 for(const stage of rec.stages){
  assert.ok(stage.finding_en.length>40,rec.id+"."+stage.stage+" English evidence too short");
  assert.ok(stage.finding_fr.length>40,rec.id+"."+stage.stage+" French evidence too short");
  assert.ok(stage.source_locator_scope.length>30);
  assert.equal(stage.original_full_paragraph_collation_complete,false);
  assert.equal(stage.verbatim_opponent_quote_certified,false);
  assert.equal(stage.independent_theological_and_french_approval,false);
  assert.deepEqual(stage.source_references.map(x=>x.id),paragraphRefsFor(q,"debate",stage.stage).map(x=>x[0]),rec.id+"."+stage.stage+" stage links drift");
  for(const x of stage.source_references)assert.equal(x.canonical_url,CSE_SOURCE_MAP[x.id].canonical_url);
  found[stage.status]=(found[stage.status]||0)+1;count++;
 }
}
assert.equal(count,80);
assert.deepEqual(found,doc.summary.status_counts);
for(const id of ["CSE012","CSE013","CSE014","CSE016","CSE018","CSE020","CSE021"])assert.ok(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),id+" not marked contextual");
assert.match(CSE_DEBATE_MAP.CSE016.response[0],/Donum Veritatis/);
assert.match(CSE_DEBATE_MAP.CSE020.breakpoint[0],/drug addiction cannot establish/);
assert.match(CSE_DEBATE_MAP.CSE021.opposition[0],/Freud/);
console.log("PASS Sexual Ethics: 10 debates x 8 stages, 80 individual EN/FR source-scope findings; original quoted excerpts and contextual positions clearly distinguished; 0 false publication certifications.");
