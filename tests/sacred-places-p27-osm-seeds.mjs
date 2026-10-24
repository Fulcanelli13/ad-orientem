import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p27=load("data/geography/research/sacred-places-p27-osm-search-seeds.v1.json");
const p25=load("data/geography/research/sacred-places-p25-151-source-screen.v1.json");
const p26=load("data/geography/research/sacred-places-p26-authority-evidence.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const sources=load("data/shrines/source-registry.v1.json");
assert.equal(p27.status,"DISCOVERY_ONLY_NOT_RELEASE");
assert.deepEqual([geo.places.length,sources.sources.length],[387,685]);
const prior=new Map([...p25.all_151_priority_source_screen,...p26.remaining_131_source_screen].filter(x=>x.source_excerpt).map(x=>[x.candidate_id,x]));
assert.equal(p27.candidates.length,22);
assert.equal(new Set(p27.candidates.map(x=>x.candidate_id)).size,22);
assert.equal(p27.existing_canonical_reuses.length,2);
for(const r of p27.existing_canonical_reuses){ assert.ok(geo.places.some(p=>p.place_id===r.verified_existing_place_id)); assert.ok(!p27.candidates.some(p=>p.candidate_id===r.candidate_id)); }
for(const x of p27.candidates){
 const source=prior.get(x.candidate_id);
 assert.ok(source,"missing source evidence "+x.candidate_id);
 assert.equal(source.source_excerpt.url,x.identity_source_url);
 assert.equal(source.country,x.country);
 assert.equal(x.discovery_center.meaning,"APPROXIMATE_SEARCH_CENTRE_ONLY_NOT_A_PLACE_GEO");
 assert.ok(Number.isFinite(x.discovery_center.lat)&&Number.isFinite(x.discovery_center.lng));
 assert.ok(x.discovery_center.radius_m>=500&&x.discovery_center.radius_m<=5000);
 assert.equal(x.osm_feature,null);
 assert.equal(x.exact_identity_verified,false);
 assert.equal(x.ready_for_publication,false);
 assert.ok(x.name_variants.length>=2);
}
console.log("PASS P27: 22 source-backed OSM search seeds, zero geo verification / Place publication");
