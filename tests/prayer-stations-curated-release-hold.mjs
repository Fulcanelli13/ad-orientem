// Only fourteen narrowly licensed San Polo photos are released for explicit opt-in.
// The original research archive stays in Git and is not exposed to Pages.
// This test executes after the curated dist/web-preview release has been built.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {SAN_POLO_PUBLISHED_STATIONS,renderVerifiedStationArtwork} from "../src/pray/stations-verified-artwork-release.v1.js";
import {SAN_POLO_OPTIONAL_CYCLE,SAN_POLO_OPTIONAL_CYCLE_META} from "../src/pray/stations-san-polo-optional-cycle.v1.js";

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
assert.equal(candidate.runtimeImageCount,0,"Historical staging register must not be silently rewritten");
assert.equal(SAN_POLO_OPTIONAL_CYCLE_META.defaultEnabled,false);
assert.equal(SAN_POLO_OPTIONAL_CYCLE_META.previousIndividualArtworkRetained,true);
assert.equal(SAN_POLO_OPTIONAL_CYCLE_META.license,"CC BY-SA 4.0");
assert.equal(Object.keys(SAN_POLO_OPTIONAL_CYCLE).length,14);
assert.equal(candidate.mobileQA,"UNVERIFIED","The immutable historical candidate remains a research snapshot");
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0,"Publication bindings must remain empty");

for(let i=0;i<14;i++){
 const row=candidate.entries[i];
 assert.equal(row.station,i+1);
 assert.equal(row.productionPolicyExceptionAuthorized,true);
 assert.equal(row.productionEnabled,false);
 assert.equal(renderVerifiedStationArtwork(i,false),"");
 assert.equal(renderVerifiedStationArtwork(i,true),"");
 const approved=SAN_POLO_OPTIONAL_CYCLE[i+1];
 assert.equal(approved.station,i+1);
 assert.equal(approved.expectedSHA256,row.sha256);
 assert.equal(approved.sourceFilePage,row.sourceFilePage);
 assert.equal(approved.rightsClass,"CC_BY_SA_4_0");
 assert.equal(approved.explicitScopedPolicyException,true);
 assert.equal(approved.previousIndividualArtworkPreserved,true);
 assert.match(renderVerifiedStationArtwork(i,false,SAN_POLO_OPTIONAL_CYCLE),/data-ao-station-artwork/);
 assert.match(renderVerifiedStationArtwork(i,false,SAN_POLO_OPTIONAL_CYCLE),/src="\.\/assets\/stations\/san-polo/);
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

for(let i=0;i<14;i++){
 const relative="assets/stations/san-polo/station-"+String(i+1).padStart(2,"0")+".webp";
 assert.ok(existsSync(join(dist,relative)),"Released optional photograph absent: "+relative);
 assert.equal(hash(readFileSync(join(dist,relative))),candidate.entries[i].sha256,
  "Curated release photo bytes must equal licensed exact source: "+relative);
}
assert.ok(existsSync(join(dist,"assets/stations/san-polo/LICENSE-ATTRIBUTION.md")),
 "Photo licence/attribution record must accompany adapted photos");
assert.ok(existsSync(join(dist,"src/pray/stations-san-polo-optional-cycle.v1.js")),
 "The optional-cycle source module must be in the curated reader bundle");
assert.ok(!existsSync(join(dist,archive)),
 "Historical research evidence must remain out of the public Pages build");
console.log("PASS San Polo optional cycle release: 14 exact credited derivatives in static Pages, 0 default artwork displacements, original research archive held");
