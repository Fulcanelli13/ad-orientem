import assert from "node:assert/strict";
import fs from "node:fs";

const b98 = JSON.parse(fs.readFileSync(new URL(
  "../data/directory/research/b98-20261026-consolidated-core-readback-manifest.v1.json",
  import.meta.url), "utf8"));
const b97 = JSON.parse(fs.readFileSync(new URL(
  "../data/directory/research/b97-italy-three-append-only-physical-research-sites-and-ambrosian-relocation.v1.json",
  import.meta.url), "utf8"));

assert.equal(b98.schema,"AO_TLM_B98_CONSOLIDATED_RESEARCH_OPERATIONAL_CORE_20261026_V1");
assert.equal(b98.predecessor.version,"B91");
assert.equal(b98.predecessor.effective_sites,2576);
assert.equal(b98.predecessor.canonical,2581);
assert.equal(b98.predecessor.source_venues,2684);
assert.equal(b98.successor.effective_sites,2579);
assert.equal(b98.successor.canonical,2584);
assert.equal(b98.successor.physical,2584);
assert.equal(b98.successor.source_venues,2687);
assert.equal(b98.predecessor.mass_times,4681);
assert.equal(b98.successor.mass_times,4681);
assert.equal(b98.successor.previously_verified,3347);
assert.equal(b98.predecessor.previously_verified,3347);
assert.equal(b98.successor.existing_aliases,5);
assert.equal(b98.research_admissions.new_research_group_count,3);
assert.equal(b98.research_admissions.new_group_and_source_ids.length,3);

const expected=new Map(b97.accepted.map(x=>[x.source_id,x.group_id]));
const ids=b98.research_admissions.new_group_and_source_ids;
assert.equal(new Set(ids.map(x=>x.group_id)).size,3);
assert.equal(new Set(ids.map(x=>x.source_id)).size,3);
for(const row of ids){
  assert.equal(expected.get(row.source_id),row.group_id);
  assert(row.liturgy_current_status);
}
assert.equal(b98.research_admissions.no_new_verified_schedules,true);
assert.equal(b98.research_admissions.no_new_venue_coordinates,true);
assert.equal(b98.research_admissions.no_new_public_place_ids,true);
assert.equal(b98.other_decisions.prato.status,"HOLD_NOT_ADMITTED_NEEDS_CURRENT_OWNER_1962_MASS_EVIDENCE");
assert.equal(b98.other_decisions.legnano.ritual_books,"AMBROSIAN_1954_NOT_ROMAN_1962");
assert.equal(b98.other_decisions.legnano.effective_date,"2026-10-25");
assert.equal(b98.production_status,"UNPUBLISHED_RESEARCH_MASTER_ONLY");
assert.equal(b98.inherited_parity.export_readback_pass,true);
assert.match(b98.successor.sha256,/^[a-f0-9]{64}$/);
assert.equal(b98.successor.bytes,2110954);
assert.equal(b98.successor.worksheets,13);
assert.equal(b98.successor.contains_unaltered_full_operational_rows,true);
console.log("B98 research-master manifest and B97 identity dependency: PASS; no public release.");
