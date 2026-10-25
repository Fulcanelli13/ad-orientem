import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {distanceM,tokens,makeQuery,rank,assess,screen} from "../tools/geography/sacred-places-bulk-screen.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const j=read("data/geography/research/sacred-places-p39-global500-open68-reconciliation.v1.json");
const g=read("data/geography/seed-registry.v1.json"), l=read("data/geography/sacred-places-live-release-chain.v1.json");
assert.equal(j.schema,"AO_SACRED_PLACES_P39_GLOBAL500_AND_OPEN68_RECONCILIATION_V1");
assert.equal(j.canonical_live.places,g.places.length);
assert.equal(j.canonical_live.release,l.releases.at(-1).id);
assert.equal(j.global_500.length,500);
assert.equal(j.global_500.filter(x=>x.current_status==="VERIFIED_EXISTING_CANONICAL").length,98);
assert.equal(j.global_500.filter(x=>x.current_status==="STILL_REQUIRES_IDENTITY_OR_GEOMETRY").length,402);
assert.equal(j.global_500.filter(x=>x.also_in_open_mapping_queue).length,54);
assert.equal(j.open_mapping_68.length,68);
assert.equal(new Set(j.open_mapping_68.flatMap(x=>x.candidate_ids)).size,69);
assert.equal(new Set(j.global_500.map(x=>x.candidate_id)).size,500);
assert.equal(new Set(g.places.map(x=>x.place_id)).size,g.places.length);
const canonicalIds=new Set(g.places.map(x=>x.place_id));
for(const x of j.global_500)if(x.canonical_place_id)assert.ok(canonicalIds.has(x.canonical_place_id));
for(const x of j.open_mapping_68){
 assert.equal(x.publication_state,"RESEARCH_REQUIRED");
 assert.equal(x.research_search_center.meaning,"RESEARCH_DISCOVERY_ANCHOR_ONLY_NOT_PUBLISHABLE_SITE_GEO");
 assert.ok(x.source_lead_url.startsWith("http"));
}
assert.equal(Math.round(distanceM(0,0,0,0)),0);
assert.ok(tokens("Basilica of Saint Mary, Gdańsk").includes("gdansk"));
const q=makeQuery(j.open_mapping_68.slice(0,5));
assert.match(q,/place_of_worship/);
assert.match(q,/out center tags/);
assert.throws(()=>makeQuery(j.open_mapping_68.slice(0,9)),/Bounded batch/);
assert.throws(()=>makeQuery([{...j.open_mapping_68[0],research_search_center:{...j.open_mapping_68[0].research_search_center,meaning:"site"}}]),/Unsafe discovery anchor/);
const a=j.open_mapping_68[0],lat=a.research_search_center.lat,lng=a.research_search_center.lng;
const r=rank(a,{type:"way",id:987654321,center:{lat,lon:lng},tags:{name:a.site_name,building:"church",amenity:"place_of_worship",denomination:"roman_catholic"}});
assert.equal(r.osm_ref,"osm:way:987654321");
assert.equal(r.verification_status,"OSM_DISCOVERY_ONLY_IDENTITY_AND_EXACT_GEOMETRY_NOT_VERIFIED");
assert.equal(r.osm_feature_center.meaning,"UNVERIFIED_OSM_OBJECT_CENTER_NEVER_CANONICAL_SITE_GEO");
assert.ok(r.score>0);
const screened=assess(a,{elements:[{type:"way",id:987654321,center:{lat,lon:lng},tags:{name:a.site_name,building:"church"}}],error:null});
assert.equal(screened.status,"OSM_CANDIDATE_REVIEW_REQUIRED");
assert.equal(screened.publication_authorized,false);
const dry=await screen({network:false});
assert.deepEqual([dry.rows,dry.global_leads,dry.existing_canonical,dry.still_open_acquisition,dry.overlap_ids],[68,500,98,402,54]);
assert.equal(dry.publication_authorized,false);
const shardResults=await Promise.all([0,1,2,3].map(shardIndex=>screen({network:false,shardIndex,shardCount:4})));
assert.deepEqual(shardResults.map(x=>x.rows),[17,17,17,17]);
assert.ok(shardResults.every(x=>x.publication_authorized===false));
const sources=read("data/geography/research/sacred-places-p39-source-evidence-500-routing.v1.json");
assert.equal(sources.rows.length,500);
assert.equal(sources.counts.canonical_linked,98);
assert.equal(sources.counts.unresolved,402);
assert.equal(sources.counts.unresolved_with_individual_previous_audit_url,78);
assert.equal(sources.counts.unresolved_without_audit_url,324);
const lanes=sources.rows.filter(x=>!x.canonical_place_id).reduce((a,x)=>(a[x.next_lane]=(a[x.next_lane]||0)+1,a),{});
assert.deepEqual(Object.fromEntries(Object.entries(lanes).sort()),Object.fromEntries(Object.entries({
 SITE_SPECIFIC_CATHOLIC_IDENTITY_SOURCE_DISCOVERY_REQUIRED:285,
 OPEN68_OSM_BUILDING_AND_SCOPE_MATCH:54,
 PRIOR_SOURCE_EVIDENCE_GEO_OR_ELIGIBILITY_REQUIRED:50,
 OPERATOR_ELIGIBILITY_EXCEPTION:13
}).sort()));
assert.ok(sources.rows.every(x=>x.publication_authorized===false));

const evidence=read("data/geography/research/sacred-places-p39-open68-osm-evidence.v1.json");
assert.equal(evidence.schema,"AO_SACRED_PLACES_P39_FULL68_FIRST_OSM_EXECUTION_EVIDENCE_V1");
assert.deepEqual([evidence.results.length,evidence.summary.has_osm_candidate,evidence.summary.remote_query_failed,evidence.summary.verified_no_match,evidence.summary.automatic_new_places],[68,24,44,0,0]);
assert.equal(new Set(evidence.results.map(x=>x.queue_row)).size,68);
const openByRow=new Map(j.open_mapping_68.map(x=>[x.queue_row,x]));
const refs=new Set();
for(const x of evidence.results){
 const inherited=openByRow.get(x.queue_row);assert.ok(inherited,"Evidence without inherited row");
 assert.deepEqual(x.candidate_ids,inherited.candidate_ids);
 assert.equal(x.publication_authorized,false);
 assert.equal(x.osm_candidates.length>0,x.status==="OSM_CANDIDATE_REVIEW_REQUIRED");
 for(const hit of x.osm_candidates){
  assert.match(hit.osm_ref,/^osm:(node|way|relation):[0-9]+$/);
  assert.equal(hit.verification_status,"OSM_DISCOVERY_ONLY_IDENTITY_AND_EXACT_GEOMETRY_NOT_VERIFIED");
  assert.equal(hit.osm_feature_center.meaning,"UNVERIFIED_OSM_OBJECT_CENTER_NEVER_CANONICAL_SITE_GEO");
  refs.add(hit.osm_ref);
 }
 if(x.status==="REMOTE_QUERY_FAILED")assert.ok(x.remote_error,"Network failure must keep error");
}
assert.equal(refs.size,112);

console.log("PASS P39 bulk: all 500 IDs, 98 exact canonical links, 402 acquisition holds; 68 mapping rows/69 IDs, 54 overlaps; safe bounded Overpass queries; zero automatic publication");
