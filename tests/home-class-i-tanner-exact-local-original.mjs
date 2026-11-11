import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026} from "../src/home/annual-home-artwork-2026.js";
import {TANNER_NICODEMUS_2026_LOCAL_ORIGINAL,releasedTannerNicodemusForClassI2026}
 from "../src/home/released-class-i-tanner-nicodemus-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl,renderApproved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";

const row=TANNER_NICODEMUS_2026_LOCAL_ORIGINAL;
const manifest=JSON.parse(readFileSync(new URL(
 "../data/artwork/releases/2026-05-25-tanner-nicodemus-2400-source.v1.json",import.meta.url),"utf8"));
const proof=JSON.parse(readFileSync(new URL(
 "../data/artwork/releases/2026-05-25-tanner-nicodemus-photo-byte-proof.v1.json",import.meta.url),"utf8"));
const source=readFileSync(new URL(".."+row.image,import.meta.url));
const hash=alg=>createHash(alg).update(source).digest("hex");
assert.equal(row.date,"2026-05-25");
const frozen=annualHomeArtworkDay2026(row.date,row.principalId);
assert.equal(frozen.rank,"I");
assert.equal(frozen.selection.title,row.title);
assert.equal(frozen.selection.artist,row.artist);
assert.equal(frozen.selection.editorialBasis,row.editorialBasis);
assert.equal(manifest.title,row.title);
assert.equal(manifest.artist,row.artist);
assert.equal(manifest.institutionalObject,row.sourceObject);
assert.equal(manifest.photographicSourcePage,row.photoFilePage);
assert.equal(manifest.stagedLocalOriginal,row.image.slice(1));
assert.equal(manifest.originalReportedSha1,row.photoOriginalSha1);
assert.equal(manifest.originalReportedSizeBytes,row.photoOriginalBytes);
assert.deepEqual(manifest.originalReportedDimensions,row.photoOriginalDimensions);
assert.deepEqual(proof.dimensions,row.photoOriginalDimensions);
assert.equal(proof.sha256,hash("sha256"));
assert.equal(proof.sha1,hash("sha1"));
assert.equal(proof.bytes,source.length);
assert.equal(source[0],0xff);assert.equal(source[1],0xd8);
assert.equal(source[source.length-2],0xff);assert.equal(source[source.length-1],0xd9);
assert.match(manifest.photographicSourceRights,/Barbara Katus/);
assert.match(manifest.photographicSourceRights,/non-US/);
assert.equal(homeArtworkAssetUrl(row.image,{location:{pathname:"/ad-orientem/"}}),
 "/ad-orientem"+row.image,"GitHub Pages project must not request host-root image");
assert.equal(homeArtworkAssetUrl(row.image,{location:{pathname:"/"}}),row.image);
assert.equal(homeArtworkAssetUrl("https://upload.wikimedia.org/test.jpg",
 {location:{pathname:"/ad-orientem/"}}),"https://upload.wikimedia.org/test.jpg");
const detailSource=readFileSync(new URL("../src/home/c3-gallery.js",import.meta.url),"utf8");
assert.ok(detailSource.includes("homeArtworkAssetUrl(authoritative.infoImage,win)"),"Home info image must use Pages-safe asset URL");
assert.equal(row.visuallyApprovedForCalendarCrop,false);
assert.equal(row.ownerArtworkDecisionNewlyCreated,false);
const state=(principal=row.principalId,path=row.properPath)=>({
 selectedDate:row.date,resolving:false,
 resolution:{date:row.date,status:"ready",day:{main:{id:principal}},
 proper:{status:"ready",sourcePath:path,data:{sourcePath:path}}}
});
const art=releasedTannerNicodemusForClassI2026(row.date,row.principalId,row.properPath);
assert.ok(art);
assert.equal(art.image,row.image);
assert.equal(art.source,row.sourceObject);
assert.equal(art.imageSource,row.photoFilePage);
assert.equal(art.photoOriginalSha1,proof.sha1);
assert.equal(art.titleFr,"Nicodème");
const created=[];
const mockWin={location:{pathname:"/ad-orientem/"},document:{
 createElement(name){assert.equal(name,"img");const el={
  dataset:{},isConnected:true,addEventListener(){}};created.push(el);return el;}
}};
const slot={children:[],replaceChildren(...x){this.children=x;},
 closest(){return {classList:{remove(){},add(){}},querySelector(){return null}};}};
const frenchState={...state(),language:"fr"};
assert.ok(renderApproved2026HomeArtwork(slot,frenchState,mockWin));
assert.equal(created[0].src,"/ad-orientem"+row.image);
assert.equal(created[0].alt,"Nicodème — Henry Ossawa Tanner");
const englishState={...state(),language:"en"};
assert.ok(renderApproved2026HomeArtwork(slot,englishState,mockWin));
assert.equal(created[1].alt,"Nicodemus — Henry Ossawa Tanner");
assert.equal(art.offlineOriginalCertified,true);
assert.equal(art.photographCropCertified,false);
assert.equal(art.ownerArtworkDecisionNewlyCreated,false);
assert.deepEqual(approved2026HomeArtwork(state()),art);
assert.equal(approved2026HomeArtwork(state("wrong:principal")),null);
assert.equal(approved2026HomeArtwork(state(row.principalId,"Tempora/Pasc7-2")),null);
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
assert.equal(approved2026HomeArtwork({...state(),resolution:{
 ...state().resolution,proper:{status:"loading",sourcePath:row.properPath}}}),null);
assert.equal(releasedTannerNicodemusForClassI2026("2026-05-26",row.principalId,row.properPath),null);
for(const held of ["2026-10-25","2026-11-29","2026-09-29"]){
 assert.equal(releasedTannerNicodemusForClassI2026(held,row.principalId,row.properPath),null);
}
console.log("PASS Tanner 2400x2100 full original source SHA1/SHA256, 2026 Class I work/date/Proper, photo attribution/rights and fail-closed");
