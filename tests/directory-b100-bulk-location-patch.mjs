import assert from "node:assert/strict";
import fs from "node:fs";
const j=JSON.parse(fs.readFileSync(new URL(
 "../data/directory/research/b100-20261026-103-materialized-location-corrections.v1.json", import.meta.url),"utf8"));
const r=j.report,p=j.patches;
assert.equal(j.schema,"AO_B100_APPLIED_CORRECTIONS_V1");
assert.equal(r.status,"PASS");
assert.equal(r.processed_exception_rows,216);
assert.equal(r.populated_canonical_rows,103);
assert.equal(r.populated_physical_rows,103);
assert.equal(r.changed_cell_count,206);
assert.equal(r.remaining_holds,113);
assert.equal(r.unchanged_canonical_ids,2584);
assert.equal(r.unchanged_physical_ids,2584);
assert.equal(r.source_timings_remain_in_B98,4681);
assert.equal(r.previously_verified_mass_rows_unchanged,3347);
assert.equal(r.published_app_unchanged,true);
assert.equal(r.public_map_pins,0);
assert.equal(r.published_schedules,0);
assert.equal(r.independent_export_readback,true);
assert.equal(p.length,103);
assert.equal(new Set(p.map(x=>x.group_id)).size,103);
const classes={};
for(const x of p){
  assert.match(x.group_id,/^RG-[0-9A-F]+$/);
  assert.equal(x.release_state,"RESEARCH_ONLY_NOT_PUBLIC");
  assert.equal(x.schedule_action,"NONE");
  assert.equal(x.geocoding_action,"NONE");
  assert(x.new_physical_description.length>5);
  assert(x.source_id);
  classes[x.decision]=(classes[x.decision]||0)+1;
  if(x.decision==="SECONDARY_INDEX_LOCALITY_ONLY"){
    assert(x.new_physical_description.includes("secondary directory locality only"));
    assert(x.evidence_url.startsWith("https://www.latinmassdir.org/"));
  }else if(x.decision==="FROZEN_SITE_LABEL_LOCALITY_ONLY"){
    assert(x.new_physical_description.includes("inherited label locality only"));
    assert(x.evidence_url.startsWith("B99 CANONICAL"));
  }else if(x.decision==="FIRST_PARTY_PHYSICAL_ADDRESS_OR_SITE"){
    assert(x.evidence_url.startsWith("https://"));
    assert(["ORIGINAL_OPERATOR_DIOCESE"].includes(x.source_type));
  }else throw Error("Unexpected evidence tier: "+x.decision);
}
assert.deepEqual(classes,{
  FROZEN_SITE_LABEL_LOCALITY_ONLY:29,
  SECONDARY_INDEX_LOCALITY_ONLY:54,
  FIRST_PARTY_PHYSICAL_ADDRESS_OR_SITE:20,
});
console.log("B100 PASS 216 processed, 103 applied, including 20 owner-grounded physical sites, 113 holds; no public changes");
