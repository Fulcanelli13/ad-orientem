import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhotoMarkup} from "../src/art/released-module-paintings.v1.js";
import {resolvePrayerEditorialArtwork,prayerEditorialArtworkMarkup,prayerEditorialPublicationSummary} from "../src/pray/art-slot-map.v1.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const master=read("data/prayer/artwork-editorial-20261101/met-two-frameless-eight-slot-release-20261103.v1.json");
const proof=read("data/prayer/artwork-editorial-20261101/met-two-frameless-pixel-proof-20261103.v1.json");
assert.equal(master.governance,"DRAFT_NOT_YET_PRODUCTION");
assert.equal(master.expectedSlotCount,8);assert.equal(master.works.length,2);
const proofById=new Map(proof.works.map(x=>[x.artId,x]));
let count=0;
for(const w of master.works){
 const a=RELEASED_MODULE_PAINTINGS[w.artId],p=proofById.get(w.artId);
 assert.ok(a&&p,"Missing release image or pixel proof "+w.artId);
 assert.equal(a.original,w.original);assert.equal(a.image,w.image);
 assert.equal(a.source,w.source);assert.equal(a.artist,w.artist);
 assert.equal(a.releasePr,2354);
 assert.match(a.photographRights,/Metropolitan Museum.*(?:CC0|public domain)/);
 assert.ok(existsSync(new URL("../"+a.original,import.meta.url)));
 assert.ok(existsSync(new URL("../"+a.image,import.meta.url)));
 assert.equal(createHash("sha256").update(readFileSync(new URL("../"+a.original,import.meta.url))).digest("hex"),w.sha256,"Original Met bytes cannot change");
 assert.equal(readFileSync(new URL("../"+a.original,import.meta.url)).length,w.bytes);
 assert.equal(createHash("sha256").update(readFileSync(new URL("../"+a.image,import.meta.url))).digest("hex"),p.imageSha256,"Frameless source derivative hash drift");
 assert.equal(p.originalSha256,w.sha256);
 assert.deepEqual(p.cropBounds,w.bbox);
 assert.equal(p.imageWidth,w.bbox[2]-w.bbox[0]);
 assert.equal(p.imageHeight,w.bbox[3]-w.bbox[1]);
 assert.ok(p.removedBlackPaddingFraction>0.999,"No hand-cut or content-bearing crop: "+w.artId);
 assert.equal(p.displayDerivativeContainsAllPaintedPixels,true);
 assert.equal(p.protectedOriginalUntouched,true);
 assert.ok(releasedModulePhotoMarkup(w.artId).includes('data-ao-photo-release-pr="2354"'));
 for(const id of w.slots){
  const resolved=resolvePrayerEditorialArtwork(id);
  assert.equal(resolved.state,"PUBLISHED_EXACT_PHOTO",id);
  assert.equal(resolved.artId,w.artId,id);
  assert.equal(resolved.editorial.selected.sourcePage,w.source,id);
  assert.equal(resolved.editorial.hold,false,id);
  assert.equal(resolved.editorial.protectedCover,false,id);
  assert.ok(prayerEditorialArtworkMarkup(id).includes(w.image),id);
  count++;
 }
}
assert.equal(count,8);
const states=prayerEditorialPublicationSummary().states;
assert.equal(states.PUBLISHED_EXACT_PHOTO,51);
assert.equal(states.APPROVED_EXACT_PHOTO_PENDING,138);
for(const id of ["COV-pray.rosary","COV-prayer.seven_sorrows_chaplet","COV-pray.confession","COV-novena.st_therese"]){
 assert.equal(resolvePrayerEditorialArtwork(id).state,"PROTECTED_EXISTING_COVER",id);
}
for(const id of ["COV-dead_de_profundis","COV-foundations_eternal_rest","COV-novena.holy_souls","STG-pray.penitential_psalms-06"]){
 const art=resolvePrayerEditorialArtwork(id);
 assert.equal(art.state,"APPROVED_EXACT_PHOTO_PENDING",id);
 assert.equal(art.photo,null,"The museum Workshop of Rubens may not silently become a Rubens original");
}
for(const id of ["COV-pray.stations","STG-pray.seven_words-01"]){
 const art=resolvePrayerEditorialArtwork(id);
 assert.equal(art.state,"APPROVED_EXACT_PHOTO_PENDING",id);
 assert.equal(art.photo,null,"CMA follower of Sodoma is attribution-held");
}
assert.equal(resolvePrayerEditorialArtwork("HERO-05").state,"PROVISIONAL_NOT_PUBLISHED");
assert.equal(resolvePrayerEditorialArtwork("HERO-03").state,"SCOPE_HOLD");
console.log("PASS two original Met JPEG SHA256, two frame-only derivatives, eight approved exact slots, 51 total photos, 15 attribution-held slots remain unavailable");
