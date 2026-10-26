import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const q=read("data/geography/research/sacred-places-p45-first150-source-evidence.v1.json");
const p43=read("data/geography/research/sacred-places-p43-open35-global500-reconciliation.v1.json");
const p25=read("data/geography/research/sacred-places-p25-151-source-screen.v1.json");
const cross=read("data/geography/research/sacred-geography-curated-750-site-crosswalk-2026-10-10.v1.1.json");
const base=read("data/geography/seed-registry.v1.json");
const source=read("data/shrines/source-registry.v1.json");
assert.equal(q.schema,"AO_SACRED_PLACES_P45_150_SOURCE_EVIDENCE_COHORT_V1");
assert.equal(q.state,"RESEARCH_ONLY_NO_CANONICAL_PROMOTION");
assert.equal(q.cohort.length,150);
const p25Ids=new Set(p25.all_151_priority_source_screen.map(x=>x.candidate_id));
const allowed=p43.global_acquisition_500.filter(x=>!x.known_canonical_link&&!p25Ids.has(x.candidate_id)&&x.candidate_id!=="SG-INV-0115");
assert.equal(q.selection.eligible_after_exclusions,allowed.length);
assert.equal(q.selection.p43_unresolved,377);
assert.equal(q.selection.p25_source_screened_unique_in_unresolved,105);
assert.equal(allowed.length,271);
assert.deepEqual(q.cohort.map(x=>x.candidate_id),allowed.slice(0,150).map(x=>x.candidate_id));
const crossById=new Map(cross.places.map(x=>[x.candidate_id,x]));
const ids=new Set(),official=new Set(),geoRefs=new Set(),lanes={},countries=new Set();
let discovery=0,zero=0;
for(const row of q.cohort){
 assert.ok(!ids.has(row.candidate_id),"Repeated source row "+row.candidate_id);ids.add(row.candidate_id);
 assert.equal(row.publication_state,"RESEARCH_ONLY_NO_NEW_PLACE");
 assert.ok(Number.isInteger(row.original_discovery_sources_count)&&row.original_discovery_sources_count>=0);
 const original=crossById.get(row.candidate_id);assert.ok(original);
 assert.equal(row.name,original.name);
 assert.equal(row.country,original.country);
 assert.equal(row.original_discovery_sources_count,original.discovery_sources_count);
 assert.ok(row.verification_lane);
 lanes[row.verification_lane]=(lanes[row.verification_lane]||0)+1;
 countries.add(row.country);
 if(row.original_discovery_sources_count)discovery++;else zero++;
 if(row.official_or_custodial_source_review){
  official.add(row.candidate_id);
  assert.match(row.official_or_custodial_source_review.url,/^https:\/\//);
  assert.ok(row.official_or_custodial_source_review.issuer);
  assert.equal(row.official_or_custodial_source_review.asserts_exact_building_geometry,false);
  assert.equal(row.official_or_custodial_source_review.reviewed_date,"2026-10-26");
 }
 if(row.map_feature_review){
  assert.ok(row.official_or_custodial_source_review,"Never publish geometry without accountable identity evidence");
  assert.ok(!geoRefs.has(row.map_feature_review.osm_ref));geoRefs.add(row.map_feature_review.osm_ref);
  assert.match(row.map_feature_review.osm_ref,/^osm:way:\d+$/);
  const id=row.map_feature_review.osm_ref.split(":")[2];
  assert.equal(row.map_feature_review.osm_url,"https://www.openstreetmap.org/way/"+id);
  assert.ok(row.map_feature_review.map_source_url.startsWith("https://mapcarta.com/"));
  assert.ok(Number.isFinite(row.map_feature_review.lat)&&Number.isFinite(row.map_feature_review.lng));
  assert.equal(row.map_feature_review.precision,"site");
  assert.equal(row.verification_lane,"EXACT_BUILDING_SOURCE_AND_MAP_QA");
  assert.ok(!base.places.some(p=>p.geo?.source_ref===row.map_feature_review.osm_ref),"Source object already on production map");
 }
}
assert.deepEqual([...geoRefs].sort(),["osm:way:229930104","osm:way:30163817"]);
assert.equal(official.size,18);
assert.equal(discovery,47);assert.equal(zero,103);
assert.equal(countries.size,54);
assert.deepEqual(q.counts.verification_lane_counts,lanes);
assert.equal(q.counts.production_places_added,0);
assert.equal(q.counts.individually_mapped_osm_building_candidates_for_release_QA,2);
assert.equal(q.counts.primary_or_institutional_web_sources_reviewed,18);
assert.ok(q.cohort.find(x=>x.candidate_id==="SG-INV-0037").notes.includes("REJECT_FALSE_DUPLICATE"));
assert.ok(q.cohort.filter(x=>x.verification_lane==="NON_CATHOLIC_HERITAGE_DO_NOT_PROMOTE").length>=1);
assert.equal(base.places.length,498,"Independent P45 research branch based on frozen P43 main, not assumed merged P44");
assert.equal(source.sources.length,796);
console.log("PASS P45: 150 immutable source-screen records across 54 countries, 18 checked official/institutional sources, 2 named site OSM features, 0 premature publication");
