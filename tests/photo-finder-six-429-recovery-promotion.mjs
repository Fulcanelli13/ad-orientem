import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=load("data/geography/research/photo-finder-20261030/releases/retry-429-six-source-verified-covers-promotion-20261101.v1.json");
const stage=load(r.source_verified_report),choices=load(r.original_user_choices).decisions;
const approved=load("data/geography/approved-place-media.v1.json"),gallery=load("data/geography/approved-place-gallery.v1.json");
const fp=x=>({place_id:x.place_id,asset_path:x.asset_path,source_sha1:x.source_sha1,derivative_sha256:x.derivative_sha256,credit:x.credit,license:x.license});
assert.equal(r.schema,"AO_PHOTO_FINDER_429_SIX_EXACT_VERIFIED_COVERS_PROMOTION_V1");
assert.deepEqual([r.previous_covers_count,r.new_covers_count,r.previous_approved_keep.length,r.images.length],[301,307,301,6]);
assert.deepEqual([r.source_retry_attempted,r.source_verified,r.source_retained_holds,stage.staged.length,stage.exceptions.length],[8,6,2,6,2]);
assert.ok(approved.items.length>=307);
assert.equal(new Set(approved.items.map(x=>x.place_id)).size,approved.items.length);
const version=String(approved.version).split(".").map(Number);
assert.ok(version[0]>1||(version[0]===1&&(version[1]>6||(version[1]===6&&version[2]>=8))),"Approved media version may not roll back");
assert.equal(gallery.items.length,35,"Gallery remains out of scope");
const byId=new Map(approved.items.map(x=>[x.place_id,x]));
for(const before of r.previous_approved_keep){const now=byId.get(before.place_id);assert.ok(now,"Prior approved Place removed: "+before.place_id);assert.deepEqual(fp(now),before,"Prior selected image, author or rights replaced: "+before.place_id)}
const original=new Map(stage.staged.map(x=>[x.item.place_id,x]));
for(const entry of r.images){
 const now=byId.get(entry.place_id),src=original.get(entry.place_id);
 assert.ok(now&&src,"Recovered 429 Place cover omitted: "+entry.place_id);
 assert.deepEqual(now,src.item,"Exact original verified media record must be preserved");
 assert.equal(src.publication_status,"RESEARCH_ONLY_NOT_APPROVED_FOR_MAIN","Staging status must not be rewritten");
 assert.equal(entry.research_blob_path,src.research_blob_path);
 assert.deepEqual(fp(now),fp(entry));
 assert.ok(now.status==="APPROVED"&&now.rights_verified&&now.subject_verified&&now.crop_reviewed);
 assert.equal(decodeURIComponent(now.source_url.replace("https://commons.wikimedia.org/wiki/","")).replaceAll("_"," "),choices[entry.place_id]?.files?.[0],"User's selected first photo changed");
 const bytes=readFileSync(new URL("../"+now.asset_path,import.meta.url));
 assert.equal(bytes.length,entry.bytes);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),entry.derivative_sha256,"Recovered WebP transfer bytes changed");
}
const held=new Set(stage.exceptions.map(x=>x.place_id));
assert.deepEqual(held,new Set(["place:PY:caacupe-our-lady-miracles","place:KW:holy-family-cocathedral-kuwait-city"]));
for(const pid of held)assert.ok(!byId.has(pid),"Original mismatch must remain held: "+pid);
assert.ok(!byId.has("place:CU:el-cobre-caridad-basilica"),"El Cobre visual watermark remains held");
assert.equal(existsSync(new URL("../assets/approved/place-media/pf-1c53ceb1de9078a981f323.webp",import.meta.url)),false);
assert.ok(r.no_new_editorial_votes&&r.no_approved_image_replacements&&r.no_gallery_or_place_registry_changes&&r.no_photo_downloads_during_this_promotion&&r.el_cobre_visual_hold_preserved);
console.log("PASS six exact recoveries from eight frozen 429 exceptions; 301 existing protected, two mismatch holds and El Cobre visual hold");
