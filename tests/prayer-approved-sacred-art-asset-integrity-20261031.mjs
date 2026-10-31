import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const manifest=JSON.parse(readFileSync("assets/prayer/user-approved/source-provenance.v1.json","utf8"));
assert.equal(manifest.images.length,2);
for(const item of manifest.images){
 const bytes=readFileSync(item.localAssetPath);
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),item.webpSHA256);
 assert.equal(item.noRauthPhotoPermissionInferred,true);
}
const a=await import("../src/pray/benediction-mystic-lamb-user-art.v1.js");
assert.match(a.renderSelectedBenedictionArtwork("adoration"),/mystic-lamb.webp/);
assert.equal(a.renderSelectedBenedictionArtwork("blessing"),"");
const b=await import("../src/pray/st-therese-selected-novena-cover.v1.js");
assert.match(b.selectedThereseNovenaCover("st_therese"),/therese-lisieux-historical-portrait.webp/);
assert.equal(b.selectedThereseNovenaCover("immaculate_conception"),"");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.ok(runtime.includes("renderSelectedBenedictionArtwork(id,isFr())"));
const novena=readFileSync("src/pray/novena-runtime.js","utf8");
assert.ok(novena.includes("selectedThereseNovenaCover(n.id,isFr())"));
assert.equal((novena.match(/selectedThereseNovenaCover\(n.id,isFr\(\)\)/g)||[]).length,1);
console.log("PASS both user-approved photo assets, exact source checksums, scoped Benediction and St Therese entry display");
