import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/customs/master/";
const ledger=get(root+"customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json");
const owners=get(root+"customs-all47-owner-action-comparisons-20261029.v1.json");
const clusters=get(root+"customs-12-clusters-action-scope-review-20261029.v1.json");
const canonical=get("data/customs/customs-atlas-seed.v1.json").customs;
const html=readFileSync(new URL("../docs/CUSTOMS_ALL_408_SINGLE_BULK_EDITORIAL_REVIEW_20261029.html",import.meta.url),"utf8");
assert.equal(ledger.schema,"AO_CUSTOMS_ALL408_CONSOLIDATED_IDENTITY_AND_CALENDAR_REVIEW_V1");
assert.equal(ledger.records.length,408);
const ids=new Set(ledger.records.map(r=>r.provisional_group_id));
assert.equal(ids.size,408);
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
assert.equal(ledger.totals.owner_links_action_reviewed,47);
assert.equal(ledger.totals.owner_links_vetoed,11);
assert.equal(ledger.totals.distinct_groups_with_cluster_joins,34);
assert.equal(ledger.totals.cluster_count,12);
assert.equal(ledger.totals.independent_prior_narrow_witness_groups,12);
assert.equal(owners.records.length,47);
assert.equal(owners.records.filter(x=>x.prior_owner_match_vetoed).length,11);
assert.equal(clusters.clusters.length,12);
assert.equal(clusters.counts.cluster_membership_links,34);
const ownerById=new Map(owners.records.map(r=>[r.group_id,r]));
for(const r of ledger.records){
 assert.ok(ids.has(r.provisional_group_id));
 assert.ok(r.source_observation_ids.length>0);
 assert.ok(r.original_index_printed_pages.length>0);
 assert.equal(r.identity_uniqueness_certified,false);
 assert.equal(r.approved_canonical_merge,false);
 assert.equal(r.final_liturgical_1962_authority_signed,false);
 assert.equal(r.regional_or_current_continuity_certified,false);
 assert.equal(r.approved_calendar_rule,null);
 assert.deepEqual(r.indulgence_grant_ids,[]);
 assert.equal(r.bilingual_copy_accepted,false);
 assert.equal(r.publication_authorized,false);
 assert.equal(r.editorial_decision,"PENDING_CONSOLIDATED_HUMAN_REVIEW");
 if(r.existing_owner_link){
  const o=ownerById.get(r.provisional_group_id);
  assert.ok(o);
  assert.equal(r.existing_owner_link.id,o.prior_proposed_owner);
  assert.equal(r.existing_owner_link.link_vetoed,o.prior_owner_match_vetoed);
 }
}
const failed=ledger.records.filter(r=>!r.source_original_printed_page_checked);
assert.deepEqual(failed.map(r=>r.provisional_group_id),["CAT-WEISER-C-001"]);
assert.equal(canonical.filter(r=>r.publication_state==="PUBLISHED").length,35);
assert.equal(canonical.filter(r=>r.publication_state==="CONTEXT_ONLY").length,3);
const match=html.match(/const DATA=(\[.*\]);\s*const KEY=/);
assert.ok(match,"Embedded self-contained reviewer data missing");
const cards=JSON.parse(match[1]);
assert.equal(cards.length,408);
assert.deepEqual(cards.map(r=>r.id),ledger.records.map(r=>r.provisional_group_id));
assert.equal(new Set(cards.map(r=>r.id)).size,408);
assert.ok(cards.every(r=>r.label===undefined ? Boolean(r.title) : Boolean(r.label)));
assert.equal(cards.filter(r=>r.ownerVeto).length,11);
assert.equal(cards.filter(r=>r.status==="ORIGINAL_PAGE_ACCESS_FAILURE").length,1);
assert.match(html,/localStorage\.setItem/);
assert.match(html,/URL\.createObjectURL/);
assert.match(html,/AO_CUSTOMS_USER_EDITORIAL_CHOICES_V1/);
assert.match(html,/not_a_publication_authorization:true/);
assert.match(html,/250 per page/);
assert.match(html,/Accept with corrections/);
assert.match(html,/Context only/);
assert.match(html,/Reject candidate/);
assert.ok(!html.includes("<script src="),"review file must be offline self-contained");
console.log("PASS: consolidated 408/408 identity board, 47 owner reviews with 11 vetoes, 12 clusters, 407 scanned pages + 1 access failure.");
console.log("PASS: offline 408-card editorial review with 250-per-page batching, local notes and decisions export; production remains 35 published + 3 context-only.");
