import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync,statSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditGeneratedMassIconCandidate,auditMassIconGenerationRegistry}
  from "../src/mass/reader-icon-generation-gate.js";
import {R17_FROZEN_ACTIVE_ICON_ASSETS} from "../src/mass/reader-icon-bank.js";
import {R17_REVIEWED_POSTURE_ASSETS} from "../src/mass/reader-reviewed-posture-assets.js";

const registry=JSON.parse(readFileSync(new URL("../data/presentation/mass-icon-generation-provenance-20261019.v1.json",import.meta.url),"utf8"));
const fileSha=path=>existsSync(path)&&statSync(path).isFile()
  ?createHash("sha256").update(readFileSync(path)).digest("hex"):null;
const sourceIntegrity=Object.fromEntries(
 (registry.candidates??[]).flatMap(c=>c.originalPictures??[])
  .filter(x=>x?.imageOriginalPath).map(x=>[x.imageOriginalPath,fileSha(x.imageOriginalPath)])
);
const assetIntegrity=Object.fromEntries(
 (registry.candidates??[]).filter(c=>c?.asset?.path)
  .map(c=>[c.asset.path,fileSha(c.asset.path)])
);
const report=auditMassIconGenerationRegistry(registry,{sourceIntegrity,assetIntegrity});
assert.equal(report.ok,true,report.issues.join("\n"));
assert.equal(report.productionEligible,0,"an unsourced generated icon was unexpectedly approved");
assert.deepEqual(report.blocked,["EA.PRIEST_COMMUNION_HOST","EA.PRIEST_COMMUNION_CHALICE"]);
assert.equal(registry.excludedConcepts.length,2);
for(const c of registry.candidates){
 const r=auditGeneratedMassIconCandidate(c,{registry,sourceIntegrity,assetIntegrity});
 assert.equal(r.ok,false,"source-free image may never enter Mass asset bank");
 assert.ok(r.blockers.includes("NO_ORIGINAL_PICTURE"),"missing actual photo/drawing not blocked: "+c.id);
 assert.ok(r.blockers.includes("APPROVED_FAMILY_HARMONY_NOT_VERIFIED"),"approved visual family not required: "+c.id);
 assert.ok(r.blockers.includes("USER_APPROVAL_MISSING"),"user acceptance not enforced: "+c.id);
 assert.ok(r.blockers.includes("GENERATED_ASSET_NOT_VERIFIED"),"generated asset integrity not enforced: "+c.id);
 assert.deepEqual(c.originalPictures,[],"unsourced proposal silently gained fake provenance");
 assert.equal(c.status,"BLOCKED_SOURCE_IMAGE_REQUIRED");
 assert.equal(c.userApproval,"PENDING");
 assert.equal(c.familyReview,"PENDING");
 assert.equal(c.asset,null);
 assert.match(c.rubricalReference.section,/^X\.[45]$/);
 assert.ok(c.matchApprovedKeys.length>=2);
 for(const key of c.matchApprovedKeys)assert.ok(R17_FROZEN_ACTIVE_ICON_ASSETS[key],
   "unapproved/fictitious bank reference: "+key);
}
for(const x of registry.excludedConcepts){
 assert.equal(x.releaseEligible,false);
 assert.equal(x.state,"UNSOURCED_CONCEPT_ONLY");
 assert.equal(x.sourceOriginal,null);
}
assert.ok(!Object.values(R17_REVIEWED_POSTURE_ASSETS).some(x=>x.includes("/assets/generated/mass-icons/")),
  "unsourced generated image entered active reviewed posture overlay");
assert.ok(!Object.values(R17_FROZEN_ACTIVE_ICON_ASSETS).some(x=>x.includes("/assets/generated/mass-icons/")),
  "generated artwork modified protected v1.80 donor bank");

// A future icon cannot be silently published merely by putting a file in the
// generated-assets directory: register source evidence, check *real file hashes*,
// and obtain a user family verdict first.
const generatedRoot="assets/generated/mass-icons";
if(existsSync(generatedRoot)){
 const walk=path=>readdirSync(path,{withFileTypes:true}).flatMap(e=>
   e.isDirectory()?walk(path+"/"+e.name):[path+"/"+e.name]);
 for(const path of walk(generatedRoot)){
   const canonical=path.replaceAll("\\","/");
   const item=registry.candidates.find(x=>x.asset?.path===canonical);
   assert.ok(item,"unregistered generated Mass icon: "+canonical);
   const result=auditGeneratedMassIconCandidate(item,{registry,sourceIntegrity,assetIntegrity});
   assert.equal(result.ok,true,
     "generated Mass icon is not licensed, source-proven, bank-matched and user-approved: "
     +canonical+" "+result.blockers.join(","));
 }
}

// Structural negative checks: passing an arbitrary URL, generated concept, or
// visual styling language is not equivalent to pictorial provenance.
const candidate=registry.candidates[0];
const fake={...candidate,status:"APPROVED_FOR_PRODUCTION",
  originalPictures:[{kind:"PHOTOGRAPH",sourcePageUrl:"https://example.com/source",
    sourceImageUrl:"https://example.com/image.jpg",depictsExactAction:true}],
  familyReview:{state:"APPROVED"},userApproval:{state:"APPROVED"},
  asset:{path:"assets/generated/mass-icons/unsourced.svg",sha256:"0".repeat(64)}
};
const blocked=auditGeneratedMassIconCandidate(fake,{registry,sourceIntegrity,assetIntegrity}).blockers;
assert.ok(blocked.some(x=>x.includes("NOT_STORED_WITH_PROVENANCE")));
assert.ok(blocked.some(x=>x.includes("RIGHTS_NOT_CLEARED")));
assert.ok(blocked.some(x=>x.includes("SOURCE_FILE_NOT_VERIFIED")));
assert.ok(blocked.includes("APPROVED_FAMILY_HARMONY_NOT_VERIFIED"));
assert.ok(blocked.includes("USER_APPROVAL_MISSING"));
assert.ok(blocked.includes("GENERATED_ASSET_NOT_VERIFIED"));

console.log("Mass icon provenance PASS — all new icons require source original, image rights, 1962 gesture, approved bank family, pixel checks and user's approval; 2 unsourced concepts quarantined.");
