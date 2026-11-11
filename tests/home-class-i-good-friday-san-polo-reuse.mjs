import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {annualHomeArtworkDay2026,annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026HomeArtwork,homeArtworkAssetUrl} from "../src/home/approved-dated-artwork-2026.js";
import {FROZEN_GOOD_FRIDAY_2026_SAN_POLO_XII,releasedGoodFridaySanPoloHomeArtwork2026}
 from "../src/home/released-class-i-good-friday-san-polo-2026.js";
import {SAN_POLO_OPTIONAL_CYCLE,SAN_POLO_OPTIONAL_CYCLE_META} from "../src/pray/stations-san-polo-optional-cycle.v1.js";
import {SAN_POLO_PUBLISHED_STATIONS} from "../src/pray/stations-verified-artwork-release.v1.js";
const root=new URL("..",import.meta.url);
const read=p=>readFileSync(new URL(p,root));
const candidate=JSON.parse(read("data/prayer/stations/san-polo-tiepolo-oils-1747/cc-by-sa-complete-series-release-candidate.v1.json"));
const row=candidate.entries.find(x=>x.station===12);
const a=FROZEN_GOOD_FRIDAY_2026_SAN_POLO_XII;
const frozen=annualHomeArtworkDay2026(a.date,a.principalId);
assert.equal(frozen?.rank,"I");
assert.deepEqual([frozen.selection.title,frozen.selection.artist,frozen.selection.artworkId,frozen.selection.editorialBasis],
 [a.title,a.artist,a.artworkId,a.editorialBasis]);
assert.equal(a.date,"2026-04-03");
assert.equal(a.principalId,"tempora:Quad6-5r:1:bv");
assert.equal(a.properPath,"Tempora/Quad6-5r");
assert.equal(a.image,"/assets/stations/san-polo/station-12.webp");
assert.equal(a.source,row.sourceFilePage);
assert.equal(a.sha256,row.sha256);
assert.deepEqual(a.dimensions,row.nativePixelDimensions);
assert.equal(a.photoCredit,row.photographer);
assert.equal(a.photoLicense,"CC BY-SA 4.0");
assert.equal(a.photoLicenseUrl,row.photoLicenseURL);
assert.equal(a.attributionFile,row.licenseAttributionFile);
assert.equal(candidate.assetCount,14);
assert.equal(candidate.licensing.scopedExceptionAuthorized,true);
assert.equal(candidate.licensing.exceptionNotGeneralized,true);
assert.equal(candidate.licensing.shareAlikeScope,"Adapted photograph files, not automatically all app code");
assert.match(candidate.licensing.scopedExceptionScope,/fourteen original Giandomenico Tiepolo San Polo oils/);
assert.equal(row.productionPolicyExceptionAuthorized,true);
assert.equal(row.productionEnabled,false,"Stations default may not silently change");
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0);
assert.equal(SAN_POLO_OPTIONAL_CYCLE_META.defaultEnabled,false);
assert.equal(SAN_POLO_OPTIONAL_CYCLE[12].expectedSHA256,a.sha256);
const p=read(a.image.slice(1)),arch=read(row.repositoryOriginal);
assert.equal(createHash("sha256").update(p).digest("hex"),a.sha256);
assert.equal(createHash("sha256").update(arch).digest("hex"),a.sha256);
assert.equal(p.equals(arch),true,"Must reuse same existing photograph, no new derivative");
assert.equal(p.toString("ascii",0,4),"RIFF");
assert.equal(p.toString("ascii",8,12),"WEBP");
assert.ok(existsSync(new URL(a.attributionFile,root)));
assert.equal(a.newlyLicensedPhotograph,false);
assert.equal(a.addedPhotoBinary,false);
assert.equal(a.ownerCalendarCropApprovedByThisReuse,false);
const state=(principal=a.principalId,proper=a.properPath)=>({
 selectedDate:a.date,resolving:false,
 resolution:{date:a.date,status:"ready",day:{main:{id:principal}},
 proper:{status:"ready",sourcePath:proper,data:{sourcePath:proper}}}
});
const selected=releasedGoodFridaySanPoloHomeArtwork2026(a.date,a.principalId,a.properPath);
assert.ok(selected);
assert.deepEqual(approved2026HomeArtwork(state()),selected);
assert.equal(selected.image,a.image);
assert.equal(selected.infoImage,a.image);
assert.ok(selected.rights.includes(row.photographer));
assert.ok(selected.rights.includes(a.photoLicenseUrl));
assert.ok(selected.rights.includes("resized and converted"));
assert.equal(selected.photographCropCertified,false);
assert.equal(selected.ownerArtworkDecisionNewlyCreated,false);
assert.equal(annualHomeArtworkStatus2026(a.date,a.principalId,selected),
 "DATED_IMAGE_MAPPED_NOT_VISUALLY_CERTIFIED");
assert.equal(releasedGoodFridaySanPoloHomeArtwork2026(a.date,"wrong",a.properPath),null);
assert.equal(releasedGoodFridaySanPoloHomeArtwork2026(a.date,a.principalId,"Tempora/Quad6-4r"),null);
assert.equal(releasedGoodFridaySanPoloHomeArtwork2026("2026-04-04",a.principalId,a.properPath),null);
assert.equal(approved2026HomeArtwork(state("wrong")),null);
assert.equal(approved2026HomeArtwork(state(a.principalId,"Tempora/Quad6-4r")),null);
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
assert.equal(homeArtworkAssetUrl(a.image,{location:{pathname:"/ad-orientem/"}}),
 "/ad-orientem"+a.image);
assert.equal(homeArtworkAssetUrl(a.image,{location:{pathname:"/"}}),a.image);
console.log("PASS Good Friday 2026 frozen exact Tiepolo oil XII, existing CC BY-SA San Polo photo SHA256, licence credit/share-alike, untouched Stations hold, fail-closed date/Proper and Pages path");
