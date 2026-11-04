import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const m=read("data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const r25=read("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json");
const exact=a=>Array.isArray(a)?a:[];
assert.equal(m.schema,"AO_SACRED_ATLAS_EDITORIAL_MASTER_530_V1");
assert.equal(m.places.length,geography.places.length);
assert.equal(m.summary.canonical_places,530);
assert.equal(m.summary.shrine_records,shrines.shrines.length);
assert.equal(m.summary.bilingual_shrine_synopses,257);
assert.equal(m.summary.extended_guides,33);
assert.equal(m.summary.shrine_guides_to_write,224);
assert.equal(m.summary.other_topic_only_places,3);
assert.equal(m.summary.site_history_without_topic_records,270);
assert.equal(m.summary.pilot_biographies_review_only,6);
assert.equal(m.summary.approved_covers,covers.items.length);
assert.equal(m.summary.gallery_images,gallery.items.length);
assert.equal(m.summary.r25_places_with_verified_unapproved_originals,r25.places.length);
const validSiteIds=new Set(geography.places.map(p=>p.place_id));
const ids=m.places.map(p=>p.place_id);
assert.equal(validSiteIds.size,530);
assert.equal(new Set(ids).size,530);
assert.deepEqual(new Set(ids),validSiteIds);
const sourceById=new Map(sources.sources.map(s=>[s.id,s]));
const mediaById=new Map(covers.items.map(x=>[x.place_id,x]));
const pendingSet=new Set(r25.places.map(x=>x.place_id));
assert.equal(pendingSet.size,23);
const states={"PUBLISHED_EXTENDED_GUIDE":33,"BILINGUAL_SHRINE_SYNOPSIS_ONLY":224,
 "RELATED_TOPIC_ONLY_NO_SHRINE_HISTORY":3,"PLACE_IDENTITY_ONLY":270};
for(const [state,count] of Object.entries(states))assert.equal(m.places.filter(x=>x.editorial_state===state).length,count);
for(const p of m.places){
 assert.ok(validSiteIds.has(p.place_id));
 assert.equal(p.media.cover_status,mediaById.has(p.place_id)?"APPROVED":"NO_APPROVED_PHOTO");
 assert.equal(p.media.cover_asset,mediaById.get(p.place_id)?.asset_path||null);
 assert.equal(p.media.r25_byte_verified_unapproved_originals>0,pendingSet.has(p.place_id));
 assert.equal(p.editorial_controls.saint_biography_published_here,false);
 assert.equal(p.editorial_controls.research_photo_may_publish,false);
 assert.ok(p.bibliography.every(s=>sourceById.has(s.id)&&sourceById.get(s.id).url===s.url));
 assert.ok(p.bibliography.every(s=>/^https:\/\//.test(s.url)));
 assert.ok(p.exact_pilot_draft_matches.every(x=>x.publication==="EDITORIAL_REVIEW_ONLY"));
 assert.equal(p.editorial_controls.history_prose_approved,Boolean(p.published_guide));
 assert.ok(p.shrine===null||p.shrine.origin_en&&p.shrine.origin_fr);
}
for(const [cohort,batches] of Object.entries(m.batch_plan)){
 if(!Array.isArray(batches))continue;
 const vals=batches.flatMap(b=>exact(b.place_ids));
 if(!vals.length)continue;
 assert.equal(new Set(vals).size,vals.length,"no duplicate places within "+cohort);
 assert.ok(vals.every(id=>validSiteIds.has(id)));
}
assert.equal(m.batch_plan.shrine_guide_expansion.length,4);
assert.equal(m.batch_plan.physical_site_history.length,5);
assert.equal(m.batch_plan.first_editorial_working_set.length,56);
assert.equal(m.saint_association_index.length,m.summary.named_saint_associations);
assert.equal(new Set(m.saint_association_index.map(x=>x.source_name)).size,m.saint_association_index.length);
// Recompute the audit from canonical data; no stale manually guessed coverage.
const output=execFileSync(process.execPath,["tools/geography/audit-sacred-atlas-editorial.mjs","--check"],{encoding:"utf8",maxBuffer:4e6});
assert.match(output,/SACRED ATLAS EDITORIAL MASTER PASS/);
console.log("SACRED ATLAS EDITORIAL MASTER CONTRACT PASS: 530 site IDs, 224 sourced shrine gaps, 270 place-history gaps, 119 saint labels, media approvals preserved.");
