import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const identities=load("identities.v0.json"),observations=load("weiser-observations.v0.json"),editorial=load("editorial-owner-reconciliation.v0.json"),queue=load("coverage-and-review-queue.v0.json");
const rows=identities.records,obs=observations.records,edit=editorial.editorial_cards,proposals=editorial.candidate_proposals;
const triage=[load("identity-triage-ch01-12.v0.json"),load("identity-triage-ch13-19.v0.json"),load("identity-triage-ch20-28.v0.json")];
const firstPass=load("first-pass-260-reconciliation.v1.json");
const triaged=triage.flatMap(x=>x.rows);

const unique=items=>new Set(items).size===items.length;
const sum=obj=>Object.values(obj).reduce((n,x)=>n+x,0);
assert.equal(identities.schema,"AO_CUSTOMS_MASTER_IDENTITIES_V0");
assert.equal(observations.schema,"AO_CUSTOMS_MASTER_WEISER_OBSERVATION_INDEX_V0");
assert.equal(editorial.schema,"AO_CUSTOMS_MASTER_EDITORIAL_RECONCILIATION_V0");
assert.equal(queue.schema,"AO_CUSTOMS_MASTER_COVERAGE_AND_REVIEW_QUEUE_V0");
assert.equal(rows.length,42);assert.ok(unique(rows.map(x=>x.id)));
assert.equal(rows.filter(x=>x.identity_status==="CANONICAL_IN_MAIN").length,38);
assert.equal(rows.filter(x=>x.identity_status==="PROVISIONAL_P2_NOT_CANONICAL").length,4);
assert.equal(rows.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(rows.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.ok(rows.every(x=>x.do_not_auto_publish===true&&x.name_en&&x.name_fr&&x.description_en&&x.description_fr&&x.caution_en&&x.caution_fr));
assert.ok(rows.every(x=>x.calendar.date_authority==="CALENDAR_DAY_RESOLVER_ONLY"));
assert.ok(rows.every(x=>x.source_ids.length&&x.source_ids.every(id=>x.sources.some(s=>s.id===id&&/^https:\/\//.test(s.url||"")))));
assert.equal(obs.length,568);assert.ok(unique(obs.map(x=>x.id)));
assert.equal(new Set(obs.map(x=>x.chapter)).size,28);
assert.deepEqual(observations.summary.triage,{COVERED:85,HISTORY_ONLY:117,CANDIDATE:131,REGIONAL:145,ENRICH:56,EXCLUDE:34});
assert.equal(sum(observations.summary.triage),568);
assert.equal(obs.filter(x=>x.linked_master_identity_ids.length).length,50);
const ids=new Set(rows.map(x=>x.id)),wid=new Set(obs.map(x=>x.id));
for(const o of obs){
 assert.ok(o.id.startsWith("WEI58-")&&o.printed_page>0);
 assert.ok(o.linked_master_identity_ids.every(id=>ids.has(id)));
 assert.ok(o.editorial_card_ids.every(id=>edit.some(x=>x.editorial_id===id)));
 assert.equal(o.publication_state,o.triage==="EXCLUDE"?"EXCLUDE_FROM_CUSTOMS_APP":o.triage==="HISTORY_ONLY"?"HISTORICAL_ARCHIVE_ONLY":"RESEARCH_NOT_PROMOTED");
}
assert.equal(obs.filter(x=>x.p1_research_status).length,144);
assert.deepEqual(observations.summary.p1_dispositions,{
 NO_EXACT_INDEPENDENT_MATCH_HOLD:38,EDITORIAL_DRAFT_REQUIRES_OWNER_PARITY:56,
 PARTIAL_OR_INDIRECT_EVIDENCE_HOLD:46,BOUNDED_CONTEXT_EXISTING_OWNER_ONLY:4
});
assert.equal(edit.length,54);assert.ok(unique(edit.map(x=>x.editorial_id)));
assert.ok(edit.every(x=>x.weiser_ids.length&&x.weiser_ids.every(id=>wid.has(id))));
assert.equal(proposals.length,15);assert.equal(proposals.filter(x=>x.identity_resolution==="ALREADY_PRESENT_IN_38_CANONICAL_IDENTITIES").length,11);
assert.equal(proposals.filter(x=>x.identity_resolution==="DISTINCT_P2_PROVISIONAL").length,4);
assert.ok(proposals.every(x=>ids.has(x.reconciled_master_id)));
assert.equal(editorial.potential_same_practice_groups.length,14);
assert.equal(editorial.related_variant_families.length,28);
assert.ok(editorial.potential_same_practice_groups.every(x=>x.observation_ids.every(id=>wid.has(id))));
assert.ok(editorial.related_variant_families.every(x=>x.observation_ids.every(id=>wid.has(id))));
assert.equal(triaged.length,260,"All 260 owner-unknown observations receive a provisional route");
assert.equal(new Set(triaged.map(x=>x.weiser_id)).size,260,"Never collapse two distinct book locators");
const old260=obs.filter(x=>!x.linked_master_identity_ids.length&&
  ["CANDIDATE","REGIONAL","ENRICH"].includes(x.triage)&&!x.editorial_card_ids.length);
assert.deepEqual(new Set(triaged.map(x=>x.weiser_id)),new Set(old260.map(x=>x.id)),"Exactly cover the previously ownerless observations");
assert.ok(triage.every(x=>x.schema==="AO_CUSTOMS_MASTER_260_OBSERVATION_DISPOSITIONS_V0"&&
  x.status==="PROVISIONAL_OWNER_TRIAGE_NOT_FINAL_SOURCE_ADJUDICATION"));
assert.ok(triaged.every(x=>x.publication_authorized===false&&x.editorial_review_complete===false));
assert.ok(triaged.every(x=>x.proposed_owner_or_identity==null||
  !x.proposed_owner_or_identity.startsWith("CANDIDATE-")||
  ids.has(x.proposed_owner_or_identity)),"Provisional candidate identities must exist in the master");
const bins={};for(const x of triaged)bins[x.provisional_disposition]=(bins[x.provisional_disposition]||0)+1;
assert.deepEqual(bins,firstPass.summary.dispositions);
assert.deepEqual(bins,{
 REGIONAL_VARIANT_OR_RELATED_PRACTICE:39,
 HISTORICAL_OR_CULTURAL_REFERENCE_ONLY:59,
 SOURCE_OR_RITUAL_HOLD:23,
 LINK_TO_KNOWN_IDENTITY_FOR_REVIEW:41,
 OTHER_MODULE_OWNER_NO_NEW_CUSTOM:56,
 POTENTIALLY_DISTINCT_CUSTOM_REQUIRES_SOURCE_GATE:42
});
assert.equal(firstPass.governance.new_canonical_ids_issued,0);
assert.equal(firstPass.governance.app_publications_authorized,0);
assert.equal(firstPass.governance.source_witnesses_added,0);
assert.equal(queue.summary.remaining_without_provisional_disposition,0);
assert.equal(queue.summary.identity_or_variant_review,286);
assert.equal(queue.summary.previously_decided_other_owner_or_context_within_286,26);
assert.equal(queue.summary.remaining_without_54_card_owner_decision,260);
const mappedTo54=new Set(obs.filter(x=>x.linked_master_identity_ids.length===0&&
  ["CANDIDATE","REGIONAL","ENRICH"].includes(x.triage)&&x.editorial_card_ids.length).map(x=>x.id));
assert.equal(mappedTo54.size,26);

assert.equal(queue.summary.unlinked,518);
assert.equal(queue.summary.historical_archive,117);
assert.equal(queue.summary.excluded_reference,34);
assert.equal(queue.summary.existing_other_owner_or_covered,81);
assert.deepEqual(queue.summary.review_priority_counts,{P2:172,P1:113,P0:1});
assert.equal(queue.chapter_coverage.length,28);
assert.equal(queue.chapter_coverage.reduce((n,x)=>n+x.total,0),568);
for(const b of queue.review_batches){
 assert.equal(b.population,b.ids.length);
 assert.ok(b.ids.every(id=>wid.has(id)));
}
assert.equal(queue.summary.publication_added,0);
console.log("Customs master phase-1 integrity passed: 42 identities (38+4), 568 observations, 54 editorial drafts, 15→11+4 reconciliation, 14 same-practice groups, 28 families, 286 identity/variant observations still to review. No app publication.");
