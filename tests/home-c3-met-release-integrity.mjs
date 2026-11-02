import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const prefix="assets/home/c3-approved-met/";
const manifest=JSON.parse(readFileSync(prefix+"source-manifest.json","utf8"));
assert.equal(manifest.rows.length,2);assert.equal(manifest.humanPhotoApproved,2);
for(const r of manifest.rows){
  assert.equal(r.humanPhotoAndCropApproved,true);assert.equal(r.releasedInApp,true);
  assert.equal(r.status,"USER_APPROVED_RELEASE_CANDIDATE");
  const sha=f=>createHash("sha256").update(readFileSync(f)).digest("hex");
  assert.equal(sha(r.file),r.originalSha256,"Original Met museum master changed: "+r.module);
  assert.equal(sha(r.approvedCropPath),r.framelessCandidateSha256,"User-approved crop changed: "+r.module);
  assert.ok(r.surfaceCrop.length===4&&r.surfaceCrop[2]>r.surfaceCrop[0]&&r.surfaceCrop[3]>r.surfaceCrop[1]);
  assert.ok(r.originalUnmodified&&r.width>=3000&&r.height>=3000);
}
console.log("PASS exact 2 original museum files and approved frame-free crops; 4 SHA-256 checks");
