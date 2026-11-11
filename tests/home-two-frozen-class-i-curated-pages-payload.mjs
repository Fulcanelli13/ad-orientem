// Run after the curated GitHub Pages build. The 26 MB KMSKA source master
// and internal source/byte ledgers must never be published as app assets.
import assert from "node:assert/strict";
import {existsSync,statSync,readFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dist=join(root,"dist","web-preview");
assert.ok(existsSync(join(dist,"index.html")),"Static Pages build not present");
for(const [name,max] of [
 ["assets/home/class-i-2026/lanfranco-ngi72-miracle-original.jpg",1000000],
 ["assets/home/class-i-2026/van-dyck-kmska297-lance-thrust-2400.webp",1500000]
]){
 const file=join(dist,name);
 assert.ok(existsSync(file),"Approved Home photograph missing from Pages: "+name);
 assert.ok(statSync(file).size>100000&&statSync(file).size<max,
  "Original or bloated image leaked: "+name);
}
for(const held of [
 "data/artwork/releases/source-masters",
 "data/artwork/releases/source-masters/van-dyck-kmska297-lance-thrust-original.jpg",
 "data/artwork/releases/2026-03-15-07-01-two-frozen-class-i-source-manifest.v1.json",
 "data/artwork/releases/2026-03-15-07-01-two-class-i-photo-byte-proof.v1.json"
]){
 assert.equal(existsSync(join(dist,held)),false,
  "Research source/proof unexpectedly exposed on public GitHub Pages: "+held);
}
assert.ok(existsSync(join(root,
 "data/artwork/releases/source-masters/van-dyck-kmska297-lance-thrust-original.jpg")),
 "The full 4498x6095 original must remain in Git source evidence");
assert.ok(existsSync(join(dist,"src/home/released-class-i-two-frozen-photos-2026.js")),
 "The public Home binding must be present");
const asset=readFileSync(join(dist,"assets/home/class-i-2026/van-dyck-kmska297-lance-thrust-2400.webp"));
assert.equal(asset.toString("ascii",0,4),"RIFF");
assert.equal(asset.toString("ascii",8,12),"WEBP");
console.log("PASS curated Pages contains original Lanfranco and compact Van Dyck photos, never the 26 MB source master or release research ledgers");
