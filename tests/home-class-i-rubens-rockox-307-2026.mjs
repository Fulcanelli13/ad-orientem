import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026,annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {classIOwnerSupersession2026} from "../src/home/class-i-2026-owner-supersessions.js";
import {ROCKOX_KMSKA_307_LOCAL_2026,releasedRockoxKmska307ClassI2026} from "../src/home/released-class-i-rubens-rockox-307-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl} from "../src/home/approved-dated-artwork-2026.js";
const root=new URL("..",import.meta.url),read=p=>readFileSync(new URL(p,root));
const proof=JSON.parse(read("data/artwork/releases/2026-04-07-rubens-rockox-kmska307-source.v1.json").toString("utf8"));
const r=ROCKOX_KMSKA_307_LOCAL_2026;
assert.equal(proof.schema,"AO_CLASS_I_ROCKOX_307_2026_EXACT_CENTRE_PANEL_CC0_V1");
assert.deepEqual([proof.date,proof.principalId,proof.properPath,proof.selectedWork,proof.selectedArtist],
 [r.date,r.principalId,r.properPath,r.title,r.artist]);
assert.equal(proof.museumObjectNo,"307");
assert.equal(proof.fullTriptychObjectNumbers,"307-311");
assert.equal(proof.museumObject,r.museumObject);
assert.equal(proof.sourcePage,r.source);
assert.equal(proof.sourceDimensions[0],3396);
assert.equal(proof.sourceDimensions[1],3934);
assert.equal(proof.supersedingOwnerApprovalDate,"2026-10-26");
assert.equal(proof.institutionalCC0ObjectImage,true);
assert.equal(proof.samePhysicalObject,true);
assert.equal(proof.extraCropCreated,false);
assert.equal(proof.originalAlreadyCroppedToOwnerSelectedCentrePanel,true);
assert.equal(proof.noNewPaintingChoice,true);
assert.equal(proof.noGospelVerseClaim,true);
assert.equal(proof.historicalThomasLabelDisputed,true);
assert.match(proof.sourceRights,/CC0/);
assert.match(proof.sourceRights,/jurisdiction/);
assert.equal(proof.unmodifiedPublishedAsset,r.image.slice(1));
const contents=read(proof.unmodifiedPublishedAsset);
assert.ok(contents.length>700000&&contents.length<1200000);
assert.equal(proof.sourceBytes,contents.length);
assert.equal(createHash("sha1").update(contents).digest("hex"),proof.sha1);
assert.equal(createHash("sha256").update(contents).digest("hex"),proof.sha256);
assert.deepEqual([...contents.subarray(0,2)],[255,216]);
assert.deepEqual([...contents.subarray(-2)],[255,217]);
assert.ok(existsSync(new URL(proof.unmodifiedPublishedAsset,root)));
const owner=classIOwnerSupersession2026(r.date,r.principalId,r.properPath);
assert.ok(owner);
assert.equal(owner.ownerDecisionDate,"2026-10-26");
assert.equal(owner.selection.artist,r.artist);
assert.equal(owner.selection.title,r.title);
assert.equal(owner.selection.artworkId,r.artworkId);
assert.equal(owner.image,null,"Superseding approval history is independent of published photo");
assert.equal(annualHomeArtworkDay2026(r.date,r.principalId).selection,owner.selection);
const state=(date=r.date,principal=r.principalId,proper=r.properPath)=>({
 selectedDate:date,route:"home",resolving:false,
 resolution:{date,status:"ready",day:{main:{id:principal}},proper:{status:"ready",sourcePath:proper,data:{sourcePath:proper}}}
});
const art=releasedRockoxKmska307ClassI2026(r.date,r.principalId,r.properPath);
assert.ok(art,"Exact KMSKA panel must be accepted after confirmed institutional CC0");
assert.deepEqual(approved2026HomeArtwork(state()),art);
assert.equal(art.title,r.title);
assert.equal(art.artist,r.artist);
assert.equal(art.artworkId,r.artworkId);
assert.equal(art.image,r.image);
assert.equal(art.imageStatus,"LOCAL_KMSKA_307_OWNER_SELECTED_CENTRE_PANEL_INSTITUTIONAL_CC0_SOURCE");
assert.equal(art.selectionKind,"FROZEN_CLASS_I_LATER_OWNER_RUBENS_KMSKA307_EXACT_LOCAL_CC0_PHOTO");
assert.equal(art.ownerArtworkDecisionNewlyCreated,false);
assert.equal(art.ownerCropDecisionNewlyCreated,false);
assert.equal(art.offlineImageCertified,true);
assert.equal(annualHomeArtworkStatus2026(r.date,r.principalId,art),"DATED_IMAGE_MAPPED_NOT_VISUALLY_CERTIFIED");
assert.equal(homeArtworkAssetUrl(art.image,{location:{pathname:"/ad-orientem/"}}),"/ad-orientem"+r.image);
for(const [d,id,proper] of [
 ["2026-04-07","wrong",r.properPath],
 ["2026-04-07",r.principalId,"Tempora/Pasc0-2-bad"],
 ["2026-04-06","tempora:Pasc0-1:1:w","Tempora/Pasc0-1"],
 ["2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0"],
 ["2026-10-25","sancti:10-DU:1:w","Sancti/10-DU"]
]){
 assert.equal(releasedRockoxKmska307ClassI2026(d,id,proper),null);
 assert.equal(approved2026HomeArtwork(state(d,id,proper)),null);
}
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
console.log("PASS later owner Rubens Rockox centre KMSKA 307 exact source bytes, institutional CC0, proper/principal, Stom separate hold and iconographic caution");
