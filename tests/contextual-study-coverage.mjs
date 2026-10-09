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

const prayerAudit=JSON.parse(readFileSync("data/pray/prayer-source-presentation-audit.v1.json","utf8"));
const certification=JSON.parse(readFileSync("data/pray/prayer-source-certification-inventory.v3.json","utf8"));
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const witnessSource=readFileSync("src/pray/prayer-edition-witnesses.v1.js","utf8");
assert.equal(prayerAudit.schema,"AO_PRAYER_SOURCE_PRESENTATION_AUDIT_V1");
assert.equal(prayerAudit.identities.length,48);
assert.deepEqual(prayerAudit.identities.map(x=>x.id),pray.map(x=>x.id));
const byCertifiedId=new Map(certification.prayers.map(x=>[x.id,x]));
for(const row of prayerAudit.identities){
 const c=byCertifiedId.get(row.id);
 assert.ok(c,"missing certification ID "+row.id);
 assert.equal(row.independent_inventory.collationStatus,c.collation.status,"collation mismatch "+row.id);
 assert.equal(row.base_citation.url,pray.find(x=>x.id===row.id).source_url,"source URL mismatch "+row.id);
 assert.equal(row.status,"UNVERIFIED_EXACT_TEXT","false complete text certification "+row.id);
 assert.ok(row.actual_runtime_source_selection.url,"missing runtime source link "+row.id);
}
assert.equal(prayerAudit.counts.anchor_reviewed_not_full_verbatim,18);
assert.equal(prayerAudit.counts.anchor_not_reviewed,30);
assert.equal(prayerAudit.counts.fully_certified,0);
assert.equal(prayerAudit.counts.edition_witness_overrides,5);
assert.equal(prayerAudit.counts.edition_only_base_missing,2);
assert.match(runtime,/\$\{originCapsule\}\$\{sourceLine\(p\)\}<\/article>/,"Prayer block lost unconditional source");
assert.match(runtime,/prayerBlock\(LIB\.open,\{scriptureContext:true\}\)/,"library no longer displays canonical prayer");
assert.ok(!runtime.includes("p.sourceVisible"),"unexpected sourceVisible filtering: reassess 34 metadata false");
assert.match(witnessSource,/mass_confiteor/);
assert.match(witnessSource,/adoration_lord_i_am_not_worthy/);
assert.equal(matrix.prayer_source_visibility_snapshot.item_level_audit,"data/pray/prayer-source-presentation-audit.v1.json");

console.log("PASS contextual coverage: 63 route identities, 31 corpora, witnessed links and publication guards");
