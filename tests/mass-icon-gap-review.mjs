import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {reviewCampionGestureIconGaps} from "../src/mass/reader-icon-gap-audit.js";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";
import {iconKeysForReaderState,R17_FROZEN_ACTIVE_ICON_KEYS} from "../src/mass/reader-icons.js";
import {R17_FROZEN_ACTIVE_ICON_ASSETS} from "../src/mass/reader-icon-bank.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const matrix=read("../data/mass/gesture-matrix.v1.json");
const positions=read("../data/presentation/reader-priest-positions.v1.json");
const bank=read("../assets/active/mass-v46/manifest.v1.json");
const audit=reviewCampionGestureIconGaps({
 matrix,positionRegistry:positions,masterManifest:bank,
});
assert.equal(audit.matrixRows,142);
assert.equal(audit.priestRows,83);
assert.equal(audit.faithfulRows,59);
assert.equal(audit.approvedMatrixBindings,125);
assert.equal(audit.pendingMatrixBindings,17);
assert.equal(audit.activeBankMasters,67);
assert.equal(audit.stationCueTransitions,49);
assert.equal(audit.stationVariantsToReview,3);
assert.equal(audit.remainingLiveAmbiguity,20);
assert.equal(audit.matrixReviewRows.length,17);
assert.equal(new Set(audit.matrixReviewRows.map(x=>x.cueId)).size,17);
assert.equal(audit.activationPolicy,"USER_REVIEW_AND_SOURCE_VERIFICATION_REQUIRED");
assert.ok(audit.matrixReviewRows.every(x=>x.status==="REVIEW_REQUIRED"&&x.runtimeBinding===null));
assert.ok(audit.positionReviewRows.every(x=>x.status==="REVIEW_REQUIRED"&&x.runtimeBinding===null));
assert.equal(audit.positionReviewRows.filter(x=>x.station.startsWith("ALTAR_EPISTLE")).length,2);
assert.equal(audit.positionReviewRows.filter(x=>x.station==="ALTAR_GOSPEL_MISSAL").length,1);
const controller=createReaderGestureMatrixController({data:matrix});
assert.equal(controller.supported,true);
assert.equal(controller.audit.campionBackedCount,100);
for(const row of audit.matrixReviewRows){
 const projection=controller.project(row.cueId);
 const actual=[...projection.priest,...projection.faithful].find(x=>x.id===row.id);
 assert.ok(actual,"Source cue not found "+row.id);
 assert.equal(actual.iconKey,null);
 const state=row.actor==="PRIEST"
  ?{priestAction:{owner:"GESTURE_MATRIX_SOT",label:actual.label,iconKey:actual.iconKey}}
  :{gesture:{owner:"GESTURE_MATRIX_SOT",label:actual.label,iconKey:actual.iconKey}};
 const icons=iconKeysForReaderState(state);
 assert.equal(row.actor==="PRIEST"?icons.priestActionIconKey:icons.gestureIconKey,null,
  "Unapproved Campion/1962 icon was silently activated "+row.id);
}
const extensionDir=new URL("../assets/review/mass-icon-candidates/",import.meta.url);
for(const name of [
 "priest-epistle-side.svg","priest-gospel-side.svg",
 "priest-eyes-hands-raised.svg","priest-hands-over-oblations.svg",
]){
 const file=new URL(name,extensionDir);
 assert.ok(existsSync(file),"Source art candidate missing "+name);
 const xml=readFileSync(file,"utf8");
 assert.match(xml,/^<svg[^>]+viewBox="0 0 64 64"/);
 assert.match(xml,/stroke="currentColor"/);
 assert.doesNotMatch(xml,/<image|<foreignObject|<script|(?:href|xlink:href)=["\x27]https?:\/\//i,
  "Review icon must be pure, themable, offline vector artwork");
}
assert.equal(Object.keys(R17_FROZEN_ACTIVE_ICON_ASSETS).length,67,
 "Review proposals were merged into the frozen production icon bank");
assert.equal(R17_FROZEN_ACTIVE_ICON_KEYS.length,67);
assert.deepEqual(Object.keys(R17_FROZEN_ACTIVE_ICON_ASSETS).sort(),
 [...bank.assets.map(x=>x.key)].sort(),"The 67 v4.6 original masters were modified");
const html=readFileSync(new URL("../reviews/mass-campion-icon-review-20261010.html",import.meta.url),"utf8");
assert.match(html,/schema:"ao-mass-campion-icon-decisions-20261010"/);
assert.match(html,/Export decisions as JSON/);
assert.match(html,/No exact master/);
assert.match(html,/GM\.P\.C0204\.01/);
assert.match(html,/POS\.GOSPEL_MISSAL/);
for(const row of audit.matrixReviewRows)assert.ok(html.includes(row.id),"Missing icon-review row "+row.id);
for(const row of audit.positionReviewRows)assert.ok(html.includes(row.id),"Missing station-review row "+row.id);
console.log("Campion/icon audit: PASS — 142 gestures (125 approved,17 exact art pending), 49 position transitions (3 station identities pending), all review-only art never activates in R17.");
