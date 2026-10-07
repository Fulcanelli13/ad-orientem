import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const sot=JSON.parse(readFileSync("data/learn/spiritual-life-sot.v1.json","utf8"));
assert.equal(sot.version,"SPIRITUAL_LIFE_SOT_V1");
assert.equal(sot.status,"SOURCE_CONTROLLED_CURRICULUM_BLUEPRINT");
assert.equal(sot.future_route,"learn.spiritual_life");
assert.equal(sot.route_status,"RESERVED_NOT_PUBLISHED");
assert.equal(LEARN_MODULE_IDS.includes("learn.spiritual_life"),false,"Spiritual Life published before content gates were cleared");

assert.equal(sot.sources.length,12);
assert.equal(sot.curriculum.stage_count,14);
assert.equal(sot.curriculum.stages.length,14);
assert.equal(sot.curriculum.claim_count,76);

const sourceIds=new Set(sot.sources.map(x=>x.id));
assert.equal(sourceIds.size,sot.sources.length,"duplicate Spiritual Life source IDs");
for(const source of sot.sources){
  assert.ok(source.id&&source.title&&source.authority_type&&source.role,"incomplete Spiritual Life source record");
  assert.ok(source.canonical_url,"source without canonical URL: "+source.id);
}

const stages=sot.curriculum.stages;
assert.deepEqual(stages.map(x=>x.id),Array.from({length:14},(_,i)=>"SL"+String(i+1).padStart(2,"0")));
assert.deepEqual(stages.map(x=>x.order),Array.from({length:14},(_,i)=>i+1));
const claimIds=stages.flatMap(stage=>stage.claims.map(claim=>claim.id));
assert.equal(claimIds.length,76);
assert.equal(new Set(claimIds).size,76,"duplicate Spiritual Life claim IDs");

for(const stage of stages){
  assert.ok(stage.title?.en&&stage.title?.fr,stage.id+" lost bilingual title");
  assert.ok(stage.objective,stage.id+" lost objective");
  assert.ok(stage.claims.length>=5,stage.id+" is too thin for the frozen curriculum");
  for(const claim of stage.claims){
    assert.ok(claim.text&&claim.layer,claim.id+" is incomplete");
    assert.ok(claim.source_ids.length>0,claim.id+" is unsourced");
    for(const id of claim.source_ids)assert.ok(sourceIds.has(id),claim.id+" has unresolved source "+id);
  }
}

assert.equal(sot.publication_gates.research_complete,true);
assert.equal(sot.publication_gates.all_claims_sourced,true);
assert.equal(sot.publication_gates.english_claim_copy_ready,false);
assert.equal(sot.publication_gates.french_parity_ready,false);
assert.equal(sot.publication_gates.ui_runtime_ready,false);
assert.equal(sot.publication_gates.prayer_owner_handoffs_mapped,false);

const excluded=sot.principles.join(" ").toLowerCase();
for(const phrase of ["advanced mystical phenomena","no gamification","no invented prayers"]){
  assert.ok(excluded.includes(phrase), "missing Spiritual Life exclusion: "+phrase);
}

const saintSulpice=stages.find(x=>x.id==="SL04");
assert.ok(saintSulpice.claims.some(x=>x.layer==="SCHOOL_SPECIFIC_METHOD"),"Saint-Sulpice lost school-specific boundary");
assert.match(saintSulpice.claims.map(x=>x.text).join(" "),/one traditional method among several/i);

const examen=stages.find(x=>x.id==="SL07");
assert.match(examen.claims.map(x=>x.text).join(" "),/not a spiritual score/i);

const rule=stages.find(x=>x.id==="SL10");
assert.match(rule.claims.map(x=>x.text).join(" "),/flexible enough/i);

const work=stages.find(x=>x.id==="SL09");
assert.match(work.claims.map(x=>x.text).join(" "),/broad Catholic tradition/i);

console.log(JSON.stringify({
  routePublished:false,
  stages:stages.length,
  claims:claimIds.length,
  sources:sourceIds.size,
  unsourcedClaims:0,
  unresolvedSources:0
},null,2));
