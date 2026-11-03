import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const resolution=read("data/geography/research/sacred-atlas-round1-source-links-20261103.v1.json");
const prior=read("data/geography/research/sacred-atlas-photo-production-crosswalk-20261103.v1.json");
const places=read("data/geography/seed-registry.v1.json").places;
const relics=read("data/explore/sacred-phenomena-seed.v1.json").relics;
const gallery=read("data/geography/approved-place-gallery.v1.json").items;
const sourceSubjects=new Map(prior.original_268_subject_crosswalk.map(x=>[x.subject_id,x]));
const kept=new Map(prior.round1_user_kept_preview_crosswalk.map(x=>[x.number,x]));
const placeIds=new Set(places.map(x=>x.place_id));
const relicIds=new Set(relics.map(x=>x.id));
const relCounts={};
assert.equal(resolution.schema,"AO_SACRED_ATLAS_ROUND1_SOURCE_SUBJECT_LINK_CLOSURE_V1");
assert.equal(resolution.status,"SOURCE_RELATIONSHIPS_ADJUDICATED_PHOTOS_UNPUBLISHED");
assert.equal(resolution.rows.length,12);
const numbers=new Set();
for(const row of resolution.rows){
 assert.ok(!numbers.has(row.round1_preview_number),"Duplicate round1 record");
 numbers.add(row.round1_preview_number);
 const priorRow=kept.get(row.round1_preview_number);
 assert.ok(priorRow&&priorRow.canonical_subject_registry_link==="ROUND1_PROVISIONAL_ID_NOT_IN_ORIGINAL_268");
 assert.equal(row.place_id,priorRow.place_id);
 assert.equal(row.preview_subject_id,priorRow.subject_id);
 assert.equal(row.user_vote,"KEEP");
 assert.equal(row.user_original_exact_photo_pixels_retained,false);
 assert.equal(row.original_268_registry_exact_object_promoted,false);
 assert.equal(row.no_new_media_approval,true);
 assert.equal(row.no_relic_authentication_claim,true);
 assert.equal(row.no_original_user_choice_reopened,true);
 assert.ok(placeIds.has(row.place_id));
 assert.ok(row.relation_evidence_urls.length>0);
 for(const url of row.relation_evidence_urls)assert.match(url,/^https:\/\//);
 assert.ok(row.editorial_identity_reason.length>40&&row.remaining_photo_release_gate.length>50);
 assert.equal(row.proposed_commons_file,priorRow.proposed_commons_file_title);
 assert.equal(row.proposed_commons_file_url,priorRow.proposed_commons_source_page);
 relCounts[row.resolution]=(relCounts[row.resolution]||0)+1;
 if(row.existing_subject_relation_id){
   const src=sourceSubjects.get(row.existing_subject_relation_id);
   assert.ok(src,"Missing original source-owned relation "+row.existing_subject_relation_id);
   assert.equal(src.place_id,row.place_id);
   if(row.resolution==="CANONICAL_RELIC_SUBJECT_IDENTITY_ONLY"){
     assert.equal(src.canonical_relic_id,priorRow.canonical_relic_id);
     assert.ok(relicIds.has(src.canonical_relic_id));
     assert.equal(src.subject_type,"SOURCE_ATTESTED_RELIC_IDENTITY");
   }else if(row.resolution==="EXACT_NAMED_GUIDE_STOP_SUBJECT"||row.resolution==="NEW_PRECISE_OBJECT_CHILD_OF_GUIDE_STOP"){
     assert.equal(src.subject_type,"SOURCE_DESCRIBED_PILGRIMAGE_STOP");
   }else throw Error("Unexpected relation type "+row.resolution);
 }
 if(row.resolution==="NEW_PRECISE_OBJECT_CHILD_OF_GUIDE_STOP")
   assert.notEqual(row.preview_subject_id,row.existing_subject_relation_id,"Physical item must not be the whole chapel/guide stop");
 if(row.wrong_site_candidate_blocked){
   assert.equal(row.round1_preview_number,20);
   assert.equal(row.existing_subject_relation_id,null);
   assert.equal(row.related_unphotographable_context_id,"subject:apparition-context:FR:la-salette");
   assert.ok(sourceSubjects.has(row.related_unphotographable_context_id));
   assert.ok(!gallery.some(g=>g.place_id===row.place_id&&g.source_url===row.proposed_commons_file_url),
    "Wrong-site photo must not appear in La Salette gallery");
 }
 if(row.historical_reference_not_current_site_photo)assert.equal(row.round1_preview_number,19);
 for(const mediaId of row.independent_published_same_source_gallery_ids){
   const img=gallery.find(g=>g.media_id===mediaId);
   assert.ok(img&&img.place_id===row.place_id);
   assert.equal(img.status,"APPROVED");
   assert.ok(img.rights_verified&&img.subject_verified);
 }
}
assert.deepEqual([...numbers].sort((a,b)=>a-b),[8,9,11,12,13,14,15,16,17,18,19,20]);
assert.deepEqual(relCounts,{
 NEW_PRECISE_OBJECT_CHILD_OF_GUIDE_STOP:6,
 CANONICAL_RELIC_SUBJECT_IDENTITY_ONLY:2,
 EXACT_NAMED_GUIDE_STOP_SUBJECT:3,
 NO_EXACT_SUBJECT_IN_268_WRONG_SITE_PHOTO_EXCLUDED:1
});
assert.equal(resolution.counts.new_publications,0);
assert.equal(resolution.counts.round1_preview_pixel_matches_confirmed,0);
assert.equal(resolution.counts.originally_published_photo_files_reusable,1);
console.log("Sacred Atlas Round 1 subject link closure PASS",JSON.stringify(relCounts));
