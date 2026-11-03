import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// Metadata-only: no Commons calls, image downloads, approval writes or
// new publication status. The current production registries always win.
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const audit=read("data/geography/research/sacred-atlas-photo-production-crosswalk-20261103.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const norm=url=>{
 try{return decodeURIComponent(new URL(String(url)).pathname).replaceAll("_"," ").toLowerCase()}
 catch{return String(url||"").replaceAll("_"," ").toLowerCase()}
};
const placeIds=new Set(geo.places.map(p=>p.place_id));
const relicIds=new Set(phenomena.relics.map(p=>p.id));
const apparitionIds=new Set(phenomena.apparitions.map(p=>p.id));
const coversByPlace=new Map(covers.items.map(x=>[x.place_id,x]));
const galleryByPlace=new Map();
for(const image of gallery.items){
 if(!galleryByPlace.has(image.place_id))galleryByPlace.set(image.place_id,[]);
 galleryByPlace.get(image.place_id).push(image);
}
assert.equal(audit.schema,"AO_SACRED_ATLAS_PHOTO_PRODUCTION_CROSSWALK_20261103_V1");
assert.equal(audit.scope,"READ_ONLY_RECONCILIATION_NO_IMAGE_OR_RESEARCH_PROMOTION");
assert.equal(geo.places.length,530,"Original exact geographic scope must not be silently changed by photo research");
assert.equal(audit.original_268_subject_crosswalk.length,268);
assert.equal(audit.round1_user_kept_preview_crosswalk.length,20);
assert.equal(new Set(audit.original_268_subject_crosswalk.map(x=>x.subject_id)).size,268);
assert.equal(new Set(audit.round1_user_kept_preview_crosswalk.map(x=>x.number)).size,20);
for(const s of audit.original_268_subject_crosswalk){
 assert.ok(placeIds.has(s.place_id),"Missing canonical photo-subject Place "+s.subject_id);
 assert.ok(!s.canonical_relic_id||relicIds.has(s.canonical_relic_id),"Missing source-owned relic "+s.subject_id);
 assert.ok(!s.canonical_apparition_id||apparitionIds.has(s.canonical_apparition_id),"Missing source-owned apparition "+s.subject_id);
}
const oldFocus=new Set(audit.original_268_subject_crosswalk.map(x=>x.subject_id));
let sameFileCount=0,coverCount=0,gallerySiteCount=0,provisionalCount=0;
for(const row of audit.round1_user_kept_preview_crosswalk){
 assert.ok(placeIds.has(row.place_id),"No exact site for accepted preview "+row.number);
 assert.equal(row.user_vote,"KEEP");
 assert.equal(row.exact_preview_pixel_match_confirmed,false,"Do not invent preview pixel-match proof");
 assert.equal(row.original_preview_exact_bytes_preserved,false);
 assert.ok(!row.canonical_relic_id||relicIds.has(row.canonical_relic_id));
 assert.equal(row.canonical_subject_registry_link==="EXISTING_EXACT_SUBJECT",oldFocus.has(row.subject_id));
 assert.ok(!row.publication_state.includes("AUTHORIZED_FROM_ROUND1"));
 if(!oldFocus.has(row.subject_id))provisionalCount++;
 const cover=coversByPlace.get(row.place_id);
 if(row.approved_cover_current){
  assert.ok(cover,"Previously approved exact-Place cover was removed; re-audit "+row.place_id);
  assert.equal(cover.asset_path,row.approved_cover_current.asset_path);
  assert.equal(cover.status,"APPROVED");assert.ok(cover.rights_verified&&cover.subject_verified);
  coverCount++;
 }
 const images=galleryByPlace.get(row.place_id)||[];
 if(row.approved_gallery_at_place_count)gallerySiteCount++;
 for(const g of row.independently_published_same_commons_file_gallery){
  const media=images.find(x=>x.media_id===g.media_id);
  assert.ok(media,"Previously published exact candidate Commons source was removed: "+g.media_id);
  assert.equal(norm(media.source_url),norm(row.proposed_commons_source_page));
  assert.equal(media.source_sha1,g.source_sha1);
  assert.equal(media.asset_path,g.asset_path);
  assert.equal(media.status,"APPROVED");
  assert.ok(media.rights_verified&&media.subject_verified&&media.crop_reviewed);
  sameFileCount++;
 }
 if(row.research_candidate_decision==="HARD_EXCLUDE_WRONG_PHYSICAL_SITE"){
  assert.ok(!images.some(g=>norm(g.source_url)===norm(row.proposed_commons_source_page)),
   "The wrong-site La Salette Commons image was published at the incorrect Place");
 }
}
assert.equal(coverCount,17);
assert.equal(gallerySiteCount,4);
assert.equal(provisionalCount,12);
assert.equal(sameFileCount,2);
assert.equal(audit.round1_user_kept_preview_crosswalk.filter(x=>x.research_candidate_decision==="HARD_EXCLUDE_WRONG_PHYSICAL_SITE").length,1);
assert.equal(audit.round1_user_kept_preview_crosswalk.filter(x=>x.research_candidate_decision==="HOLD_ARCHIVAL_CONTEXT_NOT_MODERN_SITE_PHOTO").length,1);
// Count snapshots are historical observations; additional *legitimately*
// approved photographs must not cause an obsolete report to fail CI.
assert.ok(covers.items.length>=audit.snapshot_counts.approved_place_covers);
assert.ok(gallery.items.length>=audit.snapshot_counts.approved_gallery_photographs);
assert.equal(new Set(audit.missing_site_cover_place_ids).size,audit.missing_site_cover_place_ids.length);
for(const id of audit.missing_site_cover_place_ids)assert.ok(placeIds.has(id));
assert.equal(audit.legacy_125_still_missing_cover_place_ids.length,112);
for(const id of audit.legacy_125_still_missing_cover_place_ids)assert.ok(placeIds.has(id));
console.log("Sacred Atlas photo reconciliation PASS:",JSON.stringify({
 source_subjects:268,kept_preview_votes:20,source_join_unresolved:0,
 source_page_already_published_as_independent_gallery_photo:sameFileCount,
 round1_preview_pixel_matches_verified:0,wrong_site_exclusions:1,
 current_approved_covers:covers.items.length,current_approved_gallery_photos:gallery.items.length,
 snapshot_missing_covers:audit.snapshot_counts.missing_cover_places
}));
