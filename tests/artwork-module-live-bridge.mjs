import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhoto,releasedModulePhotoMarkup} from "../src/art/released-module-paintings.v1.js";
import {renderPilotAngelusEntry} from "../src/pray/prayer-design-pilot.js";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
assert.deepEqual(Object.keys(RELEASED_MODULE_PAINTINGS),["angelus","adoration","confession","joseph","regina","souls","visit"]);
for(const id of Object.keys(RELEASED_MODULE_PAINTINGS)){
 const a=releasedModulePhoto(id);
 assert.ok(existsSync(new URL("../"+a.image,import.meta.url)), "Released photo missing: "+id);
 assert.ok(existsSync(new URL("../"+a.original,import.meta.url)), "Released original missing: "+id);
 assert.match(a.source,id==="confession"?/^https:\/\/www.nga.gov\/artworks\/34956-return-prodigal-son$/:["angelus","adoration"].includes(id)?/^https:\/\/www.metmuseum.org\/art\/collection\/search\//:/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 const markup=releasedModulePhotoMarkup(id,{className:"aoTestPhoto"});
 assert.match(markup,/data-ao-released-module-photo/);
 assert.match(markup,id==="confession"?/data-ao-photo-release-pr="2293"/:["angelus","adoration"].includes(id)?/data-ao-photo-release-pr="2277"/:/data-ao-photo-release-pr="2296"/);
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
for(const s of ['tile.id==="eucharistic"','aoPrayPilotReleasedTilePhoto','releasedModulePhotoMarkup("angelus"'])
 assert.ok(pilot.includes(s),"Missing Prayer discovery/Angelus integration "+s);
for(const s of ['familyId==="eucharistic"','releasedModulePhotoMarkup("adoration"','releasedDoorPhoto?', 'aoPrayerAdorationCover'])
 assert.ok(runtime.includes(s),"Missing Prayer shelf/Adoration integration "+s);
assert.ok(home.includes("C3_APPROVED_MET_PRAYER_ART=RELEASED_MODULE_PAINTINGS"),"Home must share released registry");
assert.ok(home.includes('page?.route==="pray.confession"'),"Home must show only original NGA scene for the Confession route");
assert.ok(runtime.includes('releasedModulePhotoMarkup("confession"'),"Canonical Confession reader missing original image");
assert.ok(runtime.includes("globalThis.__AO_PRAYER_ART_QA_PREVIEW__===true"),"Existing research-only QA path must remain separate");
for(const id of ["joseph","souls","visit"])
 assert.ok(runtime.includes("releasedModulePhotoMarkup('"+id+"'"),"Reader did not bind user-approved "+id+" original");
assert.ok(source("src/pray/art-slot-map.v1.js").includes('publicationState:"UNASSIGNED"'),"Do not auto-release other door artwork");
assert.ok(source("src/pray/stations-verified-artwork-release.v1.js").includes("Object.freeze({})"),"Do not publish staged Stations");
console.log("Released art bridge PASS: two Met, one NGA and four original PD-Art paintings; SHA-256, routes and all holds guarded.");
