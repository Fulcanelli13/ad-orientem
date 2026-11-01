import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=get("data/geography/research/photo-finder-20261030/releases/b9-fourteen-preserved-cover-promotion-20261101.v1.json");
const source=get(manifest.source_report),registry=get("data/geography/approved-place-media.v1.json");
const choices=get(manifest.user_decisions).decisions;
const gallery=get("data/geography/approved-place-gallery.v1.json");
assert.equal(manifest.schema,"AO_PHOTO_FINDER_B9_VERIFIED_BLOBS_20261101_V1");
assert.deepEqual([manifest.attempted,manifest.verified,manifest.promoted,manifest.held],[20,14,14,6]);
assert.deepEqual([source.verified,source.media_records.length,source.exceptions.length],[14,14,6]);
assert.ok(registry.items.length>=268,"Later approved releases minus the single El Cobre visual hold must survive");
assert.equal(new Set(registry.items.map(x=>x.place_id)).size,registry.items.length);
assert.equal(manifest.previously_approved_keep.length,168);
assert.equal(manifest.images.length,14);
assert.equal(gallery.items.length,35,"No gallery entries removed or added by this release");
const byId=new Map(registry.items.map(x=>[x.place_id,x]));
const fp=it=>({place_id:it.place_id,asset_path:it.asset_path,source_sha1:it.source_sha1,derivative_sha256:it.derivative_sha256,credit:it.credit,license:it.license});
for(const original of manifest.previously_approved_keep){
 if(original.place_id==="place:CU:el-cobre-caridad-basilica"){
  assert.equal(byId.has(original.place_id),false,"Explicit El Cobre visual hold must remain unpublished");
  continue;
 }
 const actual=byId.get(original.place_id);
 assert.ok(actual,"Pre-existing approved cover removed: "+original.place_id);
 assert.deepEqual(fp(actual),original,"Existing KEEP/source/author/licence changed: "+original.place_id);
}
const sourceBy=new Map(source.media_records.map(x=>[x.item.place_id,x.item]));
for(const frozen of manifest.images){
 const item=byId.get(frozen.place_id);
 assert.ok(item,"B9 selected cover missing: "+frozen.place_id);
 assert.deepEqual(item,sourceBy.get(frozen.place_id),"B9 source metadata altered");
 assert.deepEqual(fp(item),fp(frozen));
 assert.ok(item.status==="APPROVED"&&item.rights_verified&&item.subject_verified&&item.crop_reviewed);
 const title=decodeURIComponent(item.source_url.split("/wiki/").at(-1)).replaceAll("_"," ");
 assert.equal(title,choices[item.place_id]?.files?.[0],"Not user's rank-1 selection");
 const bytes=readFileSync(new URL("../"+item.asset_path,import.meta.url));
 assert.equal(bytes.length,frozen.bytes);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),item.derivative_sha256,"Wrong WebP bytes");
}
for(const hold of manifest.exceptions){
 assert.ok(!manifest.images.some(x=>x.place_id===hold.place_id),"Held candidate promoted");
}
assert.equal(manifest.no_existing_approved_changes,true);
assert.equal(manifest.no_new_photo_choices,true);
console.log("PASS B9: 14 exact selected WebPs + 167 of 168 prior covers, with only explicit El Cobre visual hold + six source holds");
