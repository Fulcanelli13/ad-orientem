import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {approved2026HomeArtwork,homeArtworkAssetUrl} from "../src/home/approved-dated-artwork-2026.js";
import {annualHomeArtworkDay2026} from "../src/home/annual-home-artwork-2026.js";
import {CARAVAGGIO_EMMAUS_NG172_2026 as row,releasedCaravaggioEmmausClassI2026} from "../src/home/released-class-i-caravaggio-emmaus-2026.js";
const root=new URL("..",import.meta.url);
const read=p=>readFileSync(new URL(p,root));
const p=JSON.parse(read("data/artwork/releases/2026-04-06-caravaggio-ng172-1601-byte-proof.v1.json").toString("utf8"));
assert.equal(p.schema,"AO_CLASS_I_EMMAUS_NG172_1601_SOURCE_AND_MOBILE_BYTES_V1");
assert.deepEqual([p.date,p.principalId,p.properPath,p.frozenTitle,p.frozenArtist],
 [row.date,row.principalId,row.properPath,row.title,row.artist]);
assert.equal(p.physicalWork,"National Gallery, London, NG172, 1601");
assert.equal(p.physicalWorkReference,row.museumObject);
assert.equal(p.commonsFilePage,row.source);
assert.match(p.sameTitleExcluded,/1606.*Brera/);
assert.equal(p.physicalVersionOwnerApprovalPreviouslyRecorded,false);
assert.equal(p.cropOwnerApprovalCreated,false);
assert.equal(p.newPaintingTitleOrArtistSelection,false);
assert.match(p.photographRights,/jurisdictions may restrict/);
assert.deepEqual(p.sourceDimensions,[11412,8117]);
assert.deepEqual(p.publishedImageDimensions,[2400,1707]);
assert.equal(p.publishedHomeImage,row.image.slice(1));
assert.equal(p.sourceOriginalArchive,"data/artwork/releases/source-masters/caravaggio-emmaus-ng172-london-1601-original.jpg");
const source=read(p.sourceOriginalArchive),publicFile=read(p.publishedHomeImage);
assert.equal(source.length,p.sourceBytes);
assert.equal(publicFile.length,p.publishedImageBytes);
assert.equal(createHash("sha1").update(source).digest("hex"),p.sourceSha1);
assert.equal(createHash("sha256").update(source).digest("hex"),p.sourceSha256);
assert.equal(createHash("sha256").update(publicFile).digest("hex"),p.publishedImageSha256);
assert.deepEqual([...source.subarray(0,2)],[255,216]);
assert.deepEqual([...source.subarray(-2)],[255,217]);
assert.equal(publicFile.toString("ascii",0,4),"RIFF");
assert.equal(publicFile.toString("ascii",8,12),"WEBP");
assert.ok(publicFile.length>100000&&publicFile.length<3000000);
assert.ok(existsSync(new URL(p.sourceOriginalArchive,root)));
const frozen=annualHomeArtworkDay2026(row.date,row.principalId);
assert.equal(frozen?.rank,"I");
assert.equal(frozen.selection.title,row.title);
assert.equal(frozen.selection.artist,row.artist);
assert.equal(frozen.selection.artworkId,null);
assert.equal(frozen.selection.editorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
assert.equal(frozen.selection.publicationCertified,false);
const state=(date=row.date,principal=row.principalId,proper=row.properPath)=>({
 selectedDate:date,route:"home",resolving:false,
 resolution:{date,status:"ready",day:{main:{id:principal}},
  proper:{status:"ready",sourcePath:proper,data:{sourcePath:proper}}}
});
const art=releasedCaravaggioEmmausClassI2026(row.date,row.principalId,row.properPath);
assert.ok(art);
assert.deepEqual(approved2026HomeArtwork(state()),art);
assert.equal(art.selectionKind,"FROZEN_CLASS_I_CARAVAGGIO_EMMAUS_1601_LONDON_VERIFIED_SOURCE");
assert.equal(art.imageStatus,"LOCAL_EMMAUS_1601_NG172_PD_ART_FULLFRAME_BYTE_VERIFIED");
assert.equal(art.image,row.image);
assert.equal(art.ownerArtworkDecisionNewlyCreated,false);
assert.equal(art.physicalVersionOwnerApprovalPreviouslyRecorded,false);
assert.equal(art.photographCropCertified,false);
assert.equal(art.offlineImageCertified,true);
assert.equal(art.offlineOriginalCertified,false);
assert.match(art.alternativeCaravaggioWorkExcluded,/1606/);
assert.equal(homeArtworkAssetUrl(art.image,{location:{pathname:"/ad-orientem/"}}),
 "/ad-orientem"+art.image);
for(const [date,id,path] of [
 ["2026-04-06","wrong",row.properPath],
 ["2026-04-06",row.principalId,"Tempora/Pasc0-1r"],
 ["2026-04-07",row.principalId,row.properPath],
 ["2026-10-25","sancti:10-DU:1:w","Sancti/10-DU"],
 ["2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0"]
]){
 assert.equal(releasedCaravaggioEmmausClassI2026(date,id,path),null);
 assert.equal(approved2026HomeArtwork(state(date,id,path)),null);
}
assert.equal(approved2026HomeArtwork({...state(),resolving:true}),null);
console.log("PASS full original NG172/1601 Caravaggio, date+Proper, source and derivative hashes, wrong-1606 exclusion, rights caveat, held-art protection");
