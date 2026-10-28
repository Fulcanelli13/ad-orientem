import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const load = path => JSON.parse(readFileSync(path,"utf8"));
const p="data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json";
const i=load(p);
const w=load("assets/staged/sacred-art-breviarium-wave1-native-20261029/wave1-source-intake-results.json");
const g=load("data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json");
const prayer=load("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
assert.equal(i.schema,"AO_SACRED_ART_BREVIARIUM_83_BULK_INTAKE_V1");
assert.equal(i.records.length,83);
assert.equal(i.counts.total_gallery_plates,83);
assert.deepEqual(i.counts.gallery_sections,{"Our Lady":23,"The Life of Christ":29,"The Mystery of God":2,"The Angels":6,"The Saints":23});
assert.equal(new Set(i.records.map(x=>x.breviarum_plate_id)).size,83);
assert.equal(new Set(i.records.map(x=>x.commons_filename)).size,83);
assert.equal(i.counts.hard_artist_exclusions,7);
assert.equal(i.counts.commons_metadata_confirmed,83);
assert.equal(i.counts.aesthetic_triage.PRIORITY_PHOTOGRAPHIC_QA,33);
assert.equal(i.counts.aesthetic_triage.SECONDARY_VISUAL_REVIEW,14);
assert.equal(i.counts.artist_name_normalization_corrections,5);
assert.equal(g.counts.effectiveBannedIDRecords,103);
assert.equal(prayer.primary_artworks.length,22);
assert.equal(prayer.placement_records.length,118);
assert.equal(prayer.totals.production_activated,0);
assert.equal(prayer.totals.pristine_publication_ready,0);
assert.equal(i.counts.new_photo_originals_downloaded,2);
assert.equal(i.counts.w1_source_originals_archived,2);
assert.equal(i.counts.w1_http429_source_holds,11);
assert.equal(i.counts.w1_file_rights_metadata_holds,1);
assert.equal(i.counts.production_activated,0);
assert.equal(i.counts.new_pristine_certifications,0);
const allBans=i.records.filter(x=>x.hard_artist_exclusion);
assert.equal(allBans.length,7);
for(const x of allBans){
 assert.equal(x.aesthetic_triage,"EXCLUDE_ARTIST");
 assert.equal(x.next_action,"DO_NOT_ACQUIRE_OR_DISPLAY");
 assert.match(x.artist_as_credited,/El Greco|Fra Angelico/);
 assert.equal(x.bulk_photo_firstwave.status,"NOT_SELECTED_FOR_W1_NATIVE_IMAGE_ACQUISITION");
}
assert.equal(w.total_cases,14);
assert.equal(w.originals_sha1_byte_verified_and_archived,2);
assert.equal(w.source_holds,12);
assert.equal(w.production_activated,0);
let originals=0;
for(const x of w.cases){
 const item=i.records.find(y=>y.breviarum_plate_id===x.plate_id);
 assert.ok(item);
 assert.equal(x.user_editorial_approval,false);
 assert.equal(x.pristine_certified,false);
 assert.equal(x.production_activated,false);
 assert.equal(item.bulk_photo_firstwave.status,x.status);
 if(x.archive_path){
    const raw=readFileSync(x.archive_path);
    assert.equal(createHash("sha1").update(raw).digest("hex"),x.source_file_sha1);
    assert.equal(createHash("sha256").update(raw).digest("hex"),x.archive_sha256);
    assert.equal(raw.length,x.archive_bytes);
    assert.equal(item.bulk_photo_firstwave.archive_sha256,x.archive_sha256);
    originals++;
 }
}
assert.equal(originals,2);
assert.equal(w.native_review_sheets.length,1);
for(const sheet of w.native_review_sheets){
 const raw=readFileSync(sheet.path);
 assert.equal(createHash("sha256").update(raw).digest("hex"),sheet.sha256);
}
console.log(JSON.stringify({result:"PASS_BREVIARIUM_83_BULK_SOURCE_AND_W1_ORIGINAL_INTEGRITY",
 plates:83,commons_metadata:83,hard_artist_rejects:7,priority_photos:33,
 final_user_rejections_preserved:103,prior_hero_identities_preserved:22,
 new_research_originals_SHA_VERIFIED:2,commons_rate_limited:11,
 image_rights_hold:1,photo_pristine_approvals:0,app_releases:0,cost_eur:0}));
