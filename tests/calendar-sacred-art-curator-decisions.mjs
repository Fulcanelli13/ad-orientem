#!/usr/bin/env node
// Fail-closed regression for editorial selections received from the user.
// Never infer production image approval, global rejection or 1962-day identity.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const d=read("data/calendar/sacred-art-curator-decisions-20261011.v1.json");
const registry=read("data/calendar/sacred-art-candidates.v1.json");
const targets=[...read("data/calendar/sacred-art-subject-targets.v2.json").targets,
 ...read("data/learn/sacred-art-formation-targets.v1.json").targets];
const byArtwork=new Map(registry.artworks.map(a=>[a.id,a]));
const byTarget=new Map(targets.map(t=>[t.id,t]));
assert.equal(d.schema,"AO_SACRED_ART_CURATOR_RECONCILIATION_V1");
assert.equal(d.sourceExportSchema,"AO_SACRED_ART_CURATOR_REVIEW_V2");
assert.match(d.sourceOriginalFileSha256,/^[a-f0-9]{64}$/);
assert.equal(d.baselineUniqueSHA,264);
assert.equal(d.selections.length,44);
assert.equal(d.approvals.length,35);
assert.equal(d.refusals.length,30);
assert.deepEqual(d.exceptions,[]);
const selections=new Set();
const refusalPairs=new Set();
const approved=new Set();
for(const row of [...d.approvals,...d.selections,...d.refusals]){
 const a=byArtwork.get(row.artworkId);
 assert.ok(a,"Unknown source artwork: "+row.artworkId);
 assert.equal(row.originalSha256,a.acquisition?.originalSha256,"SHA mismatch: "+row.artworkId);
 assert.ok(a.acquisition?.archiveOriginal,"No acquired source original for: "+row.artworkId);
 if(row.sourceRights) assert.equal(row.sourceRights,a.source.rights);
 if(row.targetId)assert.ok(byTarget.has(row.targetId),"Unknown subject: "+row.targetId);
}
for(const a of d.approvals){
 assert.ok(!approved.has(a.artworkId));
 approved.add(a.artworkId);
 assert.equal(a.status,"EDITORIALLY_APPROVED_ONLY");
}
for(const row of d.selections){
 assert.ok(!selections.has(row.targetId),"Repeated editorial target: "+row.targetId);
 selections.add(row.targetId);
 assert.ok(approved.has(row.artworkId),"Selected original not editorially approved: "+row.artworkId);
 assert.equal(row.status,"SELECTED_FOR_SUBJECT_EDITORIALLY_ONLY");
}
for(const row of d.refusals){
 const key=row.targetId+"|"+row.artworkId;
 assert.ok(!refusalPairs.has(key),"Duplicated subject-specific refusal");
 refusalPairs.add(key);
 assert.equal(row.kind,"NOT_SUITABLE_FOR_SUBJECT");
 assert.ok(!d.selections.some(s=>s.targetId===row.targetId&&s.artworkId===row.artworkId),
  "Rejected and accepted in SAME subject: "+key);
}
assert.equal(new Set([...d.selections,...d.refusals].map(x=>x.targetId)).size,47);
assert.equal(d.refusals.filter(r=>r.targetId==="devotion.adoration").length,13);
assert.equal(d.refusals.filter(r=>r.targetId==="devotion.st-joseph").length,16);
assert.equal(d.refusals.filter(r=>r.targetId==="scripture.healing-paralytic").length,1);
// The same original is explicitly accepted for one use yet refused for another.
for(const [accepted,declined,id] of [
 ["calendar.holy-thursday","devotion.adoration","met-459131"],
 ["calendar.saint-joseph","devotion.st-joseph","cma-160143"]
]){
 assert.ok(d.selections.some(s=>s.targetId===accepted&&s.artworkId===id));
 assert.ok(d.refusals.some(s=>s.targetId===declined&&s.artworkId===id));
}
const rightsHeld=d.selections.filter(x=>x.sourceRights!=="CC0");
assert.ok(rightsHeld.length>=4);
assert.equal(d.approvalBoundary.publishedAssets,0);
assert.equal(d.approvalBoundary.globalRejectedImages,0);
assert.equal(d.approvalBoundary.rightsClearedByReview,false);
assert.equal(d.approvalBoundary.calendarDayCertifiedByReview,false);
console.log("PASS sacred-art user decisions: 44 subject selections, 35 originals, 30 scoped refusals; no global or legal promotion");
