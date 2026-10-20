import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {R17_FINAL_APPROVED_MASS_ASSETS} from "../src/mass/reader-final-approved-assets.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const manifest=read("../data/presentation/mass-final-approved-originals-20261020.v1.json");
const lock=read("../data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const byId=new Map(lock.items.map(a=>[a.id,a]));
const rejected=new Set([...lock.previouslyExcludedExactArtwork,
 ...lock.permanentlyRejectedExactArtwork.map(a=>a.id),
 ...lock.items.filter(a=>a.rejected).map(a=>a.id)]);
assert.equal(lock.items.length,182);
assert.equal(manifest.files.length,68);
assert.equal(manifest.counts.svg,27);
assert.equal(manifest.counts.png,41);
assert.equal(manifest.counts.remoteNotBundled,68);
assert.equal(new Set(manifest.files.map(a=>a.id)).size,68);
assert.equal(Object.keys(R17_FINAL_APPROVED_MASS_ASSETS).length,68);
for(const a of manifest.files){
 assert.ok(!rejected.has(a.id),"Rejected art installed: "+a.id);
 const source=byId.get(a.id);
 assert.ok(source && !source.rejected &&
  ["approved","repurposed"].includes(source.status),"Not approved "+a.id);
 assert.equal(a.name,source.name,"Modified user-given icon name "+a.id);
 assert.equal(a.sourceHash,source.sourceHash,"Original source SHA changed "+a.id);
 assert.ok(a.path.startsWith("assets/active/mass-final/"));
 assert.equal(a.path,"assets/active/mass-final/"+a.id+"."+a.kind);
 const url=new URL("../"+a.path,import.meta.url);
 assert.ok(existsSync(url),"Missing physically shipped original "+a.id);
 const buf=readFileSync(url);
 assert.equal(createHash("sha256").update(buf).digest("hex"),a.sourceHash,
  "Actual source artwork bytes changed for "+a.id);
 if(a.kind==="png")assert.equal(buf.subarray(0,8).toString("hex"),"89504e470d0a1a0a","Not PNG bytes "+a.id);
 if(a.kind==="svg")assert.match(buf.toString("utf8"),/<svg\s/,"Not SVG artwork "+a.id);
 assert.equal(R17_FINAL_APPROVED_MASS_ASSETS["final_"+a.id],url.href,
  "Host resolver cannot display exact approved original "+a.id);
}
console.log("Final approved-original Mass artwork PASS: 68 exact SHA256 matches (27 SVG, 41 PNG), zero changed names or rejected art.");
