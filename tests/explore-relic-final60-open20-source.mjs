import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const F=read("data/explore/relic-final60-new-subjects.review.v1.json");
const R=read("data/explore/relic-final60-open20-custody-source.review.v1.json");
assert.equal(R.schema,"AO_RELIC_FINAL60_OPEN20_ORIGINAL_SOURCE_REVIEW_V1");
assert.equal(R.status,"SOURCE_RESEARCH_ONLY_NOT_PRODUCTION");
const pending=F.cases.filter(x=>!x.source_url);
assert.equal(pending.length,20,"source review inventory changed: refresh original before republishing");
assert.equal(R.initial_unsourced_cases,pending.length);
assert.equal(R.cases.length,pending.length);
assert.deepEqual(R.cases.map(x=>x.subject_id).sort(),pending.map(x=>x.subject_id).sort());
assert.equal(new Set(R.cases.map(x=>x.subject_id)).size,pending.length);
const original=new Map(pending.map(x=>[x.subject_id,x]));
for(const row of R.cases){
 assert.equal(row.original_case_id,original.get(row.subject_id).case_id);
 assert.equal(row.original_screening,original.get(row.subject_id).screening);
 assert.equal(row.map_action,"NO_NEW_PIN");
 assert.match(row.promotion_gate,/PLACE_ID_REQUIRED/);
 if(row.source_found){
  assert.match(row.source_url,/^https:\/\//);
  assert.ok(row.custody_finding?.length>35);
  assert.ok(row.source_role?.length>5);
  assert.ok(!row.object_authentication.includes("CERTIFIED_BY_APP"));
 }else{
  assert.equal(row.source_url,null);
  assert.equal(row.review_status,"ORIGINAL_CUSTODIAN_SOURCE_STILL_PENDING");
 }
}
assert.equal(R.cases.filter(x=>x.source_found).length,R.research_source_leads);
assert.equal(R.research_source_leads,8);
assert.equal(R.still_without_new_original_sources,12);
assert.match(R.cases.find(x=>x.subject_id==="subject:saint-maximilian-kolbe").custody_finding,/hair and beard clippings|hair and beard|hair\/beard/);
assert.equal(R.cases.find(x=>x.subject_id==="subject:saint-stanislaus-kostka").review_status,"HISTORICAL_BURIAL_ONLY");
assert.ok(R.editorial_rules.some(x=>x.includes("no unverified whole-body")));
console.log("PASS relic final60: 20 historical source gaps, 8 documented leads, 12 held, 0 automatic Places or pins");
