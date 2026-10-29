// Read-only release rehearsal for the eleven unpublished R18 actions.
// A themed parent or cultural subtype never becomes a canonical Calendar article
// or a recurring local event merely because a preview exists.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {calendarCustomArticleIds,calendarCustomArticle,calendarCustomRecommendations} from "../../src/calendar/customs-read-model.js";

const file=p=>readFileSync(new URL("../../"+p,import.meta.url));
const json=p=>JSON.parse(file(p).toString("utf8"));
const sourcePath="data/customs/customs-r18-all18-release-ownership-reconciliation.v1.json";
const stage=json("data/customs/customs-r18-eleven-calendar-parent-subtype-structure.v1.json");
const editorial=json("data/customs/customs-r18-eleven-bilingual-editorial-copy-review.v1.json");
const quality=json("data/customs/customs-r18-eleven-bilingual-qa-amendments.v1.json");
const lanes=json("data/customs/customs-r18-eleven-editorial-publication-lanes.v1.json");
const sourceChecked=json("data/customs/customs-r18-eleven-source-checked-full-bilingual-article-pack.v1.json");
const source=json(sourcePath);
const seed=json("data/customs/customs-atlas-seed.v1.json");
const six=json("data/customs/customs-r18-six-canonical-release-candidate.v1.json");
const sourceBytes=file(sourcePath);
const githubBlobSha=createHash("sha1").update("blob "+sourceBytes.length+"\0").update(sourceBytes).digest("hex");
assert.equal(stage.source_blob_sha,githubBlobSha,"Staging must pin the exact source-ledger blob");
assert.equal(stage.source_identity_decision_file,sourcePath);
const defaults=stage.summary;
assert.equal(defaults.staged_candidate_actions,11);
assert.equal(defaults.provisional_theme_families,8);
assert.equal(defaults.regional_or_seasonal_candidates,7);
assert.equal(defaults.local_event_bound_candidates,4);
assert.equal(defaults.subtype_examples,15);
assert.equal(defaults.separate_published_customs,0);
assert.equal(defaults.assigned_new_ids,0);
assert.equal(defaults.approved_copy,0);
assert.equal(defaults.live_events,0);
assert.equal(defaults.indulgences,0);
assert.equal(defaults.existing_six_canonical_dossiers,6);
assert.equal(defaults.existing_noncanonical_companion,1);
assert.deepEqual(defaults.separate_cohort_reserved_ids,["EPIP-003","CRIB-001"]);
for(const [k,v] of Object.entries(stage.policy))assert.equal(v,true,"Missing policy: "+k);
assert.equal(seed.customs.length,38);
const published=new Set(seed.customs.filter(x=>x.publication_state==="PUBLISHED").map(x=>x.custom_id));
const canonical=new Set(seed.customs.map(x=>x.custom_id));
const publishedApi=calendarCustomArticleIds();
assert.equal(published.size,35);
assert.equal(publishedApi.length,35);
assert.deepEqual(new Set(publishedApi),published);
assert.equal(six.rows.length,6);
assert.ok(six.rows.every(x=>x.publication_allowed===false&&Object.values(x.signoffs).every(x=>x===false)));

assert.equal(editorial.counts.records,11);
assert.equal(editorial.counts.bilingual_field_pairs_total,33);
assert.equal(editorial.counts.canonical_publications,0);
assert.equal(editorial.counts.approved_articles,0);
assert.equal(editorial.source_article_file,sourcePath);
assert.equal(editorial.structure_file,"data/customs/customs-r18-eleven-calendar-parent-subtype-structure.v1.json");
for(const [name,value] of Object.entries(editorial.policy))
  assert.equal(value,true,"Missing bilingual-release safeguard "+name);
const copyByKey=new Map(editorial.records.map(x=>[x.review_key,x]));
assert.equal(copyByKey.size,11);
const editableFields=["description","history","caution"];
for(const row of editorial.records){
 assert.equal(row.revision_status,"UNAPPROVED_EDITORIAL_COPY_PROPOSAL");
 assert.equal(row.language_review_en,"PENDING");
 assert.equal(row.language_review_fr,"PENDING");
 assert.equal(row.independent_full_source_verification,false);
 assert.deepEqual(row.replaces_only,editableFields);
 assert.deepEqual(Object.keys(row.changes).sort(),[...editableFields].sort());
 for(const field of editableFields)for(const lang of ["en","fr"])
  assert.ok(row.changes[field]?.[lang]?.length>80,
    "Need substantial edited EN/FR "+row.review_key+" "+field+" "+lang);
 assert.notEqual(row.changes.description.en,row.changes.history.en,
   "Reader should not repeat identical English history/description");
 assert.notEqual(row.changes.description.fr,row.changes.history.fr,
   "Reader should not repeat identical French history/description");
}

assert.equal(lanes.schema,"AO_R18_ELEVEN_ACTION_LANE_EDITORIAL_ADJUDICATION_V1");
assert.deepEqual(lanes.summary,{reviewed:11,regional_standalone_recommendations:7,
 local_context_only_recommendations:4,final_approvals:0,canonical_ids_allocated:0,
 calendar_events_published:0,indulgences_published:0});
assert.ok(Object.values(lanes.rules).every(x=>x===true));
assert.equal(lanes.records.length,11);
const laneByKey=new Map(lanes.records.map(x=>[x.review_key,x]));
assert.equal(laneByKey.size,11);
assert.equal(quality.schema,"AO_R18_ELEVEN_BILINGUAL_QA_AMENDMENTS_V1");
assert.deepEqual(quality.counts,{records:11,corrected_field_pairs:27,signed_off:0,published:0});
assert.ok(Object.values(quality.approval).every(x=>x===false));
assert.equal(quality.records.length,11);
const qaByKey=new Map(quality.records.map(x=>[x.review_key,x]));
assert.equal(qaByKey.size,11);
assert.equal(sourceChecked.copy_quality_review.language_pairs_revised,27);
assert.equal(sourceChecked.copy_quality_review.article_count_affected,11);
assert.equal(sourceChecked.copy_quality_review.publication_approval_granted,false);
const sourceReviews=source.records.filter(x=>x.action_identity_review&&x.unpublished_bilingual_article);
assert.equal(sourceReviews.length,11);
const checkedFile="data/customs/customs-r18-eleven-source-checked-full-bilingual-article-pack.v1.json";
assert.equal(sourceChecked.schema,"AO_R18_ELEVEN_SOURCE_CHECKED_FULL_EN_FR_ARTICLE_PACK_V1");
assert.deepEqual(sourceChecked.counts,{
 full_eight_field_articles:11,narrow_source_claims_checked:11,source_urls_cited:17,
 regional_or_seasonal:7,local_context:4,theme_families:8,named_child_forms:15,
 new_approvals:0,new_canonical_ids:0,new_publications:0,new_events:0
});
for(const [k,v] of Object.entries(sourceChecked.contract))
 assert.equal(v,true,"Missing source-checked approval gate: "+k);
for(const [key,entry] of Object.entries(sourceChecked.inputs)){
 const expectedPath={reconciliation:sourcePath,editorial:"data/customs/customs-r18-eleven-bilingual-editorial-copy-review.v1.json",
 structure:"data/customs/customs-r18-eleven-calendar-parent-subtype-structure.v1.json"}[key];
 assert.equal(entry.path,expectedPath);
 const bytes=file(expectedPath);
 const sha=createHash("sha1").update("blob "+bytes.length+String.fromCharCode(0)).update(bytes).digest("hex");
 assert.equal(entry.blob_sha,sha,"Source blob has drifted: "+key);
}
assert.equal(sourceChecked.records.length,11);
const verifiedByKey=new Map(sourceChecked.records.map(x=>[x.review_key,x]));
assert.equal(verifiedByKey.size,11);

const sourceByKey=new Map(sourceReviews.map(x=>[x.release_key,x]));
assert.equal(stage.staged.length,11);
assert.deepEqual(stage.staged.map(x=>x.review_key),sourceReviews.map(x=>x.release_key));
const releaseKeys=new Set(),subtypeKeys=new Set();
const eightFields=["title","description","history","meaning","practice","caution","occasion","scope"];
const approvals=["identity","source","english","french","geography","liturgical","calendar","activation"];
const localKeys=new Set(["CUSTOMS-R18-03","CUSTOMS-R18-13","CUSTOMS-R18-15","CUSTOMS-R18-16"]);
const familyIndex=new Map();
for(const candidate of stage.staged){
 const key=candidate.review_key,actual=sourceByKey.get(key);
 assert.ok(actual,"Unknown candidate "+key);
 assert.ok(!releaseKeys.has(key));releaseKeys.add(key);
 assert.equal(candidate.working_master_id,actual.working_master_id);
 assert.deepEqual(candidate.article_title,{en:actual.title_en,fr:actual.title_fr});
 assert.equal(candidate.canonical_parent_id,null);
 assert.equal(candidate.canonical_article_id,null);
 assert.equal(candidate.family_key_is_canonical_article_id,false);
 assert.equal(candidate.independently_publishable_record,false);
 assert.equal(candidate.rendering_enabled_in_production,false);
 assert.equal(candidate.copy_approved,false);
 assert.equal(candidate.identity_approved,false);
 assert.equal(candidate.scheduled_event_approved,false);
 assert.equal(candidate.indulgence_approved,false);
 assert.equal(candidate.stage,"NONCANONICAL_EDITORIAL_RELEASE_CANDIDATE");
 assert.deepEqual(Object.keys(candidate.signoffs).sort(),[...approvals].sort());
 assert.ok(Object.values(candidate.signoffs).every(v=>v===false));
 assert.equal(candidate.provisional_family_key,actual.action_identity_review.proposed_action_family);
 assert.deepEqual(candidate.published_canonical_comparators,actual.action_identity_review.compare_existing_canonical_ids);
 assert.deepEqual(candidate.cross_candidate_related_not_equivalent,
   actual.action_identity_review.cross_candidate_related_not_equivalent);
 assert.ok(candidate.article_pointer.endsWith("#"+key+".unpublished_bilingual_article"));
 assert.equal(candidate.primary_source_url,actual.action_identity_review.primary_institutional_source_url);
 assert.ok(actual.source_links.some(x=>x.url===candidate.primary_source_url));
 assert.ok(copyByKey.has(key),"Missing copy review for "+key);
 const proposed=copyByKey.get(key);
 const verified=verifiedByKey.get(key);
 assert.ok(verified,"Missing source-checked final copy: "+key);
 const lane=laneByKey.get(key);
 assert.ok(lane,"Missing editorial lane for "+key);
 const regional=!new Set(["CUSTOMS-R18-03","CUSTOMS-R18-13","CUSTOMS-R18-15","CUSTOMS-R18-16"]).has(key);
 assert.equal(lane.reviewer_recommendation,regional?
 "STANDALONE_REGIONAL_HISTORICAL_ARTICLE_AFTER_SIGNOFF":
 "LOCAL_FEAST_CONTEXT_ONLY_NOT_GLOBAL_CUSTOM_ID");
 assert.deepEqual(lane.title,verified.article.title);
 assert.equal(lane.working_master_id,actual.working_master_id);
 assert.ok(Object.values(lane.editorial_gates).every(x=>x===false));
 assert.equal(lane.canonical_id,null);
 assert.equal(lane.canonical_parent_id,null);
 assert.deepEqual(lane.child_subtype_ids,[]);
 assert.equal(lane.published,false);
 assert.equal(lane.recurring_event,false);
 assert.equal(lane.full_copy_human_approved,false);
 assert.equal(lane.decision_stage,"ANALYST_RECOMMENDATION_NOT_HUMAN_EDITORIAL_SIGNOFF");

 assert.equal(verified.working_master_id,actual.working_master_id);
 assert.equal(verified.complete_bilingual_fields,8);
 assert.equal(verified.source_check.result,"NARROW_ACTION_CLAIM_CORROBORATED");
 assert.equal(verified.source_check.full_article_authoritatively_certified,false);
 assert.equal(verified.source_check.modern_events_authorized,false);
 assert.equal(verified.source_check.formal_1962_rite_authorized,false);
 assert.equal(verified.source_check.indulgence_grant_validated,false);
 assert.ok(verified.source_check.verified_narrow_claim_en.length>50);
 assert.ok(verified.source_check.evidence_urls.length>=1);
 assert.ok(verified.source_check.evidence_urls.every(x=>x.startsWith("https://")));
 assert.equal(verified.release_status,"PROPOSED_READY_FOR_HUMAN_EDITORIAL_REVIEW_NOT_AUTHORIZED");
 assert.deepEqual(Object.keys(verified.signoffs).sort(),[...approvals].sort());
 assert.ok(Object.values(verified.signoffs).every(x=>x===false));
 assert.deepEqual(verified.new_events,[]);
 assert.deepEqual(verified.indulgence_grants,[]);
 assert.equal(verified.action_structure.canonical_parent_id,null);
 assert.equal(verified.action_structure.new_article_id,null);
 assert.equal(verified.action_structure.scheduled_date,null);
 assert.equal(verified.action_structure.no_independent_child_customs,true);
 assert.equal(verified.action_structure.noncanonical_theme_family,candidate.provisional_family_key);
 assert.deepEqual(verified.action_structure.child_forms,candidate.subtype_examples);
 
 const baselineArticle={...actual.unpublished_bilingual_article,...proposed.changes};
 const qa=qaByKey.get(key);
 assert.ok(qa,"Missing second-pass EN/FR changes for "+key);
 assert.equal(qa.release_status,"COPY_QA_PROPOSED_NOT_CANONICALLY_APPROVED");
 assert.deepEqual(Object.keys(qa.changes).sort(),[...qa.fields].sort());
 const applied=Object.fromEntries(Object.entries(qa.changes).map(([field,change])=>{
   assert.deepEqual(change.before,baselineArticle[field],"Original copy of "+key+" "+field+" changed");
   assert.ok(change.after.en?.length>4&&change.after.fr?.length>4);
   return [field,change.after];
 }));
 const resolvedArticle={...baselineArticle,...applied};
 assert.deepEqual(verified.article,resolvedArticle,"Final eight-field article must match source + revised copy + QA amendments");
 for(const field of eightFields)for(const lang of ["en","fr"])
   assert.ok(resolvedArticle[field]?.[lang]?.trim().length>=4,key+" resolved candidate missing "+field+"."+lang);
 assert.deepEqual(Object.keys(resolvedArticle).sort(),[...eightFields].sort());

 assert.equal(actual.current_publication_authorized,false);
 assert.deepEqual(actual.indulgence_grants,[]);
 for(const field of eightFields)for(const lang of ["en","fr"]){
   const value=actual.unpublished_bilingual_article[field]?.[lang];
   assert.ok(typeof value==="string"&&value.trim().length>=4,key+" missing "+field+"."+lang);
 }
 for(const id of candidate.published_canonical_comparators)assert.ok(canonical.has(id),key+" invented comparator "+id);
 assert.ok(candidate.subtype_examples.length>=1);
 for(const subtype of candidate.subtype_examples){
   assert.ok(subtype.subtype_review_key.startsWith(key+":"));
   assert.ok(!subtypeKeys.has(subtype.subtype_review_key));subtypeKeys.add(subtype.subtype_review_key);
   assert.ok(subtype.title.en.length>=8&&subtype.title.fr.length>=8);
   assert.equal(subtype.independent_canonical_article,false);
   assert.equal(subtype.approved_for_calendar,false);
 }
 const isLocal=localKeys.has(key);
 assert.equal(isLocal,candidate.placement_after_approval==="LOCALITY_BOUND_FEAST_CONTEXT_NOT_A_GLOBAL_CALENDAR_EVENT");
 assert.equal(candidate.calendar_event_date,null);
 assert.equal(candidate.local_event_record_requires_current_date_and_place||false,isLocal);
 // Rehearsal builds a read-only view model and does not register articles or events.
 const view=Object.freeze({review_key:key,title:actual.unpublished_bilingual_article.title,
   descriptions:actual.unpublished_bilingual_article.description,
   subtype_keys:Object.freeze(candidate.subtype_examples.map(x=>x.subtype_review_key)),
   publication_state:"RESEARCH_ONLY",
   calendar_event:null,canonical_article_id:null});
 if(!familyIndex.has(candidate.provisional_family_key))familyIndex.set(candidate.provisional_family_key,[]);
 familyIndex.get(candidate.provisional_family_key).push(view);
}
assert.equal(familyIndex.size,8);
assert.equal(releaseKeys.size,11);
assert.equal(subtypeKeys.size,15);
assert.deepEqual(new Set(familyIndex.get("CHRISTMASTIDE_VISITING_PERFORMERS").map(x=>x.review_key)),
  new Set(["CUSTOMS-R18-08","CUSTOMS-R18-09"]));
assert.deepEqual(new Set(familyIndex.get("LOCAL_PUBLIC_FEAST_PROCESSIONS").map(x=>x.review_key)),
  new Set(["CUSTOMS-R18-13","CUSTOMS-R18-15","CUSTOMS-R18-16"]));
const eggs=stage.staged.find(x=>x.review_key==="CUSTOMS-R18-04");
assert.equal(eggs.proposal_kind,"SINGLE_CRAFT_IDENTITY_WITH_NAMED_REGIONAL_SUBTYPES");
assert.equal(eggs.subtype_examples.length,2);
const shrine=stage.staged.find(x=>x.review_key==="CUSTOMS-R18-17");
assert.equal(shrine.indulgence_primary_grant_verified,false);
assert.equal(sourceByKey.get("CUSTOMS-R18-17").action_identity_review.shrine_indulgence_claim_separate_gate.publication_allowed,false);
assert.deepEqual(sourceByKey.get("CUSTOMS-R18-17").indulgence_grants,[]);
for(const date of ["2026-04-05","2026-06-24","2026-08-14","2026-08-15","2026-12-24"]){
 const ids=calendarCustomRecommendations(date,{events:[]}).map(x=>x.id);
 assert.ok(ids.every(x=>published.has(x)));
 assert.ok(ids.every(x=>!releaseKeys.has(x)));
}
assert.ok(publishedApi.every(id=>calendarCustomArticle(id)?.id===id));
assert.equal(defaults.staged_candidate_actions,stage.staged.length);
assert.equal(defaults.subtype_examples,subtypeKeys.size);
// Absence of an import is essential: audited research must not become a production Calendar entry.
const readModel=readFileSync(new URL("../../src/calendar/customs-read-model.js",import.meta.url),"utf8");
assert.doesNotMatch(readModel,/customs-r18-eleven-source-checked-full-bilingual-article-pack/);
console.log("PASS Customs R18 Calendar rehearsal: 11 candidate actions, 8 noncanonical families, 15 subtypes, 33 EN/FR editorial revisions, 35 published unchanged and zero event/grant/identity/copy approvals.");
