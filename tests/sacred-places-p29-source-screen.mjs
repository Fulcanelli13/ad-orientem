import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p26=load("data/geography/research/sacred-places-p26-authority-evidence.v1.json");
const p29=load("data/geography/research/sacred-places-p29-priority95-source-screen.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const ss=load("data/shrines/source-registry.v1.json");
const {LIVE}=await import("./helpers/sacred-places-live-baseline.mjs");
assert.equal(p29.schema,"AO_SACRED_PLACES_P29_REMAINING_PRIORITY_SOURCE_SCREEN_V1");
assert.equal(p29.status,"RESEARCH_ONLY_NO_CANONICAL_PUBLICATION");
assert.deepEqual([geo.places.length,ss.sources.length],[LIVE.places,LIVE.sources]);
assert.deepEqual([p29.baseline.published_places,p29.baseline.typed_sources],[387,685]);
const pending=p26.remaining_131_source_screen.filter(x=>!x.source_excerpt);
assert.equal(pending.length,95);
assert.deepEqual(p29.remaining_95_source_screen.map(x=>x.candidate_id),pending.map(x=>x.candidate_id));
const fresh=p29.remaining_95_source_screen.filter(x=>x.source_excerpt);
assert.equal(fresh.length,16);
assert.equal(p29.result.source_reviewed_this_pass,16);
assert.equal(p29.result.first200_with_independent_excerpts,121);
assert.equal(p29.result.first200_without_independent_excerpts,79);
assert.equal(p29.remaining_95_source_screen.filter(x=>x.gate==="NO_NEW_INDEPENDENT_SOURCE_REVIEW").length,79);
assert.equal(p29.result.new_canonical_places,0);
for(const row of p29.remaining_95_source_screen){
 assert.equal(row.exact_geo_verified,false);assert.equal(row.publishable_place,false);
 if(row.source_excerpt){assert.match(row.source_excerpt.url,/^https:\/\//);assert.ok(row.source_excerpt.issuer.length>8);assert.ok(row.source_excerpt.identity_scope_note.length>60);}
 else assert.equal(row.gate,"NO_NEW_INDEPENDENT_SOURCE_REVIEW");
}
for(const id of ["SG-INV-0684","SG-INV-0685","SG-INV-0736","SG-INV-0359","SG-INV-0369","SG-INV-0371"])assert.ok(p29.remaining_95_source_screen.find(x=>x.candidate_id===id).gate.startsWith("NON_CATHOLIC"));
assert.equal(p29.remaining_95_source_screen.find(x=>x.candidate_id==="SG-INV-0362").gate,"ARCHAEOLOGICAL_RUIN_NOT_OPERATING_CATHOLIC_CHURCH");
console.log("PASS P29: all 95 previous source gaps preserved in order, 16 new reviewed excerpts, 79 still unreviewed; no Place promotion");
