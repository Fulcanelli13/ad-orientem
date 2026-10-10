import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {APP_ROUTE_SURFACES} from "../src/app/contracts.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const audit=load("data/app/guide-coverage-two-function-audit.v1.json");
const nav=load("data/app/content-navigation-registry.v1.json");
assert.equal(audit.schema,"AO_TWO_FUNCTION_GUIDE_SOURCE_AUDIT_V1");
assert.equal(audit.status,"SOURCE_EVIDENCE_ONLY_NOT_PHONE_OR_SOURCE_APPROVAL");
assert.equal(audit.routes.length,63);
assert.equal(audit.counts.routes,nav.routes.length);
assert.deepEqual(audit.routes.map(x=>x.id),nav.routes.map(x=>x.id));
assert.equal(new Set(audit.routes.map(x=>x.id)).size,63);
const validNeeds=new Set(["HUB","BOTH","CONTEXT","ALIAS_OR_RETIRED","GATED_CONTENT"]);
const validStatuses=new Set(["CODE_PRESENT","PARTIAL","GAP_CANDIDATE","NOT_APPLICABLE","PUBLICATION_HOLD","EDITORIAL_PREVIEW_ONLY"]);
for(const item of audit.routes){
 assert.ok(validNeeds.has(item.requirement),item.id+" missing guide requirement");
 assert.ok(validStatuses.has(item.information_status));
 assert.ok(validStatuses.has(item.walkthrough_status));
 assert.equal(item.browser_guide_verified,false,"static source evidence is not a phone check");
 const matched=nav.routes.find(x=>x.id===item.id);
 assert.equal(item.route_status,matched.status);
 if(item.requirement==="BOTH")assert.notEqual(item.walkthrough_status,"NOT_APPLICABLE",item.id);
 if(item.requirement==="CONTEXT")assert.equal(item.walkthrough_status,"NOT_APPLICABLE",item.id);
 if(item.requirement==="GATED_CONTENT"){
  assert.equal(item.information_status,"PUBLICATION_HOLD");
  assert.equal(item.walkthrough_status,"PUBLICATION_HOLD");
 }
 if(item.evidence_file){
  assert.ok(existsSync(item.evidence_file),item.evidence_file+" missing");
  const source=readFileSync(item.evidence_file,"utf8");
  for(const anchor of [item.information_anchor,item.walkthrough_anchor].filter(Boolean))
   assert.ok(source.includes(anchor),item.id+" missing guide evidence "+anchor);
 }
}
const active=audit.routes.filter(x=>!["HUB","ALIAS_OR_RETIRED","GATED_CONTENT"].includes(x.requirement));
const info=active.filter(x=>x.information_status!=="CODE_PRESENT");
const walk=active.filter(x=>x.requirement==="BOTH"&&x.walkthrough_status!=="CODE_PRESENT");
assert.equal(active.length,51);
assert.equal(info.length,29);
assert.equal(walk.length,15);
assert.deepEqual(audit.priority_information_ids,info.map(x=>x.id));
assert.deepEqual(audit.priority_walkthrough_ids,walk.map(x=>x.id));
assert.equal(audit.routes.filter(x=>x.requirement==="GATED_CONTENT").length,2);
for(const id of ["learn.apologetics","learn.church_crisis"]){
 assert.ok(!LEARN_MODULE_IDS.includes(id),"research must not appear in public Formation");
}
for(const id of APP_ROUTE_SURFACES)assert.ok(audit.routes.some(x=>x.id===id));
const mass=audit.routes.find(x=>x.id==="mass");
assert.equal(mass.information_status,"PARTIAL");
assert.match(mass.next_action,/48 native LIVE cards/);
assert.match(mass.next_action,/32 legacy entries/);
console.log("PASS Guide coverage: 63 routes, 51 active, 29 contextual follow-ups, 15 walkthrough follow-ups; no publication");
