import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolveApprovedPlaceMedia,resolveApprovedPlaceGallery} from "../src/find/place-profiles.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const registry=read("data/geography/seed-registry.v1.json");
const exactSites=new Set(registry.places.map(p=>p.place_id));
const approvedGallery=new Map(gallery.items.filter(g=>g.status==="APPROVED").map(g=>[g.media_id,g]));
const reused=covers.items.filter(x=>x.source_place_ref==="APPROVED_GALLERY_COVER_REUSE_20261031");
assert.equal(reused.length,21,"Exactly 21 existing gallery-only Places reused as covers");
assert.equal(new Set(covers.items.map(x=>x.place_id)).size,covers.items.length,"One canonical cover per Place");
for(const c of reused){
 assert(exactSites.has(c.place_id),"Never introduce substitute Place IDs");
 const g=approvedGallery.get(c.gallery_media_id);
 assert(g,"Missing approved gallery source: "+c.gallery_media_id);
 assert.equal(c.place_id,g.place_id);
 assert.equal(c.asset_path,g.asset_path);
 assert.equal(c.source_url,g.source_url);
 assert.equal(c.source_sha1,g.source_sha1);
 assert.equal(c.derivative_sha256,g.derivative_sha256);
 for(const field of ["rights_verified","subject_verified","crop_reviewed"])assert.equal(g[field],true);
 assert(["place","architecture"].includes(g.chapter_id),"Do not reuse relic/saint detail as site cover");
 assert.equal(g.kind,"PHOTO");
 assert(existsSync(c.asset_path),"Actual binary is missing: "+c.asset_path);
 const bytes=readFileSync(c.asset_path);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),g.derivative_sha256,"No binary changed or lost");
 const effective=resolveApprovedPlaceMedia(covers.items,c.place_id);
 assert(effective,"Existing approved gallery must become a rendered Place cover: "+c.place_id);
 assert.equal(effective.asset_path,g.asset_path);
 assert(resolveApprovedPlaceGallery(gallery.items,c.place_id).some(x=>x.media_id===g.media_id),"Gallery itself remains functional");
}
const invalid={...reused[0],asset_path:"assets/approved/place-gallery/not-a-reviewed-photo.webp",derivative_sha256:null};
assert.equal(resolveApprovedPlaceMedia([invalid],invalid.place_id),null,"Unsafe gallery fallback rejected");
const notre=covers.items.filter(x=>x.place_id==="place:FR:notre-dame-paris");
assert(notre.length<=1,"Notre-Dame must have at most one canonical Place cover");
if(notre.length){
 const n=notre[0];
 assert.equal(n.source_place_ref,"COMMONS_NOTRE_DAME_PARIS_2026_EXACT_SITE");
 assert.equal(n.source_sha1,"6524c0f5eaf0f0ddaae7d669a8cdf7d1123cf3c5");
 assert.equal(n.credit,"Chabe01");
 assert.equal(n.license,"CC-BY-SA-4.0");
 assert.equal(n.asset_path,"assets/approved/place-media/FR-notre-dame-paris-2026.webp");
 assert(existsSync(n.asset_path),"Notre-Dame derivative missing");
 assert.equal(createHash("sha256").update(readFileSync(n.asset_path)).digest("hex"),n.derivative_sha256);
 assert(resolveApprovedPlaceMedia(covers.items,n.place_id),"Notre-Dame approved cover is not renderable");
}

console.log("PASS: 21 vetted gallery cover reuses, plus verified Notre-Dame original if acquired; no unverified media published");
