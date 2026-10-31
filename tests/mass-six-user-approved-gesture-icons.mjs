import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";
import {USER_APPROVED_MASS_GESTURE_KEYS,USER_APPROVED_MASS_GESTURE_ASSETS,
 USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS,
 userApprovedMassGestureArt,resolveUserApprovedMassGestureArt} from "../src/mass/reader-user-approved-gesture-art.js";
import {iconKeysForReaderState} from "../src/mass/reader-icons.js";
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const votes=json("../data/mass/gesture-icon-user-review-20261029.v1.json");
const matrix=json("../data/mass/gesture-matrix.v1.json");
const bank=json("../assets/active/mass-v46/manifest.v1.json");
const controller=createReaderGestureMatrixController({data:matrix});
const approved=["C0117","C0155","C0161","C0193","C0204","C0263"];
assert.equal(Object.keys(USER_APPROVED_MASS_GESTURE_KEYS).length,6);
assert.equal(Object.keys(USER_APPROVED_MASS_GESTURE_ASSETS).length,6);
assert.deepEqual(votes.items.filter(x=>x.decision==="APPROVE").map(x=>x.cueId),approved);
assert.equal(votes.items.find(x=>x.cueId==="C0169").decision,"REJECT");
assert.equal(USER_APPROVED_MASS_GESTURE_KEYS["AO.SM.C0169"],undefined);
assert.deepEqual(Object.keys(USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS).sort(),
 ["AO.SM.C0193","AO.SM.C0204"]);
assert.equal(votes.items.find(x=>x.cueId==="C0193").ceremonialStatus,
 USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS["AO.SM.C0193"]);
assert.equal(votes.items.find(x=>x.cueId==="C0204").ceremonialStatus,
 USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS["AO.SM.C0204"]);
for(const id of approved){
 const cue="AO.SM."+id,key=USER_APPROVED_MASS_GESTURE_KEYS[cue];
 assert.equal(key,"ao_1962_priest_"+id.toLowerCase());
 const source=controller.project(cue).primaryPriestAction;
 assert.ok(source&&source.owner==="GESTURE_MATRIX_SOT",id+" no 1962 source action");
 assert.equal(source.sourceGestureId,"GM.P."+id+".01");
 assert.equal(source.iconKey,null,"Frozen 67-master bank was mutated");
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:source,priestAction:source}),
  USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS[cue]?null:key,
  id+" incorrect or uncertified concept was exposed before ceremonial clearance");
 assert.equal(userApprovedMassGestureArt({cueId:"AO.SM.C0169",matrixAction:source,priestAction:source}),null);
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:source,
  priestAction:{...source,cueId:"AO.SM.C0169"}}),null,"Wrong source cue acquired icon");
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:{...source,
  sourceGestureId:"GM.P.C0169.01"},priestAction:source}),null);
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:{...source,
  actor:"FAITHFUL",authorityClass:"FAITHFUL_CUE_SOT"},priestAction:source}),null);
 const asset=USER_APPROVED_MASS_GESTURE_ASSETS[key];
 assert.ok(asset.endsWith("/assets/extensions/mass-user-gesture-20261029/"+id+".svg"));
 assert.equal(resolveUserApprovedMassGestureArt(key,()=>null),
  USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS[cue]?null:asset);
 if(USER_APPROVED_MASS_GESTURE_VISUAL_HOLDS[cue])
  assert.equal(resolveUserApprovedMassGestureArt(key,()=> "UNSAFE_FALLBACK"),null,
   "Old cached key bypassed the accuracy hold: "+cue);
 const svg=readFileSync(new URL("../assets/extensions/mass-user-gesture-20261029/"+id+".svg",import.meta.url));
 const review=readFileSync(new URL("../assets/review/mass-adaptive-gesture-20261029/"+id+".svg",import.meta.url));
 const digest=createHash("sha256").update(svg).digest("hex");
 assert.equal(digest,votes.items.find(x=>x.cueId===id).submittedSvgSha256,id+" source-art digest mismatch");
 assert.deepEqual(svg,review,"Released icon differs from the user-approved original");
 assert.match(svg.toString("utf8"),/fill="currentColor"/);
 assert.doesNotMatch(svg.toString("utf8"),/<(?:script|image|foreignObject)\b/i);
}
assert.equal(resolveUserApprovedMassGestureArt("ao_1962_priest_c0169",()=>null),null);
assert.equal(resolveUserApprovedMassGestureArt("ao_1962_priest_c0169",()=> "UNSAFE_FALLBACK"),null);
assert.equal(resolveUserApprovedMassGestureArt("stand",key=>"FROZEN_"+key),"FROZEN_stand");
assert.equal(matrix.items.length,142);
assert.equal(matrix.items.filter(x=>x.iconKey).length,125);
assert.equal(bank.assets.length,67);
// Three different priest actions still need *exact* art, not donor substitutes.
// In particular, indulgentiam != final blessing, and Ecce Agnus Dei !=
// the major elevation at Consecration. Existing source rubrics must remain.
for(const [cueId,label] of [
 ["AO.SM.C0169","RAISES EYES"],
 ["AO.SM.C0242","SHOWS SACRED HOST"],
 ["AO.SM.C0265","BLESSES PEOPLE"]
]){
 const projected=iconKeysForReaderState({form:"MISSA_CANTATA_SIMPLE",cueId,
  curated65FinalArt:true,priestAction:{cueId,label}});
 assert.equal(projected.priestActionIconKey,null,
   cueId+" accidentally borrowed inaccurate approved artwork");
}
// Unlike the rejected older foot illustrations, ref_112206 is the later
// explicitly approved 21 Oct original. Retain the historical decision.
assert.equal(iconKeysForReaderState({cueId:"AO.SM.C0001",curated65FinalArt:true,
 priestPosition:{station:"FOOT_CENTER"}}).priestPositionIconKey,
 "canon:priest.position.foot");
// Each of the five art-correction briefs is a source-locked, review-only
// description. A written brief is NEVER authorization to activate an SVG.
const artBriefs=json("../data/mass/gesture-art-review-five-source-specs-20261031.v1.json");
assert.equal(artBriefs.schema,"ao-mass-five-priest-gesture-art-review-v1");
assert.equal(artBriefs.status,"SOURCE_GROUNDED_DRAWING_BRIEFS_ONLY_NOT_PRODUCTION_ART");
assert.equal(artBriefs.counts.drawingBriefs,5);
assert.equal(artBriefs.counts.newArtworkApproved,0);
assert.equal(artBriefs.counts.productionBindingsAdded,0);
assert.equal(artBriefs.illustrationContract.forbidExistingArtifactSubstitution,true);
assert.equal(artBriefs.illustrationContract.missalRedRubricsPreserved,true);
assert.deepEqual(artBriefs.briefs.map(x=>x.cueId),[
 "AO.SM.C0169","AO.SM.C0193","AO.SM.C0204","AO.SM.C0242","AO.SM.C0265"]);
assert.ok(artBriefs.sourceReferences.some(x=>x.id==="MR62_RITUS"&&
 x.role==="primary-normative"&&x.url.startsWith("https://")));
const approveByCue=new Map(votes.items.map(x=>["AO.SM."+x.cueId,x.decision]));
for(const brief of artBriefs.briefs){
 assert.ok(/^AO\\.SM\\.C\\d{4}$/.test(brief.cueId),brief.cueId);
 assert.ok(brief.section.startsWith("Ritus servandus "),brief.cueId);
 assert.ok(brief.requiredPose.length>=4&&brief.forbidden.length>=3,
  "Artwork needs positive and negative rubrical geometry: "+brief.cueId);
 assert.equal(brief.researchOnly,true);
 assert.equal(brief.userApprovedNewArt,false);
 if(["AO.SM.C0193","AO.SM.C0204"].includes(brief.cueId))
  assert.equal(approveByCue.get(brief.cueId),"APPROVE",
   "Historical concept approval was lost");
 if(brief.cueId==="AO.SM.C0169")
  assert.equal(approveByCue.get(brief.cueId),"REJECT",
   "Rejected October 29 original gained a silent new approval");
}
assert.match(artBriefs.briefs[4].requiredLiturgicalGate,/Requiescant in pace/);
console.log("PASS six exact user-approved concepts retained, four LIVE-enabled and two accuracy-held; C0169 rejected, frozen bank/ceremonial source unchanged.");
