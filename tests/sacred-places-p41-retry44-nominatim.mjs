import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {targets,formatCandidate,run} from "../tools/geography/sacred-places-p41-retry44-nominatim.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const q=read("data/geography/research/sacred-places-p39-open68-osm-evidence.v1.json");
const r=read("data/geography/research/sacred-places-p40-twelve-verified-catholic-buildings.v1.json");
const t=targets(),dry=await run();
assert.equal(t.length,44);assert.equal(new Set(t.map(x=>x.queue_row)).size,44);
assert.ok(t.every(x=>q.results.find(y=>y.queue_row===x.queue_row)?.status==="REMOTE_QUERY_FAILED"));
assert.ok(t.every(x=>!r.published_new.some(y=>x.candidate_ids.includes(y.candidate_id))));
assert.ok(t.every(x=>x.query.includes(x.site_name)&&x.countrycodes===x.country.toLowerCase()));
assert.deepEqual([dry.targets,dry.p39_prior_successes,dry.p39_network_failures,dry.already_published_p40],[44,24,44,12]);
assert.equal(dry.publication_authorized,false);assert.equal(dry.single_thread,true);assert.ok(dry.min_spacing_ms>=1000);
const item={osm_type:"W",osm_id:110413194,lat:"51.5521",lon:"7.9134",display_name:"Demo Church",class:"amenity",type:"place_of_worship"};
const val=formatCandidate(t[0],item);
assert.equal(val.osm_ref,"osm:way:110413194");assert.equal(val.status,"UNVERIFIED_NOMINATIM_SEARCH_HIT_NOT_EXACT_BUILDING_IDENTITY");
assert.equal(val.geo_candidate.meaning,"UNVERIFIED_NOMINATIM_CENTER_DO_NOT_PUBLISH");
assert.equal(formatCandidate(t[0],{...item,osm_type:"X"}),null);
const evidence=read("data/geography/research/sacred-places-p41-retry44-nominatim-evidence.v1.json");
assert.equal(evidence.schema,"AO_SACRED_PLACES_P41_ONE_TIME_NOMINATIM_RETRY44_V1");
assert.deepEqual([evidence.rows.length,evidence.summary.input_failed_rows,evidence.summary.with_search_candidates,evidence.summary.empty_name_search,evidence.summary.remote_failed,evidence.summary.distinct_candidate_osm_refs,evidence.summary.published_new_places],[44,44,6,38,0,8,0]);
assert.equal(new Set(evidence.rows.map(x=>x.queue_row)).size,44);
const ids=new Set(t.map(x=>x.queue_row));
for(const row of evidence.rows){
 assert.ok(ids.has(row.queue_row));
 assert.equal(row.publication_authorized,false);
 assert.ok(["CANDIDATES_FOUND_NOT_VERIFIED","NOMINATIM_TEXT_SEARCH_EMPTY_NOT_ABSENCE_OF_SITE"].includes(row.status));
 assert.equal(row.candidates.length>0,row.status==="CANDIDATES_FOUND_NOT_VERIFIED");
 for(const f of row.candidates){
  assert.match(f.osm_ref,/^osm:(way|node|relation):\d+$/);
  assert.equal(f.geo_candidate.meaning,"UNVERIFIED_NOMINATIM_CENTER_DO_NOT_PUBLISH");
  assert.equal(f.status,"UNVERIFIED_NOMINATIM_SEARCH_HIT_NOT_EXACT_BUILDING_IDENTITY");
 }
}

console.log("PASS P41: 44 source-owned failures, 24 successful searches retained, 12 P40 releases excluded, one-time single-threaded search guards");
