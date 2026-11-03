import assert from "node:assert/strict";
import "./prayer-artwork-267-integration.mjs";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhoto,releasedModulePhotoMarkup} from "../src/art/released-module-paintings.v1.js";
import {renderPilotAngelusEntry} from "../src/pray/prayer-design-pilot.js";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
assert.deepEqual(Object.keys(RELEASED_MODULE_PAINTINGS),["angelus","adoration","confession","joseph","regina","souls","visit","heart-jesus","heart-mary","king"]);
for(const id of Object.keys(RELEASED_MODULE_PAINTINGS)){
 const a=releasedModulePhoto(id);
 assert.ok(existsSync(new URL("../"+a.image,import.meta.url)), "Released photo missing: "+id);
 assert.ok(existsSync(new URL("../"+a.original,import.meta.url)), "Released original missing: "+id);
 assert.match(a.source,id==="confession"?/^https:\/\/www.nga.gov\/artworks\/34956-return-prodigal-son$/:["angelus","adoration"].includes(id)?/^https:\/\/www.metmuseum.org\/art\/collection\/search\//:/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 const markup=releasedModulePhotoMarkup(id,{className:"aoTestPhoto"});
 assert.match(markup,/data-ao-released-module-photo/);
 assert.match(markup,id==="confession"?/data-ao-photo-release-pr="2293"/:["angelus","adoration"].includes(id)?/data-ao-photo-release-pr="2277"/:["joseph","regina","souls","visit"].includes(id)?/data-ao-photo-release-pr="2296"/:/data-ao-photo-release-pr="2302"/);
 assert.ok(markup.includes(a.image));
}
const murillo=RELEASED_MODULE_PAINTINGS.confession;
assert.ok(murillo.original===murillo.image,"Preserve exactly user-approved whole NGA original; no unseen crop");
assert.match(murillo.photographRights,/CC0/);
assert.equal(createHash("sha256").update(readFileSync(new URL("../"+murillo.image,import.meta.url))).digest("hex"),
 "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7",
 "Confession released original must be bit-identical to the user-approved eight-photo archive");
assert.ok(releasedModulePhotoMarkup("confession").includes("confession-murillo-nga-original.jpg"));
const wave=JSON.parse(source("data/research/module-hero-eight-publication-decision-20261102.v1.json"));
assert.equal(wave.totalReviewed,8);
assert.equal(wave.photoApproved,8);
assert.equal(wave.publicationCleared,1);
assert.equal(wave.publicationProposed.length,1);
assert.equal(wave.publicationProposed[0].module,"confession");
assert.equal(wave.heldPhotographs.length,7);
assert.ok(wave.heldPhotographs.every(row=>row.photoApproved===true));
assert.equal(wave.publicationProposed[0].gitBlobSha,"c0904b5d2a6a4bd99b224194217ce45c6a9fe676");
assert.equal(releasedModulePhoto("sorrows"),null,"Approved painting != clearance of the MNAC photograph");
const originals={
 joseph:"d632ea2012825ecdccc760f50b7cc9107a30bf4a2349541742ef6f66a4987f9b",
 regina:"ab93fd9a928693d2797a0eadd69dc630e4cf2da59233c3f512b9921dfcfeb178",
 souls:"a2c3a6eda78b412da44d50197d853f01e1cd3ded5ebd5996816db451f11606b6",
 visit:"347cf5d74cc575bcb082250a90dc64c54dc673e94fbc4e48efcd27fa2a3b09c1"
};
for(const [id,expected] of Object.entries(originals)){
 const x=releasedModulePhoto(id);
 assert.equal(x.image,x.original,"Do not crop or substitute approved source: "+id);
 assert.match(x.photographRights,/PD-Art/);
 assert.equal(createHash("sha256").update(readFileSync(new URL("../"+x.image,import.meta.url))).digest("hex"),expected,"Approved original hash drift: "+id);
}
for(const id of ["scripture","sorrows","morning"])assert.equal(releasedModulePhoto(id),null,"Unreleased photo remains held: "+id);
const wave3=JSON.parse(source("data/research/module-hero-wave3-four-photo-release-20261103.v1.json"));
assert.equal(wave3.counts.newReleaseCandidates,4);
assert.deepEqual(wave3.releaseCandidates.map(x=>x.module),["joseph","regina","souls","visit"]);
assert.deepEqual(wave3.heldPhotos.map(x=>x.module),["morning","scripture","sorrows"]);
for(const record of wave3.releaseCandidates){
 assert.equal(record.sha256,originals[record.module],"Release ledger source SHA must match actual archive");
 assert.equal(record.gitBlobSha,{
  joseph:"6a3760cd019ad1993d78450e2f539bd2c9037c50",
  regina:"25bd905c5825381f17fe11e90ee8e5c5218ac16d",
  souls:"ebc10d8720cfc66d14e3561078336591fd502e52",
  visit:"d21c497238aaa7c25fdd39e47cee07a0cd672702"
 }[record.module],"Release ledger Git source blob mismatch");
 assert.equal(record.displayFit,"contain");
 assert.equal(record.cropMade,false);
}

const args={head:()=>"",L:(en,fr)=>en,esc:s=>s,posture:"Kneel",moduleIcon:()=>"",recitation:"individual",hour:12};
const angelus=renderPilotAngelusEntry({...args,form:"angelus"});
assert.ok(angelus.includes("angelus-frameless.webp"));
assert.ok(angelus.includes('data-ao-art-publication="released"'));
const regina=renderPilotAngelusEntry({...args,form:"regina"});
assert.ok(!regina.includes("angelus-frameless.webp"));
assert.ok(regina.includes('data-ao-art-publication="released"'));
assert.ok(regina.includes("regina-whole-original.jpg"),"Regina must use Rubens, never Champaigne");
assert.ok(!angelus.includes("regina-whole-original.jpg"),"Angelus must never use the Regina painting");
const pilot=source("src/pray/prayer-design-pilot.js");
const runtime=source("src/pray/presentation-runtime.js");
const home=source("src/home/c3-gallery.js");
for(const s of ['resolvePrayerEditorialArtwork(slot.slotId)','aoPrayPilotReleasedTilePhoto','releasedModulePhotoMarkup(regina?"regina":"angelus"'])
 assert.ok(pilot.includes(s),"Missing Prayer discovery/Angelus integration "+s);
for(const s of ['familyId==="eucharistic"','releasedModulePhotoMarkup("adoration"','releasedDoorPhoto?', 'aoPrayerAdorationCover'])
 assert.ok(runtime.includes(s),"Missing Prayer shelf/Adoration integration "+s);
assert.ok(home.includes("C3_APPROVED_MET_PRAYER_ART=RELEASED_MODULE_PAINTINGS"),"Home must share released registry");
assert.ok(home.includes('page?.route==="pray.confession"'),"Home must show only original NGA scene for the Confession route");
assert.ok(runtime.includes('releasedModulePhotoMarkup("confession"'),"Canonical Confession reader missing original image");
assert.ok(runtime.includes("globalThis.__AO_PRAYER_ART_QA_PREVIEW__===true"),"Existing research-only QA path must remain separate");
for(const id of ["joseph","visit"])
 assert.ok(runtime.includes("releasedModulePhotoMarkup('"+id+"'"),"Reader did not bind user-approved "+id+" original");
const wave4=JSON.parse(source("data/research/module-hero-wave4-companion-hearts-king-20261103.v1.json"));
assert.deepEqual(wave4.candidates.map(x=>x.module),["heart-jesus","heart-mary","king"]);
const originals4={
 "heart-jesus":"06f940863256dfc4877814b33a54340fb8ec9c07f04097f8b3f73985a3583249",
 "heart-mary":"82e465f5600d0df4b2af32d22b8642a832bfc4cdd5d19d1f1c2b0baeec49649d",
 king:"2a25ed08f0fc21825eb084e0f5a09de63e8bdcf13c42d8b008d1d3bc805d3cd5"
};
for(const c of wave4.candidates){
 const art=releasedModulePhoto(c.module);
 assert.equal(art.original,art.image,"Wave4 must not crop or substitute original: "+c.module);
 assert.equal(c.sha256,originals4[c.module]);
 assert.equal(c.image,art.image);
 assert.equal(createHash("sha256").update(readFileSync(new URL("../"+art.image,import.meta.url))).digest("hex"),c.sha256,
  "Wave4 original SHA-256 changed: "+c.module);
 assert.match(art.photographRights,/PD-Art/);
 assert.equal(c.fit,"contain");
}
assert.ok(runtime.includes("if(s===0)return")&&runtime.includes("releasedModulePhotoMarkup('heart-jesus'"),"First Friday original artwork in first stage missing");
assert.ok(runtime.includes("releasedModulePhotoMarkup('heart-mary'"),"First Saturday original artwork in first stage missing");
assert.ok(runtime.includes("BEN.celebration==='christKing'&&i===0?releasedModulePhotoMarkup('king'"),"Christ King must be optional and scoped");
assert.ok(runtime.includes("prayerEditorialArtworkMarkup('COV-'+id"),"Individual prayer cards must use exact-slot editorial art");
assert.ok(!runtime.includes("const soulsCover="),"Do not override the Rubens De profundis selection with Giordano");
assert.ok(source("src/pray/art-slot-map.v1.js").includes("publicationState:editorial.state"),"Nine doors must use reconciled editorial states");
assert.ok(source("src/pray/stations-verified-artwork-release.v1.js").includes("Object.freeze({})"),"Do not publish staged Stations");
console.log("Released art bridge PASS: 10 original published photos, exact scoped wave4 and 267 fail-closed editorial slots.");
