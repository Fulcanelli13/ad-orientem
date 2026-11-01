import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m=read("data/geography/research/photo-finder-20261030/releases/b16-b18-thirty-three-preserved-covers-promotion-20261101.v1.json"),media=read("data/geography/approved-place-media.v1.json"),gallery=read("data/geography/approved-place-gallery.v1.json"),ed=read(m.original_user_choices).decisions;
const fp=x=>({place_id:x.place_id,asset_path:x.asset_path,source_sha1:x.source_sha1,derivative_sha256:x.derivative_sha256,credit:x.credit,license:x.license});
const hold=read("data/geography/research/photo-finder-20261030/releases/b8-el-cobre-visual-hold-correction-20261101.v1.json");
assert.equal(hold.visual_hold.place_id,"place:CU:el-cobre-caridad-basilica");
assert.equal(m.visual_hold_preserved.place_id,hold.visual_hold.place_id);
assert.equal(m.visual_hold_preserved.status,"WITHHELD_VISUAL_REVIEW");
assert.equal(media.items.some(x=>x.place_id===hold.visual_hold.place_id),false);
assert.equal(existsSync(new URL("../"+hold.visual_hold.asset_path,import.meta.url)),false,"Never re-add the watermarked El Cobre WebP");
assert.equal(m.schema,"AO_PHOTO_FINDER_B16_B18_VERIFIED_THIRTY_THREE_COVERS_V1");
assert.deepEqual(m.source_reports.map(x=>[x.batch,x.verified,x.held]),[[16,14,5],[17,14,4],[18,5,2]]);
assert.deepEqual([m.prior_approved_keep.length,m.images.length,m.holds.length],[268,33,11]);
assert.ok(media.items.length>=301);assert.equal(new Set(media.items.map(x=>x.place_id)).size,media.items.length);assert.equal(gallery.items.length,35);
const version=String(media.version).split(".").map(Number);
assert.ok(version[0]>1||(version[0]===1&&(version[1]>6||(version[1]===6&&version[2]>=7))),"Version rollback");
const map=new Map(media.items.map(x=>[x.place_id,x]));
for(const b of m.prior_approved_keep){let x=map.get(b.place_id);assert.ok(x,"Existing cover removed "+b.place_id);assert.deepEqual(fp(x),b,"Existing approval changed "+b.place_id)}
const verified=new Map(m.source_reports.flatMap(r=>read(r.path).media_records.map(x=>[x.item.place_id,{batch:r.batch,item:x.item}])));
assert.equal(verified.size,33);
for(const entry of m.images){
 const x=map.get(entry.place_id),s=verified.get(entry.place_id);
 assert.ok(x&&s,"Approved B16–B18 photo missing "+entry.place_id);assert.equal(entry.batch,s.batch);
 assert.deepEqual(x,s.item,"Verified metadata modified");assert.deepEqual(fp(x),fp(entry));
 assert.ok(x.status==="APPROVED"&&x.rights_verified&&x.subject_verified&&x.crop_reviewed);
 assert.equal(decodeURIComponent(x.source_url.replace("https://commons.wikimedia.org/wiki/","")).replaceAll("_"," "),ed[x.place_id]?.files?.[0],"Rank 1 changed");
 const bytes=readFileSync(new URL("../"+x.asset_path,import.meta.url));
 assert.equal(bytes.length,entry.bytes);assert.equal(createHash("sha256").update(bytes).digest("hex"),entry.derivative_sha256,"Asset digest mismatch");
}
for(const h of m.holds)assert.ok(!m.images.some(x=>x.place_id===h.place_id),"Held photograph published");
assert.ok(m.no_new_editorial_votes&&m.no_existing_cover_replacements&&m.no_gallery_or_directory_changes&&m.no_photo_redownload_in_promotion);
console.log("PASS B16-B18: 33 verified selected WebPs, 268 prior protected, explicit El Cobre visual hold, 11 source-technical holds");
