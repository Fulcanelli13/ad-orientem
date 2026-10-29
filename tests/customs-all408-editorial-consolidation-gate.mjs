import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/customs/master/";
const g=read(root+"customs-408-unified-relationship-gates-20261026.v1.json");
const a1=read(root+"customs-a1-150-primary-source-identity-adjudication-board-20261029.v1.json");
const a23=read(root+"customs-a2-a3-258-source-calendar-indulgence-review-20261029.v1.json");
const owners=read(root+"customs-all47-owner-action-comparisons-20261029.v1.json");
const clusters=read(root+"customs-12-clusters-action-scope-review-20261029.v1.json");
const ledger=read(root+"customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json");
const canonical=read("data/customs/customs-atlas-seed.v1.json").customs;
const byGroup=new Map(g.records.map(x=>[x.id,x]));
const byOwner=new Map(owners.records.map(x=>[x.group_id,x]));
const byRecord=new Map(ledger.records.map(x=>[x.provisional_group_id,x]));
const sourceIds=new Set([...a1.records.map(x=>x.provisional_group_id),...a23.records.map(x=>x.provisional_group_id)]);
assert.equal(g.records.length,408);
assert.equal(ledger.records.length,408);
assert.equal(byRecord.size,408);
assert.equal(sourceIds.size,408);
assert.deepEqual(new Set(ledger.records.map(x=>x.provisional_group_id)),sourceIds);
assert.deepEqual(ledger.records.map(x=>x.provisional_group_id),g.records.map(x=>x.id));
assert.equal(ledger.schema,"AO_CUSTOMS_ALL408_CONSOLIDATED_IDENTITY_AND_CALENDAR_REVIEW_V1");
assert.deepEqual(ledger.source_status_counts,{
 RITE_OR_PRAYER_OWNER_REVIEW:66,
 ORIGINAL_PASSAGE_NARROW_CLAIM_REVIEWED:281,
 FOLKLORE_OR_CULTURAL_CONTEXT:49,
 SOURCE_PRECISION_HOLD:11,
 ORIGINAL_PAGE_ACCESS_FAILURE:1
});
assert.deepEqual(ledger.editorial_lanes,{
 RITE_OR_PRAY_COMPONENT_NOT_AUTO_CUSTOM:66,
 POTENTIALLY_DISTINCT_HISTORICAL_ACTION:219,
 CANONICAL_OR_WORKING_OWNER_VARIANT_COMPARISON:35,
 CONTEXT_ONLY_FOLKLORE_AND_CATHOLICITY_GATE:49,
 CLUSTER_ACTION_IDENTITY_COMPARISON:18,
 REJECT_PRIOR_OWNER_AND_REASSESS_SEPARATELY:9,
 FIX_SOURCE_CITATION_BEFORE_IDENTITY_DECISION:12
});
assert.equal(ledger.totals.source_page_access_failures,1);
assert.equal(ledger.totals.independent_prior_narrow_witness_groups,12);
assert.equal(ledger.totals.owner_links_action_reviewed,47);
assert.equal(ledger.totals.owner_links_vetoed,11);
assert.equal(ledger.totals.distinct_groups_with_cluster_joins,34);
assert.equal(ledger.totals.cluster_count,12);
assert.equal(ledger.totals.approved_new_identities,0);
assert.equal(ledger.totals.approved_merges,0);
assert.equal(ledger.totals.approved_indulgences,0);
assert.equal(ledger.totals.approved_calendar_releases,0);
assert.equal(new Set(owners.records.map(x=>x.group_id)).size,47);
assert.equal(owners.records.length,47);
assert.equal(owners.records.filter(x=>x.prior_owner_match_vetoed).length,11);
assert.equal(owners.summary,undefined);
assert.equal(owners.counts.source_claims_deleted,0);
const knownIds=new Set(canonical.map(x=>x.custom_id));
const working=read(root+"working-master.v1.json").records;
const workingIds=new Set(working.map(x=>x.id));
for(const o of owners.records){
 assert.ok(byGroup.has(o.group_id));
 assert.ok(workingIds.has(o.prior_proposed_owner));
 assert.equal(o.approved_owner_assignment,false);
 assert.equal(o.approved_identity_merge,false);
 assert.equal(o.calendar_publication_approved,false);
 const record=byRecord.get(o.group_id);
 assert.equal(record.existing_owner_link.id,o.prior_proposed_owner);
 assert.equal(record.existing_owner_link.link_vetoed,o.prior_owner_match_vetoed);
 if(o.owner_status==="UNPUBLISHED_WORKING_MASTER")assert.ok(!knownIds.has(o.prior_proposed_owner));
}
assert.equal(clusters.clusters.length,12);
assert.equal(clusters.counts.cluster_membership_links,34);
assert.equal(clusters.counts.distinct_source_groups_in_clusters,34);
assert.equal(clusters.counts.actual_mergers_authorized,0);
for(const cl of clusters.clusters){
 assert.equal(cl.consolidation_approved,false);
 assert.equal(cl.distinct_custom_id_approved,false);
 assert.equal(cl.calendar_publication_approved,false);
 for(const id of cl.source_ids){
   assert.ok(byGroup.has(id));
   assert.ok(byRecord.get(id).overlapping_cluster_ids.includes(cl.cluster_id));
 }
}
for(const r of ledger.records){
 const orig=byGroup.get(r.provisional_group_id);
 assert.ok(orig);
 assert.deepEqual(r.source_observation_ids,orig.source_observation_ids);
 assert.deepEqual(r.original_index_printed_pages,orig.book_page_pointers);
 assert.equal(r.identity_uniqueness_certified,false);
 assert.equal(r.approved_canonical_merge,false);
 assert.equal(r.final_liturgical_1962_authority_signed,false);
 assert.equal(r.regional_or_current_continuity_certified,false);
 assert.equal(r.approved_calendar_rule,null);
 assert.deepEqual(r.indulgence_grant_ids,[]);
 assert.equal(r.bilingual_copy_accepted,false);
 assert.equal(r.publication_authorized,false);
 assert.equal(r.editorial_decision,"PENDING_CONSOLIDATED_HUMAN_REVIEW");
 if(r.existing_owner_link)assert.ok(byOwner.has(r.provisional_group_id));
}
const fail=ledger.records.filter(x=>!x.source_original_printed_page_checked);
assert.deepEqual(fail.map(x=>x.provisional_group_id),["CAT-WEISER-C-001"]);
assert.equal(fail[0].original_page_status,"ORIGINAL_PAGE_ACCESS_FAILURE");
assert.equal(canonical.length,38);
assert.equal(canonical.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(canonical.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
console.log("PASS: 408/408 customs source-review records, 407 page scans and one disclosed failure, every group uniquely mapped.");
console.log("PASS: 47 action-level owner proposals (11 rejected), twelve clusters/34 member links; no silent canonical merges.");
console.log("PASS: all Calendar/1962 authority/indulgence/English-French publication gates remain closed.");
