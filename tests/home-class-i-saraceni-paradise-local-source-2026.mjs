import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026,annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl} from "../src/home/approved-dated-artwork-2026.js";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";
import {SARACENI_PARADISE_2026,releasedSaraceniParadiseClassI2026} from "../src/home/released-class-i-saraceni-paradise-2026.js";

const root=new URL("..",import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const proof=JSON.parse(read("data/artwork/releases/2026-11-01-saraceni-met-cc0-byte-proof.v1.json").toString("utf8"));
const r=SARACENI_PARADISE_2026;
const day=annualHomeArtworkDay2026(r.date,r.principalId);
assert.equal(proof.schema,"AO_CLASS_I_SARACENI_MET_CC0_EXACT_SOURCE_BYTES_V1");
assert.deepEqual([proof.date,proof.principalId,proof.properPath,proof.selectedTitle,proof.selectedArtist],
 [r.date,r.principalId,r.properPath,r.title,r.artist]);
assert.equal(proof.newArtworkSelection,false);
assert.equal(proof.ownerCropApprovalCreated,false);
assert.equal(proof.publishedUnmodifiedOriginal,true);
assert.equal(proof.publishedAsset,r.image.slice(1));
assert.equal(proof.photoSourceOriginalSha1,r.sourceOriginalSha1);
assert.equal(proof.photoSourceOriginalSha256,r.sourceOriginalSha256);
assert.deepEqual(proof.sourceDimensions,[3273,3695]);
assert.equal(proof.sourceBytes,2879956);
assert.equal(proof.metObjectId,437607);
assert.equal(proof.accession,"1971.93");
assert.equal(proof.commonsFilePage,r.source);
assert.equal(proof.museumObjectUrl,r.museumObject);
assert.match(proof.licence,/CC0/);
const bytes=read(proof.publishedAsset);
const sha=alg=>createHash(alg).update(bytes).digest("hex");
assert.equal(bytes.length,proof.sourceBytes);
assert.equal(sha("sha1"),proof.photoSourceOriginalSha1);
assert.equal(sha("sha256"),proof.photoSourceOriginalSha256);
assert.deepEqual([...bytes.subarray(0,2)],[255,216]);
assert.deepEqual([...bytes.subarray(-2)],[255,217]);
assert.ok(existsSync(new URL(proof.publishedAsset,root)));
assert.equal(day?.rank,"I");
assert.deepEqual([day.selection.title,day.selection.artist,day.selection.artworkId,day.selection.editorialBasis],
 [r.title,r.artist,r.artworkId,r.editorialBasis]);
const previous=APPROVED_CLASS_I_2026.find(x=>x.date===r.date);
assert.equal(APPROVED_CLASS_I_2026.length,10);
assert.equal(previous?.title,r.title);
assert.equal(previous?.source,r.source);
assert.equal(previous?.imagePublicationStatus,"REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED");
const state=(date=r.date,principal=r.principalId,proper=r.properPath)=>({
 selectedDate:date,resolving:false,route:"home",
 resolution:{date,status:"ready",day:{main:{id:principal}},
  proper:{status:"ready",sourcePath:proper,data:{sourcePath:proper}}}
});
const selected=releasedSaraceniParadiseClassI2026(r.date,r.principalId,r.properPath);
assert.ok(selected);
assert.deepEqual(approved2026HomeArtwork(state()),selected);
assert.equal(selected.artworkId,r.artworkId);
assert.equal(selected.title,r.title);
assert.equal(selected.artist,r.artist);
assert.equal(selected.source,r.source);
assert.equal(selected.image,r.image);
assert.equal(selected.imageStatus,"LOCAL_SARACENI_MET_1971_93_CC0_ORIGINAL_BYTE_VERIFIED");
assert.equal(selected.selectionKind,"FROZEN_CLASS_I_SARACENI_MET_CC0_EXACT_LOCAL_SOURCE_PHOTO");
assert.equal(selected.offlineOriginalCertified,true);
assert.equal(selected.photographCropCertified,false);
assert.equal(selected.ownerArtworkDecisionNewlyCreated,false);
assert.match(selected.rights,/CC0/);
assert.equal(annualHomeArtworkStatus2026(r.date,r.principalId,selected),
 "DATED_IMAGE_MAPPED_NOT_VISUALLY_CERTIFIED");
assert.equal(homeArtworkAssetUrl(selected.image,{location:{pathname:"/ad-orientem/"}}),
 "/ad-orientem"+r.image);
for(const [d,p,q] of [
 ["2026-11-01","wrong",r.properPath],
 ["2026-11-01",r.principalId,"Sancti/11-01-bad"],
 ["2026-11-02",r.principalId,r.properPath],
 ["2026-10-25","sancti:10-DU:1:w","Sancti/10-DU"],
 ["2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0"]
]){
 assert.equal(releasedSaraceniParadiseClassI2026(d,p,q),null);
 assert.equal(approved2026HomeArtwork(state(d,p,q)),null);
}
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
console.log("PASS frozen All Saints: exact Met 1971.93 Saraceni Paradise CC0 full JPEG bytes, SHA1/SHA256, immutable prior source, 1962 date/Proper, rights holds and fail-closed");
