import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {auditGestureIconDispositions,NO_AUTO_GESTURE_ICON_PROMOTION} from "../src/mass/reader-icon-disposition-audit.js";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";
import {iconKeysForReaderState,R17_FROZEN_ACTIVE_ICON_KEYS} from "../src/mass/reader-icons.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const dispositions=read("../data/mass/gesture-icon-disposition-20261029.v1.json");
const matrix=read("../data/mass/gesture-matrix.v1.json");
const master=read("../assets/active/mass-v46/manifest.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const crosswalk=read("../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json");
const audit=auditGestureIconDispositions({dispositions,matrix,bank:master});
assert.deepEqual(audit.issues,[],JSON.stringify(audit.issues));
assert.equal(audit.ok,true);
assert.equal(NO_AUTO_GESTURE_ICON_PROMOTION,true);
assert.deepEqual(
 {total:audit.matrixRows,bound:audit.alreadyBound,pending:audit.stillUnbound,
  priest:audit.priestExactArtHolds,faithful:audit.faithfulNoStandaloneIcon,
  candidateCueUses:audit.artworkProposalCueUses,distinctCandidateFiles:audit.distinctUnapprovedCandidateFiles},
 {total:142,bound:125,pending:17,priest:7,faithful:10,candidateCueUses:3,distinctCandidateFiles:2});
assert.equal(audit.productionChangesAuthorized,0);
assert.equal(R17_FROZEN_ACTIVE_ICON_KEYS.length,67);
assert.equal(crosswalk.rows.length,414);
assert.equal(new Set(dispositions.items.map(x=>x.id)).size,17);
const controller=createReaderGestureMatrixController({data:matrix});
const sourceUnits=sung.blocks.flatMap(block=>block.units);
for(const item of dispositions.items){
 const owned=matrix.items.find(x=>x.id===item.id);
 assert.ok(owned,item.id+" disappeared from canonical gesture matrix");
 assert.equal(owned.actor,item.actor);
 assert.equal(owned.iconKey,null);
 assert.equal(owned.iconStatus,"PENDING_EXACT_MASTER");
 assert.ok(sourceUnits.some(x=>x.cue_id===owned.cueId),
   "Missing original source-owned prayer paragraph for "+owned.cueId);
 const projected=controller.project(owned.cueId);
 const original=[...projected.priest,...projected.faithful].find(x=>x.id===item.id);
 assert.ok(original,"Current native reader does not project "+item.id);
 assert.equal(original.iconKey,null,"An unapproved icon was assigned to "+item.id);
 const state=owned.actor==="PRIEST"
  ?{priestAction:{owner:"GESTURE_MATRIX_SOT",label:original.label,iconKey:original.iconKey}}
  :{gesture:{owner:"GESTURE_MATRIX_SOT",label:original.label,iconKey:original.iconKey}};
 const icons=iconKeysForReaderState(state);
 assert.equal(owned.actor==="PRIEST"?icons.priestActionIconKey:icons.gestureIconKey,null,
  "Frozen approved icon bank leaked artwork for "+item.id);
 assert.ok(master.assets.some(x=>x.key===item.comparisonMasterKey),
  "Unknown reviewed fallback "+item.id);
 if(item.reviewCandidate){
  const path=new URL("../"+item.reviewCandidate,import.meta.url);
  assert.ok(existsSync(path),"Proposed candidate art missing "+item.id);
  const svg=readFileSync(path,"utf8");
  assert.match(svg,/^<svg\b/,"Only unapproved pure SVG vectors may be compared");
  assert.doesNotMatch(svg,/<script|<foreignObject|<image|(?:href|xlink:href)=["\x27]https?:\/\//i,
   "Unsafe or externally fetched image candidate "+item.id);
 }
 if(owned.actor==="FAITHFUL"){
  assert.equal(original.runtimeProfile,"CURRENT_GESTURE_PROFILE_RULES");
  assert.equal(item.reviewCandidate,null,"Local custom must not produce an art candidate");
 }
 assert.ok(!crosswalk.rows.some(x=>x.sourceRegistry==="gesture-matrix.v1.json"&&x.assetId),
  "The independent 414 source event crosswalk must not be rewritten from pending matrix records");
}
for(const invalid of [
 (()=>{const x=structuredClone(dispositions);x.items[0].releaseAssetKey="head_bow";return x;})(),
 (()=>{const x=structuredClone(dispositions);x.items[0].disposition="CANDIDATE_SOURCE_REVIEW";return x;})(),
 (()=>{const x=structuredClone(dispositions);x.items[10].actor="PRIEST";return x;})(),
 (()=>{const x=structuredClone(dispositions);x.items.pop();return x;})(),
 (()=>{const x=structuredClone(dispositions);x.items[4].reviewCandidate="../assets/active/mass-v46/stand.svg";return x;})()
]){
 assert.equal(auditGestureIconDispositions({dispositions:invalid,matrix,bank:master}).ok,false,
  "Source/actor/artwork promotion contract failed to close");
}
const sourceIntegrityTampered=structuredClone(matrix);
sourceIntegrityTampered.items.find(x=>x.id==="GM.P.C0117.01").iconKey="priest_centre_arms_rich";
assert.equal(auditGestureIconDispositions({dispositions,matrix:sourceIntegrityTampered,bank:master}).ok,false,
 "An unreviewed icon binding was silently approved");
console.log("PASS 17 exact source gesture dispositions: 7 priest hold, 10 faithful no extra icon, 2 review SVGs for 3 cues; original 142/125/17 and 67/414 source banks unchanged.");
