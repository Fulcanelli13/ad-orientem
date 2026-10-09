import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {CONTEXTUAL_GLOSSARY_TERMS} from "../src/app/contextual-study.js";

const matrix=JSON.parse(readFileSync("data/app/contextual-study-coverage.v1.json","utf8"));
const nav=JSON.parse(readFileSync("data/app/content-navigation-registry.v1.json","utf8"));
const census=JSON.parse(readFileSync("data/app/content-item-census.v1.json","utf8"));
const pray=JSON.parse(readFileSync("data/app/content-items-pray.v1.json","utf8")).items.filter(x=>x.type==="prayer");
const catalogue=readFileSync("src/scripture/catalogue.js","utf8");
assert.equal(matrix.schema,"AO_CONTEXTUAL_STUDY_COVERAGE_V1");
assert.equal(matrix.state,"SOURCE_LEVEL_AUDIT_NO_RUNTIME_CHANGE");
for(const [rows,expected,name] of [
  [matrix.route_coverage,nav.routes,"route"],
  [matrix.corpus_coverage,nav.corpora,"corpus"]]){
 assert.equal(rows.length,expected.length,name+" coverage count");
 assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,"duplicate "+name);
 assert.deepEqual(rows.map(x=>x.id),expected.map(x=>x.id),name+" ID/order drift");
}
assert.deepEqual(matrix.shards.map(x=>x.path),census.shards.map(x=>x.path));
const status=new Set(matrix.source_status_codes);
const routes=new Map(matrix.route_coverage.map(x=>[x.id,x]));
for(const route of routes.values())for(const type of ["scripture","glossary","originalSources"]){
 const capability=route.capabilities[type];
 assert.ok(capability&&status.has(capability.status),"unknown "+type+" status on "+route.id);
 for(const id of capability.witness_ids)
  assert.ok(matrix.specific_witnesses.some(w=>w.id===id&&w.route===route.id&&w.kind===type),"orphan witness "+id);
}
assert.equal(new Set(matrix.specific_witnesses.map(x=>x.id)).size,matrix.specific_witnesses.length,"duplicate witness");
for(const w of matrix.specific_witnesses){
 assert.ok(routes.has(w.route),"unknown witness route "+w.route);
 assert.ok(existsSync(w.source),"missing witness source "+w.source);
 if(w.needle)assert.ok(readFileSync(w.source,"utf8").includes(w.needle),"lost contextual evidence "+w.id);
}
assert.equal(Object.keys(CONTEXTUAL_GLOSSARY_TERMS).length,12);
assert.ok(catalogue.includes("enabled: false"),"Bible publication gate missing");
assert.equal(pray.length,matrix.prayer_source_visibility_snapshot.count);
for(const [key,actual] of Object.entries({
 source_visible_true:pray.filter(x=>x.source_visible===true).length,
 source_visible_false:pray.filter(x=>x.source_visible===false).length,
 source_url_registered:pray.filter(x=>Boolean(x.source_url)).length
}))assert.equal(matrix.prayer_source_visibility_snapshot[key],actual,"Prayer source census drift "+key);
for(const id of ["learn.apologetics","learn.church_crisis"])
 for(const value of Object.values(routes.get(id).capabilities))assert.equal(value.status,"PUBLICATION_GATED");
assert.equal(matrix.corpus_coverage.find(x=>x.id==="scripture-editions").reference_coverage_state,"FULL_TEXT_DISABLED");
console.log("PASS contextual coverage: 63 route identities, 31 corpora, witnessed links and publication guards");
