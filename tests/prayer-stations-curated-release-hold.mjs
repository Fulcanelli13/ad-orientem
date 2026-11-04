// San Polo source archive is present in Git, not in the public Pages artifact.
// This test executes after the curated dist/web-preview release has been built.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {SAN_POLO_PUBLISHED_STATIONS,renderVerifiedStationArtwork} from "../src/pray/stations-verified-artwork-release.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const path=x=>join(root,x);
const dist=path("dist/web-preview");
const archive="data/prayer/stations/san-polo-tiepolo-oils-1747";
const staged="assets/stations/san-polo";
const candidate=JSON.parse(readFileSync(path(archive+"/cc-by-sa-complete-series-release-candidate.v1.json"),"utf8"));
const hash=data=>createHash("sha256").update(data).digest("hex");

assert.equal(candidate.assetCount,14);
assert.equal(candidate.entries.length,14);
assert.equal(candidate.licensing.scopedExceptionAuthorized,true,
 "Owner's 14-photograph-only CC BY-SA exception must be preserved");
assert.equal(candidate.licensing.exceptionNotGeneralized,true);
assert.equal(candidate.runtimeImageCount,0,"No photo is active in the Stations reader");
assert.equal(candidate.mobileQA,"UNVERIFIED","Visual/mobile release is not certified");
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0,"Publication bindings must remain empty");

for(let i=0;i<14;i++){
 const row=candidate.entries[i];
 assert.equal(row.station,i+1);
 assert.equal(row.productionPolicyExceptionAuthorized,true);
 assert.equal(row.productionEnabled,false);
 assert.equal(renderVerifiedStationArtwork(i,false),"");
 assert.equal(renderVerifiedStationArtwork(i,true),"");
 const image=staged+"/station-"+String(i+1).padStart(2,"0")+".webp";
 assert.equal(row.localPublicAsset,"/"+image);
 const a=readFileSync(path(image));
 const b=readFileSync(path(row.repositoryOriginal));
 assert.ok(a.length>1000,"Missing source image "+image);
 assert.equal(hash(a),row.sha256,"Staged photograph bytes drifted: "+image);
 assert.equal(hash(b),row.sha256,"Permanent research original bytes drifted: "+row.repositoryOriginal);
}
assert.ok(existsSync(path(staged+"/LICENSE-ATTRIBUTION.md")),"Photographer licence evidence must remain in Git");
assert.ok(existsSync(path(archive+"/manifest.v1.json")),"Source manifest must remain in Git");
assert.ok(existsSync(join(dist,"index.html")),"Run the curated Pages build before this test");
assert.ok(existsSync(join(dist,"src/pray/stations-verified-artwork-release.v1.js")),
 "The normal gated Stations reader must remain present in the public app");

for(const withheld of [staged,archive]){
 assert.ok(!existsSync(join(dist,withheld)),
  "Unreleased artwork or research records leaked into the public Pages artifact: "+withheld);
}
console.log("PASS San Polo release hold: 14 source-exact archived WebPs, 0 reader images activated, "+
 "14/14 assets and all original research records excluded from GitHub Pages");
