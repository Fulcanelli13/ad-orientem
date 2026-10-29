import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarStagedPublishedCustomVariants} from "../src/calendar/customs-research-preview.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/customs/master/";
const working=read(root+"working-master.v1.json").records;
const master=new Map(working.map(r=>[r.id,r]));
const owners=read(root+"customs-all47-owner-action-comparisons-20261029.v1.json").records;
const src=read(root+"customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json").records;
const bySource=new Map(src.map(r=>[r.provisional_group_id,r]));
const v=read(root+"customs-22-existing-owner-bilingual-variants-20261029.v1.json");
const pack=read(root+"customs-calendar-bilingual-content-40-20261029.v1.json");
const html=readFileSync(new URL("../docs/CUSTOMS_CALENDAR_40_BILINGUAL_CONTENT_PREVIEW_20261029.html",import.meta.url),"utf8");
assert.equal(v.schema,"AO_CUSTOMS_22_EXISTING_OWNER_BILINGUAL_VARIANT_DETAILS_V1");
assert.equal(v.records.length,22);
assert.equal(v.totals.existing_published_owners,12);
assert.equal(pack.records.length,40);
assert.equal(pack.summary.ux_content_items,40);
assert.equal(pack.summary.preexisting_unpublished_full_bilingual_profiles,18);
assert.equal(pack.summary.new_bilingual_variant_details,22);
assert.equal(pack.summary.distinct_published_owners_enriched,12);
assert.equal(pack.summary.currently_published_canonical,35);
assert.equal(pack.summary.currently_context_only,3);
const official=read("data/customs/customs-atlas-seed.v1.json").customs;
assert.equal(official.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(official.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
const possible=working.filter(x=>x.publication_state==="NOT_APPROVED");
assert.equal(possible.length,18);
const approvedVariants=owners.filter(x=>x.action_relationship_classification.startsWith("OWNER_"));
assert.equal(approvedVariants.length,22);
assert.deepEqual(new Set(v.records.map(r=>r.source_group_id)),new Set(approvedVariants.map(r=>r.group_id)));
assert.equal(new Set(v.records.map(r=>r.variant_id)).size,22);
for(const row of v.records){
 const parent=master.get(row.owner_custom_id);assert.ok(parent);
 assert.equal(parent.publication_state,"PUBLISHED");
 assert.equal(row.presentation.variant_not_extra_card,true);
 assert.equal(row.presentation.slot,"EXISTING_CUSTOM_READER_REGIONAL_VARIANT");
 assert.equal(row.editorial.publication_authorized,false);
 assert.equal(row.editorial.bilingual_copy_final_acceptance,false);
 assert.deepEqual(row.editorial.grant_ids,[]);
 assert.equal(row.calendar.feast_or_liturgical_rank_override_allowed,false);
 assert.equal(row.calendar.derivation,"RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT");
 const s=bySource.get(row.source_group_id);assert.ok(s);
 assert.deepEqual(row.source.observation_ids,s.source_observation_ids);
 assert.equal(row.source.printed_page,s.corrected_or_checked_source_printed_page);
 for(const key of ["title_en","title_fr","history_en","history_fr","practice_or_context_en","practice_or_context_fr"])assert.ok(typeof row.content[key]==="string"&&row.content[key].trim().length>(key.startsWith("title")?5:24),key);
}
const variants=pack.records.filter(x=>x.type==="EXISTING_OWNER_VARIANT_DETAIL");
const profiles=pack.records.filter(x=>x.type==="EXISTING_UNPUBLISHED_BILINGUAL_PROFILE");
assert.deepEqual(variants.map(x=>x.custom_id),v.records.map(x=>x.owner_custom_id));
assert.deepEqual(profiles.map(x=>x.custom_id),possible.map(x=>x.id));
for(const x of profiles){
 const original=master.get(x.custom_id);assert.ok(original);
 assert.equal(original.publication_state,"NOT_APPROVED");
 for(const key of ["title_en","title_fr","description_en","description_fr","history_en","history_fr","meaning_en","meaning_fr","practice_en","practice_fr","caution_en","caution_fr"])assert.ok(typeof x[key]==="string"&&x[key].length>10,key+" "+x.custom_id);
 assert.equal(x.title_en,original.name_en);
 assert.equal(x.title_fr,original.name_fr);
 assert.equal(x.history_fr,original.history_fr);
 assert.equal(x.practice_en,original.practice_en);
 assert.equal(x.display.release_state,"ALREADY_DRAFTED_NOT_APPROVED");
 assert.equal(x.editorial.publication_authorized,false);
}
for(const x of pack.records){
 assert.equal(x.calendar.date_authority,"CALENDAR_DAY_RESOLVER_ONLY");
 assert.equal(x.do_not_auto_publish,undefined);
 assert.notEqual(x.editorial.publication_authorized,true);
 assert.equal(x.does_not_add_canonical_card,x.type==="EXISTING_OWNER_VARIANT_DETAIL");
}
assert.equal(pack.policy.user_approval_ballot,false);
assert.equal(pack.policy.all_408_research_records_retained,true);
assert.equal(pack.policy.indulgences_must_be_independently_grant_matched,true);
assert.equal(pack.summary.additional_published_count,0);
const embedded=html.match(/const DATA=(\[.*\]);\s*const \$=/);
assert.ok(embedded,"Preview should be self-contained and have embedded records");
const cards=JSON.parse(embedded[1]);
assert.equal(cards.length,40);
assert.equal(cards.filter(x=>x.kind==="EXISTING_OWNER_VARIANT_DETAIL").length,22);
assert.equal(cards.filter(x=>x.kind==="EXISTING_UNPUBLISHED_BILINGUAL_PROFILE").length,18);
assert.ok(cards.every(x=>x.en.title&&x.fr.title));
assert.match(html,/English/);
assert.match(html,/Français/);
assert.match(html,/No new Customs module/);
assert.ok(!html.includes("<script src="));
assert.ok(!html.includes("Approve custom"));
assert.ok(!html.includes("Reject custom"));
const publishedParents=[...new Set(v.records.map(x=>x.owner_custom_id))];
const collected=[];
for(const parent of publishedParents){
 const en=calendarStagedPublishedCustomVariants(parent,v);
 const fr=calendarStagedPublishedCustomVariants(parent,v,{fr:true});
 assert.equal(en.length,fr.length);
 assert.ok(en.length>=1);
 for(let i=0;i<en.length;i++){
  const r=v.records.find(x=>x.variant_id===en[i].variant_id);assert.ok(r);
  assert.equal(en[i].parent_custom_id,parent);
  assert.equal(en[i].title,r.content.title_en);
  assert.equal(fr[i].title,r.content.title_fr);
  assert.equal(fr[i].optional_practice_or_context,r.content.practice_or_context_fr);
  assert.equal(en[i].is_new_custom_card,false);
  assert.equal(en[i].date_approved,false);
  assert.equal(en[i].suggested_occurrence_date,null);
  assert.equal(en[i].is_1962_liturgical_rubric,false);
  assert.equal(en[i].is_current_parish_announcement,false);
  assert.equal(en[i].indulgence_associated,false);
  assert.equal(en[i].publication_state,"RESEARCH_VARIANT_DETAIL_NOT_PUBLISHED");
  assert.equal(en[i].source_reference.printed_page,r.source.printed_page);
  collected.push(en[i].variant_id);
 }
}
assert.equal(collected.length,22);
assert.equal(new Set(collected).size,22);
assert.equal(calendarStagedPublishedCustomVariants("CORP-001",v).length,3);
assert.equal(calendarStagedPublishedCustomVariants("DEAD-001",v).length,6);
assert.equal(calendarStagedPublishedCustomVariants("BLSS-004",v).length,2);
assert.equal(calendarStagedPublishedCustomVariants("NOT_A_PUBLISHED_CUSTOM",v).length,0);
assert.throws(()=>calendarStagedPublishedCustomVariants("CORP-001",{records:v.records.slice(0,20)}),TypeError);

console.log("PASS: 22 new bilingual regional Calendar details reusing 12 published owners; 18 existing full bilingual drafts reused without changing source copy.");
console.log("PASS: 40-card self-contained EN/FR preview, source and local date guards, no automatic publication or indulgence claim.");
