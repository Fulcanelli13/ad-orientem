import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const j=JSON.parse(read("data/presentation/mass-icon-preliminary-assignment-20261011.v1.json"));
const selections=JSON.parse(read("data/presentation/mass-icon-user-selections-20261010.v1.json"));
const matrix=JSON.parse(read("data/mass/gesture-matrix.v1.json"));
const mass=JSON.parse(read("assets/active/mass-v46/manifest.v1.json"));
const html=read("reviews/mass-complete-icon-assignment-atlas-20261011.html");
const atlas=JSON.parse(html.match(/<script type="application\/json" id="atlas-data">([\s\S]*?)<\/script>/)?.[1]??"null");
const seed=JSON.parse(html.match(/<script type="application\/json" id="atlas-preliminary">([\s\S]*?)<\/script>/)?.[1]??"null");

assert.equal(j.status,"REVIEW_ONLY_NOT_LIVE");
assert.equal(j.schema,"ao-mass-icon-preliminary-assignment-v1");
assert.deepEqual(j.counts,{high:496,provisional:66,missing:2,nonvisual:2,confirmed:42});
assert.equal(Object.keys(j.assignments).length,608);
assert.equal(atlas.targets.length,608);
assert.equal(Object.keys(seed.assignments).length,608);
assert.deepEqual(seed.counts,j.counts);
assert.equal(mass.assets.length,67);
assert.equal(Object.keys(j.assetQuality).length,67);
const q=Object.values(j.assetQuality);
assert.equal(q.filter(v=>v.transport==="VECTOR_IN_SVG").length,10);
assert.equal(q.filter(v=>v.transport==="RASTER_IN_SVG").length,57);
for(const entry of q)if(entry.transport==="RASTER_IN_SVG"){
 assert.ok(entry.pixels?.length===2&&entry.pixels.every(n=>Number.isInteger(n)&&n>200));
}
const avail=new Map(atlas.assets.map(a=>[a.id,a]));
for(const [id,a] of Object.entries(j.assignments)){
 assert.deepEqual(seed.assignments[id],{primary:a.primary,confidence:a.confidence,reason:a.reason,alternates:a.alternates},
   "review page seed diverged: "+id);
 if(a.primary){
  assert.ok(avail.has(a.primary),"unknown source asset "+id);
  assert.ok(avail.get(a.primary).available,"candidate unavailable: "+id);
 }
 assert.ok(["confirmed","high","provisional","missing","nonvisual"].includes(a.confidence));
}
const byPath=new Map(atlas.assets.filter(a=>a.path).map(a=>[a.path,a.id]));
for(const [key,path] of Object.entries(selections.selected)){
 const id="review:"+key;
 assert.equal(j.assignments[id].primary,byPath.get(path),"earlier preference overwritten: "+key);
 assert.equal(j.assignments[id].confidence,"confirmed");
}
for(const key of selections.investigate){
 const a=j.assignments["review:"+key];
 assert.equal(a.confidence,"provisional","an explicit INVESTIGATE was silently approved");
}
assert.equal(selections.selectionCounts.selected,42);
assert.equal(selections.selectionCounts.investigate,10);
const missingMatrix=matrix.items.filter(item=>!item.iconKey);
assert.equal(missingMatrix.length,17);
for(const row of missingMatrix){
 const a=j.assignments[row.id];
 assert.equal(a?.confidence,"provisional",row.id+" silently approved");
 assert.ok(a.primary,row.id+" lacks a reviewable pictorial candidate");
}
const gaps=Object.entries(j.assignments).filter(([,a])=>a.confidence==="missing");
assert.deepEqual(gaps.map(([id])=>id).sort(),[
 "Rubrical events:AO.RUB.C0174.06:33",
 "Rubrical events:AO.RUB.C0248.01:51"
]);
assert.equal(j.assignments["Rubrical events:AO.RUB.C0174.03:30"].primary,"mass:bells");
assert.equal(j.assignments["Rubrical events:AO.RUB.C0181.03:37"].primary,"mass:bells");
assert.equal(j.assignments["Rubrical events:AO.RUB.C0161.02:24"].primary,"mass:bells");
assert.equal(j.assignments["Faithful gestures:AO.SM.C0246:54"].primary,"mass:head_bow");
assert.equal(j.assignments["review:priest:foot"].confidence,"provisional");
assert.equal(j.assignments["review:priest:blessing"].confidence,"provisional");
assert.match(html,/id="atlas-preliminary"/);
assert.match(html,/Uncertain \+ missing only/);
assert.match(html,/const seed=PRELIM.assignments/);
assert.match(html,/function candidateRelevance/);
assert.match(html,/proposedAssignments:seed/);
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
assert.ok(inline,"main review interaction script missing");
new Script(inline,{filename:"mass-complete-icon-assignment-atlas-20261011.html"});
console.log("Mass icon preassignment: PASS —",j.counts,"67 true image formats, 17 pending matrix records, 2 exact gaps");
