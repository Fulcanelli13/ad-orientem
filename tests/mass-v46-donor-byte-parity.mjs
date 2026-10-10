// Exact independent comparison against the uploaded v1.80 donor's
// AO_V46_ASSETS object. Donor SHA-256:
// 4e8dc4a0148590aee95d6fd36d8c915a1c1d35097c1d235e96a17791cb7d5543
// The fixed aggregate below is SHA256(sorted key + NUL + full donor data URI + LF).
// It was calculated from the uploaded donor, not from this repository's wrappers.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const manifest=JSON.parse(await readFile(resolve(root,"assets/active/mass-v46/manifest.v1.json"),"utf8"));
const donor=manifest.source;
assert.equal(donor.donorVersion,"v1.80");
assert.equal(donor.bank,"AO_V46_ASSETS");
assert.equal(manifest.status,"EXACT_DONOR_PAYLOAD_WRAPPED");
assert.equal(manifest.count,67);
assert.equal(manifest.assets.length,67);

const seen=new Set(),uris=new Map(),formats={png:0,svg:0};
for(const entry of manifest.assets){
  const key=entry.key,path=entry.path;
  assert.match(key,/^[a-z][a-z0-9_]*$/);
  assert.ok(!seen.has(key),"duplicate master key "+key);
  seen.add(key);
  assert.equal(path,"assets/active/mass-v46/"+key+".svg");
  const svg=await readFile(resolve(root,path),"utf8");
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">/,
    key+": original proportions not preserved");
  const hit=svg.match(/<image href="(data:image\/(?:png|svg\+xml);base64,[A-Za-z0-9+/=]+)" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"\s*\/>/);
  assert.ok(hit,key+": missing/malformed exact donor payload");
  const uri=hit[1],binary=Buffer.from(uri.split(",")[1],"base64");
  assert.ok(binary.length>40,key+": empty illustration");
  if(uri.startsWith("data:image/png;")){
    formats.png++;
    assert.equal(binary.subarray(0,8).toString("hex"),"89504e470d0a1a0a",key+": invalid PNG silhouette");
    assert.ok(binary.readUInt32BE(16)>=24&&binary.readUInt32BE(20)>=24,key+": unexpectedly tiny PNG");
  }else{
    formats.svg++;
    assert.match(binary.toString("utf8"),/<svg[\s>]/,key+": invalid original SVG");
  }
  uris.set(key,uri);
}
const sourceDigest=createHash("sha256");
for(const key of [...uris.keys()].sort())
  sourceDigest.update(key+"\0"+uris.get(key)+"\n","utf8");
assert.equal(sourceDigest.digest("hex"),
  "6d3f1ffceed3a81a3f1392e710c27092ac14035d5a421db27279945c5cf2e301",
  "v4.6 asset silhouettes or payload-to-key identity no longer match the definitive v1.80 donor");
assert.deepEqual(formats,{png:57,svg:10});
assert.equal(new Set(uris.values()).size,47,
  "donor aliases changed: 67 semantic keys are 47 unique source illustrations");
console.log("Mass v4.6 exact donor parity: PASS — 67 original keys, 47 distinct payloads, 57 PNG + 10 SVG, SHA-256 locked.");
