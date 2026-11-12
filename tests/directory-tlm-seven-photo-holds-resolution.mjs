import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a=load("data/directory/research/tlm-7-held-photo-resolution-20261112.v1.json");
const ledger=load("data/directory/research/tlm-21-source-verified-photo-release-20261112.v1.json");
const stage=load("data/directory/research/tlm-28-release-candidates-20261112.v1.json");
const registry=load("data/directory/approved-venue-media.v1.json");
const p110=load("data/directory/research/tlm-p110-two-clean-cover-release-20261112.v1.json");
const p110ByVenue=new Map(p110.approved.map(x=>[x.venue_id,x]));
const p112=load("data/directory/research/tlm-p112-three-photo-cover-release-20261112.v1.json");
const p112ByVenue=new Map(p112.approved.map(x=>[x.venue_id,x]));
const map=load("data/directory/preliminary-map-r49.v1.json");
assert.equal(a.schema,"AO_TLM_SEVEN_HELD_PHOTOS_RESOLUTION_V1");
assert.equal(a.status,"RESEARCH_ONLY_SEVEN_HELD_NO_PUBLICATION_CHANGE");
assert.equal(a.records.length,7);
const original=new Map(stage.entries.map(x=>[x.cl2_anchor,x]));
const held=new Set(ledger.held.map(x=>x.cl2_anchor));
const approved=new Set(registry.items.map(x=>x.venue_id));
const seen=new Set();
for(const rec of a.records){
 assert.ok(held.has(rec.cl2_anchor),"Not an existing photo hold: "+rec.cl2_anchor);
 assert.ok(!seen.has(rec.cl2_anchor),"Duplicate hold");seen.add(rec.cl2_anchor);
 assert.equal(rec.venue_id,original.get(rec.cl2_anchor)?.venue_id,"Exact venue mismatch");
 const moved=p110ByVenue.get(rec.venue_id);
 if(moved){
  assert.equal(moved.cl2_anchor,rec.cl2_anchor,"Alternate resolved a different church");
  assert.equal(moved.source_url,rec.candidate_source_url,"Published source must be exact P109 identified alternate");
  assert.equal(registry.items.find(x=>x.venue_id===rec.venue_id)?.asset_path,moved.asset_path);
  assert.equal(registry.items.find(x=>x.venue_id===rec.venue_id)?.source_sha1,moved.original_sha1);
 }else if(p112ByVenue.has(rec.venue_id)){
  const promoted=p112ByVenue.get(rec.venue_id);
  assert.equal(promoted.cl2_anchor,rec.cl2_anchor,"P112 resolved a different physical church");
  assert.equal(registry.items.find(x=>x.venue_id===rec.venue_id)?.asset_path,promoted.asset_path);
  assert.equal(registry.items.find(x=>x.venue_id===rec.venue_id)?.source_sha1,promoted.original_sha1);
  assert.match(rec.candidate_source_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/Category:/);
 }else assert.ok(!approved.has(rec.venue_id),"A still-held venue was prematurely published");
 assert.match(rec.candidate_source_url,/^https:\/\//);
 assert.ok(rec.existing_source_url&&rec.editorial_assessment&&rec.next_evidence);
 for(const flag of ["publication_approved","rights_verified","subject_verified","crop_reviewed"])
  assert.equal(rec[flag],false,"Research record has premature publication flag");
}
assert.equal(seen.size,held.size);
assert.equal(a.records.filter(x=>x.decision==="ALTERNATE_IDENTIFIED_BINARY_PENDING").length,2);
assert.equal(a.records.filter(x=>x.decision==="HOLD_EXACT_CHAPEL_VENUE_ANCHOR").length,1);
const park=a.records.find(x=>x.cl2_anchor==="RG-7C7DC29FFFAB");
assert.equal(park.venue_id,"AO-AMER-R28-US-31-17");
const pin=map.records.find(x=>x[0]===park.venue_id);
assert.equal(pin[6],40.682044);assert.equal(pin[7],-111.537095);
assert.equal(pin[10],"source_marker_unassessed");
assert.equal(registry.items.length,23+p110.proposed.new_clean_alternate_covers+p112.proposed.new_exact_covers,"Historical 23 plus P110 two plus P112 three verified source-bound covers");
assert.equal(p110.held.length,5);
assert.deepEqual(new Set(p112.held.map(x=>x.cl2_anchor)),new Set(["RG-7C7DC29FFFAB","RG-ABBC659D0388"]));
assert.ok(p110.held.some(x=>x.cl2_anchor==="RG-7C7DC29FFFAB"),"Park City must remain held");
assert.equal(a.summary.production_cover_changes,0);
assert.equal(a.summary.coordinate_changes,0);
console.log("PASS 7 withheld exact venue photographs: two source-verified P110 replacements, two remaining composition/physical-site holds after P112");
