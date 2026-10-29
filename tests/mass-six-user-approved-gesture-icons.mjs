import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";
import {USER_APPROVED_MASS_GESTURE_KEYS,USER_APPROVED_MASS_GESTURE_ASSETS,
 userApprovedMassGestureArt,resolveUserApprovedMassGestureArt} from "../src/mass/reader-user-approved-gesture-art.js";
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
for(const id of approved){
 const cue="AO.SM."+id,key=USER_APPROVED_MASS_GESTURE_KEYS[cue];
 assert.equal(key,"ao_1962_priest_"+id.toLowerCase());
 const source=controller.project(cue).primaryPriestAction;
 assert.ok(source&&source.owner==="GESTURE_MATRIX_SOT",id+" no 1962 source action");
 assert.equal(source.sourceGestureId,"GM.P."+id+".01");
 assert.equal(source.iconKey,null,"Frozen 67-master bank was mutated");
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:source,priestAction:source}),key);
 assert.equal(userApprovedMassGestureArt({cueId:"AO.SM.C0169",matrixAction:source,priestAction:source}),null);
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:source,
  priestAction:{...source,cueId:"AO.SM.C0169"}}),null,"Wrong source cue acquired icon");
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:{...source,
  sourceGestureId:"GM.P.C0169.01"},priestAction:source}),null);
 assert.equal(userApprovedMassGestureArt({cueId:cue,matrixAction:{...source,
  actor:"FAITHFUL",authorityClass:"FAITHFUL_CUE_SOT"},priestAction:source}),null);
 const asset=USER_APPROVED_MASS_GESTURE_ASSETS[key];
 assert.ok(asset.endsWith("/assets/extensions/mass-user-gesture-20261029/"+id+".svg"));
 assert.equal(resolveUserApprovedMassGestureArt(key,()=>null),asset);
 const svg=readFileSync(new URL("../assets/extensions/mass-user-gesture-20261029/"+id+".svg",import.meta.url));
 const review=readFileSync(new URL("../assets/review/mass-adaptive-gesture-20261029/"+id+".svg",import.meta.url));
 const digest=createHash("sha256").update(svg).digest("hex");
 assert.equal(digest,votes.items.find(x=>x.cueId===id).submittedSvgSha256,id+" source-art digest mismatch");
 assert.deepEqual(svg,review,"Released icon differs from the user-approved original");
 assert.match(svg.toString("utf8"),/fill="currentColor"/);
 assert.doesNotMatch(svg.toString("utf8"),/<(?:script|image|foreignObject)\b/i);
}
assert.equal(resolveUserApprovedMassGestureArt("ao_1962_priest_c0169",()=>null),null);
assert.equal(resolveUserApprovedMassGestureArt("stand",key=>"FROZEN_"+key),"FROZEN_stand");
assert.equal(matrix.items.length,142);
assert.equal(matrix.items.filter(x=>x.iconKey).length,125);
assert.equal(bank.assets.length,67);
console.log("PASS six distinct user-approved source-cue action SVGs activated as separate adaptive extension; C0169 rejected, no frozen-bank or card/source mutation.");
