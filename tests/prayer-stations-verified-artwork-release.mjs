import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {renderVerifiedStationArtwork,SAN_POLO_PUBLISHED_STATIONS} from "../src/pray/stations-verified-artwork-release.v1.js";

assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0,"No images are authorised for publication");
for(let i=0;i<14;i++){
 assert.equal(renderVerifiedStationArtwork(i,false),"");
 assert.equal(renderVerifiedStationArtwork(i,true),"");
}
const base={
 station:4,editorialStatus:"USER_APPROVED_CROSS_PRAYER_REUSE",
 exactPaintingIdentityVerified:true,artworkUserPlacementVerified:true,
 nativePhotoVerified:true,photoArchiveHashVerified:true,
 visualFrameCropColourVerified:true,mobileReaderQACompleted:true,
 productionReleaseApproved:true,
 rightsClass:"CC_BY_SA_4_0",exactPhotoLicenseVerified:true,
 explicitScopedPolicyException:false,shareAlikeNoticeIncluded:true,
 productionAssetURL:"/assets/stations/station-04.webp",
 workArtist:"Giandomenico Tiepolo",workTitle:"Jesus meets his Mother",
 photographer:"Didier Descouens / Archaeodontosaurus",
 sourceFilePage:"https://commons.wikimedia.org/wiki/File:Station_IV.jpg",
 photoLicenseURL:"https://creativecommons.org/licenses/by-sa/4.0/",
 photoLicenseLabel:"CC BY-SA 4.0",
 modifications:"JPG resized and converted to WebP"
};
const render=(patch={},index=3)=>renderVerifiedStationArtwork(index,false,{4:{...base,...patch}});
assert.equal(render(),"","A CC BY-SA licence alone MUST NOT silently change strict PD/CC0 policy");
assert.ok(render({explicitScopedPolicyException:true}).includes('data-ao-station-artwork="4"'));
assert.ok(render({explicitScopedPolicyException:true}).includes("Didier Descouens"));
assert.ok(render({explicitScopedPolicyException:true},4)==="","Do not bleed one painting into neighbouring stage");
assert.ok(render({rightsClass:"PD_CC0",photoLicenseLabel:"CC0",photoLicenseURL:"https://creativecommons.org/publicdomain/zero/1.0/"}).includes('data-ao-station-artwork="4"'));
for(const [key,value] of Object.entries({
 editorialStatus:"NEW_CANDIDATE_NOT_USER_APPROVED",
 exactPaintingIdentityVerified:false,artworkUserPlacementVerified:false,
 nativePhotoVerified:false,photoArchiveHashVerified:false,
 visualFrameCropColourVerified:false,mobileReaderQACompleted:false,
 productionReleaseApproved:false,exactPhotoLicenseVerified:false,
 shareAlikeNoticeIncluded:false,productionAssetURL:"/data/prayer/stations/test.webp",
 sourceFilePage:"javascript:alert(1)",photoLicenseURL:"",
 photographer:"",workArtist:"",workTitle:"",modifications:""
})){
 assert.equal(render({...{explicitScopedPolicyException:true},[key]:value}),"",key+" must fail closed");
}
const escaped=render({explicitScopedPolicyException:true,workTitle:'<img onerror="alert(1)">',photographer:'<unsafe>'});
assert.ok(escaped.includes("&lt;img onerror=&quot;alert(1)&quot;&gt;"));
assert.ok(!escaped.includes("<unsafe>"));
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.ok(runtime.includes('import {renderVerifiedStationArtwork} from "./stations-verified-artwork-release.v1.js";'));
const readSection=runtime.slice(runtime.indexOf("function renderStations(){"),runtime.indexOf("// Shared visual structure only."));
assert.ok(readSection.includes('aria-label="${esc(title)}">${renderVerifiedStationArtwork(i,isFr())}${guideNow(title,action'));
assert.ok(readSection.includes("stationResponse(vr)"));
assert.ok(readSection.includes("${stationScripture}${consider}${alph}${ordinary}${stabat}"));
assert.ok(runtime.includes("installSequentialDevotionalReader({"));
assert.ok(runtime.includes("paragraphSelector:'.aoP435930VRLine,.aoP435930StationConsider p"));
const archive=JSON.parse(readFileSync("data/prayer/stations/san-polo-tiepolo-oils-1747/acquisition-results.v1.json","utf8"));
assert.equal(archive.productionImagesEnabled,0);
console.log("PASS · 14/14 Stations invisible unless explicitly approved photo + exact rights + visual/mobile QA; current prayer focus unaffected");
