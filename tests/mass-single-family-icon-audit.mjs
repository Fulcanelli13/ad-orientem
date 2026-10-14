import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const load=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=load("../data/presentation/mass-single-family-icon-audit-20261014.v1.json");
const manifest=load("../assets/active/mass-v46/manifest.v1.json");
const selections=load("../data/presentation/mass-icon-user-selections-20261010.v1.json");
const matrix=load("../data/mass/gesture-matrix.v1.json");
assert.equal(audit.schema,"ao-mass-single-family-icon-audit-v1");
assert.equal(audit.publication,"REVIEW_ONLY_NO_RUNTIME_CHANGE");
assert.equal(audit.policy.sameFamilyOnly,true);
assert.equal(audit.policy.photographsInMassReader,false);
assert.equal(audit.policy.engravedBookPlatesInMassReader,false);
assert.equal(audit.policy.generateNewIcons,false);
assert.equal(audit.policy.automaticCueActivation,false);
assert.equal(audit.policy.fallback,"SOURCE_BACKED_SHORT_RUBRIC");
assert.equal(manifest.assets.length,67);
const byHash=new Map();
for(const file of manifest.assets){
 const bytes=readFileSync(new URL("../"+file.path,import.meta.url));
 const digest=createHash("sha256").update(bytes).digest("hex");
 const group=byHash.get(digest)??[];
 group.push(file.key+".svg");
 byHash.set(digest,group);
}
const groups=[...byHash.values()].filter(g=>g.length>1)
 .map(g=>g.sort()).sort((a,b)=>a[0].localeCompare(b[0]));
assert.equal(byHash.size,47);
assert.equal(groups.length,14);
assert.deepEqual(groups,audit.duplicateContentGroups);
assert.equal(audit.counts.masterNames,manifest.assets.length);
assert.equal(audit.counts.distinctFileContents,byHash.size);
assert.equal(audit.counts.duplicateContentGroups,groups.length);
assert.equal(selections.selectionCounts.selected,audit.counts.approvedUserPicks);
assert.equal(selections.selectionCounts.investigate,audit.counts.investigate);
const selectedMass=new Set(Object.values(selections.selected)
 .filter(path=>path.startsWith("assets/active/mass-v46/")).map(path=>path.split("/").at(-1)));
assert.equal(selectedMass.size,audit.counts.selectedPicksInMassBank);
for(const r of audit.semanticReviewPairs){
 assert.equal(r.action,"VISUAL_REVIEW_BEFORE_SEMANTIC_PROMOTION");
 assert.ok(r.assets.length===2);
 assert.ok(groups.some(g=>r.assets.every(x=>g.includes(x))),r.assets.join(" <> "));
}
const pending=matrix.items.filter(x=>x.iconStatus==="PENDING_EXACT_MASTER");
assert.equal(pending.length,17);
assert.equal(audit.priestUnresolved.length,7);
assert.equal(audit.faithfulUnresolved.length,10);
assert.deepEqual([...audit.priestUnresolved,...audit.faithfulUnresolved].map(x=>x.matrixId).sort(),pending.map(x=>x.id).sort());
for(const r of [...audit.priestUnresolved,...audit.faithfulUnresolved]){
 const source=pending.find(x=>x.id===r.matrixId);
 assert.equal(r.cueId,source.cueId);
 assert.equal(r.gesture,source.gesture);
}
assert.ok(audit.editorialPriorities.some(x=>x.includes("do not create one drawing per cue")));
console.log("PASS: one-family Mass icon audit, 67 masters / 47 unique files / 14 duplicate groups / 17 pending cues, no asset activation.");
