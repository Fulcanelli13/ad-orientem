import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP,CSE_PUBLIC_QUESTION_MAP,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_CONTEXT_ONLY_POSITION_IDS,paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const baseline=read("data/learn/sexual-ethics-practical-relationships-source-batch-20261009.v1.json");
const first=read("data/learn/sexual-ethics-practical-original-passages-15-20261009.v1.json");
const second=read("data/learn/sexual-ethics-practical-thirty-passages-20261009.v1.json");
const last=read("data/learn/sexual-ethics-practical-final51-source-roles-20261009.v1.json");
const map=read("data/learn/sexual-ethics-stage-evidence-remaining31.v1.json");
const evidence=read("data/learn/sexual-ethics-certification-evidence.v2.json");
const certification=read("data/learn/sexual-ethics-certification-audit.v1.json");
assert.equal(baseline.summary.debates,15);
assert.equal(baseline.summary.stages,120);
assert.equal(baseline.summary.category_counts.BOUNDED_ORIGINAL_SOURCE_SCOPE_CHECKED,24);
assert.equal(first.records.length,15);
assert.equal(second.records.length,30);
assert.equal(last.records.length,51);
assert.equal(last.summary.preexisting_bounded_passage_scopes,69);
assert.equal(last.summary.new_source_role_adjudications,51);
assert.equal(last.summary.stages_with_explicit_source_role,120);
assert.equal(last.summary.new_original_passage_certifications,0);
assert.equal(last.summary.full_debates_certified,0);
assert.equal(last.summary.independent_french_approvals,0);
assert.equal(last.summary.independent_theological_approvals,0);
assert.equal(last.summary.roles.DOCTRINAL_PASSAGE_OR_GROUNDED_INFERENCE,16);
assert.equal(last.summary.roles.CONTEXTUAL_OR_ILLUSTRATIVE,35);
const used=new Set();
for(const [doc,category] of [[first,"FIRST15"],[second,"SECOND30"],[last,"LAST51"]]){
 for(const x of doc.records){const key=x.id+"."+x.stage;assert.ok(!used.has(key),category+" duplicate "+key);used.add(key);}
}
const historic=new Set();
for(const c of baseline.cases){assert.equal(c.stages.length,8);for(const s of c.stages){const key=c.id+"."+s.stage;if(s.status==="BOUNDED_ORIGINAL_SOURCE_SCOPE_CHECKED")historic.add(key);}}
assert.equal(historic.size,24);
for(const key of used)assert.ok(!historic.has(key),"historical bounded stage counted twice "+key);
assert.equal(used.size,96);
assert.equal(used.size+historic.size,120);
assert.deepEqual([...new Set(last.records.map(x=>x.id))].sort(),baseline.cases.map(x=>x.id).sort());
for(const row of last.records){
 const key=row.id+"."+row.stage;
 const original=baseline.cases.find(x=>x.id===row.id)?.stages.find(x=>x.stage===row.stage);
 assert.ok(original,key+" historic source not found");
 assert.ok(original.selected_sources.some(x=>x.id===row.source_id),key+" changed original stage source");
 assert.equal(row.previous_triage_status,original.status);
 assert.ok(CSE_DEBATE_FIELDS.includes(row.stage));
 assert.ok(CSE_DEBATE_MAP[row.id]?.[row.stage]?.[0]?.length>18 && CSE_DEBATE_MAP[row.id][row.stage][1].length>18);
 assert.ok(CSE_QUESTION_MAP[row.id]&&CSE_PUBLIC_QUESTION_MAP[row.id]);
 assert.equal(CSE_SOURCE_MAP[row.source_id].canonical_url,row.source_url);
 assert.ok(paragraphRefsFor(CSE_QUESTION_MAP[row.id],"debate",row.stage).some(([id])=>id===row.source_id),key+" source not visible to readers");
 assert.ok(row.locator.length>=4);
 assert.ok(row.bounded_support_en.length>=75,key+" vague source support");
 assert.ok(row.limitation_en.length>=75,key+" vague source limit");
 assert.equal(row.source_relationship_adjudicated,true);
 for(const f of ["original_full_passage_collated","complete_original_opponent_work_collated","full_english_stage_certified","independent_french_source_collation","independent_theological_approval","whole_debate_certified"])assert.equal(row[f],false,key+" unsupported approval");
}
const cases=["CSE031","CSE039","CSE040","CSE044","CSE054","CSE074","CSE076"];
for(const id of cases)assert.ok(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),id+" must be visibly labelled contextual");
for(const id of ["CSE043","CSE049","CSE050","CSE071"])assert.ok(!CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),id+" has a real original dissent excerpt");
const v=CSE_QUESTION_MAP.CSE071,actual=paragraphRefsFor(v,"debate","concession");
assert.deepEqual(actual.map(x=>x[0]),["PH"]);
assert.deepEqual(map.cases.CSE071.stage_source_ids.concession,["PH"]);
assert.deepEqual(evidence.cases.find(x=>x.id==="CSE071").stages.find(x=>x.stage==="concession").selected_source_ids,["PH"]);
assert.deepEqual(certification.cases.find(x=>x.id==="CSE071").stage_reviews.find(x=>x.stage==="concession").selected_source_ids,["PH"]);
assert.equal(last.records.find(x=>x.id==="CSE071"&&x.stage==="concession").source_id,"PH");
assert.ok(!last.records.some(x=>["CSE055","CSE056","CSE058"].includes(x.id)),"archive resurfaced");
console.log("PASS 120/120 practical Sexual Ethics stage source roles classified; original passage count stays 69; CSE071 correct and 7 contextual opposition flags. Zero full certification.");
