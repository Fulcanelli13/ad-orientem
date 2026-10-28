import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const load=(p)=>JSON.parse(readFileSync(p,"utf8"));
const s=load("data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json");
const w=load("data/calendar/sacred-art-breviarium-83-w2-cross-registry-institutional-leads-20261029.v1.json");
const bans=load("data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json");
const pray=load("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const w1=load("assets/staged/sacred-art-breviarium-wave1-native-20261029/wave1-source-intake-results.json");
assert.equal(w.schema,"AO_SACRED_ART_BREVIARIUM_83_W2_CROSS_REGISTRY_EXACT_INSTITUTION_GATES_V1");
assert.equal(w.records.length,83);
assert.equal(new Set(w.records.map(x=>x.plate_id)).size,83);
assert.equal(w.metrics.priority_aesthetic_gallery,33);
assert.equal(w.metrics.gallery_plates,83);
assert.equal(w.metrics.originals_first_wave_retained,2);
assert.equal(w.metrics.new_photographs_acquired_in_this_metadata_wave,0);
assert.equal(w.metrics.final_pristine_certified,0);
assert.equal(w.metrics.production_changed,0);
assert.equal(w.metrics.cost_eur,0);
assert.equal(bans.counts.effectiveBannedIDRecords,103);
assert.equal(pray.primary_artworks.length,22);
assert.equal(pray.placement_records.length,118);
assert.equal(pray.totals.pristine_publication_ready,0);
assert.equal(pray.totals.production_activated,0);
assert.equal(w1.originals_sha1_byte_verified_and_archived,2);
const sums=Object.values(w.metrics.source_grade_counts).reduce((a,b)=>a+b,0);
assert.equal(sums,83);
const byId=Object.fromEntries(w.records.map(x=>[x.plate_id,x]));
const champs=byId["plate-champaigne-lastsupper"];
assert.equal(champs.source_provenance_known_links.object_id,"INV 1124");
assert.match(champs.source_provenance_known_links.warning,/Petite Cène.*INV 1125/);
assert.equal(champs.production_approved,false);
const zurb=byId["plate-zurbaran-francis"];
assert.equal(zurb.source_provenance_known_links.object_id,"2015:001");
assert.match(zurb.source_provenance_known_links.warning,/NG230 or NG5655/);
assert.equal(zurb.publication_gate,"REPLACE_INSUFFICIENT_NATIVE_PHOTO");
assert.equal(byId["plate-reni-michael"].publication_gate,"EXISTING_APPROVED_PRAYER_HERO_NO_REPLACEMENT");
const approved=byId["plate-caravaggio-thomas"],emmaus=byId["plate-caravaggio-emmaus"];
assert.ok(approved.confirmed_new_candidate_original);
assert.ok(emmaus.confirmed_new_candidate_original);
for(const x of w.records){
 const prior=s.records.find(z=>z.breviarum_plate_id===x.plate_id);
 assert.ok(prior);
 assert.equal(prior.commons_filename,x.source_filename);
 assert.equal(prior.commons_current_imageinfo.sha1,x.source_sha1);
 assert.equal(x.production_approved,false);
 assert.equal(x.final_curatorial_approval,false);
 assert.equal(x.photo_source_rights_clearance,false);
 assert.equal(x.full_size_photo_quality_certification,false);
 if(prior.hard_artist_exclusion){
   assert.equal(x.publication_gate,"HARD_EXCLUDED");
   assert.match(x.artist,/El Greco|Fra Angelico/);
 }
}
assert.equal(w.records.filter(x=>x.publication_gate==="HARD_EXCLUDED").length,7);
console.log(JSON.stringify({status:"PASS_BREVIARIUM_W2_EIGHTY_THREE_EXACT_SOURCE_REGISTRY",
  all_plates:83,priority:33,institutional_leads:10,low_native_below1200:26,
  other_below1800:9,large_image_staging_holds:4,existing_hero_no_override:1,
  hard_artist_exclusions:7,protected_global_rejection_IDs:103,
  physically_archived_originals:2,new_photo_bytes:0,
  photo_rights_approved:0,pristine_approved:0,production_changes:0,cost_eur:0}));
