import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {annualHomeArtworkDay2026} from "../src/home/annual-home-artwork-2026.js";
import {RELEASED_MODULE_PAINTINGS} from "../src/art/released-module-paintings.v1.js";
import {CLASS_I_REUSED_LOCAL_EXACT_PHOTOS_2026,releasedExactClassIPhotoReuse2026,
 approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";

const cases=[
 ["2026-02-18","tempora:Quadp3-3:1:v","Tempora/Quadp3-3","latour"],
 ["2026-05-31","tempora:Pent01-0r:1:w","Tempora/Pent01-0r","girardin"],
 ["2026-12-25","sancti:12-25m1:1:w","Sancti/12-25m1","cavallino"]
];
const build=(date,principalId,properPath)=>({
 selectedDate:date,resolving:false,resolution:{date,status:"ready",day:{main:{id:principalId}},
 proper:{status:"ready",sourcePath:properPath,data:{sourcePath:properPath}}}
});
assert.equal(Object.keys(CLASS_I_REUSED_LOCAL_EXACT_PHOTOS_2026).length,3);
for(const [date,principal,path,photoId] of cases){
 const rule=CLASS_I_REUSED_LOCAL_EXACT_PHOTOS_2026[date];
 const frozen=annualHomeArtworkDay2026(date, date==="2026-12-25"?"sancti:12-25m1:1:w":principal);
 const photo=RELEASED_MODULE_PAINTINGS[photoId];
 assert.equal(frozen.rank,"I");
 assert.equal(frozen.selection.title,photo.title);
 assert.equal(frozen.selection.artist,photo.artist);
 assert.equal(frozen.selection.artworkId,rule.artworkId);
 assert.equal(photo.source,rule.originalSource);
 assert.ok(existsSync(new URL("../"+photo.original,import.meta.url)));
 assert.ok(existsSync(new URL("../"+photo.image,import.meta.url)));
 const actual=releasedExactClassIPhotoReuse2026(date,principal,path);
 assert.ok(actual,date+" should reuse exact released photo");
 assert.equal(actual.releasePr,photo.releasePr);
 assert.equal(actual.image,"/"+photo.image);
 assert.equal(actual.infoImage,"/"+photo.original);
 assert.equal(actual.imageStatus,"PREVIOUSLY_RELEASED_LOCAL_EXACT_ORIGINAL");
 assert.equal(actual.offlineOriginalCertifiedByPriorRelease,true);
 assert.equal(actual.calendarPhoneVisualAcceptanceCertified,false);
 assert.equal(actual.ownerArtworkDecisionNewlyCreated,false);
 assert.deepEqual(approved2026HomeArtwork(build(date,principal,path)),actual);
 assert.equal(releasedExactClassIPhotoReuse2026(date,"wrong:principal",path),null);
 assert.equal(releasedExactClassIPhotoReuse2026(date,principal,path+"-wrong"),null);
 assert.equal(approved2026HomeArtwork({...build(date,principal,path),resolving:true}),null);
 assert.equal(approved2026HomeArtwork({...build(date,principal,path),resolution:{
  ...build(date,principal,path).resolution,proper:{status:"loading",sourcePath:path}}}),null);
}
for(const n of [1,2,3]){
 const principal="sancti:12-25m"+n+":1:w",path="Sancti/12-25m"+n;
 assert.ok(releasedExactClassIPhotoReuse2026("2026-12-25",principal,path));
 for(const m of [1,2,3].filter(x=>x!==n))
  assert.equal(releasedExactClassIPhotoReuse2026("2026-12-25",principal,"Sancti/12-25m"+m),null);
}
for(const held of ["2026-10-25","2026-11-29","2026-09-29","2026-04-03"]){
 assert.equal(CLASS_I_REUSED_LOCAL_EXACT_PHOTOS_2026[held],undefined);
 assert.equal(releasedExactClassIPhotoReuse2026(held,"x","Sancti/test"),null);
}
const closeout=JSON.parse(readFileSync(new URL(
 "../data/artwork/sacred-art-2026-definitive-closeout-20261111.v1.json",import.meta.url),"utf8"));
assert.equal(closeout.counts.calendarProductionActions.RELEASE_EXISTING_FROZEN_CLASS_I_SELECTION,29,
 "Historical 29 pending cases must not be silently rewritten by these three preview upgrades");
console.log("PASS 3 pre-released Class I exact original reuse pins, 3 Christmas Masses, frozen approvals, rights and date guards");
