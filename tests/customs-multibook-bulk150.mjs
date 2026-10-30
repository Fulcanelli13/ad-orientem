import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const bulk=read("customs-multibook-bulk150-20261026.v1.json");
const pending=read("customs-18-unpublished-bilingual-editorial-review-20261026.v1.json");
const master=read("working-master.v1.json");
const source=read("customs-consolidation-phase1-408-decisions-priority50.v1.json");
const sourceRecords=new Map(source.identity_rows.map(x=>[x.provisional_group_id,x]));
const alreadyUsed=new Set(source.priority_queue.filter(x=>x.tier==="FIVE_BILINGUAL_DRAFTS").flatMap(x=>x.source_group_ids));
assert.equal(bulk.schema,"AO_MULTIBOOK_SOURCE_ACTION_BULK150_V1");
assert.equal(bulk.rows.length,150,"Exactly 150 cross-book intake dossiers");
assert.equal(new Set(bulk.rows.map(x=>x.intake_id)).size,150);
assert.equal(new Set(bulk.rows.map(x=>x.source_action_ids[0])).size,150);
assert.equal(bulk.policy.source_mentions_not_unique_customs,true);
assert.equal(bulk.policy.no_new_canonical_ids,true);
assert.equal(bulk.policy.no_publication,true);
assert.equal(bulk.counts.new_published_customs,0);
assert.equal(bulk.counts.uniquely_approved_new_customs,0);
assert.equal(bulk.counts.source_action_intake_rows,150);
const allocation=new Map(Object.entries(bulk.source_family_allocation));
let claimed=0;
for(const [family,n] of allocation){
 const actual=bulk.rows.filter(x=>family==="CATHOLICCULTURE_EXCERPT"?x.origin.startsWith(family):x.origin===family).length;
 assert.equal(actual,n,family+" wave quota");
 claimed+=n;
}
assert.equal(claimed,150);
let witnessed=0,folio=0,bilingual=0;
for(const [i,row] of bulk.rows.entries()){
 assert.equal(row.intake_id,"BULK150-"+String(i+1).padStart(3,"0"));
 assert.equal(row.published,false,"Never publish source intake");
 assert.equal(row.distinct_custom_certified,false,"Source action is not a unique custom certification");
 assert.equal(row.proposed_unique_custom_id,null);
 assert.ok(row.working_label_en?.trim().length>12);
 assert.ok(row.source_action_ids.length>=1);
 assert.match(row.original_source.url,/^https:\/\//);
 assert.ok(!String(row.original_source.author||"").includes("VERIFY BY LINK"),"No invented author attributions");
 assert.ok(!row.original_source.printed_pages||Array.isArray(row.original_source.printed_pages));
 assert.ok(row.evidence_gate?.length>12&&row.editorial_route?.length>12);
 if(row.origin==="WEISER_1958"){
   assert.equal(row.source_group_ids.length,1);
   const gid=row.source_group_ids[0];
   assert.ok(sourceRecords.has(gid),"Group ID must exist in frozen 408 master");
   assert.equal(alreadyUsed.has(gid),false,"Do not duplicate five already drafted release subjects");
   assert.deepEqual(row.source_action_ids,sourceRecords.get(gid).source_observation_ids);
   assert.equal(row.working_label_en,sourceRecords.get(gid).title);
 }else if(row.origin==="PITRE_1900"){
   assert.ok(row.source_group_ids[0]?.startsWith("PIT1900-FAM-"),"Pitre component must retain its parent festival");
   assert.equal(row.editorial_route,"LOCAL_FEAST_COMPONENT_OR_PARENT_FAMILY_REVIEW");
 }else{
   assert.equal(row.source_group_ids.length,0,"Other authors are not automatically the same as Weiser groups");
 }
 if(row.independently_witnessed_narrow_claim)witnessed++;
 if(row.prior_original_folio_action_checked)folio++;
 if(row.source_bounded_bilingual_draft){
   bilingual++;
   const d=row.source_bounded_bilingual_draft;
   for(const key of ["history_en","history_fr","meaning_en","meaning_fr","practice_en","practice_fr","caution_en","caution_fr"])
    assert.ok(typeof d[key]==="string"&&d[key].length>12,key+" missing from "+row.intake_id);
   assert.ok(d.source_references.length>=1);
 }
}
assert.equal(witnessed,bulk.counts.independently_witnessed_narrow_claim_in_this_intake);
assert.equal(folio,bulk.counts.original_folio_action_previously_checked_in_this_intake);
assert.equal(bilingual,bulk.counts.reused_bilingual_source_bound_profiles_in_intake);
assert.equal(pending.schema,"AO_CUSTOMS_18_UNPUBLISHED_BILINGUAL_MASTER_PROFILES_V1");
assert.equal(pending.profiles.length,18);
assert.equal(pending.approval_state,"PENDING");
assert.equal(pending.policy.not_additive_to_fifty_six_master_identities,true);
const originalUnpublished=master.records.filter(x=>x.publication_state==="NOT_APPROVED");
assert.equal(master.records.length,56);
assert.equal(originalUnpublished.length,18);
assert.deepEqual(pending.profiles.map(x=>x.working_master_id),originalUnpublished.map(x=>x.id));
for(const [i,p] of pending.profiles.entries()){
 const m=originalUnpublished[i];
 assert.equal(p.approved_for_calendar,false);
 assert.equal(p.editor_decision,"NOT_APPROVED_NEEDS_SCOPE_AND_IDENTITY_REVIEW");
 assert.equal(p.merge_into_existing_custom_id,null);
 for(const field of ["description","history","meaning","practice","caution"]){
  assert.equal(p.bilingual[field].en,m[field+"_en"]);
  assert.equal(p.bilingual[field].fr,m[field+"_fr"]);
 }
 assert.equal(p.bilingual.title.en,m.name_en);
 assert.equal(p.bilingual.title.fr,m.name_fr);
 assert.deepEqual(p.source_ids,m.source_ids);
 assert.deepEqual(p.calendar,m.calendar);
}

const thirty=read("customs-editorial-thirty-review-units-20261026.v1.json");
assert.equal(thirty.schema,"AO_CUSTOMS_EDITORIAL_CO3_THIRTY_REVIEW_UNITS_V1");
assert.equal(thirty.counts.review_units,30);
assert.equal(thirty.rows.length,30);
assert.equal(new Set(thirty.rows.map(x=>x.review_key)).size,30);
assert.equal(thirty.counts.full_bilingual_descriptions,18);
assert.equal(thirty.counts.source_draft_descriptions_missing,12);
assert.equal(thirty.counts.approved_new_identity_ids,0);
assert.equal(thirty.counts.approved_publications,0);
for(let i=0;i<30;i++){
 const row=thirty.rows[i];
 assert.equal(row.final_en_approved,false);
 assert.equal(row.final_fr_approved,false);
 assert.equal(row.identity_approved,false);
 assert.equal(row.calendar_approved,false);
 assert.equal(row.new_canonical_id,null);
 assert.ok(row.source_urls.length>0);
 assert.ok(row.source_urls.every(x=>/^https:\/\//.test(x)));
 assert.ok(row.titles.en&&row.titles.fr);
 if(i<18){
  const original=pending.profiles[i];
  assert.equal(row.review_key,"MASTER:"+original.working_master_id);
  assert.deepEqual(row.copy,original.bilingual);
  assert.equal(row.needs_description,false);
 }else{
  const source=bulk.rows.filter(x=>x.source_bounded_bilingual_draft)[i-18];
  const copied=source.source_bounded_bilingual_draft;
  assert.equal(row.review_key,"OBSERVATION:"+source.intake_id);
  assert.equal(row.copy.history.en,copied.history_en);
  assert.equal(row.copy.history.fr,copied.history_fr);
  assert.equal(row.copy.meaning.en,copied.meaning_en);
  assert.equal(row.copy.practice.fr,copied.practice_fr);
  assert.equal(row.copy.caution.en,copied.caution_en);
  assert.equal(row.needs_description,true);
  assert.equal(row.copy.description.en,null);
  assert.equal(row.copy.description.fr,null);
 }
}
console.log("PASS 30 ready-to-review editorial units: 18 exact full bilingual identities + 12 source-bounded bilingual action dossiers; no manufactured descriptions, signatures or new canonical IDs");

console.log("PASS multibook customs batch: 150 source dossiers across six source families; "+witnessed+" independently witnessed narrow claims, "+folio+" earlier original-folio action checks, "+bilingual+" reusable EN/FR source-bounded drafts, 18 full EN/FR unpublished master profiles; 0 invented distinct IDs or publications");
