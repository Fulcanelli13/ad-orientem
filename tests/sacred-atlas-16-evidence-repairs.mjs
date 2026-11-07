import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/geography/research/sacred-atlas-16-evidence-repairs-20261107.v1.json");
const board=read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json");
assert.equal(audit.status,"RESEARCH_EVIDENCE_REPAIRED_OWNER_APPROVAL_PENDING");
assert.equal(audit.records.length,16);
assert.equal(new Set(audit.records.map(x=>x.candidate_id)).size,16);
assert.deepEqual(audit.counts,{considered:16,moved_to_owner_review_with_caveat:15,retained_construction_hold:1,remaining_source_or_title_holds:0,remaining_physical_holds:1,owner_approved:0,imported:0,published:0});
for(const item of audit.records){
 const b=board.records.find(x=>x.candidate_id===item.candidate_id);
 assert.ok(b);
 assert.equal(item.new_lane,b.lane);
 assert.equal(item.corrected_display_name,b.proposed_display_name);
 assert.equal(b.original_source_title_preserved,b.name);
 assert.equal(b.correction_requires_owner_acceptance,true);
 assert.equal(b.owner_decision,"PENDING");
 assert.equal(b.identity_final,false);
 assert.equal(b.publication_authorized,false);
 assert.equal(b.import_ready,false);
 assert.equal(b.repair_evidence.physical_site_owner_approved,false);
 assert.equal(b.repair_evidence.accepted_illustrative_point,false);
 assert.ok(item.evidence_url.startsWith("https://"));
 if(item.candidate_id==="SG-INV-0717"){assert.equal(b.owner_review_presentable,false);assert.equal(b.lane,"D_PHYSICAL_IDENTITY_HOLD");}
 else {assert.equal(b.owner_review_presentable,true);assert.equal(b.lane,"B_OWNER_REVIEW_WITH_SCOPE_NOTE");}
 if(item.mapped_external_feature){
  const map=item.mapped_external_feature;
  assert.ok(map.distance_to_staged_preview_m>0&&map.distance_to_staged_preview_m<120,item.candidate_id);
  assert.equal(map.exact_entrance_certified,false);
  assert.equal(b.point.independently_certified_entrance,false);
 }
}
const by=id=>audit.records.find(x=>x.candidate_id===id);
assert.match(by("SG-INV-0507").corrected_display_name,/Candelaria/);
assert.doesNotMatch(by("SG-INV-0507").corrected_display_name,/Rosary/);
assert.equal(by("SG-INV-0465").corrected_display_name,"Parish of Saint Barbara, Párraga, Havana");
assert.doesNotMatch(by("SG-INV-0517").corrected_display_name,/National/);
assert.equal(by("SG-INV-0396").corrected_display_name,"Our Lady of Sorrows Basilica — National Shrine of Saint Peregrine, Chicago");
assert.ok(board.remediation_16.new_counts.B===68);
assert.equal(board.counts.presentable_to_owner,166);
assert.equal(board.counts.approved,0);
assert.equal(board.counts.import_ready,0);
assert.equal(board.counts.published,0);
console.log("PASS 16 Atlas remediations: 15 owner-review proposals, one construction hold, zero auto-import/owner approvals");
