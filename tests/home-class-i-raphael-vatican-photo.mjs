import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026,annualHomeArtworkStatus2026}
 from "../src/home/annual-home-artwork-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl}
 from "../src/home/approved-dated-artwork-2026.js";
import {RAPHAEL_VATICAN_2026_SOURCE,releasedRaphaelVaticanHomeArtwork2026}
 from "../src/home/released-class-i-raphael-transfiguration-2026.js";

const manifest=JSON.parse(readFileSync(new URL(
 "../data/artwork/releases/2026-03-01-raphael-transfiguration-vatican-source.v1.json",import.meta.url),"utf8"));
const proof=JSON.parse(readFileSync(new URL(
 "../data/artwork/releases/2026-03-01-raphael-vatican-photo-byte-proof.v1.json",import.meta.url),"utf8"));
const r=RAPHAEL_VATICAN_2026_SOURCE;
const original=readFileSync(new URL(".."+r.image,import.meta.url));
const hash=alg=>createHash(alg).update(original).digest("hex");
assert.equal(r.date,"2026-03-01");
assert.equal(r.principalId,"tempora:Quad2-0:1:v");
assert.equal(r.properPath,"Tempora/Quad2-0");
assert.deepEqual(r.imageSize,[3737,5691]);
assert.equal(r.photoOriginalBytes,original.length);
assert.equal(proof.bytes,original.length);
assert.equal(proof.sha1,hash("sha1"));
assert.equal(proof.sha256,hash("sha256"));
assert.equal(r.sha1,proof.sha1);
assert.equal(r.sha256,proof.sha256);
assert.deepEqual(proof.dimensions,r.imageSize);
assert.equal(proof.originalKeptUnaltered,true);
assert.equal(proof.sourceIsArtbookScanNotMuseumMaster,true);
assert.equal(original[0],255);assert.equal(original[1],216);
assert.equal(original[original.length-2],255);assert.equal(original[original.length-1],217);
assert.equal(manifest.sourcePhotoFilePage,r.photoFilePage);
assert.equal(manifest.museumObjectUrl,r.sourceObject);
assert.equal(manifest.targetOriginal,r.image.slice(1));
assert.equal(manifest.paintingArtist,r.artist);
assert.equal(manifest.paintingTitle,r.title);
assert.ok(manifest.canonicalObject.includes("MV.40333"));
assert.match(manifest.riskNotes[0],/Dulwich/);
assert.match(manifest.riskNotes[0],/NOT the Vatican painting/);
assert.match(proof.rights,/Public Domain Mark/);
assert.ok(!proof.rights.includes("CC BY-SA"));
assert.equal(r.photoSourceIsMuseumMaster,false);
assert.equal(r.photographCropCertified,false);
const frozen=annualHomeArtworkDay2026(r.date,r.principalId);
assert.equal(frozen?.rank,"I");
assert.deepEqual([frozen?.selection?.title,frozen?.selection?.artist,frozen?.selection?.editorialBasis],
 [r.title,r.artist,r.editorialBasis]);
const state=(principal=r.principalId,path=r.properPath)=>({
 selectedDate:r.date,resolving:false,
 resolution:{date:r.date,status:"ready",day:{main:{id:principal}},
 proper:{status:"ready",sourcePath:path,data:{sourcePath:path}}}
});
const art=releasedRaphaelVaticanHomeArtwork2026(r.date,r.principalId,r.properPath);
assert.ok(art);
assert.equal(art.image,r.image);
assert.equal(art.source,r.sourceObject);
assert.equal(art.imageSource,r.photoFilePage);
assert.equal(art.photoOriginalSha1,r.sha1);
assert.equal(art.photoOriginalSha256,r.sha256);
assert.equal(art.offlineOriginalCertified,true);
assert.equal(art.ownerArtworkDecisionNewlyCreated,false);
assert.equal(art.photographCropCertified,false);
assert.equal(art.titleFr,"La Transfiguration");
assert.deepEqual(approved2026HomeArtwork(state()),art);
assert.equal(annualHomeArtworkStatus2026(r.date,r.principalId,art),"DATED_IMAGE_MAPPED_NOT_VISUALLY_CERTIFIED");
assert.equal(releasedRaphaelVaticanHomeArtwork2026("2026-03-02",r.principalId,r.properPath),null);
assert.equal(releasedRaphaelVaticanHomeArtwork2026(r.date,"wrong",r.properPath),null);
assert.equal(releasedRaphaelVaticanHomeArtwork2026(r.date,r.principalId,"Tempora/Quad3-0"),null);
assert.equal(approved2026HomeArtwork(state("wrong")),null);
assert.equal(approved2026HomeArtwork(state(r.principalId,"Tempora/Quad3-0")),null);
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
for(const held of ["2026-10-25","2026-11-29","2026-09-29"]){
 assert.equal(releasedRaphaelVaticanHomeArtwork2026(held,r.principalId,r.properPath),null);
}
assert.equal(homeArtworkAssetUrl(r.image,{location:{pathname:"/ad-orientem/"}}),"/ad-orientem"+r.image);
assert.equal(homeArtworkAssetUrl(r.image,{location:{pathname:"/"}}),r.image);
assert.ok(existsSync(new URL("../src/home/approved-class-i-exact-source-previews-2026.js",import.meta.url)));
console.log("PASS original 3737x5691 Raphael Vatican MV.40333 byte SHA1/SHA256, strict principal/Proper, PD artbook note, no Dulwich swap, Pages-safe asset");
