import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026,annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl} from "../src/home/approved-dated-artwork-2026.js";
import {FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS,
 frozenSelected2026HomeArtwork} from "../src/home/approved-2026-frozen-selected-previews.js";
import {TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026,
 releasedTwoFrozenClassIHomeArtwork2026} from "../src/home/released-class-i-two-frozen-photos-2026.js";
const root=new URL("..",import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(bytes(p).toString("utf8"));
const manifest=json("data/artwork/releases/2026-03-15-07-01-two-frozen-class-i-source-manifest.v1.json");
const proof=json("data/artwork/releases/2026-03-15-07-01-two-class-i-photo-byte-proof.v1.json");
assert.equal(manifest.schema,"AO_CLASS_I_2026_TWO_FROZEN_SOURCE_PHOTO_RELEASE_V1");
assert.equal(proof.schema,"AO_TWO_CLASS_I_2026_SOURCE_MASTER_AND_WEB_IMAGE_HASHES_V1");
assert.equal(manifest.candidates.length,2);
assert.equal(proof.records.length,2);
assert.equal(proof.noNewPaintingSelections,true);
assert.equal(manifest.noNewRightsExceptionCreated,true);
assert.equal(manifest.noOtherArtworksChanged,true);
assert.deepEqual(Object.keys(TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026).sort(),["2026-03-15","2026-07-01"]);
const sha=(alg,b)=>createHash(alg).update(b).digest("hex");
const makeState=(r,principal=r.principalId,proper=r.properPath)=>({
 selectedDate:r.date,resolving:false,route:"home",
 resolution:{date:r.date,status:"ready",day:{main:{id:principal}},
  proper:{status:"ready",sourcePath:proper,data:{sourcePath:proper}}}
});
for(const r of Object.values(TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026)){
 const m=manifest.candidates.find(x=>x.date===r.date);
 const p=proof.records.find(x=>x.date===r.date);
 const legacy=FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS[r.date];
 const frozen=annualHomeArtworkDay2026(r.date,r.principalId);
 assert.ok(m&&p&&legacy&&frozen);
 assert.equal(frozen.rank,"I");
 assert.deepEqual([r.date,r.principalId,r.properPath,r.artworkId,r.title,r.artist,r.editorialBasis],
  [m.date,m.principalId,m.properPath,m.artworkId,m.title,m.artist,m.editorialBasis]);
 assert.deepEqual([r.title,r.artist,r.artworkId,r.editorialBasis],
  [frozen.selection.title,frozen.selection.artist,frozen.selection.artworkId,frozen.selection.editorialBasis]);
 assert.equal(legacy.workGroupId,m.ownerWorkGroupId);
 assert.equal(legacy.photoSha1,m.sourcePhotoSHA1);
 assert.equal(r.originalPhotoSHA1,m.sourcePhotoSHA1);
 assert.equal(r.museumObject,m.museumObjectUrl);
 assert.equal(r.source,m.commonsSourcePage);
 assert.equal(p.museumObject,m.museumObjectUrl);
 assert.equal(p.source,m.commonsSourcePage);
 assert.equal(p.sourceSHA1,m.sourcePhotoSHA1);
 assert.equal(p.sourceOriginalRetained,m.originalImageArchive||m.publishedHomeAsset);
 assert.equal(p.publicAsset,m.publishedHomeAsset);
 assert.equal(p.publicPhotoIsExactOriginal,m.publicImageIsExactOriginal);
 assert.equal(p.photoRights,m.sourcePhotoRights);
 assert.equal(p.artworkSelectionNew,false);
 assert.equal(p.ownerCropCertificationCreated,false);
 const original=bytes(p.sourceOriginalRetained);
 const displayed=bytes(p.publicAsset);
 assert.equal(sha("sha1",original),p.sourceSHA1);
 assert.equal(sha("sha256",original),p.sourceSHA256);
 assert.equal(original.length,p.sourceBytes);
 assert.equal(sha("sha256",displayed),p.publicSHA256);
 assert.equal(displayed.length,p.publicBytes);
 assert.ok(p.publicBytes>100000&&p.publicBytes<3000000);
 assert.ok(p.sourceBytes>100000);
 assert.equal(original[0],255);assert.equal(original[1],216);
 assert.equal(original[original.length-2],255);assert.equal(original[original.length-1],217);
 assert.deepEqual(p.sourceDimensions,m.expectedOriginalDimensions);
 assert.ok(existsSync(new URL(m.publishedHomeAsset,root)));
 if(r.date==="2026-03-15"){
  assert.equal(r.imageStatus,"LOCAL_NGI72_LANFRANCO_ORIGINAL_WGA_PD_ART_SOURCE");
  assert.deepEqual(p.publicDimensions,[1285,683]);
  assert.equal(p.publicBytes,947637);
  assert.equal(p.sourceBytes,p.publicBytes);
  assert.equal(Buffer.compare(original,displayed),0);
  assert.equal(r.originalRetainedInPublishedAsset,true);
  assert.equal(m.neverUpscaleSmallOriginal,true);
  assert.equal(r.isModernMuseumPhotoMaster,false);
  assert.match(r.sourceRights,/jurisdiction/i);
  assert.equal(r.collectionIdentity,"National Gallery of Ireland, NGI.72");
 }else{
  assert.equal(r.imageStatus,"LOCAL_KMSKA297_VAN_DYCK_COMMONS_CC0_FULL_FRAME_WEBP");
  assert.deepEqual(p.sourceDimensions,[4498,6095]);
  assert.deepEqual(p.publicDimensions,[1771,2400]);
  assert.equal(p.sourceBytes,26555298);
  assert.equal(p.publicBytes,470390);
  assert.equal(r.originalRetainedInPublishedAsset,false);
  assert.equal(p.publicPhotoIsExactOriginal,false);
  assert.equal(displayed.toString("ascii",0,4),"RIFF");
  assert.equal(displayed.toString("ascii",8,12),"WEBP");
  assert.match(r.sourceRights,/CC0 1\.0/);
  assert.match(r.sourceRights,/KMSKA/);
  assert.equal(r.collectionIdentity,"Royal Museum of Fine Arts Antwerp (KMSKA), inventory 297");
  assert.equal(m.webMaxEdge,2400);
 }
 const art=releasedTwoFrozenClassIHomeArtwork2026(r.date,r.principalId,r.properPath);
 assert.ok(art);
 assert.deepEqual(approved2026HomeArtwork(makeState(r)),art);
 assert.equal(art.selectionKind,"FROZEN_CLASS_I_TWO_EXACT_LOCAL_SOURCE_PHOTOS");
 assert.equal(art.photoOriginalSha1,legacy.photoSha1);
 assert.equal(art.offlineOriginalCertified,m.publicImageIsExactOriginal);
 assert.equal(art.offlineImageCertified,true);
 assert.equal(art.photographCropCertified,false);
 assert.equal(art.ownerArtworkDecisionNewlyCreated,false);
 assert.equal(art.isUpscaled,false);
 assert.equal(annualHomeArtworkStatus2026(r.date,r.principalId,art),
  "DATED_IMAGE_MAPPED_NOT_VISUALLY_CERTIFIED");
 assert.equal(releasedTwoFrozenClassIHomeArtwork2026(r.date,"wrong",r.properPath),null);
 assert.equal(releasedTwoFrozenClassIHomeArtwork2026(r.date,r.principalId,r.properPath+"-wrong"),null);
 assert.equal(approved2026HomeArtwork(makeState(r,"bad")),null);
 assert.equal(approved2026HomeArtwork(makeState(r,r.principalId,"bad")),null);
 assert.equal(approved2026HomeArtwork({...makeState(r),resolving:true}),null);
 assert.equal(frozenSelected2026HomeArtwork(r.date,r.principalId,r.properPath)?.imageStatus,
  "REMOTE_FROZEN_SELECTED_EXACT_WORK_PREVIEW_NOT_OFFLINE_CERTIFIED",
  "Historical evidence must remain unchanged by local-photo release");
 assert.equal(homeArtworkAssetUrl(r.image,{location:{pathname:"/ad-orientem/"}}),
  "/ad-orientem"+r.image);
}
for(const date of ["2026-09-29","2026-10-25","2026-11-29"]){
 assert.equal(TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026[date],undefined);
 assert.equal(releasedTwoFrozenClassIHomeArtwork2026(date,"x","Sancti/other"),null);
}
console.log("PASS two frozen original photo releases, exact NGI/KMSKA museums, SHA1 and SHA256, public-lightweight full frame, 1962 date/Proper and fail-closed protection");
