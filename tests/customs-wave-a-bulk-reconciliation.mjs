import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const queue=read("data/customs/master/customs-wave-a-bulk-review-queue-20261029.v1.json");
const canonical=read("data/customs/customs-atlas-seed.v1.json");
const master=read("data/customs/master/working-master.v1.json");
const groups=read("data/customs/master/customs-408-unified-relationship-gates-20261026.v1.json").records;
const bulk=read("data/customs/master/customs-multibook-bulk150-20261026.v1.json").rows;
const catalogue=read("data/customs/master/comprehensive-customs-working-catalogue.v1.json");
const r18=read("data/customs/master/customs-r18-bilingual-calendar-candidate-pack-20261026.v1.json");

assert.equal(queue.schema,"AO_CUSTOMS_WAVE_A_RECONCILED_BULK_REVIEW_QUEUE_V1");
assert.equal(queue.status,"RESEARCH_ONLY_SOURCE_GROUP_ROUTING_NOT_EDITION_OR_IDENTITY_CERTIFICATION");
assert.equal(catalogue.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(queue.source_catalogue.source_detail_rows_reported,3703);
assert.equal(canonical.customs.length,38);
assert.equal(canonical.customs.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(canonical.customs.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.equal(master.records.length,56);
assert.equal(master.records.filter(x=>x.publication_state==="NOT_APPROVED").length,18);
assert.equal(r18.records.length,18);
assert.equal(groups.length,408);
assert.equal(new Set(groups.map(x=>x.id)).size,408);
assert.equal(bulk.length,150);
const allIds=new Set(groups.map(x=>x.id));
const backlinks=new Map(groups.map(x=>[x.id,[]]));
const external=[];
for(const b of bulk){
  assert.equal(b.published,false);
  assert.equal(b.distinct_custom_certified,false);
  if(b.origin!=="WEISER_1958"){external.push(b.intake_id);continue;}
  assert.equal(b.source_group_ids.length,1);
  const g=b.source_group_ids[0];
  assert.ok(allIds.has(g));
  backlinks.get(g).push(b.intake_id);
}
assert.equal(external.length,100);
assert.deepEqual(queue.nonweiser_intake_ids_pending_owner_review,external);
assert.deepEqual(queue.master_unpublished_identity_ids,master.records.filter(x=>x.publication_state==="NOT_APPROVED").map(x=>x.id));
for(const g of groups){
  assert.ok(g.source_observation_ids.length>0,g.id+" has no source witness ID");
  assert.ok(g.book_page_pointers.length>0,g.id+" has no source page pointer");
  assert.deepEqual((g.linked_B150_intakes||[]).slice().sort(),backlinks.get(g.id).slice().sort(),g.id+" backlink mismatch");
  assert.equal(g.identity_approved,false);
  assert.equal(g.merged_into_canonical,false);
  assert.equal(g.published,false);
}
const count=(r,key)=>r.reduce((o,x)=>(o[x[key]]=(o[x[key]]||0)+1,o),{});
const linkedGroups=groups.filter(x=>backlinks.get(x.id).length);
assert.equal(linkedGroups.length,50);
assert.deepEqual(queue.group_risk_distribution,count(groups,"risk"));
assert.deepEqual(queue.group_relationship_distribution,count(groups,"relationship_route"));
const rank=r=>[
  backlinks.get(r.id).length?0:1,
  r.original_folio_action_checked?0:1,
  r.prior_spot_check_recorded?0:1,
  r.relationship_route==="EXISTING_OWNER_PROPOSAL_REQUIRES_REVIEW"?0:1,
  ["HOUSEHOLD_OR_DEVOTIONAL_ACTION_CHECK","COMMUNAL_PRACTICE_LOCALITY_CHECK","HISTORICAL_PERIOD_AND_GEOGRAPHY_CHECK","RITE_OR_LITURGY_BOUNDARY_CHECK","FOLKLORE_OR_NONCATHOLICITY_CHECK"].indexOf(r.risk)
];
const ordered=groups.slice().sort((a,b)=>{
  const x=rank(a),y=rank(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];
  return a.id.localeCompare(b.id);
});
assert.deepEqual(queue.batches.map(x=>x.group_count),[150,150,108]);
assert.deepEqual(queue.batches.flatMap(x=>x.group_ids),ordered.map(x=>x.id));
const byId=new Map(groups.map(x=>[x.id,x]));
for(const batch of queue.batches){
  const rows=batch.group_ids.map(id=>byId.get(id));
  assert.equal(new Set(batch.group_ids).size,batch.group_count);
  assert.deepEqual(batch.risk_distribution,count(rows,"risk"));
  assert.deepEqual(batch.relationship_distribution,count(rows,"relationship_route"));
  assert.equal(batch.with_existing_B150_weiser_backlink,rows.filter(x=>backlinks.get(x.id).length).length);
  assert.equal(batch.stage,"SOURCE_AND_IDENTITY_REVIEW_PENDING");
}
assert.deepEqual(queue.counts,{
 working_master_identities:56,master_research_not_approved:18,provisional_groups:408,
 source_groups_with_exact_weiser_intake:50,source_groups_without_b150_weiser_intake:358,
 nonweiser_intake_rows_outside_408:100,bulk150_total_intake_rows:150,
 r18_draft_profiles:18,new_approved_identities:0,new_customs_published:0
});
for(const flag of Object.values(queue.release_gates))assert.equal(flag,false,"Research must not authorize publication or grant claims");
console.log("PASS Customs Wave A: 3,703 nonunique evidence rows retained; 408/408 groups queued 150/150/108, 50 exact Weiser backlinks and 100 other-author dossiers; no new IDs, indulgences or publications approved");
