import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const research=read("../data/presentation/mass-priest-gesture-original-source-p4.v1.json");
const proof=read("../data/presentation/mass-icon-source-p4-plate19-integrity.json");
const matrix=read("../data/mass/gesture-matrix.v1.json");
const disp=read("../data/mass/gesture-icon-disposition-20261029.v1.json");
const museum=read("../data/presentation/mass-icon-originals-leclerc1661.p3.json");
const ledger=read("../assets/active/mass-v46/manifest.v1.json");
assert.equal(research.schema,"ao-mass-priest-gesture-original-source-p4-v1");
assert.equal(research.releaseClass,"RESEARCH_ONLY_NO_ICON_OR_RUBRIC_PROMOTION");
assert.equal(research.policy.zeroCostOnly,true);
assert.equal(research.policy.noArtInstalled,true);
assert.equal(research.targets.length,3);
assert.deepEqual(research.targets.map(x=>x.cueId).sort(),["AO.SM.C0117","AO.SM.C0161","AO.SM.C0263"]);
assert.deepEqual(research.targets.map(x=>x.status),[
 "AWAITING_BYTES_AND_EXACT_1962_POSE_COMPARISON",
 "REQUIRES_RIGHTS_CLEARED_EXACT_VISUAL_REFERENCE",
 "REQUIRES_RIGHTS_CLEARED_EXACT_VISUAL_REFERENCE"]);
const witness=research.original;
assert.equal(witness.id,"LECLERC1661_PLATE19");
assert.equal(witness.objectId,"RP-P-OB-69.169");
assert.equal(witness.license,"CC0_1_0");
assert.equal(witness.museumRights,"PUBLIC_DOMAIN");
assert.equal(witness.exactLiturgicalGestureVerified,false);
assert.equal(witness.palmGeometryInspected,false);
assert.equal(witness.userArtworkApproval,"PENDING");
assert.equal(witness.iconReleaseEligible,false);
assert.equal(proof.schema,"ao-mass-gesture-plate19-original-integrity-v1");
assert.equal(proof.status,"CC0_ORIGINAL_BYTES_VERIFIED_RESEARCH_ONLY");
assert.equal(proof.sourceId,witness.id);
assert.equal(proof.license,witness.license);
assert.equal(proof.imagePath,witness.filePath);
assert.equal(proof.sourcePageUrl,witness.sourcePageUrl);
assert.equal(proof.sourceImageUrl,witness.sourceImageUrl);
assert.equal(proof.licenseEvidenceUrl,witness.licenseEvidenceUrl);
assert.equal(proof.imageVisuallyInspectedForExact1962Pose,false);
assert.equal(proof.independent1962RubricMatch,false);
assert.equal(proof.iconApproved,false);
assert.equal(proof.assetPromoted,false);
assert.match(proof.sha1,/^[a-f0-9]{40}$/);
assert.match(proof.sha256,/^[a-f0-9]{64}$/);
const file=resolve(new URL("../",import.meta.url).pathname,witness.filePath);
assert.ok(existsSync(file),"Rights-cleared original missing from permanent source archive");
const bytes=readFileSync(file);
assert.equal(bytes.length,171095);
assert.equal(createHash("sha1").update(bytes).digest("hex"),witness.expectedSHA1);
assert.equal(createHash("sha1").update(bytes).digest("hex"),proof.sha1);
assert.equal(createHash("sha256").update(bytes).digest("hex"),proof.sha256);
assert.deepEqual([proof.width,proof.height],[649,1050]);
assert.equal(museum.plates.find(x=>x.plate===19).id,witness.objectId,
 "Source may not be misattributed to another numbered Leclerc plate");
assert.equal(museum.plates.find(x=>x.plate===19).matches1962Rubrics,null,
 "Historical source alone may not certify 1962 rubrics");
assert.equal(matrix.items.length,142);
assert.equal(matrix.items.filter(x=>x.iconKey).length,125);
assert.equal(matrix.items.filter(x=>!x.iconKey).length,17);
assert.equal(ledger.assets.length,67);
for(const cue of research.targets){
 const primary=matrix.items.find(x=>x.cueId===cue.cueId&&x.actor==="PRIEST"&&x.displayPrimary);
 assert.ok(primary,"Original cue changed: "+cue.cueId);
 assert.equal(primary.iconKey,null,"Historical scan was incorrectly promoted to action artwork");
 assert.equal(disp.items.find(x=>x.id===primary.id).disposition,"REDESIGN_REQUIRED",
 "Old unapproved SVG no longer blocked at "+cue.cueId);
}
const review=readFileSync(new URL("../reviews/mass-priest-gesture-source-plate19-p4.html",import.meta.url),"utf8");
assert.ok(review.includes("Leclerc_1661_RP-P-OB-69.169_CC0.jpg"));
assert.ok(review.includes("actual 1962 palms cannot be established"));
assert.ok(review.includes("32px")&&review.includes("48px"));
assert.ok(review.includes("not approved"));
console.log("PASS P4 immutable CC0 original in Git: verified SHA1/SHA256 and 649x1050, 3 source cues held; no production art assigned.");
