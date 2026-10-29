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

const sourceReviews=source.records.filter(x=>x.action_identity_review&&x.unpublished_bilingual_article);
assert.equal(sourceReviews.length,11);
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
console.log("PASS Customs R18 eleven Calendar structural rehearsal: 11 candidate action owners, 8 noncanonical thematic families, 15 named subordinate examples, 6 prior dossiers unaffected, 35 published untouched, 0 local events/grants/IDs/approvals.");
