import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=x=>JSON.parse(readFileSync(new URL("../"+x,import.meta.url),"utf8"));
const p25=load("data/geography/research/sacred-places-p25-151-source-screen.v1.json");
const p26=load("data/geography/research/sacred-places-p26-authority-evidence.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const sources=load("data/shrines/source-registry.v1.json");
assert.equal(p26.schema,"AO_SACRED_PLACES_P26_ADDITIONAL_AUTHORITY_EVIDENCE_V1");
assert.equal(p26.status,"RESEARCH_ONLY_NO_CANONICAL_RELEASE");
assert.deepEqual([geo.places.length,sources.sources.length],[LIVE.places,LIVE.sources]);
assert.deepEqual([p26.baseline.places,p26.baseline.typed_sources],[387,685]);
const prior=p25.all_151_priority_source_screen.filter(x=>!x.source_excerpt);
assert.deepEqual(p26.remaining_131_source_screen.map(x=>x.candidate_id),prior.map(x=>x.candidate_id));
assert.equal(p26.remaining_131_source_screen.length,131);
const reviewed=p26.remaining_131_source_screen.filter(x=>x.source_excerpt);
assert.equal(reviewed.length,36);
assert.equal(p26.result.additional_web_source_excerpts_reviewed,reviewed.length);
assert.equal(p26.result.first200_with_some_source_excerpt,69+reviewed.length);
assert.equal(p26.result.still_without_new_independent_excerpt,131-reviewed.length);
assert.equal(p26.result.canonical_new_places,0);
for(const r of p26.remaining_131_source_screen){
 assert.equal(r.exact_geo_verified,false);
 assert.equal(r.publishable_place,false);
 if(r.source_excerpt){assert.match(r.source_excerpt.url,/^https:\/\//);assert.ok(r.source_excerpt.issuer.length>5);assert.ok(r.source_excerpt.identity_scope_note.length>35);}
 else assert.equal(r.gate,"PRIMARY_CUSTODIAN_SOURCE_STILL_REQUIRED");
}
assert.equal(p26.remaining_131_source_screen.find(x=>x.candidate_id==="SG-INV-0329").gate,"NON_CATHOLIC_OPERATOR_SPLIT");
assert.equal(p26.remaining_131_source_screen.find(x=>x.candidate_id==="SG-INV-0717").gate,"CONSTRUCTION_SCOPE_HOLD");
assert.equal(p26.remaining_131_source_screen.find(x=>x.candidate_id==="SG-INV-0729").gate,"TITLE_SCOPE_CONFLICT");
console.log("PASS P26: 36 source excerpts, 95 unresolved; 131 candidates retained in exact order; zero published places");
