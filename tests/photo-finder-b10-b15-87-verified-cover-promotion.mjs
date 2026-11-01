import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=read("data/geography/research/photo-finder-20261030/releases/b10-b15-eighty-seven-preserved-covers-promotion-20261101.v1.json");
const photos=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const editorial=read(r.original_user_choices).decisions;
const all=r.source_reports.flatMap(s=>read(s.path).media_records.map(x=>({...x,batch:s.batch})));
const exceptions=r.source_reports.flatMap(s=>read(s.path).exceptions.map(x=>({...x,batch:s.batch})));
const fp=x=>({place_id:x.place_id,asset_path:x.asset_path,source_sha1:x.source_sha1,derivative_sha256:x.derivative_sha256,credit:x.credit,license:x.license});
assert.equal(r.schema,"AO_PHOTO_FINDER_B10_B15_VERIFIED_EIGHTY_SEVEN_COVERS_V1");
assert.equal(r.prior_approved_keep.length,182);
assert.deepEqual([r.verified_count,r.held_count,r.images.length,r.holds.length],[87,26,87,26]);
assert.equal(all.length,87);assert.equal(exceptions.length,26);
assert.deepEqual(r.source_reports.map(x=>[x.batch,x.verified,x.held]),[[10,19,1],[11,14,6],[12,15,2],[13,11,6],[14,12,8],[15,16,3]]);
assert.ok(photos.items.length>=268,"All 87 new covers and 181 of 182 prior covers must remain; El Cobre alone is visually held");
assert.equal(new Set(photos.items.map(x=>x.place_id)).size,photos.items.length);
assert.equal(gallery.items.length,35,"Gallery out of scope");
const version=String(photos.version||"").split(".").map(Number);
assert.ok(version[0]>1||(version[0]===1&&(version[1]>6||(version[1]===6&&version[2]>=5))),"Approved-media version rollback");
const byId=new Map(photos.items.map(x=>[x.place_id,x]));
for(const p of r.prior_approved_keep){
 if(p.place_id==="place:CU:el-cobre-caridad-basilica"){
  assert.equal(byId.has(p.place_id),false,"El Cobre visual hold must remain excluded");
  continue;
 }
 const item=byId.get(p.place_id);
 assert.ok(item,"Existing approved cover removed "+p.place_id);
 assert.deepEqual(fp(item),p,"Existing approved image/rights changed "+p.place_id);
}
const source=new Map(all.map(x=>[x.item.place_id,x.item]));
for(const entry of r.images){
 const p=byId.get(entry.place_id);
 assert.ok(p,"Approved B10-15 photo missing "+entry.place_id);
 assert.deepEqual(p,source.get(entry.place_id),"B10-15 verified metadata altered");
 assert.equal(p.asset_path,entry.asset_path);
 assert.equal(p.source_sha1,entry.source_sha1);
 assert.equal(p.derivative_sha256,entry.derivative_sha256);
 assert.ok(p.status==="APPROVED"&&p.rights_verified&&p.subject_verified&&p.crop_reviewed);
 const choice=decodeURIComponent(p.source_url.split("/wiki/").at(-1)).replaceAll("_"," ");
 assert.equal(choice,editorial[p.place_id]?.files?.[0],"User-selected first photo changed");
 const bytes=readFileSync(new URL("../"+p.asset_path,import.meta.url));
 assert.equal(bytes.length,entry.bytes);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),entry.derivative_sha256,"Binary checksum mismatch");
}
for(const h of r.holds)assert.ok(!r.images.some(i=>i.place_id===h.place_id),"Held candidate promoted");
assert.ok(r.no_new_editorial_votes&&r.no_existing_cover_replacements&&r.no_gallery_or_directory_changes);
console.log("PASS B10-B15: 87 exact selected photos + 181 original prior covers preserved; one El Cobre visual hold, 26 technical holds");
