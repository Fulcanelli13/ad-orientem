import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhotoMarkup} from "../src/art/released-module-paintings.v1.js";
import {resolvePrayerEditorialArtwork,prayerEditorialArtworkMarkup,prayerEditorialPublicationSummary} from "../src/pray/art-slot-map.v1.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const spec=read("data/prayer/artwork-editorial-20261101/museum-four-originals-staging-20261103.v1.json");
assert.equal(spec.publicReleaseAllowed,false,"Original research/staging manifest must not pretend to grant photo publication");
assert.equal(spec.works.length,4);
assert.equal(spec.coveredCanonicalSlots,15);
const used=new Set();
for(const w of spec.works){
 const photo=RELEASED_MODULE_PAINTINGS[w.id];
 assert.ok(photo,"Release registry missing "+w.id);
 assert.equal(photo.source,w.sourcePage);
 assert.equal(photo.image,w.image);
 assert.equal(photo.original,w.image,"No resized or cropped substitute in this release");
 assert.equal(photo.releasePr,2340);
 assert.ok(photo.photographRights.includes("CC0")||photo.photographRights.includes("public domain"));
 assert.ok(existsSync(new URL("../"+photo.image,import.meta.url)),"Missing source original "+w.id);
 const b=readFileSync(new URL("../"+photo.image,import.meta.url));
 assert.equal(b.length,w.bytes,"Museum photo byte drift: "+w.id);
 assert.equal(createHash("sha256").update(b).digest("hex"),w.sha256,"Museum photo SHA-256 drift: "+w.id);
 assert.equal(b.readUInt16BE(0),0xffd8,"JPEG MIME expected");
 assert.equal(w.slots.length,{bouts:4,cavallino:5,girardin:3,hondius:3}[w.id]);
 for(const slotId of w.slots){
  assert.ok(!used.has(slotId),"Repeated slot "+slotId);used.add(slotId);
  const row=resolvePrayerEditorialArtwork(slotId);
  assert.equal(row.state,"PUBLISHED_EXACT_PHOTO",slotId);
  assert.equal(row.artId,w.id,slotId);
  assert.equal(row.editorial.selected.sourcePage,w.sourcePage,"Source must be exact, not title guess");
  assert.equal(row.editorial.hold,false);
  assert.equal(row.editorial.protectedCover,false);
  assert.ok(prayerEditorialArtworkMarkup(slotId,{className:"aoPrayerEditorialCardCover"}).includes(w.image),slotId);
  assert.match(prayerEditorialArtworkMarkup(slotId),/data-ao-editorial-slot=/);
 }
 assert.ok(releasedModulePhotoMarkup(w.id).includes('data-ao-photo-release-pr="2340"'));
}
assert.equal(used.size,15);
const counts=prayerEditorialPublicationSummary().states;
assert.equal(counts.PUBLISHED_EXACT_PHOTO,43);
assert.equal(counts.APPROVED_EXACT_PHOTO_PENDING,146);
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),267);
for(const id of ["COV-pray.confession","COV-novena.st_therese","COV-pray.rosary","COV-prayer.seven_sorrows_chaplet"])
 assert.equal(resolvePrayerEditorialArtwork(id).state,"PROTECTED_EXISTING_COVER",id);
for(const id of ["COV-dead_de_profundis","COV-foundations_eternal_rest","COV-novena.holy_souls"]){
 const art=resolvePrayerEditorialArtwork(id);
 assert.equal(art.state,"APPROVED_EXACT_PHOTO_PENDING",id);
 assert.equal(art.photo,null,"Do not substitute Giordano for the selected Rubens Holy Souls work");
}
assert.equal(resolvePrayerEditorialArtwork("HERO-05").state,"PROVISIONAL_NOT_PUBLISHED");
assert.equal(resolvePrayerEditorialArtwork("HERO-03").state,"SCOPE_HOLD");
console.log("PASS: four exact museum originals, 15 source-identical approved slots; 43/267 resolver matches and no hold overrides");
