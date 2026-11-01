import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m=read("data/geography/research/photo-finder-20261030/releases/b8-fifteen-preserved-covers-release-20261101.v1.json");
const report=read("data/geography/research/photo-finder-20261030/releases/b8-verification-report.json");
const reg=read("data/geography/approved-place-media.v1.json");
const gal=read("data/geography/approved-place-gallery.v1.json");
const choices=read("data/geography/research/photo-finder-20261030/decisions.json");
const b7=read("data/geography/research/photo-finder-20261030/releases/b7-nine-preserved-covers-release-20261101.v1.json");
assert.equal(m.schema,"AO_PHOTO_FINDER_B8_EXISTING_BLOBS_20261101_V1");
assert.equal(report.verified,16);
assert.equal(report.exceptions.length,4);
assert.equal(m.newly_released.length,15);
assert.equal(reg.items.length,167);
assert.equal(reg.version,"1.6.3");
assert.equal(new Set(reg.items.map(x=>x.place_id)).size,167);
assert.equal(gal.items.length,35);
assert.equal(m.newly_released.length+1,report.verified);
const byId=new Map(reg.items.map(x=>[x.place_id,x]));
const frozen=new Map(report.media_records.map(x=>[x.item.place_id,x.item]));
for(const r of m.newly_released){
 const item=byId.get(r.place_id),src=frozen.get(r.place_id);
 assert.ok(item&&src,"Missing verified B8 item: "+r.place_id);
 assert.deepEqual(item,src,"B8 source, author, licence, alt and crop data must be unchanged");
 const name=decodeURIComponent(item.source_url.split("/wiki/").at(-1)).replaceAll("_"," ");
 assert.equal(choices.decisions[r.place_id].files[0],name,"First-choice editorial filename lock");
 assert.deepEqual([item.rights_verified,item.subject_verified,item.crop_reviewed],[true,true,true]);
 const bytes=readFileSync(new URL("../"+r.asset_path,import.meta.url));
 assert.equal(createHash("sha256").update(bytes).digest("hex"),r.derivative_sha256);
 assert.equal(item.derivative_sha256,r.derivative_sha256);
 assert.equal(item.source_sha1,r.source_sha1);
}
assert.equal(byId.has(m.visual_hold.place_id),false,"Marked El Cobre photograph must remain unpublished");
assert.equal(frozen.has(m.visual_hold.place_id),true,"Preserve the original selection as a hold");
for(const previous of b7.newly_released){
 const current=byId.get(previous.place_id);
 assert.ok(current,"B7 approved cover disappeared");
 assert.equal(current.asset_path,previous.asset_path);
 assert.equal(current.derivative_sha256,previous.derivative_sha256);
}
assert.equal(byId.get(b7.previously_published_other_photo.place_id)?.asset_path,b7.previously_published_other_photo.asset_path);
assert.equal(m.policy.no_new_downloads,true);
assert.equal(m.policy.no_new_editorial_choices,true);
console.log("B8 PASS: 15 exact verified staged WebPs, four technical holds and one visual hold retained; prior B7 covers protected.");
