import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const inv=read("../data/customs/research/weiser-handbook-inventory.v0.json");
const cross=read("../data/customs/research/weiser-canonical-crosswalk.v1.json");
const briefs=read("../data/customs/research/weiser-custom-editorial-briefs-batch01.v1.json");
const corroboration=read("../data/customs/research/weiser-source-corroboration-batch-01.v1.json");
const queue=read("../data/customs/research/weiser-production-reconciliation.v0.json");

assert.equal(inv.records.length,568);
assert.equal(inv.chapters.length,28);
assert.equal(cross.records.length,568);
assert.equal(cross.audit.unique_mapped_observations,568);
assert.equal(cross.audit.publication_releases,0);
assert.equal(briefs.stats.app_publications,0);
assert.equal(new Set(inv.records.map(x=>x.id)).size,568);
assert.equal(new Set(cross.records.map(x=>x.weiser_id)).size,568);
const originals=new Map(inv.records.map(x=>[x.id,x]));
const merged=new Map(cross.same_practice_candidates.map(x=>[x.id,x]));
const related=new Map(cross.related_variant_families.map(x=>[x.id,x]));

const expectedTriages={COVERED:85,ENRICH:56,CANDIDATE:131,REGIONAL:145,HISTORY_ONLY:117,EXCLUDE:34};
assert.deepEqual(cross.audit.preliminary_triage_counts,expectedTriages);
const seenMember=new Set();
for(const row of cross.records){
 const source=originals.get(row.weiser_id);
 assert.ok(source,row.weiser_id+": unrecognised original ID");
 assert.equal(row.original_triage,source.triage);
 assert.equal(row.original_owner_hint,source.owner);
 assert.equal(row.printed_page,source.page);
 assert.equal(row.source_title,source.title);
 assert.equal(row.publication_state,"RESEARCH_ONLY_NOT_APP_APPROVED");
 if(row.original_triage==="EXCLUDE"){
   assert.equal(row.priority,"BLOCKED");
   assert.equal(row.proposed_existing_custom_id,null);
 }
 if(row.original_triage==="HISTORY_ONLY")assert.equal(row.priority,"ARCHIVE");
 if(row.provisional_same_practice_group){
   const group=merged.get(row.provisional_same_practice_group);
   assert.ok(group && group.observation_ids.includes(row.weiser_id),"wrong same-practice backlink "+row.weiser_id);
   assert.equal(seenMember.has(row.weiser_id),false,"one observation in more than one duplicate group");
   seenMember.add(row.weiser_id);
 }
 for(const family of row.related_families){
   const group=related.get(family);
   assert.ok(group && group.observation_ids.includes(row.weiser_id),"wrong related-family backlink "+row.weiser_id);
 }
}
for(const group of merged.values()){
 assert.ok(group.observation_ids.length>=2);
 assert.equal(new Set(group.observation_ids).size,group.observation_ids.length);
 assert.ok(!/RELATED.*NOT_CONFIRMED_IDENTICAL/.test(group.relation),"uncertain parallel incorrectly labelled duplicate");
 for(const id of group.observation_ids){
   assert.ok(originals.has(id),"orphan duplicate "+id);
   assert.equal(cross.records.find(row=>row.weiser_id===id).provisional_same_practice_group,group.id);
   assert.notEqual(originals.get(id).triage,"EXCLUDE","forbidden excluded duplicate");
 }
}
for(const group of related.values()){
 assert.ok(group.observation_ids.length>=2);
 assert.equal(new Set(group.observation_ids).size,group.observation_ids.length);
 for(const id of group.observation_ids)assert.ok(originals.has(id),"orphan related "+id);
}
assert.equal(cross.audit.same_practice_groups,14);
assert.equal(cross.audit.observations_in_same_practice_review_groups,33);
assert.equal(cross.audit.related_family_groups,28);
assert.equal(cross.audit.observations_in_related_families,195);
assert.equal(cross.records.filter(x=>x.proposed_existing_custom_id).length,16);
assert.equal(cross.records.filter(x=>x.independent_witness==="SOURCE_CORROBORATION_REGISTERED").length,12);
assert.equal(cross.records.filter(x=>x.priority==="BLOCKED").length,34);

const witnessIds=new Set(corroboration.source_records.map(x=>x.weiser_id));
const selectedIds=new Set(queue.selected_priority.map(x=>x.weiser_id));
assert.equal(witnessIds.size,12);
assert.equal(selectedIds.size,30);
assert.equal(briefs.ready_for_editorial_review.length,12);
assert.equal(briefs.source_gate_backlog.length,18);
assert.equal(new Set(briefs.ready_for_editorial_review.map(x=>x.source_observation_id)).size,12);
for(const card of briefs.ready_for_editorial_review){
 assert.ok(witnessIds.has(card.source_observation_id),"editorial copy not independently corroborated "+card.source_observation_id);
 assert.ok(selectedIds.has(card.source_observation_id));
 const source=originals.get(card.source_observation_id);
 assert.equal(card.source_provenance.weiser.printed_page,source.page);
 assert.equal(card.source_provenance.weiser.chapter,source.chapter);
 assert.ok(card.source_provenance.independent_witnesses.length>=1);
 assert.ok(card.source_provenance.independent_witnesses.every(x=>/^https:\/\//.test(x.url)));
 for(const field of ["description_en","spiritual_significance_en","practical_observance_en","description_fr","spiritual_significance_fr","practical_observance_fr"]){
   assert.ok(card[field]?.length>35,card.source_observation_id+": missing "+field);
 }
 assert.equal(card.publication_state,"EDITORIAL_DRAFT_SOURCE_CORROBORATED_NOT_RELEASE_CERTIFIED");
 assert.equal(card.date_ownership,"CALENDAR_RESOLVER_ONLY");
}
const backlogIds=new Set(briefs.source_gate_backlog.map(x=>x.weiser_id));
assert.equal(backlogIds.size,18);
assert.ok([...witnessIds].every(id=>!backlogIds.has(id)));
assert.ok([...selectedIds].every(id=>witnessIds.has(id)||backlogIds.has(id)));
for(const id of ["WEI58-26-029","WEI58-23-021"]){
 assert.equal(briefs.source_gate_backlog.find(x=>x.weiser_id===id)?.editorial_state,"LOCKED_NO_PUBLICATION");
}
console.log("PASS Weiser canonical crosswalk: 568/568 source locators and triages; 14 reversible duplicate candidates covering 33 observations; 28 related families; 34 exclusions protected; 12 bilingual independently corroborated editorial drafts; 18 source-gated holds; 0 app publication.");
